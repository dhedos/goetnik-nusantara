
"use client";

import { Cpu, Facebook, Instagram, Youtube, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5c0 1.94-.53 3.89-1.93 5.08-1.47 1.25-3.5 1.55-5.32 1.07-2.31-.7-4.11-2.83-4.44-5.18-.33-2.34.82-4.72 2.79-6.03 1.48-1 3.26-1.33 4.99-1.01V16.5c-1.3-.46-2.82-.14-3.72.93-.65.75-.82 1.83-.54 2.75.29.9 1.1 1.6 2.05 1.77 1.03.19 2.18-.13 2.89-.89.75-.81.82-1.96.82-2.99V0l.08.02z"/>
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
  
  const logoText = settings?.logoText || 'Go Etnik';
  const logoAccentText = settings?.logoAccentText || 'NUSANTARA';
  const logoUrl = settings?.logoUrl || '';
  const businessName = settings?.name || 'Go Etnik NUSANTARA';
  const aboutSubtitle = settings?.heroSubtitle || 'Kami menyediakan layanan service laptop profesional, desain grafis estetik, dan pembuatan aplikasi modern.';
  const privacyPolicyContent = settings?.privacyPolicy || 'Kebijakan privasi belum diatur oleh admin.';
  const logoH = parseInt(settings?.logoHeight) || 32;

  const formatSocialUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
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
    <footer className="bg-card/30 border-t border-border pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <div 
                className="relative shrink-0 transition-all duration-300 flex items-center"
                style={{ height: `${logoH}px` }}
              >
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                  className="block"
                />
              </div>
            ) : (
              <div 
                className="rounded bg-primary flex items-center justify-center text-primary-foreground transition-all shrink-0"
                style={{ height: `${logoH}px`, width: `${logoH}px` }}
              >
                <Cpu size={logoH * 0.5} />
              </div>
            )}
            <div className="flex items-center text-lg md:text-xl font-bold gap-2">
              <span className="text-foreground">{logoText}</span>
              <span className="text-primary">{logoAccentText}</span>
            </div>
          </Link>
          
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
            {aboutSubtitle}
          </p>

          <div className="flex gap-3 pt-2">
            <a 
              href={formatSocialUrl(socialLinks.instagram)} 
              target={socialLinks.instagram ? "_blank" : "_self"}
              onClick={(e) => handleSocialClick(e, socialLinks.instagram, 'Instagram')}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Instagram size={18} />
            </a>
            <a 
              href={formatSocialUrl(socialLinks.facebook)} 
              target={socialLinks.facebook ? "_blank" : "_self"}
              onClick={(e) => handleSocialClick(e, socialLinks.facebook, 'Facebook')}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Facebook size={18} />
            </a>
            <a 
              href={formatSocialUrl(socialLinks.youtube)} 
              target={socialLinks.youtube ? "_blank" : "_self"}
              onClick={(e) => handleSocialClick(e, socialLinks.youtube, 'YouTube')}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Youtube size={18} />
            </a>
            <a 
              href={formatSocialUrl(socialLinks.tiktok)} 
              target={socialLinks.tiktok ? "_blank" : "_self"}
              onClick={(e) => handleSocialClick(e, socialLinks.tiktok, 'TikTok')}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <TikTokIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-base mb-6 uppercase tracking-wider text-foreground">Navigasi</h4>
          <ul className="space-y-4 text-muted-foreground text-sm font-medium">
            <li><Link href="/" className="hover:text-primary transition-colors">Beranda</Link></li>
            <li><Link href="#layanan" className="hover:text-primary transition-colors">Layanan</Link></li>
            <li><Link href="#tentang" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
            <li><Link href="#kontak" className="hover:text-primary transition-colors">Hubungi Kami</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-base mb-6 uppercase tracking-wider text-foreground">Informasi</h4>
          <ul className="space-y-4 text-muted-foreground text-sm font-medium">
             <li><Link href="#pesan" className="hover:text-primary transition-colors">Pesan Layanan</Link></li>
             <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="hover:text-primary transition-colors text-left">Kebijakan Privasi</button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] rounded-2xl border-border bg-card">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-foreground">Kebijakan Privasi</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-full max-h-[60vh] mt-4 pr-4">
                      <div className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
                        {privacyPolicyContent}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
             </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <p>© {currentYear} {businessName}. All Rights Reserved.</p>
          <Link href="/login" className="opacity-30 hover:opacity-100 transition-opacity p-2" title="Admin Access">
            <Fingerprint size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
