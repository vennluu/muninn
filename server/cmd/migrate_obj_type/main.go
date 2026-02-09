package main

import (
	"database/sql"
	"log"

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

	// Add is_public column to obj_type table
	_, err = db.Exec("ALTER TABLE obj_type ADD COLUMN is_public BOOLEAN DEFAULT true;")
	if err != nil {
		log.Printf("Failed to add column (might already exist): %v", err)
	} else {
		log.Println("Added is_public column to obj_type table")
	}
}
