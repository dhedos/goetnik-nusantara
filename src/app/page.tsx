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
import { ArrowRight, Loader2, ImageIcon } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ICON_MAP, MAIN_BUSINESS_ID } from '@/lib/constants';

function LoadingScreen({ logoUrl }: { logoUrl?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="fixed inset-0 bg-background" />;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-center p-4">
      <div className="relative z-10 flex flex-col items-center">
        {logoUrl && (
          <div className="w-32 h-32 md:w-48 md:h-48 flex items-center justify-center animate-pulse transition-all duration-700">
            <img 
              src={logoUrl} 
              alt="Loading Logo" 
              className="object-contain brightness-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
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
  const [cachedLogo, setCachedLogo] = useState<string | undefined>(undefined);

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
    try {
      const cache = localStorage.getItem('goetnik-theme-cache');
      if (cache) {
        const theme = JSON.parse(cache);
        if (theme.logoUrl) {
          setCachedLogo(theme.logoUrl);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (settings !== undefined && !settingsLoading) {
      setIsReady(true);
    }
  }, [settings, settingsLoading]);

  if (!isReady) {
    const logoToDisplay = settings?.logoUrl || cachedLogo;
    return <LoadingScreen logoUrl={logoToDisplay} />;
  }

  const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'hero-tech');
  const heroDisplayImage = settings?.heroImageUrl || heroPlaceholder?.imageUrl;
  
  const heroTitle = settings?.heroTitle || 'Solusi Digital Kreatif & Terpercaya';
  const heroSubtitle = settings?.heroSubtitle || 'Kami membantu mewujudkan visi bisnis Anda melalui teknologi dan desain berkualitas tinggi.';
  const heroImagePos = settings?.heroImagePosition || '50%';

  const servicesTitle = settings?.servicesSectionTitle || 'Layanan Unggulan Kami';
  const servicesSubtitle = settings?.servicesSectionSubtitle || 'Hadir untuk memberikan solusi terbaik bagi setiap kendala teknologi dan kebutuhan visual Anda.';

  return (
    <>
      <DynamicTitle businessId={businessId} />
      <Navbar businessId={businessId} />
      
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <main className="animate-fade-in">
          <section className="relative min-h-[85vh] md:min-h-screen flex items-center pt-24 md:pt-28 pb-20 px-4 md:px-8 overflow-hidden">
            <div className="absolute inset-0 -z-20">
              {heroDisplayImage && (
                <img 
                  src={heroDisplayImage} 
                  alt="Banner Utama" 
                  className="absolute inset-0 w-full h-full object-cover opacity-25" 
                  style={{ objectPosition: `center ${heroImagePos}` }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
            </div>
            
            <div className="max-w-7xl mx-auto w-full relative z-10">
              <div className="space-y-6 md:space-y-8 max-w-4xl">
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] md:leading-[1] text-foreground break-words tracking-tighter">
                  {heroTitle}
                </h1>

                <p className="text-sm md:text-xl text-foreground/70 leading-relaxed max-w-2xl px-1 font-medium">
                  {heroSubtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 md:pt-8">
                  <Link href="#pesan" className="w-full sm:w-auto">
                    <Button size="lg" className="rounded-lg w-full px-8 md:px-10 shadow-2xl shadow-primary/30 h-14 md:h-16 text-sm md:text-base font-bold uppercase tracking-widest hover:scale-105 transition-all">
                      Konsultasi Gratis <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </Link>
                  <Link href="#layanan" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="rounded-lg w-full px-8 md:px-10 h-14 md:h-16 text-sm md:text-base font-bold border-white/10 bg-white/5 backdrop-blur-3xl hover:bg-white/10 transition-all uppercase tracking-widest">
                      Lihat Layanan
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section id="layanan" className="py-20 md:py-32 px-4 md:px-8 bg-secondary/5 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16 md:mb-24 space-y-4">
                <h2 className="text-3xl md:text-6xl font-black text-foreground uppercase tracking-tighter">{servicesTitle}</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto text-sm md:text-lg font-medium px-4 opacity-70">{servicesSubtitle}</p>
              </div>
              
              {servicesLoading && !services ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                  {services.map((s: any, i: number) => (
                    <div key={s.id}>
                      <ServiceCard 
                        {...s} 
                        icon={ICON_MAP[s.iconName] || ICON_MAP.Laptop} 
                        imageId={`service-${['os','repair','design','web'][i%4]}`} 
                        galleryUrls={s.galleryUrls || []}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="max-w-2xl mx-auto p-12 text-center bg-card/10 border-dashed border-border rounded-lg">
                  <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon size={32} className="opacity-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-muted-foreground uppercase tracking-widest">Layanan Segera Hadir</h3>
                  <p className="text-muted-foreground text-sm">Hubungi kami melalui WhatsApp untuk pemesanan langsung.</p>
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