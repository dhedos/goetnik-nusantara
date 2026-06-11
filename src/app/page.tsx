
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
        <div className="relative h-20 w-20 md:h-28 md:w-28 mb-8 md:mb-12">
          <div className="absolute inset-0 rounded-[2rem] border-2 border-primary/10 rotate-45 animate-[spin_6s_linear_infinite]" />
          <div className="absolute inset-0 rounded-[2rem] border-2 border-t-primary/80 border-r-transparent border-b-transparent border-l-transparent rotate-45 animate-[spin_2s_linear_infinite] shadow-[0_0_30px_rgba(59,130,246,0.2)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 md:h-12 md:h-12 text-primary animate-pulse" />
          </div>
        </div>

        <h2 className="text-white text-xl md:text-3xl font-black tracking-[0.2em] uppercase mb-8 md:mb-10 animate-pulse italic px-4">
          {text}
        </h2>

        <div className="w-60 md:w-72 h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[loading-progress_1.5s_infinite]" />
          <div className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-[loading-progress_2.5s_ease-in-out_infinite]" />
        </div>
        
        <p className="mt-6 text-muted-foreground/30 text-[9px] md:text-[11px] uppercase tracking-[0.6em] font-bold">
          Sistem Digital Nusantara
        </p>
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
    return <LoadingScreen text="Menghubungkan..." />;
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
          <section className="relative min-h-[90vh] md:min-h-screen flex items-center pt-28 pb-20 px-4 md:px-8 overflow-hidden">
            <div className="absolute inset-0 -z-20">
              {heroDisplayImage && (
                <Image 
                  src={heroDisplayImage} 
                  alt="Hero" 
                  fill 
                  className="object-cover opacity-15 md:opacity-20 animate-[subtle-zoom_40s_infinite_alternate]" 
                  style={{ objectPosition: `center ${heroImagePos}` }}
                  unoptimized={heroDisplayImage.startsWith('data:')} 
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
            </div>
            
            <div className="max-w-7xl mx-auto w-full relative z-10">
              <div className="space-y-6 md:space-y-10 max-w-5xl">
                <Badge variant="outline" className="animate-fade-in border-primary/30 text-primary px-5 md:px-8 py-2 md:py-2.5 bg-primary/5 backdrop-blur-xl rounded-full tracking-[0.15em] md:tracking-[0.2em] uppercase text-[9px] md:text-[10px] font-black w-fit">
                  {heroBadge}
                </Badge>
                
                <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black animate-fade-in tracking-tighter leading-[0.9] md:leading-[0.85] text-white break-words">
                  {heroTitle}
                </h1>

                <p className="text-lg md:text-2xl text-muted-foreground/70 animate-fade-in leading-relaxed max-w-2xl delay-100 font-medium">
                  {heroSubtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 animate-fade-in pt-6 md:pt-10 delay-200">
                  <Link href="#pesan">
                    <Button size="lg" className="rounded-2xl md:rounded-[1.5rem] w-full sm:w-auto px-8 md:px-12 shadow-2xl shadow-primary/30 h-16 md:h-20 text-lg md:text-xl font-black uppercase italic tracking-tighter hover:scale-105 transition-all">
                      Pesan Sekarang <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                  </Link>
                  <Link href="#layanan">
                    <Button variant="outline" size="lg" className="rounded-2xl md:rounded-[1.5rem] w-full sm:w-auto px-8 md:px-12 h-16 md:h-20 text-lg md:text-xl font-bold border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all">
                      Lihat Layanan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <AIAssistant businessId={businessId} />
          
          {/* Services Section */}
          <section id="layanan" className="py-24 md:py-40 px-4 md:px-8 bg-secondary/5 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 md:mb-28 space-y-6 md:space-y-8">
                <Badge variant="outline" className="uppercase tracking-[0.3em] md:tracking-[0.4em] px-6 md:px-8 py-2 border-primary/20 text-primary bg-primary/5 font-black text-[9px] md:text-[10px]">Premium Solutions</Badge>
                <h2 className="text-4xl md:text-8xl font-black tracking-tight leading-none italic uppercase">Layanan Kami</h2>
                <p className="text-muted-foreground/60 max-w-3xl mx-auto text-base md:text-xl font-medium px-4">Solusi kreatif dan teknologi untuk mempercepat pertumbuhan bisnis Anda.</p>
              </div>
              
              {servicesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 md:py-40 gap-6 md:gap-8">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl md:rounded-3xl border-2 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-muted-foreground animate-pulse tracking-[0.4em] text-[10px] md:text-xs uppercase font-black">Menyiapkan Katalog...</p>
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
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
                <Card className="max-w-3xl mx-auto p-12 md:p-24 text-center bg-card/10 border-dashed border-white/5 backdrop-blur-2xl rounded-[2rem] md:rounded-[3rem]">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                    <Loader2 className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground opacity-10" />
                  </div>
                  <h3 className="text-xl md:text-3xl font-black mb-4 text-white/40 uppercase italic">Layanan Belum Tersedia</h3>
                  <p className="text-muted-foreground/60 text-sm md:text-lg">Silakan cek kembali beberapa saat lagi.</p>
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
