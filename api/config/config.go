package config

import "os"

var (
    JWTSecret = getEnv("JWT_SECRET", "your-secret-key") // ganti di env
)

func getEnv(key, fallback string) string {
    if v := os.Getenv(key); v != "" {
        return v
    }
    return fallback
}
