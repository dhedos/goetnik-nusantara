
"use client";

import { Instagram, Facebook, Youtube, Fingerprint, Globe, Link as LinkIcon, ShoppingCart, Github, Linkedin, Image as ImageIcon, Code2 } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MAIN_BUSINESS_ID } from '@/lib/constants';

const TikTokIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface FooterProps {
  businessId: string;
}

export function Footer({ businessId }: FooterProps) {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const firestore = useFirestore();
  
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', businessId, 'settings', 'profile') : null, 
    [firestore, businessId]
  );
  const { data: settings } = useDoc(settingsRef);

  const linksQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'businesses', businessId, 'external-links'), orderBy('createdAt', 'desc')) : null, 
    [firestore, businessId]
  );
  const { data: externalLinks } = useCollection(linksQuery);
  
  const logoText = settings?.logoText || 'GOETNIK';
  const logoAccentText = settings?.logoAccentText || 'NUSANTARA';
  const logoUrl = settings?.logoUrl || '';
  const businessName = settings?.name || 'Go Etnik Nusantara';
  const aboutSubtitle = settings?.heroSubtitle || 'Solusi Digital Profesional & Terpercaya';
  const privacyPolicyContent = settings?.privacyPolicy || 'Kebijakan privasi belum diatur oleh admin.';
  const logoH = parseInt(settings?.logoHeight) || 32;
  const footerCopyright = settings?.footerCopyright;

  const formatSocialUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Shopee':
      case 'Tokopedia':
      case 'Lazada':
      case 'TikTok Shop':
        return <ShoppingCart size={14} className="mr-2" />;
      case 'Pinterest':
      case 'Behance':
      case 'Dribbble':
        return <ImageIcon size={14} className="mr-2" />;
      case 'GitHub':
        return <Github size={14} className="mr-2" />;
      case 'LinkedIn':
        return <Linkedin size={14} className="mr-2" />;
      case 'Vercel':
      case 'Website':
        return <Globe size={14} className="mr-2" />;
      default:
        return <LinkIcon size={14} className="mr-2" />;
    }
  };

  const socialLinks = {
    instagram: settings?.socialInstagram || '',
    facebook: settings?.socialFacebook || '',
    youtube: settings?.socialYoutube || '',
    tiktok: settings?.socialTiktok || ''
  };

  const handleSocialClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string, platform: string) => {
    if (!url) {
      e.preventDefault();
      toast({
        title: "Informasi",
        description: `Link ${platform} belum tersedia.`,
      });
    }
  };

  return (
    <footer className="bg-card/40 border-t border-white/5 pt-20 pb-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
        <div className="sm:col-span-2 lg:col-span-1 space-y-8">
          <Link href="/" className="flex items-center gap-3">
            {logoUrl && (
              <div 
                className="relative shrink-0 flex items-center bg-transparent"
                style={{ height: `${logoH}px` }}
              >
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                  className="block"
                />
              </div>
            )}
            <div className="flex flex-wrap items-center text-xl md:text-2xl font-black gap-x-2 tracking-tighter">
              <span className="text-foreground">{logoText}</span>
              <span className="text-primary">{logoAccentText}</span>
            </div>
          </Link>
          
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed opacity-70">
            {aboutSubtitle}
          </p>

          <div className="flex gap-4 pt-2">
            {[
              { id: 'instagram', icon: Instagram, label: 'Instagram' },
              { id: 'facebook', icon: Facebook, label: 'Facebook' },
              { id: 'youtube', icon: Youtube, label: 'YouTube' },
              { id: 'tiktok', icon: TikTokIcon, label: 'TikTok' }
            ].map((soc) => (
              <a 
                key={soc.id}
                href={formatSocialUrl(socialLinks[soc.id as keyof typeof socialLinks])} 
                target={socialLinks[soc.id as keyof typeof socialLinks] ? "_blank" : "_self"}
                onClick={(e) => handleSocialClick(e, socialLinks[soc.id as keyof typeof socialLinks], soc.label)}
                className="w-11 h-11 rounded-2xl border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-lg"
              >
                <soc.icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-black text-xs md:text-sm mb-8 uppercase tracking-[0.2em] text-foreground opacity-90">Navigasi Utama</h4>
          <ul className="space-y-5 text-muted-foreground text-sm font-bold uppercase tracking-wider">
            <li><Link href="/" className="hover:text-primary transition-colors">Beranda</Link></li>
            <li><Link href="#layanan" className="hover:text-primary transition-colors">Layanan Unggulan</Link></li>
            <li><Link href="#tentang" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
            <li><Link href="#kontak" className="hover:text-primary transition-colors">Hubungi Kami</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-xs md:text-sm mb-8 uppercase tracking-[0.2em] text-foreground opacity-90">Pasar & Portofolio</h4>
          <ul className="space-y-5 text-muted-foreground text-sm font-bold uppercase tracking-wider">
             {externalLinks && externalLinks.length > 0 ? (
               externalLinks.map((link: any) => (
                 <li key={link.id}>
                    <a 
                      href={formatSocialUrl(link.url)} 
                      target="_blank" 
                      className="hover:text-primary transition-colors flex items-center"
                    >
                      {getPlatformIcon(link.platform)}
                      {link.title}
                    </a>
                 </li>
               ))
             ) : (
               <li><span className="opacity-30 italic text-xs font-normal">Belum ada tautan partner</span></li>
             )}
          </ul>
        </div>

        <div>
          <h4 className="font-black text-xs md:text-sm mb-8 uppercase tracking-[0.2em] text-foreground opacity-90">Pusat Informasi</h4>
          <ul className="space-y-5 text-muted-foreground text-sm font-bold uppercase tracking-wider">
             <li><Link href="#pesan" className="hover:text-primary transition-colors">Form Pemesanan</Link></li>
             <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="hover:text-primary transition-colors text-left uppercase">Kebijakan Privasi</button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[85vh] rounded-[2rem] border-white/10 bg-card p-10 shadow-2xl z-[80]">
                    <DialogTitle className="sr-only">Kebijakan Privasi</DialogTitle>
                    <DialogDescription className="sr-only">Rincian kebijakan privasi data pengguna untuk {businessName}</DialogDescription>
                    
                    <DialogHeader>
                      <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter">Kebijakan Privasi</h2>
                    </DialogHeader>
                    <ScrollArea className="h-full max-h-[60vh] mt-6 pr-6">
                      <div className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed font-medium">
                        {privacyPolicyContent}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
             </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.25em]">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <p className="text-center md:text-left">{footerCopyright || `© ${currentYear} ${businessName}. Seluruh Hak Cipta Dilindungi.`}</p>
          <div className="flex items-center gap-4">
             <span className="h-1 w-1 rounded-full bg-white/10 hidden md:block" />
             <Link href="/login" className="opacity-30 hover:opacity-100 hover:text-primary transition-all p-2 flex items-center gap-2" title="Admin Login">
                <Fingerprint size={14} /> <span>Admin</span>
             </Link>
          </div>
        </div>
        <p className="opacity-30">Handcrafted with Pride by {businessName}</p>
      </div>
    </footer>
  );
}
