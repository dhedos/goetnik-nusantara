
"use client";

import { Cpu, Facebook, Instagram, Twitter, Linkedin, Lock } from 'lucide-react';
import Link from 'next/link';
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
  
  const logoText = settings?.logoText || '';
  const logoAccentText = settings?.logoAccentText || '';
  const businessName = settings?.name || '';
  const aboutSubtitle = settings?.heroSubtitle || '';

  return (
    <footer className="bg-card/30 border-t border-border/50 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Cpu size={24} />
            </div>
            <span className="text-2xl font-bold font-headline">{logoText}<span className="text-primary">{logoAccentText}</span></span>
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
            <li>
              <Link href="/login" className="hover:text-primary transition-colors flex items-center gap-2">
                <Lock size={14} /> Admin Login
              </Link>
            </li>
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

      <div className="max-w-7xl mx-auto pt-8 border-t border-border/50 text-center text-muted-foreground text-sm">
        <p>© {currentYear} {businessName}. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
