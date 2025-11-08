package main

//kode utama
import (
	"api/middleware"
	"api/routes"
	"api/utils"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// main function
func main() {

	// muat file .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file")
	}

	// connect to the database
	db, err := utils.ConnectDB()
	if err != nil {
		log.Println("Error connecting to database:", err)
	}
	defer db.Close()

	// create a new router
	router := mux.NewRouter()

	// Route untuk melayani file statis
	router.PathPrefix("/public/").Handler(http.StripPrefix("/public/", http.FileServer(http.Dir("./public"))))

	// register routes
	routes.RegisterAuthRoutes(router, db)
	routes.RegisterDataRoutes(router, db)
	routes.RegisterLantaiRoutes(router, db)
	routes.RegisterOVKRoutes(router, db)
	routes.RegisterArticleRoutes(router, db)
	routes.RegisterIndexRoutes(router, db)
	routes.RegisterCsvRoutes(router, db)

	// register middleware
	corsRouter := middleware.EnableCORS(router)

	// start the server
	log.Println(http.ListenAndServe(":8000", corsRouter))
}
