package middleware

import (
    "context"
    "net/http"
    "strings"
    "service_hp/config"
    "github.com/golang-jwt/jwt/v4"
    "fmt"
)

type key string

const (
    UserContextKey key = "claims"
    UserIDKey      key = "user_id"
    RoleKey        key = "role"
)

func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {

        // Ambil Authorization header
        auth := r.Header.Get("Authorization")
        if auth == "" {
            http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
            return
        }

        parts := strings.SplitN(auth, " ", 2)
        if len(parts) != 2 || parts[0] != "Bearer" {
            http.Error(w, "Invalid Authorization header", http.StatusUnauthorized)
            return
        }

        tokenStr := parts[1]

        token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("invalid signing method")
            }
            return []byte(config.JWTSecret), nil
        })

        if err != nil || !token.Valid {
            http.Error(w, "Invalid token", http.StatusUnauthorized)
            return
        }

        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
            http.Error(w, "Invalid token claims", http.StatusUnauthorized)
            return
        }

        // Ambil user_id dari claims JWT
        userIDFloat, ok := claims["user_id"].(float64)
        if !ok {
            http.Error(w, "user_id not found in token", http.StatusUnauthorized)
            return
        }
        userID := int(userIDFloat)

        // Ambil role dari claims
        role, _ := claims["role"].(string)

        // Simpan semuanya ke context
        ctx := r.Context()
        ctx = context.WithValue(ctx, UserContextKey, claims)
        ctx = context.WithValue(ctx, UserIDKey, userID)
        ctx = context.WithValue(ctx, RoleKey, role)

        next(w, r.WithContext(ctx))
    }
}

func RequireRole(role string, next http.HandlerFunc) http.HandlerFunc {
    return RequireAuth(func(w http.ResponseWriter, r *http.Request) {

        roleInToken, _ := r.Context().Value(RoleKey).(string)

        if roleInToken != role {
            http.Error(w, "Forbidden", http.StatusForbidden)
            return
        }

        next(w, r)
    })
}
