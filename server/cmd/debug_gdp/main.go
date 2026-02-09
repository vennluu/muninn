package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://127.0.0.1:5432/muninn?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to open DB: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping DB: %v", err)
	}

	fmt.Println("Connected to DB")

	// 1. Check Object Types with gdp_measure_field
	rows, err := db.Query(`
		SELECT id, name, gdp_measure_field 
		FROM obj_type 
		WHERE gdp_measure_field IS NOT NULL AND gdp_measure_field != ''
	`)
	if err != nil {
		log.Fatalf("Query failed: %v", err)
	}
	defer rows.Close()

	var objTypes []struct {
		ID              string
		Name            string
		GdpMeasureField string
	}

	fmt.Println("\nObject Types with GDP Measure Field:")
	for rows.Next() {
		var id, name, gdp string
		if err := rows.Scan(&id, &name, &gdp); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("- ID: %s, Name: %s, Field: %s\n", id, name, gdp)
		objTypes = append(objTypes, struct {
			ID              string
			Name            string
			GdpMeasureField string
		}{id, name, gdp})
	}

	if len(objTypes) == 0 {
		fmt.Println("No Object Types have gdp_measure_field set!")
		return
	}

	// 2. Check Object Values for these types
	for _, ot := range objTypes {
		fmt.Printf("\nChecking values for Object Type: %s (%s), Field: %s\n", ot.Name, ot.ID, ot.GdpMeasureField)

		vRows, err := db.Query(`
			SELECT o.id, otv.type_values
			FROM obj_type_value otv
			JOIN obj o ON otv.obj_id = o.id
			WHERE otv.type_id = $1
		`, ot.ID)
		if err != nil {
			log.Printf("Failed to query values: %v", err)
			continue
		}
		defer vRows.Close()

		count := 0
		for vRows.Next() {
			var oid string
			var val []byte
			if err := vRows.Scan(&oid, &val); err != nil {
				log.Fatal(err)
			}

			var data map[string]interface{}
			if err := json.Unmarshal(val, &data); err != nil {
				fmt.Printf("  [Error] Failed to unmarshal JSON for obj %s: %v\n", oid, err)
				continue
			}

			fieldVal, exists := data[ot.GdpMeasureField]
			fmt.Printf("  - Obj %s: %s = %v (Exists: %v, Type: %T)\n", oid, ot.GdpMeasureField, fieldVal, exists, fieldVal)
			count++
		}
		fmt.Printf("  Total objects found: %d\n", count)
	}
}
