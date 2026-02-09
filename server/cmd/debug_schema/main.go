package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
	"github.com/joho/godotenv"
)

func main() {
    // Load env file from parent directory
    if err := godotenv.Load("../../.env.local"); err != nil {
        // Try default .env
        if err := godotenv.Load("../../.env"); err != nil {
             log.Println("Warning: Error loading .env file")
        }
    }

	dbURL := os.Getenv("DATABASE_URL")
    if dbURL == "" {
        // Fallback or error
        log.Fatal("DATABASE_URL is not set")
    }

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query(`
		SELECT column_name, data_type 
		FROM information_schema.columns 
		WHERE table_name = 'obj_type';
	`)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	fmt.Println("Columns in obj_type table:")
	for rows.Next() {
		var columnName, dataType string
		if err := rows.Scan(&columnName, &dataType); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("- %s (%s)\n", columnName, dataType)
	}
}
