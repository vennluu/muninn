package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/crea8r/muninn/server/pkg/database"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type PublicHandler struct {
	db *database.Queries
}

func NewPublicHandler(db *database.Queries) *PublicHandler {
	return &PublicHandler{db: db}
}

func (h *PublicHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	orgIDStr := r.URL.Query().Get("orgId")
	if orgIDStr == "" {
		http.Error(w, "orgId is required", http.StatusBadRequest)
		return
	}
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		http.Error(w, "Invalid orgId", http.StatusBadRequest)
		return
	}

	stats, err := h.db.GetObjectsByTypeStats(r.Context(), orgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if stats == nil {
		stats = []database.GetObjectsByTypeStatsRow{}
	}

	json.NewEncoder(w).Encode(stats)
}

func (h *PublicHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	orgIDStr := r.URL.Query().Get("orgId")
	if orgIDStr == "" {
		http.Error(w, "orgId is required", http.StatusBadRequest)
		return
	}
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		http.Error(w, "Invalid orgId", http.StatusBadRequest)
		return
	}

	stats, err := h.db.GetPublicStats(r.Context(), orgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(stats)
}

func (h *PublicHandler) GetFeed(w http.ResponseWriter, r *http.Request) {
	orgIDStr := r.URL.Query().Get("orgId")
	if orgIDStr == "" {
		http.Error(w, "orgId is required", http.StatusBadRequest)
		return
	}
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		http.Error(w, "Invalid orgId", http.StatusBadRequest)
		return
	}

	typeIDStr := r.URL.Query().Get("typeId")
	var feed interface{}

	if typeIDStr != "" {
		typeID, err := uuid.Parse(typeIDStr)
		if err != nil {
			http.Error(w, "Invalid typeId", http.StatusBadRequest)
			return
		}
		feedData, err := h.db.GetPublicRecentFactsByType(r.Context(), database.GetPublicRecentFactsByTypeParams{
			OrgID:  orgID,
			TypeID: typeID,
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if feedData == nil {
			feedData = []database.GetPublicRecentFactsByTypeRow{}
		}
		feed = feedData
	} else {
		feedData, err := h.db.GetPublicRecentFacts(r.Context(), orgID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if feedData == nil {
			feedData = []database.GetPublicRecentFactsRow{}
		}
		feed = feedData
	}

	json.NewEncoder(w).Encode(feed)
}

func (h *PublicHandler) GetTopObjects(w http.ResponseWriter, r *http.Request) {
	orgIDStr := r.URL.Query().Get("orgId")
	if orgIDStr == "" {
		http.Error(w, "orgId is required", http.StatusBadRequest)
		return
	}
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		http.Error(w, "Invalid orgId", http.StatusBadRequest)
		return
	}

	objects, err := h.db.GetPublicTopObjects(r.Context(), orgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if objects == nil {
		objects = []database.GetPublicTopObjectsRow{}
	}

	json.NewEncoder(w).Encode(objects)
}

func (h *PublicHandler) GetGDPStats(w http.ResponseWriter, r *http.Request) {
	orgIDStr := r.URL.Query().Get("orgId")
	if orgIDStr == "" {
		http.Error(w, "orgId is required", http.StatusBadRequest)
		return
	}
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		http.Error(w, "Invalid orgId", http.StatusBadRequest)
		return
	}

	interval := r.URL.Query().Get("interval")
	if interval == "" {
		interval = "month" // default to month for public dashboard
	}

	typeIDStr := r.URL.Query().Get("typeId")
	var typeID uuid.NullUUID
	if typeIDStr != "" {
		parsedTypeID, err := uuid.Parse(typeIDStr)
		if err == nil {
			typeID = uuid.NullUUID{UUID: parsedTypeID, Valid: true}
		}
	}

	stats, err := h.db.GetGDPStats(r.Context(), database.GetGDPStatsParams{
		OrgID:    orgID,
		Interval: interval,
		TypeID:   typeID,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if stats == nil {
		stats = []database.GetGDPStatsRow{}
	}

	json.NewEncoder(w).Encode(stats)
}

func (h *PublicHandler) ListOrganizations(w http.ResponseWriter, r *http.Request) {
	orgs, err := h.db.ListOrganizations(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if orgs == nil {
		orgs = []database.ListOrganizationsRow{}
	}

	json.NewEncoder(w).Encode(orgs)
}

func (h *PublicHandler) GetObjectDetail(w http.ResponseWriter, r *http.Request) {
	orgIDStr := r.URL.Query().Get("orgId")
	if orgIDStr == "" {
		http.Error(w, "orgId is required", http.StatusBadRequest)
		return
	}
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		http.Error(w, "Invalid orgId", http.StatusBadRequest)
		return
	}

	objectIDStr := chi.URLParam(r, "objectId")
	if objectIDStr == "" {
		http.Error(w, "objectId is required", http.StatusBadRequest)
		return
	}
	objectID, err := uuid.Parse(objectIDStr)
	if err != nil {
		http.Error(w, "Invalid objectId", http.StatusBadRequest)
		return
	}

	// Fetch object details
	object, err := h.db.GetPublicObject(r.Context(), database.GetPublicObjectParams{
		ID:    objectID,
		OrgID: orgID,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Object not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch object facts
	facts, err := h.db.GetPublicObjectFacts(r.Context(), database.GetPublicObjectFactsParams{
		ObjID: objectID,
		OrgID: orgID,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if facts == nil {
		facts = []database.GetPublicObjectFactsRow{}
	}

	// Fetch object type values
	typeValues, err := h.db.GetPublicObjectTypeValues(r.Context(), objectID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if typeValues == nil {
		typeValues = []database.GetPublicObjectTypeValuesRow{}
	}

	// Extract linked object IDs from type values to fetch shared facts
	var linkedObjectIDs []uuid.UUID
	for _, tv := range typeValues {
		var values map[string]interface{}
		if err := json.Unmarshal(tv.TypeValues, &values); err == nil {
			for _, v := range values {
				// Handle string (deprecated but supported)
				if s, ok := v.(string); ok {
					if id, err := uuid.Parse(s); err == nil {
						linkedObjectIDs = append(linkedObjectIDs, id)
					}
				}
				// Handle object {id, name, ...}
				if m, ok := v.(map[string]interface{}); ok {
					if idStr, ok := m["id"].(string); ok {
						if id, err := uuid.Parse(idStr); err == nil {
							linkedObjectIDs = append(linkedObjectIDs, id)
						}
					}
				}
				// Handle array of strings or objects
				if arr, ok := v.([]interface{}); ok {
					for _, item := range arr {
						if s, ok := item.(string); ok {
							if id, err := uuid.Parse(s); err == nil {
								linkedObjectIDs = append(linkedObjectIDs, id)
							}
						}
						if m, ok := item.(map[string]interface{}); ok {
							if idStr, ok := m["id"].(string); ok {
								if id, err := uuid.Parse(idStr); err == nil {
									linkedObjectIDs = append(linkedObjectIDs, id)
								}
							}
						}
					}
				}
			}
		}
	}

	// Fetch shared facts if any linked objects found
	// REVERTED: To match protected route logic (irrelevant facts from linked objects removed)
	/*
		if len(linkedObjectIDs) > 0 {
			sharedFacts, err := h.db.GetFactsByObjectIDs(r.Context(), linkedObjectIDs)
			if err == nil {
				existingFactIDs := make(map[uuid.UUID]bool)
				for _, f := range facts {
					existingFactIDs[f.ID] = true
				}

				for _, dbFact := range sharedFacts {
					if !existingFactIDs[dbFact.ID] {
						facts = append(facts, database.GetPublicObjectFactsRow{
							ID:             dbFact.ID,
							Text:           dbFact.Text,
							HappenedAt:     sql.NullTime{Time: dbFact.HappenedAt.Time, Valid: dbFact.HappenedAt.Valid},
							CreatorName:    dbFact.CreatorName,
							CreatorProfile: dbFact.CreatorProfile,
						})
						existingFactIDs[dbFact.ID] = true
					}
				}
			}
		}
	*/

	// Fetch linked objects (both incoming and outgoing)
	linkedObjects, err := h.db.GetPublicLinkedObjects(r.Context(), database.GetPublicLinkedObjectsParams{
		OrgID: orgID,
		ID:    objectID,
	})
	if err != nil {
		fmt.Printf("Warning: Failed to fetch linked objects: %v\n", err)
	}
	if linkedObjects == nil {
		linkedObjects = []database.GetPublicLinkedObjectsRow{}
	}

	response := map[string]interface{}{
		"object":         object,
		"facts":          facts,
		"type_values":    typeValues,
		"linked_objects": linkedObjects,
	}

	json.NewEncoder(w).Encode(response)
}

func (h *PublicHandler) GetObjectTypes(w http.ResponseWriter, r *http.Request) {
	orgIDStr := r.URL.Query().Get("orgId")
	if orgIDStr == "" {
		http.Error(w, "orgId is required", http.StatusBadRequest)
		return
	}
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		http.Error(w, "Invalid orgId", http.StatusBadRequest)
		return
	}

	types, err := h.db.GetPublicObjectTypes(r.Context(), orgID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if types == nil {
		types = []database.GetPublicObjectTypesRow{}
	}

	json.NewEncoder(w).Encode(types)
}

func (h *PublicHandler) GetObjectsByType(w http.ResponseWriter, r *http.Request) {
	orgIDStr := r.URL.Query().Get("orgId")
	if orgIDStr == "" {
		http.Error(w, "orgId is required", http.StatusBadRequest)
		return
	}
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		http.Error(w, "Invalid orgId", http.StatusBadRequest)
		return
	}

	typeIDStr := r.URL.Query().Get("typeId")
	if typeIDStr == "" {
		http.Error(w, "typeId is required", http.StatusBadRequest)
		return
	}
	typeID, err := uuid.Parse(typeIDStr)
	if err != nil {
		http.Error(w, "Invalid typeId", http.StatusBadRequest)
		return
	}

	objects, err := h.db.GetPublicObjectsByType(r.Context(), database.GetPublicObjectsByTypeParams{
		OrgID:  orgID,
		TypeID: typeID,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if objects == nil {
		objects = []database.GetPublicObjectsByTypeRow{}
	}

	json.NewEncoder(w).Encode(objects)
}

func (h *PublicHandler) ListFunnels(w http.ResponseWriter, r *http.Request) {
	orgIDStr := r.URL.Query().Get("orgId")
	if orgIDStr == "" {
		http.Error(w, "orgId is required", http.StatusBadRequest)
		return
	}
	orgID, err := uuid.Parse(orgIDStr)
	if err != nil {
		http.Error(w, "Invalid orgId", http.StatusBadRequest)
		return
	}

	funnels, err := h.db.ListFunnels(r.Context(), database.ListFunnelsParams{
		OrgID:   orgID,
		Column2: "",
		Limit:   100, // get a reasonable number of funnels
		Offset:  0,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Create a list of funnels with steps
	funnelWithSteps := make([]ListFunnelsRowWithStep, len(funnels))
	for i, funnel := range funnels {
		steps, err := h.db.ListStepsByFunnel(r.Context(), funnel.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		funnelWithSteps[i].ID = funnel.ID
		funnelWithSteps[i].Name = funnel.Name
		funnelWithSteps[i].Description = funnel.Description
		funnelWithSteps[i].CreatorID = funnel.CreatorID
		funnelWithSteps[i].CreatedAt = funnel.CreatedAt
		funnelWithSteps[i].OrgID = funnel.OrgID
		funnelWithSteps[i].ObjectCount = funnel.ObjectCount
		funnelWithSteps[i].Steps = steps
	}

	json.NewEncoder(w).Encode(funnelWithSteps)
}

func (h *PublicHandler) GetFunnelView(w http.ResponseWriter, r *http.Request) {
	funnelIDStr := chi.URLParam(r, "id")
	funnelID, err := uuid.Parse(funnelIDStr)
	if err != nil {
		http.Error(w, "Invalid funnel ID", http.StatusBadRequest)
		return
	}

	ctx := r.Context()

	// Fetch funnel details
	funnel, err := h.db.GetFunnel(ctx, funnelID)
	if err != nil {
		http.Error(w, "Failed to fetch funnel", http.StatusInternalServerError)
		return
	}

	// Fetch steps for the funnel
	steps, err := h.db.ListStepsByFunnel(ctx, funnelID)
	if err != nil {
		http.Error(w, "Failed to fetch funnel steps", http.StatusInternalServerError)
		return
	}

	stepsWithObjects := make([]StepWithObjects, len(steps))

	for i, step := range steps {
		pageStr := r.URL.Query().Get("page_" + step.ID.String())
		page, _ := strconv.Atoi(pageStr)
		if page == 0 {
			page = 1
		}

		searchQuery := r.URL.Query().Get("search_" + step.ID.String())

		objects, totalCount, err := h.getObjectsForStep(ctx, step.ID, page, searchQuery)
		if err != nil {
			http.Error(w, "Failed to fetch objects for step", http.StatusInternalServerError)
			return
		}

		stepsWithObjects[i] = StepWithObjects{
			Step:        step,
			Objects:     objects,
			TotalCount:  int32(totalCount),
			CurrentPage: int32(page),
		}
	}

	response := FunnelViewResponse{
		Funnel: funnel,
		Steps:  stepsWithObjects,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *PublicHandler) getObjectsForStep(ctx context.Context, stepID uuid.UUID, page int, searchQuery string) ([]ObjectSummary, int64, error) {
	limit := 1000 // Objects per page - Increased to show full data without pagination
	offset := (page - 1) * limit

	// Create a new query to fetch objects for a specific step with pagination and search
	objects, err := h.db.GetObjectsForStep(ctx, database.GetObjectsForStepParams{
		StepID:  stepID,
		Column2: searchQuery,
		Limit:   int32(limit),
		Offset:  int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}

	// Count total objects for the step (for pagination)
	totalCount, err := h.db.CountObjectsForStep(ctx, database.CountObjectsForStepParams{
		StepID:  stepID,
		Column2: searchQuery,
	})
	if err != nil {
		return nil, 0, err
	}

	objectSummaries := make([]ObjectSummary, len(objects))
	for i, obj := range objects {
		var tags json.RawMessage
		tagsBytes, ok := obj.Tags.([]byte)
		if !ok {
			fmt.Println("Cannot convert objects to bytes: ")
		}
		err = json.Unmarshal(tagsBytes, &tags)
		if err != nil {
			fmt.Println("Cannot marshal objects: ", err)
		}
		objectSummaries[i] = ObjectSummary{
			ID:          obj.ID,
			Name:        obj.Name,
			Description: obj.Description,
			Tags:        tags,
			Photo:       obj.Photo,
		}
	}

	return objectSummaries, totalCount, nil
}
