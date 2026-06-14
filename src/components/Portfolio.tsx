"use client";

import * as React from 'react';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2, Maximize2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PortfolioProps {
  businessId: string;
}

export function Portfolio({ businessId }: PortfolioProps) {
  const firestore = useFirestore();
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  
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
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <div 
                  className="relative group rounded-3xl overflow-hidden border border-border/10 shadow-xl bg-card/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 animate-fade-in break-inside-avoid cursor-pointer"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative w-full h-auto">
                    <Image 
                      src={item.imageUrl} 
                      alt="Hasil Karya" 
                      width={0}
                      height={0}
                      sizes="(max-width: 768px) 50vw, 33vw"
                      style={{ width: '100%', height: 'auto' }}
                      className="object-contain transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                          <Maximize2 size={18} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-md">Lihat Full</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 border-none bg-black/95 overflow-hidden flex flex-col rounded-3xl">
                <DialogTitle className="sr-only">Detail Portofolio</DialogTitle>
                <DialogDescription className="sr-only">Tampilan penuh gambar portofolio</DialogDescription>
                
                <div className="relative flex-1 w-full h-full flex items-center justify-center p-4 sm:p-8">
                  <div className="relative w-full h-full">
                    <Image 
                      src={item.imageUrl} 
                      alt="Full View" 
                      fill
                      sizes="95vw"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 z-50">
                  <DialogTrigger asChild>
                    <button className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-md">
                      <X size={20} />
                    </button>
                  </DialogTrigger>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
}
