"use client";

import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Loader2, Maximize2 } from 'lucide-react';

interface PortfolioProps {
  businessId: string;
}

export function Portfolio({ businessId }: PortfolioProps) {
  const firestore = useFirestore();
  const portfolioQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'businesses', businessId, 'portfolio'), orderBy('createdAt', 'desc')) : null, 
    [firestore, businessId]
  );
  const { data: portfolio, loading } = useCollection(portfolioQuery);

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
          <Badge variant="outline" className="uppercase tracking-[0.3em] px-4 py-1 border-primary/20 text-primary bg-primary/5 font-bold text-[10px]">Pameran Karya</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground uppercase tracking-tight">Portofolio Kami</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base font-medium">Beberapa contoh hasil kerja nyata yang telah kami selesaikan dengan sepenuh hati.</p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {portfolio.map((item: any, i: number) => (
            <div 
              key={item.id} 
              className="relative group rounded-3xl overflow-hidden border border-border/10 shadow-xl bg-card transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-fade-in break-inside-avoid"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative">
                <Image 
                  src={item.imageUrl} 
                  alt="Hasil Karya" 
                  width={800}
                  height={1200}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" 
                  unoptimized 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                      <Maximize2 size={18} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">Lihat Hasil Karya</span>
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
