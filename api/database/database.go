package database

import (
    "database/sql"
    "fmt"
    "log"

    _ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func Connect() {
    username := "root"
    password := ""              // default Laragon password kosong
    host := "localhost"
    port := "3306"
    database := "service_hp"

    dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
        username, password, host, port, database,
    )

    var err error

    DB, err = sql.Open("mysql", dsn)
    if err != nil {
        log.Fatal("Gagal membuka koneksi database:", err)
    }

    err = DB.Ping()
    if err != nil {
        log.Fatal("Tidak dapat terhubung ke database:", err)
    }

    fmt.Println("Database MySQL berhasil terhubung!")
}
