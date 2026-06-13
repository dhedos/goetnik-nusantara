
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
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
import { Card } from '@/components/ui/card';
import { ArrowRight, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ICON_MAP, MAIN_BUSINESS_ID } from '@/lib/constants';

function LoadingScreen({ logoUrl }: { logoUrl?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-center p-4">
      <div className="relative z-10 flex flex-col items-center">
        {logoUrl && (
          <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center animate-pulse transition-all duration-700">
            <img 
              src={logoUrl} 
              alt="Loading Logo" 
              className="max-w-full max-h-full object-contain brightness-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function HomeContent() {
  const businessId = MAIN_BUSINESS_ID;
  const firestore = useFirestore();
  const [isReady, setIsReady] = useState(false);

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
    const safetyTimer = setTimeout(() => {
      setIsReady(true);
    }, 800);

    if (settings && !settingsLoading) {
      setIsReady(true);
    }

    return () => clearTimeout(safetyTimer);
  }, [settings, settingsLoading]);

  if (!isReady) {
    return <LoadingScreen logoUrl={settings?.logoUrl} />;
  }

  const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'hero-tech');
  const heroDisplayImage = settings?.heroImageUrl || heroPlaceholder?.imageUrl;
  const serviceImageIds = ['service-os', 'service-repair', 'service-design', 'service-web'];

  const heroTitle = settings?.heroTitle || '';
  const heroSubtitle = settings?.heroSubtitle || '';
  const heroImagePos = settings?.heroImagePosition || '50%';

  const servicesTitle = settings?.servicesSectionTitle || 'Layanan Unggulan';
  const servicesSubtitle = settings?.servicesSectionSubtitle || '';

  return (
    <>
      <DynamicTitle businessId={businessId} />
      <Navbar businessId={businessId} />
      
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <main className="animate-fade-in">
          <section className="relative min-h-[85vh] md:min-h-screen flex items-center pt-24 md:pt-28 pb-20 px-4 md:px-8 overflow-hidden">
            <div className="absolute inset-0 -z-20">
              {heroDisplayImage && (
                <Image 
                  src={heroDisplayImage} 
                  alt="Hero Background" 
                  fill 
                  sizes="100vw"
                  className="object-cover opacity-20" 
                  style={{ objectPosition: `center ${heroImagePos}` }}
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
            </div>
            
            <div className="max-w-7xl mx-auto w-full relative z-10">
              <div className="space-y-6 md:space-y-8 max-w-4xl">
                {heroTitle && (
                  <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.2] md:leading-[1] text-foreground break-words">
                    {heroTitle}
                  </h1>
                )}

                {heroSubtitle && (
                  <p className="text-sm md:text-xl text-foreground/60 leading-relaxed max-w-2xl px-1">
                    {heroSubtitle}
                  </p>
                )}

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

          <section id="layanan" className="py-20 md:py-32 px-4 md:px-8 bg-secondary/5 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 md:mb-20 space-y-4">
                <h2 className="text-2xl md:text-5xl font-bold text-foreground uppercase">{servicesTitle}</h2>
                {servicesSubtitle && <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base font-medium px-4">{servicesSubtitle}</p>}
              </div>
              
              {servicesLoading && !services ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
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
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  );
}
