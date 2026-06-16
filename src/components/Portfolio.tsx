"use client";

import * as React from 'react';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Loader2, Maximize2, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MAIN_BUSINESS_ID } from '@/lib/constants';

interface PortfolioProps {
  businessId: string;
}

export function Portfolio({ businessId }: PortfolioProps) {
  const firestore = useFirestore();
  
  const portfolioQueryFixed = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'businesses', businessId, 'portfolio'), orderBy('createdAt', 'desc')) : null, 
    [firestore, businessId]
  );
  const { data: portfolio, loading } = useCollection(portfolioQueryFixed);

  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', businessId, 'settings', 'profile') : null, 
    [firestore, businessId]
  );
  const { data: settings } = useDoc(settingsRef);

  const portfolioTitle = settings?.portfolioSectionTitle || 'Portofolio Kami';
  const portfolioSubtitle = settings?.portfolioSectionSubtitle || 'Beberapa contoh hasil kerja nyata yang telah kami selesaikan dengan sepenuh hati.';
  const showGlobalLink = settings?.showPortfolioExternalUrl ?? false;
  const globalUrl = settings?.portfolioExternalUrl || '';

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={32} />
      <p className="text-xs font-bold uppercase tracking-widest opacity-20">Memuat Galeri...</p>
    </div>
  );

  if (!portfolio || portfolio.length === 0) return null;

  return (
    <section id="portofolio" className="py-24 px-4 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground uppercase tracking-tight">{portfolioTitle}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base font-medium">{portfolioSubtitle}</p>
        </div>

        <div className="columns-2 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {portfolio.map((item: any, i: number) => {
            const isBase64 = item.imageUrl?.startsWith('data:');
            
            return (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <div 
                    className="relative group rounded-lg overflow-hidden border border-border/10 shadow-xl bg-card/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-fade-in break-inside-avoid cursor-pointer"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="relative w-full h-auto">
                      {isBase64 ? (
                        <img 
                          src={item.imageUrl} 
                          alt="Hasil Karya" 
                          className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105" 
                        />
                      ) : (
                        <Image 
                          src={item.imageUrl} 
                          alt="Hasil Karya" 
                          width={600}
                          height={400}
                          style={{ width: '100%', height: 'auto' }}
                          className="object-contain transition-transform duration-700 group-hover:scale-105" 
                          unoptimized
                        />
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                            <Maximize2 size={18} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">Lihat Full</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 border-none bg-black/95 overflow-hidden flex flex-col rounded-lg z-[70]">
                  <DialogTitle className="sr-only">Detail Portofolio</DialogTitle>
                  <DialogDescription className="sr-only">Tampilan penuh gambar portofolio</DialogDescription>
                  
                  <div className="relative flex-1 w-full h-full flex items-center justify-center p-4 sm:p-8">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img 
                        src={item.imageUrl} 
                        alt="Full View" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 z-[80]">
                    <DialogTrigger asChild>
                      <button className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-md">
                        <X size={20} />
                      </button>
                    </DialogTrigger>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>

        {showGlobalLink && globalUrl && (
          <div className="mt-12 flex justify-center animate-fade-in">
            <Button 
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-4 sm:py-5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all group h-auto"
            >
              <a href={globalUrl.startsWith('http') ? globalUrl : `https://${globalUrl}`} target="_blank" className="flex items-center gap-3">
                Portofolio Kami Selengkapnya 
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}