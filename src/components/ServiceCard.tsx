
"use client";

import Image from 'next/image';
import { LucideIcon, Check } from 'lucide-react';
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
    <Card className="flex flex-col h-full bg-card/40 border-white/5 hover:border-primary/40 transition-all duration-500 group overflow-hidden rounded-[2rem] shadow-2xl hover:shadow-primary/5">
      <div className="relative h-56 overflow-hidden">
        {displayImage && (
          <Image 
            src={displayImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            unoptimized={!!imageUrl}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-6 left-6 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-2xl">
            <Icon size={24} />
          </div>
          <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">{name}</CardTitle>
        </div>
      </div>
      
      <CardHeader className="pt-8 px-8">
        <div className="flex justify-between items-baseline mb-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Mulai Dari</span>
          <span className="text-2xl font-black text-accent tracking-tighter italic">{price}</span>
        </div>
        <p className="text-muted-foreground/80 text-sm leading-relaxed font-medium">
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 px-8 pt-4">
        <div className="space-y-3">
          {features && features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-[13px] font-medium">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <span className="text-white/70">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-8 pt-6">
        <Button asChild className="w-full rounded-2xl h-14 font-black uppercase italic tracking-tighter text-sm hover:scale-[1.02] transition-all" variant="outline">
          <a href="#pesan">Pesan Sekarang</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
