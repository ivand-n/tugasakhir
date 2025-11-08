package utils

import (
	"database/sql"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

func ConnectDB() (*sql.DB, error) {
	return sql.Open("mysql", os.Getenv("DATABASE_URL"))
}
