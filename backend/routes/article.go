package routes

import (
	"database/sql"

	"api/models"

	"github.com/gorilla/mux"
)

func RegisterArticleRoutes(router *mux.Router, db *sql.DB) {
	router.HandleFunc("/articles", models.GetArticles(db)).Methods("GET")
	router.HandleFunc("/api/article", models.CreateArticle(db)).Methods("POST")
	router.HandleFunc("/articles/{slug}", models.GetArticlebyslug(db)).Methods("GET")
	router.HandleFunc("/api/article/{slug}", models.UpdateArticle(db)).Methods("PUT")
	router.HandleFunc("/api/article/{slug}", models.DeleteArticle(db)).Methods("DELETE")
}