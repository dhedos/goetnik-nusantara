"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { AIAssistant } from '@/components/AIAssistant';
import { BookingForm } from '@/components/BookingForm';
import { ServiceCard } from '@/components/ServiceCard';
import { Portfolio } from '@/components/Portfolio';
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
import { ICON_MAP, BUSINESS_NAME_DEFAULT, MAIN_BUSINESS_ID } from '@/lib/constants';

const EthnicOrnament = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2L14.5 9L22 9L16 14L18.5 21L12 17L5.5 21L8 14L2 9L9.5 9L12 2Z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 7V5M12 19V17M7 12H5M19 12H17M8.5 8.5L7 7M17 17L15.5 15.5M15.5 8.5L17 7M7 17L8.5 15.5" />
  </svg>
);

function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-center p-4 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] animate-pulse delay-700" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative h-16 w-16 md:h-20 md:w-20 mb-8">
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/10 rotate-45 animate-[spin_6s_linear_infinite]" />
          <div className="absolute inset-0 rounded-2xl border-2 border-t-primary/80 border-r-transparent border-b-transparent border-l-transparent rotate-45 animate-[spin_2s_linear_infinite] shadow-[0_0_30px_rgba(var(--primary),0.2)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <EthnicOrnament className="h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse" />
          </div>
        </div>

        <h2 className="text-foreground text-base md:text-2xl font-bold tracking-[0.1em] mb-8 animate-pulse px-4">
          {text}
        </h2>

        <div className="w-48 md:w-64 h-1 bg-foreground/5 rounded-full overflow-hidden border border-foreground/5 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[loading-progress_1.5s_infinite]" />
          <div className="h-full bg-primary animate-[loading-progress_2.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const businessId = MAIN_BUSINESS_ID;
  const firestore = useFirestore();

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

  if (settingsLoading && !settings) {
    return <LoadingScreen text="Menyiapkan Pengalaman Digital..." />;
  }

  const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'hero-tech');
  const heroDisplayImage = settings?.heroImageUrl || heroPlaceholder?.imageUrl;
  const serviceImageIds = ['service-os', 'service-repair', 'service-design', 'service-web'];

  const heroBadge = settings?.heroBadge || 'Solusi Digital Terpercaya';
  const heroTitle = settings?.heroTitle || BUSINESS_NAME_DEFAULT;
  const heroSubtitle = settings?.heroSubtitle || 'Kami melayani kebutuhan teknologi, desain grafis, dan pembuatan aplikasi secara profesional.';
  const heroImagePos = settings?.heroImagePosition || '50%';

  return (
    <>
      <DynamicTitle businessId={businessId} />
      <Navbar businessId={businessId} />
      
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <main className="animate-fade-in">
          {/* Hero Section */}
          <section className="relative min-h-[85vh] md:min-h-screen flex items-center pt-24 md:pt-28 pb-20 px-4 md:px-8 overflow-hidden">
            <div className="absolute inset-0 -z-20">
              {heroDisplayImage && (
                <Image 
                  src={heroDisplayImage} 
                  alt="Hero Background" 
                  fill 
                  className="object-cover opacity-20 animate-[subtle-zoom_30s_infinite_alternate]" 
                  style={{ objectPosition: `center ${heroImagePos}` }}
                  unoptimized={heroDisplayImage.startsWith('data:')} 
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
            </div>
            
            <div className="max-w-7xl mx-auto w-full relative z-10">
              <div className="space-y-6 md:space-y-8 max-w-4xl">
                <Badge variant="outline" className="border-primary/20 text-primary px-4 md:px-5 py-1.5 md:py-2 bg-primary/5 backdrop-blur-xl rounded-full tracking-wider uppercase text-[9px] md:text-[10px] font-bold w-fit">
                  {heroBadge}
                </Badge>
                
                <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.2] md:leading-[1] text-foreground break-words">
                  {heroTitle}
                </h1>

                <p className="text-sm md:text-xl text-foreground/60 leading-relaxed max-w-2xl px-1">
                  {heroSubtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 md:pt-8">
                  <Link href="#pesan" className="w-full sm:w-auto">
                    <Button size="lg" className="rounded-xl w-full px-8 md:px-10 shadow-xl shadow-primary/20 h-14 md:h-16 text-sm md:text-base font-bold uppercase tracking-wide hover:scale-105 transition-all">
                      Pesan Sekarang <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </Link>
                  <Link href="#layanan" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="rounded-xl w-full px-8 md:px-10 h-14 md:h-16 text-sm md:text-base font-bold border-border/10 bg-foreground/5 backdrop-blur-2xl hover:bg-foreground/10 transition-all">
                      Lihat Layanan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <AIAssistant businessId={businessId} />
          
          {/* Services Section */}
          <section id="layanan" className="py-20 md:py-32 px-4 md:px-8 bg-secondary/5 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 md:mb-20 space-y-4">
                <Badge variant="outline" className="uppercase tracking-widest px-4 py-1 border-primary/20 text-primary bg-primary/5 font-bold text-[9px] md:text-[10px]">Premium Solutions</Badge>
                <h2 className="text-2xl md:text-5xl font-bold text-foreground uppercase">Layanan Unggulan</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-xs md:text-base font-medium px-4">Solusi kreatif dan teknologi modern untuk mempercepat pertumbuhan bisnis Anda.</p>
              </div>
              
              {servicesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <div className="h-10 w-10 rounded-xl border-2 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-muted-foreground animate-pulse tracking-widest text-[10px] uppercase font-bold">Menyiapkan Katalog...</p>
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {services.map((s: any, i: number) => (
                    <div key={s.id}>
                      <ServiceCard 
                        {...s} 
                        icon={ICON_MAP[s.iconName] || ICON_MAP.Monitor} 
                        imageId={serviceImageIds[i % 4]} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="max-w-2xl mx-auto p-12 text-center bg-card/10 border-dashed border-border rounded-3xl">
                  <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="h-8 w-8 text-muted-foreground opacity-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-muted-foreground uppercase">Layanan Belum Tersedia</h3>
                  <p className="text-muted-foreground text-sm">Silakan hubungi kami untuk informasi lebih lanjut.</p>
                </Card>
              )}
            </div>
          </section>

          <Portfolio businessId={businessId} />
          <AboutUs businessId={businessId} />
          <BookingForm businessId={businessId} />
          <Contact businessId={businessId} />
        </main>
        <Footer businessId={businessId} />
      </div>
      <WhatsAppPopup businessId={businessId} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen text="Menghubungkan..." />}>
      <HomeContent />
    </Suspense>
  );
}