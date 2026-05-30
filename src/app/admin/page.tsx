
"use client";

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { doc, setDoc, updateDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { Loader2, Plus, Trash2, Save, LogOut, CheckCircle2, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SERVICES_DEFAULT, BUSINESS_NAME_DEFAULT, BUSINESS_ADDRESS_DEFAULT, BUSINESS_EMAIL_DEFAULT, OWNER_WHATSAPP_DEFAULT } from '@/lib/constants';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { data: services, loading: servicesLoading } = useCollection(firestore ? collection(firestore, 'services') : null);
  const { data: bookings, loading: bookingsLoading } = useCollection(firestore ? collection(firestore, 'bookings') : null);
  const { data: settings } = useDoc(firestore ? doc(firestore, 'settings', 'business') : null);

  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    whatsapp: '',
    address: '',
    email: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (settings) {
      setBusinessInfo({
        name: settings.name || BUSINESS_NAME_DEFAULT,
        whatsapp: settings.whatsapp || OWNER_WHATSAPP_DEFAULT,
        address: settings.address || BUSINESS_ADDRESS_DEFAULT,
        email: settings.email || BUSINESS_EMAIL_DEFAULT,
      });
    }
  }, [settings]);

  const handleSaveBusinessInfo = async () => {
    if (!firestore) return;
    try {
      await setDoc(doc(firestore, 'settings', 'business'), businessInfo);
      toast({ title: "Berhasil", description: "Informasi bisnis telah diperbarui." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Tidak dapat menyimpan perubahan." });
    }
  };

  const handleAddService = async () => {
    if (!firestore) return;
    try {
      await addDoc(collection(firestore, 'services'), {
        name: 'Layanan Baru',
        price: 'Rp 0',
        description: 'Deskripsi layanan baru',
        iconName: 'Monitor',
        features: [],
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menambah layanan." });
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'services', id));
      toast({ title: "Berhasil", description: "Layanan telah dihapus." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus layanan." });
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'bookings', id), { status });
      toast({ title: "Berhasil", description: "Status pesanan diperbarui." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal memperbarui status." });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Kelola konten dan pesanan TechFlow Mandiri</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/')} className="mr-2">Lihat Web</Button>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="bookings">Pesanan</TabsTrigger>
            <TabsTrigger value="services">Layanan</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pesanan</CardTitle>
                <CardDescription>Semua pesanan yang masuk melalui website.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingsLoading ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : bookings?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Belum ada pesanan.</p>
                  ) : (
                    bookings?.map((booking: any) => (
                      <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4">
                        <div>
                          <p className="font-bold">{booking.fullName} - {booking.service}</p>
                          <p className="text-sm text-muted-foreground">{booking.whatsapp} | {booking.address}</p>
                          <p className="text-xs italic mt-1">{booking.notes || 'Tanpa catatan'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'Selesai' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            {booking.status || 'Pending'}
                          </span>
                          <Button size="sm" variant="ghost" onClick={() => handleUpdateBookingStatus(booking.id, 'Selesai')}>
                            <CheckCircle2 size={16} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleUpdateBookingStatus(booking.id, 'Pending')}>
                            <Clock size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Kelola Layanan</h3>
              <Button onClick={handleAddService}><Plus className="mr-2" size={16} /> Tambah Layanan</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {services?.map((service: any) => (
                <Card key={service.id}>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid gap-2">
                      <Label>Nama Layanan</Label>
                      <Input 
                        defaultValue={service.name} 
                        onBlur={(e) => updateDoc(doc(firestore!, 'services', service.id), { name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Harga</Label>
                      <Input 
                        defaultValue={service.price} 
                        onBlur={(e) => updateDoc(doc(firestore!, 'services', service.id), { price: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Deskripsi</Label>
                      <Textarea 
                        defaultValue={service.description} 
                        onBlur={(e) => updateDoc(doc(firestore!, 'services', service.id), { description: e.target.value })}
                      />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteService(service.id)}>
                      <Trash2 size={16} className="mr-2" /> Hapus Layanan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Bisnis</CardTitle>
                <CardDescription>Update nama bisnis, alamat, dan kontak.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label>Nama Bisnis</Label>
                  <Input 
                    value={businessInfo.name} 
                    onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>WhatsApp (Tanpa '+')</Label>
                  <Input 
                    value={businessInfo.whatsapp} 
                    onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input 
                    value={businessInfo.email} 
                    onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Alamat</Label>
                  <Textarea 
                    value={businessInfo.address} 
                    onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                  />
                </div>
                <Button onClick={handleSaveBusinessInfo} className="w-full">
                  <Save className="mr-2" size={16} /> Simpan Perubahan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
