package models

type User struct {
    ID       int    `json:"id_user"`
    Nama     string `json:"nama"`
    Username string `json:"username"`
    Password string `json:"password"`
    Role     string `json:"role"` // admin, pegawai
}
