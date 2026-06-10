"use client";

import { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useAuth, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { doc, setDoc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  Loader2, Plus, Trash2, Save, LogOut, CheckCircle2, 
  Globe, Layout, Info, Phone, Shield, Image as ImageIcon,
  Settings, ShoppingBag, Menu, X, Upload, Instagram, Facebook, Youtube, MapPin, Search, ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { PRIVACY_POLICY_DEFAULT } from '@/lib/constants';

type AdminSection = 'bookings' | 'services' | 'branding' | 'hero' | 'about' | 'contact' | 'privacy';

// Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5c0 1.94-.53 3.89-1.93 5.08-1.47 1.25-3.5 1.55-5.32 1.07-2.31-.7-4.11-2.83-4.44-5.18-.33-2.34.82-4.72 2.79-6.03 1.48-1 3.26-1.33 4.99-1.01V16.5c-1.3-.46-2.82-.14-3.72.93-.65.75-.82 1.83-.54 2.75.29.9 1.1 1.6 2.05 1.77 1.03.19 2.18-.13 2.89-.89.75-.81.82-1.96.82-2.99V0l.08.02z"/>
  </svg>
);

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>('bookings');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  
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
    mapEmbedUrl: '',
    mapDirectUrl: '',
    logoText: '',
    logoAccentText: '',
    logoUrl: '',
    heroBadge: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImageUrl: '',
    aboutTitle: '',
    aboutContent: '',
    servicesSectionBadge: '',
    servicesSectionTitle: '',
    servicesSectionSubtitle: '',
    privacyPolicy: '',
    socialInstagram: '',
    socialFacebook: '',
    socialYoutube: '',
    socialTiktok: ''
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
        mapEmbedUrl: settings.mapEmbedUrl || '',
        mapDirectUrl: settings.mapDirectUrl || '',
        logoText: settings.logoText || '',
        logoAccentText: settings.logoAccentText || '',
        logoUrl: settings.logoUrl || '',
        heroBadge: settings.heroBadge || '',
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
        heroImageUrl: settings.heroImageUrl || '',
        aboutTitle: settings.aboutTitle || '',
        aboutContent: settings.aboutContent || '',
        servicesSectionBadge: settings.servicesSectionBadge || '',
        servicesSectionTitle: settings.servicesSectionTitle || '',
        servicesSectionSubtitle: settings.servicesSectionSubtitle || '',
        privacyPolicy: settings.privacyPolicy || PRIVACY_POLICY_DEFAULT,
        socialInstagram: settings.socialInstagram || '',
        socialFacebook: settings.socialFacebook || '',
        socialYoutube: settings.socialYoutube || '',
        socialTiktok: settings.socialTiktok || ''
      });
    } else if (!settings && canFetchData) {
       setBusinessInfo(prev => ({ ...prev, privacyPolicy: PRIVACY_POLICY_DEFAULT }));
    }
  }, [settings, canFetchData]);

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
      .then(() => {
        toast({ title: "Berhasil", description: "Pengaturan telah disimpan." });
      })
      .catch(async (e) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'hero' | string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      toast({ 
        variant: "destructive", 
        title: "File Terlalu Besar", 
        description: "Gunakan gambar di bawah 800KB agar database tetap cepat." 
      });
      return;
    }

    setIsUploading(target);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      if (target === 'logo') {
        setBusinessInfo(prev => ({ ...prev, logoUrl: base64String }));
      } else if (target === 'hero') {
        setBusinessInfo(prev => ({ ...prev, heroImageUrl: base64String }));
      } else {
        if (firestore) {
          const docRef = doc(firestore, 'services', target);
          try {
            await updateDoc(docRef, { imageUrl: base64String });
            toast({ title: "Berhasil", description: "Gambar layanan diperbarui." });
          } catch (error) {
            toast({ variant: "destructive", title: "Gagal", description: "Gagal menyimpan gambar." });
          }
        }
      }
      setIsUploading(null);
    };
    
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleAddService = () => {
    if (!firestore) return;
    const colRef = collection(firestore, 'services');
    const data = {
      name: 'Layanan Baru',
      price: 'Rp 0',
      description: 'Deskripsi layanan baru',
      iconName: 'Monitor',
      imageUrl: '',
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

  const generateMapFromQuery = () => {
    if (!locationQuery.trim()) {
      toast({ variant: "destructive", title: "Input Kosong", description: "Masukkan nama lokasi atau alamat terlebih dahulu." });
      return;
    }
    const encoded = encodeURIComponent(locationQuery);
    const embedUrl = `https://maps.google.com/maps?q=${encoded}&output=embed`;
    const directUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    setBusinessInfo({ ...businessInfo, mapEmbedUrl: embedUrl, mapDirectUrl: directUrl });
    toast({ title: "Berhasil", description: "Lokasi berhasil diterapkan ke pratinjau." });
  };

  const handleNavClick = (sectionId: AdminSection) => {
    setActiveSection(sectionId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
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
    { id: 'contact', label: 'Kontak & Alamat', icon: Phone },
    { id: 'privacy', label: 'Kebijakan Privasi', icon: Shield },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 transform md:relative md:translate-x-0 shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </Button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as AdminSection)}
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

      <main className="flex-1 overflow-y-auto relative h-full">
        <header className="sticky top-0 z-30 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b md:hidden">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu />
          </Button>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold capitalize">Kelola {activeSection.replace('-', ' ')}</h1>
            <Button onClick={handleSaveBusinessInfo} className="shadow-lg h-12">
              <Save className="mr-2" size={18} /> Simpan Perubahan
            </Button>
          </div>

          {activeSection === 'branding' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logo Identitas</CardTitle>
                  <CardDescription>Ganti logo tanpa perlu Firebase Storage (Metode Base64).</CardDescription>
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
                      {isUploading === 'logo' && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <Loader2 className="animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          <Upload size={14} /> Pilih Gambar
                        </Label>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, 'logo')} 
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()} 
                          disabled={!!isUploading} 
                          className="w-full h-12"
                        >
                          {isUploading === 'logo' ? (
                            <><Loader2 className="mr-2 animate-spin" /> Sedang Memproses...</>
                          ) : (
                            <><Upload className="mr-2" size={16} /> Klik untuk Pilih Logo Baru</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 pt-6 border-t">
                    <div className="grid gap-2">
                      <Label>Nama Bisnis (Muncul di Browser)</Label>
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
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Judul Bagian Layanan</CardTitle>
                  <CardDescription>Edit teks yang muncul di atas daftar layanan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Badge Bagian Layanan (Teks Kecil Biru)</Label>
                    <Input 
                      value={businessInfo.servicesSectionBadge} 
                      onChange={(e) => setBusinessInfo({...businessInfo, servicesSectionBadge: e.target.value})} 
                      placeholder="Contoh: APA YANG KAMI LAKUKAN"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Judul Bagian Layanan</Label>
                    <Input 
                      value={businessInfo.servicesSectionTitle} 
                      onChange={(e) => setBusinessInfo({...businessInfo, servicesSectionTitle: e.target.value})} 
                      placeholder="Contoh: Layanan Unggulan"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Sub-judul Bagian Layanan</Label>
                    <Textarea 
                      value={businessInfo.servicesSectionSubtitle} 
                      onChange={(e) => setBusinessInfo({...businessInfo, servicesSectionSubtitle: e.target.value})} 
                      placeholder="Contoh: Pilih layanan yang Anda butuhkan..."
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Daftar Paket Layanan</h2>
                <Button onClick={handleAddService}><Plus className="mr-2" size={16} /> Tambah Layanan</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {services?.map((service: any) => (
                  <Card key={service.id}>
                    <CardContent className="p-6 space-y-4">
                      <div className="relative h-40 w-full rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-accent/5 mb-4 group">
                        {service.imageUrl ? (
                          <Image src={service.imageUrl} alt={service.name} fill className="object-cover" unoptimized />
                        ) : (
                          <ImageIcon className="text-muted-foreground/30" size={32} />
                        )}
                        {isUploading === service.id && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10">
                            <Loader2 className="animate-spin text-primary" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <input 
                            type="file" 
                            id={`file-${service.id}`} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, service.id)} 
                          />
                          <Button size="sm" variant="secondary" onClick={() => document.getElementById(`file-${service.id}`)?.click()}>
                            <Upload className="mr-2" size={14} /> Ganti Gambar
                          </Button>
                        </div>
                      </div>

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
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-4">
                  <Label>Gambar Latar Belakang Hero</Label>
                  <div className="relative h-60 w-full rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-accent/5">
                    {businessInfo.heroImageUrl ? (
                      <Image 
                        src={businessInfo.heroImageUrl} 
                        alt="Hero Background Preview" 
                        fill 
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="mx-auto text-muted-foreground/30 mb-2" size={48} />
                        <p className="text-xs text-muted-foreground">Belum ada gambar custom. Menggunakan gambar bawaan.</p>
                      </div>
                    )}
                    {isUploading === 'hero' && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} />
                    <Button variant="outline" className="flex-1" onClick={() => heroInputRef.current?.click()} disabled={!!isUploading}>
                      <Upload className="mr-2" size={16} /> Pilih Gambar Hero
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => setBusinessInfo({...businessInfo, heroImageUrl: ''})}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Teks Badge (Kecil di atas Judul)</Label>
                  <Input value={businessInfo.heroBadge} onChange={(e) => setBusinessInfo({...businessInfo, heroBadge: e.target.value})} placeholder="Contoh: Solusi IT Terpercaya" />
                </div>
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
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Kontak Utama</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2"><Phone size={14} /> Nomor WhatsApp (Tanpa +)</Label>
                      <Input value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} placeholder="628123456789" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2"><X size={14} /> Email Bisnis</Label>
                      <Input value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} placeholder="admin@email.com" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><MapPin size={14} /> Alamat Kantor</Label>
                    <Textarea value={businessInfo.address} onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})} placeholder="Jl. Merdeka No. 123..." />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lokasi Peta (Google Maps)</CardTitle>
                  <CardDescription>Cari nama lokasi atau masukkan URL 'src' secara manual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 p-4 border rounded-xl bg-accent/5">
                    <Label className="flex items-center gap-2"><Search size={14} /> Cari Nama Lokasi / Alamat</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={locationQuery} 
                        onChange={(e) => setLocationQuery(e.target.value)} 
                        placeholder="Contoh: Monas, Jakarta" 
                        onKeyDown={(e) => e.key === 'Enter' && generateMapFromQuery()}
                      />
                      <Button onClick={generateMapFromQuery}>Cari & Terapkan</Button>
                    </div>
                  </div>

                  <div className="grid gap-2 mt-4">
                    <Label>Google Maps Embed URL (Manual)</Label>
                    <Input 
                      value={businessInfo.mapEmbedUrl} 
                      onChange={(e) => setBusinessInfo({...businessInfo, mapEmbedUrl: e.target.value})} 
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Google Maps Direct Link (Manual)</Label>
                    <Input 
                      value={businessInfo.mapDirectUrl} 
                      onChange={(e) => setBusinessInfo({...businessInfo, mapDirectUrl: e.target.value})} 
                      placeholder="https://www.google.com/maps/search/?api=1&query=..."
                    />
                  </div>

                  {businessInfo.mapEmbedUrl && (
                    <div className="mt-4">
                      <Label className="mb-2 block">Pratinjau Lokasi Aktif:</Label>
                      <div className="rounded-xl overflow-hidden border border-border h-[300px] w-full bg-accent/5 relative">
                        <iframe 
                          src={businessInfo.mapEmbedUrl}
                          width="100%" 
                          height="100%" 
                          style={{ border: 0 }} 
                          allowFullScreen={true} 
                          loading="lazy" 
                        />
                        {businessInfo.mapDirectUrl && (
                          <Button asChild size="sm" className="absolute top-4 left-4 shadow-lg h-9 bg-white text-primary hover:bg-white/90">
                            <a href={businessInfo.mapDirectUrl} target="_blank">
                              Open in Maps <ExternalLink size={14} className="ml-2" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Media Sosial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Instagram size={14} /> Instagram URL</Label>
                    <Input value={businessInfo.socialInstagram} onChange={(e) => setBusinessInfo({...businessInfo, socialInstagram: e.target.value})} placeholder="https://instagram.com/akunanda" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Facebook size={14} /> Facebook URL</Label>
                    <Input value={businessInfo.socialFacebook} onChange={(e) => setBusinessInfo({...businessInfo, socialFacebook: e.target.value})} placeholder="https://facebook.com/akunanda" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Youtube size={14} /> YouTube URL</Label>
                    <Input value={businessInfo.socialYoutube} onChange={(e) => setBusinessInfo({...businessInfo, socialYoutube: e.target.value})} placeholder="https://youtube.com/c/channelanda" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><TikTokIcon className="w-3.5 h-3.5" /> TikTok URL</Label>
                    <Input value={businessInfo.socialTiktok} onChange={(e) => setBusinessInfo({...businessInfo, socialTiktok: e.target.value})} placeholder="https://tiktok.com/@akunanda" />
                  </div>
                </CardContent>
              </Card>
            </div>
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