# Firebase Setup Guide untuk Mini Soccer

## Langkah 1: Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Add project"** atau **"Tambah project"**
3. Masukkan nama project (misalnya: "mini-soccer")
4. (Opsional) Aktifkan Google Analytics jika diperlukan
5. Klik **"Create project"**

## Langkah 2: Tambahkan Web App ke Firebase Project

1. Di halaman Firebase Console project Anda, klik ikon **Web** (</>) untuk menambahkan aplikasi web
2. Masukkan nickname untuk app (misalnya: "mini-soccer-web")
3. **Jangan centang** Firebase Hosting untuk saat ini
4. Klik **"Register app"**

## Langkah 3: Copy Firebase Configuration

Setelah mendaftarkan app, Anda akan melihat kode konfigurasi Firebase seperti ini:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "mini-soccer-xxx.firebaseapp.com",
  projectId: "mini-soccer-xxx",
  storageBucket: "mini-soccer-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

**COPY semua nilai ini!** Anda akan menggunakannya di langkah berikutnya.

## Langkah 4: Update File firebase.js

1. Buka file `src/firebase.js` di project Anda
2. Ganti nilai-nilai berikut dengan konfigurasi dari Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Ganti dengan API Key Anda
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Ganti dengan Auth Domain Anda
  projectId: "YOUR_PROJECT_ID", // Ganti dengan Project ID Anda
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Ganti dengan Storage Bucket Anda
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Ganti dengan Messaging Sender ID Anda
  appId: "YOUR_APP_ID", // Ganti dengan App ID Anda
  measurementId: "YOUR_MEASUREMENT_ID" // Ganti dengan Measurement ID Anda (opsional)
};
```

## Langkah 5: Aktifkan Firebase Authentication

### Email/Password Authentication

1. Di Firebase Console, buka menu **"Authentication"** di sidebar kiri
2. Klik tab **"Sign-in method"**
3. Klik **"Email/Password"**
4. **Aktifkan** toggle untuk "Email/Password"
5. Klik **"Save"**

### Google Sign-In Authentication

1. Masih di halaman **"Sign-in method"**
2. Klik **"Google"**
3. **Aktifkan** toggle untuk Google Sign-In
4. Pilih email support untuk project (biasanya email Anda)
5. Klik **"Save"**

**PENTING untuk Google Sign-In:**

Anda perlu menambahkan domain authorized untuk development:

1. Di halaman Authentication > Settings > **Authorized domains**
2. Tambahkan domain berikut:
   - `localhost` (untuk development lokal)
   - Domain production Anda nanti (jika sudah deploy)

## Langkah 6: Setup Cloud Firestore

1. Di Firebase Console, buka menu **"Firestore Database"** di sidebar kiri
2. Klik **"Create database"**
3. Pilih mode:
   - **Test mode** (untuk development): Data bisa diakses publik untuk 30 hari
   - **Production mode**: Memerlukan security rules
   
   Untuk saat ini, pilih **Test mode** agar mudah testing
4. Pilih lokasi server (pilih yang terdekat atau `asia-southeast1` untuk Indonesia)
5. Klik **"Enable"**

### Setup Security Rules (Penting untuk Production!)

Setelah testing selesai, ganti Firestore Security Rules dengan rules berikut:

1. Di Firestore Database, buka tab **"Rules"**
2. Ganti rules dengan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rules untuk collection bookings
    match /bookings/{bookingId} {
      // Semua user yang login bisa membaca bookings
      allow read: if request.auth != null;
      
      // Hanya user yang login bisa membuat booking
      allow create: if request.auth != null 
                    && request.resource.data.bookedByUid == request.auth.uid;
      
      // Hanya user yang membuat booking bisa update/delete
      allow update, delete: if request.auth != null 
                            && resource.data.bookedByUid == request.auth.uid;
    }
  }
}
```

3. Klik **"Publish"**

## Langkah 7: Test Aplikasi

Sekarang aplikasi Anda sudah siap menggunakan Firebase!

### Test Login:

1. Jalankan aplikasi: `npm run dev`
2. Klik tombol **"Login"** di navbar
3. **Test Google Sign-In:**
   - Klik tombol "Continue with Google"
   - Pilih akun Google Anda
   - Seharusnya berhasil login
4. **Test Email/Password:**
   - Masukkan email dan password baru
   - Sistem akan otomatis membuat akun baru (auto-registration)
   - Login berhasil!

### Test Booking:

1. Setelah login, klik **"Find A Game"**
2. Pilih tanggal di kalender
3. Klik slot waktu kosong (yang ada tanda +)
4. Isi form booking (Nama Tim & Durasi)
5. Klik **"Konfirmasi Booking"**
6. Booking akan tersimpan secara realtime di Firestore!

### Test Realtime Sync:

1. Buka aplikasi di 2 browser/tab berbeda
2. Login dengan akun berbeda di masing-masing tab
3. Buat booking di satu tab
4. Lihat booking muncul secara **realtime** di tab lain! 🎉

## Struktur Data di Firestore

### Collection: `bookings`

Setiap dokumen booking memiliki struktur:

```javascript
{
  key: "2024-3-15-10", // Unique key format: year-month-date-timeIndex
  date: {
    year: 2024,
    month: 3,
    date: 15
  },
  time: 10, // Index waktu (0-17 untuk 06:00-23:00)
  duration: 2, // Durasi dalam jam
  name: "Tim Garuda", // Nama tim
  bookedBy: "user@email.com", // Email user yang booking
  bookedByName: "John Doe", // Nama user
  bookedByUid: "abc123xyz", // Firebase UID
  bookedAt: "2024-03-10T10:30:00.000Z" // Timestamp ISO
}
```

## Monitoring dan Management

### Lihat User yang Terdaftar

1. Buka **"Authentication"** > **"Users"**
2. Anda akan melihat semua user yang sudah register/login
3. Bisa disable/delete user dari sini

### Lihat Bookings di Firestore

1. Buka **"Firestore Database"**
2. Klik collection **"bookings"**
3. Lihat semua bookings realtime
4. Bisa edit/delete manual jika diperlukan

### Monitoring Usage

1. Buka **"Usage and billing"**
2. Monitor quota Firebase gratis:
   - Authentication: 10K verifikasi/bulan (gratis selamanya)
   - Firestore: 50K reads, 20K writes, 20K deletes per hari
   - Storage: 1 GB

## Troubleshooting

### Error: "Firebase: Error (auth/unauthorized-domain)"

**Solusi:**
1. Buka Firebase Console > Authentication > Settings
2. Tambahkan domain Anda di **Authorized domains**
3. Untuk development: tambahkan `localhost`

### Error: "Missing or insufficient permissions"

**Solusi:**
1. Buka Firestore Database > Rules
2. Pastikan rules sudah di-publish dengan benar
3. Untuk testing cepat, bisa gunakan test mode (allow read, write: if true)

### Booking tidak muncul realtime

**Solusi:**
1. Check console browser untuk error
2. Pastikan Firebase SDK sudah terinstall dengan benar
3. Pastikan `firebase.js` sudah diimport di komponen yang tepat
4. Check koneksi internet

### Google Sign-In tidak berfungsi

**Solusi:**
1. Pastikan Google Sign-In sudah diaktifkan di Firebase Console
2. Check authorized domains di Firebase Authentication Settings
3. Clear browser cache dan coba lagi
4. Gunakan incognito mode untuk testing

## Production Deployment

Ketika siap deploy ke production:

1. **Update Firebase Rules** dari test mode ke production mode (lihat Langkah 6)
2. **Tambahkan domain production** ke Authorized domains di Firebase Authentication
3. **Enable Firebase Hosting** (opsional):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   npm run build
   firebase deploy
   ```

## Security Best Practices

1. ✅ **Jangan commit** `firebase.js` dengan kredensial asli ke GitHub public repository
2. ✅ **Gunakan environment variables** untuk production:
   ```javascript
   apiKey: import.meta.env.VITE_FIREBASE_API_KEY
   ```
3. ✅ **Set proper Firestore security rules** sebelum production
4. ✅ **Monitor Firebase Usage** secara berkala
5. ✅ **Enable App Check** untuk melindungi dari abuse

## Referensi

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth/web/start)
- [Cloud Firestore Guide](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Selamat! Aplikasi Mini Soccer Anda sekarang menggunakan Firebase dengan authentication dan realtime database! 🚀⚽**
