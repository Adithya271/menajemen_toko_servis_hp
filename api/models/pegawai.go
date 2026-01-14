package models

type Pegawai struct {
    IDPegawai    int    `json:"id_pegawai"`
    IDUser       int    `json:"id_user"`
    NamaPegawai  string `json:"nama_pegawai"`
    Jabatan      string `json:"jabatan"` // kasir, teknisi
    Alamat       string `json:"alamat"`
    NoHP         string `json:"no_hp"`
    TanggalMasuk string `json:"tanggal_masuk"`
    Status       string `json:"status"` // aktif, nonaktif
}
