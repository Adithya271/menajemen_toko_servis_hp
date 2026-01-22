package controllers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"service_hp/database"
	"service_hp/models"
	"strconv"
	"strings"
)

// normalisasi status servis agar cocok enum DB
func normalizeStatus(input string) string {
	m := map[string]string{
		"pending":          "pending",
		"dalam_perbaikan":  "dalam_perbaikan",
		"selesai":          "selesai",
		"siap_diambil":     "siap_diambil",
		"dalam perbaikan":  "dalam_perbaikan",
		"siap diambil":     "siap_diambil",
		"belum dikerjakan": "pending",
		"pending ":         "pending",
	}

	key := strings.ToLower(strings.TrimSpace(input))
	if v, ok := m[key]; ok {
		return v
	}
	return "pending"
}

// Helper: Calculate total biaya (detail + servis)
func calculateTotalBiaya(detailBiaya float64, biayadLayanan float64) float64 {
	return detailBiaya + biayadLayanan
}

// =======================================================
// SEARCH SERVIS (PUBLIC - untuk Landing Page)
// =======================================================
func SearchServis(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get query parameters
	name := r.URL.Query().Get("name")
	phone := r.URL.Query().Get("phone")

	// Validate - at least one parameter must be provided
	if name == "" && phone == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Nama atau nomor WhatsApp harus diisi",
		})
		return
	}

	// Build dynamic query
	query := `
		SELECT 
			s.id_servis,
			s.nama_pelanggan,
			s.no_whatsapp,
			s.tipe_hp,
			s.keluhan,
			s.status_servis,
			s.biaya_servis,
			s.biaya_total,
			s.tanggal_masuk,
			s.tanggal_selesai
		FROM servis s
		WHERE 1=1
	`
	
	var args []interface{}

	if name != "" {
		query += " AND LOWER(s.nama_pelanggan) LIKE ?"
		args = append(args, "%"+strings.ToLower(name)+"%")
	}

	if phone != "" {
		query += " AND s.no_whatsapp LIKE ?"
		args = append(args, "%"+phone+"%")
	}

	query += " ORDER BY s.tanggal_masuk DESC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		log.Println(" Error search servis:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Gagal mencari data servis",
		})
		return
	}
	defer rows.Close()

	var services []models.Servis

	for rows.Next() {
		var s models.Servis
		var tanggalSelesai sql.NullString

		err := rows.Scan(
			&s.IDServis,
			&s.NamaPelanggan,
			&s.NoWhatsapp,
			&s.TipeHP,
			&s.Keluhan,
			&s.StatusServis,
			&s.BiayaServis,
			&s.BiayaTotal,
			&s.TanggalMasuk,
			&tanggalSelesai,
		)

		if err != nil {
			log.Println(" Error scan servis:", err)
			continue
		}

		if tanggalSelesai.Valid {
			s.TanggalSelesai = &tanggalSelesai.String
		} else {
			s.TanggalSelesai = nil
		}

		// Get detail servis for each service
		detailQuery := `
			SELECT id_detail, id_servis, id_barang, deskripsi, jumlah, harga_satuan, biaya
			FROM detail_servis
			WHERE id_servis = ?
		`
		
		detailRows, err := database.DB.Query(detailQuery, s.IDServis)
		if err == nil {
			var details []models.DetailServis
			
			for detailRows.Next() {
				var d models.DetailServis
				var idBarang sql.NullInt64

				err := detailRows.Scan(
					&d.IDDetail,
					&d.IDServis,
					&idBarang,
					&d.Deskripsi,
					&d.Jumlah,
					&d.HargaSatuan,
					&d.Biaya,
				)

				if err == nil {
					if idBarang.Valid {
						tempID := int(idBarang.Int64)
						d.IDBarang = &tempID
					} else {
						d.IDBarang = nil
					}
					details = append(details, d)
				}
			}
			detailRows.Close()
			s.Detail = details
		}

		services = append(services, s)
	}

	// Return empty array if no results
	if len(services) == 0 {
		json.NewEncoder(w).Encode([]models.Servis{})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(services)
}

// =======================================================
// GET ALL SERVIS (Protected - untuk Pegawai)
// =======================================================
func GetAllServis(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := database.DB.Query(`
		SELECT 
			s.id_servis,
			s.nama_pelanggan,
			s.no_whatsapp,
			s.tipe_hp,
			s.keluhan,
			s.status_servis,
			s.biaya_servis,
			s.biaya_total,
			s.tanggal_masuk,
			s.tanggal_selesai
		FROM servis s
		ORDER BY s.id_servis DESC
	`)
	if err != nil {
		log.Println(" Error query servis:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	defer rows.Close()

	var list []models.Servis

	for rows.Next() {
		var s models.Servis
		var tglSelesai sql.NullString

		err := rows.Scan(
			&s.IDServis,
			&s.NamaPelanggan,
			&s.NoWhatsapp,
			&s.TipeHP,
			&s.Keluhan,
			&s.StatusServis,
			&s.BiayaServis,
			&s.BiayaTotal,
			&s.TanggalMasuk,
			&tglSelesai,
		)
		if err != nil {
			continue
		}

		if tglSelesai.Valid {
			s.TanggalSelesai = &tglSelesai.String
		} else {
			s.TanggalSelesai = nil
		}

		list = append(list, s)
	}

	json.NewEncoder(w).Encode(list)
}

// =======================================================
// CREATE SERVIS (+ DETAIL) - transactional
// =======================================================
func CreateServis(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.Servis
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Normalisasi status
	req.StatusServis = normalizeStatus(req.StatusServis)

	// Start transaction
	tx, err := database.DB.Begin()
	if err != nil {
		log.Println(" Error begin tx:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Internal error"})
		return
	}

	var res sql.Result
	if strings.TrimSpace(req.TanggalMasuk) == "" {
		res, err = tx.Exec(`
			INSERT INTO servis (nama_pelanggan, no_whatsapp, tipe_hp, keluhan, status_servis, biaya_servis, biaya_total, tanggal_masuk, tanggal_selesai)
			VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
		`,
			req.NamaPelanggan,
			req.NoWhatsapp,
			req.TipeHP,
			req.Keluhan,
			req.StatusServis,
			req.BiayaServis,
			0,
			req.TanggalSelesai,
		)
	} else {
		res, err = tx.Exec(`
			INSERT INTO servis (nama_pelanggan, no_whatsapp, tipe_hp, keluhan, status_servis, biaya_servis, biaya_total, tanggal_masuk, tanggal_selesai)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,
			req.NamaPelanggan,
			req.NoWhatsapp,
			req.TipeHP,
			req.Keluhan,
			req.StatusServis,
			req.BiayaServis,
			0,
			req.TanggalMasuk,
			req.TanggalSelesai,
		)
	}
	if err != nil {
		tx.Rollback()
		log.Println(" Error insert servis:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	newID64, _ := res.LastInsertId()
	newID := int(newID64)

	var totalDetailBiaya float64 = 0
	for _, d := range req.Detail {
		_, err := tx.Exec(`
			INSERT INTO detail_servis (id_servis, id_barang, deskripsi, jumlah, harga_satuan, biaya)
			VALUES (?, ?, ?, ?, ?, ?)
		`, newID, d.IDBarang, d.Deskripsi, d.Jumlah, d.HargaSatuan, d.Biaya)
		if err != nil {
			tx.Rollback()
			log.Println(" Error insert detail:", err)
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		totalDetailBiaya += d.Biaya
	}

	// Calculate total: detail biaya + biaya_servis
	totalBiaya := calculateTotalBiaya(totalDetailBiaya, req.BiayaServis)

	// Update biaya_total
	if _, err := tx.Exec(`UPDATE servis SET biaya_total=? WHERE id_servis=?`, totalBiaya, newID); err != nil {
		tx.Rollback()
		log.Println(" Error update biaya_total:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update total biaya"})
		return
	}

	if err := tx.Commit(); err != nil {
		log.Println(" Error commit tx:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Internal error commit"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   "Servis berhasil ditambahkan",
		"id_servis": newID,
	})
}

// =======================================================
// GET SERVIS DETAIL (servis + detail array)
// =======================================================
func GetServisDetail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/api/pegawai/servis/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID"})
		return
	}

	var s models.Servis
	var tglSelesai sql.NullString

	err = database.DB.QueryRow(`
		SELECT 
			id_servis, nama_pelanggan, no_whatsapp, tipe_hp, keluhan,
			status_servis, biaya_servis, biaya_total, tanggal_masuk, tanggal_selesai
		FROM servis WHERE id_servis = ?
	`, id).Scan(
		&s.IDServis,
		&s.NamaPelanggan,
		&s.NoWhatsapp,
		&s.TipeHP,
		&s.Keluhan,
		&s.StatusServis,
		&s.BiayaServis,
		&s.BiayaTotal,
		&s.TanggalMasuk,
		&tglSelesai,
	)

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Servis tidak ditemukan"})
		return
	}

	if tglSelesai.Valid {
		s.TanggalSelesai = &tglSelesai.String
	}

	rows, err := database.DB.Query(`
		SELECT id_detail, id_servis, id_barang, deskripsi, jumlah, harga_satuan, biaya
		FROM detail_servis WHERE id_servis = ?
	`, id)
	if err != nil {
		log.Println(" Error get detail servis:", err)
	}

	var det []models.DetailServis
	if rows != nil {
		for rows.Next() {
			var d models.DetailServis
			var idBarang sql.NullInt64

			err := rows.Scan(
				&d.IDDetail,
				&d.IDServis,
				&idBarang,
				&d.Deskripsi,
				&d.Jumlah,
				&d.HargaSatuan,
				&d.Biaya,
			)

			if err == nil {
				if idBarang.Valid {
					tempID := int(idBarang.Int64)
					d.IDBarang = &tempID
				} else {
					d.IDBarang = nil
				}
				det = append(det, d)
			}
		}
		rows.Close()
	}
	s.Detail = det

	json.NewEncoder(w).Encode(s)
}

// =======================================================
// UPDATE SERVIS (+ DETAIL sync) - transactional
// =======================================================
func UpdateServis(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/api/pegawai/servis/")
	id, _ := strconv.Atoi(idStr)

	var req models.Servis
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	req.StatusServis = normalizeStatus(req.StatusServis)

	tx, err := database.DB.Begin()
	if err != nil {
		log.Println(" Error begin tx:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Internal error"})
		return
	}

	_, err = tx.Exec(`
		UPDATE servis SET
			nama_pelanggan=?, no_whatsapp=?, tipe_hp=?, keluhan=?, 
			status_servis=?, biaya_servis=?, tanggal_masuk=?, tanggal_selesai=?
		WHERE id_servis=?
	`,
		req.NamaPelanggan,
		req.NoWhatsapp,
		req.TipeHP,
		req.Keluhan,
		req.StatusServis,
		req.BiayaServis,
		req.TanggalMasuk,
		req.TanggalSelesai,
		id,
	)
	if err != nil {
		tx.Rollback()
		log.Println(" Error update servis:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Sync detail: delete old, insert new
	if _, err := tx.Exec(`DELETE FROM detail_servis WHERE id_servis=?`, id); err != nil {
		tx.Rollback()
		log.Println(" Error delete old details:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete old details"})
		return
	}

	var totalDetailBiaya float64 = 0
	for _, d := range req.Detail {
		_, err := tx.Exec(`
			INSERT INTO detail_servis (id_servis, id_barang, deskripsi, jumlah, harga_satuan, biaya)
			VALUES (?, ?, ?, ?, ?, ?)
		`, id, d.IDBarang, d.Deskripsi, d.Jumlah, d.HargaSatuan, d.Biaya)
		if err != nil {
			tx.Rollback()
			log.Println(" Error insert detail (update):", err)
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		totalDetailBiaya += d.Biaya
	}

	// Calculate total: detail biaya + biaya_servis
	totalBiaya := calculateTotalBiaya(totalDetailBiaya, req.BiayaServis)

	// Update biaya_total
	if _, err := tx.Exec(`UPDATE servis SET biaya_total=? WHERE id_servis=?`, totalBiaya, id); err != nil {
		tx.Rollback()
		log.Println(" Error update biaya_total:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update total biaya"})
		return
	}

	if err := tx.Commit(); err != nil {
		log.Println(" Error commit tx:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Internal error commit"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Servis berhasil diperbarui",
	})
}

// =======================================================
// DELETE SERVIS
// =======================================================
func DeleteServis(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/api/pegawai/servis/")
	id, _ := strconv.Atoi(idStr)

	tx, err := database.DB.Begin()
	if err != nil {
		log.Println(" Error begin tx:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Internal error"})
		return
	}

	if _, err := tx.Exec(`DELETE FROM detail_servis WHERE id_servis=?`, id); err != nil {
		tx.Rollback()
		log.Println(" Error delete detail_servis:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete details"})
		return
	}

	if _, err := tx.Exec(`DELETE FROM servis WHERE id_servis=?`, id); err != nil {
		tx.Rollback()
		log.Println(" Error delete servis:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete servis"})
		return
	}

	if err := tx.Commit(); err != nil {
		log.Println(" Error commit tx:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Internal error commit"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Servis berhasil dihapus",
	})
}

// =======================================================
// DETAIL SERVIS SUB-OPERATIONS
// =======================================================
func AddDetailServis(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var d models.DetailServis
	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	result, err := database.DB.Exec(`
		INSERT INTO detail_servis (id_servis, id_barang, deskripsi, jumlah, harga_satuan, biaya)
		VALUES (?, ?, ?, ?, ?, ?)
	`, d.IDServis, d.IDBarang, d.Deskripsi, d.Jumlah, d.HargaSatuan, d.Biaya)
	if err != nil {
		log.Println(" Error insert detail:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	newID, _ := result.LastInsertId()

	// Update biaya_total: add detail biaya only (biaya_servis sudah ada)
	if _, err := database.DB.Exec(`UPDATE servis SET biaya_total = COALESCE(biaya_total,0) + ? WHERE id_servis = ?`, d.Biaya, d.IDServis); err != nil {
		log.Println(" Error update biaya_total after add detail:", err)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   "Detail berhasil ditambahkan",
		"id_detail": newID,
	})
}

func UpdateDetailServis(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/api/pegawai/detail-servis/")
	id, _ := strconv.Atoi(idStr)

	var d models.DetailServis
	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	var oldBiaya float64
	err := database.DB.QueryRow(`SELECT biaya FROM detail_servis WHERE id_detail = ?`, id).Scan(&oldBiaya)
	if err != nil && err != sql.ErrNoRows {
		log.Println(" Error select old biaya:", err)
	}

	_, err = database.DB.Exec(`
		UPDATE detail_servis SET id_barang=?, deskripsi=?, jumlah=?, harga_satuan=?, biaya=?
		WHERE id_detail=?
	`, d.IDBarang, d.Deskripsi, d.Jumlah, d.HargaSatuan, d.Biaya, id)
	if err != nil {
		log.Println(" Error update detail:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Adjust biaya_total: kurangi old biaya, tambah new biaya
	if oldBiaya != 0 {
		if _, err := database.DB.Exec(`UPDATE servis SET biaya_total = COALESCE(biaya_total,0) - ? + ? WHERE id_servis = ?`, oldBiaya, d.Biaya, d.IDServis); err != nil {
			log.Println(" Error adjust biaya_total after update detail:", err)
		}
	} else {
		if _, err := database.DB.Exec(`UPDATE servis SET biaya_total = COALESCE(biaya_total,0) + ? WHERE id_servis = ?`, d.Biaya, d.IDServis); err != nil {
			log.Println(" Error adjust biaya_total after update detail:", err)
		}
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Detail berhasil diperbarui"})
}

func DeleteDetailServis(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	idStr := strings.TrimPrefix(r.URL.Path, "/api/pegawai/detail-servis/")
	id, _ := strconv.Atoi(idStr)

	var idServis int
	var biaya float64
	err := database.DB.QueryRow(`SELECT id_servis, biaya FROM detail_servis WHERE id_detail = ?`, id).Scan(&idServis, &biaya)
	if err != nil && err != sql.ErrNoRows {
		log.Println(" Error select detail before delete:", err)
	}

	_, err = database.DB.Exec(`DELETE FROM detail_servis WHERE id_detail=?`, id)
	if err != nil {
		log.Println(" Error delete detail:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Update biaya_total: kurangi biaya detail
	if idServis != 0 {
		if _, err := database.DB.Exec(`UPDATE servis SET biaya_total = COALESCE(biaya_total,0) - ? WHERE id_servis = ?`, biaya, idServis); err != nil {
			log.Println(" Error update biaya_total after delete detail:", err)
		}
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Detail berhasil dihapus"})
}