package routes

import (
	"api/middleware"
	"api/models"
	"database/sql"

	"github.com/gorilla/mux"
)

func RegisterIndexRoutes(router *mux.Router, db *sql.DB) {
	//production
	router.HandleFunc("/api/index", middleware.AuthMiddleware(models.GetIndex(db)).ServeHTTP).Methods("GET")
	router.HandleFunc("/api/kandang", middleware.AuthMiddleware(models.GetKandang(db)).ServeHTTP).Methods("GET")
	router.HandleFunc("/api/kandang/panen", middleware.AuthMiddleware(models.GetKandangPanen(db)).ServeHTTP).Methods("GET")
	router.HandleFunc("/api/kandang/{id_kandang}", middleware.AuthMiddleware(models.GetKandangByID(db)).ServeHTTP).Methods("GET")
	router.HandleFunc("/api/kandang/{id_kandang}", middleware.AuthMiddleware(models.UpdateKandang(db)).ServeHTTP).Methods("PUT")
	router.HandleFunc("/api/kandang/{id_kandang}", middleware.AuthMiddleware(models.DeleteKandang(db)).ServeHTTP).Methods("DELETE")
	router.HandleFunc("/api/inisiasi", middleware.AuthMiddleware(models.Inisiasi(db)).ServeHTTP).Methods("POST")

	//dev postman
	// router.HandleFunc("/api/index", models.GetIndex(db).ServeHTTP).Methods("GET")
	// router.HandleFunc("/api/kandang", models.GetKandang(db).ServeHTTP).Methods("GET")
	// router.HandleFunc("/api/kandang/panen", models.GetKandangPanen(db).ServeHTTP).Methods("GET")
	// router.HandleFunc("/api/kandang/{id_kandang}", models.GetKandangByID(db).ServeHTTP).Methods("GET")
	// router.HandleFunc("/api/kandang/{id_kandang}", models.UpdateKandang(db).ServeHTTP).Methods("PUT")
	// router.HandleFunc("/api/kandang/{id_kandang}", models.DeleteKandang(db).ServeHTTP).Methods("DELETE")
	// router.HandleFunc("/api/inisiasi", models.Inisiasi(db).ServeHTTP).Methods("POST")
}
