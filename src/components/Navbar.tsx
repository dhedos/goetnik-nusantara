
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
      scrolled ? "bg-background/90 backdrop-blur-xl border-b border-white/5 py-3 shadow-2xl" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 md:gap-3 group">
          {logoUrl ? (
            <div className="relative h-8 w-8 md:h-10 md:w-10 shrink-0">
              <Image 
                src={logoUrl} 
                alt="Logo" 
                fill 
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform shrink-0">
              <Cpu size={20} />
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center text-lg md:text-2xl font-black font-headline tracking-tighter leading-none gap-0 sm:gap-2">
            <span className="text-white uppercase italic">{logoText}</span>
            <span className="text-primary uppercase italic">{logoAccentText}</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-[13px] uppercase tracking-widest font-black text-white/60 hover:text-primary transition-all"
            >
              {link.name}
            </Link>
          ))}
          <Button asChild size="lg" className="rounded-full px-8 font-black uppercase italic tracking-tighter text-sm shadow-xl shadow-primary/20">
            <Link href="#pesan">Pesan Sekarang</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-[72px] bg-background/98 backdrop-blur-2xl border-b border-white/5 p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300 z-[99]">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-2xl font-black uppercase italic tracking-tighter py-4 border-b border-white/5"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Button asChild className="w-full rounded-2xl py-8 text-xl font-black uppercase italic tracking-tighter mt-4">
            <Link href="#pesan" onClick={() => setIsOpen(false)}>Pesan Sekarang</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
