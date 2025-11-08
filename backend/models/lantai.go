package models

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type Lantai struct {
	ID        int    `json:"id"`
	No_Lantai int    `json:"no_lantai"`
	Jenis_DOC string `json:"jenis_doc"`
	Populasi  int    `json:"populasi"`
	Tgl_Masuk string `json:"tgl_masuk"`
	KandangID int    `json:"kandang_id"`
}

func GetLantais(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id_kandang := vars["id_kandang"]

		kandangID, err := strconv.Atoi(id_kandang)
		if err != nil {
			http.Error(w, "Invalid kandang_id", http.StatusBadRequest)
			return
		}

		query := `SELECT id_lantai, no_lantai, jenisdoc, populasi, tgl_masuk FROM lantai WHERE id_kandang = ?`
		rows, err := db.Query(query, kandangID)
		if err != nil {
			http.Error(w, "Gagal mengambil data lantai: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var lantais []Lantai
		for rows.Next() {
			var lantai Lantai
			if err := rows.Scan(&lantai.ID, &lantai.No_Lantai, &lantai.Jenis_DOC, &lantai.Populasi, &lantai.Tgl_Masuk); err != nil {
				http.Error(w, "Gagal memproses data lantai: "+err.Error(), http.StatusInternalServerError)
				return
			}
			lantai.KandangID = kandangID // Set kandangID untuk setiap lantai
			lantais = append(lantais, lantai)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(lantais)
	}
}
func GetLantai(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id_kandang := vars["id_kandang"]
		id_lantai := vars["id_lantai"]

		kandangID, err := strconv.Atoi(id_kandang)
		if err != nil {
			http.Error(w, "Invalid kandang_id", http.StatusBadRequest)
			return
		}
		lantaiID, err := strconv.Atoi(id_lantai)
		if err != nil {
			http.Error(w, "Invalid lantai_id", http.StatusBadRequest)
			return
		}

		var lantai Lantai
		query := `SELECT id_lantai, no_lantai, jenisdoc, populasi, tgl_masuk, id_kandang FROM lantai WHERE id_lantai = ? AND id_kandang = ? LIMIT 1`
		err = db.QueryRow(query, lantaiID, kandangID).Scan(
			&lantai.ID,
			&lantai.No_Lantai,
			&lantai.Jenis_DOC,
			&lantai.Populasi,
			&lantai.Tgl_Masuk,
			&lantai.KandangID,
		)
		if err == sql.ErrNoRows {
			http.Error(w, "Lantai tidak ditemukan", http.StatusNotFound)
			return
		} else if err != nil {
			http.Error(w, "Gagal mengambil data lantai: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(lantai)
	}
}
func CreateLantai(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id_kandang := vars["id_kandang"]

		var lantai Lantai
		if err := json.NewDecoder(r.Body).Decode(&lantai); err != nil {
			fmt.Println("Error decoding JSON:", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		// Konversi id_kandang ke int
		kandangID, err := strconv.Atoi(id_kandang)
		if err != nil {
			fmt.Println("Error :", err)
			http.Error(w, "Invalid kandang_id", http.StatusBadRequest)
			return
		}

		query := `INSERT INTO lantai (no_lantai, jenisdoc, populasi, tgl_masuk, id_kandang)
                  VALUES (?, ?, ?, ?, ?)`
		result, err := db.Exec(query, lantai.No_Lantai, lantai.Jenis_DOC, lantai.Populasi, lantai.Tgl_Masuk, kandangID)
		if err != nil {
			fmt.Println("Error :", err)
			http.Error(w, "Gagal menambah lantai: "+err.Error(), http.StatusInternalServerError)
			return
		}

		lastID, _ := result.LastInsertId()
		lantai.ID = int(lastID)
		lantai.KandangID = kandangID

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(lantai)
	}
}

func UpdateLantai(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id_kandang := vars["id_kandang"]
		id_lantai := vars["id_lantai"]

		var lantai Lantai
		if err := json.NewDecoder(r.Body).Decode(&lantai); err != nil {
			fmt.Println("Error decoding JSON:", err)
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		kandangID, err := strconv.Atoi(id_kandang)
		if err != nil {
			fmt.Println("Error :", err)
			http.Error(w, "Invalid kandang_id", http.StatusBadRequest)
			return
		}

		lantaiID, err := strconv.Atoi(id_lantai)
		if err != nil {
			fmt.Println("Error :", err)
			http.Error(w, "Invalid lantai_id", http.StatusBadRequest)
			return
		}

		query := `UPDATE lantai SET no_lantai = ?, jenisdoc = ?, populasi = ?, tgl_masuk = ?, id_kandang = ? WHERE id_lantai = ?`
		result, err := db.Exec(query, lantai.No_Lantai, lantai.Jenis_DOC, lantai.Populasi, lantai.Tgl_Masuk, kandangID, lantaiID)
		if err != nil {
			fmt.Println("Error :", err)
			http.Error(w, "Gagal memperbarui lantai: "+err.Error(), http.StatusInternalServerError)
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			http.Error(w, "Lantai tidak ditemukan", http.StatusNotFound)
			return
		}

		lantai.ID = lantaiID
		lantai.KandangID = kandangID

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(lantai)
	}
}

func DeleteLantai(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id_kandang := vars["id_kandang"]
		id_lantai := vars["id_lantai"]

		kandangID, err := strconv.Atoi(id_kandang)
		if err != nil {
			fmt.Println("Error :", err)
			http.Error(w, "Invalid kandang_id", http.StatusBadRequest)
			return
		}

		lantaiID, err := strconv.Atoi(id_lantai)
		if err != nil {
			fmt.Println("Error :", err)
			http.Error(w, "Invalid lantai_id", http.StatusBadRequest)
			return
		}

		query := `DELETE FROM lantai WHERE id_lantai = ? AND id_kandang = ?`
		result, err := db.Exec(query, lantaiID, kandangID)
		if err != nil {
			fmt.Println("Error :", err)
			http.Error(w, "Gagal menghapus lantai: "+err.Error(), http.StatusInternalServerError)
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			http.Error(w, "Lantai tidak ditemukan", http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}