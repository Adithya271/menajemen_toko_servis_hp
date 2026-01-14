package main

import (
	"log"
	"net/http"
	"service_hp/database"
	"service_hp/routes"
	m "service_hp/routes/middleware"
  
	

)

func main() {
	database.Connect()
 
	// Buat mux khusus daripada DefaultServeMux
	mux := http.NewServeMux()

	// Daftarkan route ke mux
	routes.RegisterRoutes(mux)

	// Bungkus seluruh mux dengan middleware CORS
	handler := m.CorsMiddleware(mux)

	log.Println("Server berjalan di http://localhost:8080")
	http.ListenAndServe(":8080", handler)
}
