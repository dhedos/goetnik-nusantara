
"use client";

import { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useAuth, useMemoFirebase, useStorage } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, setDoc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { 
  Loader2, Plus, Trash2, Save, LogOut, CheckCircle2, 
  Globe, Layout, Info, Phone, Shield, Image as ImageIcon,
  Settings, ShoppingBag, Menu, X, Upload, AlertTriangle, InfoIcon, Database
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ICON_MAP } from '@/lib/constants';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

  // Cek apakah Storage sudah terkonfigurasi dengan benar di Firebase
  const isStorageConfigured = !!storage?.app?.options?.storageBucket;

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

    if (!isStorageConfigured) {
      toast({ 
        variant: "destructive", 
        title: "Konfigurasi Hilang", 
        description: "Firebase Storage Bucket belum diatur. Pastikan anda sudah klik 'Get Started' di Firebase Console." 
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File Terlalu Besar", description: "Ukuran maksimal 2MB." });
      return;
    }

    setIsUploading(true);
    console.log("Memulai unggahan ke bucket:", storage?.app?.options?.storageBucket);

    try {
      const storagePath = `branding/logo-${Date.now()}`;
      const storageRef = ref(storage!, storagePath);
      
      const uploadResult = await uploadBytes(storageRef, file);
      console.log("Unggahan berhasil, mengambil URL...");
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      setBusinessInfo(prev => ({ ...prev, logoUrl: downloadURL }));
      
      if (firestore) {
        const docRef = doc(firestore, 'settings', 'business');
        await setDoc(docRef, { 
          logoUrl: downloadURL,
          updatedAt: serverTimestamp() 
        }, { merge: true });
      }
      
      toast({ title: "Berhasil", description: "Logo berhasil diunggah dan disimpan." });
    } catch (error: any) {
      console.error("Kesalahan unggah detail:", error);
      let errorMsg = "Terjadi kesalahan saat mengunggah. Cek koneksi atau Rules Storage Anda.";
      
      if (error.code === 'storage/unauthorized') {
        errorMsg = "Akses ditolak. Pastikan 'Storage Rules' sudah Anda Publish di Firebase Console.";
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMsg = "Waktu unggah habis. Cek koneksi internet Anda.";
      }
      
      toast({ 
        variant: "destructive", 
        title: "Gagal Unggah", 
        description: errorMsg 
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
    deleteDoc(docRef)
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        }));
      });
    toast({ title: "Berhasil", description: "Layanan telah dihapus." });
  };

  const handleUpdateService = (id: string, data: any) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'services', id);
    updateDoc(docRef, data)
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        }));
      });
  };

  const handleUpdateBookingStatus = (id: string, status: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'bookings', id);
    updateDoc(docRef, { status })
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { status },
        }));
      });
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
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 transform md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
            <p className="text-xs text-muted-foreground mt-1">Sistem Konten Dinamis</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as AdminSection)}
                className={cn(
                  "flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  activeSection === item.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t space-y-2">
             <Button variant="outline" className="w-full justify-start gap-3" onClick={() => window.open('/', '_blank')}>
              <Globe size={18} /> Lihat Website
            </Button>
            <Button variant="destructive" className="w-full justify-start gap-3" onClick={handleLogout}>
              <LogOut size={18} /> Keluar
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
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
            {(activeSection !== 'bookings' && activeSection !== 'services' && activeSection !== 'branding') && (
              <Button onClick={handleSaveBusinessInfo} className="shadow-lg shadow-primary/20">
                <Save className="mr-2" size={18} /> Simpan Perubahan
              </Button>
            )}
          </div>

          {activeSection === 'branding' && (
            <div className="space-y-6">
              {!isStorageConfigured && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Firebase Storage Belum Aktif</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>Sistem tidak mendeteksi lokasi penyimpanan (Bucket). Unggah logo akan gagal.</p>
                    <ol className="list-decimal ml-4 text-xs space-y-1">
                      <li>Buka Firebase Console.</li>
                      <li>Pilih menu <b>Storage</b>.</li>
                      <li>Klik <b>Get Started</b> dan ikuti langkahnya sampai selesai.</li>
                      <li>Pastikan Tab <b>Rules</b> di menu Storage sudah mengizinkan unggahan (auth != null).</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Database className="text-primary" size={20} />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Status Bucket</p>
                      <p className="text-sm font-bold">{isStorageConfigured ? "Terkonfigurasi" : "Tidak Ada"}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <ImageIcon className="text-primary" size={20} />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Kapasitas Gratis</p>
                      <p className="text-sm font-bold">5 GB (Sangat Aman)</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Logo Website</CardTitle>
                  <CardDescription>Pilih gambar logo profesional untuk identitas bisnis Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-accent/10">
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
                    
                    <div className="space-y-3">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || !isStorageConfigured}
                        className="w-full md:w-auto"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mengunggah...
                          </>
                        ) : "Pilih Logo Baru"}
                      </Button>
                      <p className="text-xs text-muted-foreground">Rekomendasi: PNG transparan, rasio 1:1 atau memanjang. Maks 2MB.</p>
                    </div>
                  </div>

                  <div className="grid gap-6 pt-6 border-t">
                    <div className="grid gap-2">
                      <Label>Nama Bisnis (Title Bar)</Label>
                      <Input value={businessInfo.name} onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Teks Logo (Main)</Label>
                        <Input value={businessInfo.logoText} onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Teks Logo (Aksen)</Label>
                        <Input value={businessInfo.logoAccentText} onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} />
                      </div>
                    </div>
                    <Button onClick={handleSaveBusinessInfo} className="w-full">
                      <Save className="mr-2" size={16} /> Simpan Perubahan Teks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'bookings' && (
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pesanan</CardTitle>
                <CardDescription>Pesanan pelanggan yang masuk melalui website.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookingsLoading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="animate-spin" /></div>
                  ) : !bookings || bookings.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Belum ada pesanan.</p>
                  ) : (
                    bookings.map((booking: any) => (
                      <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4 bg-card/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold">{booking.fullName}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${booking.status === 'Selesai' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                              {booking.status || 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">Layanan: <span className="text-foreground font-medium">{booking.service}</span></p>
                          <p className="text-sm text-muted-foreground">Kontak: {booking.whatsapp}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant={booking.status === 'Selesai' ? 'secondary' : 'outline'} 
                            onClick={() => handleUpdateBookingStatus(booking.id, 'Selesai')}
                          >
                            <CheckCircle2 size={16} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => confirm('Hapus?') && deleteDoc(doc(firestore!, 'bookings', booking.id))}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button onClick={handleAddService}><Plus className="mr-2" size={16} /> Tambah Layanan</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {servicesLoading ? (
                  <div className="col-span-full py-8 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : services?.map((service: any) => (
                  <Card key={service.id}>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid gap-2">
                        <Label>Nama Layanan</Label>
                        <Input 
                          defaultValue={service.name} 
                          onBlur={(e) => handleUpdateService(service.id, { name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Harga (Teks)</Label>
                          <Input 
                            defaultValue={service.price} 
                            onBlur={(e) => handleUpdateService(service.id, { price: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Ikon</Label>
                          <Select 
                            defaultValue={service.iconName || 'Monitor'} 
                            onValueChange={(val) => handleUpdateService(service.id, { iconName: val })}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.keys(ICON_MAP).map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Deskripsi</Label>
                        <Textarea 
                          defaultValue={service.description} 
                          onBlur={(e) => handleUpdateService(service.id, { description: e.target.value })}
                        />
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteService(service.id)} className="w-full">
                        <Trash2 size={16} className="mr-2" /> Hapus Layanan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'hero' && (
            <Card>
              <CardHeader>
                <CardTitle>Bagian Beranda (Hero)</CardTitle>
                <CardDescription>Teks utama yang dilihat pertama kali oleh pengunjung.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label>Judul Utama (Hero Title)</Label>
                  <Input value={businessInfo.heroTitle} onChange={(e) => setBusinessInfo({...businessInfo, heroTitle: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Sub-judul (Hero Subtitle)</Label>
                  <Textarea value={businessInfo.heroSubtitle} onChange={(e) => setBusinessInfo({...businessInfo, heroSubtitle: e.target.value})} rows={4} />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'about' && (
            <Card>
              <CardHeader>
                <CardTitle>Konten Tentang Kami</CardTitle>
                <CardDescription>Ceritakan sejarah dan visi misi bisnis Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label>Judul Bagian Tentang</Label>
                  <Input value={businessInfo.aboutTitle} onChange={(e) => setBusinessInfo({...businessInfo, aboutTitle: e.target.value})} placeholder="Contoh: Partner Teknologi Terpercaya Anda" />
                </div>
                <div className="grid gap-2">
                  <Label>Isi Cerita / Deskripsi Tentang</Label>
                  <Textarea value={businessInfo.aboutContent} onChange={(e) => setBusinessInfo({...businessInfo, aboutContent: e.target.value})} rows={10} placeholder="Tuliskan detail tentang bisnis Anda di sini..." />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'contact' && (
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kontak & Sosial Media</CardTitle>
                <CardDescription>Data ini akan muncul di bagian kontak dan footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label>WhatsApp (Misal: 628123456789)</Label>
                    <Input value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email Bisnis</Label>
                    <Input value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>URL Instagram</Label>
                    <Input value={businessInfo.socialInstagram} onChange={(e) => setBusinessInfo({...businessInfo, socialInstagram: e.target.value})} placeholder="https://instagram.com/akunanda" />
                  </div>
                  <div className="grid gap-2">
                    <Label>URL Facebook</Label>
                    <Input value={businessInfo.socialFacebook} onChange={(e) => setBusinessInfo({...businessInfo, socialFacebook: e.target.value})} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Alamat Lengkap Kantor/Toko</Label>
                  <Textarea value={businessInfo.address} onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})} rows={3} />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Kebijakan Privasi</CardTitle>
                <CardDescription>Teks kebijakan hukum untuk pengunjung web.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label>Teks Lengkap Kebijakan</Label>
                  <Textarea value={businessInfo.privacyPolicy} onChange={(e) => setBusinessInfo({...businessInfo, privacyPolicy: e.target.value})} rows={20} placeholder="Tuliskan kebijakan privasi bisnis Anda..." />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
