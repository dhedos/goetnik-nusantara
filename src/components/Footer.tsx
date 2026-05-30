
"use client";

import { BUSINESS_NAME } from '@/lib/constants';
import { Cpu, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/30 border-t border-border/50 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Cpu size={24} />
            </div>
            <span className="text-2xl font-bold font-headline">TechFlow<span className="text-primary">Mandiri</span></span>
          </Link>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            Solusi perbaikan laptop, desain grafis profesional, dan pengembangan website untuk kebutuhan digital Anda. Memberikan layanan terbaik dengan sentuhan teknologi modern.
          </p>
          <div className="flex gap-4">
            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Tautan Cepat</h4>
          <ul className="space-y-4 text-muted-foreground">
            {['Beranda', 'Layanan', 'Tentang Kami', 'Kontak', 'Kebijakan Privasi'].map((item, i) => (
              <li key={i}>
                <Link href="#" className="hover:text-primary transition-colors">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Layanan Utama</h4>
          <ul className="space-y-4 text-muted-foreground">
            {['Instal Ulang OS', 'Service Hardware', 'Desain Logo', 'Landing Page', 'Maintenance Web'].map((item, i) => (
              <li key={i}>
                <Link href="#" className="hover:text-primary transition-colors">{item}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-border/50 text-center text-muted-foreground text-sm">
        <p>© {currentYear} {BUSINESS_NAME}. All Rights Reserved. Built with Precision & Care.</p>
      </div>
    </footer>
  );
}
