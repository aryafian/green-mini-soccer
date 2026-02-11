# Firestore Security Rules Setup

## Masalah
Jika user tidak login tidak bisa melihat data booking di kalender, kemungkinan besar disebabkan oleh Firestore Security Rules yang memblokir akses read tanpa autentikasi.

## Solusi
Upload `firestore.rules` ke Firebase Console dengan langkah berikut:

### Cara 1: Via Firebase Console (Web)
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Klik **Firestore Database** di menu sebelah kiri
4. Klik tab **Rules** di bagian atas
5. Copy-paste isi file `firestore.rules` ke editor
6. Klik **Publish**

### Cara 2: Via Firebase CLI
```bash
# Install Firebase CLI (jika belum)
npm install -g firebase-tools

# Login ke Firebase
firebase login

# Initialize Firebase (jika belum)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Penjelasan Rules

```javascript
match /bookings/{bookingId} {
  allow read: if true;  // ✅ Semua orang bisa membaca booking (termasuk yang tidak login)
  allow create: if request.auth != null;  // ✅ Hanya user login yang bisa membuat booking
  allow update, delete: if request.auth != null && 
                          request.auth.uid == resource.data.bookedByUid;  // ✅ Hanya pembuat booking yang bisa edit/hapus
}
```

## Testing
Setelah rules di-publish:
1. Buka aplikasi tanpa login
2. Klik tanggal di kalender
3. Anda seharusnya bisa melihat jadwal dan booking yang sudah ada
4. Ketika mencoba booking slot kosong, baru akan diminta login

## Troubleshooting
- Jika masih error "permission-denied", tunggu 1-2 menit setelah publish rules
- Cek browser console (F12) untuk melihat error detail
- Pastikan collection name di Firestore adalah "bookings" (sesuai dengan kode)
