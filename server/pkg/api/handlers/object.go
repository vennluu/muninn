package handlers

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"fmt"

	"github.com/crea8r/muninn/server/pkg/api/middleware"
	"github.com/crea8r/muninn/server/pkg/database"
	"github.com/crea8r/muninn/server/pkg/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type ObjectHandler struct {
	ObjectModel *models.ObjectModel
	DB          *database.Queries
}

func NewObjectHandler(objectModel *models.ObjectModel, db *database.Queries) *ObjectHandler {
	return &ObjectHandler{ObjectModel: objectModel, DB: db}
}

func (h *ObjectHandler) checkEditAccessForObject(ctx context.Context, objectID uuid.UUID) (bool, error) {
	claims := ctx.Value(middleware.UserClaimsKey).(*middleware.Claims)
	if claims.Role == "admin" {
		return true, nil
	}

	typeIDs, err := h.DB.GetObjectTypeIDsByObjectID(ctx, objectID)
	if err != nil {
		return false, err
	}

	// If it has types, must have access to at least one
	if len(typeIDs) > 0 {
		for _, typeID := range typeIDs {
			canEdit, err := h.DB.HasEditAccessToObjectType(ctx, database.HasEditAccessToObjectTypeParams{
				CreatorID: uuid.MustParse(claims.CreatorID),
				ObjTypeID: typeID,
			})
			if err != nil {
				return false, err
			}
			if canEdit {
				return true, nil
			}
		}
		return false, nil
	}

	// Fallback for objects without types: check if user is the creator
	object, err := h.DB.GetObjectByID(ctx, objectID)
	if err != nil {
		return false, err
	}
	return object.CreatorID == uuid.MustParse(claims.CreatorID), nil
}

func (h *ObjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name        string `json:"name"`
		Photo       string `json:"photo"`
		Description string `json:"description"`
		IDString    string `json:"idString"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creatorId := uuid.MustParse(claims.CreatorID)

	object, err := h.ObjectModel.Create(r.Context(), input.Name, input.Description, input.IDString, input.Photo, creatorId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(object)
}

func (h *ObjectHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	// Check edit access
	canEdit, err := h.checkEditAccessForObject(r.Context(), id)
	if err != nil {
		http.Error(w, "Failed to check edit access", http.StatusInternalServerError)
		return
	}
	if !canEdit {
		http.Error(w, "Forbidden: No edit access to this object", http.StatusForbidden)
		return
	}

	var input struct {
		Name        string   `json:"name"`
		Photo       string   `json:"photo"`
		Description string   `json:"description"`
		IDString    string   `json:"idString"`
		Aliases     []string `json:"aliases"`
	}

	err = json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	object, err := h.ObjectModel.Update(r.Context(), id, input.Name, input.Description, input.IDString, input.Photo, input.Aliases)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(object)
}

func (h *ObjectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	// Check edit access
	canEdit, err := h.checkEditAccessForObject(r.Context(), id)
	if err != nil {
		http.Error(w, "Failed to check edit access", http.StatusInternalServerError)
		return
	}
	if !canEdit {
		http.Error(w, "Forbidden: No edit access to this object", http.StatusForbidden)
		return
	}

	err = h.ObjectModel.Delete(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) List(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgId := uuid.MustParse(claims.OrgID)

	search := r.URL.Query().Get("search")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	offset := int32((page - 1) * pageSize)
	limit := int32(pageSize)

	objects, totalCount, err := h.ObjectModel.List(r.Context(), orgId, uuid.MustParse(claims.CreatorID), search, limit, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := struct {
		Objects    []models.ListObjectsByOrgIdRow `json:"objects"`
		TotalCount int64                          `json:"totalCount"`
		Page       int                            `json:"page"`
		PageSize   int                            `json:"pageSize"`
	}{
		Objects:    objects,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ObjectHandler) GetDetails(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgId := uuid.MustParse(claims.OrgID)

	objectDetails, err := h.ObjectModel.GetDetails(r.Context(), id, orgId)
	if err != nil {
		http.Error(w, "Object not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(objectDetails)
}

func (h *ObjectHandler) AddTag(w http.ResponseWriter, r *http.Request) {
	objectID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	// Check edit access
	canEdit, err := h.checkEditAccessForObject(r.Context(), objectID)
	if err != nil {
		http.Error(w, "Failed to check edit access", http.StatusInternalServerError)
		return
	}
	if !canEdit {
		http.Error(w, "Forbidden: No edit access to this object", http.StatusForbidden)
		return
	}

	var input struct {
		TagID uuid.UUID `json:"tagId"`
	}

	err = json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgId := uuid.MustParse(claims.OrgID)

	err = h.ObjectModel.AddTag(r.Context(), objectID, input.TagID, orgId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) RemoveTag(w http.ResponseWriter, r *http.Request) {
	objectID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	// Check edit access
	canEdit, err := h.checkEditAccessForObject(r.Context(), objectID)
	if err != nil {
		http.Error(w, "Failed to check edit access", http.StatusInternalServerError)
		return
	}
	if !canEdit {
		http.Error(w, "Forbidden: No edit access to this object", http.StatusForbidden)
		return
	}

	tagID, err := uuid.Parse(chi.URLParam(r, "tagId"))
	if err != nil {
		http.Error(w, "Invalid tag ID", http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgId := uuid.MustParse(claims.OrgID)

	err = h.ObjectModel.RemoveTag(r.Context(), objectID, tagID, orgId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) AddObjectTypeValue(w http.ResponseWriter, r *http.Request) {
	objectID, err := uuid.Parse(chi.URLParam(r, "id"))
	d, _ := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	var input struct {
		TypeID uuid.UUID       `json:"typeId"`
		Values json.RawMessage `json:"values"`
	}

	err = json.Unmarshal(d, &input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgId := uuid.MustParse(claims.OrgID)

	// Check edit access for non-admins
	if claims.Role != "admin" {
		canEdit, err := h.DB.HasEditAccessToObjectType(r.Context(), database.HasEditAccessToObjectTypeParams{
			CreatorID: uuid.MustParse(claims.CreatorID),
			ObjTypeID: input.TypeID,
		})
		if err != nil {
			http.Error(w, "Failed to check edit access", http.StatusInternalServerError)
			return
		}
		if !canEdit {
			http.Error(w, "Forbidden: No edit access to this object type", http.StatusForbidden)
			return
		}
	}

	// TODO: orgId is unused in model, need to check it somewhere
	typeValue, err := h.ObjectModel.AddObjectTypeValue(r.Context(), objectID, input.TypeID, input.Values, orgId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(typeValue)
}

func (h *ObjectHandler) RemoveObjectTypeValue(w http.ResponseWriter, r *http.Request) {
	typeValueID, err := uuid.Parse(chi.URLParam(r, "typeValueId"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgId := uuid.MustParse(claims.OrgID)

	// Check edit access for non-admins
	if claims.Role != "admin" {
		typeID, err := h.DB.GetObjectTypeIDByTypeValueID(r.Context(), typeValueID)
		if err != nil {
			http.Error(w, "Failed to get object type ID", http.StatusInternalServerError)
			return
		}
		canEdit, err := h.DB.HasEditAccessToObjectType(r.Context(), database.HasEditAccessToObjectTypeParams{
			CreatorID: uuid.MustParse(claims.CreatorID),
			ObjTypeID: typeID,
		})
		if err != nil {
			http.Error(w, "Failed to check edit access", http.StatusInternalServerError)
			return
		}
		if !canEdit {
			http.Error(w, "Forbidden: No edit access to this object type", http.StatusForbidden)
			return
		}
	}

	err = h.ObjectModel.RemoveObjectTypeValue(r.Context(), typeValueID, orgId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectHandler) UpdateObjectTypeValue(w http.ResponseWriter, r *http.Request) {
	_, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object ID", http.StatusBadRequest)
		return
	}

	typeValueID, err := uuid.Parse(chi.URLParam(r, "typeValueId"))
	if err != nil {
		http.Error(w, "Invalid type value ID", http.StatusBadRequest)
		return
	}

	var input struct {
		Values json.RawMessage `json:"type_values"`
	}

	err = json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	OrgID := uuid.MustParse(claims.OrgID)

	// Check edit access for non-admins
	if claims.Role != "admin" {
		typeID, err := h.DB.GetObjectTypeIDByTypeValueID(r.Context(), typeValueID)
		if err != nil {
			http.Error(w, "Failed to get object type ID", http.StatusInternalServerError)
			return
		}
		canEdit, err := h.DB.HasEditAccessToObjectType(r.Context(), database.HasEditAccessToObjectTypeParams{
			CreatorID: uuid.MustParse(claims.CreatorID),
			ObjTypeID: typeID,
		})
		if err != nil {
			http.Error(w, "Failed to check edit access", http.StatusInternalServerError)
			return
		}
		if !canEdit {
			http.Error(w, "Forbidden: No edit access to this object type", http.StatusForbidden)
			return
		}
	}

	updatedTypeValue, err := h.ObjectModel.UpdateObjectTypeValue(r.Context(), typeValueID, OrgID, input.Values)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedTypeValue)
}

type ObjectWithTagsAndTypeValues struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Tags        json.RawMessage `json:"tags"`
	TypeValues  json.RawMessage `json:"typeValues"`
}

type AdvancedFilterParams struct {
	TypeValues map[string]interface{} `json:"typeValues"`
	Tags       []uuid.UUID            `json:"tags"`
	Search     string                 `json:"search"`
	SortOrder  string                 `json:"sortOrder"`
}

func (h *ObjectHandler) ListObjectsByTypeWithAdvancedFilter(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Parse query parameters
	typeID, err := uuid.Parse(chi.URLParam(r, "typeID"))
	if err != nil {
		http.Error(w, "Invalid object type ID", http.StatusBadRequest)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	// Parse advanced filter params
	var filterParams AdvancedFilterParams
	err = json.NewDecoder(r.Body).Decode(&filterParams)
	if err != nil {
		http.Error(w, "Invalid filter parameters", http.StatusBadRequest)
		return
	}

	// Get the organization ID from the context
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	orgID := uuid.MustParse(claims.OrgID)

	// Check access for non-admins
	if claims.Role != "admin" {
		hasAccess, err := h.DB.HasViewAccessToObjectType(ctx, database.HasViewAccessToObjectTypeParams{
			CreatorID: uuid.MustParse(claims.CreatorID),
			ObjTypeID: typeID,
		})
		if err != nil {
			fmt.Printf("Error checking access: %v\n", err)
			http.Error(w, "Failed to check access", http.StatusInternalServerError)
			return
		}
		if !hasAccess {
			http.Error(w, "Access denied", http.StatusForbidden)
			return
		}
	}

	// Prepare type values filter
	typeValuesFilter, err := json.Marshal(filterParams.TypeValues)
	if err != nil {
		http.Error(w, "Invalid type values filter", http.StatusBadRequest)
		return
	}

	// Fetch objects
	objects, err := h.DB.ListObjectsByTypeWithAdvancedFilter(ctx, database.ListObjectsByTypeWithAdvancedFilterParams{
		TypeID:  typeID,
		OrgID:   orgID,
		Column3: typeValuesFilter,
		Column4: filterParams.Tags,
		Column5: filterParams.Search,
		Column6: filterParams.SortOrder,
		Limit:   int32(pageSize),
		Offset:  int32((page - 1) * pageSize),
	})
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to fetch objects", http.StatusInternalServerError)
		return
	}
	// Count total objects
	totalCount, err := h.DB.CountObjectsByTypeWithAdvancedFilter(ctx, database.CountObjectsByTypeWithAdvancedFilterParams{
		TypeID:  typeID,
		OrgID:   orgID,
		Column3: typeValuesFilter,
		Column4: filterParams.Tags,
		Column5: filterParams.Search,
	})
	if err != nil {
		http.Error(w, "Failed to count objects", http.StatusInternalServerError)
		return
	}

	// convert database.ListObjectsByTypeWithAdvancedFilterRow to ObjectWithTagsAndTypeValues
	var objectsWithTagsAndTypeValues []ObjectWithTagsAndTypeValues
	for _, object := range objects {
		objTagsBytes := object.Tags.([]byte)
		objectTags := json.RawMessage(objTagsBytes)

		objectWithTagsAndTypeValues := ObjectWithTagsAndTypeValues{
			ID:          object.ID,
			Name:        object.Name,
			Description: object.Description,
			Tags:        objectTags,
			TypeValues:  object.TypeValues,
		}
		objectsWithTagsAndTypeValues = append(objectsWithTagsAndTypeValues, objectWithTagsAndTypeValues)
	}

	// get the object type
	objectType, err := h.DB.GetObjectTypeByID(ctx, typeID)
	if err != nil {
		http.Error(w, "Failed to get object type", http.StatusInternalServerError)
		return
	}

	// Prepare response
	response := struct {
		Objects    []ObjectWithTagsAndTypeValues `json:"objects"`
		TotalCount int64                         `json:"totalCount"`
		Page       int                           `json:"page"`
		PageSize   int                           `json:"pageSize"`
		ObjectType database.ObjType              `json:"objectType"`
	}{
		Objects:    objectsWithTagsAndTypeValues,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		ObjectType: objectType,
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
