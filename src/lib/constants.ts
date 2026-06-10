import { Monitor, HardDrive, Palette, Globe, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export const BUSINESS_NAME_DEFAULT = "";
export const OWNER_WHATSAPP_DEFAULT = "";
export const BUSINESS_ADDRESS_DEFAULT = "";
export const BUSINESS_EMAIL_DEFAULT = "";

export const ICON_MAP: Record<string, any> = {
  Monitor,
  HardDrive,
  Palette,
  Globe,
  CheckCircle,
  Clock,
  ShieldCheck
};

export const SERVICES_DEFAULT = [];

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
