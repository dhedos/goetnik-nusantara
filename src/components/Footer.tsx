
"use client";

import { Cpu, Facebook, Instagram, Twitter, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

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
  const aboutSubtitle = settings?.heroSubtitle || 'Solusi teknologi terpercaya untuk kebutuhan Anda.';

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
            <div className="flex items-center text-xl md:text-2xl font-black font-headline tracking-tight leading-none gap-1.5">
              <span className="text-white">{logoText}</span>
              <span className="text-primary">{logoAccentText}</span>
            </div>
          </Link>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            {aboutSubtitle}
          </p>
          <div className="flex gap-4">
            {settings?.socialInstagram && (
              <a href={settings.socialInstagram} target="_blank" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Instagram size={20} />
              </a>
            )}
            {settings?.socialFacebook && (
              <a href={settings.socialFacebook} target="_blank" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Facebook size={20} />
              </a>
            )}
            {settings?.socialTwitter && (
              <a href={settings.socialTwitter} target="_blank" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Twitter size={20} />
              </a>
            )}
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
        <p>© {currentYear} {businessName}. All Rights Reserved.</p>
        <Link href="/login" className="opacity-5 hover:opacity-100 transition-opacity p-2">
          <Fingerprint size={12} />
        </Link>
      </div>
    </footer>
  );
}
