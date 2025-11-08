package routes

import (
	"api/middleware"
	"api/models"
	"database/sql"

	"github.com/gorilla/mux"
)

func RegisterOVKRoutes(router *mux.Router, db *sql.DB) {
	router.HandleFunc("/api/ovk/{id_kandang}", middleware.AuthMiddleware(models.CreateOVK(db)).ServeHTTP).Methods("POST")
	router.HandleFunc("/api/ovk/{id_ovk}", middleware.AuthMiddleware(models.GetOVK(db)).ServeHTTP).Methods("GET")
	router.HandleFunc("/api/ovk/{id_kandang}/{id_ovk}", middleware.AuthMiddleware(models.UpdateOVK(db)).ServeHTTP).Methods("PUT")
	router.HandleFunc("/api/ovk/{id_kandang}/{id_ovk}", middleware.AuthMiddleware(models.DeleteOVK(db)).ServeHTTP).Methods("DELETE")
}