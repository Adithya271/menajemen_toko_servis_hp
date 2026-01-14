package controllers

import (
	"encoding/json"
	"net/http"
	"service_hp/database"
	"strconv"
	"strings"
	"log"

	"golang.org/x/crypto/bcrypt"
)

// GET: Ambil user yang belum jadi pegawai (role=pegawai tapi belum ada di tabel pegawai)
func GetAvailableUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	rows, err := database.DB.Query(`
		SELECT u.id_user, u.nama, u.username
		FROM user u
		LEFT JOIN pegawai p ON u.id_user = p.id_user
		WHERE u.role = 'pegawai' AND p.id_pegawai IS NULL
		ORDER BY u.nama ASC
	`)
	if err != nil {
		log.Println(" Error query available users:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	defer rows.Close()

	var users []map[string]interface{}

	for rows.Next() {
		var idUser int
		var nama, username string

		err := rows.Scan(&idUser, &nama, &username)
		if err != nil {
			log.Println(" Error scan row:", err)
			continue
		}

		users = append(users, map[string]interface{}{
			"id_user":  idUser,
			"nama":     nama,
			"username": username,
		})
	}

	if users == nil {
		users = []map[string]interface{}{}
	}

	log.Println(" Available users:", len(users))
	json.NewEncoder(w).Encode(users)
}

// GET: Ambil semua pegawai
func GetAllPegawai(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	rows, err := database.DB.Query(`
		SELECT 
			p.id_pegawai,
			p.id_user,
			u.nama,
			u.username,
			p.jabatan,
			COALESCE(p.alamat, '') as alamat,
			COALESCE(p.no_hp, '') as no_hp,
			COALESCE(DATE_FORMAT(p.tanggal_masuk, '%Y-%m-%d'), '') as tanggal_masuk,
			p.status
		FROM pegawai p
		JOIN user u ON p.id_user = u.id_user
		ORDER BY p.id_pegawai DESC
	`)
	if err != nil {
		log.Println(" Error query pegawai:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	defer rows.Close()

	var data []map[string]interface{}

	for rows.Next() {
		var idPegawai, idUser int
		var nama, username, jabatan, alamat, noHP, tanggalMasuk, status string

		err := rows.Scan(&idPegawai, &idUser, &nama, &username, &jabatan, &alamat, &noHP, &tanggalMasuk, &status)
		if err != nil {
			log.Println(" Error scan row:", err)
			continue
		}

		item := map[string]interface{}{
			"id_pegawai":    idPegawai,
			"id_user":       idUser,
			"nama_pegawai":  nama,
			"username":      username,
			"jabatan":       jabatan,
			"alamat":        alamat,
			"no_hp":         noHP,
			"tanggal_masuk": tanggalMasuk,
			"status":        status,
		}
		data = append(data, item)
	}

	if data == nil {
		data = []map[string]interface{}{}
	}

	log.Println(" Total pegawai:", len(data))
	json.NewEncoder(w).Encode(data)
}

// POST: Tambah pegawai (pilih dari user yang sudah ada)
func CreatePegawai(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	var req struct {
		IDUser  int    `json:"id_user"`
		Jabatan string `json:"jabatan"`
		Alamat  string `json:"alamat"`
		NoHP    string `json:"no_hp"`
		Status  string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println(" Error decode JSON:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	log.Println(" Request create pegawai untuk user ID:", req.IDUser)

	// Validasi
	if req.IDUser == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "User harus dipilih"})
		return
	}

	if req.Jabatan == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Jabatan wajib diisi"})
		return
	}

	// Ambil nama dari tabel user
	var namaUser string
	err := database.DB.QueryRow("SELECT nama FROM user WHERE id_user=?", req.IDUser).Scan(&namaUser)
	if err != nil {
		log.Println(" Error get user nama:", err)
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "User tidak ditemukan"})
		return
	}

	log.Println(" Nama user:", namaUser)

	// Cek apakah user sudah jadi pegawai
	var exists int
	err = database.DB.QueryRow("SELECT COUNT(*) FROM pegawai WHERE id_user=?", req.IDUser).Scan(&exists)
	if err != nil {
		log.Println(" Error check existing pegawai:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	if exists > 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "User ini sudah terdaftar sebagai pegawai"})
		return
	}

	// Set default status
	if req.Status == "" {
		req.Status = "Aktif"
	}

	// Insert pegawai DENGAN nama_pegawai
	_, err = database.DB.Exec(`
		INSERT INTO pegawai (id_user, nama_pegawai, jabatan, alamat, no_hp, tanggal_masuk, status)
		VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
		req.IDUser, namaUser, req.Jabatan, req.Alamat, req.NoHP, req.Status)

	if err != nil {
		log.Println(" Error insert pegawai:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	log.Println(" Pegawai berhasil ditambahkan untuk user ID:", req.IDUser)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Pegawai berhasil ditambahkan"})
}

// PUT: Edit pegawai
func UpdatePegawai(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Ambil ID dari URL path
	path := r.URL.Path
	parts := strings.Split(strings.TrimSuffix(path, "/"), "/")
	if len(parts) < 2 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid URL format"})
		return
	}
	
	idPegawai, err := strconv.Atoi(parts[len(parts)-1])
	if err != nil {
		log.Println(" Error parse ID:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID"})
		return
	}

	log.Println(" Update pegawai ID:", idPegawai)

	var req struct {
		Password string `json:"password,omitempty"`
		Jabatan  string `json:"jabatan"`
		Alamat   string `json:"alamat"`
		NoHP     string `json:"no_hp"`
		Status   string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println(" Error decode JSON:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Ambil id_user dari pegawai
	var idUser int
	err = database.DB.QueryRow("SELECT id_user FROM pegawai WHERE id_pegawai=?", idPegawai).Scan(&idUser)
	if err != nil {
		log.Println(" Pegawai tidak ditemukan:", err)
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Pegawai tidak ditemukan"})
		return
	}

	// Update password jika diisi
	if req.Password != "" && strings.TrimSpace(req.Password) != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Println(" Error hash password:", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to hash password"})
			return
		}
		
		_, err = database.DB.Exec("UPDATE user SET password=? WHERE id_user=?", string(hash), idUser)
		if err != nil {
			log.Println(" Error update password:", err)
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		log.Println(" Password updated")
	}

	// Update pegawai
	_, err = database.DB.Exec(`
		UPDATE pegawai 
		SET jabatan=?, alamat=?, no_hp=?, status=? 
		WHERE id_pegawai=?`,
		req.Jabatan, req.Alamat, req.NoHP, req.Status, idPegawai)
	
	if err != nil {
		log.Println(" Error update pegawai:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	log.Println(" Pegawai berhasil diperbarui")
	json.NewEncoder(w).Encode(map[string]string{"message": "Pegawai berhasil diperbarui"})
}

// DELETE: Hapus pegawai (hanya dari tabel pegawai, user tetap ada)
func DeletePegawai(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Ambil ID dari URL path
	path := r.URL.Path
	parts := strings.Split(strings.TrimSuffix(path, "/"), "/")
	if len(parts) < 2 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid URL format"})
		return
	}
	
	idPegawai, err := strconv.Atoi(parts[len(parts)-1])
	if err != nil {
		log.Println(" Error parse ID:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID"})
		return
	}

	log.Println(" Delete pegawai ID:", idPegawai)

	// Hapus hanya dari tabel pegawai, user tetap ada
	result, err := database.DB.Exec("DELETE FROM pegawai WHERE id_pegawai=?", idPegawai)
	if err != nil {
		log.Println(" Error delete pegawai:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Pegawai tidak ditemukan"})
		return
	}

	log.Println(" Pegawai berhasil dihapus (user tetap ada)")
	json.NewEncoder(w).Encode(map[string]string{"message": "Pegawai berhasil dihapus"})
}