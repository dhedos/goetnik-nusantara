
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
    <Card className="flex flex-col h-full bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 group overflow-hidden rounded-2xl shadow-xl">
      <div className="relative h-48 overflow-hidden">
        {displayImage && (
          <Image 
            src={displayImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            unoptimized={!!imageUrl}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-lg">
              <Icon size={18} />
            </div>
            <CardTitle className="text-lg font-bold text-white">{name}</CardTitle>
          </div>
        </div>
      </div>
      
      <CardHeader className="pt-6 px-6">
        <div className="flex justify-between items-baseline mb-4">
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Estimasi Biaya</span>
          <span className="text-xl font-bold text-accent">{price}</span>
        </div>
        <p className="text-white/60 text-xs leading-relaxed">
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 px-6 pt-2">
        <div className="space-y-2.5">
          {features && features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[11px] font-medium">
              <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Check size={10} strokeWidth={3} />
              </div>
              <span className="text-white/50">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-4">
        <Button asChild className="w-full rounded-xl h-11 font-bold uppercase tracking-wider text-[11px] hover:scale-[1.02] transition-all" variant="outline">
          <a href="#pesan">Pilih Layanan</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
