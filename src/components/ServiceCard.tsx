
"use client";

import Image from 'next/image';
import { LucideIcon, Check, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ServiceCardProps {
  name: string;
  icon: LucideIcon;
  price: string;
  description: string;
  features: string[];
  imageId: string;
  imageUrl?: string;
}

export function ServiceCard({ name, icon: Icon, price, description, features, imageId, imageUrl }: ServiceCardProps) {
  const placeholder = PlaceHolderImages.find(img => img.id === imageId);
  const displayImage = imageUrl || placeholder?.imageUrl;

  return (
    <Card className="flex flex-col h-full bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 group overflow-hidden rounded-[2rem] shadow-2xl relative">
      {/* Container Gambar */}
      <div className="relative h-64 overflow-hidden">
        {displayImage && (
          <Image 
            src={displayImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            unoptimized={!!imageUrl}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Badge Harga Mengambang */}
        <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-md text-primary-foreground px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
          {price}
        </div>

        {/* Ikon Layanan */}
        <div className="absolute bottom-6 left-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-12 transition-transform duration-500">
            <Icon size={28} />
          </div>
          <CardTitle className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
            {name}
          </CardTitle>
        </div>
      </div>
      
      <CardHeader className="pt-8 px-8 pb-4">
        <p className="text-white/60 text-sm leading-relaxed font-medium">
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 px-8 pt-2">
        <div className="space-y-3.5">
          {features && features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3 text-xs font-bold uppercase tracking-wider">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Check size={12} strokeWidth={4} />
              </div>
              <span className="text-white/40 group-hover:text-white/70 transition-colors">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-8 pt-6">
        <Button asChild className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.03] transition-all group" variant="default">
          <a href="#pesan" className="flex items-center justify-center gap-2">
            Pilih Layanan <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
