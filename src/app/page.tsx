
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
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[#0B1120] text-center p-4">
      <div className="relative">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
      <p className="text-gray-400 text-xl font-medium tracking-tight">{text}</p>
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

  // Fallback timeout jika koneksi sangat lambat atau API Key salah
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeout(true);
    }, 5000); // 5 detik
    return () => clearTimeout(timer);
  }, []);

  // Tampilkan loading hanya jika firestore sedang inisialisasi DAN belum timeout
  if (!isTimeout && (!firestore || (settingsLoading && !settings))) {
    return <LoadingScreen text="Menghubungkan ke Pusat Layanan..." />;
  }

  const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'hero-tech');
  const heroDisplayImage = settings?.heroImageUrl || heroPlaceholder?.imageUrl;
  const serviceImageIds = ['service-os', 'service-repair', 'service-design', 'service-web'];

  const heroBadge = settings?.heroBadge || 'Solusi Terpercaya';
  const heroTitle = settings?.heroTitle || BUSINESS_NAME_DEFAULT;
  const heroSubtitle = settings?.heroSubtitle || 'Kami siap melayani kebutuhan teknologi dan desain Anda secara profesional.';

  return (
    <div className="flex flex-col min-h-screen">
      <DynamicTitle businessId={businessId} />
      <Navbar businessId={businessId} />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 px-4">
          <div className="absolute inset-0 -z-20">
            {heroDisplayImage && (
              <Image 
                src={heroDisplayImage} 
                alt="Hero" 
                fill 
                className="object-cover opacity-30" 
                unoptimized={!!settings?.heroImageUrl} 
                priority
              />
            )}
            <div className="absolute inset-0 bg-background/90" />
          </div>
          <div className="max-w-7xl mx-auto w-full">
            <div className="space-y-6 max-w-2xl">
              <Badge variant="outline" className="animate-fade-in border-primary/50 text-primary px-4 py-1">{heroBadge}</Badge>
              <h1 className="text-5xl md:text-7xl font-bold animate-fade-in tracking-tight leading-[1.1]">
                {heroTitle}
              </h1>
              <p className="text-xl text-muted-foreground animate-fade-in leading-relaxed max-w-xl">
                {heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in pt-4">
                <Button asChild size="lg" className="rounded-xl px-8 shadow-xl shadow-primary/20 h-14 text-lg">
                  <Link href="#pesan">Pesan Sekarang <ArrowRight className="ml-2" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl px-8 h-14 text-lg border-white/10 bg-white/5 backdrop-blur-sm">
                  <Link href="#layanan">Lihat Layanan</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <AIAssistant businessId={businessId} />
        
        {/* Services Section */}
        <section id="layanan" className="py-24 px-4 bg-secondary/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="uppercase tracking-widest px-4">Layanan Unggulan</Badge>
              <h2 className="text-3xl md:text-5xl font-bold">Solusi Digital Untuk Anda</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Kami menyediakan berbagai layanan teknis dan kreatif untuk mendukung pertumbuhan bisnis dan produktivitas Anda.</p>
            </div>
            
            {servicesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                <p className="text-muted-foreground animate-pulse">Memuat daftar layanan...</p>
              </div>
            ) : services && services.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((s: any, i: number) => (
                  <ServiceCard 
                    key={s.id} 
                    {...s} 
                    icon={ICON_MAP[s.iconName] || ICON_MAP.Monitor} 
                    imageId={serviceImageIds[i % 4]} 
                  />
                ))}
              </div>
            ) : (
              <Card className="max-w-md mx-auto p-12 text-center bg-card/30 border-dashed border-white/10">
                <p className="text-muted-foreground">Belum ada layanan yang ditambahkan oleh admin.</p>
                <Button variant="link" className="mt-4" asChild><Link href="/login">Login Admin</Link></Button>
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
