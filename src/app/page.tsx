
"use client";

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
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] animate-pulse delay-700" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative h-16 w-16 md:h-20 md:w-20 mb-8">
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/10 rotate-45 animate-[spin_6s_linear_infinite]" />
          <div className="absolute inset-0 rounded-2xl border-2 border-t-primary/80 border-r-transparent border-b-transparent border-l-transparent rotate-45 animate-[spin_2s_linear_infinite] shadow-[0_0_30px_rgba(59,130,246,0.2)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-6 w-6 md:h-8 md:h-8 text-primary animate-pulse" />
          </div>
        </div>

        <h2 className="text-white text-lg md:text-2xl font-bold tracking-[0.1em] mb-8 animate-pulse px-4">
          {text}
        </h2>

        <div className="w-48 md:w-64 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[loading-progress_1.5s_infinite]" />
          <div className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-[loading-progress_2.5s_ease-in-out_infinite]" />
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
      <div className="flex flex-col min-h-screen animate-fade-in overflow-x-hidden">
        <DynamicTitle businessId={businessId} />
        <Navbar businessId={businessId} />
        <main>
          {/* Hero Section */}
          <section className="relative min-h-[85vh] md:min-h-screen flex items-center pt-28 pb-20 px-4 md:px-8 overflow-hidden">
            <div className="absolute inset-0 -z-20">
              {heroDisplayImage && (
                <Image 
                  src={heroDisplayImage} 
                  alt="Hero" 
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
                <Badge variant="outline" className="animate-fade-in border-primary/20 text-primary px-5 py-2 bg-primary/5 backdrop-blur-xl rounded-full tracking-wider uppercase text-[10px] font-bold w-fit">
                  {heroBadge}
                </Badge>
                
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold animate-fade-in leading-[1.1] md:leading-[1] text-white break-words">
                  {heroTitle}
                </h1>

                <p className="text-base md:text-xl text-white/60 animate-fade-in leading-relaxed max-w-2xl delay-100">
                  {heroSubtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in pt-8 delay-200">
                  <Link href="#pesan">
                    <Button size="lg" className="rounded-xl w-full sm:w-auto px-10 shadow-xl shadow-primary/20 h-14 md:h-16 text-base font-bold uppercase tracking-wide hover:scale-105 transition-all">
                      Pesan Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#layanan">
                    <Button variant="outline" size="lg" className="rounded-xl w-full sm:w-auto px-10 h-14 md:h-16 text-base font-bold border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all">
                      Lihat Layanan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <AIAssistant businessId={businessId} />
          
          {/* Services Section */}
          <section id="layanan" className="py-24 md:py-32 px-4 md:px-8 bg-secondary/5 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 md:mb-20 space-y-4">
                <Badge variant="outline" className="uppercase tracking-widest px-4 py-1 border-primary/20 text-primary bg-primary/5 font-bold text-[10px]">Premium Solutions</Badge>
                <h2 className="text-3xl md:text-5xl font-bold text-white uppercase">Layanan Unggulan</h2>
                <p className="text-white/40 max-w-2xl mx-auto text-sm md:text-base font-medium">Solusi kreatif dan teknologi modern untuk mempercepat pertumbuhan bisnis Anda.</p>
              </div>
              
              {servicesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <div className="h-10 w-10 rounded-xl border-2 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-white/30 animate-pulse tracking-widest text-[10px] uppercase font-bold">Menyiapkan Katalog...</p>
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
                <Card className="max-w-2xl mx-auto p-12 text-center bg-card/10 border-dashed border-white/5 rounded-3xl">
                  <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="h-8 w-8 text-muted-foreground opacity-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white/40 uppercase">Layanan Belum Tersedia</h3>
                  <p className="text-white/30 text-sm">Silakan hubungi kami untuk informasi lebih lanjut.</p>
                </Card>
              )}
            </div>
          </section>

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
