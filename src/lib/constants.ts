import { Monitor, HardDrive, Palette, Globe, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export const BUSINESS_NAME_DEFAULT = "TechFlow Mandiri";
export const OWNER_WHATSAPP_DEFAULT = "6281234567890";
export const BUSINESS_ADDRESS_DEFAULT = "Jl. Teknologi Raya No. 42, Kota Digital, Indonesia";
export const BUSINESS_EMAIL_DEFAULT = "hello@techflowmandiri.com";

export const ICON_MAP: Record<string, any> = {
  Monitor,
  HardDrive,
  Palette,
  Globe,
  CheckCircle,
  Clock,
  ShieldCheck
};

export const SERVICES_DEFAULT = [
  {
    id: "os-install",
    name: "Instal Ulang OS/Software",
    iconName: "Monitor",
    price: "Rp 100.000+",
    description: "Layanan instalasi Windows/macOS/Linux beserta driver dan aplikasi standar. Sistem bersih, cepat, dan bebas virus.",
    features: ["Aktivasi Original", "Driver Terbaru", "Backup Data", "Aplikasi Standar"]
  },
  {
    id: "hardware-service",
    name: "Service Hardware Laptop",
    iconName: "HardDrive",
    price: "Cek Kerusakan",
    description: "Perbaikan komponen laptop seperti LCD, keyboard, baterai, hingga perbaikan motherboard tingkat lanjut.",
    features: ["Suku Cadang Berkualitas", "Garansi Perbaikan", "Pengecekan Gratis", "Pengerjaan Cepat"]
  },
  {
    id: "design-graphic",
    name: "Jasa Desain Grafis",
    iconName: "Palette",
    price: "Rp 50.000+",
    description: "Pembuatan logo profesional, banner promosi, poster acara, dan identitas brand untuk bisnis Anda.",
    features: ["Revisi Sampai Puas", "File High Res", "Konsep Unik", "Waktu Kilat"]
  },
  {
    id: "web-app",
    name: "Pembuatan Web/Aplikasi",
    iconName: "Globe",
    price: "Rp 1.500.000+",
    description: "Pengembangan website landing page, profil perusahaan, hingga aplikasi web kustom untuk kebutuhan bisnis modern.",
    features: ["Responsive Design", "SEO Friendly", "Panel Admin", "Gratis Domain/Hosting*"]
  }
];

export const ADVANTAGES = [
  {
    title: "Teknisi Berpengalaman",
    description: "Ditangani oleh ahli yang sudah berpengalaman lebih dari 5 tahun di bidang IT.",
    icon: CheckCircle
  },
  {
    title: "Pengerjaan Cepat",
    description: "Kami menghargai waktu Anda. Layanan tertentu bisa selesai di hari yang sama.",
    icon: Clock
  },
  {
    title: "Garansi Terjamin",
    description: "Setiap layanan perbaikan kami sertakan garansi untuk kenyamanan Anda.",
    icon: ShieldCheck
  }
];
