"use client";

import * as React from 'react';
import { LucideIcon, Check, ArrowRight, Info, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';

interface ServiceCardProps {
  name: string;
  icon: LucideIcon;
  price: string;
  description: string;
  features: string[];
  imageId: string;
  imageUrl?: string;
  galleryUrls?: string[];
}

export function ServiceCard({ name, icon: Icon, price, description, features, imageId, imageUrl, galleryUrls = [] }: ServiceCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const placeholder = PlaceHolderImages.find(img => img.id === imageId);
  const mainImage = imageUrl || placeholder?.imageUrl;
  
  const allImages = React.useMemo(() => {
    const imgs = [];
    if (mainImage) imgs.push(mainImage);
    if (galleryUrls && galleryUrls.length > 0) imgs.push(...galleryUrls);
    return imgs;
  }, [mainImage, galleryUrls]);

  const hasGallery = allImages.length > 1;

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const handleOrderClick = () => {
    setIsModalOpen(false);
    const element = document.getElementById('pesan');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Card className="flex flex-col h-full bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 group overflow-hidden rounded-[2.5rem] shadow-2xl relative">
        <DialogTrigger asChild>
          <div className="relative h-80 overflow-hidden bg-background/50 cursor-pointer">
            <div className="absolute inset-0 z-10">
              {hasGallery ? (
                <Carousel className="w-full h-full" plugins={[plugin.current]}>
                  <CarouselContent className="h-full">
                    {allImages.map((img, index) => (
                      <CarouselItem key={index} className="h-full relative">
                        {img.startsWith('data:') ? (
                          <img 
                            src={img} 
                            alt={name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Image 
                            src={img} 
                            alt={name} 
                            fill 
                            className="object-cover" 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized
                          />
                        )}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                allImages.length > 0 && (
                  allImages[0].startsWith('data:') ? (
                    <img 
                      src={allImages[0]} 
                      alt={name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    />
                  ) : (
                    <Image 
                      src={allImages[0]} 
                      alt={name} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                    />
                  )
                )
              )}
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20" />
            
            <div className="absolute top-6 right-6 bg-primary/95 backdrop-blur-md text-primary-foreground px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl z-30">
              {price}
            </div>

            <div className="absolute bottom-6 left-8 flex items-center gap-4 z-30">
              <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform">
                <Icon size={24} />
              </div>
              <CardTitle className="text-xl font-black text-white uppercase tracking-tighter truncate max-w-[200px] drop-shadow-lg">
                {name}
              </CardTitle>
            </div>
          </div>
        </DialogTrigger>
        
        <CardHeader className="pt-8 px-8 pb-4">
          <p className="text-white/60 text-sm leading-relaxed font-medium line-clamp-3">
            {description}
          </p>
        </CardHeader>
        
        <CardContent className="flex-1 px-8 pt-4">
          <div className="space-y-4">
            {features && features.slice(0, 3).map((feature, i) => (
              <div key={i} className="flex items-start gap-3 text-[10px] font-bold uppercase tracking-wider opacity-60">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Check size={12} strokeWidth={4} />
                </div>
                <span className="line-clamp-1">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="p-8 pt-6 flex flex-col gap-4">
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full rounded-2xl h-14 font-bold uppercase tracking-widest text-[10px] border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary">
              <Info size={16} className="mr-2" /> Detail Selengkapnya
            </Button>
          </DialogTrigger>

          <Button asChild className="w-full rounded-2xl h-16 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/30 hover:scale-[1.03] transition-all" variant="default">
            <a href="#pesan" className="flex items-center justify-center gap-3">
              Pesan Sekarang <ArrowRight size={18} />
            </a>
          </Button>
        </CardFooter>
      </Card>

      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] rounded-[2.5rem] border-white/10 bg-card p-0 overflow-hidden shadow-2xl flex flex-col z-[60]">
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <DialogDescription className="sr-only">Detail lengkap untuk layanan {name}</DialogDescription>
        
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            <div className="relative h-[65vh] sm:h-[80vh] bg-black/50 flex items-center justify-center border-b border-white/5 overflow-hidden">
               {allImages.length > 0 && (
                  <Carousel className="w-full h-full flex items-center justify-center">
                    <CarouselContent className="h-full">
                      {allImages.map((img, index) => (
                        <CarouselItem key={index} className="h-full flex items-center justify-center relative">
                          <div className="relative w-full h-full flex items-center justify-center p-4">
                            <img 
                              src={img} 
                              alt={name} 
                              className="max-w-full max-h-full object-contain" 
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {allImages.length > 1 && (
                      <>
                        <CarouselPrevious className="left-6 bg-black/40 border-none text-white hidden sm:flex" />
                        <CarouselNext className="right-6 bg-black/40 border-none text-white hidden sm:flex" />
                      </>
                    )}
                  </Carousel>
               )}
               <div className="absolute top-6 left-6 z-30 bg-primary px-5 py-2 rounded-full text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-2xl">
                 {price}
               </div>
            </div>

            <div className="p-8 sm:p-16 space-y-12">
              <DialogHeader className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
                    <Icon size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-foreground">
                      {name}
                    </h3>
                    <div className="flex items-center gap-3">
                       <span className="text-primary font-bold text-xl">{price}</span>
                       <span className="h-1.5 w-1.5 rounded-full bg-primary/30" />
                       <span className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Layanan Premium</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-primary/60 border-b border-primary/10 pb-2">Deskripsi Layanan</h4>
                  <p className="text-foreground/90 text-sm sm:text-xl leading-relaxed whitespace-pre-wrap font-medium">
                    {description}
                  </p>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-primary/60 border-b border-primary/10 pb-2">Keunggulan Paket</h4>
                  <div className="grid gap-3">
                    {features && features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-secondary/30 border border-white/5 shadow-sm">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg">
                          <Check size={14} strokeWidth={4} />
                        </div>
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-tight opacity-90">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row gap-5">
                <Button onClick={handleOrderClick} size="lg" className="flex-1 rounded-[1.5rem] h-16 sm:h-20 font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 transition-transform active:scale-95">
                  <ShoppingCart className="mr-3" size={24} /> Pesan Sekarang via WA
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost" className="rounded-[1.5rem] h-16 sm:h-20 px-12 font-bold uppercase text-[11px] tracking-widest hover:bg-white/5 border border-white/5">
                    Kembali
                  </Button>
                </DialogClose>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
