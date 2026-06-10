
import { Monitor, HardDrive, Palette, Globe, CheckCircle, Clock, ShieldCheck, Laptop, Phone, Wrench } from 'lucide-react';

export const BUSINESS_NAME_DEFAULT = "Go Etnik NUSANTARA";
export const OWNER_WHATSAPP_DEFAULT = "628123456789";
export const BUSINESS_ADDRESS_DEFAULT = "Jl. Raya Teknologi No. 42, Kota Digital, Indonesia";
export const BUSINESS_EMAIL_DEFAULT = "admin@goetnik.com";

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
