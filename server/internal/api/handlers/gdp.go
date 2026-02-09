package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/google/uuid"
)

type GDPHandler struct {
	DB *database.Queries
}

func NewGDPHandler(db *database.Queries) *GDPHandler {
	return &GDPHandler{DB: db}
}

func (h *GDPHandler) GetGDPStats(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value(middleware.UserClaimsKey).(*middleware.Claims)

	// We use the creator ID from claims to find the creator and then their OrgID
	creator, err := h.DB.GetCreatorByID(r.Context(), uuid.MustParse(claims.CreatorID))
	if err != nil {
		http.Error(w, "Failed to get creator", http.StatusInternalServerError)
		return
	}

	interval := r.URL.Query().Get("interval")
	if interval == "" {
		interval = "day" // default to day
	}

	// Validate interval
	validIntervals := map[string]bool{
		"day":   true,
		"week":  true,
		"month": true,
		"year":  true,
	}
	if !validIntervals[interval] {
		http.Error(w, "Invalid interval. Must be day, week, month, or year", http.StatusBadRequest)
		return
	}

	stats, err := h.DB.GetGDPStats(r.Context(), database.GetGDPStatsParams{
		OrgID:    creator.OrgID,
		Interval: interval,
	})
	if err != nil {
		http.Error(w, "Failed to get GDP stats", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(stats)
}
