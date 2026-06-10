
"use client";

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { MapPin, MessageCircle, Mail, ExternalLink, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BUSINESS_ADDRESS_DEFAULT, BUSINESS_EMAIL_DEFAULT, OWNER_WHATSAPP_DEFAULT } from '@/lib/constants';

export function Contact() {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'business') : null, 
    [firestore]
  );
  const { data: settings } = useDoc(settingsRef);

  const address = settings?.address || BUSINESS_ADDRESS_DEFAULT;
  const email = settings?.email || BUSINESS_EMAIL_DEFAULT;
  const whatsapp = settings?.whatsapp || OWNER_WHATSAPP_DEFAULT;
  const mapUrl = settings?.mapEmbedUrl;
  
  const directMapUrl = settings?.mapDirectUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

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
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">{address}</p>
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
            <div className="rounded-3xl overflow-hidden border border-border h-[500px] shadow-2xl relative bg-secondary/10 flex items-center justify-center">
              {mapUrl ? (
                <>
                  <iframe 
                    src={mapUrl}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute top-4 left-4">
                    <Button asChild size="sm" className="shadow-lg h-9 bg-white text-primary hover:bg-white/90 font-semibold">
                      <a href={directMapUrl} target="_blank">
                        Open in Maps <ExternalLink size={14} className="ml-2" />
                      </a>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 p-8 text-center max-w-sm animate-in fade-in duration-500">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <MapIcon size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Lokasi belum tersedia</h4>
                    <p className="text-muted-foreground text-sm">
                      Admin belum mengonfigurasi titik lokasi peta.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
