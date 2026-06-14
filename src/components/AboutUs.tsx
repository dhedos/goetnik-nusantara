"use client";

import { ADVANTAGES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface AboutUsProps {
  businessId: string;
}

export function AboutUs({ businessId }: AboutUsProps) {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', businessId, 'settings', 'profile') : null, 
    [firestore, businessId]
  );
  const { data: settings } = useDoc(settingsRef);
  
  const aboutTitle = settings?.aboutTitle || 'Tentang Kami';
  const aboutContent = settings?.aboutContent || 'Kami adalah penyedia layanan digital profesional yang berdedikasi untuk memberikan solusi terbaik bagi pelanggan.';

  return (
    <section id="tentang" className="py-24 px-4 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6">{aboutTitle}</h2>
              <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {aboutContent}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 pt-6">
              <div className="text-center p-6 rounded-none bg-card border border-border">
                <div className="text-3xl font-bold text-primary mb-1">500+</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Klien Puas</div>
              </div>
              <div className="text-center p-6 rounded-none bg-card border border-border">
                <div className="text-3xl font-bold text-primary mb-1">5+ Thn</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Pengalaman</div>
              </div>
              <div className="text-center p-6 rounded-none bg-card border border-border">
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Support</div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <div className="w-8 h-1 bg-primary rounded-none" /> Keunggulan Kami
            </h3>
            {ADVANTAGES.map((adv, i) => (
              <Card key={i} className="bg-background/40 border-border/50 hover:border-primary/30 transition-all rounded-none">
                <CardContent className="p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <adv.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{adv.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{adv.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
