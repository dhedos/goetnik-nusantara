
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
}

export function ServiceCard({ name, icon: Icon, price, description, features, imageId }: ServiceCardProps) {
  const image = PlaceHolderImages.find(img => img.id === imageId);

  return (
    <Card className="flex flex-col h-full bg-card/40 border-border/50 hover:border-primary/50 transition-all duration-300 group overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        {image && (
          <Image 
            src={image.imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            data-ai-hint={image.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-lg">
            <Icon size={24} />
          </div>
          <CardTitle className="text-xl text-white drop-shadow-md">{name}</CardTitle>
        </div>
      </div>
      
      <CardHeader className="pt-6">
        <div className="flex justify-between items-baseline mb-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Mulai Dari</span>
          <span className="text-2xl font-bold text-accent">{price}</span>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Check size={12} />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-6 border-t border-border/50">
        <Button asChild className="w-full rounded-xl hover:shadow-lg hover:shadow-primary/10" variant="outline">
          <a href="#pesan">Pilih Layanan</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
