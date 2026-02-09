package main

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"

	"github.com/crea8r/muninn/server/internal/config"
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

	// Read the migration file
	migrationFile := "migrations/004_add_creator_access_obj_type.sql"
	content, err := os.ReadFile(migrationFile)
	if err != nil {
		// Try absolute path if relative fails
		cwd, _ := os.Getwd()
		migrationFile = filepath.Join(cwd, "migrations/004_add_creator_access_obj_type.sql")
		content, err = os.ReadFile(migrationFile)
		if err != nil {
			log.Fatalf("Failed to read migration file: %v", err)
		}
	}

	query := string(content)
	_, err = db.Exec(query)
	if err != nil {
		log.Fatalf("Failed to execute migration: %v", err)
	}

	log.Println("Migration applied successfully: Added creator_obj_type_access table")
}
