
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

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'business') : null, 
    [firestore]
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
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3",
      scrolled ? "bg-background/90 backdrop-blur-lg border-b border-border py-2" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          {logoUrl ? (
            <div className="relative h-9 w-9 shrink-0">
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
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform shrink-0">
              <Cpu size={18} />
            </div>
          )}
          <div className="flex items-center text-xl md:text-2xl font-black font-headline tracking-tighter leading-none">
            <span className="text-white">{logoText}</span>
            <span className="text-primary">{logoAccentText}</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-semibold hover:text-primary transition-colors text-white/80 hover:text-white"
            >
              {link.name}
            </Link>
          ))}
          <Button asChild size="sm" className="rounded-full px-6 font-bold">
            <Link href="#pesan">Pesan Sekarang</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-lg font-bold py-3 border-b border-border/50"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Button asChild className="w-full rounded-xl py-6 text-lg font-bold">
            <Link href="#pesan" onClick={() => setIsOpen(false)}>Pesan Sekarang</Link>
          </Button>
        </div>
      )}
    </nav>
  );
}
