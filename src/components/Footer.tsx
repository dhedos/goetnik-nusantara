
"use client";

import { Cpu, Facebook, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5c0 1.94-.53 3.89-1.93 5.08-1.47 1.25-3.5 1.55-5.32 1.07-2.31-.7-4.11-2.83-4.44-5.18-.33-2.34.82-4.72 2.79-6.03 1.48-1 3.26-1.33 4.99-1.01V16.5c-1.3-.46-2.82-.14-3.72.93-.65.75-.82 1.83-.54 2.75.29.9 1.1 1.6 2.05 1.77 1.03.19 2.18-.13 2.89-.89.75-.81.82-1.96.82-2.99V0l.08.02z"/>
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'business') : null, 
    [firestore]
  );
  const { data: settings } = useDoc(settingsRef);
  
  const logoText = settings?.logoText || 'Go Etnik';
  const logoAccentText = settings?.logoAccentText || 'NUSANTARA';
  const logoUrl = settings?.logoUrl || '';
  const businessName = settings?.name || 'Go Etnik NUSANTARA';
  const aboutSubtitle = settings?.heroSubtitle || 'Kami menyediakan layanan service laptop profesional, desain grafis estetik, dan pembuatan aplikasi modern.';

  // Social Links with fallbacks for demonstration if empty
  const socialLinks = {
    instagram: settings?.socialInstagram || '#',
    facebook: settings?.socialFacebook || '#',
    youtube: settings?.socialYoutube || '#',
    tiktok: settings?.socialTiktok || '#'
  };

  return (
    <footer className="bg-card/30 border-t border-border/50 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <div className="relative h-9 w-9 shrink-0">
                <Image 
                  src={logoUrl} 
                  alt="Logo" 
                  fill 
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                <Cpu size={20} />
              </div>
            )}
            <div className="flex items-center text-xl md:text-2xl font-black font-headline tracking-tight leading-none gap-3">
              <span className="text-white">{logoText}</span>
              <span className="text-primary">{logoAccentText}</span>
            </div>
          </Link>
          
          <p className="text-muted-foreground max-w-md leading-relaxed">
            {aboutSubtitle}
          </p>

          <div className="flex gap-4 pt-2">
            <a href={socialLinks.instagram} target="_blank" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
              <Instagram size={20} />
            </a>
            <a href={socialLinks.facebook} target="_blank" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
              <Facebook size={20} />
            </a>
            <a href={socialLinks.youtube} target="_blank" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
              <Youtube size={20} />
            </a>
            <a href={socialLinks.tiktok} target="_blank" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
              <TikTokIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Tautan Cepat</h4>
          <ul className="space-y-4 text-muted-foreground">
            <li><Link href="#" className="hover:text-primary transition-colors">Beranda</Link></li>
            <li><Link href="#layanan" className="hover:text-primary transition-colors">Layanan</Link></li>
            <li><Link href="#tentang" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
            <li><Link href="#kontak" className="hover:text-primary transition-colors">Kontak</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Informasi</h4>
          <ul className="space-y-4 text-muted-foreground">
             <li><Link href="#pesan" className="hover:text-primary transition-colors">Pesan Sekarang</Link></li>
             <li><Link href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
        <div className="flex items-center gap-4">
          <p>© {currentYear} {businessName}. All Rights Reserved.</p>
          <Link href="/login" className="opacity-20 hover:opacity-100 transition-opacity p-2" title="Admin Access">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
