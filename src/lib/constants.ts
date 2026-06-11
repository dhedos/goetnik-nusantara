
import { Monitor, HardDrive, Palette, Globe, CheckCircle, Clock, ShieldCheck, Laptop, Phone, Wrench } from 'lucide-react';

export const MAIN_BUSINESS_ID = "main";
export const BUSINESS_NAME_DEFAULT = "Go Etnik NUSANTARA";
export const OWNER_WHATSAPP_DEFAULT = "628123456789";
export const BUSINESS_ADDRESS_DEFAULT = "Jl. Raya Teknologi No. 42, Kota Digital, Indonesia";
export const BUSINESS_EMAIL_DEFAULT = "admin@goetnik.com";

export const PRIVACY_POLICY_DEFAULT = `Kebijakan Privasi

1. Pengumpulan Informasi
Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat melakukan pemesanan layanan, seperti nama, nomor WhatsApp, dan alamat.

2. Penggunaan Informasi
Informasi yang kami kumpulkan digunakan untuk:
- Memproses dan mengelola pesanan Anda.
- Menghubungi Anda terkait layanan yang dipesan.
- Meningkatkan kualitas layanan kami.

3. Perlindungan Informasi
Kami mengimplementasikan langkah-langkah keamanan untuk menjaga keselamatan informasi pribadi Anda. Kami tidak menjual, memperdagangkan, atau memberikan informasi pribadi Anda kepada pihak ketiga tanpa izin Anda.

4. Persetujuan
Dengan menggunakan layanan kami, Anda menyetujui kebijakan privasi kami.

Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, Anda dapat menghubungi kami melalui informasi kontak yang tersedia di website ini.`;

export const ICON_MAP: Record<string, any> = {
  Monitor,
  HardDrive,
  Palette,
  Globe,
  CheckCircle,
  Clock,
  ShieldCheck,
  Laptop,
  Phone,
  Wrench
};

export const ADVANTAGES = [
  {
    title: "Teknisi Berpengalaman",
    description: "Ditangani oleh ahli yang sudah berpengalaman di bidangnya.",
    icon: CheckCircle
  },
  {
    title: "Pengerjaan Cepat",
    description: "Kami menghargai waktu Anda. Layanan kami kerjakan seefisien mungkin.",
    icon: Clock
  },
  {
    title: "Garansi Terjamin",
    description: "Setiap layanan kami sertakan garansi untuk kenyamanan Anda.",
    icon: ShieldCheck
  }
];

export const THEMES = [
  {
    id: 'deep-sea',
    label: 'Deep Sea (Modern)',
    primary: '217 91% 60%',
    accent: '189 94% 43%',
    background: '222 47% 11%'
  },
  {
    id: 'royal-gold',
    label: 'Royal Gold (Mewah)',
    primary: '45 100% 51%',
    accent: '43 100% 70%',
    background: '20 20% 8%'
  },
  {
    id: 'earthy-forest',
    label: 'Earthy Forest (Alam)',
    primary: '142 71% 45%',
    accent: '158 64% 52%',
    background: '160 30% 8%'
  },
  {
    id: 'terracotta',
    label: 'Terracotta (Etnik)',
    primary: '20 80% 50%',
    accent: '30 100% 70%',
    background: '15 40% 8%'
  }
];
