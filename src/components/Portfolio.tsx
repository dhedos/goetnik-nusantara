"use client";

import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2, Maximize2 } from 'lucide-react';

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
          <h2 className="text-3xl md:text-5xl font-bold text-foreground uppercase tracking-tight">Portofolio Kami</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base font-medium">Beberapa contoh hasil kerja nyata yang telah kami selesaikan dengan sepenuh hati.</p>
        </div>

        <div className="columns-2 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {portfolio.map((item: any, i: number) => (
            <div 
              key={item.id} 
              className="relative group rounded-3xl overflow-hidden border border-border/10 shadow-xl bg-card/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-fade-in break-inside-avoid"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative w-full h-auto">
                <Image 
                  src={item.imageUrl} 
                  alt="Hasil Karya" 
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: '100%', height: 'auto' }}
                  className="object-contain transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                      <Maximize2 size={18} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">Hasil Karya Utuh</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
