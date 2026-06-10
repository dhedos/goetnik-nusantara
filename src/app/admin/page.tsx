
"use client";

import { useEffect, useState } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useAuth, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { doc, setDoc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  Loader2, Plus, Trash2, Save, LogOut, 
  Globe, Layout, Info, Phone, Shield, 
  Settings, ShoppingBag, Copy, Check, Cpu
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { PRIVACY_POLICY_DEFAULT, BUSINESS_NAME_DEFAULT } from '@/lib/constants';

type AdminSection = 'bookings' | 'services' | 'branding' | 'hero' | 'about' | 'contact' | 'privacy';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>('bookings');
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const canFetchData = !!(user?.uid && firestore);

  const servicesQuery = useMemoFirebase(() => 
    canFetchData ? collection(firestore!, 'businesses', user!.uid, 'services') : null, 
    [canFetchData, firestore, user?.uid]
  );
  const { data: services, loading: servicesLoading } = useCollection(servicesQuery);

  const bookingsQuery = useMemoFirebase(() => 
    canFetchData ? collection(firestore!, 'businesses', user!.uid, 'bookings') : null, 
    [canFetchData, firestore, user?.uid]
  );
  const { data: bookings, loading: bookingsLoading } = useCollection(bookingsQuery);

  const settingsRef = useMemoFirebase(() => 
    canFetchData ? doc(firestore!, 'businesses', user!.uid, 'settings', 'profile') : null, 
    [canFetchData, firestore, user?.uid]
  );
  const { data: settings, loading: settingsLoading } = useDoc(settingsRef);

  const [businessInfo, setBusinessInfo] = useState({
    name: BUSINESS_NAME_DEFAULT,
    whatsapp: '',
    address: '',
    email: '',
    mapEmbedUrl: '',
    mapDirectUrl: '',
    logoText: 'Go Etnik',
    logoAccentText: 'NUSANTARA',
    logoUrl: '',
    heroBadge: 'Solusi Digital Terpercaya',
    heroTitle: BUSINESS_NAME_DEFAULT,
    heroSubtitle: 'Kami melayani kebutuhan teknologi, desain grafis, dan pembuatan aplikasi secara profesional.',
    heroImageUrl: '',
    aboutTitle: 'Tentang Bisnis Kami',
    aboutContent: '',
    servicesSectionBadge: 'Katalog Layanan',
    servicesSectionTitle: 'Layanan Digital Premium',
    servicesSectionSubtitle: '',
    privacyPolicy: PRIVACY_POLICY_DEFAULT,
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
        name: settings.name || BUSINESS_NAME_DEFAULT,
        whatsapp: settings.whatsapp || '',
        address: settings.address || '',
        email: settings.email || '',
        mapEmbedUrl: settings.mapEmbedUrl || '',
        mapDirectUrl: settings.mapDirectUrl || '',
        logoText: settings.logoText || 'Go Etnik',
        logoAccentText: settings.logoAccentText || 'NUSANTARA',
        logoUrl: settings.logoUrl || '',
        heroBadge: settings.heroBadge || 'Solusi Digital Terpercaya',
        heroTitle: settings.heroTitle || BUSINESS_NAME_DEFAULT,
        heroSubtitle: settings.heroSubtitle || 'Kami melayani kebutuhan teknologi, desain grafis, dan pembuatan aplikasi secara profesional.',
        heroImageUrl: settings.heroImageUrl || '',
        aboutTitle: settings.aboutTitle || 'Tentang Bisnis Kami',
        aboutContent: settings.aboutContent || '',
        servicesSectionBadge: settings.servicesSectionBadge || 'Katalog Layanan',
        servicesSectionTitle: settings.servicesSectionTitle || 'Layanan Digital Premium',
        servicesSectionSubtitle: settings.servicesSectionSubtitle || '',
        privacyPolicy: settings.privacyPolicy || PRIVACY_POLICY_DEFAULT,
        socialInstagram: settings.socialInstagram || '',
        socialFacebook: settings.socialFacebook || '',
        socialYoutube: settings.socialYoutube || '',
        socialTiktok: settings.socialTiktok || ''
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
    if (!firestore || !user) return;
    setIsSaving(true);
    const docRef = doc(firestore, 'businesses', user.uid, 'settings', 'profile');
    const data = {
      ...businessInfo,
      ownerId: user.uid,
      updatedAt: serverTimestamp()
    };
    
    setDoc(docRef, data, { merge: true })
      .then(() => {
        toast({ title: "Berhasil", description: "Pengaturan telah disimpan secara real-time." });
        setIsSaving(false);
      })
      .catch(async (e) => {
        setIsSaving(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data,
        }));
      });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'hero' | string) => {
    const file = e.target.files?.[0];
    if (!file || !user || !firestore) return;

    if (file.size > 1024 * 1024) { // 1MB Limit
      toast({ variant: "destructive", title: "File Terlalu Besar", description: "Maksimal 1MB untuk performa terbaik di sistem Firestore." });
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
        const docRef = doc(firestore, 'businesses', user.uid, 'services', target);
        updateDoc(docRef, { imageUrl: base64String });
      }
      setIsUploading(null);
      toast({ title: "Berhasil", description: "Gambar berhasil dimuat ke pratinjau. Tekan 'Simpan Semua' untuk menyimpan permanen." });
    };
    reader.readAsDataURL(file);
  };

  const handleAddService = () => {
    if (!firestore || !user) return;
    const colRef = collection(firestore, 'businesses', user.uid, 'services');
    const newService = {
      name: 'Layanan Baru',
      price: 'Rp 0',
      description: 'Deskripsi singkat layanan Anda...',
      iconName: 'Monitor',
      imageUrl: '',
      features: ['Fitur Utama'],
      ownerId: user.uid,
      createdAt: serverTimestamp()
    };
    
    addDoc(colRef, newService).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: newService
      }));
    });
    
    toast({ title: "Berhasil", description: "Layanan baru telah ditambahkan." });
  };

  const copyPublicLink = () => {
    if (!user) return;
    const url = `${window.location.origin}?id=${user.uid}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Tautan Disalin", description: "Bagikan tautan ini ke pelanggan Anda." });
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return null;

  const navItems = [
    { id: 'bookings', label: 'Pesanan Masuk', icon: ShoppingBag },
    { id: 'services', label: 'Katalog Layanan', icon: Settings },
    { id: 'branding', label: 'Branding (Logo & Teks)', icon: Layout },
    { id: 'hero', label: 'Hero Section', icon: Globe },
    { id: 'about', label: 'Tentang Bisnis', icon: Info },
    { id: 'contact', label: 'Kontak & Alamat', icon: Phone },
    { id: 'privacy', label: 'Kebijakan Privasi', icon: Shield },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1120] text-foreground">
      {/* Sidebar Admin */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-white/5 md:relative md:translate-x-0 shrink-0">
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-white/5">
            <h2 className="text-2xl font-black text-primary tracking-tighter uppercase italic">PANEL ADMIN</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">Pengaturan Bisnis Digital</p>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveSection(item.id as AdminSection)} 
                className={cn(
                  "flex items-center w-full gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all", 
                  activeSection === item.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t border-white/5 bg-accent/5 space-y-3">
            <Button variant="outline" className="w-full gap-2 rounded-xl border-white/10 hover:bg-white/5" onClick={copyPublicLink}><Copy size={16} /> Salin Link Web</Button>
            <Button variant="destructive" className="w-full gap-2 rounded-xl" onClick={handleLogout}><LogOut size={16} /> Keluar</Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative bg-[#0B1120]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight capitalize text-white italic">{activeSection}</h1>
              <p className="text-muted-foreground mt-1">Lakukan kustomisasi tampilan website bisnis Anda.</p>
            </div>
            <Button onClick={handleSaveBusinessInfo} size="lg" className="rounded-2xl px-10 shadow-xl shadow-primary/30 h-14 font-bold text-lg hover:scale-105 transition-transform" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={22} />}
              Simpan Semua
            </Button>
          </div>

          {(bookingsLoading || servicesLoading || settingsLoading) && (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>
          )}

          {activeSection === 'bookings' && (
            <Card className="rounded-[2rem] border-white/5 bg-card/50 shadow-2xl overflow-hidden">
              <CardHeader className="p-8 border-b border-white/5"><CardTitle className="text-2xl font-bold">Antrean Pesanan Masuk</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-4">
                {bookings?.map((b: any) => (
                  <div key={b.id} className="flex justify-between items-center p-6 border border-white/5 rounded-3xl bg-background/30 hover:bg-accent/5 transition-colors">
                    <div className="space-y-1">
                      <p className="text-lg font-black text-white">{b.fullName}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 font-bold text-primary"><ShoppingBag size={14} /> {b.service}</span>
                        <span className="flex items-center gap-1"><Phone size={14} /> {b.whatsapp}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="rounded-full px-4 py-1 font-bold uppercase tracking-wider" variant={b.status === 'Selesai' ? 'default' : 'outline'}>{b.status}</Badge>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-full" onClick={() => deleteDoc(doc(firestore!, 'businesses', user.uid, 'bookings', b.id))}><Trash2 size={20} /></Button>
                    </div>
                  </div>
                ))}
                {!bookings?.length && !bookingsLoading && (
                  <div className="text-center py-20 bg-background/20 rounded-[2rem] border border-dashed border-white/10">
                    <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4"><ShoppingBag className="text-muted-foreground opacity-20" size={40} /></div>
                    <p className="text-muted-foreground font-bold">Belum ada pesanan masuk hari ini.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === 'branding' && (
            <Card className="rounded-[2rem] border-white/5 bg-card/50 shadow-2xl overflow-hidden">
              <CardHeader className="p-10 border-b border-white/5 bg-primary/5">
                <CardTitle className="text-2xl font-black italic tracking-tight">Visual Identitas Bisnis</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-6">
                  <Label className="text-lg font-black text-white uppercase tracking-wider">Logo Utama (Gambar)</Label>
                  <div className="flex flex-col md:flex-row items-center gap-8 p-10 border-2 border-dashed border-white/10 rounded-[2rem] bg-background/30 group hover:border-primary/50 transition-colors">
                    <div className="relative h-40 w-40 bg-[#0B1120] rounded-3xl flex items-center justify-center overflow-hidden border border-white/5 shadow-2xl">
                      {businessInfo.logoUrl ? (
                        <Image src={businessInfo.logoUrl} alt="Preview Logo" fill className="object-contain p-4" unoptimized />
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-20">
                          <Cpu size={48} />
                          <span className="text-[10px] font-bold">LOGO</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-6 w-full text-center md:text-left">
                      <div>
                        <h4 className="font-bold text-white text-lg">Unggah Logo Bisnis</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">Gunakan format PNG transparan untuk hasil terbaik di Navbar dan Footer.</p>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <Input type="file" className="hidden" id="logo-upload" onChange={(e) => handleImageUpload(e, 'logo')} />
                        <Button asChild variant="secondary" className="rounded-xl px-8 cursor-pointer h-12 font-bold"><label htmlFor="logo-upload">{isUploading === 'logo' ? 'Mengunggah...' : 'Pilih Gambar'}</label></Button>
                        {businessInfo.logoUrl && <Button variant="ghost" className="text-destructive h-12 hover:bg-destructive/10 rounded-xl font-bold" onClick={() => setBusinessInfo({...businessInfo, logoUrl: ''})}>Hapus Logo</Button>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <Label className="font-black text-white uppercase tracking-wider text-xs">Teks Logo Utama (Putih)</Label>
                    <Input placeholder="Contoh: Go Etnik" value={businessInfo.logoText} onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} className="rounded-2xl h-14 bg-background/50 border-white/5 text-lg font-black" />
                    <p className="text-[10px] text-muted-foreground">Teks ini akan tampil dengan warna putih di Navbar.</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="font-black text-white uppercase tracking-wider text-xs">Teks Aksen (Warna Biru)</Label>
                    <Input placeholder="Contoh: NUSANTARA" value={businessInfo.logoAccentText} onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} className="rounded-2xl h-14 bg-background/50 border-white/5 text-lg font-black text-primary" />
                    <p className="text-[10px] text-muted-foreground">Teks ini akan tampil dengan warna aksen biru.</p>
                  </div>
                </div>

                <div className="p-8 bg-primary/10 rounded-3xl border border-primary/20 flex items-start gap-6">
                  <div className="p-3 bg-primary rounded-2xl text-primary-foreground shrink-0 shadow-lg shadow-primary/20"><Layout size={24} /></div>
                  <div className="space-y-1">
                    <h5 className="font-black text-white uppercase tracking-widest text-sm">Mode Pratinjau</h5>
                    <p className="text-sm text-muted-foreground">Logo dan Teks di atas akan otomatis membentuk identitas visual di pojok kiri atas website Anda.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'hero' && (
            <Card className="rounded-[2rem] border-white/5 bg-card/50 shadow-2xl overflow-hidden">
              <CardContent className="p-10 space-y-8">
                <div className="space-y-4">
                  <Label className="text-lg font-black text-white uppercase tracking-wider">Banner Utama (Hero Section)</Label>
                  <div className="relative h-72 w-full bg-[#0B1120] rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group">
                    {businessInfo.heroImageUrl ? (
                      <Image src={businessInfo.heroImageUrl} alt="Hero Banner" fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" unoptimized />
                    ) : (
                      <Globe className="text-muted-foreground opacity-10" size={80} />
                    )}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Input type="file" className="hidden" id="hero-upload" onChange={(e) => handleImageUpload(e, 'hero')} />
                      <Button asChild className="rounded-2xl px-8 h-12 font-bold cursor-pointer"><label htmlFor="hero-upload">{isUploading === 'hero' ? 'Sedang Memproses...' : 'Ganti Banner Utama'}</label></Button>
                    </div>
                    {!businessInfo.heroImageUrl && <p className="absolute text-muted-foreground/50 font-black italic">PRATINJAU BANNER</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-white">Badge Atas (Teks Kecil)</Label>
                  <Input placeholder="Contoh: Solusi Digital Terpercaya" value={businessInfo.heroBadge} onChange={(e) => setBusinessInfo({...businessInfo, heroBadge: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-white">Judul Utama Halaman</Label>
                  <Input placeholder="Judul besar website" value={businessInfo.heroTitle} onChange={(e) => setBusinessInfo({...businessInfo, heroTitle: e.target.value})} className="rounded-xl h-14 bg-background/50 border-white/5 font-black text-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-white">Sub-judul / Penjelasan Singkat</Label>
                  <Textarea placeholder="Tuliskan deskripsi singkat bisnis Anda..." value={businessInfo.heroSubtitle} onChange={(e) => setBusinessInfo({...businessInfo, heroSubtitle: e.target.value})} className="rounded-2xl min-h-[140px] bg-background/50 border-white/5 text-lg p-6" />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'services' && (
             <div className="space-y-6">
                <Button onClick={handleAddService} size="lg" className="rounded-2xl px-10 h-14 font-bold bg-white text-black hover:bg-white/90 shadow-xl"><Plus className="mr-2" size={24} /> Tambah Paket Layanan</Button>
                <div className="grid md:grid-cols-2 gap-6">
                  {services?.map((s: any) => (
                    <Card key={s.id} className="bg-card/50 rounded-[2rem] border-white/5 overflow-hidden group shadow-xl">
                      <div className="h-44 bg-muted/20 relative">
                        {s.imageUrl ? (
                          <Image src={s.imageUrl} alt={s.name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground font-black italic opacity-10 uppercase tracking-widest">No Image</div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <Input type="file" className="hidden" id={`img-${s.id}`} onChange={(e) => handleImageUpload(e, s.id)} />
                          <Button variant="secondary" size="sm" asChild className="rounded-full shadow-2xl h-9 px-4 font-bold"><label htmlFor={`img-${s.id}`} className="cursor-pointer">{isUploading === s.id ? '...' : 'Ganti Gambar'}</label></Button>
                          <Button variant="destructive" size="icon" className="rounded-full shadow-2xl h-9 w-9" onClick={() => deleteDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id))}><Trash2 size={16} /></Button>
                        </div>
                      </div>
                      <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground">Nama Paket</Label><Input defaultValue={s.name} className="rounded-xl bg-background/50 border-white/5 font-bold" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id), { name: e.target.value })} /></div>
                           <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground">Mulai Harga</Label><Input defaultValue={s.price} className="rounded-xl bg-background/50 border-white/5 font-bold text-primary" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id), { price: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><Label className="font-bold text-xs uppercase text-muted-foreground">Deskripsi</Label><Textarea defaultValue={s.description} className="rounded-xl min-h-[90px] bg-background/50 border-white/5" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id), { description: e.target.value })} /></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          )}

          {activeSection === 'contact' && (
            <Card className="rounded-[2rem] border-white/5 bg-card/50 shadow-2xl overflow-hidden">
              <CardContent className="p-10 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2"><Label className="font-bold text-white">WhatsApp Admin (62xxx)</Label><Input placeholder="Contoh: 628123456789" value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} className="rounded-xl h-14 bg-background/50 border-white/5" /></div>
                  <div className="space-y-2"><Label className="font-bold text-white">Email Bisnis</Label><Input placeholder="email@bisnis.com" value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} className="rounded-xl h-14 bg-background/50 border-white/5" /></div>
                </div>
                <div className="space-y-2"><Label className="font-bold text-white">Alamat Kantor / Lokasi Toko</Label><Textarea placeholder="Jl. Raya Utama No. 1..." value={businessInfo.address} onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})} className="rounded-2xl min-h-[100px] bg-background/50 border-white/5" /></div>
                <div className="space-y-2"><Label className="font-bold text-white">Google Maps Embed Link</Label><Input placeholder="Paste link dari Google Maps (Iframe Src)" value={businessInfo.mapEmbedUrl} onChange={(e) => setBusinessInfo({...businessInfo, mapEmbedUrl: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'about' && (
            <Card className="rounded-[2rem] border-white/5 bg-card/50 shadow-2xl overflow-hidden">
              <CardContent className="p-10 space-y-8">
                <div className="space-y-2"><Label className="font-black text-white text-lg uppercase">Judul Section 'Tentang Kami'</Label><Input placeholder="Mengenal Lebih Dekat" value={businessInfo.aboutTitle} onChange={(e) => setBusinessInfo({...businessInfo, aboutTitle: e.target.value})} className="rounded-xl h-14 bg-background/50 border-white/5 font-black" /></div>
                <div className="space-y-2"><Label className="font-black text-white text-lg uppercase">Konten / Narasi Bisnis</Label><Textarea className="min-h-[350px] rounded-[2rem] p-10 bg-background/50 border-white/5 leading-relaxed text-lg" placeholder="Tuliskan sejarah, visi misi, atau kelebihan bisnis Anda..." value={businessInfo.aboutContent} onChange={(e) => setBusinessInfo({...businessInfo, aboutContent: e.target.value})} /></div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'privacy' && (
            <Card className="rounded-[2rem] border-white/5 bg-card/50 shadow-2xl overflow-hidden">
              <CardContent className="p-10">
                <Label className="text-xl font-black text-white mb-6 block uppercase italic">Konten Kebijakan Privasi</Label>
                <Textarea className="min-h-[450px] rounded-[2rem] p-10 bg-background/50 border-white/5 text-muted-foreground leading-relaxed" value={businessInfo.privacyPolicy} onChange={(e) => setBusinessInfo({...businessInfo, privacyPolicy: e.target.value})} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
