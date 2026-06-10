
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
  Settings, ShoppingBag, Menu, X, Upload, AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ICON_MAP } from '@/lib/constants';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type AdminSection = 'bookings' | 'services' | 'branding' | 'hero' | 'about' | 'contact' | 'privacy';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>('bookings');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
        title: "Konfigurasi Error", 
        description: "Firebase Storage belum terdeteksi. Silakan aktifkan Storage di Console." 
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Gagal", description: "Ukuran file maksimal 2MB." });
      return;
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `branding/logo-${Date.now()}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      setBusinessInfo(prev => ({ ...prev, logoUrl: downloadURL }));
      if (firestore) {
        const docRef = doc(firestore, 'settings', 'business');
        await setDoc(docRef, { logoUrl: downloadURL }, { merge: true });
      }
      
      toast({ title: "Berhasil", description: "Logo berhasil diunggah dan diperbarui." });
    } catch (error: any) {
      console.error("Upload Error:", error);
      let errorMsg = "Terjadi kesalahan saat mengunggah.";
      
      if (error.code === 'storage/unauthorized') {
        errorMsg = "Izin ditolak. Silakan atur Rules di tab STORAGE (bukan Firestore).";
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMsg = "Waktu habis atau Storage belum diaktifkan di Console.";
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
  };

  const handleUpdateBookingStatus = (id: string, status: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'bookings', id);
    updateDoc(docRef, { status })
      .catch(async (e) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { status },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    toast({ title: "Berhasil", description: "Status pesanan diperbarui." });
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            {(activeSection !== 'bookings' && activeSection !== 'services') && (
              <Button onClick={handleSaveBusinessInfo} className="shadow-lg shadow-primary/20">
                <Save className="mr-2" size={18} /> Simpan Perubahan Teks
              </Button>
            )}
          </div>

          {activeSection === 'branding' && (
            <Card>
              <CardHeader>
                <CardTitle>Branding & Identitas Logo</CardTitle>
                <CardDescription>Pilih file logo untuk diunggah langsung ke penyimpanan aman.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <Label>Logo Gambar (Penyimpanan Storage)</Label>
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden bg-accent/5">
                        {businessInfo.logoUrl ? (
                          <Image 
                            src={businessInfo.logoUrl} 
                            alt="Logo Preview" 
                            fill 
                            className="object-contain p-2"
                            unoptimized
                          />
                        ) : (
                          <ImageIcon className="text-muted-foreground/40" size={32} />
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
                            <Loader2 className="animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
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
                          size="sm" 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 animate-spin" size={16} /> 
                              Mengunggah...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2" size={16} /> 
                              Pilih & Unggah Logo
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground">Optimal: PNG transparan atau SVG. Maks 2MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-3 items-start">
                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm">
                      <p className="font-bold text-amber-500">Penting: Masih stuck loading?</p>
                      <p className="text-muted-foreground mt-1">
                        Aturan yang Anda kirimkan sebelumnya adalah untuk <b>Firestore</b>. Untuk upload logo, Anda harus pergi ke tab <b>STORAGE</b> (Penyimpanan) di Console dan memasang aturan ini:
                      </p>
                      <pre className="mt-2 p-2 bg-background/50 rounded text-[10px] overflow-x-auto">
                        {`rules_version = '2';\nservice firebase.storage {\n  match /b/{bucket}/o {\n    match /{allPaths=**} {\n      allow read: if true;\n      allow write: if request.auth != null;\n    }\n  }\n}`}
                      </pre>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Nama Bisnis (Muncul di Tab & Footer)</Label>
                    <Input value={businessInfo.name} onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Teks Logo Utama</Label>
                      <Input value={businessInfo.logoText} onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} placeholder="Misal: Tech" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Teks Logo Aksen</Label>
                      <Input value={businessInfo.logoAccentText} onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} placeholder="Misal: Flow" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
