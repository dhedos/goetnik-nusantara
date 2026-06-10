
"use client";

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

export default function Home() {
  const firestore = useFirestore();

  const servicesQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'services') : null, 
    [firestore]
  );
  const { data: services } = useCollection(servicesQuery);

  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'business') : null, 
    [firestore]
  );
  const { data: settings } = useDoc(settingsRef);

  const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'hero-tech');
  const heroDisplayImage = settings?.heroImageUrl || heroPlaceholder?.imageUrl;
  const serviceImageIds = ['service-os', 'service-repair', 'service-design', 'service-web'];

  const heroBadge = settings?.heroBadge || 'Solusi IT Terpercaya di Kota Anda';
  const heroTitle = settings?.heroTitle || 'Selamat Datang di Portal Kami';
  const heroSubtitle = settings?.heroSubtitle || 'Kami siap melayani berbagai kebutuhan teknis dan digital Anda dengan profesional.';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 px-4 overflow-hidden">
          <div className="absolute inset-0 -z-20">
            {heroDisplayImage && (
              <Image 
                src={heroDisplayImage}
                alt="Tech Background"
                fill
                className="object-cover opacity-30 scale-105"
                priority
                unoptimized={!!settings?.heroImageUrl}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/10" />
          </div>

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {heroBadge}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold font-headline leading-tight tracking-tighter">
                {heroTitle.includes(' ') ? (
                  <>
                    {heroTitle.split(' ').slice(0, -2).join(' ')} <br />
                    <span className="text-gradient">{heroTitle.split(' ').slice(-2).join(' ')}</span>
                  </>
                ) : heroTitle}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                {heroSubtitle}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  <Link href="#pesan">Pesan Sekarang <ArrowRight className="ml-2" size={20} /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                  <Link href="#layanan">Lihat Layanan</Link>
                </Button>
              </div>
            </div>

            <div className="hidden lg:block animate-in fade-in zoom-in duration-1000 delay-300">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative glass-card p-4 rounded-[2rem] border-white/10">
                  <div className="rounded-[1.5rem] overflow-hidden">
                     <Image 
                        src="https://picsum.photos/seed/laptop2/800/600"
                        alt="App Demo"
                        width={800}
                        height={600}
                        className="w-full h-auto"
                      />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Assistant Section */}
        <AIAssistant />

        {/* Services Section */}
        <section id="layanan" className="py-24 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h4 className="text-primary font-bold uppercase tracking-widest text-sm">Apa yang Kami Lakukan</h4>
              <h2 className="text-4xl md:text-5xl font-bold font-headline">Layanan <span className="text-gradient">Unggulan</span></h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Pilih layanan yang Anda butuhkan. Kami menjamin kualitas terbaik untuk setiap pengerjaan.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services?.map((service: any, index: number) => (
                <div key={service.id} className="animate-in fade-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <ServiceCard 
                    name={service.name}
                    price={service.price}
                    description={service.description}
                    features={service.features || []}
                    icon={ICON_MAP[service.iconName] || ICON_MAP.Monitor}
                    imageId={serviceImageIds[index % serviceImageIds.length]}
                    imageUrl={service.imageUrl}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <AboutUs />

        {/* Booking Form Section */}
        <BookingForm />

        {/* Contact Section */}
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
