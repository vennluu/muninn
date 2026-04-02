package main

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"

	"github.com/crea8r/muninn/server/pkg/config"
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

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	// List of all migration files to run in order
	migrations := []string{
		"migrations/001_initial_schema.sql",
		"migrations/002_add_is_gdp_to_obj_type.sql",
		"migrations/003_replace_is_gdp_with_measure_field.sql",
		"migrations/004_add_creator_access_obj_type.sql",
		"migrations/005_add_org_id_to_obj.sql",
		"migrations/006_add_creator_tag_access.sql",
	}

	for _, mFile := range migrations {
		content, err := os.ReadFile(mFile)
		if err != nil {
			// Try absolute path if relative fails
			cwd, _ := os.Getwd()
			content, err = os.ReadFile(filepath.Join(cwd, mFile))
			if err != nil {
				log.Fatalf("Failed to read migration file %s: %v", mFile, err)
			}
		}

		query := string(content)
		_, err = db.Exec(query)
		if err != nil {
			log.Printf("Warning: Failed to execute migration %s: %v (it might already exist)", mFile, err)
			continue
		}
		log.Printf("Migration applied successfully: %s\n", mFile)
	}
}
