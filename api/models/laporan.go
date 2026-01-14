package models

import "time"

// Laporan - Model untuk tabel laporan
type Laporan struct {
	IDLaporan       int       `json:"id_laporan"`
	JudulLaporan    string    `json:"judul_laporan"`
	JenisLaporan    string    `json:"jenis_laporan"`
	TanggalAwal     string    `json:"tanggal_awal"`
	TanggalAkhir    string    `json:"tanggal_akhir"`
	TotalServis     int       `json:"total_servis"`
	TotalPendapatan float64   `json:"total_pendapatan"`
	TotalModal      float64   `json:"total_modal"`
	LabaBersih      float64   `json:"laba_bersih"`
	Keterangan      string    `json:"keterangan,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	
	// Untuk detail
	DetailServis []DetailLaporanServis `json:"detail_servis,omitempty"`
}

// DetailLaporanServis - Model untuk detail servis dalam laporan
type DetailLaporanServis struct {
	IDDetail       int     `json:"id_detail"`
	IDLaporan      int     `json:"id_laporan"`
	IDServis       int     `json:"id_servis"`
	NamaPelanggan  string  `json:"nama_pelanggan"`
	TipeHP         string  `json:"tipe_hp"`
	BiayaTotal     float64 `json:"biaya_total"`
	LabaServis     float64 `json:"laba_servis"`
}

// GenerateLaporanRequest - Request untuk generate laporan
type GenerateLaporanRequest struct {
	JenisLaporan string `json:"jenis_laporan"`
	TanggalAwal  string `json:"tanggal_awal"`
	TanggalAkhir string `json:"tanggal_akhir"`
	Keterangan   string `json:"keterangan"`
}

// DashboardStats - Stats untuk dashboard
type DashboardStats struct {
	HariIni   PeriodStats   `json:"hari_ini"`
	MingguIni PeriodStats   `json:"minggu_ini"`
	BulanIni  PeriodStats   `json:"bulan_ini"`
	ChartPendapatan []ChartData `json:"chart_pendapatan"`
}

type PeriodStats struct {
	TotalServis     int     `json:"total_servis"`
	TotalPendapatan float64 `json:"total_pendapatan"`
	LabaBersih      float64 `json:"laba_bersih"`
}

type ChartData struct {
	Tanggal    string  `json:"tanggal"`
	Pendapatan float64 `json:"pendapatan"`
}