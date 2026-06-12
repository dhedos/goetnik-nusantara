"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const NAV_LINKS = [
  { name: 'Beranda', href: '#' },
  { name: 'Layanan', href: '#layanan' },
  { name: 'Tentang', href: '#tentang' },
  { name: 'Kontak', href: '#kontak' },
];

interface NavbarProps {
  businessId: string;
}

export function Navbar({ businessId }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', businessId, 'settings', 'profile') : null, 
    [firestore, businessId]
  );
  const { data: settings } = useDoc(settingsRef);

  const logoText = settings?.logoText || 'Go Etnik';
  const logoAccentText = settings?.logoAccentText || 'NUSANTARA';
  const logoUrl = settings?.logoUrl || '';
  const logoH = parseInt(settings?.logoHeight) || 36;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-4 md:px-8 py-4",
      scrolled ? "bg-background/90 backdrop-blur-xl border-b border-white/5 py-3 shadow-xl" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 md:gap-3 group max-w-[70%] sm:max-w-none">
          {logoUrl ? (
            <div 
              className="relative shrink-0 transition-all duration-300 flex items-center bg-transparent"
              style={{ height: scrolled ? `${Math.max(24, logoH * 0.7)}px` : `${logoH}px` }}
            >
              <img 
                src={logoUrl} 
                alt="Logo" 
                style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
                className="block bg-transparent"
              />
            </div>
          ) : (
            <div 
              className="rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-105 transition-all shrink-0"
              style={{ 
                height: scrolled ? `${Math.max(24, logoH * 0.7)}px` : `${logoH}px`, 
                width: scrolled ? `${Math.max(24, logoH * 0.7)}px` : `${logoH}px` 
              }}
            >
              <Cpu size={scrolled ? Math.max(12, logoH * 0.35) : logoH * 0.5} />
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center text-sm sm:text-base md:text-xl font-bold leading-none gap-0 sm:gap-1.5 truncate">
            <span className="text-white truncate">{logoText}</span>
            <span className="text-primary truncate">{logoAccentText}</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-[11px] uppercase tracking-widest font-bold text-white/70 hover:text-primary transition-all"
            >
              {link.name}
            </Link>
          ))}
          <Button asChild size="sm" className="rounded-full px-6 font-bold uppercase text-[11px] tracking-wider shadow-lg shadow-primary/20">
            <Link href="#pesan">Pesan Sekarang</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white p-2 shrink-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-[60px] md:top-[64px] bg-background/98 backdrop-blur-2xl border-b border-white/5 p-8 flex flex-col gap-2 animate-in slide-in-from-top-4 duration-300 z-[99] h-[calc(100vh-60px)] overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-lg font-bold uppercase tracking-wide py-5 border-b border-white/5 text-white/90"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Button asChild className="w-full rounded-xl py-7 text-lg font-bold uppercase tracking-wider mt-6">
            <Link href="#pesan" onClick={() => setIsOpen(false)}>Pesan Sekarang</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
