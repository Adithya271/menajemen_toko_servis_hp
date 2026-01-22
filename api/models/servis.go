package models

type Servis struct {
    IDServis       int             `json:"id_servis"`
    NamaPelanggan  string          `json:"nama_pelanggan"`
    NoWhatsapp     string          `json:"no_whatsapp"`
    TipeHP         string          `json:"tipe_hp"`
    Keluhan        string          `json:"keluhan"`
    StatusServis   string          `json:"status_servis"`
    BiayaServis    float64         `json:"biaya_servis"`
    BiayaTotal     float64         `json:"biaya_total"`
    TanggalMasuk   string          `json:"tanggal_masuk"`
    TanggalSelesai *string         `json:"tanggal_selesai"`
    Detail         []DetailServis  `json:"detail"`
}
