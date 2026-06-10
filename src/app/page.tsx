
"use client";

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
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
import { ICON_MAP } from '@/lib/constants';

// ID Bisnis default jika tidak ada parameter ?id=...
const DEFAULT_BUSINESS_ID = "goetnik-default"; 

function HomeContent() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get('id') || DEFAULT_BUSINESS_ID;
  const firestore = useFirestore();

  // Query Layanan
  const servicesQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'businesses', businessId, 'services') : null, 
    [businessId, firestore]
  );
  const { data: services, loading: servicesLoading } = useCollection(servicesQuery);

  // Query Settings
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', businessId, 'settings', 'profile') : null, 
    [businessId, firestore]
  );
  const { data: settings, loading: settingsLoading } = useDoc(settingsRef);

  // LOADING SCREEN: Pastikan tampil sesuai desain asli user
  if (!firestore || settingsLoading || (servicesLoading && !services)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[#0B1120] text-center p-4">
        <div className="relative">
           <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
        <p className="text-gray-400 text-xl font-medium tracking-tight">Menghubungkan ke Pusat Layanan...</p>
      </div>
    );
  }

  const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'hero-tech');
  const heroDisplayImage = settings?.heroImageUrl || heroPlaceholder?.imageUrl;
  const serviceImageIds = ['service-os', 'service-repair', 'service-design', 'service-web'];

  const heroBadge = settings?.heroBadge || 'Solusi Terpercaya';
  const heroTitle = settings?.heroTitle || 'Selamat Datang';
  const heroSubtitle = settings?.heroSubtitle || 'Kami siap melayani kebutuhan Anda.';

  return (
    <div className="flex flex-col min-h-screen">
      <DynamicTitle businessId={businessId} />
      <Navbar businessId={businessId} />
      <main>
        <section className="relative min-h-screen flex items-center pt-20 px-4">
          <div className="absolute inset-0 -z-20">
            {heroDisplayImage && (
              <Image 
                src={heroDisplayImage} 
                alt="Hero" 
                fill 
                className="object-cover opacity-30" 
                unoptimized={!!settings?.heroImageUrl} 
              />
            )}
            <div className="absolute inset-0 bg-background/90" />
          </div>
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6 max-w-2xl">
              <Badge variant="outline" className="animate-fade-in border-primary/50 text-primary">{heroBadge}</Badge>
              <h1 className="text-5xl md:text-7xl font-bold animate-fade-in tracking-tight">{heroTitle}</h1>
              <p className="text-xl text-muted-foreground animate-fade-in leading-relaxed">{heroSubtitle}</p>
              <Button asChild size="lg" className="animate-fade-in rounded-xl px-8 shadow-xl shadow-primary/20">
                <Link href="#pesan">Pesan Sekarang <ArrowRight className="ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <AIAssistant businessId={businessId} />
        
        <section id="layanan" className="py-24 px-4 bg-secondary/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">Layanan Unggulan</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Solusi Digital Untuk Anda</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services?.map((s: any, i: number) => (
                <ServiceCard 
                  key={s.id} 
                  {...s} 
                  icon={ICON_MAP[s.iconName] || ICON_MAP.Monitor} 
                  imageId={serviceImageIds[i % 4]} 
                />
              ))}
            </div>
            {!services?.length && !servicesLoading && (
              <Card className="max-w-md mx-auto p-12 text-center bg-card/30 border-dashed">
                <p className="text-muted-foreground">Belum ada layanan yang tersedia saat ini.</p>
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
    <Suspense fallback={
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[#0B1120] text-center p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-gray-400 text-xl font-medium tracking-tight">Memuat Halaman...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
