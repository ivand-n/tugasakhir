package models

import (
	"api/middleware"
	"database/sql"
	"encoding/csv"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func ExportKandangCSV(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, err := middleware.ValidateTokenFromQuery(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		id_kandang := vars["id_kandang"]

		// Query info kandang
		var nama, alamat, pemilik string
		var tingkat, kapasitas int
		var status bool
		err = db.QueryRow(`SELECT nama, tingkat, kapasitas, alamat, pemilik, status FROM kandang WHERE id = ?`, id_kandang).
			Scan(&nama, &tingkat, &kapasitas, &alamat, &pemilik, &status)
		if err != nil {
			http.Error(w, "Kandang tidak ditemukan", http.StatusNotFound)
			return
		}

		// Set header untuk download CSV
		w.Header().Set("Content-Type", "text/csv")
		w.Header().Set("Content-Disposition", "attachment;filename=kandang_"+id_kandang+".csv")

		writer := csv.NewWriter(w)
		defer writer.Flush()

		// Tulis info kandang
		writer.Write([]string{"Data Kandang"})
		writer.Write([]string{"Nama", "Tingkat", "Kapasitas", "Alamat", "Pemilik", "Status"})
		writer.Write([]string{nama, strconv.Itoa(tingkat), strconv.Itoa(kapasitas), alamat, pemilik, strconv.FormatBool(status)})
		writer.Write([]string{}) // Baris kosong

		// Query seluruh lantai
		lantaiRows, err := db.Query(`SELECT id_lantai, no_lantai, jenisdoc, populasi, tgl_masuk FROM lantai WHERE id_kandang = ? ORDER BY no_lantai ASC`, id_kandang)
		if err != nil {
			http.Error(w, "Gagal mengambil data lantai", http.StatusInternalServerError)
			return
		}
		defer lantaiRows.Close()

		for lantaiRows.Next() {
			var idLantai, noLantai, jenisDoc, tglMasuk string
			var populasi int
			err := lantaiRows.Scan(&idLantai, &noLantai, &jenisDoc, &populasi, &tglMasuk)
			if err != nil {
				continue
			}
			// Info lantai
			writer.Write([]string{"Data Lantai"})
			writer.Write([]string{"No Lantai", "Jenis DOC", "Populasi", "Tanggal Masuk"})
			writer.Write([]string{noLantai, jenisDoc, strconv.Itoa(populasi), tglMasuk})
			writer.Write([]string{}) // Baris kosong

			// Tulis data OVK
			writer.Write([]string{"Data OVK"})
			writer.Write([]string{"Tanggal", "Nama", "Jenis", "Dosis", "Satuan"})
			rowsOvk, err := db.Query(`SELECT date, nama, jenis, dosis, jenis_dosis FROM ovk WHERE id_lantai = ? ORDER BY date ASC`, idLantai)
			if err == nil {
				defer rowsOvk.Close()
				for rowsOvk.Next() {
					var date, namaOvk, jenis, jenis_lantai string
					var dosis int
					err := rowsOvk.Scan(&date, &namaOvk, &jenis, &dosis, &jenis_lantai)
					if err == nil {
						writer.Write([]string{date, namaOvk, jenis, strconv.Itoa(dosis), jenis_lantai})
					}
				}
			}
			writer.Write([]string{}) // Baris kosong

			// Data Penjarangan
			writer.Write([]string{"Data Penjarangan"})
			writer.Write([]string{"No DO", "Tanggal", "Nama Pembeli", "Ekor", "Kg", "BW", "Umur", "Umur Rata Rata"})
			rowsPenjarangan, err := db.Query(`SELECT no, date, nama, ekor, kg, bw, umur, rerata FROM penjarangan WHERE id_lantai = ? ORDER BY date ASC`, idLantai)
			if err == nil {
				defer rowsPenjarangan.Close()
				for rowsPenjarangan.Next() {
					var noDo, date, nama, ekor, kg, bw, umur, rerata string
					err := rowsPenjarangan.Scan(&noDo, &date, &nama, &ekor, &kg, &bw, &umur, &rerata)
					if err == nil {
						writer.Write([]string{noDo, date, nama, ekor, kg, bw, umur, rerata})
					}
				}
			}
			writer.Write([]string{}) // Baris kosong

			// Data monitoring untuk lantai ini
			writer.Write([]string{"Data Monitoring Lantai " + noLantai})
			writer.Write([]string{"Umur", "Mati", "Culing", "Konsumsi", "BB/Ekor", "Sisa Ayam", "Deplesi", "Deplesi %", "Daya Hidup", "Cum Pakan", "gr/ekor/hari", "Cum Kons Pakan", "Karung", "ADG/PBBH", "FCR", "IP"})
			rowsMonit, err := db.Query(`SELECT umur, mati, culing, konsumsi, bb_ekor, sisa_ayam, deplesi, deplesi_persen, dh, cum_pakan, gr_ekor_hari, cum_kons_pakan, karung, adg_pbbh, fcr, ip FROM monit WHERE id_lantai = ? ORDER BY umur ASC`, idLantai)
			if err == nil {
				defer rowsMonit.Close()
				for rowsMonit.Next() {
					var umur, mati, culing, konsumsi, bb_ekor, sisa_ayam, deplesi, deplesi_persen, dh, cum_pakan, gr_ekor_hari, cum_kons_pakan, karung, adg_pbbh, fcr, ip string
					err := rowsMonit.Scan(&umur, &mati, &culing, &konsumsi, &bb_ekor, &sisa_ayam, &deplesi, &deplesi_persen, &dh, &cum_pakan, &gr_ekor_hari, &cum_kons_pakan, &karung, &adg_pbbh, &fcr, &ip)
					if err == nil {
						writer.Write([]string{umur, mati, culing, konsumsi, bb_ekor, sisa_ayam, deplesi, deplesi_persen, dh, cum_pakan, gr_ekor_hari, cum_kons_pakan, karung, adg_pbbh, fcr, ip})
					}
				}
			}
			writer.Write([]string{}) // Baris kosong antar lantai
		}
		_, err = db.Exec("UPDATE kandang SET status = 1 WHERE id = ?", id_kandang)
		if err != nil {
			// Tidak perlu return, cukup log jika gagal update status
			// log.Printf("Gagal update status kandang: %v", err)
		}
	}
}

func ExportLantaiCSV(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, err := middleware.ValidateTokenFromQuery(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		id_lantai := vars["id_lantai"]

		// Query info lantai
		var noLantai, jenisDoc, tglMasuk string
		var populasi int
		err = db.QueryRow(`SELECT no_lantai, jenisdoc, populasi, tgl_masuk FROM lantai WHERE id_lantai = ?`, id_lantai).
			Scan(&noLantai, &jenisDoc, &populasi, &tglMasuk)
		if err != nil {
			http.Error(w, "Lantai tidak ditemukan", http.StatusNotFound)
			return
		}

		// Query data OVK
		ovkrows, err := db.Query(`SELECT date, nama, jenis, dosis, jenis_dosis FROM ovk WHERE id_lantai =? ORDER BY date ASC`, id_lantai)
		if err != nil {
			http.Error(w, "Gagal mengambil data OVK", http.StatusInternalServerError)
			return
		}
		defer ovkrows.Close()

		// Query data penjarangan
		penjaranganRows, err := db.Query(`SELECT no, date, nama, ekor, kg, bw, umur, rerata FROM penjarangan WHERE id_lantai = ? ORDER BY date ASC`, id_lantai)
		if err != nil {
			http.Error(w, "Gagal mengambil data penjarangan", http.StatusInternalServerError)
			return
		}
		defer penjaranganRows.Close()

		// Query data monitoring
		rows, err := db.Query(`SELECT umur, mati, culing, konsumsi, bb_ekor, sisa_ayam, deplesi, deplesi_persen, dh, cum_pakan, gr_ekor_hari, cum_kons_pakan, karung, adg_pbbh, fcr, ip FROM monit WHERE id_lantai = ? ORDER BY umur ASC`, id_lantai)
		if err != nil {
			http.Error(w, "Gagal mengambil data monitoring", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// Set header untuk download CSV
		w.Header().Set("Content-Type", "text/csv")
		w.Header().Set("Content-Disposition", "attachment;filename=panen_lantai_"+id_lantai+".csv")

		writer := csv.NewWriter(w)
		defer writer.Flush()

		// Tulis header info lantai
		writer.Write([]string{"No Lantai", "Jenis DOC", "Populasi", "Tanggal Masuk"})
		writer.Write([]string{noLantai, jenisDoc, strconv.Itoa(populasi), tglMasuk})
		writer.Write([]string{}) // Baris kosong

		writer.Write([]string{"Data OVK"})
		writer.Write([]string{"Tanggal", "Nama", "Jenis", "Dosis", "jenis_dosis"})
		for ovkrows.Next() {
			var date, nama, jenis, dosis, jenis_dosis string
			err := ovkrows.Scan(&date, &nama, &jenis, &dosis, &jenis_dosis)
			if err != nil {
				continue
			}
			writer.Write([]string{date, nama, jenis, dosis, jenis_dosis})
		}

		writer.Write([]string{}) // Baris kosong
		writer.Write([]string{"Data Penjarangan"})
		writer.Write([]string{"No DO", "Tanggal", "Nama Pembeli", "Ekor", "Kg", "BW", "Umur", "Umur Rata Rata"})
		for penjaranganRows.Next() {
			var noDo, date, nama, ekor, kg, bw, umur, rerata string
			err := penjaranganRows.Scan(&noDo, &date, &nama, &ekor, &kg, &bw, &umur, &rerata)
			if err != nil {
				continue
			}
			writer.Write([]string{noDo, date, nama, ekor, kg, bw, umur, rerata})
		}
		writer.Write([]string{}) // Baris kosong

		// Tulis header kolom monitoring
		writer.Write([]string{"Data Monitoring"})
		writer.Write([]string{"Umur", "Mati", "Culing", "Konsumsi", "BB/Ekor", "Sisa Ayam", "Deplesi", "Deplesi %", "Daya Hidup", "Cum Pakan", "gr/ekor/hari", "Cum Kons Pakan", "Karung", "ADG/PBBH", "FCR", "IP"})

		// Tulis data monitoring
		for rows.Next() {
			var umur, mati, culing, konsumsi, bb_ekor, sisa_ayam, deplesi, deplesi_persen, dh, cum_pakan, gr_ekor_hari, cum_kons_pakan, karung, adg_pbbh, fcr, ip string
			err := rows.Scan(&umur, &mati, &culing, &konsumsi, &bb_ekor, &sisa_ayam, &deplesi, &deplesi_persen, &dh, &cum_pakan, &gr_ekor_hari, &cum_kons_pakan, &karung, &adg_pbbh, &fcr, &ip)
			if err != nil {
				continue
			}
			writer.Write([]string{umur, mati, culing, konsumsi, bb_ekor, sisa_ayam, deplesi, deplesi_persen, dh, cum_pakan, gr_ekor_hari, cum_kons_pakan, karung, adg_pbbh, fcr, ip})
		}
	}
}