package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/crea8r/muninn/server/pkg/api/middleware"
	"github.com/crea8r/muninn/server/pkg/database"
	"github.com/google/uuid"
)

type SummarizeHandler struct {
	db *database.Queries
}

func NewSummarizeHandler(db *database.Queries) *SummarizeHandler {
	return &SummarizeHandler{db: db}
}

// ListFeeds handles GET requests to retrieve feed items
func (h *SummarizeHandler) PersonalSummarize(w http.ResponseWriter, r *http.Request) {
	// Extract creator ID from the context
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	unseen, err := h.db.CountUnseenFeed(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to count unseen feed items", http.StatusInternalServerError)
		return
	}
	ongoingTask, err := h.db.CountOngoingTask(r.Context(), uuid.NullUUID{Valid: true, UUID: uuid.MustParse(claims.CreatorID)})
	if err != nil {
		http.Error(w, "Failed to count ongoing task", http.StatusInternalServerError)
		return
	}

	// Prepare response
	type SummarizeResponse struct {
		Unseen 		int64 `json:"unseen"`
		OngoingTask int64 `json:"ongoingTask"`
	}

	response := SummarizeResponse{
		Unseen: unseen,
		OngoingTask: ongoingTask,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// TODO: summarize for an organisation
// TeamSummarize handles GET requests to retrieve a team summary using LLM
func (h *SummarizeHandler) TeamSummarize(w http.ResponseWriter, r *http.Request) {
	// Extract creator ID and org ID from the context
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := uuid.MustParse(claims.OrgID)

	// We fetch the latest facts and tasks (limit 50 each for summary context)
	facts, err := h.db.ListFactsByOrgID(r.Context(), database.ListFactsByOrgIDParams{
		OrgID:   orgID,
		Column2: "",
		Limit:   50,
		Offset:  0,
	})
	if err != nil {
		http.Error(w, "Failed to fetch facts", http.StatusInternalServerError)
		return
	}

	tasks, err := h.db.ListTasksByOrgID(r.Context(), database.ListTasksByOrgIDParams{
		OrgID:   orgID,
		Column2: "",
		Limit:   50,
		Offset:  0,
	})
	if err != nil {
		http.Error(w, "Failed to fetch tasks", http.StatusInternalServerError)
		return
	}

	stepChanges, err := h.db.ListRecentObjectStepChangesByOrgID(r.Context(), database.ListRecentObjectStepChangesByOrgIDParams{
		OrgID: orgID,
		Limit: 30,
	})
	if err != nil {
		fmt.Printf("Warning: Failed to fetch step changes: %v\n", err)
	}

	// We will call a helper function to call OpenAI API
	summary, err := generateTeamSummary(facts, tasks, stepChanges)
	if err != nil {
		fmt.Printf("Error generating team summary: %v\n", err)
		http.Error(w, fmt.Sprintf("Failed to generate summary: %v", err), http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"summary": summary,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func generateTeamSummary(facts []database.ListFactsByOrgIDRow, tasks []database.ListTasksByOrgIDRow, stepChanges []database.ListRecentObjectStepChangesByOrgIDRow) (string, error) {
	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GROQ_API_KEY is not set")
	}

	var prompt bytes.Buffer
	prompt.WriteString("Dưới đây là các hoạt động của team gần đây. Hãy tóm tắt ngắn gọn tình hình hoạt động của team, ai làm gì, tiến độ ra sao, theo phong cách báo cáo ngắn gọn, súc tích dành cho leader (khoảng 3-4 câu hoặc gạch đầu dòng):\n\n")

	prompt.WriteString("Các cập nhật Trạng thái/Funnel gần đây:\n")
	for i, sc := range stepChanges {
		if i >= 20 {
			break
		}
		prompt.WriteString(fmt.Sprintf("- %s: Cập nhật Object '%s' sang bước '%s' trong funnel '%s'\n", sc.CreatorName, sc.ObjectName, sc.StepName, sc.FunnelName))
	}

	prompt.WriteString("\nCác hoạt động/cập nhật (Facts/Activities của Objects):\n")
	for i, f := range facts {
		if i >= 20 { // Limit context
			break
		}

		// Extract related objects if available
		var objNames []string
		if b, ok := f.RelatedObjects.([]byte); ok {
			var objs []struct {
				Name string `json:"name"`
			}
			if err := json.Unmarshal(b, &objs); err == nil {
				for _, o := range objs {
					if o.Name != "" {
						objNames = append(objNames, o.Name)
					}
				}
			}
		}

		objStr := ""
		if len(objNames) > 0 {
			objStr = fmt.Sprintf(" (Liên quan tới: %s)", strings.Join(objNames, ", "))
		}

		prompt.WriteString(fmt.Sprintf("- %s: %s%s\n", f.CreatorName, f.Text, objStr))
	}

	prompt.WriteString("\nCác nhiệm vụ (Tasks):\n")
	for i, t := range tasks {
		if i >= 20 { // Limit context
			break
		}
		assigned := "Chưa gán"
		if t.AssignedName.Valid {
			assigned = t.AssignedName.String
		}
		prompt.WriteString(fmt.Sprintf("- [%s] %s (Phụ trách: %s)\n", t.Status, t.Content, assigned))
	}

	reqBody, _ := json.Marshal(map[string]interface{}{
		"model": "llama-3.3-70b-versatile",
		"messages": []map[string]string{
			{"role": "system", "content": "Bạn là một trợ lý AI giúp tổng hợp báo cáo tiến độ công việc cho Leader. Hãy trả lời bằng tiếng Việt."},
			{"role": "user", "content": prompt.String()},
		},
		"temperature": 0.5,
	})

	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewBuffer(reqBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Groq API error: %s", string(bodyBytes))
	}

	var groqResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return "", err
	}

	if len(groqResp.Choices) > 0 {
		return groqResp.Choices[0].Message.Content, nil
	}

	return "Không thể tạo tóm tắt", nil
}

// TODO: summarize for an object
// TODO: summarize for a funnel
// TODO: summarize for an object type