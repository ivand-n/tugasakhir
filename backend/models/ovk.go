package models

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
)

type OVK struct {
	ID          int       `json:"id"`
	Date        time.Time `json:"date"`
	Nama        string    `json:"nama"`
	Jenis       string    `json:"jenis"`
	Dosis       int    `json:"dosis"`
	Jenis_Dosis string    `json:"jenis_dosis"`
	Id_Lantai   int       `json:"id_lantai"`
}

// func GetOVKs(db *sql.DB) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		vars := mux.Vars(r)
// 		id_Lantai := vars["id_Lantai"]
// 		if id_Lantai == "" {
// 			http.Error(w, "Kandang ID tidak boleh kosong", http.StatusBadRequest)
// 			return
// 		}

// 		var ovk OVK
// 		query := `SELECT * FROM ovk WHERE id_Lantai = ?`
// 		err := db.QueryRow(query, id_Lantai).Scan(
// 			&ovk.ID,
// 			&ovk.Nama,
// 			&ovk.Jenis,
// 			&ovk.Dosis,
// 			&ovk.Lantai,
// 			&ovk.Id_Lantai,
// 		)
// 		if err == sql.ErrNoRows {
// 			http.Error(w, "OVK tidak ditemukan", http.StatusNotFound)
// 			return
// 		} else if err != nil {
// 			http.Error(w, "Gagal mengambil data OVK: "+err.Error(), http.StatusInternalServerError)
// 			return
// 		}
// 		w.Header().Set("Content-Type", "application/json")
// 		json.NewEncoder(w).Encode(ovk)
// 	}
// }

func GetOVK(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id_ovk := vars["id_ovk"]
		if id_ovk == "" {
			http.Error(w, "OVK ID tidak boleh kosong", http.StatusBadRequest)
			return
		}

		var ovk OVK
		query := `SELECT * FROM ovk WHERE id = ?`
		err := db.QueryRow(query, id_ovk).Scan(
			&ovk.ID,
			&ovk.Date,
			&ovk.Nama,
			&ovk.Jenis,
			&ovk.Dosis,
			&ovk.Jenis_Dosis,
			&ovk.Id_Lantai,
		)
		if err == sql.ErrNoRows {
			http.Error(w, "OVK tidak ditemukan", http.StatusNotFound)
			return
		} else if err != nil {
			http.Error(w, "Gagal mengambil data OVK: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ovk)
	}
}

func CreateOVK(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var ovk OVK
		if err := json.NewDecoder(r.Body).Decode(&ovk); err != nil {
			http.Error(w, "Invalid request payload: "+err.Error(), http.StatusBadRequest)
			return
		}

		query := `INSERT INTO ovk (nama, jenis, dosis, jenis_dosis, id_lantai) VALUES (?, ?, ?, ?, ?)`
		result, err := db.Exec(query, ovk.Nama, ovk.Jenis, ovk.Dosis, ovk.Jenis_Dosis, ovk.Id_Lantai)
		if err != nil {
			http.Error(w, "Gagal menyimpan data OVK: "+err.Error(), http.StatusInternalServerError)
			return
		}

		id, err := result.LastInsertId()
		if err != nil {
			http.Error(w, "Gagal mendapatkan ID OVK: "+err.Error(), http.StatusInternalServerError)
			return
		}
		ovk.ID = int(id)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(ovk)
	}
}
func UpdateOVK(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id_ovk := vars["id_ovk"]
		if id_ovk == "" {
			http.Error(w, "OVK ID tidak boleh kosong", http.StatusBadRequest)
			return
		}

		var ovk OVK
		if err := json.NewDecoder(r.Body).Decode(&ovk); err != nil {
			http.Error(w, "Invalid request payload: "+err.Error(), http.StatusBadRequest)
			return
		}

		query := `UPDATE ovk SET nama = ?, jenis = ?, dosis = ?, jenis_dosis = ?, id_Lantai = ? WHERE id = ?`
		_, err := db.Exec(query, ovk.Nama, ovk.Jenis, ovk.Dosis, ovk.Jenis_Dosis, ovk.Id_Lantai, id_ovk)
		if err != nil {
			http.Error(w, "Gagal memperbarui data OVK: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
func DeleteOVK(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id_ovk := vars["id_ovk"]
		if id_ovk == "" {
			http.Error(w, "OVK ID tidak boleh kosong", http.StatusBadRequest)
			return
		}

		query := `DELETE FROM ovk WHERE id = ?`
		result, err := db.Exec(query, id_ovk)
		if err != nil {
			http.Error(w, "Gagal menghapus data OVK: "+err.Error(), http.StatusInternalServerError)
			return
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			http.Error(w, "Gagal mendapatkan jumlah baris yang terpengaruh: "+err.Error(), http.StatusInternalServerError)
			return
		}

		if rowsAffected == 0 {
			http.Error(w, "OVK tidak ditemukan", http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}