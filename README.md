
# Go Etnik Nusantara - Portal Layanan Digital

Aplikasi website profesional dengan fitur:
- **Admin Dashboard**: Kelola konten, layanan, portofolio, dan pesanan secara real-time.
- **AI Assistant**: Rekomendasi layanan otomatis menggunakan Gemini AI.
- **Dynamic Themes**: 8 pilihan tema (Heritage & Modern) yang dapat diubah dari panel Admin.
- **Image Auto-Compression**: Unggah banyak gambar tanpa khawatir batas ukuran Firestore (Optimasi Base64).

## Cara Deploy ke Vercel

### 1. Push Perubahan ke GitHub
Jalankan perintah ini di terminal:
```bash
npm run push
```

### 2. Konfigurasi Environment Variables di Vercel
Masuk ke dashboard Vercel, pilih proyek Anda, dan tambahkan variabel berikut di menu **Settings > Environment Variables**:

| Key | Value (Ambil dari Firebase Console) |
|-----|-----------------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | [API_KEY] |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | [PROJECT_ID].firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | [PROJECT_ID] |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | [SENDER_ID] |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | [APP_ID] |
| `GEMINI_API_KEY` | [API_KEY_GEMINI_UNTUK_AI] |

### 3. Deploy!
Vercel akan secara otomatis menjalankan `npm run build` setiap kali Anda melakukan push. Pastikan status build adalah **Success**.

## Fitur Unggulan
- **Custom Fonts**: Pilihan font etnik nusantara yang elegan.
- **Live Maps**: Pencarian lokasi otomatis untuk peta kontak.
- **WhatsApp Booking**: Notifikasi instan ke WhatsApp Admin saat ada pesanan.
