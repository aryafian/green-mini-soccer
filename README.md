# SPARRING - Website Booking Lapangan Mini Soccer (React)

Website booking lapangan futsal/mini soccer dengan React JS, Vite, dan desain modern yang responsive.

## ✨ Fitur Utama

- 🎮 **Find A Game** - Temukan pertandingan sesuai lokasi
- ⚽ **Book A Venue** - Booking lapangan dengan mudah
- 👥 **Join Community** - Bergabung dengan komunitas
- 🔐 **Login System** - Modal login yang interaktif
- 🖼️ **Dynamic Background** - Background image yang bisa diganti-ganti
- 📱 **Responsive Design** - Tampil sempurna di semua device
- ⚡ **Fast & Modern** - Dibuat dengan React & Vite

## 🚀 Cara Menjalankan

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`

### Build untuk Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Struktur Project

```
mini-soccer/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Features.jsx
│   │   ├── BookingSection.jsx
│   │   ├── Footer.jsx
│   │   └── LoginModal.jsx
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Teknologi yang Digunakan

- **React 18** - Library UI modern
- **Vite** - Build tool yang super cepat
- **CSS3** - Styling dengan Grid, Flexbox, dan Animations
- **Google Fonts** - Bebas Neue & Poppins

## 🖼️ Mengganti Background Image

Background image bisa diganti dengan klik tombol di kiri bawah hero section. Untuk menambah/mengganti gambar background, edit array `backgroundImages` di file `src/App.jsx`:

```jsx
const backgroundImages = [
  'url-gambar-1.jpg',
  'url-gambar-2.jpg',
  'url-gambar-3.jpg',
  // tambah gambar lainnya...
]
```

## 🎯 Fitur yang Bisa Dikustomisasi

- Warna tema di setiap file CSS
- Pilihan lapangan di BookingSection
- Jadwal waktu booking
- Background images
- Informasi kontak di Footer

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

Dibuat dengan ❤️ menggunakan React & Vite untuk SPARRING
