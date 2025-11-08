package routes

import (
	"api/middleware"
	"api/models"
	"database/sql"

	"github.com/gorilla/mux"
)

func RegisterLantaiRoutes(router *mux.Router, db *sql.DB) {
	router.HandleFunc("/api/lantai/{id_kandang}", middleware.AuthMiddleware(models.CreateLantai(db)).ServeHTTP).Methods("POST")
	router.HandleFunc("/api/lantais/{id_kandang}", middleware.AuthMiddleware(models.GetLantais(db)).ServeHTTP).Methods("GET")
	router.HandleFunc("/api/lantai/{id_kandang}/{id_lantai}", middleware.AuthMiddleware(models.GetLantai(db)).ServeHTTP).Methods("GET")
	router.HandleFunc("/api/lantai/{id_kandang}/{id_lantai}", middleware.AuthMiddleware(models.UpdateLantai(db)).ServeHTTP).Methods("PUT")
	router.HandleFunc("/api/lantai/{id_kandang}/{id_lantai}", middleware.AuthMiddleware(models.DeleteLantai(db)).ServeHTTP).Methods("DELETE")
}