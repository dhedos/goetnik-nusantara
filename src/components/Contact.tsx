
"use client";

import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { MapPin, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BUSINESS_ADDRESS_DEFAULT, BUSINESS_EMAIL_DEFAULT, OWNER_WHATSAPP_DEFAULT } from '@/lib/constants';

export function Contact() {
  const firestore = useFirestore();
  const { data: settings } = useDoc(firestore ? doc(firestore, 'settings', 'business') : null);

  const address = settings?.address || BUSINESS_ADDRESS_DEFAULT;
  const email = settings?.email || BUSINESS_EMAIL_DEFAULT;
  const whatsapp = settings?.whatsapp || OWNER_WHATSAPP_DEFAULT;

  return (
    <section id="kontak" className="py-24 px-4 bg-background border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-10">
            <div>
              <h2 className="text-4xl font-bold font-headline mb-4">Hubungi Kami</h2>
              <p className="text-muted-foreground text-lg">
                Punya pertanyaan lebih lanjut atau ingin konsultasi gratis? Silakan hubungi kami melalui saluran berikut.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="bg-secondary/20 border-border/50">
                <CardContent className="p-6 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Lokasi Kami</h4>
                    <p className="text-muted-foreground text-sm">{address}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/20 border-border/50">
                <CardContent className="p-6 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">WhatsApp Aktif</h4>
                    <p className="text-muted-foreground text-sm">+{whatsapp}</p>
                    <Button variant="link" className="p-0 h-auto text-primary mt-2" asChild>
                      <a href={`https://wa.me/${whatsapp}`} target="_blank">Chat Sekarang <ExternalLink size={12} className="ml-1" /></a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/20 border-border/50">
                <CardContent className="p-6 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Email Dukungan</h4>
                    <p className="text-muted-foreground text-sm">{email}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl overflow-hidden border border-border h-[500px] shadow-2xl relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.56347862248!2d107.5731163!3d-6.9034443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x3e18f2d87e0b57e!2sBandung%2C%20Jawa%20Barat!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-background/80 backdrop-blur text-foreground border-border px-4 py-2 flex items-center gap-2">
                  <MapPin size={14} className="text-primary" /> Lihat di Google Maps
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
