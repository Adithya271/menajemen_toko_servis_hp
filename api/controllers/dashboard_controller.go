package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"service_hp/database"
	"time"
)

// Struct untuk response dashboard pegawai dan admin
type DashboardPegawaiStats struct {
	TotalServisHariIni       int                    `json:"total_servis_hari_ini"`
	ServisDalamPerbaikan     int                    `json:"servis_dalam_perbaikan"`
	ServisSelesai            int                    `json:"servis_selesai"`
	StokMenipis              int                    `json:"stok_menipis"`
	TotalPendapatanHariIni   float64                `json:"total_pendapatan_hari_ini"`
	TotalPendapatanBulanIni  float64                `json:"total_pendapatan_bulan_ini"`
	ServisHariIni            []ServisHariIni        `json:"servis_hari_ini"`
	BarangMenipis            []BarangMenipis        `json:"barang_menipis"`
}

type DashboardAdminStats struct {
	TotalServisHariIni       int                    `json:"total_servis_hari_ini"`
	ServisDalamPerbaikan     int                    `json:"servis_dalam_perbaikan"`
	ServisSelesai            int                    `json:"servis_selesai"`
	StokMenipis              int                    `json:"stok_menipis"`
	TotalPendapatanHariIni   float64                `json:"total_pendapatan_hari_ini"`
	TotalPendapatanBulanIni  float64                `json:"total_pendapatan_bulan_ini"`
	ServisHariIni            []ServisHariIni        `json:"servis_hari_ini"`
	BarangMenipis            []BarangMenipis        `json:"barang_menipis"`
}

type ServisHariIni struct {
	IDServis       int    `json:"id_servis"`
	NamaPelanggan  string `json:"nama_pelanggan"`
	TipeHP         string `json:"tipe_hp"`
	StatusServis   string `json:"status_servis"`
}

type BarangMenipis struct {
	IDBarang    int    `json:"id_barang"`
	NamaBarang  string `json:"nama_barang"`
	Stok        int    `json:"stok"`
}

// =======================================================
// GET DASHBOARD PEGAWAI DAN ADMIN STATS
// =======================================================
  //ADMIN
	func GetDashboardAdmin(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var stats DashboardAdminStats
		today := time.Now().Format("2006-01-02")

		// 1. Total Servis Hari Ini
		err := database.DB.QueryRow(`
			SELECT COUNT(*) 
			FROM servis 
			WHERE DATE(tanggal_masuk) = ?
		`, today).Scan(&stats.TotalServisHariIni)
		
		if err != nil {
			log.Println(" Error query total servis hari ini:", err)
			stats.TotalServisHariIni = 0
		}

	// 2. Servis Dalam Perbaikan (semua, tidak hanya hari ini)
	err = database.DB.QueryRow(`
			SELECT COUNT(*) 
			FROM servis 
			WHERE status_servis = 'dalam_perbaikan'
	`).Scan(&stats.ServisDalamPerbaikan)

	if err != nil {
			log.Println(" Error query servis dalam perbaikan:", err)
			stats.ServisDalamPerbaikan = 0
	}

	// 3. Servis Selesai (semua, tidak hanya hari ini)
	err = database.DB.QueryRow(`
			SELECT COUNT(*) 
			FROM servis 
			WHERE status_servis = 'selesai' OR status_servis = 'siap_diambil'
	`).Scan(&stats.ServisSelesai)

	if err != nil {
			log.Println(" Error query servis selesai:", err)
			stats.ServisSelesai = 0
	}

		// 4. Stok Barang Menipis (stok <= 5)
		err = database.DB.QueryRow(`
			SELECT COUNT(*) 
			FROM barang 
			WHERE stok <= 5
		`).Scan(&stats.StokMenipis)
		
		if err != nil {
			log.Println(" Error query stok menipis:", err)
			stats.StokMenipis = 0
		}

		// 5. Total Pendapatan Hari Ini
		err = database.DB.QueryRow(`
			SELECT COALESCE(SUM(biaya_total), 0) 
			FROM servis 
			WHERE DATE(tanggal_masuk) = ?
		`, today).Scan(&stats.TotalPendapatanHariIni)
		
		if err != nil {
			log.Println(" Error query pendapatan hari ini:", err)
			stats.TotalPendapatanHariIni = 0
		}

		// 6. Total Pendapatan Bulan Ini
		err = database.DB.QueryRow(`
			SELECT COALESCE(SUM(biaya_total), 0) 
			FROM servis 
			WHERE MONTH(tanggal_masuk) = MONTH(CURDATE())
			AND YEAR(tanggal_masuk) = YEAR(CURDATE())
		`).Scan(&stats.TotalPendapatanBulanIni)
		
		if err != nil {
			log.Println(" Error query pendapatan bulan ini:", err)
			stats.TotalPendapatanBulanIni = 0
		}

		// 7. List Servis Hari Ini (max 5 terbaru)
		rows, err := database.DB.Query(`
			SELECT 
				id_servis,
				nama_pelanggan,
				tipe_hp,
				status_servis
			FROM servis
			WHERE DATE(tanggal_masuk) = ?
			ORDER BY id_servis DESC
			LIMIT 5
		`, today)

		if err != nil {
			log.Println(" Error query servis hari ini list:", err)
		} else {
			defer rows.Close()
			stats.ServisHariIni = []ServisHariIni{}
			
			for rows.Next() {
				var s ServisHariIni
				err := rows.Scan(
					&s.IDServis,
					&s.NamaPelanggan,
					&s.TipeHP,
					&s.StatusServis,
				)
				if err == nil {
					stats.ServisHariIni = append(stats.ServisHariIni, s)
				}
			}
		}

		// 8. List Barang Menipis (stok <= 5)
		rowsBarang, err := database.DB.Query(`
			SELECT 
				id_barang,
				nama_barang,
				stok
			FROM barang
			WHERE stok <= 5
			ORDER BY stok ASC
			LIMIT 5
		`)

		if err != nil {
			log.Println(" Error query barang menipis list:", err)
		} else {
			defer rowsBarang.Close()
			stats.BarangMenipis = []BarangMenipis{}
			
			for rowsBarang.Next() {
				var b BarangMenipis
				err := rowsBarang.Scan(
					&b.IDBarang,
					&b.NamaBarang,
					&b.Stok,
				)
				if err == nil {
					stats.BarangMenipis = append(stats.BarangMenipis, b)
				}
			}
		}

		// Return response
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(stats)
	}

  //PEGAWAI
	func GetDashboardPegawai(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var stats DashboardPegawaiStats
		today := time.Now().Format("2006-01-02")

		// 1. Total Servis Hari Ini
		err := database.DB.QueryRow(`
			SELECT COUNT(*) 
			FROM servis 
			WHERE DATE(tanggal_masuk) = ?
		`, today).Scan(&stats.TotalServisHariIni)
		
		if err != nil {
			log.Println(" Error query total servis hari ini:", err)
			stats.TotalServisHariIni = 0
		}

			// 2. Servis Dalam Perbaikan (semua, tidak hanya hari ini)
	err = database.DB.QueryRow(`
			SELECT COUNT(*) 
			FROM servis 
			WHERE status_servis = 'dalam_perbaikan'
	`).Scan(&stats.ServisDalamPerbaikan)

	if err != nil {
			log.Println(" Error query servis dalam perbaikan:", err)
			stats.ServisDalamPerbaikan = 0
	}

	// 3. Servis Selesai (semua, tidak hanya hari ini)
	err = database.DB.QueryRow(`
			SELECT COUNT(*) 
			FROM servis 
			WHERE status_servis = 'selesai' OR status_servis = 'siap_diambil'
	`).Scan(&stats.ServisSelesai)

	if err != nil {
			log.Println(" Error query servis selesai:", err)
			stats.ServisSelesai = 0
	}

		// 4. Stok Barang Menipis (stok <= 5)
		err = database.DB.QueryRow(`
			SELECT COUNT(*) 
			FROM barang 
			WHERE stok <= 5
		`).Scan(&stats.StokMenipis)
		
		if err != nil {
			log.Println(" Error query stok menipis:", err)
			stats.StokMenipis = 0
		}

		// 5. Total Pendapatan Hari Ini
		err = database.DB.QueryRow(`
			SELECT COALESCE(SUM(biaya_total), 0) 
			FROM servis 
			WHERE DATE(tanggal_masuk) = ?
		`, today).Scan(&stats.TotalPendapatanHariIni)
		
		if err != nil {
			log.Println(" Error query pendapatan hari ini:", err)
			stats.TotalPendapatanHariIni = 0
		}

		// 6. Total Pendapatan Bulan Ini
		err = database.DB.QueryRow(`
			SELECT COALESCE(SUM(biaya_total), 0) 
			FROM servis 
			WHERE MONTH(tanggal_masuk) = MONTH(CURDATE())
			AND YEAR(tanggal_masuk) = YEAR(CURDATE())
		`).Scan(&stats.TotalPendapatanBulanIni)
		
		if err != nil {
			log.Println(" Error query pendapatan bulan ini:", err)
			stats.TotalPendapatanBulanIni = 0
		}

		// 7. List Servis Hari Ini (max 5 terbaru)
		rows, err := database.DB.Query(`
			SELECT 
				id_servis,
				nama_pelanggan,
				tipe_hp,
				status_servis
			FROM servis
			WHERE DATE(tanggal_masuk) = ?
			ORDER BY id_servis DESC
			LIMIT 5
		`, today)

		if err != nil {
			log.Println(" Error query servis hari ini list:", err)
		} else {
			defer rows.Close()
			stats.ServisHariIni = []ServisHariIni{}
			
			for rows.Next() {
				var s ServisHariIni
				err := rows.Scan(
					&s.IDServis,
					&s.NamaPelanggan,
					&s.TipeHP,
					&s.StatusServis,
				)
				if err == nil {
					stats.ServisHariIni = append(stats.ServisHariIni, s)
				}
			}
		}

		// 8. List Barang Menipis (stok <= 5)
		rowsBarang, err := database.DB.Query(`
			SELECT 
				id_barang,
				nama_barang,
				stok
			FROM barang
			WHERE stok <= 5
			ORDER BY stok ASC
			LIMIT 5
		`)

		if err != nil {
			log.Println(" Error query barang menipis list:", err)
		} else {
			defer rowsBarang.Close()
			stats.BarangMenipis = []BarangMenipis{}
			
			for rowsBarang.Next() {
				var b BarangMenipis
				err := rowsBarang.Scan(
					&b.IDBarang,
					&b.NamaBarang,
					&b.Stok,
				)
				if err == nil {
					stats.BarangMenipis = append(stats.BarangMenipis, b)
				}
			}
		}

		// Return response
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(stats)
	}

// =======================================================
// GET SIMPLE STATS (untuk widget kecil)
// =======================================================
func GetSimpleStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	type SimpleStats struct {
		TotalServis      int     `json:"total_servis"`
		TotalPendapatan  float64 `json:"total_pendapatan"`
		ServisSelesai    int     `json:"servis_selesai"`
		ServisProses     int     `json:"servis_proses"`
	}

	var stats SimpleStats
	today := time.Now().Format("2006-01-02")

	// Query data
	database.DB.QueryRow(`
		SELECT 
			COUNT(*),
			COALESCE(SUM(biaya_total), 0),
			SUM(CASE WHEN status_servis IN ('selesai', 'siap_diambil') THEN 1 ELSE 0 END),
			SUM(CASE WHEN status_servis = 'dalam_perbaikan' THEN 1 ELSE 0 END)
		FROM servis
		WHERE DATE(tanggal_masuk) = ?
	`, today).Scan(
		&stats.TotalServis,
		&stats.TotalPendapatan,
		&stats.ServisSelesai,
		&stats.ServisProses,
	)

	json.NewEncoder(w).Encode(stats)
}