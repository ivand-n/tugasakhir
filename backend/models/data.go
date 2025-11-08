package models

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type Data struct {
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

// get all data
func GetDatas(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		idLantai := vars["id_lantai"]
		rows, err := db.Query("SELECT * FROM monit WHERE id_lantai = ?", idLantai)
		if err != nil {
			log.Println(err)
		}
		defer rows.Close()

		monit := []Data{} // slice of Data
		for rows.Next() {
			var u Data
			if err := rows.Scan(&u.Id_Monit, &u.Umur, &u.Mati, &u.Culing, &u.Deplesi, &u.DeplesiPersen, &u.SisaAyam, &u.Dh, &u.Konsumsi, &u.CumPakan, &u.Gr_Ekor_Hari, &u.Cum_Kons_Pakan, &u.Karung, &u.BbEkor, &u.Adg_Pbbh, &u.Fcr, &u.Ip, &u.Id_Lantai); err != nil {
				log.Println(err)
			}
			monit = append(monit, u)
		}
		if err := rows.Err(); err != nil {
			log.Println(err)
		}

		json.NewEncoder(w).Encode(monit)

	}
}

// get data by id
func GetData(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		idLantai := vars["id_lantai"] // Menggunakan "id" untuk id_lantai dari URL
		idMonit := vars["id_monit"]   // Menggunakan "id_monit" untuk id_monit dari URL

		rows, err := db.Query("SELECT * FROM monit WHERE id_lantai = ? AND id_monit = ?", idLantai, idMonit)
		if err != nil {
			http.Error(w, "Failed to query database", http.StatusInternalServerError)
			log.Println("Query error:", err)
			return
		}
		defer rows.Close()

		monit := []Data{} // Slice untuk menyimpan hasil query
		for rows.Next() {
			var u Data
			if err := rows.Scan(&u.Id_Monit, &u.Date, &u.Umur, &u.Mati, &u.Culing, &u.Deplesi, &u.DeplesiPersen, &u.SisaAyam, &u.Dh, &u.Konsumsi, &u.CumPakan, &u.Gr_Ekor_Hari, &u.Cum_Kons_Pakan, &u.Karung, &u.BbEkor, &u.Dg, &u.Adg_Pbbh, &u.Tonase, &u.Fcr, &u.Ip, &u.Ep, &u.Id_Lantai); err != nil {
				http.Error(w, "Failed to scan row", http.StatusInternalServerError)
				log.Println("Scan error:", err)
				return
			}
			monit = append(monit, u)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, "Error iterating rows", http.StatusInternalServerError)
			log.Println("Rows iteration error:", err)
			return
		}

		// Encode hasil query ke dalam JSON dan kirimkan sebagai respons
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(monit)
	}
}

// create data
func CreateData(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		idLantai := vars["id_lantai"] // Menggunakan "id" untuk id_lantai dari URL
		var input struct {
			Mati     int     `json:"mati"`
			Culing   int     `json:"culing"`
			Konsumsi int     `json:"konsumsi"`
			BbEkor   float32 `json:"bb_ekor"`
		}
		err := json.NewDecoder(r.Body).Decode(&input)
		if err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			log.Println("Error decoding input:", err)
			return
		}

		// Ambil total populasi
		var total int
		err = db.QueryRow("SELECT populasi FROM lantai WHERE id_lantai = ?", idLantai).Scan(&total)
		if err != nil {
			http.Error(w, "Failed to fetch populasi", http.StatusInternalServerError)
			log.Println("Error fetching populasi:", err)
			return
		}

		// Ambil umur terakhir
		var lastUmur int
		err = db.QueryRow("SELECT umur FROM monit WHERE id_lantai = ? ORDER BY id_monit DESC LIMIT 1", idLantai).Scan(&lastUmur)
		if err == sql.ErrNoRows {
			// Jika tidak ada data sebelumnya, ini adalah baris pertama
			lastUmur = -1
		} else if err != nil {
			http.Error(w, "Failed to fetch last umur", http.StatusInternalServerError)
			log.Println("Error fetching last umur:", err)
			return
		}

		// Generate umur baru
		newUmur := lastUmur + 1

		var sisa int
		err = db.QueryRow("SELECT sisa_ayam FROM monit WHERE id_lantai = ? ORDER BY id_monit DESC LIMIT 1", idLantai).Scan(&sisa)
		if err != nil {
			err = db.QueryRow("SELECT populasi FROM lantai WHERE id_lantai = ?", idLantai).Scan(&sisa)
			if err != nil {
				http.Error(w, "Failed to get populasi", http.StatusInternalServerError)
				log.Println("Error getting populasi:", err)
				return
			}
		}

		var prevdeplesi int
		err = db.QueryRow("SELECT deplesi FROM monit WHERE id_lantai = ? ORDER BY id_monit DESC LIMIT 1", idLantai).Scan(&prevdeplesi)
		if err == sql.ErrNoRows {
			// Jika tidak ada baris sebelumnya, ini adalah baris pertama
			prevdeplesi = 0
		} else if err != nil {
			http.Error(w, "Failed to check previous data", http.StatusInternalServerError)
			log.Println("Error checking previous data:", err)
			return
		}

		var previousCumPakan int
		err = db.QueryRow("SELECT cum_pakan FROM monit WHERE id_lantai = ? ORDER BY id_monit DESC LIMIT 1", idLantai).Scan(&previousCumPakan)
		if err == sql.ErrNoRows {
			// Jika tidak ada baris sebelumnya, ini adalah baris pertama
			previousCumPakan = 0
		} else if err != nil {
			http.Error(w, "Failed to check previous data", http.StatusInternalServerError)
			log.Println("Error checking previous data:", err)
			return
		}

		var prevadg float32
		err = db.QueryRow("SELECT adg_pbbh FROM monit WHERE id_lantai = ? ORDER BY id_monit DESC LIMIT 1", idLantai).Scan(&prevadg)
		if err == sql.ErrNoRows {
			// Jika tidak ada baris sebelumnya, ini adalah baris pertama
			prevadg = 0
		} else if err != nil {
			http.Error(w, "Failed to check previous data", http.StatusInternalServerError)
			log.Println("Error checking previous data:", err)
			return
		}

		var prevbb float32
		err = db.QueryRow("SELECT bb_ekor FROM monit WHERE id_lantai = ? ORDER BY id_monit DESC LIMIT 1", idLantai).Scan(&prevbb)
		if err == sql.ErrNoRows {
			prevbb = 0
		} else if err != nil {
			http.Error(w, "Failed to check previous data bb ekor", http.StatusInternalServerError)
			log.Println("Error checking previous data:", err)
			return
		}

		var tonaseawal float32
		rows, err := db.Query("SELECT tonase FROM monit WHERE id_lantai = ? ORDER BY id_monit ASC LIMIT 2", idLantai)
		if err != nil {
			http.Error(w, "Failed to check previous data tonase", http.StatusInternalServerError)
			log.Println("Error checking previous data:", err)
			return
		}
		defer rows.Close()

		found := false
		if rows.Next() {
			err = rows.Scan(&tonaseawal)
			if err != nil {
				tonaseawal = 0
			}
			found = true
		}
		if tonaseawal == 0 && rows.Next() {
			// Ambil tonase baris kedua jika baris pertama 0
			err = rows.Scan(&tonaseawal)
			if err != nil {
				tonaseawal = 0
			}
		}
		if !found {
			tonaseawal = 0
		}

		var totalekorpenjarangan int
		err = db.QueryRow("SELECT coalesce(sum(ekor),0) FROM penjarangan WHERE id_lantai = ? AND umur < ?", idLantai, newUmur).Scan(&totalekorpenjarangan)
		if err != nil {
			http.Error(w, "Failed to get total ekor penjarangan", http.StatusInternalServerError)
			log.Println("Error getting total ekor penjarangan:", err)
			return
		}

		// calculate
		deplesi := input.Mati + input.Culing + prevdeplesi
		deplesiPersen := float32(deplesi*100) / float32(total)
		sisaAyam := (sisa) - (input.Culing + input.Mati)
		dh := (float32(sisaAyam) + float32(totalekorpenjarangan)) / float32(total) * 100
		cumPakan := previousCumPakan + input.Konsumsi
		karung := cumPakan / 50
		grEkorHari := float32(input.Konsumsi) / float32(sisaAyam) * 1000
		cumKonsPakan := float32(cumPakan) / float32(sisaAyam) * 1000
		dg := float32(input.BbEkor - prevbb)
		adgPbbh := (float32(input.BbEkor) - prevbb) / float32(newUmur)
		if prevbb == 0 {
			adgPbbh = 0 // Jika adg awal adalah 0, adgPbbh juga harus 0 untuk menghindari pembagian dengan nol
		}
		tonase := float32(input.BbEkor) * (float32(sisaAyam)) / 1000 // Tonase dalam kg
		fcr := float64(cumKonsPakan) / float64(input.BbEkor)
		ip := (float32(input.BbEkor) / 1000) * float32(dh) / (float32(fcr) * float32(newUmur)) * 100
		if adgPbbh == 0 {
			ip = 0 // Jika adg awal adalah 0, ip juga harus 0 untuk menghindari pembagian dengan nol
		}
		ep := (tonase - tonaseawal) / float32(cumPakan) * 100
		if tonaseawal == 0 {
			ep = 0 // Jika tonase awal adalah 0, ep juga harus 0 untuk menghindari pembagian dengan nol
		}

		if lastUmur == -1 {
			newUmur = 0
			input.Mati = 0
			input.Culing = 0
			input.Konsumsi = 0
			deplesi = 0
			deplesiPersen = 0
			sisaAyam = total - (input.Culing + input.Mati)
			dh = 0
			cumPakan = 0
			grEkorHari = 0
			cumKonsPakan = 0
			karung = 0
			dg = 0
			adgPbbh = 0
			fcr = 0
			ip = 0
			ep = 0
		}

		// insert into database
		var result sql.Result
		result, err = db.Exec(`
			INSERT INTO monit (
				umur, mati, culing, deplesi, deplesi_persen, sisa_ayam, dh, konsumsi, cum_pakan, gr_ekor_hari, cum_kons_pakan, karung, bb_ekor, dg, adg_pbbh, tonase, fcr, ip, ep, id_lantai
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			newUmur, input.Mati, input.Culing, deplesi, deplesiPersen, sisaAyam, dh, input.Konsumsi, cumPakan, grEkorHari, cumKonsPakan, karung, input.BbEkor, dg, adgPbbh, tonase, fcr, ip, ep, idLantai)
		if err != nil {
			log.Println(err)
		}

		// get the last inserted id
		lastInsertID, err := result.LastInsertId()
		if err != nil {
			http.Error(w, "Failed to retrieve last insert ID", http.StatusInternalServerError)
			log.Println("Error getting last insert ID:", err)
			return
		}

		// int id lantai
		idLantaiInt, err := strconv.Atoi(idLantai)
		if err != nil {
			http.Error(w, "Invalid id_lantai", http.StatusBadRequest)
			log.Println("Error converting id_lantai to int:", err)
			return
		}

		// prepare response
		response := Data{
			Id_Monit:       int(lastInsertID),
			Umur:           newUmur,
			Mati:           input.Mati,
			Culing:         input.Culing,
			Deplesi:        deplesi,
			DeplesiPersen:  deplesiPersen,
			SisaAyam:       sisaAyam,
			Dh:             dh,
			Konsumsi:       input.Konsumsi,
			CumPakan:       cumPakan,
			Gr_Ekor_Hari:   grEkorHari,
			Cum_Kons_Pakan: cumKonsPakan,
			Karung:         karung,
			BbEkor:         input.BbEkor,
			Adg_Pbbh:       adgPbbh,
			Fcr:            fcr,
			Ip:             ip,
			Id_Lantai:      idLantaiInt,
		}

		json.NewEncoder(w).Encode(response)
	}
}

// update data
func UpdateData(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		idMonit := vars["id_monit"]
		idLantai := vars["id_lantai"]
		log.Printf("Starting update for id_monit: %s, id_lantai: %s", idMonit, idLantai)

		var input struct {
			Umur     int     `json:"umur"`
			Mati     int     `json:"mati"`
			Culing   int     `json:"culing"`
			Konsumsi int     `json:"konsumsi"`
			BbEkor   float32 `json:"bb_ekor"`
		}
		json.NewDecoder(r.Body).Decode(&input)
		log.Printf("Input received: %+v", input)

		var lastUmur int
		err := db.QueryRow("SELECT umur FROM monit WHERE id_lantai = ? ORDER BY id_monit DESC LIMIT 1", idLantai).Scan(&lastUmur)
		if err == sql.ErrNoRows {
			// Jika tidak ada data sebelumnya, ini adalah baris pertama
			lastUmur = 0
		} else if err != nil {
			http.Error(w, "Failed to fetch last umur", http.StatusInternalServerError)
			log.Println("Error fetching last umur:", err)
			return
		}
		// Ambil total populasi
		var total int
		err = db.QueryRow("SELECT populasi FROM lantai WHERE id_lantai = ?", idLantai).Scan(&total)
		if err != nil {
			http.Error(w, "Failed to fetch populasi", http.StatusInternalServerError)
			log.Println("Error fetching populasi:", err)
			return
		}
		log.Printf("Total populasi: %d", total)

		var sisa int
		err = db.QueryRow("SELECT sisa_ayam FROM monit WHERE id_lantai = ? AND id_monit < ? ORDER BY id_monit DESC LIMIT 1", idLantai, idMonit).Scan(&sisa)
		if err != nil {
			err = db.QueryRow("SELECT populasi FROM lantai WHERE id_lantai = ?", idLantai).Scan(&sisa)
			if err != nil {
				http.Error(w, "Failed to get populasi", http.StatusInternalServerError)
				log.Println("Error getting populasi:", err)
				return
			}
		}
		log.Printf("Initial sisa ayam: %d", sisa)

		// Ambil cum_pakan sebelumnya
		var previousCumPakan int
		err = db.QueryRow("SELECT cum_pakan FROM monit WHERE id_monit < ? AND id_lantai = ? ORDER BY id_monit DESC LIMIT 1", idMonit, idLantai).Scan(&previousCumPakan)
		if err == sql.ErrNoRows {
			previousCumPakan = 0
		} else if err != nil {
			http.Error(w, "Failed to fetch previous cum_pakan", http.StatusInternalServerError)
			log.Println("Error fetching previous cum_pakan:", err)
			return
		}
		log.Printf("Previous cum_pakan: %d", previousCumPakan)

		// Ambil deplesi sebelumnya
		var prevDeplesi int
		err = db.QueryRow("SELECT deplesi FROM monit WHERE id_monit < ? AND id_lantai = ? ORDER BY id_monit DESC LIMIT 1", idMonit, idLantai).Scan(&prevDeplesi)
		if err == sql.ErrNoRows {
			prevDeplesi = 0
		} else if err != nil {
			http.Error(w, "Failed to fetch previous deplesi", http.StatusInternalServerError)
			log.Println("Error fetching previous deplesi:", err)
			return
		}
		log.Printf("Previous deplesi: %d", prevDeplesi)

		// Ambil semua baris mulai dari id_monit yang diperbarui
		rows, err := db.Query(`
            SELECT id_monit, umur, mati, culing, konsumsi, bb_ekor 
            FROM monit 
            WHERE id_lantai = ? AND id_monit >= ? 
            ORDER BY id_monit ASC`, idLantai, idMonit)
		if err != nil {
			http.Error(w, "Failed to fetch rows for update", http.StatusInternalServerError)
			log.Println("Error fetching rows for update:", err)
			return
		}
		defer rows.Close()

		var prevadg float32
		err = db.QueryRow("SELECT adg_pbbh FROM monit WHERE id_lantai = ? AND id_monit < ? ORDER BY id_monit DESC LIMIT 1", idLantai, idMonit).Scan(&prevadg)
		if err == sql.ErrNoRows {
			// Jika tidak ada baris sebelumnya, ini adalah baris pertama
			prevadg = 0
		} else if err != nil {
			http.Error(w, "Failed to check previous data", http.StatusInternalServerError)
			log.Println("Error checking previous data:", err)
			return
		}

		var prevbb float32
		err = db.QueryRow("SELECT bb_ekor FROM monit WHERE id_lantai = ? and id_monit < ? ORDER BY id_monit DESC LIMIT 1", idLantai, idMonit).Scan(&prevbb)
		if err == sql.ErrNoRows {
			prevbb = 0
		} else if err != nil {
			http.Error(w, "Failed to check previous data bb ekor", http.StatusInternalServerError)
			log.Println("Error checking previous data:", err)
			return
		}

		var tonaseawal float32
		rows, err = db.Query("SELECT tonase FROM monit WHERE id_lantai = ? ORDER BY id_monit ASC LIMIT 2", idLantai)
		if err != nil {
			http.Error(w, "Failed to check previous data tonase", http.StatusInternalServerError)
			log.Println("Error checking previous data:", err)
			return
		}
		defer rows.Close()

		found := false
		if rows.Next() {
			err = rows.Scan(&tonaseawal)
			if err != nil {
				tonaseawal = 0
			}
			found = true
		}
		if tonaseawal == 0 && rows.Next() {
			// Ambil tonase baris kedua jika baris pertama 0
			err = rows.Scan(&tonaseawal)
			if err != nil {
				tonaseawal = 0
			}
		}
		if !found {
			tonaseawal = 0
		}

		// Iterasi melalui semua baris yang perlu diperbarui
		for rows.Next() {
			var row struct {
				IdMonit  int
				Umur     int
				Mati     int
				Culing   int
				Konsumsi int
				BbEkor   float32
			}
			if err := rows.Scan(&row.IdMonit, &row.Umur, &row.Mati, &row.Culing, &row.Konsumsi, &row.BbEkor); err != nil {
				http.Error(w, "Failed to scan row", http.StatusInternalServerError)
				log.Println("Error scanning row:", err)
				return
			}
			log.Printf("Processing row: %+v", row)

			// Jika ini adalah baris yang diperbarui langsung (id_monit == idMonit), gunakan input
			idMonitInt, err := strconv.Atoi(idMonit)
			if err != nil {
				http.Error(w, "Invalid id_monit", http.StatusBadRequest)
				log.Println("Error converting id_monit to int:", err)
				return
			}
			if row.IdMonit == idMonitInt {
				log.Printf("Updating row with id_monit: %d", row.IdMonit)
				row.Umur = input.Umur
				row.Mati = input.Mati
				row.Culing = input.Culing
				row.Konsumsi = input.Konsumsi
				row.BbEkor = input.BbEkor
			}

			penjrows, err := db.Query("select ekor from penjarangan where id_lantai = ?", idLantai)
			if err != nil {
				http.Error(w, "Failed to fetch penjarangan data", http.StatusInternalServerError)
				log.Println("Error fetching penjarangan data:", err)
				return
			}
			defer penjrows.Close()
			var ekorjual int
			for penjrows.Next() {
				var ekor int
				if err := penjrows.Scan(&ekor); err != nil {
					http.Error(w, "Failed to scan penjarangan row", http.StatusInternalServerError)
					log.Println("Error scanning penjarangan row:", err)
					return
				}
				ekorjual = ekor
			}

			rerata, err := db.Query("select rerata from penjarangan where umur = ? order by id desc limit 1", row.Umur)
			if err != nil {
				http.Error(w, "Failed to fetch rerata data", http.StatusInternalServerError)
				log.Println("Error fetching rerata data:", err)
				return
			}
			defer rerata.Close()
			var rerataValue float32
			for rerata.Next() {
				if err := rerata.Scan(&rerataValue); err != nil {
					http.Error(w, "Failed to scan rerata row", http.StatusInternalServerError)
					log.Println("Error scanning rerata row:", err)
					return
				}
			}

			var totalekorpenjarangan int
			err = db.QueryRow("SELECT coalesce(sum(ekor),0) FROM penjarangan WHERE id_lantai = ? AND umur < ?", idLantai, row.Umur).Scan(&totalekorpenjarangan)
			if err != nil {
				http.Error(w, "Failed to get total ekor penjarangan", http.StatusInternalServerError)
				log.Println("Error getting total ekor penjarangan:", err)
				return
			}
			var ip float32

			// Hitung ulang nilai-nilai berdasarkan data sebelumnya
			deplesi := row.Mati + row.Culing + prevDeplesi
			deplesiPersen := (float32(deplesi) / float32(total)) * 100
			sisaAyam := sisa - (row.Culing + row.Mati + ekorjual)
			log.Printf("Row %d calculations:", row.IdMonit)
			log.Printf("- Deplesi: %d (Mati: %d, Culing: %d, PrevDeplesi: %d)",
				deplesi, row.Mati, row.Culing, prevDeplesi)
			log.Printf("- Deplesi%%: %.2f%% (Deplesi: %d, Total: %d)",
				deplesiPersen, deplesi, total)
			log.Printf("- SisaAyam: %d (Prev: %d, Culing: %d, Mati: %d)",
				sisaAyam, sisa, row.Culing, row.Mati)

			dh := (float32(sisaAyam) + float32(totalekorpenjarangan)) / float32(total) * 100
			cumPakan := previousCumPakan + row.Konsumsi
			karung := cumPakan / 50
			log.Printf("- DH: %.2f%%, CumPakan: %d, Karung: %d",
				dh, cumPakan, karung)

			// Validate sisaAyam before division
			if sisaAyam <= 0 {
				log.Printf("Warning: sisaAyam is %d, calculations might be invalid", sisaAyam)
			}

			grEkorHari := float32(row.Konsumsi) / float32(sisaAyam) * 1000
			cumKonsPakan := float32(cumPakan) / float32(sisaAyam) * 1000
			log.Printf("- GrEkorHari: %.2f, CumKonsPakan: %.2f",
				grEkorHari, cumKonsPakan)

			var adgPbbh float32
			if prevbb == 0 {
				adgPbbh = 0
				log.Printf("First row ADG: %.2f (equal to bbEkor)", adgPbbh)
			} else {
				adgPbbh = (row.BbEkor - prevbb) / float32(row.Umur)
				log.Printf("ADG calculation: %.2f (bbEkor: %.2f - prevadg: %.2f)",
					adgPbbh, row.BbEkor, prevbb)
			}

			dg := float32(row.BbEkor - prevbb)
			log.Printf("- DG: %.2f (BbEkor: %.2f - PrevBb: %.2f)", dg, row.BbEkor, prevbb)
			tonase := float32(row.BbEkor) * (float32(sisaAyam)) / 1000 // Tonase dalam kg
			fcr := float64(cumKonsPakan) / float64(row.BbEkor)
			if rerataValue == 0 {
				ip = float32(row.BbEkor) / 1000 * float32(dh) / (float32(fcr) * float32(row.Umur)) * 100
			} else if rerataValue != 0 {
				ip = float32(row.BbEkor) / 1000 * float32(dh) / (float32(fcr) * rerataValue) * 100
			} else if adgPbbh == 0 {
				ip = 0 // Jika adg awal adalah 0, ip juga harus 0
			}
			log.Printf("- FCR: %.3f, IP: %.2f", fcr, ip)
			ep := (tonase - tonaseawal) / float32(cumPakan) * 100
			log.Printf("- EP : %.2f, tonase - tonase awal = %.2f - %.2f / cumpakan = %.2f", ep, tonase, tonaseawal, float32(cumPakan))

			// Perbarui baris saat ini
			_, err = db.Exec(`
                UPDATE monit 
                SET umur = ?, mati = ?, culing = ?, deplesi = ?, deplesi_persen = ?, sisa_ayam = ?, dh = ?, konsumsi = ?, cum_pakan = ?, gr_ekor_hari = ?, cum_kons_pakan = ?, karung = ?, bb_ekor = ?, dg = ?, adg_pbbh = ?, tonase = ?, fcr = ?, ip = ?, ep = ?
                WHERE id_monit = ? AND id_lantai = ?`,
				row.Umur, row.Mati, row.Culing, deplesi, deplesiPersen, sisaAyam, dh, row.Konsumsi, cumPakan, grEkorHari, cumKonsPakan, karung, row.BbEkor, dg, adgPbbh, tonase, fcr, ip, ep, row.IdMonit, idLantai)
			if err != nil {
				http.Error(w, "Failed to update row", http.StatusInternalServerError)
				log.Println("Error updating row:", err)
				return
			}

			// Update variables for next iteration
			log.Printf("Updating values for next iteration:")
			log.Printf("- sisa: %d → %d", sisa, sisaAyam)
			log.Printf("- previousCumPakan: %d → %d", previousCumPakan, cumPakan)
			log.Printf("- prevDeplesi: %d → %d", prevDeplesi, deplesi)
			log.Printf("- prevadg: %.2f → %.2f", prevadg, row.BbEkor)

			// Perbarui previousCumPakan dan prevDeplesi untuk iterasi berikutnya
			sisa = sisaAyam
			previousCumPakan = cumPakan
			prevDeplesi = deplesi
			prevadg = adgPbbh
			prevbb = row.BbEkor
		}

		// Kirim respons sukses
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Data updated successfully"})
	}
}

// Fungsi untuk memperbarui semua baris berikutnya

// delete data
func DeleteData(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		idLantai := vars["id_lantai"]
		idMonit := vars["id_monit"]

		// Ambil umur dari monit yang akan dihapus
		var umur int
		err := db.QueryRow("SELECT umur FROM monit WHERE id_lantai = ? AND id_monit = ?", idLantai, idMonit).Scan(&umur)
		if err != nil {
			http.Error(w, "Failed to get umur from monit", http.StatusInternalServerError)
			log.Println("Error getting umur from monit:", err)
			return
		}

		// Hapus monit
		result, err := db.Exec("DELETE FROM monit WHERE id_lantai = ? AND id_monit = ?", idLantai, idMonit)
		if err != nil {
			http.Error(w, "Failed to delete data", http.StatusInternalServerError)
			log.Println("Error deleting data:", err)
			return
		}

		// Periksa apakah ada baris yang dihapus
		rowsAffected, err := result.RowsAffected()
		if err != nil {
			http.Error(w, "Failed to check rows affected", http.StatusInternalServerError)
			log.Println("Error checking rows affected:", err)
			return
		}

		if rowsAffected == 0 {
			http.Error(w, "Data not found", http.StatusNotFound)
			return
		}

		// Hapus penjarangan dengan id_lantai dan umur yang sama
		_, err = db.Exec("DELETE FROM penjarangan WHERE id_lantai = ? AND umur = ?", idLantai, umur)
		if err != nil {
			http.Error(w, "Failed to delete penjarangan", http.StatusInternalServerError)
			log.Println("Error deleting penjarangan:", err)
			return
		}

		// Kirim respons sukses
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Data deleted successfully"})
	}
}
