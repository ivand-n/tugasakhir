package routes

import (
	"api/middleware"
	"api/models"
	"database/sql"

	"github.com/gorilla/mux"
)

func RegisterDataRoutes(router *mux.Router, db *sql.DB) {
	router.HandleFunc("/api/data/{id_lantai}", middleware.AuthMiddleware(models.GetDatas(db)).ServeHTTP).Methods("GET")
	router.HandleFunc("/api/data/{id_lantai}", middleware.AuthMiddleware(models.CreateData(db)).ServeHTTP).Methods("POST")
	router.HandleFunc("/api/data/{id_lantai}/{id_monit}", middleware.AuthMiddleware(models.GetData(db)).ServeHTTP).Methods("GET")
	router.HandleFunc("/api/data/{id_lantai}/{id_monit}", middleware.AuthMiddleware(models.UpdateData(db)).ServeHTTP).Methods("PUT")
	router.HandleFunc("/api/data/{id_lantai}/{id_monit}", middleware.AuthMiddleware(models.DeleteData(db)).ServeHTTP).Methods("DELETE")

	router.HandleFunc("/api/penjarangan/{id_lantai}", middleware.AuthMiddleware(models.GetPenjarangan(db)).ServeHTTP).Methods("GET")
	router.HandleFunc("/api/penjarangan/{id_lantai}", middleware.AuthMiddleware(models.CreatePenjarangan(db)).ServeHTTP).Methods("POST")
	router.HandleFunc("/api/penjarangan/{id_lantai}/{id}", middleware.AuthMiddleware(models.GetPenjaranganById(db)).ServeHTTP).Methods("GET")
	router.HandleFunc("/api/penjarangan/{id_lantai}/{id}", middleware.AuthMiddleware(models.UpdatePenjarangan(db)).ServeHTTP).Methods("PUT")
	router.HandleFunc("/api/penjarangan/{id_lantai}/{id}", middleware.AuthMiddleware(models.DeletePenjarangan(db)).ServeHTTP).Methods("DELETE")
}
