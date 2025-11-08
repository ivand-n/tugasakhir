package routes

import (
	"api/models"
	"database/sql"

	"github.com/gorilla/mux"
)

func RegisterCsvRoutes(router *mux.Router, db *sql.DB) {
	router.HandleFunc("/api/csv/{id_kandang}", models.ExportKandangCSV(db)).Methods("GET")
	router.HandleFunc("/api/csv/{id_kandang}/{id_lantai}", models.ExportLantaiCSV(db)).Methods("GET")
}