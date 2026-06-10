"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BUSINESS_NAME_DEFAULT, OWNER_WHATSAPP_DEFAULT } from '@/lib/constants';

const formSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap harus diisi"),
  whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid"),
  address: z.string().min(5, "Alamat lengkap diperlukan"),
  service: z.string().min(1, "Pilih jenis layanan"),
  notes: z.string().optional(),
});

interface BookingFormProps {
  businessId: string;
}

export function BookingForm({ businessId }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();

  const servicesQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'businesses', businessId, 'services') : null, 
    [firestore, businessId]
  );
  const { data: services } = useCollection(servicesQuery);

  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', businessId, 'settings', 'profile') : null, 
    [firestore, businessId]
  );
  const { data: settings } = useDoc(settingsRef);

  const businessName = settings?.name || BUSINESS_NAME_DEFAULT;
  const rawWhatsapp = settings?.whatsapp || OWNER_WHATSAPP_DEFAULT;
  const ownerWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      whatsapp: "",
      address: "",
      service: "",
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);
    
    try {
      const bookingsColRef = collection(firestore, 'businesses', businessId, 'bookings');
      await addDoc(bookingsColRef, {
        ...values,
        businessId,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });

      const message = `*PESANAN BARU - ${businessName}*
━━━━━━━━━━━━━━━━━━
👤 *Pelanggan:* ${values.fullName}
📱 *WhatsApp:* ${values.whatsapp}
📍 *Alamat:* ${values.address}
🛠️ *Layanan:* ${values.service}
📝 *Catatan:* ${values.notes || '-'}
━━━━━━━━━━━━━━━━━━
_Dikirim melalui Sistem Pemesanan Website_`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${ownerWhatsapp}?text=${encodedMessage}`;
      
      toast({ title: "Berhasil", description: "Pesanan disimpan. Mengalihkan ke WhatsApp..." });
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        form.reset();
        setIsSubmitting(false);
      }, 1000);

    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan teknis. Silakan coba lagi." });
      setIsSubmitting(false);
    }
  }

  return (
    <section id="pesan" className="py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Form Pemesanan</h2>
          <p className="text-muted-foreground text-lg">
            Isi data di bawah ini untuk memesan layanan. Kami akan segera menghubungi Anda melalui WhatsApp.
          </p>
        </div>

        <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl relative">
          <div className="h-2 bg-gradient-to-r from-primary to-accent w-full" />
          <CardHeader>
            <CardTitle>Rincian Pesanan</CardTitle>
            <CardDescription>Setelah klik kirim, Anda akan diarahkan otomatis ke WhatsApp kami.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Budi Santoso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor WhatsApp Anda</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: 08123456789" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Layanan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Klik untuk memilih" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services?.map((s: any) => (
                            <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                          ))}
                          {services?.length === 0 && (
                            <SelectItem value="Umum" disabled>Belum ada layanan aktif</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Jl. Merdeka No. 123, Kelurahan..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detail Masalah / Catatan (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Jelaskan kendala Anda agar kami bisa memberikan estimasi harga..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full py-7 text-lg rounded-xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Sedang Memproses...</>
                  ) : (
                    <>
                      <Send size={22} /> Kirim & Hubungi via WhatsApp
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  *Dengan menekan tombol, pesanan akan tersimpan di sistem kami.
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}