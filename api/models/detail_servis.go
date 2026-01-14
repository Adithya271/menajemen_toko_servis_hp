package models

type DetailServis struct {
    IDDetail     int      `json:"id_detail"`
    IDServis     int      `json:"id_servis"`
    IDBarang     *int     `json:"id_barang"`       // nullable 
    Deskripsi    string   `json:"deskripsi"`       // Nama item
    Jumlah       int      `json:"jumlah"`          // Qty
    HargaSatuan  float64  `json:"harga_satuan"`    // Harga per unit
    Biaya        float64  `json:"biaya"`           // Auto: jumlah × harga_satuan
   
}