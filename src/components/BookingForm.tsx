
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
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, doc } from 'firebase/firestore';
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

export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { data: services } = useCollection(firestore ? collection(firestore, 'services') : null);
  const { data: settings } = useDoc(firestore ? doc(firestore, 'settings', 'business') : null);

  const businessName = settings?.name || BUSINESS_NAME_DEFAULT;
  const ownerWhatsapp = settings?.whatsapp || OWNER_WHATSAPP_DEFAULT;

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
      // Save to Firestore
      await addDoc(collection(firestore, 'bookings'), {
        ...values,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      });

      const message = `*PESANAN BARU - ${businessName}*
---
*Nama:* ${values.fullName}
*WA:* ${values.whatsapp}
*Alamat:* ${values.address}
*Layanan:* ${values.service}
*Catatan:* ${values.notes || '-'}
---
_Dikirim via Website ${businessName}_`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${ownerWhatsapp}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');
      toast({ title: "Berhasil", description: "Pesanan Anda telah dikirim dan disimpan." });
      form.reset();
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat menyimpan pesanan." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="pesan" className="py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Form Pemesanan</h2>
          <p className="text-muted-foreground text-lg">
            Isi data di bawah ini untuk memesan layanan. Kami akan segera menghubungi Anda.
          </p>
        </div>

        <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-primary to-accent w-full" />
          <CardHeader>
            <CardTitle>Rincian Pesanan</CardTitle>
            <CardDescription>Semua data aman dan akan diteruskan langsung ke tim kami.</CardDescription>
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
                        <FormLabel>Nomor WhatsApp</FormLabel>
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
                      <FormLabel>Jenis Layanan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Layanan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services?.map((s: any) => (
                            <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                          ))}
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
                        <Input placeholder="Jl. Merdeka No. 123..." {...field} />
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
                      <FormLabel>Catatan Tambahan (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Jelaskan detail kendala atau spesifikasi yang diinginkan..." 
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
                  className="w-full py-6 text-lg rounded-xl font-bold flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Memproses..." : (
                    <>
                      <Send size={20} /> Kirim Pesanan Sekarang
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
