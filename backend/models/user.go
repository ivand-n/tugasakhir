package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// untuk jwt(auth dan middleware)
var jwtKey = []byte("chicka_keren")

var googleOauthConfig = &oauth2.Config{
	ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),     // Client ID dari Google Cloud Console
	ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"), // Client Secret dari Google Cloud Console
	RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URI"),  // Redirect URL
	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
	Endpoint:     google.Endpoint,
}

// Fungsi untuk membuat token JWT
func generateJWT(email string) (string, error) {
	claims := &jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(6 * time.Hour).Unix(),
		"iat":   time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

// Login with google
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	state := "random-state-token" // Anda dapat menggunakan nilai acak di sini
	http.SetCookie(w, &http.Cookie{
		Name:  "oauthstate",
		Value: state,
		Path:  "/",
	})
	url := googleOauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// Logout handler
func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	// Hapus cookie atau blacklist token (jika menggunakan mekanisme blacklist)
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Unix(0, 0), // Set waktu kedaluwarsa ke masa lalu
		HttpOnly: true,
		Path:     "/",
	})

	// Kirim respons sukses
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Logged out successfully"))
}

// Callback handler
func CallbackHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		state, err := r.Cookie("oauthstate")
		if err != nil || r.URL.Query().Get("state") != state.Value {
			http.Error(w, "Invalid state token", http.StatusBadRequest)
			return
		}

		code := r.URL.Query().Get("code")
		if code == "" {
			http.Error(w, "Code not found", http.StatusBadRequest)
			return
		}

		//tukar code dengan token
		token, err := googleOauthConfig.Exchange(context.Background(), code)
		if err != nil {
			http.Error(w, "Failed to exchange token", http.StatusInternalServerError)
			log.Println("Error exchanging token:", err)
			return
		}

		// Gunakan token untuk mendapatkan informasi pengguna
		client := googleOauthConfig.Client(context.Background(), token)
		resp, err := client.Get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json")
		if err != nil {
			http.Error(w, "Failed to get user info", http.StatusInternalServerError)
			log.Println("Error getting user info:", err)
			return
		}
		defer resp.Body.Close()

		// Decode informasi pengguna
		var userInfo struct {
			Email   string `json:"email"`
			Name    string `json:"name"`
			Picture string `json:"picture"`
			Id      string `json:"id"`
			Kategori int	`json:"kategori"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
			http.Error(w, "Failed to decode user info", http.StatusInternalServerError)
			log.Println("Error decoding user info:", err)
			return
		}

		// Simpan informasi pengguna ke dalam database
		err = SaveOrUpdateUser(db, userInfo)
		if err != nil {
			http.Error(w, "Failed to save user info", http.StatusInternalServerError)
			log.Println("Error saving user info:", err)
			return
		}

		// Buat token JWT
		jwtToken, err := generateJWT(userInfo.Email)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			log.Println("Error generating token:", err)
			return
		}
		// Tentukan host frontend dari environment variable
		host := os.Getenv("FRONTEND_HOST")

		// http://localhost:3000
		// http://chickabroiler.cloud
		// Redirect ke frontend dengan token sebagai query parameter
		redirectURL := fmt.Sprintf(
			"http://%s/monitoring/callback?token=%s&name=%s&email=%s&picture=%s",
			host, jwtToken, userInfo.Name, userInfo.Email, userInfo.Picture,
		)
		http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
	}
}

func SaveOrUpdateUser(db *sql.DB, userInfo struct {
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
	Id      string `json:"id"`
	Kategori int	`json:"kategori"`
}) error {
	_, err := db.Exec(`
		INSERT INTO users (nama, email, google_id, profile, kategori)
		VALUES (?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
		nama = VALUES(nama),
		email = VALUES(email),
		google_id = VALUES(google_id),
		profile = VALUES(profile),
		kategori = 0`,
		userInfo.Name, userInfo.Email, userInfo.Id, userInfo.Picture, userInfo.Kategori)
	return err
}