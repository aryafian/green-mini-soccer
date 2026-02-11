# Setup Google OAuth untuk Login

## Langkah-langkah Setup Google OAuth Client ID:

### 1. Buka Google Cloud Console
Buka [Google Cloud Console](https://console.cloud.google.com/)

### 2. Buat Project Baru (atau pilih yang sudah ada)
- Klik dropdown project di bagian atas
- Klik "NEW PROJECT"
- Beri nama project Anda (contoh: "Mini Soccer Booking")
- Klik "CREATE"

### 3. Enable Google+ API
- Di menu navigasi kiri, pilih "APIs & Services" > "Library"
- Cari "Google+ API"
- Klik dan tekan "ENABLE"

### 4. Buat OAuth 2.0 Credentials
- Di menu navigasi kiri, pilih "APIs & Services" > "Credentials"
- Klik "CREATE CREDENTIALS" > "OAuth client ID"
- Jika diminta, konfigurasikan OAuth consent screen terlebih dahulu:
  - Pilih "External" untuk user type
  - Isi App name: "Mini Soccer Booking"
  - Isi User support email: email Anda
  - Isi Developer contact information: email Anda
  - Klik "SAVE AND CONTINUE"
  - Skip scopes, tekan "SAVE AND CONTINUE"
  - Skip test users, tekan "SAVE AND CONTINUE"

### 5. Buat Client ID
- Kembali ke "Credentials" > "CREATE CREDENTIALS" > "OAuth client ID"
- Application type: pilih "Web application"
- Name: "Mini Soccer Web Client"
- Authorized JavaScript origins:
  - Tambahkan: `http://localhost:5173` (untuk development)
  - Tambahkan: `http://localhost:3000` (alternatif port)
- Authorized redirect URIs: (kosongkan untuk sekarang)
- Klik "CREATE"

### 6. Copy Client ID
- Setelah dibuat, akan muncul popup dengan Client ID dan Client Secret
- **Copy Client ID** (format: xxxxx.apps.googleusercontent.com)
- Simpan di tempat aman

### 7. Update Aplikasi
Buka file `src/main.jsx` dan ganti:

```javascript
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
```

Dengan Client ID yang baru Anda copy.

### 8. Restart Development Server
```bash
npm run dev
```

## Testing
1. Buka aplikasi di browser
2. Klik tombol "Login"
3. Klik tombol "Continue with Google"
4. Pilih akun Google Anda
5. Izinkan akses
6. Login berhasil!

## Troubleshooting

### Error: "Popup closed by user"
- User menutup popup sebelum login selesai
- Coba lagi

### Error: "Invalid origin"
- Pastikan URL di browser sama dengan yang didaftarkan di Authorized JavaScript origins
- Untuk lokal development, pastikan menggunakan http://localhost:5173 atau http://localhost:3000

### Error: "Access blocked: This app's request is invalid"
- Pastikan OAuth consent screen sudah dikonfigurasi
- Pastikan email support dan developer contact sudah diisi

## Catatan Penting
- Client ID adalah **PUBLIC**, aman untuk di-commit ke repository
- Client Secret adalah **PRIVATE**, jangan pernah di-commit atau dibagikan
- Untuk production, tambahkan domain production Anda ke Authorized JavaScript origins

## Referensi
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google OAuth for Web](https://developers.google.com/identity/gsi/web/guides/overview)
