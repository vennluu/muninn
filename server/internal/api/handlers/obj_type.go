package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type ObjectTypeHandler struct {
	DB    *database.Queries
	SQLDB *sql.DB
}

func NewObjectTypeHandler(db *database.Queries, sqlDB *sql.DB) *ObjectTypeHandler {
	return &ObjectTypeHandler{DB: db, SQLDB: sqlDB}
}

func (h *ObjectTypeHandler) CreateObjectType(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name            string          `json:"name"`
		Description     string          `json:"description"`
		Fields          json.RawMessage `json:"fields"`
		Icon            string          `json:"icon"`
		IsPublic        *bool           `json:"is_public"`
		GdpMeasureField *string         `json:"gdp_measure_field"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Printf("Error decoding request body: %v\n", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	fmt.Printf("CreateObjectType Request: %+v\n", req)

	if req.Fields == nil {
		req.Fields = json.RawMessage("[]")
	}

	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	if req.Icon == "" {
		req.Icon = "file"
	}

	isPublic := true
	if req.IsPublic != nil {
		isPublic = *req.IsPublic
	}

	var gdpMeasureField sql.NullString
	if req.GdpMeasureField != nil && *req.GdpMeasureField != "" {
		gdpMeasureField = sql.NullString{String: *req.GdpMeasureField, Valid: true}
	}

	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	creator, err := h.DB.GetCreatorByID(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	tx, err := h.SQLDB.BeginTx(r.Context(), nil)
	if err != nil {
		http.Error(w, "Failed to start transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	qtx := h.DB.WithTx(tx)

	objType, err := qtx.CreateObjectType(r.Context(), database.CreateObjectTypeParams{
		Name:            req.Name,
		Description:     req.Description,
		Fields:          req.Fields,
		CreatorID:       creator.ID,
		Icon:            req.Icon,
		IsPublic:        isPublic,
		GdpMeasureField: gdpMeasureField,
	})

	if err != nil {
		fmt.Printf("Error creating object type: %v\n", err)
		http.Error(w, "Failed to create object type", http.StatusInternalServerError)
		return
	}

	// Grant access to the creator
	err = qtx.GrantAccessToObjectType(r.Context(), database.GrantAccessToObjectTypeParams{
		CreatorID: creator.ID,
		ObjTypeID: objType.ID,
	})
	if err != nil {
		fmt.Printf("Error granting access to object type: %v\n", err)
		http.Error(w, "Failed to grant access to object type", http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		fmt.Printf("Error committing transaction: %v\n", err)
		http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(objType)
}

func (h *ObjectTypeHandler) UpdateObjectType(w http.ResponseWriter, r *http.Request) {
	objTypeID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object type ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Name            string          `json:"name"`
		Description     string          `json:"description"`
		Fields          json.RawMessage `json:"fields"`
		Icon            string          `json:"icon"`
		IsPublic        *bool           `json:"is_public"`
		GdpMeasureField *string         `json:"gdp_measure_field"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Fields == nil {
		req.Fields = json.RawMessage("[]")
	}

	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	if req.Icon == "" {
		req.Icon = "file"
	}

	isPublic := true
	if req.IsPublic != nil {
		isPublic = *req.IsPublic
	}

	var gdpMeasureField sql.NullString
	if req.GdpMeasureField != nil && *req.GdpMeasureField != "" {
		gdpMeasureField = sql.NullString{String: *req.GdpMeasureField, Valid: true}
	}

	updatedObjType, err := h.DB.UpdateObjectType(r.Context(), database.UpdateObjectTypeParams{
		ID:              objTypeID,
		Name:            req.Name,
		Description:     req.Description,
		Fields:          req.Fields,
		Icon:            req.Icon,
		IsPublic:        isPublic,
		GdpMeasureField: gdpMeasureField,
	})

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Object type not found", http.StatusNotFound)
		} else {
			fmt.Printf("Error updating object type: %v\n", err)
			http.Error(w, "Failed to update object type", http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(updatedObjType)
}

func (h *ObjectTypeHandler) DeleteObjectType(w http.ResponseWriter, r *http.Request) {
	objTypeID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "Invalid object type ID", http.StatusBadRequest)
		return
	}

	rowsAffected, err := h.DB.DeleteObjectType(r.Context(), objTypeID)
	if err != nil {
		http.Error(w, "Failed to delete object type", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Object type not found or is in use", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ObjectTypeHandler) ListObjectTypes(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	query := r.URL.Query().Get("q")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	var objectTypes []database.ListObjectTypesRow
	var totalCount int64
	var err error

	if claims.Role == "admin" {
		objectTypes, err = h.DB.ListObjectTypes(r.Context(), database.ListObjectTypesParams{
			OrgID:   uuid.MustParse(claims.OrgID),
			Column2: query,
			Limit:   int32(pageSize),
			Offset:  int32(offset),
		})
		if err != nil {
			http.Error(w, "Failed to list object types", http.StatusInternalServerError)
			return
		}

		totalCount, err = h.DB.CountObjectTypes(r.Context(), database.CountObjectTypesParams{
			OrgID:   uuid.MustParse(claims.OrgID),
			Column2: query,
		})
	} else {
		// For non-admins, list only accessible object types
		accessibleTypes, err := h.DB.ListAccessibleObjectTypes(r.Context(), database.ListAccessibleObjectTypesParams{
			CreatorID: uuid.MustParse(claims.CreatorID),
			Column2:   query,
			Limit:     int32(pageSize),
			Offset:    int32(offset),
		})
		if err != nil {
			http.Error(w, "Failed to list accessible object types", http.StatusInternalServerError)
			return
		}

		// Convert to ListObjectTypesRow for consistent response
		objectTypes = make([]database.ListObjectTypesRow, 0, len(accessibleTypes))
		for _, t := range accessibleTypes {
			objectTypes = append(objectTypes, database.ListObjectTypesRow{
				ID:              t.ID,
				Name:            t.Name,
				Icon:            t.Icon,
				Description:     t.Description,
				Fields:          t.Fields,
				CreatedAt:       t.CreatedAt,
				IsPublic:        t.IsPublic,
				GdpMeasureField: t.GdpMeasureField,
			})
		}

		totalCount, err = h.DB.CountAccessibleObjectTypes(r.Context(), database.CountAccessibleObjectTypesParams{
			CreatorID: uuid.MustParse(claims.CreatorID),
			Column2:   query,
		})
	}

	if err != nil {
		http.Error(w, "Failed to count object types", http.StatusInternalServerError)
		return
	}

	// Convert to response struct to handle sql.NullString
	type ObjectTypeResponse struct {
		ID              uuid.UUID       `json:"id"`
		Name            string          `json:"name"`
		Icon            string          `json:"icon"`
		Description     string          `json:"description"`
		Fields          json.RawMessage `json:"fields"`
		CreatedAt       time.Time       `json:"created_at"`
		IsPublic        bool            `json:"is_public"`
		GdpMeasureField *string         `json:"gdp_measure_field"`
	}

	responseList := make([]ObjectTypeResponse, 0, len(objectTypes))
	for _, t := range objectTypes {
		var gdpField *string
		if t.GdpMeasureField.Valid {
			s := t.GdpMeasureField.String
			gdpField = &s
		}
		responseList = append(responseList, ObjectTypeResponse{
			ID:              t.ID,
			Name:            t.Name,
			Icon:            t.Icon,
			Description:     t.Description,
			Fields:          t.Fields,
			CreatedAt:       t.CreatedAt,
			IsPublic:        t.IsPublic,
			GdpMeasureField: gdpField,
		})
	}

	response := struct {
		ObjectTypes []ObjectTypeResponse `json:"objectTypes"`
		TotalCount  int64                `json:"totalCount"`
		Page        int                  `json:"page"`
		PageSize    int                  `json:"pageSize"`
	}{
		ObjectTypes: responseList,
		TotalCount:  totalCount,
		Page:        page,
		PageSize:    pageSize,
	}

	json.NewEncoder(w).Encode(response)
}

func (h *ObjectTypeHandler) GrantAccessToObjectType(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	if claims.Role != "admin" {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req struct {
		CreatorID string `json:"creator_id"`
		ObjTypeID string `json:"obj_type_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	creatorID, err := uuid.Parse(req.CreatorID)
	if err != nil {
		http.Error(w, "Invalid creator ID", http.StatusBadRequest)
		return
	}

	objTypeID, err := uuid.Parse(req.ObjTypeID)
	if err != nil {
		http.Error(w, "Invalid object type ID", http.StatusBadRequest)
		return
	}

	err = h.DB.GrantAccessToObjectType(r.Context(), database.GrantAccessToObjectTypeParams{
		CreatorID: creatorID,
		ObjTypeID: objTypeID,
	})

	if err != nil {
		fmt.Printf("Error granting access: %v\n", err)
		http.Error(w, "Failed to grant access", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *ObjectTypeHandler) RevokeAccessToObjectType(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	if claims.Role != "admin" {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	creatorIDStr := chi.URLParam(r, "creatorID")
	objTypeIDStr := chi.URLParam(r, "objectTypeID")

	creatorID, err := uuid.Parse(creatorIDStr)
	if err != nil {
		http.Error(w, "Invalid creator ID", http.StatusBadRequest)
		return
	}

	objTypeID, err := uuid.Parse(objTypeIDStr)
	if err != nil {
		http.Error(w, "Invalid object type ID", http.StatusBadRequest)
		return
	}

	err = h.DB.RevokeAccessToObjectType(r.Context(), database.RevokeAccessToObjectTypeParams{
		CreatorID: creatorID,
		ObjTypeID: objTypeID,
	})

	if err != nil {
		fmt.Printf("Error revoking access: %v\n", err)
		http.Error(w, "Failed to revoke access", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *ObjectTypeHandler) GetAccessibleObjectTypesForMember(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)
	if claims.Role != "admin" {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	creatorID, err := uuid.Parse(chi.URLParam(r, "creatorID"))
	if err != nil {
		http.Error(w, "Invalid creator ID", http.StatusBadRequest)
		return
	}

	// Use ListAccessibleObjectTypes to get full object details instead of just ID/Name
	// This helps reusing the same query logic and providing more info if needed
	// Note: We use empty search query and large limit to get all
	objectTypes, err := h.DB.ListAccessibleObjectTypes(r.Context(), database.ListAccessibleObjectTypesParams{
		CreatorID: creatorID,
		Column2:   "", // No search filter
		Limit:     1000,
		Offset:    0,
	})

	if err != nil {
		fmt.Printf("Error getting accessible object types: %v\n", err)
		http.Error(w, "Failed to get accessible object types", http.StatusInternalServerError)
		return
	}

	// Convert to response struct to handle sql.NullString
	type ObjectTypeResponse struct {
		ID              uuid.UUID       `json:"id"`
		Name            string          `json:"name"`
		Icon            string          `json:"icon"`
		Description     string          `json:"description"`
		Fields          json.RawMessage `json:"fields"`
		CreatedAt       time.Time       `json:"created_at"`
		IsPublic        bool            `json:"is_public"`
		GdpMeasureField *string         `json:"gdp_measure_field"`
	}

	responseList := make([]ObjectTypeResponse, 0, len(objectTypes))
	for _, t := range objectTypes {
		var gdpField *string
		if t.GdpMeasureField.Valid {
			s := t.GdpMeasureField.String
			gdpField = &s
		}
		responseList = append(responseList, ObjectTypeResponse{
			ID:              t.ID,
			Name:            t.Name,
			Icon:            t.Icon,
			Description:     t.Description,
			Fields:          t.Fields,
			CreatedAt:       t.CreatedAt,
			IsPublic:        t.IsPublic,
			GdpMeasureField: gdpField,
		})
	}

	json.NewEncoder(w).Encode(responseList)
}
