
"use client";

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useAuth, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, setDoc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Loader2, Plus, Trash2, Save, LogOut, CheckCircle2, Clock, Globe, Layout } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BUSINESS_NAME_DEFAULT, BUSINESS_ADDRESS_DEFAULT, BUSINESS_EMAIL_DEFAULT, OWNER_WHATSAPP_DEFAULT, ICON_MAP } from '@/lib/constants';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  
  const servicesQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'services') : null, 
    [firestore]
  );
  const { data: services, loading: servicesLoading } = useCollection(servicesQuery);

  const bookingsQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'bookings') : null, 
    [firestore]
  );
  const { data: bookings, loading: bookingsLoading } = useCollection(bookingsQuery);

  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'business') : null, 
    [firestore]
  );
  const { data: settings } = useDoc(settingsRef);

  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    whatsapp: '',
    address: '',
    email: '',
    logoText: 'TechFlow',
    logoAccentText: 'Mandiri',
    heroTitle: 'Transformasi Digital Tanpa Hambatan',
    heroSubtitle: 'Kami menyediakan layanan service laptop profesional, desain grafis estetik, dan pembuatan aplikasi modern.'
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
        logoText: settings.logoText || 'TechFlow',
        logoAccentText: settings.logoAccentText || 'Mandiri',
        heroTitle: settings.heroTitle || 'Transformasi Digital Tanpa Hambatan',
        heroSubtitle: settings.heroSubtitle || 'Kami menyediakan layanan service laptop profesional, desain grafis estetik, dan pembuatan aplikasi modern.'
      });
    }
  }, [settings]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: "Berhasil", description: "Anda telah keluar." });
      router.push('/login');
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal logout." });
    }
  };

  const handleSaveBusinessInfo = () => {
    if (!firestore) return;
    const docRef = doc(firestore, 'settings', 'business');
    const data = {
      ...businessInfo,
      updatedAt: serverTimestamp()
    };
    
    setDoc(docRef, data, { merge: true })
      .catch(async (e) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
    toast({ title: "Berhasil", description: "Pengaturan web telah diperbarui." });
  };

  const handleAddService = () => {
    if (!firestore) return;
    const colRef = collection(firestore, 'services');
    const data = {
      name: 'Layanan Baru',
      price: 'Rp 0',
      description: 'Deskripsi layanan baru',
      iconName: 'Monitor',
      features: ['Fitur 1'],
      createdAt: serverTimestamp()
    };

    addDoc(colRef, data)
      .catch(async (e) => {
        const permissionError = new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
    toast({ title: "Berhasil", description: "Layanan baru ditambahkan." });
  };

  const handleDeleteService = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'services', id);
    
    deleteDoc(docRef)
      .catch(async (e) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
    toast({ title: "Berhasil", description: "Layanan telah dihapus." });
  };

  const handleUpdateService = (id: string, data: any) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'services', id);
    
    updateDoc(docRef, data)
      .catch(async (e) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
    toast({ title: "Terupdate", description: "Perubahan layanan disimpan." });
  };

  const handleUpdateBookingStatus = (id: string, status: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'bookings', id);
    const data = { status };
    
    updateDoc(docRef, data)
      .catch(async (e) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    
    toast({ title: "Berhasil", description: "Status pesanan diperbarui." });
  };

  const handleDeleteBooking = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'bookings', id);
    deleteDoc(docRef)
      .catch(async (e) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    toast({ title: "Berhasil", description: "Pesanan dihapus." });
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Kelola konten & pengaturan website</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/')} className="flex items-center gap-2">
              <Globe size={16} /> Lihat Web
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut size={16} /> Keluar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-[450px]">
            <TabsTrigger value="bookings">Pesanan</TabsTrigger>
            <TabsTrigger value="services">Layanan</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan Web</TabsTrigger>
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
                    <div className="py-8 flex justify-center"><Loader2 className="animate-spin" /></div>
                  ) : !bookings || bookings.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Belum ada pesanan.</p>
                  ) : (
                    bookings.map((booking: any) => (
                      <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold">{booking.fullName}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${booking.status === 'Selesai' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                              {booking.status || 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">Layanan: <span className="text-foreground font-medium">{booking.service}</span></p>
                          <p className="text-sm text-muted-foreground">Kontak: {booking.whatsapp} | {booking.address}</p>
                          {booking.notes && <p className="text-xs italic mt-2 p-2 bg-secondary/30 rounded border border-border/50">"{booking.notes}"</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button 
                            size="sm" 
                            variant={booking.status === 'Selesai' ? 'secondary' : 'outline'} 
                            onClick={() => handleUpdateBookingStatus(booking.id, 'Selesai')}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} className={booking.status === 'Selesai' ? 'text-green-500' : ''} /> 
                            {booking.status === 'Selesai' ? 'Selesai' : 'Tandai Selesai'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant={booking.status === 'Pending' ? 'secondary' : 'outline'}
                            onClick={() => handleUpdateBookingStatus(booking.id, 'Pending')}
                          >
                            <Clock size={16} />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => {
                            if(confirm('Hapus pesanan ini?')) {
                              handleDeleteBooking(booking.id);
                            }
                          }}>
                            <Trash2 size={16} />
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
              {servicesLoading ? (
                <div className="col-span-full py-8 flex justify-center"><Loader2 className="animate-spin" /></div>
              ) : services?.map((service: any) => (
                <Card key={service.id} className="relative group">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid gap-2">
                      <Label>Nama Layanan</Label>
                      <Input 
                        defaultValue={service.name} 
                        onBlur={(e) => handleUpdateService(service.id, { name: e.target.value })}
                        placeholder="Contoh: Instal Ulang OS"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Harga (Teks)</Label>
                        <Input 
                          defaultValue={service.price} 
                          onBlur={(e) => handleUpdateService(service.id, { price: e.target.value })}
                          placeholder="Rp 100.000"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Ikon</Label>
                        <Select 
                          defaultValue={service.iconName || 'Monitor'} 
                          onValueChange={(val) => handleUpdateService(service.id, { iconName: val })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(ICON_MAP).map(icon => (
                              <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Deskripsi</Label>
                      <Textarea 
                        defaultValue={service.description} 
                        onBlur={(e) => handleUpdateService(service.id, { description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <p className="text-[10px] text-muted-foreground">ID: {service.id}</p>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteService(service.id)}>
                        <Trash2 size={16} className="mr-2" /> Hapus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-8">
              {/* Branding & Visual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Layout className="text-primary" /> Branding & Tampilan Logo</CardTitle>
                  <CardDescription>Atur nama bisnis dan bagaimana logo muncul di Navbar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label>Nama Bisnis (Nama Web)</Label>
                      <Input 
                        value={businessInfo.name} 
                        onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Logo Text (Utama)</Label>
                      <Input 
                        value={businessInfo.logoText} 
                        onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})}
                        placeholder="Contoh: TechFlow"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Logo Text (Aksen)</Label>
                      <Input 
                        value={businessInfo.logoAccentText} 
                        onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})}
                        placeholder="Contoh: Mandiri"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hero Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Globe className="text-primary" /> Bagian Utama (Hero)</CardTitle>
                  <CardDescription>Teks besar yang muncul pertama kali saat pengunjung membuka web.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-2">
                    <Label>Judul Utama (Hero Title)</Label>
                    <Input 
                      value={businessInfo.heroTitle} 
                      onChange={(e) => setBusinessInfo({...businessInfo, heroTitle: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Sub-judul (Hero Subtitle)</Label>
                    <Textarea 
                      value={businessInfo.heroSubtitle} 
                      onChange={(e) => setBusinessInfo({...businessInfo, heroSubtitle: e.target.value})}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Kontak & Alamat</CardTitle>
                  <CardDescription>Informasi yang muncul di bagian kontak dan footer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label>Nomor WhatsApp (Contoh: 628123456789)</Label>
                      <Input 
                        placeholder="Wajib gunakan kode negara, contoh: 62812..."
                        value={businessInfo.whatsapp} 
                        onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email Kontak</Label>
                      <Input 
                        value={businessInfo.email} 
                        onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Alamat Bisnis</Label>
                    <Textarea 
                      value={businessInfo.address} 
                      onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveBusinessInfo} className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20">
                <Save className="mr-2" size={24} /> Simpan Perubahan Website
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
