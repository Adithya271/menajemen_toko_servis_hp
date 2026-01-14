package routes

import (
	"net/http"
	"service_hp/controllers"
	"service_hp/routes/middleware"
)

func RegisterRoutes(mux *http.ServeMux) {

	// Home
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"message":"Service HP API is running"}`))
	})

	// Public
	mux.HandleFunc("/api/signup", controllers.SignUpPegawai)
	mux.HandleFunc("/api/login", controllers.Login)

	// Public - Search Servis (untuk landing page)
	mux.HandleFunc("/api/servis/search", func(w http.ResponseWriter, r *http.Request) {
		// Enable CORS for preflight
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		
		controllers.SearchServis(w, r)
	})



	// ============================================
	// ADMIN ROUTES
	// ============================================

	// Pegawai Management - Admin only
	mux.HandleFunc("/api/admin/pegawai/available-users", middleware.RequireRole("admin", controllers.GetAvailableUsers))

	mux.HandleFunc("/api/admin/pegawai", middleware.RequireRole("admin", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			controllers.GetAllPegawai(w, r)
		case http.MethodPost:
			controllers.CreatePegawai(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	mux.HandleFunc("/api/admin/pegawai/", middleware.RequireRole("admin", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/admin/pegawai/" || r.URL.Path == "/api/admin/pegawai" {
			http.Error(w, "ID required", http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodPut:
			controllers.UpdatePegawai(w, r)
		case http.MethodDelete:
			controllers.DeletePegawai(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	  // =====================================================
	 // PROTECTED ADMIN ROUTES - LAPORAN
	 // =====================================================
		mux.HandleFunc("/api/admin/dashboard-stats", func(w http.ResponseWriter, r *http.Request) {
		(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodGet {
				controllers.GetDashboardAdmin(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})(w, r)
	})

	mux.HandleFunc("/api/admin/simple-stats", func(w http.ResponseWriter, r *http.Request) {
		(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodGet {
				controllers.GetSimpleStats(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})(w, r)
	})
	
	mux.HandleFunc("/api/admin/dashboard", func(w http.ResponseWriter, r *http.Request) {
		(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodGet {
				controllers.GetDashboardStats(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})(w, r)
	})

	mux.HandleFunc("/api/admin/laporan", func(w http.ResponseWriter, r *http.Request) {
		(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				controllers.GetAllLaporan(w, r)
			case http.MethodPost:
				controllers.GenerateLaporan(w, r)
			default:
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})(w, r)
	})

	mux.HandleFunc("/api/admin/laporan/", func(w http.ResponseWriter, r *http.Request) {
		(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				controllers.GetLaporanDetail(w, r)
			case http.MethodDelete:
				controllers.DeleteLaporan(w, r)
			default:
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})(w, r)
	})





	// ============================================
	// PEGAWAI ROUTES
	// ============================================

	// Barang Management - Pegawai
	mux.HandleFunc("/api/pegawai/barang", middleware.RequireRole("pegawai", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			controllers.GetAllBarang(w, r)
		case http.MethodPost:
			controllers.CreateBarang(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	mux.HandleFunc("/api/pegawai/barang/", middleware.RequireRole("pegawai", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/pegawai/barang/" || r.URL.Path == "/api/pegawai/barang" {
			http.Error(w, "ID required", http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodPut:
			controllers.UpdateBarang(w, r)
		case http.MethodDelete:
			controllers.DeleteBarang(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}))

	// ============================
	// SERVIS (CRUD UTAMA)
	// ============================

	// GET ALL + CREATE
	mux.HandleFunc("/api/pegawai/servis", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			controllers.GetAllServis(w, r)
		case http.MethodPost:
			controllers.CreateServis(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})

	// GET DETAIL + UPDATE + DELETE
	mux.HandleFunc("/api/pegawai/servis/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			controllers.GetServisDetail(w, r)
		case http.MethodPut:
			controllers.UpdateServis(w, r)
		case http.MethodDelete:
			controllers.DeleteServis(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})


	// ============================
	// DETAIL SERVIS (ITEM BARANG)
	// ============================

	// CREATE DETAIL ITEM
	mux.HandleFunc("/api/pegawai/detail-servis", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			controllers.AddDetailServis(w, r)
			return
		}
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
	})

	// UPDATE / DELETE DETAIL ITEM
	mux.HandleFunc("/api/pegawai/detail-servis/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPut:
			controllers.UpdateDetailServis(w, r)
		case http.MethodDelete:
			controllers.DeleteDetailServis(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})

  // =====================================================
	// PROTECTED PEGAWAI ROUTES - LAPORAN
	// =====================================================
		mux.HandleFunc("/api/pegawai/dashboard-stats", func(w http.ResponseWriter, r *http.Request) {
		(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodGet {
				controllers.GetDashboardPegawai(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})(w, r)
	})

	mux.HandleFunc("/api/pegawai/simple-stats", func(w http.ResponseWriter, r *http.Request) {
		(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodGet {
				controllers.GetSimpleStats(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})(w, r)
	})
	
	mux.HandleFunc("/api/pegawai/dashboard", func(w http.ResponseWriter, r *http.Request) {
		(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodGet {
				controllers.GetDashboardStats(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})(w, r)
	})

	mux.HandleFunc("/api/pegawai/laporan", func(w http.ResponseWriter, r *http.Request) {
		(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				controllers.GetAllLaporan(w, r)
			case http.MethodPost:
				controllers.GenerateLaporan(w, r)
			default:
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})(w, r)
	})

	mux.HandleFunc("/api/pegawai/laporan/", func(w http.ResponseWriter, r *http.Request) {
		(func(w http.ResponseWriter, r *http.Request) {
			switch r.Method {
			case http.MethodGet:
				controllers.GetLaporanDetail(w, r)
			case http.MethodDelete:
				controllers.DeleteLaporan(w, r)
			default:
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		})(w, r)
	})


}
	
