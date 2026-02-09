package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/crea8r/muninn/server/internal/database"
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

	response := map[string]interface{}{
		"object":      object,
		"facts":       facts,
		"type_values": typeValues,
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
