package routes

import (
	"api/models"
	"database/sql"

	"github.com/gorilla/mux"
)

func RegisterAuthRoutes(router *mux.Router, db *sql.DB) {
	router.HandleFunc("/auth/login", models.LoginHandler).Methods("GET")
	router.HandleFunc("/auth/callback", models.CallbackHandler(db)).Methods("GET")
	router.HandleFunc("/auth/logout", models.LogoutHandler).Methods("GET")
}
