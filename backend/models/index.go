package models

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type User struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Picture string `json:"picture"`
	Alamat  string `json:"alamat"`
}

type Kandang struct {
	ID        int    `json:"id"`
	Nama      string `json:"nama"`
	Tingkat   int    `json:"tingkat"`
	Kapasitas int    `json:"kapasitas"`
	Alamat    string `json:"alamat"`
	Status    int   `json:"status"`
}

type UserKandang struct {
	Email   string `json:"email"`
	Kandang int    `json:"kandang"`
}

type Monit struct {
	Id_Monit       int     `json:"id"`
	Date           string  `json:"date"`
	Umur           int     `json:"umur"`
	Mati           int     `json:"mati"`
	Culing         int     `json:"culing"`
	Deplesi        int     `json:"deplesi"`
	DeplesiPersen  float32 `json:"deplesi_persen"`
	SisaAyam       int     `json:"sisa_ayam"`
	Dh             float32 `json:"dh"`
	Konsumsi       int     `json:"konsumsi"`
	CumPakan       int     `json:"cum_pakan"`
	Gr_Ekor_Hari   float32 `json:"gr_ekor_hari"`
	Cum_Kons_Pakan float32 `json:"cum_kons_pakan"`
	Karung         int     `json:"karung"`
	BbEkor         float32 `json:"bb_ekor"`
	Dg             float32 `json:"dg"`
	Adg_Pbbh       float32 `json:"adg_pbbh"`
	Tonase         float32 `json:"tonase"`
	Fcr            float64 `json:"fcr"`
	Ip             float32 `json:"ip"`
	Ep             float32 `json:"ep"`
	Id_Lantai      int     `json:"id_lantai"`
}

func GetIndex(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Ambil email dari query parameter
		email := r.URL.Query().Get("email")
		if email == "" {
			http.Error(w, "Email is required", http.StatusBadRequest)
			return
		}

		// Query untuk mendapatkan data kandang, lantai, dan monit
		query := `
            SELECT 
                kandang.id AS kandang_id, kandang.nama AS kandang_nama, kandang.tingkat, kandang.kapasitas, kandang.alamat, kandang.status AS kandang_status, 
                lantai.id_lantai AS lantai_id, lantai.no_lantai, lantai.jenisdoc, lantai.populasi, lantai.tgl_masuk, 
                monit.id_monit, monit.date, monit.umur, monit.mati, monit.culing, monit.deplesi, monit.deplesi_persen, monit.sisa_ayam, monit.dh, monit.konsumsi, monit.cum_pakan, monit.gr_ekor_hari, monit.cum_kons_pakan, monit.karung, monit.bb_ekor, monit.dg, monit.adg_pbbh, monit.tonase, monit.fcr, monit.ip, monit.ep 
            FROM kandang
            INNER JOIN userkandang uk ON uk.kandang = kandang.id
            LEFT JOIN lantai ON kandang.id = lantai.id_kandang 
            LEFT JOIN monit ON lantai.id_lantai = monit.id_lantai 
            WHERE uk.email = ?
        `

		// Eksekusi query
		rows, err := db.Query(query, email)
		if err != nil {
			http.Error(w, "Failed to query database", http.StatusInternalServerError)
			log.Println("Query error:", err)
			return
		}
		defer rows.Close()

		// Struktur data untuk menyimpan hasil query
		type Monit struct {
			Id_Monit       sql.NullInt64   `json:"id"`
			Date           sql.NullString  `json:"date"`
			Umur           sql.NullInt64   `json:"umur"`
			Mati           sql.NullInt64   `json:"mati"`
			Culing         sql.NullInt64   `json:"culing"`
			Deplesi        sql.NullInt64   `json:"deplesi"`
			DeplesiPersen  sql.NullFloat64 `json:"deplesi_persen"`
			SisaAyam       sql.NullInt64   `json:"sisa_ayam"`
			Dh             sql.NullFloat64 `json:"dh"`
			Konsumsi       sql.NullInt64   `json:"konsumsi"`
			CumPakan       sql.NullInt64   `json:"cum_pakan"`
			Gr_Ekor_Hari   sql.NullFloat64 `json:"gr_ekor_hari"`
			Cum_Kons_Pakan sql.NullFloat64 `json:"cum_kons_pakan"`
			Karung         sql.NullInt64   `json:"karung"`
			BbEkor         sql.NullFloat64 `json:"bb_ekor"`
			Dg             sql.NullFloat64 `json:"dg"`
			Adg_Pbbh       sql.NullFloat64 `json:"adg_pbbh"`
			Tonase         sql.NullFloat64 `json:"tonase"`
			Fcr            sql.NullFloat64 `json:"fcr"`
			Ip             sql.NullFloat64 `json:"ip"`
			Ep             sql.NullFloat64 `json:"ep"`
		}

		type Lantai struct {
			ID        sql.NullInt64  `json:"id"`
			No_Lantai sql.NullInt64  `json:"no_lantai"`
			Jenis_DOC sql.NullString `json:"jenis_doc"`
			Populasi  sql.NullInt64  `json:"populasi"`
			Tgl_Masuk sql.NullString `json:"tgl_masuk"`
			Monit     []Monit        `json:"monit"`
		}

		type Kandang struct {
			ID        int      `json:"id"`
			Nama      string   `json:"nama"`
			Tingkat   int      `json:"tingkat"`
			Kapasitas int      `json:"kapasitas"`
			Alamat    string   `json:"alamat"`
			Status    bool     `json:"status"`
			Lantai    []Lantai `json:"lantai"`
		}

		kandangMap := make(map[int]*Kandang)

		// Iterasi hasil query
		for rows.Next() {
			var kandangID, tingkat, kapasitas int
			var kandangNama, alamat string
			var status bool
			var lantaiID, noLantai, populasi sql.NullInt64
			var jenisDOC, tglMasuk sql.NullString
			var monit Monit

			if err := rows.Scan(
				&kandangID, &kandangNama, &tingkat, &kapasitas, &alamat, &status,
				&lantaiID, &noLantai, &jenisDOC, &populasi, &tglMasuk,
				&monit.Id_Monit, &monit.Date, &monit.Umur, &monit.Mati, &monit.Culing, &monit.Deplesi, &monit.DeplesiPersen,
				&monit.SisaAyam, &monit.Dh, &monit.Konsumsi, &monit.CumPakan, &monit.Gr_Ekor_Hari,
				&monit.Cum_Kons_Pakan, &monit.Karung, &monit.BbEkor, &monit.Dg, &monit.Adg_Pbbh, &monit.Tonase,
				&monit.Fcr, &monit.Ip, &monit.Ep,
			); err != nil {
				http.Error(w, "Failed to scan row", http.StatusInternalServerError)
				log.Println("Scan error:", err)
				return
			}

			// Kelompokkan data berdasarkan kandang
			if _, exists := kandangMap[kandangID]; !exists {
				kandangMap[kandangID] = &Kandang{
					ID:        kandangID,
					Nama:      kandangNama,
					Tingkat:   tingkat,
					Kapasitas: kapasitas,
					Alamat:    alamat,
					Status:    status,
					Lantai:    []Lantai{},
				}
			}

			// Kelompokkan data berdasarkan lantai
			kandang := kandangMap[kandangID]
			found := false
			for i := range kandang.Lantai {
				if kandang.Lantai[i].ID == lantaiID {
					kandang.Lantai[i].Monit = append(kandang.Lantai[i].Monit, monit)
					found = true
					break
				}
			}
			if !found && lantaiID.Valid {
				kandang.Lantai = append(kandang.Lantai, Lantai{
					ID:        lantaiID,
					No_Lantai: noLantai,
					Jenis_DOC: jenisDOC,
					Populasi:  populasi,
					Tgl_Masuk: tglMasuk,
					Monit:     []Monit{monit},
				})
			}
		}

		// Konversi map ke slice
		kandangs := make([]Kandang, 0, len(kandangMap))
		for _, kandang := range kandangMap {
			kandangs = append(kandangs, *kandang)
		}

		// Encode hasil query ke dalam JSON dan kirimkan sebagai respons
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(kandangs)
	}
}

func GetKandang(db *sql.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        email := r.URL.Query().Get("email")
        if email == "" {
            http.Error(w, "Email is required", http.StatusBadRequest)
            return
        }

        rows, err := db.Query("SELECT k.id, k.nama, k.tingkat, k.kapasitas, k.alamat, k.status FROM kandang k JOIN userkandang ku ON k.id = ku.kandang JOIN users u ON ku.email = u.email WHERE u.email = ?", email)
        if err != nil {
            log.Println("Query error:", err)
            http.Error(w, "Failed to query database", http.StatusInternalServerError)
            return
        }
        defer rows.Close()

        var kandangs []Kandang
        for rows.Next() {
            var kandang Kandang
            if err := rows.Scan(&kandang.ID, &kandang.Nama, &kandang.Tingkat, &kandang.Kapasitas, &kandang.Alamat, &kandang.Status); err != nil {
                log.Println("Scan error:", err)
                continue // Skip row yang error
            }
            kandangs = append(kandangs, kandang)
        }

        if err := rows.Err(); err != nil {
            log.Println("Rows error:", err)
        }

        // Jika tidak ada data, kembalikan array kosong bukan null
        if kandangs == nil {
            kandangs = []Kandang{}
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        if err := json.NewEncoder(w).Encode(kandangs); err != nil {
            log.Println("Error encoding kandangs to JSON:", err)
            http.Error(w, "Failed to encode response", http.StatusInternalServerError)
        }
    }
}

func GetKandangPanen(db *sql.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        email := r.URL.Query().Get("email")
        if email == "" {
            http.Error(w, "Email is required", http.StatusBadRequest)
            return
        }

        rows, err := db.Query("SELECT k.id, k.nama, k.tingkat, k.kapasitas, k.alamat, k.status FROM kandang k JOIN userkandang ku ON k.id = ku.kandang JOIN users u ON ku.email = u.email WHERE u.email = ? AND k.status = 1", email)
        if err != nil {
            log.Println("Query error:", err)
            http.Error(w, "Failed to query database", http.StatusInternalServerError)
            return
        }
        defer rows.Close()

        var kandangs []Kandang
        for rows.Next() {
            var kandang Kandang
            if err := rows.Scan(&kandang.ID, &kandang.Nama, &kandang.Tingkat, &kandang.Kapasitas, &kandang.Alamat, &kandang.Status); err != nil {
                log.Println("Scan error:", err)
                continue
            }
            kandangs = append(kandangs, kandang)
        }

        if kandangs == nil {
            kandangs = []Kandang{}
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(kandangs)
    }
}

func GetKandangByID(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Penjarangan struct {
			Id       int     `json:"id"`
			Date     string  `json:"date"`
			No       int     `json:"no"`
			Nama     string  `json:"nama"`
			Ekor     int     `json:"ekor"`
			Kg       float32 `json:"kg"`
			Bw       float32 `json:"bw"`
			Umur     float32 `json:"umur"`
			Rerata   float32 `json:"rerata"`
			Idlantai int     `json:"id_lantai"`
		}
		type Monit struct {
			Id_Monit       int     `json:"id"`
			Date           string  `json:"date"`
			Umur           int     `json:"umur"`
			Mati           int     `json:"mati"`
			Culing         int     `json:"culing"`
			Deplesi        int     `json:"deplesi"`
			DeplesiPersen  float32 `json:"deplesi_persen"`
			SisaAyam       int     `json:"sisa_ayam"`
			Dh             float32 `json:"dh"`
			Konsumsi       int     `json:"konsumsi"`
			CumPakan       int     `json:"cum_pakan"`
			Gr_Ekor_Hari   float32 `json:"gr_ekor_hari"`
			Cum_Kons_Pakan float32 `json:"cum_kons_pakan"`
			Karung         int     `json:"karung"`
			BbEkor         float32 `json:"bb_ekor"`
			Dg             float32 `json:"dg"`
			Adg_Pbbh       float32 `json:"adg_pbbh"`
			Tonase         float32 `json:"tonase"`
			Fcr            float32 `json:"fcr"`
			Ip             float32 `json:"ip"`
			Ep             float32 `json:"ep"`
			Id_Lantai      int     `json:"id_lantai"`
		}

		type Lantai struct {
			ID          int           `json:"id"`
			No_Lantai   int           `json:"no_lantai"`
			Jenis_DOC   string        `json:"jenis_doc"`
			Populasi    int           `json:"populasi"`
			Tgl_Masuk   string        `json:"tgl_masuk"`
			Monit       []Monit       `json:"monit"`
			OVK         []OVK         `json:"ovk"`
			Penjarangan []Penjarangan `json:"penjarangan"`
		}

		type Kandang struct {
			ID        int      `json:"id"`
			Nama      string   `json:"nama"`
			Tingkat   int      `json:"tingkat"`
			Kapasitas int      `json:"kapasitas"`
			Alamat    string   `json:"alamat"`
			Status    int     `json:"status"`
			Lantai    []Lantai `json:"lantai"`
		}

		vars := mux.Vars(r)
		kandangID := vars["id_kandang"]

		// Ambil data kandang
		var kandang Kandang
		err := db.QueryRow("SELECT id, nama, tingkat, kapasitas, alamat, status FROM kandang WHERE id = ?", kandangID).
			Scan(&kandang.ID, &kandang.Nama, &kandang.Tingkat, &kandang.Kapasitas, &kandang.Alamat, &kandang.Status)
		if err != nil {
			http.Error(w, "Failed to get kandang", http.StatusInternalServerError)
			return
		}

		// Ambil data lantai
		lantaiRows, err := db.Query("SELECT id_lantai, no_lantai, jenisdoc, populasi, tgl_masuk FROM lantai WHERE id_kandang = ?", kandangID)
		if err != nil {
			http.Error(w, "Failed to get lantai", http.StatusInternalServerError)
			return
		}
		defer lantaiRows.Close()

		var lantaiList []Lantai
		for lantaiRows.Next() {
			var lantai Lantai
			err := lantaiRows.Scan(&lantai.ID, &lantai.No_Lantai, &lantai.Jenis_DOC, &lantai.Populasi, &lantai.Tgl_Masuk)
			if err != nil {
				http.Error(w, "Failed to scan lantai", http.StatusInternalServerError)
				return
			}

			// Ambil data monit untuk lantai ini
			monitRows, err := db.Query("SELECT `id_monit`, `date`, `umur`, `mati`, `culing`, `deplesi`, `deplesi_persen`, `sisa_ayam`, `dh`, `konsumsi`, `cum_pakan`, `gr_ekor_hari`, `cum_kons_pakan`, `karung`, `bb_ekor`, `dg`, `adg_pbbh`, `tonase`, `fcr`, `ip`, `ep`, `id_lantai` FROM monit WHERE id_lantai = ?", lantai.ID)
			if err != nil {
				http.Error(w, "Failed to get monit", http.StatusInternalServerError)
				return
			}
			defer monitRows.Close()

			var monitList []Monit
			for monitRows.Next() {
				var monit Monit
				err := monitRows.Scan(&monit.Id_Monit, &monit.Date, &monit.Umur, &monit.Mati, &monit.Culing, &monit.Deplesi, &monit.DeplesiPersen, &monit.SisaAyam, &monit.Dh, &monit.Konsumsi, &monit.CumPakan, &monit.Gr_Ekor_Hari, &monit.Cum_Kons_Pakan, &monit.Karung, &monit.BbEkor, &monit.Dg, &monit.Adg_Pbbh, &monit.Tonase, &monit.Fcr, &monit.Ip, &monit.Ep, &monit.Id_Lantai)
				if err != nil {
					http.Error(w, "Failed to scan monit", http.StatusInternalServerError)
					return
				}
				monitList = append(monitList, monit)
			}
			lantai.Monit = monitList

			// Ambil data OVK untuk lantai ini
			ovkRows, err := db.Query("SELECT id, date, nama, jenis, dosis, jenis_dosis, id_lantai FROM ovk WHERE id_lantai = ?", lantai.ID)
			if err != nil {
				http.Error(w, "Failed to get OVK", http.StatusInternalServerError)
				return
			}
			defer ovkRows.Close()

			var ovkList []OVK
			for ovkRows.Next() {
				var ovk OVK
				err := ovkRows.Scan(&ovk.ID, &ovk.Date, &ovk.Nama, &ovk.Jenis, &ovk.Dosis, &ovk.Jenis_Dosis, &ovk.Id_Lantai)
				if err != nil {
					http.Error(w, "Failed to scan OVK", http.StatusInternalServerError)
					return
				}
				ovkList = append(ovkList, ovk)
			}
			lantai.OVK = ovkList

			// Ambil data penjarangan untuk lantai ini
			penjaranganRows, err := db.Query("SELECT id, date, no, nama, ekor, kg, bw, umur, rerata, id_lantai FROM penjarangan WHERE id_lantai = ?", lantai.ID)
			if err != nil {
				http.Error(w, "Failed to get penjarangan", http.StatusInternalServerError)
				return
			}
			defer penjaranganRows.Close()

			var penjaranganList []Penjarangan
			for penjaranganRows.Next() {
				var penjarangan Penjarangan
				err := penjaranganRows.Scan(&penjarangan.Id, &penjarangan.Date, &penjarangan.No, &penjarangan.Nama, &penjarangan.Ekor, &penjarangan.Kg, &penjarangan.Bw, &penjarangan.Umur, &penjarangan.Rerata, &penjarangan.Idlantai)
				if err != nil {
					http.Error(w, "Failed to scan penjarangan", http.StatusInternalServerError)
					return
				}
				penjaranganList = append(penjaranganList, penjarangan)
			}
			lantai.Penjarangan = penjaranganList

			lantaiList = append(lantaiList, lantai)
		}
		kandang.Lantai = lantaiList

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(kandang)
	}
}

func UpdateKandang(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id_kandang := vars["id_kandang"]

		kandangID, err := strconv.Atoi(id_kandang)
		if err != nil {
			http.Error(w, "Invalid kandang_id", http.StatusBadRequest)
			return
		}

		var kandang Kandang
		err = json.NewDecoder(r.Body).Decode(&kandang)
		if err != nil {
			fmt.Println("Error decoding JSON:", err)
			http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
			return
		}

		query := `UPDATE kandang SET nama= ?, tingkat= ?, kapasitas= ?, alamat= ? WHERE id= ?`
		result, err := db.Exec(query, kandang.Nama, kandang.Tingkat, kandang.Kapasitas, kandang.Alamat, kandangID)
		if err != nil {
			http.Error(w, "Gagal memperbarui data kandang: "+err.Error(), http.StatusInternalServerError)
			return
		}
		rows, _ := result.RowsAffected()
		fmt.Printf("Rows affected: %d\n", rows)
		if rows == 0 {
			http.Error(w, "Kandang tidak ditemukan atau tidak ada perubahan", http.StatusNotFound)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

func DeleteKandang(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id_kandang := vars["id_kandang"]

		kandangID, err := strconv.Atoi(id_kandang)
		if err != nil {
			http.Error(w, "Invalid kandang_id", http.StatusBadRequest)
			return
		}

		tx, err := db.Begin()
		if err != nil {
			http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
			return
		}

		// Hapus monit yang terkait dengan lantai di kandang ini
		_, err = tx.Exec(`DELETE FROM monit WHERE id_lantai IN (SELECT id_lantai FROM lantai WHERE id_kandang = ?)`, kandangID)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Gagal menghapus data monit: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Hapus lantai yang terkait dengan kandang ini
		_, err = tx.Exec(`DELETE FROM lantai WHERE id_kandang = ?`, kandangID)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Gagal menghapus data lantai: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Hapus kandang
		result, err := tx.Exec(`DELETE FROM kandang WHERE id=?`, kandangID)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Gagal menghapus data kandang: "+err.Error(), http.StatusInternalServerError)
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			tx.Rollback()
			http.Error(w, "Kandang tidak ditemukan", http.StatusNotFound)
			return
		}

		if err := tx.Commit(); err != nil {
			http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

func Inisiasi(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type Lantai struct {
			ID        int     `json:"id"`
			No_Lantai int     `json:"no_lantai"`
			Jenis_DOC string  `json:"jenisDOC"`
			Populasi  int     `json:"populasi"`
			Tgl_Masuk string  `json:"tgl_masuk"`
			Monit     []Monit `json:"monit"` // Monit harus menjadi bagian dari Lantai
		}

		var requestData struct {
			Kandang Kandang  `json:"kandang"`
			Lantai  []Lantai `json:"lantai"`
			User	User   `json:"user"`
		}

		// Decode JSON dari request body
		if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
			http.Error(w, "Failed to decode request body", http.StatusBadRequest)
			log.Println("Error decoding request body:", err)
			return
		}
		email := r.URL.Query().Get("email")
		log.Println("Request email:", email)

		log.Println("Request data:", requestData)

		// Mulai transaksi
		tx, err := db.Begin()
		if err != nil {
			http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
			log.Println("Error starting transaction:", err)
			return
		}

		// Simpan data kandang
		var kandangID int64
		queryKandang := "INSERT INTO kandang (nama, tingkat, kapasitas, alamat, status) VALUES (?, ?, ?, ?, ?)"
		result, err := tx.Exec(queryKandang, requestData.Kandang.Nama, requestData.Kandang.Tingkat, requestData.Kandang.Kapasitas, requestData.Kandang.Alamat, 0)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Failed to insert kandang", http.StatusInternalServerError)
			log.Println("Error inserting kandang:", err)
			return
		}
		kandangID, _ = result.LastInsertId()

		//simpan data userkandang
		queryUserkandang := "INSERT INTO userkandang (email, kandang) VALUES (?, ?)"
		_, err = tx.Exec(queryUserkandang, email, kandangID)
		log.Println("Inserting userkandang with email:", email, "and kandangID:", kandangID)
		if err != nil {
			tx.Rollback()
			http.Error(w, "Failed to insert userkandang", http.StatusInternalServerError)
			log.Println("Error inserting userkandang:", err)
			return
		}

		// Simpan data lantai
		queryLantai := "INSERT INTO lantai (no_lantai, jenisdoc, populasi, tgl_masuk, id_kandang) VALUES (?, ?, ?, ?, ?)"
		for _, lantai := range requestData.Lantai {
			result, err := tx.Exec(queryLantai, lantai.No_Lantai, lantai.Jenis_DOC, lantai.Populasi, lantai.Tgl_Masuk, kandangID)
			if err != nil {
				tx.Rollback()
				http.Error(w, "Failed to insert lantai", http.StatusInternalServerError)
				log.Println("Error inserting lantai:", err)
				return
			}
			lantaiID, _ := result.LastInsertId()

			queryMonit := "INSERT INTO monit (umur, mati, culing, deplesi, deplesi_persen, sisa_ayam, dh, konsumsi, cum_pakan, gr_ekor_hari, cum_kons_pakan, karung, bb_ekor, dg, adg_pbbh, tonase, fcr, ip, ep, id_lantai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
			log.Println("Starting to insert monit data...")
			for _, monit := range lantai.Monit {
				log.Printf("Processing monit: %+v\n", monit)

				deplesi := monit.Mati + monit.Culing
				log.Printf("Calculated deplesi: %d\n", deplesi)

				deplesiPersen := float32(deplesi) / float32(lantai.Populasi) * 100
				log.Printf("Calculated deplesiPersen: %.2f\n", deplesiPersen)

				monit.SisaAyam = lantai.Populasi - int(deplesi)
				monit.Dh = 0
				monit.Umur = 0
				monit.CumPakan = 0
				monit.Gr_Ekor_Hari = 0
				monit.Cum_Kons_Pakan = 0
				monit.Karung = 0
				monit.Dg = 0
				monit.Adg_Pbbh = 0
				monit.Tonase = float32(monit.BbEkor) * float32(monit.SisaAyam) / 1000 // Tonase dalam kg
				monit.Fcr = 0
				monit.Ip = 0
				monit.Ep = 0

				log.Printf("Calculated monit values: %+v\n", monit)

				_, err := tx.Exec(queryMonit, monit.Umur, monit.Mati, monit.Culing, deplesi, deplesiPersen, monit.SisaAyam, monit.Dh, monit.Konsumsi, monit.CumPakan, monit.Gr_Ekor_Hari, monit.Cum_Kons_Pakan, monit.Karung, monit.BbEkor, monit.Dg, monit.Adg_Pbbh, monit.Tonase, monit.Fcr, monit.Ip, monit.Ep, lantaiID)
				if err != nil {
					log.Println("Error executing query for monit:", err)
					tx.Rollback()
					http.Error(w, "Failed to insert monit", http.StatusInternalServerError)
					return
				}
				log.Println("Successfully inserted monit data.")
			}
		}

		// Commit transaksi
		if err := tx.Commit(); err != nil {
			http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
			log.Println("Error committing transaction:", err)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("Data berhasil disimpan"))
	}
}
