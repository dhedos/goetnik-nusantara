
"use client";

import * as React from 'react';
import Image from 'next/image';
import { LucideIcon, Check, ArrowRight, Info, ShoppingCart, X } from 'lucide-react';
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
import { cn } from '@/lib/utils';

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
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
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
      <Card className="flex flex-col h-full bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 group overflow-hidden rounded-[2rem] shadow-2xl relative">
        <DialogTrigger asChild>
          <div className="relative h-72 overflow-hidden bg-background/50 cursor-pointer">
            {hasGallery ? (
              <Carousel 
                className="w-full h-full z-10"
                plugins={[plugin.current]}
              >
                <CarouselContent className="h-full">
                  {allImages.map((img, index) => (
                    <CarouselItem key={index} className="h-full">
                      <div className="relative w-full h-full">
                        <Image 
                          src={img}
                          alt={`${name} - ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ) : (
              allImages.length > 0 && (
                <div className="relative w-full h-full z-10">
                  <Image 
                    src={allImages[0]}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
              )
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none z-10" />
            
            <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-md text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl z-20">
              {price}
            </div>

            <div className="absolute bottom-4 left-6 flex items-center gap-4 z-20">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-12 transition-transform duration-500">
                <Icon size={20} />
              </div>
              <CardTitle className="text-base md:text-lg font-black text-white uppercase tracking-tighter drop-shadow-lg truncate max-w-[180px]">
                {name}
              </CardTitle>
            </div>
          </div>
        </DialogTrigger>
        
        <CardHeader className="pt-6 px-8 pb-4">
          <p className="text-white/60 text-sm leading-relaxed font-medium line-clamp-2">
            {description}
          </p>
        </CardHeader>
        
        <CardContent className="flex-1 px-8 pt-2">
          <div className="space-y-3.5">
            {features && features.slice(0, 3).map((feature, i) => (
              <div key={i} className="flex items-start gap-3 text-[10px] font-bold uppercase tracking-wider">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Check size={10} strokeWidth={4} />
                </div>
                <span className="text-white/40 group-hover:text-white/70 transition-colors line-clamp-1">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="p-8 pt-6 flex flex-col gap-3">
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full rounded-xl h-12 font-bold uppercase tracking-wider text-[10px] border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary">
              <Info size={14} className="mr-2" /> Lihat Detail
            </Button>
          </DialogTrigger>

          <Button asChild className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.03] transition-all group" variant="default">
            <a href="#pesan" className="flex items-center justify-center gap-2">
              Pilih Layanan <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
        </CardFooter>
      </Card>

      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] rounded-3xl border-border bg-card p-0 overflow-hidden shadow-2xl outline-none flex flex-col">
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <DialogDescription className="sr-only">Rincian lengkap paket layanan {name}</DialogDescription>
        
        <ScrollArea className="flex-1">
          <div className="p-0">
            <div className="relative h-[60vh] sm:h-[80vh] bg-black/40 flex items-center justify-center border-b border-border/10">
               {allImages.length > 0 ? (
                  <Carousel className="w-full h-full">
                    <CarouselContent className="h-full">
                      {allImages.map((img, index) => (
                        <CarouselItem key={index} className="h-full flex items-center justify-center">
                          <div className="relative w-full h-full">
                            <Image 
                              src={img}
                              alt={`${name} - ${index + 1}`}
                              fill
                              sizes="95vw"
                              className="object-contain"
                              priority
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {allImages.length > 1 && (
                      <>
                        <CarouselPrevious className="left-4 bg-black/60 border-none text-white hover:bg-black/80 z-30 h-10 w-10 rounded-full" />
                        <CarouselNext className="right-4 bg-black/60 border-none text-white hover:bg-black/80 z-30 h-10 w-10 rounded-full" />
                      </>
                    )}
                  </Carousel>
               ) : (
                 <div className="flex items-center justify-center h-full opacity-20"><Info size={48} /></div>
               )}
               <div className="absolute top-4 left-4 z-30 bg-primary px-4 py-1.5 rounded-full text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-2xl">
                 {price}
               </div>
            </div>

            <div className="p-6 sm:p-12 space-y-10">
              <DialogHeader className="space-y-4">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                    <Icon size={36} />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-foreground leading-none">
                      {name}
                    </h3>
                    <p className="text-primary font-bold text-base mt-2">{price}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Deskripsi Layanan</h4>
                  <p className="text-foreground/90 text-sm sm:text-lg leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Fitur & Keunggulan</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {features && features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/20 border border-border/40 hover:bg-secondary/30 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                          <Check size={14} strokeWidth={4} />
                        </div>
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-tight opacity-80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-4">
                <Button onClick={handleOrderClick} size="lg" className="flex-1 rounded-2xl h-16 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                  <ShoppingCart className="mr-2" size={20} /> Pesan Sekarang
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost" className="rounded-2xl h-16 px-10 font-bold uppercase text-[10px] tracking-widest hover:bg-secondary/20">
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
