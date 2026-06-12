
import { Monitor, HardDrive, Palette, Globe, CheckCircle, Clock, ShieldCheck, Laptop, Phone, Wrench, Mail, Smartphone, Cpu, Settings, PenTool } from 'lucide-react';

export const MAIN_BUSINESS_ID = "main";
export const BUSINESS_NAME_DEFAULT = "Go Etnik NUSANTARA";
export const OWNER_WHATSAPP_DEFAULT = "628123456789";
export const BUSINESS_ADDRESS_DEFAULT = "Jl. Raya Teknologi No. 42, Kota Digital, Indonesia";
export const BUSINESS_EMAIL_DEFAULT = "admin@goetnik.com";

export const PRIVACY_POLICY_DEFAULT = `Kebijakan Privasi

1. Pengumpulan Informasi
Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat melakukan pemesanan layanan, seperti nama, nomor WhatsApp, dan alamat.

2. Penggunaan Informasi
Informasi yang kami kumpulkan digunakan untuk memproses pesanan dan menghubungi Anda.

3. Perlindungan Informasi
Kami tidak menjual informasi pribadi Anda kepada pihak ketiga tanpa izin.

4. Persetujuan
Dengan menggunakan layanan kami, Anda menyetujui kebijakan privasi ini.`;

export const ICON_MAP: Record<string, any> = {
  Monitor,
  HardDrive,
  Palette,
  PenTool,
  Globe,
  CheckCircle,
  Clock,
  ShieldCheck,
  Laptop,
  Phone,
  Wrench,
  Mail,
  Smartphone,
  Cpu,
  Settings
};

export const ICON_OPTIONS = [
  { value: 'Laptop', label: 'Service Laptop' },
  { value: 'Monitor', label: 'Monitor / Layar' },
  { value: 'Palette', label: 'Desain Grafis' },
  { value: 'PenTool', label: 'Logo / Ilustrasi' },
  { value: 'Mail', label: 'Undangan Online' },
  { value: 'Settings', label: 'Instalasi OS/Software' },
  { value: 'Globe', label: 'Website / Digital' },
  { value: 'Smartphone', label: 'Aplikasi HP' },
  { value: 'Cpu', label: 'Hardware / Upgrade' },
  { value: 'Wrench', label: 'Perbaikan Fisik' },
  { value: 'ShieldCheck', label: 'Keamanan / Antivirus' },
  { value: 'Phone', label: 'Komunikasi' },
];

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
    id: 'heritage-red',
    label: 'Heritage Red (Utama)',
    primary: '45 90% 45%', 
    accent: '45 40% 95%',  
    background: '0 80% 12%' 
  },
  {
    id: 'midnight-gold',
    label: 'Midnight Gold (Gelap)',
    primary: '45 90% 45%', 
    accent: '0 0% 100%',   
    background: '220 30% 4%' 
  },
  {
    id: 'golden-java',
    label: 'Golden Java (Emas)',
    primary: '0 80% 20%',  
    accent: '30 20% 10%',  
    background: '45 70% 50%' 
  },
  {
    id: 'vintage-cream',
    label: 'Vintage Cream (Terang)',
    primary: '35 50% 30%', 
    accent: '0 70% 20%',   
    background: '40 40% 94%' 
  },
  {
    id: 'deep-sea',
    label: 'Deep Sea (Modern)',
    primary: '217 91% 60%',
    accent: '189 94% 43%',
    background: '222 47% 11%'
  },
  {
    id: 'earthy-forest',
    label: 'Earthy Forest (Alam)',
    primary: '142 70% 45%',
    accent: '142 20% 95%',
    background: '142 50% 5%'
  },
  {
    id: 'royal-elite',
    label: 'Royal Elite (Ungu)',
    primary: '270 90% 60%',
    accent: '270 20% 95%',
    background: '270 50% 5%'
  },
  {
    id: 'terracotta',
    label: 'Terracotta (Bata)',
    primary: '20 80% 50%',
    accent: '20 20% 95%',
    background: '20 50% 5%'
  }
];
