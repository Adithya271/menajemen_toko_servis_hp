package controllers

import (
	"encoding/json"
	"net/http"
	"service_hp/database"
	"service_hp/models"
	"strconv"
	"strings"
	"log"
)

// GET: Ambil semua barang
func GetAllBarang(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	rows, err := database.DB.Query(`
		SELECT 
			id_barang,
			nama_barang,
			stok,
			harga,
			COALESCE(harga_modal, 0) as harga_modal
		FROM barang
		ORDER BY nama_barang ASC
	`)
	if err != nil {
		log.Println(" Error query barang:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	defer rows.Close()

	var barangList []models.Barang

	for rows.Next() {
		var b models.Barang
		err := rows.Scan(
			&b.IDBarang,
			&b.NamaBarang,
			&b.Stok,
			&b.Harga,
			&b.HargaModal,
		)
		if err != nil {
			log.Println(" Error scan row:", err)
			continue
		}
		barangList = append(barangList, b)
	}

	if barangList == nil {
		barangList = []models.Barang{}
	}

	log.Println(" Total barang:", len(barangList))
	json.NewEncoder(w).Encode(barangList)
}

// POST: Tambah barang baru
func CreateBarang(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	var req models.Barang

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println(" Error decode JSON:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	log.Printf("📦 Request create barang: %s (Harga: %.2f, Modal: %.2f)", 
		req.NamaBarang, req.Harga, req.HargaModal)

	// Validasi
	if req.NamaBarang == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Nama barang wajib diisi"})
		return
	}

	if req.Stok < 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Stok tidak boleh negatif"})
		return
	}

	if req.Harga < 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Harga tidak boleh negatif"})
		return
	}

	if req.HargaModal < 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Harga modal tidak boleh negatif"})
		return
	}

	// Validasi logis: Harga modal tidak boleh lebih besar dari harga jual
	if req.HargaModal > req.Harga {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Harga modal tidak boleh lebih besar dari harga jual",
		})
		return
	}

	// Insert barang dengan harga_modal
	result, err := database.DB.Exec(`
		INSERT INTO barang (nama_barang, stok, harga, harga_modal)
		VALUES (?, ?, ?, ?)`,
		req.NamaBarang, req.Stok, req.Harga, req.HargaModal)

	if err != nil {
		log.Println(" Error insert barang:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	lastID, _ := result.LastInsertId()
	log.Println(" Barang berhasil ditambahkan dengan ID:", lastID)
	
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Barang berhasil ditambahkan",
		"id_barang": lastID,
	})
}

// PUT: Update barang
func UpdateBarang(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Ambil ID dari URL path
	path := r.URL.Path
	parts := strings.Split(strings.TrimSuffix(path, "/"), "/")
	if len(parts) < 2 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid URL format"})
		return
	}
	
	idBarang, err := strconv.Atoi(parts[len(parts)-1])
	if err != nil {
		log.Println(" Error parse ID:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID"})
		return
	}

	log.Println(" Update barang ID:", idBarang)

	var req models.Barang

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Println(" Error decode JSON:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	log.Printf(" Update data: %s (Harga: %.2f, Modal: %.2f)", 
		req.NamaBarang, req.Harga, req.HargaModal)

	// Validasi
	if req.NamaBarang == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Nama barang wajib diisi"})
		return
	}

	if req.Stok < 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Stok tidak boleh negatif"})
		return
	}

	if req.Harga < 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Harga tidak boleh negatif"})
		return
	}

	if req.HargaModal < 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Harga modal tidak boleh negatif"})
		return
	}

	// Validasi logis
	if req.HargaModal > req.Harga {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Harga modal tidak boleh lebih besar dari harga jual",
		})
		return
	}

	// Update barang dengan harga_modal
	result, err := database.DB.Exec(`
		UPDATE barang 
		SET nama_barang=?, stok=?, harga=?, harga_modal=?
		WHERE id_barang=?`,
		req.NamaBarang, req.Stok, req.Harga, req.HargaModal, idBarang)
	
	if err != nil {
		log.Println(" Error update barang:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Barang tidak ditemukan"})
		return
	}

	log.Println(" Barang berhasil diperbarui")
	json.NewEncoder(w).Encode(map[string]string{"message": "Barang berhasil diperbarui"})
}

// DELETE: Hapus barang
func DeleteBarang(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// Ambil ID dari URL path
	path := r.URL.Path
	parts := strings.Split(strings.TrimSuffix(path, "/"), "/")
	if len(parts) < 2 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid URL format"})
		return
	}
	
	idBarang, err := strconv.Atoi(parts[len(parts)-1])
	if err != nil {
		log.Println(" Error parse ID:", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID"})
		return
	}

	log.Println(" Delete barang ID:", idBarang)

	result, err := database.DB.Exec("DELETE FROM barang WHERE id_barang=?", idBarang)
	if err != nil {
		log.Println(" Error delete barang:", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Barang tidak ditemukan"})
		return
	}

	log.Println(" Barang berhasil dihapus")
	json.NewEncoder(w).Encode(map[string]string{"message": "Barang berhasil dihapus"})
}