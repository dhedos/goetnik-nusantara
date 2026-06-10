
"use client";

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { AIAssistant } from '@/components/AIAssistant';
import { BookingForm } from '@/components/BookingForm';
import { ServiceCard } from '@/components/ServiceCard';
import { AboutUs } from '@/components/AboutUs';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ICON_MAP } from '@/lib/constants';

// ID Bisnis default jika tidak ada parameter ?id=...
const DEFAULT_BUSINESS_ID = "goetnik-default"; 

export default function Home() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get('id') || DEFAULT_BUSINESS_ID;
  const firestore = useFirestore();

  const servicesQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'businesses', businessId, 'services') : null, 
    [firestore, businessId]
  );
  const { data: services, loading: servicesLoading } = useCollection(servicesQuery);

  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', businessId, 'settings', 'profile') : null, 
    [firestore, businessId]
  );
  const { data: settings, loading: settingsLoading } = useDoc(settingsRef);

  if (settingsLoading || (servicesLoading && !services)) {
    return <div className="flex h-screen items-center justify-center">Memuat Bisnis...</div>;
  }

  const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'hero-tech');
  const heroDisplayImage = settings?.heroImageUrl || heroPlaceholder?.imageUrl;
  const serviceImageIds = ['service-os', 'service-repair', 'service-design', 'service-web'];

  const heroBadge = settings?.heroBadge || 'Solusi Terpercaya';
  const heroTitle = settings?.heroTitle || 'Selamat Datang';
  const heroSubtitle = settings?.heroSubtitle || 'Kami siap melayani kebutuhan Anda.';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar businessId={businessId} />
      <main>
        <section className="relative min-h-screen flex items-center pt-20 px-4">
          <div className="absolute inset-0 -z-20">
            {heroDisplayImage && <Image src={heroDisplayImage} alt="Hero" fill className="object-cover opacity-30" unoptimized={!!settings?.heroImageUrl} />}
            <div className="absolute inset-0 bg-background/90" />
          </div>
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6 max-w-2xl">
              <Badge variant="outline">{heroBadge}</Badge>
              <h1 className="text-5xl md:text-7xl font-bold">{heroTitle}</h1>
              <p className="text-xl text-muted-foreground">{heroSubtitle}</p>
              <Button asChild size="lg"><Link href="#pesan">Pesan Sekarang <ArrowRight className="ml-2" /></Link></Button>
            </div>
          </div>
        </section>

        <AIAssistant businessId={businessId} />
        
        <section id="layanan" className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services?.map((s: any, i: number) => (
                <ServiceCard key={s.id} {...s} icon={ICON_MAP[s.iconName] || ICON_MAP.Monitor} imageId={serviceImageIds[i % 4]} />
              ))}
            </div>
          </div>
        </section>

        <AboutUs businessId={businessId} />
        <BookingForm businessId={businessId} />
        <Contact businessId={businessId} />
      </main>
      <Footer businessId={businessId} />
    </div>
  );
}
