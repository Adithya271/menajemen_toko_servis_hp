package models

type Barang struct {
    IDBarang    int     `json:"id_barang"`
    NamaBarang  string  `json:"nama_barang"`
    Stok        int     `json:"stok"`
    Harga       float64 `json:"harga"`        
    HargaModal  float64 `json:"harga_modal"`  
}