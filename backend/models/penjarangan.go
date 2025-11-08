package models

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

type Penjarangan struct {
	ID       int     `json:"id"`
	Date     string  `json:"date"`
	No       int     `json:"no"`
	Nama     string  `json:"nama"`
	Ekor     int     `json:"ekor"`
	Kg       float64 `json:"kg"`
	Bw       float64 `json:"bw"`
	Umur     float64 `json:"umur"`
	Rerata   float64 `json:"rerata"`
	Idlantai int     `json:"id_lantai"`
}

func GetPenjarangan(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id_lantai := vars["id_lantai"]
		if id_lantai == "" {
			http.Error(w, "Lantai ID cannot be empty", http.StatusBadRequest)
			return
		}
		var penjarangan Penjarangan
		query := `SELECT * FROM penjarangan WHERE id_lantai = ?`
		err := db.QueryRow(query, id_lantai).Scan(
			&penjarangan.ID,
			&penjarangan.Date,
			&penjarangan.No,
			&penjarangan.Nama,
			&penjarangan.Ekor,
			&penjarangan.Kg,
			&penjarangan.Bw,
			&penjarangan.Umur,
			&penjarangan.Rerata,
			&penjarangan.Idlantai,
		)
		if err == sql.ErrNoRows {
			http.Error(w, "Penjarangan not found", http.StatusNotFound)
			return
		}
		if err != nil {
			http.Error(w, "Failed to retrieve Penjarangan: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(penjarangan)
	}
}

func GetPenjaranganById(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]
		if id == "" {
			http.Error(w, "Penjarangan ID cannot be empty", http.StatusBadRequest)
			return
		}
		var penjarangan Penjarangan
		query := `SELECT * FROM penjarangan WHERE id = ?`
		err := db.QueryRow(query, id).Scan(
			&penjarangan.ID,
			&penjarangan.Date,
			&penjarangan.No,
			&penjarangan.Nama,
			&penjarangan.Ekor,
			&penjarangan.Kg,
			&penjarangan.Bw,
			&penjarangan.Umur,
			&penjarangan.Rerata,
			&penjarangan.Idlantai,
		)
		if err == sql.ErrNoRows {
			http.Error(w, "Penjarangan not found", http.StatusNotFound)
			return
		}
		if err != nil {
			http.Error(w, "Failed to retrieve Penjarangan: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(penjarangan)
	}
}

func CreatePenjarangan(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var penjarangan Penjarangan
		if err := json.NewDecoder(r.Body).Decode(&penjarangan); err != nil {
			http.Error(w, "Invalid request payload: "+err.Error(), http.StatusBadRequest)
			return
		}

		penjarangan.Kg = float64(penjarangan.Ekor) * float64(penjarangan.Bw)

		// Insert data baru
		query := `INSERT INTO penjarangan (no, nama, ekor, kg, bw, umur, rerata, id_lantai) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		result, err := db.Exec(query, penjarangan.No, penjarangan.Nama, penjarangan.Ekor, penjarangan.Kg, penjarangan.Bw, penjarangan.Umur, 0, penjarangan.Idlantai)
		if err != nil {
			http.Error(w, "Failed to create Penjarangan: "+err.Error(), http.StatusInternalServerError)
			return
		}

		id, err := result.LastInsertId()
		if err != nil {
			http.Error(w, "Failed to retrieve last insert ID: "+err.Error(), http.StatusInternalServerError)
			return
		}
		penjarangan.ID = int(id)

		// Hitung rerata untuk id_lantai terkait
		rows, err := db.Query("SELECT umur, ekor FROM penjarangan WHERE id_lantai = ?", penjarangan.Idlantai)
		if err != nil {
			http.Error(w, "Failed to calculate rerata: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var totalUmurEkor float64
		var totalEkor int
		for rows.Next() {
			var umur float64
			var ekor int
			if err := rows.Scan(&umur, &ekor); err != nil {
				http.Error(w, "Failed to scan for rerata: "+err.Error(), http.StatusInternalServerError)
				return
			}
			totalUmurEkor += umur * float64(ekor)
			totalEkor += ekor
		}

		var rerata float64
		if totalEkor > 0 {
			rerata = totalUmurEkor / float64(totalEkor)
		}

		// Update rerata pada record yang baru di-insert
		_, err = db.Exec("UPDATE penjarangan SET rerata = ? WHERE id = ?", rerata, penjarangan.ID)
		if err != nil {
			http.Error(w, "Failed to update rerata: "+err.Error(), http.StatusInternalServerError)
			return
		}
		penjarangan.Rerata = rerata

		monitrow, err := db.Query("SELECT id_monit, sisa_ayam, bb_ekor, dh, fcr from monit where id_lantai = ? ORDER BY umur DESC limit 1", penjarangan.Idlantai)
		if err != nil {
			http.Error(w, "Failed to get latest monit: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer monitrow.Close()
		var idMonit, sisaAyam int
		var bbEkor, dh, fcr float64

		if monitrow.Next() {
			if err := monitrow.Scan(&idMonit, &sisaAyam, &bbEkor, &dh, &fcr); err != nil {
				http.Error(w, "Failed to scan latest monit: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}
		sisaAyam -= penjarangan.Ekor
		ipterbaru := (bbEkor / 1000) * dh / (fcr * rerata) * 100
		_, err = db.Exec("UPDATE monit SET sisa_ayam =?, ip =? WHERE id_monit =?", sisaAyam, ipterbaru, idMonit)
		if err != nil {
			http.Error(w, "Failed to update sisa ayam and IP in monit: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(penjarangan)
	}
}

func UpdatePenjarangan(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]
		if id == "" {
			http.Error(w, "Penjarangan ID cannot be empty", http.StatusBadRequest)
			return
		}

		var penjarangan Penjarangan
		if err := json.NewDecoder(r.Body).Decode(&penjarangan); err != nil {
			http.Error(w, "Invalid request payload: "+err.Error(), http.StatusBadRequest)
			return
		}

		penjarangan.Kg = float64(penjarangan.Ekor) * float64(penjarangan.Bw)

		// Update data penjarangan (set rerata = 0 sementara)
		query := `UPDATE penjarangan SET no = ?, nama = ?, ekor = ?, kg = ?, bw = ?, umur = ?, rerata = ?, id_lantai = ? WHERE id = ?`
		_, err := db.Exec(query, penjarangan.No, penjarangan.Nama, penjarangan.Ekor, penjarangan.Kg, penjarangan.Bw, penjarangan.Umur, 0, penjarangan.Idlantai, id)
		if err != nil {
			http.Error(w, "Failed to update Penjarangan: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Hitung rerata baru untuk seluruh baris pada id_lantai terkait, urutkan ASC (misal berdasarkan id)
		rows, err := db.Query("SELECT id, umur, ekor FROM penjarangan WHERE id_lantai = ? ORDER BY id ASC", penjarangan.Idlantai)
		if err != nil {
			http.Error(w, "Failed to calculate rerata: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		type rowData struct {
			ID   int
			Umur float64
			Ekor int
		}
		var allRows []rowData
		for rows.Next() {
			var r rowData
			if err := rows.Scan(&r.ID, &r.Umur, &r.Ekor); err != nil {
				http.Error(w, "Failed to scan for rerata: "+err.Error(), http.StatusInternalServerError)
				return
			}
			allRows = append(allRows, r)
		}

		// Hitung rerata kumulatif dan update setiap baris
		var totalUmurEkor float64
		var totalEkor int
		var rerata float64
		for _, r := range allRows {
			totalUmurEkor += r.Umur * float64(r.Ekor)
			totalEkor += r.Ekor
			if totalEkor > 0 {
				rerata = totalUmurEkor / float64(totalEkor)
			}
			_, err = db.Exec("UPDATE penjarangan SET rerata = ? WHERE id = ?", rerata, r.ID)
			if err != nil {
				http.Error(w, "Failed to update rerata: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}

		penjarangan.Rerata = rerata
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(penjarangan)

		// Setelah create/update/delete penjarangan atau update culing/mati monit

		// 1. Ambil populasi awal
		var populasiAwal int
		err = db.QueryRow("SELECT populasi FROM lantai WHERE id_lantai = ?", penjarangan.Idlantai).Scan(&populasiAwal)
		if err != nil {
			http.Error(w, "Failed to get populasi awal: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// 2. Ambil semua penjarangan
		type Penj struct {
			Umur float64
			Ekor int
		}
		var penjs []Penj
		rowsPenj, err := db.Query("SELECT umur, ekor FROM penjarangan WHERE id_lantai = ? ORDER BY umur ASC", penjarangan.Idlantai)
		if err != nil {
			http.Error(w, "Failed to get penjarangan: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsPenj.Close()
		for rowsPenj.Next() {
			var p Penj
			if err := rowsPenj.Scan(&p.Umur, &p.Ekor); err != nil {
				http.Error(w, "Failed to scan penjarangan: "+err.Error(), http.StatusInternalServerError)
				return
			}
			penjs = append(penjs, p)
		}

		// 3. Loop monit dan update sisa ayam
		rowsMonit, err := db.Query("SELECT id_monit, umur, culing, mati FROM monit WHERE id_lantai = ? ORDER BY umur DESC", penjarangan.Idlantai)
		if err != nil {
			http.Error(w, "Failed to get monit: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsMonit.Close()

		for rowsMonit.Next() {
			var id int
			var umur float64
			var culing, mati int
			if err := rowsMonit.Scan(&id, &umur, &culing, &mati); err != nil {
				http.Error(w, "Failed to scan monit: "+err.Error(), http.StatusInternalServerError)
				return
			}

			// Hitung total penjarangan sampai umur monit ini
			totalPenjarangan := 0
			for _, p := range penjs {
				if p.Umur <= umur {
					totalPenjarangan += p.Ekor
				} else {
					break
				}
			}

			// Hitung total culing dan mati sampai umur monit ini
			// (Jika ingin kumulatif, perlu query/loop sebelumnya, atau simpan totalCuling/totalMati kumulatif)
			// Jika culing/mati hanya pada baris ini, gunakan:
			sisaAyam := populasiAwal - totalPenjarangan - culing - mati

			_, err = db.Exec("UPDATE monit SET sisa_ayam = ? WHERE id_monit = ?", sisaAyam, id)
			if err != nil {
				http.Error(w, "Failed to update sisa_ayam monit: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}

		// update ip di monitoring
		rowsMonit, err = db.Query("SELECT id_monit, bb_ekor, dh, fcr FROM monit WHERE id_lantai = ? ORDER BY umur DESC", penjarangan.Idlantai)
		if err != nil {
			http.Error(w, "Failed to get monit: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsMonit.Close()

		for rowsMonit.Next() {
			var id int
			var bbEkor, dh, fcr float64
			if err := rowsMonit.Scan(&id, &bbEkor, &dh, &fcr); err != nil {
				http.Error(w, "Failed to scan monit: "+err.Error(), http.StatusInternalServerError)
				return
			}

			ip := (float32(bbEkor) / 1000) * float32(dh) / (float32(fcr) * float32(rerata)) * 100
			// Update IP di monitoring
			_, err = db.Exec("UPDATE monit SET ip = ? WHERE id_monit = ?", ip, id)
			if err != nil {
				http.Error(w, "Failed to update IP in monit: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}
}

func DeletePenjarangan(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]
		if id == "" {
			http.Error(w, "Penjarangan ID cannot be empty", http.StatusBadRequest)
			return
		}

		// Ambil id_lantai dan umur penjarangan sebelum delete
		var id_monit, id_lantai, umur, ekor, sisaAyam int
		var bbEkor, dh, fcr, rerata, ip float64
		err := db.QueryRow("SELECT id_lantai, umur, ekor FROM penjarangan WHERE id = ?", id).Scan(&id_lantai, &umur, &ekor)
		if err != nil {
			http.Error(w, "Failed to get id_lantai/umur: "+err.Error(), http.StatusInternalServerError)
			return
		}

		err = db.QueryRow("select id_monit, sisa_ayam, bb_ekor, dh, fcr from monit where umur = ? and id_lantai = ?", umur, id_lantai).Scan(&id_monit, &sisaAyam, &bbEkor, &dh, &fcr)
		if err != nil {
			http.Error(w, "Failed to get sisa ayam: "+err.Error(), http.StatusInternalServerError)
			return
		}

		sisaAyam += ekor

		err = db.QueryRow("select rerata from penjarangan where id < ? order by id desc limit 1", id).Scan(&rerata)
		if err != nil {
			if err == sql.ErrNoRows {
				rerata = 0 // Jika tidak ada penjarangan sebelumnya, set rerata ke 0
			} else {
				http.Error(w, "Failed to get rerata: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}

		if rerata == 0 {
			ip = (bbEkor / 1000) * dh / (fcr * float64(umur)) * 100
		} else if rerata != 0 {
			ip = (bbEkor / 1000) * dh / (fcr * float64(rerata)) * 100
		}

		// Update sisa ayam dan IP di monit
		_, err = db.Exec("UPDATE monit SET sisa_ayam = ?, ip = ? WHERE id_monit = ?", sisaAyam, ip, id_monit)
		if err != nil {
			http.Error(w, "Failed to update sisa ayam and IP in monit: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Hapus penjarangan
		_, err = db.Exec("DELETE FROM penjarangan WHERE id = ?", id)
		if err != nil {
			http.Error(w, "Failed to delete Penjarangan: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}