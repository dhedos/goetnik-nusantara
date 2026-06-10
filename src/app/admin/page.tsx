
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
  Settings, ShoppingBag, Menu, X, Upload
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
    if (!file || !storage || !firestore) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, 'logos/business-logo');
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setBusinessInfo(prev => ({ ...prev, logoUrl: downloadURL }));
      
      // Auto save the URL to Firestore
      const docRef = doc(firestore, 'settings', 'business');
      await updateDoc(docRef, { logoUrl: downloadURL });
      
      toast({ title: "Berhasil", description: "Logo telah diperbarui." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal", description: "Gagal mengunggah logo." });
    } finally {
      setIsUploading(false);
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
    toast({ title: "Terupdate", description: "Perubahan layanan disimpan." });
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
            <p className="text-xs text-muted-foreground mt-1">Management Console</p>
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
             <Button variant="outline" className="w-full justify-start gap-3" onClick={() => router.push('/')}>
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
                <Save className="mr-2" size={18} /> Simpan Semua Perubahan
              </Button>
            )}
          </div>

          {/* Bookings Section */}
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

          {/* Services Section */}
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

          {/* Branding Section */}
          {activeSection === 'branding' && (
            <Card>
              <CardHeader>
                <CardTitle>Branding & Identitas Logo</CardTitle>
                <CardDescription>Atur nama bisnis, teks logo, atau unggah logo gambar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <Label>Logo Gambar (Opsional)</Label>
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden bg-accent/10">
                        {businessInfo.logoUrl ? (
                          <Image 
                            src={businessInfo.logoUrl} 
                            alt="Logo Preview" 
                            fill 
                            className="object-contain p-2"
                          />
                        ) : (
                          <ImageIcon className="text-muted-foreground/40" size={32} />
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
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
                        >
                          <Upload className="mr-2" size={16} /> Unggah Logo Baru
                        </Button>
                        <p className="text-xs text-muted-foreground">Format: PNG, JPG atau SVG. Maks 2MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Nama Bisnis (Nama Tab Web)</Label>
                    <Input value={businessInfo.name} onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Logo Text (Utama)</Label>
                      <Input value={businessInfo.logoText} onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Logo Text (Aksen)</Label>
                      <Input value={businessInfo.logoAccentText} onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hero Section */}
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

          {/* About Us Section */}
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

          {/* Contact Section */}
          {activeSection === 'contact' && (
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kontak & Sosial Media</CardTitle>
                <CardDescription>Data ini akan muncul di bagian kontak dan footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <Label>WhatsApp (Kode Negara, misal: 628123456789)</Label>
                    <Input value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Instagram (Link/Username)</Label>
                    <Input value={businessInfo.socialInstagram} onChange={(e) => setBusinessInfo({...businessInfo, socialInstagram: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Facebook (Link)</Label>
                    <Input value={businessInfo.socialFacebook} onChange={(e) => setBusinessInfo({...businessInfo, socialFacebook: e.target.value})} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Alamat Lengkap</Label>
                  <Textarea value={businessInfo.address} onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})} rows={3} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Policy Section */}
          {activeSection === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Kebijakan Privasi</CardTitle>
                <CardDescription>Teks kebijakan yang akan muncul di halaman khusus atau tautan footer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label>Teks Kebijakan Privasi</Label>
                  <Textarea value={businessInfo.privacyPolicy} onChange={(e) => setBusinessInfo({...businessInfo, privacyPolicy: e.target.value})} rows={20} placeholder="Tuliskan kebijakan privasi bisnis Anda di sini..." />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
