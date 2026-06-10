
"use client";

import { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useAuth, useMemoFirebase, useStorage } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { doc, setDoc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { 
  Loader2, Plus, Trash2, Save, LogOut, CheckCircle2, 
  Globe, Layout, Info, Phone, Shield, Image as ImageIcon,
  Settings, ShoppingBag, Menu, X, Upload, AlertTriangle, Link as LinkIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ICON_MAP } from '@/lib/constants';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

type AdminSection = 'bookings' | 'services' | 'branding' | 'hero' | 'about' | 'contact' | 'privacy';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>('branding');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const canFetchData = !authLoading && user && firestore;

  const servicesQuery = useMemoFirebase(() => 
    canFetchData ? collection(firestore, 'services') : null, 
    [canFetchData, firestore]
  );
  const { data: services, loading: servicesLoading } = useCollection(servicesQuery);

  const bookingsQuery = useMemoFirebase(() => 
    canFetchData ? collection(firestore, 'bookings') : null, 
    [canFetchData, firestore]
  );
  const { data: bookings, loading: bookingsLoading } = useCollection(bookingsQuery);

  const settingsRef = useMemoFirebase(() => 
    canFetchData ? doc(firestore, 'settings', 'business') : null, 
    [canFetchData, firestore]
  );
  const { data: settings } = useDoc(settingsRef);

  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    whatsapp: '',
    address: '',
    email: '',
    logoText: '',
    logoAccentText: '',
    logoUrl: '',
    heroTitle: '',
    heroSubtitle: '',
    aboutTitle: '',
    aboutContent: '',
    privacyPolicy: '',
    socialInstagram: '',
    socialFacebook: '',
    socialTwitter: ''
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (settings) {
      setBusinessInfo({
        name: settings.name || '',
        whatsapp: settings.whatsapp || '',
        address: settings.address || '',
        email: settings.email || '',
        logoText: settings.logoText || '',
        logoAccentText: settings.logoAccentText || '',
        logoUrl: settings.logoUrl || '',
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
        aboutTitle: settings.aboutTitle || '',
        aboutContent: settings.aboutContent || '',
        privacyPolicy: settings.privacyPolicy || '',
        socialInstagram: settings.socialInstagram || '',
        socialFacebook: settings.socialFacebook || '',
        socialTwitter: settings.socialTwitter || ''
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
    
    toast({ title: "Berhasil", description: "Pengaturan telah diperbarui." });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!storage) {
      toast({ 
        variant: "destructive", 
        title: "Storage Tidak Aktif", 
        description: "Firebase Storage belum diaktifkan di Console Anda. Gunakan opsi URL Manual sebagai alternatif." 
      });
      return;
    }

    setIsUploading(true);
    try {
      const storagePath = `branding/logo-${Date.now()}`;
      const storageRef = ref(storage, storagePath);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      setBusinessInfo(prev => ({ ...prev, logoUrl: downloadURL }));
      
      if (firestore) {
        const docRef = doc(firestore, 'settings', 'business');
        await setDoc(docRef, { 
          logoUrl: downloadURL,
          updatedAt: serverTimestamp() 
        }, { merge: true });
      }
      
      toast({ title: "Berhasil", description: "Logo berhasil diunggah." });
    } catch (error: any) {
      console.error("Upload Error:", error);
      toast({ 
        variant: "destructive", 
        title: "Gagal Mengunggah", 
        description: error.message?.includes('permission') 
          ? "Izin ditolak. Silakan cek Storage Rules di Firebase Console Anda."
          : "Terjadi kesalahan koneksi ke Firebase Storage. Gunakan opsi URL Manual jika ingin tetap gratis." 
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        }));
      });
    
    toast({ title: "Berhasil", description: "Layanan baru ditambahkan." });
  };

  const handleDeleteService = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'services', id);
    deleteDoc(docRef);
    toast({ title: "Berhasil", description: "Layanan telah dihapus." });
  };

  const handleUpdateService = (id: string, data: any) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'services', id);
    updateDoc(docRef, data);
  };

  const handleUpdateBookingStatus = (id: string, status: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'bookings', id);
    updateDoc(docRef, { status });
    toast({ title: "Berhasil", description: "Status pesanan diperbarui." });
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { id: 'bookings', label: 'Pesanan', icon: ShoppingBag },
    { id: 'services', label: 'Layanan', icon: Settings },
    { id: 'branding', label: 'Branding & Logo', icon: Layout },
    { id: 'hero', label: 'Beranda (Hero)', icon: Globe },
    { id: 'about', label: 'Tentang Kami', icon: Info },
    { id: 'contact', label: 'Kontak', icon: Phone },
    { id: 'privacy', label: 'Kebijakan Privasi', icon: Shield },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 transform md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AdminSection)}
                className={cn(
                  "flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  activeSection === item.id 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t space-y-2">
            <Button variant="destructive" className="w-full justify-start gap-3" onClick={handleLogout}>
              <LogOut size={18} /> Keluar
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8 md:hidden">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </Button>
        </header>

        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold capitalize">Kelola {activeSection.replace('-', ' ')}</h1>
            {(activeSection !== 'bookings' && activeSection !== 'services') && (
              <Button onClick={handleSaveBusinessInfo} className="shadow-lg">
                <Save className="mr-2" size={18} /> Simpan Perubahan
              </Button>
            )}
          </div>

          {activeSection === 'branding' && (
            <div className="space-y-6">
              <Alert className="bg-primary/5 border-primary/20">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <AlertTitle>Info Gratis (Tanpa Kartu Kredit)</AlertTitle>
                <AlertDescription>
                  Firebase Storage tetap gratis (5GB). Jika tombol "Unggah" macet, pastikan Anda sudah klik <b>"Get Started"</b> di menu <b>Storage</b> pada Firebase Console. Sebagai alternatif instan, Anda bisa memasukkan <b>URL Gambar</b> secara manual di bawah.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Logo Identitas</CardTitle>
                  <CardDescription>Atur logo gambar atau teks untuk identitas bisnis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-accent/5">
                      {businessInfo.logoUrl ? (
                        <Image 
                          src={businessInfo.logoUrl} 
                          alt="Logo Preview" 
                          fill 
                          className="object-contain p-2"
                          unoptimized
                        />
                      ) : (
                        <ImageIcon className="text-muted-foreground/30" size={40} />
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <Loader2 className="animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          <LinkIcon size={14} /> Link URL Logo (Opsi Gratis Terjamin)
                        </Label>
                        <Input 
                          placeholder="https://contoh.com/logo-anda.png" 
                          value={businessInfo.logoUrl}
                          onChange={(e) => setBusinessInfo({...businessInfo, logoUrl: e.target.value})}
                        />
                        <p className="text-[10px] text-muted-foreground">Tempel link gambar dari Imgur/PostImages di sini jika tombol unggah bermasalah.</p>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Atau</span></div>
                      </div>

                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full">
                        <Upload className="mr-2" size={16} /> {isUploading ? "Sedang Mengunggah..." : "Unggah File Logo"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-6 pt-6 border-t">
                    <div className="grid gap-2">
                      <Label>Nama Bisnis (Title Bar)</Label>
                      <Input value={businessInfo.name} onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Teks Logo (Utama)</Label>
                        <Input value={businessInfo.logoText} onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Teks Logo (Aksen)</Label>
                        <Input value={businessInfo.logoAccentText} onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'bookings' && (
            <Card>
              <CardHeader><CardTitle>Daftar Pesanan</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingsLoading ? <Loader2 className="animate-spin" /> : bookings?.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{booking.fullName}</p>
                          <Badge variant={booking.status === 'Selesai' ? 'default' : 'outline'}>{booking.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{booking.service} - {booking.whatsapp}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleUpdateBookingStatus(booking.id, 'Selesai')}><CheckCircle2 size={16} /></Button>
                        <Button size="sm" variant="destructive" onClick={() => confirm('Hapus?') && deleteDoc(doc(firestore!, 'bookings', booking.id))}><Trash2 size={16} /></Button>
                      </div>
                    </div>
                  ))}
                  {bookings?.length === 0 && <p className="text-center text-muted-foreground py-8">Belum ada pesanan masuk.</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-end"><Button onClick={handleAddService}><Plus className="mr-2" size={16} /> Tambah Layanan</Button></div>
              <div className="grid md:grid-cols-2 gap-6">
                {services?.map((service: any) => (
                  <Card key={service.id}>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid gap-2">
                        <Label>Nama Layanan</Label>
                        <Input defaultValue={service.name} onBlur={(e) => handleUpdateService(service.id, { name: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Harga</Label>
                        <Input defaultValue={service.price} onBlur={(e) => handleUpdateService(service.id, { price: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Deskripsi</Label>
                        <Textarea defaultValue={service.description} onBlur={(e) => handleUpdateService(service.id, { description: e.target.value })} />
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteService(service.id)} className="w-full">Hapus Layanan</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'hero' && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid gap-2"><Label>Judul Utama (Hero)</Label><Input value={businessInfo.heroTitle} onChange={(e) => setBusinessInfo({...businessInfo, heroTitle: e.target.value})} /></div>
                <div className="grid gap-2"><Label>Sub-judul (Hero)</Label><Textarea value={businessInfo.heroSubtitle} onChange={(e) => setBusinessInfo({...businessInfo, heroSubtitle: e.target.value})} /></div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'about' && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid gap-2"><Label>Judul Tentang Kami</Label><Input value={businessInfo.aboutTitle} onChange={(e) => setBusinessInfo({...businessInfo, aboutTitle: e.target.value})} /></div>
                <div className="grid gap-2"><Label>Konten Tentang Kami</Label><Textarea value={businessInfo.aboutContent} onChange={(e) => setBusinessInfo({...businessInfo, aboutContent: e.target.value})} rows={10} /></div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'contact' && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Nomor WhatsApp (Tanpa +)</Label><Input value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} placeholder="628123456789" /></div>
                  <div className="grid gap-2"><Label>Email</Label><Input value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} placeholder="admin@email.com" /></div>
                </div>
                <div className="grid gap-2"><Label>Alamat Kantor</Label><Textarea value={businessInfo.address} onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})} /></div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'privacy' && (
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-2"><Label>Teks Kebijakan Privasi</Label><Textarea value={businessInfo.privacyPolicy} onChange={(e) => setBusinessInfo({...businessInfo, privacyPolicy: e.target.value})} rows={15} /></div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
