package controllers


import (
    "database/sql"
    "encoding/json"
    
    "net/http"
    "service_hp/config"
    "service_hp/database"
    "service_hp/models"
    "time"
    "log"
    "golang.org/x/crypto/bcrypt"
    "github.com/golang-jwt/jwt/v4"
)

func Register(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
        return
    }

    var req models.User
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    // simple validation
    if req.Username == "" || req.Password == "" || req.Nama == "" {
        http.Error(w, "nama, username and password are required", http.StatusBadRequest)
        return
    }

    // check username exists
    var exists string
    err := database.DB.QueryRow("SELECT username FROM user WHERE username = ?", req.Username).Scan(&exists)
    if err != nil && err != sql.ErrNoRows {
        log.Println("DB check error:", err)
        http.Error(w, "Server error", http.StatusInternalServerError)
        return
    }
    if exists != "" {
        http.Error(w, "Username already exists", http.StatusConflict)
        return
    }

    // hash password
    hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Failed to hash password", http.StatusInternalServerError)
        return
    }

    // insert role=pegawai
    res, err := database.DB.Exec("INSERT INTO user (nama, username, password, role) VALUES (?, ?, ?, ?)",
        req.Nama, req.Username, string(hashed), "pegawai")
    if err != nil {
        log.Println("DB insert error:", err)
        http.Error(w, "Failed to create user", http.StatusInternalServerError)
        return
    }

    lastID, _ := res.LastInsertId()
    resp := map[string]interface{}{
        "message": "User created",
        "user": map[string]interface{}{
            "id_user": lastID,
            "nama": req.Nama,
            "username": req.Username,
            "role": "pegawai",
        },
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(resp)
}

func Login(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
        return
    }

    var req models.User
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    var user models.User
    err := database.DB.QueryRow("SELECT id_user, nama, username, password, role FROM user WHERE username = ?", req.Username).
        Scan(&user.ID, &user.Nama, &user.Username, &user.Password, &user.Role)
    if err == sql.ErrNoRows {
        http.Error(w, "User not found", http.StatusUnauthorized)
        return
    } else if err != nil {
        log.Println("DB error:", err)
        http.Error(w, "Server error", http.StatusInternalServerError)
        return
    }

    // compare hashed password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
        http.Error(w, "Wrong password", http.StatusUnauthorized)
        return
    }

    // create JWT
    claims := jwt.MapClaims{
        "user_id": user.ID,
        "username": user.Username,
        "role": user.Role,
        "exp": time.Now().Add(time.Hour * 24).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString([]byte(config.JWTSecret))
    if err != nil {
        log.Println("JWT sign error:", err)
        http.Error(w, "Server error", http.StatusInternalServerError)
        return
    }

    resp := map[string]interface{}{
        "message": "Login success",
        "token": tokenString,
        "user": map[string]interface{}{
            "id_user": user.ID,
            "nama": user.Nama,
            "username": user.Username,
            "role": user.Role,
        },
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(resp)
}

func SignUpPegawai(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
        return
    }

    var req models.User
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    // Cek username duplikat
    var exists string
    err := database.DB.QueryRow("SELECT username FROM user WHERE username = ?", req.Username).Scan(&exists)
    if err != sql.ErrNoRows {
        http.Error(w, "Username sudah digunakan", http.StatusConflict)
        return
    }

    // Hash password
    hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)

    // Insert user pegawai
    _, err = database.DB.Exec(`
        INSERT INTO user (nama, username, password, role)
        VALUES (?, ?, ?, 'pegawai')
    `, req.Nama, req.Username, string(hashed))
    if err != nil {
        log.Println("DB insert error:", err)
        http.Error(w, "Server error", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "message": "Registrasi berhasil",
    })
}
