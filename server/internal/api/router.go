package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"github.com/crea8r/muninn/server/internal/api/handlers"
	"github.com/crea8r/muninn/server/internal/api/middleware"
	"github.com/crea8r/muninn/server/internal/database"
	"github.com/crea8r/muninn/server/internal/features/auth"
	"github.com/crea8r/muninn/server/internal/models"
	"github.com/crea8r/muninn/server/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/rs/cors"
)

func SetupRouter(queries *database.Queries, db *sql.DB) *chi.Mux {
	debug := os.Getenv("DEBUG_SQL") == "true"
	fmt.Println("DEBUG_SQL: ", debug)
	r := chi.NewRouter()

	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "*"}, // Allow all origins
		//[]string{"http://localhost:3000", "https://yourdomain.com"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Requested-With"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})
	r.Use(corsMiddleware.Handler)

	objectService := service.NewObjectService(queries, debug)
	advancedObjectHandler := handlers.NewAdvancedObjectHandler(objectService)

	tagHandler := handlers.NewTagHandler(queries)
	objectTypeHandler := handlers.NewObjectTypeHandler(queries, db)
	funnelHandler := handlers.NewFunnelHandler(queries)
	objectModel := models.NewObjectModel(queries)
	objectHandler := handlers.NewObjectHandler(objectModel, queries)
	objStepHandler := handlers.NewObjStepHandler(objectModel)
	factHandler := handlers.NewFactHandler(queries)
	taskHandler := handlers.NewTaskHandler(queries)
	feedHandler := handlers.NewFeedHandler(queries)
	summarizeHandler := handlers.NewSummarizeHandler(queries)
	listHandler := handlers.NewListHandler(queries)
	importHandler := handlers.NewImportTaskHandler(db)
	mergeHandler := handlers.NewMergeObjectsHandler(db)
	metricsService := service.NewMetricsService(queries)
	metricsHandler := handlers.NewMetricsHandler(metricsService)
	externalHandler := handlers.NewExternalHandler(db, queries)
	automationHandler := handlers.NewAutomationHandler(queries)
	gdpHandler := handlers.NewGDPHandler(queries)
	wrapWithFeed := func(handler http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			rw := middleware.NewResponseWriter(w)
			handler.ServeHTTP(rw, r)

			// Only create feed entry if the response was successful (status code < 400)
			if rw.Status() < 400 {
				// TODO: rethink this
				// middleware.CreateFeedEntry(db, r, rw)
			}
		}
	}

	// Public routes
	authHandler := *auth.NewHandler(queries)
	authHandler.RegisterRoutes(r, wrapWithFeed)

	publicHandler := handlers.NewPublicHandler(queries)
	r.Get("/public/stats", publicHandler.GetStats)
	r.Get("/public/feed", publicHandler.GetFeed)
	r.Get("/public/top-objects", publicHandler.GetTopObjects)
	r.Get("/public/orgs", publicHandler.ListOrganizations)
	r.Get("/public/object-types", publicHandler.GetObjectTypes)
	r.Get("/public/objects-by-type", publicHandler.GetObjectsByType)
	r.Get("/public/objects/{objectId}", publicHandler.GetObjectDetail)

	r.Get("/stats", handlers.HealthCheck(queries))

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.Permission)

		r.Route("/metrics", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Get("/creator/{creatorId}", metricsHandler.GetCreatorMetrics)
			r.Get("/team", metricsHandler.GetTeamMetrics)
		})

		r.Route("/setting/tags", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/", tagHandler.CreateTag)
			r.Get("/", tagHandler.ListTags)
			r.Put("/{id}", tagHandler.UpdateTag)
			r.Get("/{id}", tagHandler.GetTag)
			r.Get("/ids", tagHandler.GetTags)
			r.Delete("/{id}", tagHandler.DeleteTag)
		})

		r.Route("/setting/object-types", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/", wrapWithFeed(objectTypeHandler.CreateObjectType))
			r.Get("/", objectTypeHandler.ListObjectTypes)
			r.Put("/{id}", objectTypeHandler.UpdateObjectType)
			r.Delete("/{id}", objectTypeHandler.DeleteObjectType)
			r.Post("/{typeID}/advance", objectHandler.ListObjectsByTypeWithAdvancedFilter)

			// Access control routes
			r.Post("/access", objectTypeHandler.GrantAccessToObjectType)
			r.Delete("/access/{creatorID}/{objectTypeID}", objectTypeHandler.RevokeAccessToObjectType)
			r.Get("/access/{creatorID}", objectTypeHandler.GetAccessibleObjectTypesForMember)
		})

		r.Route("/setting/funnels", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/", wrapWithFeed(funnelHandler.CreateFunnel))
			r.Get("/", funnelHandler.ListFunnels)
			r.Get("/{id}", funnelHandler.GetFunnel)
			r.Put("/{id}", funnelHandler.UpdateFunnel)
			r.Delete("/{id}", funnelHandler.DeleteFunnel)
			r.Get("/{id}/view", funnelHandler.GetFunnelView)
		})

		r.Route("/objects", func(r chi.Router) {
			r.Use(middleware.Permission)
			// Object routes
			r.Post("/", wrapWithFeed(objectHandler.Create))
			r.Get("/", objectHandler.List)
			r.Get("/{id}", objectHandler.GetDetails)
			r.Put("/{id}", wrapWithFeed(objectHandler.Update))
			r.Delete("/{id}", objectHandler.Delete)
			// Tag routes
			r.Post("/{id}/tags", objectHandler.AddTag)
			r.Delete("/{id}/tags/{tagId}", objectHandler.RemoveTag)

			// Object type value routes
			r.Post("/{id}/type-values", wrapWithFeed(objectHandler.AddObjectTypeValue))
			r.Put("/{id}/type-values/{typeValueId}", objectHandler.UpdateObjectTypeValue)
			r.Delete("/{id}/type-values/{typeValueId}", objectHandler.RemoveObjectTypeValue)

			// Object step routes
			r.Post("/steps", wrapWithFeed(objStepHandler.Create))
			r.Delete("/steps/{id}", objStepHandler.SoftDelete)
			r.Delete("/steps/{id}/force", objStepHandler.HardDelete)
			r.Put("/steps/{id}/sub-status", objStepHandler.UpdateSubStatus)

			// Object Advanced routes
			r.Get("/advanced", advancedObjectHandler.ListObjects)

			// Merge objects
			r.Post("/merge", wrapWithFeed(mergeHandler.MergeObjects))
		})

		r.Route("/facts", func(r chi.Router) {
			r.Post("/", factHandler.Create)
			r.Get("/", factHandler.List)
			r.Route("/{id}", func(r chi.Router) {
				r.Put("/", factHandler.Update)
				r.Delete("/", factHandler.Delete)
			})
		})

		r.Route("/tasks", func(r chi.Router) {
			r.Use(middleware.Permission)
			// Only admin can access this route; later implement permission check
			// r.Get("/", taskHandler.ListAllTasksInOrg)
			r.Get("/", taskHandler.ListWithFilter)
			r.Post("/", wrapWithFeed(taskHandler.Create))
			r.Get("/object/{objectID}", taskHandler.ListByObjectID)
			r.Route("/{id}", func(r chi.Router) {
				r.Get("/", taskHandler.GetByID)
				r.Put("/", wrapWithFeed(taskHandler.Update))
				r.Delete("/", taskHandler.Delete)
			})
		})

		r.Route("/lists", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/", listHandler.CreateList)
			r.Get("/", listHandler.ListListsByOrgID)
			r.Put("/{id}", listHandler.UpdateList)
			r.Delete("/{id}", listHandler.DeleteList)
			// create "creator_list" for a list
			r.Post("/{id}/creator", listHandler.CreateCreatorList)
			// id of creator_list
			r.Put("/creator/{id}", listHandler.UpdateCreatorList)
			r.Delete("/creator/{id}", listHandler.DeleteCreatorList)
			r.Get("/creator/", listHandler.ListCreatorListsByCreatorID)
			r.Get("/creator/detail/{id}", listHandler.GetCreateListByID)
		})

		r.Route("/import", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/", importHandler.CreateImportTask)
			r.Get("/status", importHandler.GetImportTaskStatus)
			r.Get("/history", importHandler.GetImportHistory)
		})

		r.Route("/feeds", func(r chi.Router) {
			r.Use(middleware.Permission)
			// r.Get("/", feedHandler.ListFeeds)
			// change to fact since feed logic is not clear
			r.Get("/", factHandler.List)
			r.Post("/seen", feedHandler.MarkFeedsAsSeen)
		})

		r.Route("/summarize", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Get("/personal", summarizeHandler.PersonalSummarize)
		})

		r.Route("/external", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Post("/facts", externalHandler.CreateFact)
			r.Post("/type-values", externalHandler.UpsertObjectTypeValue)
			r.Post("/tag-object", externalHandler.TagObject)
			r.Post("/objects", externalHandler.ListObjectsWithNormalizedData)
		})

		r.Route("/automations", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Get("/", automationHandler.ListActions)
			r.Post("/", automationHandler.CreateAction)
			r.Route("/{actionId}", func(r chi.Router) {
				r.Get("/executions", automationHandler.GetExecutionLogs)
				r.Put("/", automationHandler.UpdateAction)
				r.Delete("/", automationHandler.DeleteAction)
			})
		})

		r.Route("/gdp", func(r chi.Router) {
			r.Use(middleware.Permission)
			r.Get("/stats", gdpHandler.GetGDPStats)
		})
	})

	return r
}
