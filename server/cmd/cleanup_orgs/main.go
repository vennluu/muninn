package main

import (
	"context"
	"database/sql"
	"log"
	"strings"

	"github.com/crea8r/muninn/server/internal/config"
	"github.com/crea8r/muninn/server/internal/database"
	_ "github.com/lib/pq"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	queries := database.New(db)
	ctx := context.Background()

	// Get all organizations
	orgs, err := queries.ListOrganizations(ctx)
	if err != nil {
		log.Fatalf("Failed to list organizations: %v", err)
	}

	keptOrgs := []string{}
	deletedCount := 0

	for _, org := range orgs {
		name := strings.TrimSpace(org.Name)
		// Check if name matches "Superteam UK" or "SuperteamIDN" (case insensitive just in case)
		if strings.EqualFold(name, "Superteam UK") || strings.EqualFold(name, "SuperteamIDN") {
			log.Printf("Keeping organization: %s (ID: %s)", name, org.ID)
			keptOrgs = append(keptOrgs, org.ID.String())
			continue
		}

		// Delete other organizations
		log.Printf("Deleting organization: %s (ID: %s)", name, org.ID)
		_, err := db.ExecContext(ctx, "DELETE FROM org WHERE id = $1", org.ID)
		if err != nil {
			log.Printf("Failed to delete org %s: %v", name, err)
		} else {
			deletedCount++
		}
	}

	log.Printf("Cleanup completed. Deleted %d organizations. Kept: %v", deletedCount, keptOrgs)
}
