package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"service_hp/database"
	"service_hp/models"
	"strconv"
	"strings"
	"time"
)

// Helper function untuk extract ID dari path
func extractLaporanID(path string) (int, error) {
	idStr := strings.TrimPrefix(path, "/api/pegawai/laporan/")
	idStr = strings.TrimPrefix(idStr, "/api/admin/laporan/")
	return strconv.Atoi(idStr)
}

// =======================================================
// GET ALL LAPORAN
// =======================================================
func GetAllLaporan(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := database.DB.Query(`
		SELECT 
			id_laporan, judul_laporan, jenis_laporan,
			tanggal_awal, tanggal_akhir,
			total_servis, total_pendapatan, total_modal, laba_bersih,
			COALESCE(keterangan, ''), created_at
		FROM laporan
		ORDER BY created_at DESC
	`)
	if err != nil {
		log.Println(" Error query laporan:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	defer rows.Close()

	var list []models.Laporan

	for rows.Next() {
		var l models.Laporan
		err := rows.Scan(
			&l.IDLaporan, &l.JudulLaporan, &l.JenisLaporan,
			&l.TanggalAwal, &l.TanggalAkhir,
			&l.TotalServis, &l.TotalPendapatan, &l.TotalModal, &l.LabaBersih,
			&l.Keterangan, &l.CreatedAt,
		)
		if err != nil {
			log.Println(" Error scan:", err)
			continue
		}
		list = append(list, l)
	}

	json.NewEncoder(w).Encode(list)
}

// =======================================================
// GET LAPORAN DETAIL
// =======================================================
func GetLaporanDetail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id, err := extractLaporanID(r.URL.Path)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID"})
		return
	}

	var l models.Laporan

	err = database.DB.QueryRow(`
		SELECT 
			id_laporan, judul_laporan, jenis_laporan,
			tanggal_awal, tanggal_akhir,
			total_servis, total_pendapatan, total_modal, laba_bersih,
			COALESCE(keterangan, ''), created_at
		FROM laporan WHERE id_laporan = ?
	`, id).Scan(
		&l.IDLaporan, &l.JudulLaporan, &l.JenisLaporan,
		&l.TanggalAwal, &l.TanggalAkhir,
		&l.TotalServis, &l.TotalPendapatan, &l.TotalModal, &l.LabaBersih,
		&l.Keterangan, &l.CreatedAt,
	)

	if err != nil {
		log.Println(" Error get laporan:", err)
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Laporan tidak ditemukan"})
		return
	}

	// Get detail servis dengan perhitungan modal yang benar
	rowsServis, err := database.DB.Query(`
		SELECT 
			ds_detail.id_detail,
			ds_detail.id_laporan,
			ds_detail.id_servis,
			ds_detail.nama_pelanggan,
			ds_detail.tipe_hp,
			ds_detail.biaya_total,
			ds_detail.modal_servis,
			(ds_detail.biaya_total - ds_detail.modal_servis) as laba_servis
		FROM detail_laporan_servis ds_detail
		WHERE ds_detail.id_laporan = ?
		ORDER BY ds_detail.id_detail DESC
	`, id)

	if err == nil {
		defer rowsServis.Close()
		for rowsServis.Next() {
			var ds models.DetailLaporanServis
			var modalServis float64
			err := rowsServis.Scan(
				&ds.IDDetail, &ds.IDLaporan, &ds.IDServis,
				&ds.NamaPelanggan, &ds.TipeHP,
				&ds.BiayaTotal, &modalServis, &ds.LabaServis,
			)
			if err == nil {
				l.DetailServis = append(l.DetailServis, ds)
			}
		}
	}

	json.NewEncoder(w).Encode(l)
}

// =======================================================
// GENERATE LAPORAN - FIXED VERSION
// =======================================================
func GenerateLaporan(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.GenerateLaporanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Validate jenis laporan
	validJenis := map[string]bool{
		"harian": true, "mingguan": true, "bulanan": true, "custom": true,
	}
	if !validJenis[req.JenisLaporan] {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Jenis laporan tidak valid"})
		return
	}

	// Buat judul otomatis
	judul := "Laporan " + strings.Title(req.JenisLaporan) + " - " + req.TanggalAwal + " s/d " + req.TanggalAkhir

	//  PERBAIKAN: Hitung total servis dan pendapatan
	var totalServis int
	var totalPendapatan float64

	err := database.DB.QueryRow(`
		SELECT 
			COUNT(*), 
			COALESCE(SUM(biaya_total), 0)
		FROM servis
		WHERE DATE(tanggal_masuk) BETWEEN ? AND ?
	`, req.TanggalAwal, req.TanggalAkhir).Scan(&totalServis, &totalPendapatan)

	if err != nil {
		log.Println(" Error hitung servis:", err)
		totalServis = 0
		totalPendapatan = 0
	}

	//  PERBAIKAN: Hitung total MODAL (bukan harga jual!)
	// Modal = harga beli barang yang digunakan untuk servis
	var totalModal float64
	
	err = database.DB.QueryRow(`
		SELECT COALESCE(SUM(ds.jumlah * COALESCE(b.harga_modal, 0)), 0)
		FROM detail_servis ds
		INNER JOIN servis s ON ds.id_servis = s.id_servis
		LEFT JOIN barang b ON ds.id_barang = b.id_barang
		WHERE DATE(s.tanggal_masuk) BETWEEN ? AND ?
	`, req.TanggalAwal, req.TanggalAkhir).Scan(&totalModal)

	if err != nil {
		log.Println(" Error hitung modal:", err)
		totalModal = 0
	}

	//  Hitung laba bersih
	labaBersih := totalPendapatan - totalModal

	log.Printf(" Generate Laporan: Servis=%d, Pendapatan=%.2f, Modal=%.2f, Laba=%.2f", 
		totalServis, totalPendapatan, totalModal, labaBersih)

	// Insert laporan
	result, err := database.DB.Exec(`
		INSERT INTO laporan (
			judul_laporan, jenis_laporan, tanggal_awal, tanggal_akhir,
			total_servis, total_pendapatan, total_modal, laba_bersih,
			keterangan
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, judul, req.JenisLaporan, req.TanggalAwal, req.TanggalAkhir,
		totalServis, totalPendapatan, totalModal, labaBersih, req.Keterangan)

	if err != nil {
		log.Println(" Error insert laporan:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Gagal generate laporan"})
		return
	}

	idLaporan, _ := result.LastInsertId()

	//  PERBAIKAN: Insert detail servis dengan modal yang benar
	_, err = database.DB.Exec(`
		INSERT INTO detail_laporan_servis (
			id_laporan, id_servis, nama_pelanggan, tipe_hp, 
			biaya_total, modal_servis, laba_servis
		)
		SELECT 
			? as id_laporan,
			s.id_servis,
			s.nama_pelanggan,
			s.tipe_hp,
			s.biaya_total,
			COALESCE(SUM(ds.jumlah * COALESCE(b.harga_modal, 0)), 0) as modal_servis,
			(s.biaya_total - COALESCE(SUM(ds.jumlah * COALESCE(b.harga_modal, 0)), 0)) as laba_servis
		FROM servis s
		LEFT JOIN detail_servis ds ON s.id_servis = ds.id_servis
		LEFT JOIN barang b ON ds.id_barang = b.id_barang
		WHERE DATE(s.tanggal_masuk) BETWEEN ? AND ?
		GROUP BY s.id_servis
	`, idLaporan, req.TanggalAwal, req.TanggalAkhir)

	if err != nil {
		log.Println(" Warning insert detail:", err)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Laporan berhasil dibuat",
		"id_laporan": idLaporan,
		"summary": map[string]interface{}{
			"total_servis":     totalServis,
			"total_pendapatan": totalPendapatan,
			"total_modal":      totalModal,
			"laba_bersih":      labaBersih,
		},
	})
}

// =======================================================
// GET DASHBOARD STATS
// =======================================================
func GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var stats models.DashboardStats
	today := time.Now().Format("2006-01-02")

	//  Hari ini 
	database.DB.QueryRow(`
		SELECT COUNT(*), COALESCE(SUM(biaya_total), 0)
		FROM servis
		WHERE DATE(tanggal_masuk) = ?
	`, today).Scan(&stats.HariIni.TotalServis, &stats.HariIni.TotalPendapatan)

	var modalHariIni float64
	database.DB.QueryRow(`
		SELECT COALESCE(SUM(ds.jumlah * COALESCE(b.harga_modal, 0)), 0)
		FROM detail_servis ds
		INNER JOIN servis s ON ds.id_servis = s.id_servis
		LEFT JOIN barang b ON ds.id_barang = b.id_barang
		WHERE DATE(s.tanggal_masuk) = ?
	`, today).Scan(&modalHariIni)
	stats.HariIni.LabaBersih = stats.HariIni.TotalPendapatan - modalHariIni

	//  Minggu ini
	database.DB.QueryRow(`
		SELECT COUNT(*), COALESCE(SUM(biaya_total), 0)
		FROM servis
		WHERE DATE(tanggal_masuk) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
	`).Scan(&stats.MingguIni.TotalServis, &stats.MingguIni.TotalPendapatan)

	var modalMinggu float64
	database.DB.QueryRow(`
		SELECT COALESCE(SUM(ds.jumlah * COALESCE(b.harga_modal, 0)), 0)
		FROM detail_servis ds
		INNER JOIN servis s ON ds.id_servis = s.id_servis
		LEFT JOIN barang b ON ds.id_barang = b.id_barang
		WHERE DATE(s.tanggal_masuk) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
	`).Scan(&modalMinggu)
	stats.MingguIni.LabaBersih = stats.MingguIni.TotalPendapatan - modalMinggu

	//  Bulan ini
	database.DB.QueryRow(`
		SELECT COUNT(*), COALESCE(SUM(biaya_total), 0)
		FROM servis
		WHERE MONTH(tanggal_masuk) = MONTH(CURDATE()) 
		AND YEAR(tanggal_masuk) = YEAR(CURDATE())
	`).Scan(&stats.BulanIni.TotalServis, &stats.BulanIni.TotalPendapatan)

	var modalBulan float64
	database.DB.QueryRow(`
		SELECT COALESCE(SUM(ds.jumlah * COALESCE(b.harga_modal, 0)), 0)
		FROM detail_servis ds
		INNER JOIN servis s ON ds.id_servis = s.id_servis
		LEFT JOIN barang b ON ds.id_barang = b.id_barang
		WHERE MONTH(s.tanggal_masuk) = MONTH(CURDATE()) 
		AND YEAR(s.tanggal_masuk) = YEAR(CURDATE())
	`).Scan(&modalBulan)
	stats.BulanIni.LabaBersih = stats.BulanIni.TotalPendapatan - modalBulan

	// Chart pendapatan 7 hari terakhir
	rowsChart, err := database.DB.Query(`
		SELECT 
			DATE(tanggal_masuk) as tanggal,
			COALESCE(SUM(biaya_total), 0) as pendapatan
		FROM servis
		WHERE DATE(tanggal_masuk) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
		GROUP BY DATE(tanggal_masuk)
		ORDER BY tanggal ASC
	`)
	if err == nil {
		defer rowsChart.Close()
		for rowsChart.Next() {
			var item models.ChartData
			if rowsChart.Scan(&item.Tanggal, &item.Pendapatan) == nil {
				stats.ChartPendapatan = append(stats.ChartPendapatan, item)
			}
		}
	}

	json.NewEncoder(w).Encode(stats)
}

// =======================================================
// DELETE LAPORAN
// =======================================================
func DeleteLaporan(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	id, err := extractLaporanID(r.URL.Path)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID"})
		return
	}

	_, err = database.DB.Exec("DELETE FROM laporan WHERE id_laporan=?", id)
	if err != nil {
		log.Println(" Error delete laporan:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Gagal menghapus laporan"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Laporan berhasil dihapus"})
}