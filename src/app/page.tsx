
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
import { ArrowRight, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ICON_MAP, BUSINESS_NAME_DEFAULT } from '@/lib/constants';

function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-[#0B1120] text-center p-4 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative h-20 w-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
        </div>
        <h2 className="text-gray-300 text-xl font-medium tracking-widest animate-pulse drop-shadow-lg">
          {text}
        </h2>
        <div className="w-48 h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-primary animate-[loading-progress_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get('id') || "goetnik-default";
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
    }, 5000); 
    return () => clearTimeout(timer);
  }, []);

  if (!isTimeout && (!firestore || (settingsLoading && !settings))) {
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
                className="object-cover opacity-30 animate-[subtle-zoom_20s_infinite_alternate]" 
                unoptimized={!!settings?.heroImageUrl} 
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
          </div>
          
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="space-y-8 max-w-3xl">
              <Badge variant="outline" className="animate-fade-in border-primary/50 text-primary px-6 py-2 bg-primary/5 backdrop-blur-sm rounded-full tracking-wider uppercase text-xs font-bold">
                {heroBadge}
              </Badge>
              <h1 className="text-6xl md:text-8xl font-black animate-fade-in tracking-tighter leading-[0.9] text-white">
                {heroTitle.split(' ').map((word, i) => (
                  <span key={i} className={i === 1 ? "text-primary block" : "block"}>{word} </span>
                ))}
              </h1>
              <p className="text-xl text-muted-foreground animate-fade-in leading-relaxed max-w-xl delay-100">
                {heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-5 animate-fade-in pt-6 delay-200">
                <Button asChild size="lg" className="rounded-2xl px-10 shadow-2xl shadow-primary/30 h-16 text-lg font-bold hover:scale-105 transition-all">
                  <Link href="#pesan">Mulai Pemesanan <ArrowRight className="ml-2" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl px-10 h-16 text-lg border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all">
                  <Link href="#layanan">Jelajahi Layanan</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <AIAssistant businessId={businessId} />
        
        {/* Services Section */}
        <section id="layanan" className="py-32 px-4 bg-secondary/10 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-6">
              <Badge variant="outline" className="uppercase tracking-[0.3em] px-6 py-1 border-primary/30 text-primary bg-primary/5">Premium Solutions</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">Katalog Layanan Digital</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Hadirkan efisiensi dan kreativitas dalam setiap aspek kebutuhan teknologi Anda.</p>
            </div>
            
            {servicesLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse tracking-widest text-sm uppercase">Menyiapkan Katalog...</p>
              </div>
            ) : services && services.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((s: any, i: number) => (
                  <div key={s.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <ServiceCard 
                      {...s} 
                      icon={ICON_MAP[s.iconName] || ICON_MAP.Monitor} 
                      imageId={serviceImageIds[i % 4]} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto p-16 text-center bg-card/20 border-dashed border-white/5 backdrop-blur-sm rounded-[2rem]">
                <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="h-10 w-10 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white/50">Layanan Belum Tersedia</h3>
                <p className="text-muted-foreground mb-8">Admin sedang menyiapkan paket-paket terbaik untuk Anda. Silakan cek kembali nanti.</p>
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
