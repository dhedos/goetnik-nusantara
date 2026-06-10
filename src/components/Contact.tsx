
"use client";

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { MapPin, Mail, ExternalLink, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BUSINESS_ADDRESS_DEFAULT, BUSINESS_EMAIL_DEFAULT, OWNER_WHATSAPP_DEFAULT } from '@/lib/constants';

// WhatsApp Official Icon SVG
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-[#25D366] shrink-0">
                    <WhatsAppIcon className="w-6 h-6" />
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
