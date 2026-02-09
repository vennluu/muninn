package api

import (
	"database/sql"
	"log"
	"net/http"

	serverApi "github.com/crea8r/muninn/server/internal/api"
	"github.com/crea8r/muninn/server/internal/config"
	"github.com/crea8r/muninn/server/internal/database"
	_ "github.com/lib/pq"
)

var (
	router http.Handler
)

// Initialize the router once to avoid re-initializing on every request (cold start optimization)
func init() {
	cfg, err := config.Load()
	if err != nil {
		log.Printf("Warning: Failed to load configuration: %v", err)
	}

	// Setup database
	// Note: In serverless, connection pooling should be handled carefully.
	// Opening a new connection per request is not ideal, but for low traffic it's okay.
	// Ideally, use a connection pooler like PgBouncer or Neon/Supabase pooling.
	// For Vercel Go runtime, `init` runs once per cold start.
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := db.Ping(); err != nil {
		log.Printf("Failed to ping database: %v", err)
	}

	// Initialize services
	queries := database.New(db)

	// Setup router
	router = serverApi.SetupRouter(queries, db)
}

// Handler is the entrypoint for Vercel Serverless Function
func Handler(w http.ResponseWriter, r *http.Request) {
	router.ServeHTTP(w, r)
}
