
"use client";

import { Instagram, Facebook, Youtube, Fingerprint, Globe, Link as LinkIcon, ShoppingCart } from 'lucide-react';
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

  const linksQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'businesses', businessId, 'external-links'), orderBy('createdAt', 'desc')) : null, 
    [firestore, businessId]
  );
  const { data: externalLinks } = useCollection(linksQuery);
  
  const logoText = settings?.logoText || '';
  const logoAccentText = settings?.logoAccentText || '';
  const logoUrl = settings?.logoUrl || '';
  const businessName = settings?.name || 'Bisnis Kami';
  const aboutSubtitle = settings?.heroSubtitle || '';
  const privacyPolicyContent = settings?.privacyPolicy || 'Kebijakan privasi belum diatur oleh admin.';
  const logoH = parseInt(settings?.logoHeight) || 32;

  const hasLogoContent = logoUrl || logoText || logoAccentText;

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
        return <ShoppingCart size={14} className="mr-2" />;
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
    <footer className="bg-card/30 border-t border-border pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-1 space-y-6">
          {hasLogoContent && (
            <Link href="/" className="flex items-center gap-2">
              {logoUrl && (
                <div 
                  className="relative shrink-0 transition-all duration-300 flex items-center bg-transparent"
                  style={{ height: `${logoH}px` }}
                >
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                    className="block bg-transparent"
                  />
                </div>
              )}
              {(logoText || logoAccentText) && (
                <div className="flex items-center text-lg md:text-xl font-bold gap-2">
                  <span className="text-foreground">{logoText}</span>
                  <span className="text-primary">{logoAccentText}</span>
                </div>
              )}
            </Link>
          )}
          
          {aboutSubtitle && (
            <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">
              {aboutSubtitle}
            </p>
          )}

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
          <h4 className="font-bold text-base mb-6 uppercase tracking-wider text-foreground">Marketplace & Partner</h4>
          <ul className="space-y-4 text-muted-foreground text-sm font-medium">
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
               <li><span className="opacity-30 italic text-xs">Belum ada tautan partner</span></li>
             )}
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
                    {/* Accessibility headers */}
                    <DialogTitle className="sr-only">Kebijakan Privasi</DialogTitle>
                    <DialogDescription className="sr-only">Halaman kebijakan privasi lengkap untuk {businessName}</DialogDescription>
                    
                    <DialogHeader>
                      <h2 className="text-xl font-bold text-foreground">Kebijakan Privasi</h2>
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
