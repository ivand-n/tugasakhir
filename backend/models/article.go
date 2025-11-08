package models

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

type Artikel struct {
	Id        int    `json:"id"`
	Title     string `json:"title"`
	Author    string `json:"author"`
	Slug      string `json:"slug"`
	Body      string `json:"body"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func GetArticles(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT * FROM artikel")
		if err != nil {
			http.Error(w, "Failed to query database", http.StatusInternalServerError)
			log.Println("Error querying database:", err)
			return
		}
		defer rows.Close()

		artikel := []Artikel{}
		for rows.Next() {
			var u Artikel
			if err := rows.Scan(&u.Id, &u.Title, &u.Author, &u.Slug, &u.Body, &u.CreatedAt, &u.UpdatedAt); err != nil {
				http.Error(w, "Failed to scan row", http.StatusInternalServerError)
				log.Println("Error scanning row:", err)
				return
			}
			artikel = append(artikel, u)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, "Error iterating rows", http.StatusInternalServerError)
			log.Println("Rows iteration error:", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(artikel); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			log.Println("Error encoding response:", err)
			return
		}
	}
}

func GetArticlebyslug(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		slug := mux.Vars(r)["slug"]

		row := db.QueryRow("SELECT * FROM artikel WHERE slug = ?", slug)

		var u Artikel
		if err := row.Scan(&u.Id, &u.Title, &u.Author, &u.Slug, &u.Body, &u.CreatedAt, &u.UpdatedAt); err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Article not found", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to scan row", http.StatusInternalServerError)
			log.Println("Error scanning row:", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(u); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			log.Println("Error encoding response:", err)
			return
		}
	}
}

func CreateArticle(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Pastikan metode HTTP adalah POST
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// 2. Dekode JSON dari request body ke struct Artikel
		var newArticle Artikel
		err := json.NewDecoder(r.Body).Decode(&newArticle)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			log.Println("Error decoding request body:", err)
			return
		}

		// 3. Validasi input dasar
		// Pastikan field-field penting tidak kosong.
		if newArticle.Title == "" || newArticle.Author == "" || newArticle.Slug == "" || newArticle.Body == "" {
			http.Error(w, "Missing required fields: title, author, slug, body", http.StatusBadRequest)
			return
		}

		// 4. Siapkan query SQL INSERT
		// Asumsi `id`, `created_at`, dan `updated_at` di-generate otomatis oleh database.
		// Jika Anda menggunakan MySQL dari Aiven, gunakan placeholder `?`.
		query := `INSERT INTO artikel (title, author, slug, body) VALUES (?, ?, ?, ?)`

		// Jika Anda ingin mengelola `created_at` dan `updated_at` di Go (tidak direkomendasikan):
		// currentTime := time.Now().Format(time.RFC3339) // Format waktu ke string ISO 8601
		// query := `INSERT INTO artikel (title, author, slug, body, picture, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
		// _, err = db.Exec(query, newArticle.Title, newArticle.Author, newArticle.Slug, newArticle.Body, newArticle.Picture, currentTime, currentTime)

		// 5. Eksekusi query SQL
		// `db.Exec` cocok jika Anda tidak perlu mendapatkan ID yang baru dibuat secara langsung.
		result, err := db.Exec(query, newArticle.Title, newArticle.Author, newArticle.Slug, newArticle.Body)
		if err != nil {
			http.Error(w, "Failed to create article in database", http.StatusInternalServerError)
			log.Println("Error inserting article:", err)
			return
		}

		// Opsional: Dapatkan ID dari artikel yang baru dibuat (khusus untuk MySQL)
		// Ini memungkinkan Anda mengirim ID kembali ke klien.
		if newID, err := result.LastInsertId(); err == nil {
			newArticle.Id = int(newID)
			log.Printf("Article '%s' created with ID: %d", newArticle.Title, newArticle.Id)
		} else {
			log.Printf("Article '%s' created successfully (could not retrieve ID: %v)", newArticle.Title, err)
		}

		// 6. Kirim respons sukses
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated) // Mengirim status 201 Created untuk resource baru

		// Anda bisa mengirim kembali objek artikel yang baru dibuat (dengan ID)
		if err := json.NewEncoder(w).Encode(newArticle); err != nil {
			http.Error(w, "Failed to encode success response", http.StatusInternalServerError)
			log.Println("Error encoding success response:", err)
			return
		}
	}
}

// --- Fungsi UpdateArticle ---
func UpdateArticle(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Pastikan metode HTTP adalah PUT atau PATCH
		if r.Method != http.MethodPut && r.Method != http.MethodPatch {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// 2. Ambil slug dari URL
		slug := mux.Vars(r)["slug"]
		if slug == "" {
			http.Error(w, "Slug is required", http.StatusBadRequest)
			return
		}

		// 3. Dekode JSON dari request body ke struct Artikel
		var updatedArticle Artikel
		err := json.NewDecoder(r.Body).Decode(&updatedArticle)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			log.Println("Error decoding request body for update:", err)
			return
		}

		// 4. Siapkan query SQL UPDATE
		// Kita akan memperbarui berdasarkan slug. CreatedAt tidak berubah.
		// UpdatedAt biasanya di-update otomatis oleh database (rekomendasi)
		// atau bisa di-set di Go (misal: time.Now().Format(time.RFC3339)).
		// Contoh query untuk MySQL:
		query := `UPDATE artikel SET title = ?, author = ?, body = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?`

		// Jika Anda menggunakan PostgreSQL dan ingin mengupdate updated_at secara manual dari Go:
		// query := `UPDATE artikel SET title = $1, author = $2, body = $3, picture = $4, updated_at = $5 WHERE slug = $6`
		// params := []interface{}{updatedArticle.Title, updatedArticle.Author, updatedArticle.Body, updatedArticle.Picture, time.Now().Format(time.RFC3339), slug}

		// Jika Anda ingin mengizinkan update parsial (PATCH), Anda perlu membangun query secara dinamis.
		// Untuk simplicity, contoh ini mengasumsikan semua field ini selalu di-update jika ada.
		// Untuk PATCH yang sebenarnya, Anda perlu membuat query yang hanya menyertakan field yang tidak kosong.

		// 5. Eksekusi query SQL
		result, err := db.Exec(query, updatedArticle.Title, updatedArticle.Author, updatedArticle.Body, slug)
		if err != nil {
			http.Error(w, "Failed to update article in database", http.StatusInternalServerError)
			log.Println("Error updating article:", err)
			return
		}

		// 6. Cek hasil update
		rowsAffected, err := result.RowsAffected()
		if err != nil {
			http.Error(w, "Failed to check affected rows", http.StatusInternalServerError)
			log.Println("Error getting rows affected:", err)
			return
		}

		if rowsAffected == 0 {
			http.Error(w, "Article not found or no changes made", http.StatusNotFound)
			return
		}

		// 7. Kirim respons sukses
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK) // HTTP 200 OK untuk update sukses
		if err := json.NewEncoder(w).Encode(map[string]string{"message": "Article updated successfully"}); err != nil {
			http.Error(w, "Failed to encode success response", http.StatusInternalServerError)
			log.Println("Error encoding success response for update:", err)
			return
		}
		log.Printf("Article with slug '%s' updated successfully.", slug)
	}
}

// --- Fungsi DeleteArticle ---
func DeleteArticle(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Pastikan metode HTTP adalah DELETE
		if r.Method != http.MethodDelete {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// 2. Ambil slug dari URL
		slug := mux.Vars(r)["slug"]
		if slug == "" {
			http.Error(w, "Slug is required", http.StatusBadRequest)
			return
		}

		// 3. Siapkan query SQL DELETE
		// Contoh query untuk MySQL:
		query := `DELETE FROM artikel WHERE slug = ?`

		// 4. Eksekusi query SQL
		result, err := db.Exec(query, slug)
		if err != nil {
			http.Error(w, "Failed to delete article from database", http.StatusInternalServerError)
			log.Println("Error deleting article:", err)
			return
		}

		// 5. Cek hasil delete
		rowsAffected, err := result.RowsAffected()
		if err != nil {
			http.Error(w, "Failed to check affected rows after deletion", http.StatusInternalServerError)
			log.Println("Error getting rows affected after deletion:", err)
			return
		}

		if rowsAffected == 0 {
			http.Error(w, "Article not found", http.StatusNotFound)
			return
		}

		// 6. Kirim respons sukses
		// HTTP 204 No Content disarankan untuk operasi DELETE sukses tanpa body respons
		w.WriteHeader(http.StatusNoContent)
		// Atau HTTP 200 OK dengan pesan jika Anda ingin (misalnya, map[string]string{"message": "Article deleted successfully"})
		// json.NewEncoder(w).Encode(map[string]string{"message": "Article deleted successfully"})
		log.Printf("Article with slug '%s' deleted successfully.", slug)
	}
}