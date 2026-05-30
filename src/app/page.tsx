
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
import { SERVICES, BUSINESS_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight, Play } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-tech');
  const serviceImageIds = ['service-os', 'service-repair', 'service-design', 'service-web'];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 px-4 overflow-hidden">
          <div className="absolute inset-0 -z-20">
            {heroImage && (
              <Image 
                src={heroImage.imageUrl}
                alt="Tech Background"
                fill
                className="object-cover opacity-30 scale-105 animate-pulse"
                priority
                data-ai-hint={heroImage.imageHint}
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
                Solusi IT Terpercaya di Kota Anda
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold font-headline leading-tight tracking-tighter">
                Transformasi Digital <br />
                <span className="text-gradient">Tanpa Hambatan</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Kami menyediakan layanan service laptop profesional, desain grafis estetik, dan pembuatan aplikasi modern untuk mendukung performa bisnis dan hobi Anda.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  <Link href="#pesan">Pesan Sekarang <ArrowRight className="ml-2" size={20} /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                  <Link href="#layanan">Lihat Layanan</Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-6 pt-8">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-background overflow-hidden">
                      <Image 
                        src={`https://picsum.photos/seed/${i+50}/100/100`} 
                        alt="User Avatar" 
                        width={48} 
                        height={48} 
                        className="object-cover"
                      />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-2 border-background bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    +1k
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-bold">1,240+ Pelanggan Puas</p>
                  <div className="flex text-yellow-500">
                    {[1,2,3,4,5].map(i => <ChevronRight key={i} size={12} className="rotate-90" />)}
                  </div>
                </div>
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
                  <div className="absolute -bottom-8 -right-8 p-6 bg-accent rounded-3xl shadow-2xl animate-bounce duration-[3000ms]">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                      <Play fill="currentColor" size={24} />
                    </div>
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
              {SERVICES.map((service, index) => (
                <div key={service.id} className="animate-in fade-in slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  <ServiceCard 
                    {...service} 
                    imageId={serviceImageIds[index]}
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
