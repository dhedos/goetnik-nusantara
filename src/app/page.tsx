
"use client";

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { AIAssistant } from '@/components/AIAssistant';
import { BookingForm } from '@/components/BookingForm';
import { ServiceCard } from '@/components/ServiceCard';
import { AboutUs } from '@/components/AboutUs';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { WhatsAppPopup } from '@/components/WhatsAppPopup';
import { DynamicTitle } from '@/components/DynamicTitle';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ICON_MAP, BUSINESS_NAME_DEFAULT, MAIN_BUSINESS_ID } from '@/lib/constants';

function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B1120] text-center p-4 overflow-hidden">
      {/* Premium Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] animate-pulse delay-700" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Premium Loader */}
        <div className="relative h-28 w-28 mb-12">
          <div className="absolute inset-0 rounded-[2rem] border-2 border-primary/10 rotate-45 animate-[spin_6s_linear_infinite]" />
          <div className="absolute inset-0 rounded-[2rem] border-2 border-t-primary/80 border-r-transparent border-b-transparent border-l-transparent rotate-45 animate-[spin_2s_linear_infinite] shadow-[0_0_30px_rgba(59,130,246,0.2)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
          </div>
        </div>

        <h2 className="text-white text-3xl font-black tracking-[0.2em] uppercase mb-10 animate-pulse italic">
          {text}
        </h2>

        {/* Premium Animated Progress Bar */}
        <div className="w-72 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[loading-progress_1.5s_infinite]" />
          <div className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-[loading-progress_2.5s_ease-in-out_infinite]" />
        </div>
        
        <p className="mt-6 text-muted-foreground/30 text-[11px] uppercase tracking-[0.6em] font-bold">
          Sistem Digital Nusantara
        </p>
      </div>
    </div>
  );
}

function HomeContent() {
  // Selalu gunakan ID 'main' agar terhubung otomatis dengan Admin
  const businessId = MAIN_BUSINESS_ID;
  const firestore = useFirestore();
  const [isTimeout, setIsTimeout] = useState(false);

  const servicesQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'businesses', businessId, 'services') : null, 
    [businessId, firestore]
  );
  const { data: services, loading: servicesLoading } = useCollection(servicesQuery);

  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', businessId, 'settings', 'profile') : null, 
    [businessId, firestore]
  );
  const { data: settings, loading: settingsLoading } = useDoc(settingsRef);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeout(true);
    }, 4500); 
    return () => clearTimeout(timer);
  }, []);

  // Tampilkan loading screen jika sedang mengambil data awal
  if (!isTimeout && (settingsLoading && !settings)) {
    return <LoadingScreen text="Menghubungkan ke Pusat Layanan..." />;
  }

  const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'hero-tech');
  const heroDisplayImage = settings?.heroImageUrl || heroPlaceholder?.imageUrl;
  const serviceImageIds = ['service-os', 'service-repair', 'service-design', 'service-web'];

  const heroBadge = settings?.heroBadge || 'Solusi Digital Terpercaya';
  const heroTitle = settings?.heroTitle || BUSINESS_NAME_DEFAULT;
  const heroSubtitle = settings?.heroSubtitle || 'Kami melayani kebutuhan teknologi, desain grafis, dan pembuatan aplikasi secara profesional.';

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <DynamicTitle businessId={businessId} />
      <Navbar businessId={businessId} />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 px-4 overflow-hidden">
          <div className="absolute inset-0 -z-20">
            {heroDisplayImage && (
              <Image 
                src={heroDisplayImage} 
                alt="Hero" 
                fill 
                className="object-cover opacity-20 animate-[subtle-zoom_30s_infinite_alternate]" 
                unoptimized={!!settings?.heroImageUrl} 
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
          </div>
          
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="space-y-10 max-w-4xl">
              <Badge variant="outline" className="animate-fade-in border-primary/40 text-primary px-8 py-2.5 bg-primary/10 backdrop-blur-xl rounded-full tracking-[0.2em] uppercase text-[10px] font-black">
                {heroBadge}
              </Badge>
              <h1 className="text-6xl md:text-9xl font-black animate-fade-in tracking-tighter leading-[0.85] text-white">
                {heroTitle.split(' ').map((word: string, i: number) => (
                  <span key={i} className={i === 1 ? "text-primary block" : "block"}>{word} </span>
                ))}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground/80 animate-fade-in leading-relaxed max-w-2xl delay-100 font-medium">
                {heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-6 animate-fade-in pt-8 delay-200">
                <Link href="#pesan">
                  <Button size="lg" className="rounded-[1.5rem] px-12 shadow-2xl shadow-primary/40 h-20 text-xl font-black uppercase italic tracking-tighter hover:scale-105 transition-all">
                    Mulai Pemesanan <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
                <Link href="#layanan">
                  <Button variant="outline" size="lg" className="rounded-[1.5rem] px-12 h-20 text-xl font-bold border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all">
                    Daftar Layanan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <AIAssistant businessId={businessId} />
        
        {/* Services Section */}
        <section id="layanan" className="py-40 px-4 bg-secondary/5 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-28 space-y-8">
              <Badge variant="outline" className="uppercase tracking-[0.4em] px-8 py-2 border-primary/20 text-primary bg-primary/5 font-black text-[10px]">Premium Solutions</Badge>
              <h2 className="text-5xl md:text-8xl font-black tracking-tight leading-none italic uppercase">Katalog Layanan</h2>
              <p className="text-muted-foreground/60 max-w-3xl mx-auto text-xl font-medium">Hadirkan efisiensi dan kreativitas dalam setiap aspek kebutuhan teknologi Anda.</p>
            </div>
            
            {servicesLoading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-8">
                <div className="h-16 w-16 rounded-3xl border-2 border-primary/20 border-t-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse tracking-[0.5em] text-xs uppercase font-black">Menyiapkan Katalog...</p>
              </div>
            ) : services && services.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                {services.map((s: any, i: number) => (
                  <div key={s.id} className="animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                    <ServiceCard 
                      {...s} 
                      icon={ICON_MAP[s.iconName] || ICON_MAP.Monitor} 
                      imageId={serviceImageIds[i % 4]} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="max-w-3xl mx-auto p-24 text-center bg-card/10 border-dashed border-white/5 backdrop-blur-2xl rounded-[3rem]">
                <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Loader2 className="h-12 w-12 text-muted-foreground opacity-10" />
                </div>
                <h3 className="text-3xl font-black mb-4 text-white/40 uppercase italic">Layanan Belum Tersedia</h3>
                <p className="text-muted-foreground/60 mb-10 text-lg">Admin sedang menyiapkan paket-paket terbaik untuk Anda. Silakan cek kembali nanti.</p>
              </Card>
            )}
          </div>
        </section>

        <AboutUs businessId={businessId} />
        <BookingForm businessId={businessId} />
        <Contact businessId={businessId} />
      </main>
      <Footer businessId={businessId} />
      <WhatsAppPopup businessId={businessId} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen text="Menghubungkan ke Pusat Layanan..." />}>
      <HomeContent />
    </Suspense>
  );
}
