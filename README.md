
# Go Etnik Nusantara - Portal Layanan Digital

Aplikasi website profesional dengan fitur:
- **Admin Dashboard**: Kelola konten, layanan, dan pesanan secara real-time.
- **AI Assistant**: Rekomendasi layanan otomatis menggunakan Gemini AI.
- **WhatsApp Booking**: Form pemesanan yang otomatis menyusun pesan ke WhatsApp Admin.
- **Dynamic Content**: Logo, Media Sosial, dan Lokasi Peta dapat diubah dari panel Admin.

## Cara Deploy ke Vercel

1. **Hubungkan Repositori (Hanya sekali):**
   ```bash
   git remote add origin https://github.com/dhedos/goetnik-nusantara.git
   ```

2. **Kirim Perubahan:**
   ```bash
   npm run push
   ```

3. **Deploy di Vercel:**
   - Masuk ke dashboard Vercel.
   - Hubungkan repositori `goetnik-nusantara`.
   - Tambahkan Environment Variables dari Firebase (API Key, Project ID, dll).
   - Klik Deploy!
