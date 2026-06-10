
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
  Settings, ShoppingBag, Copy, Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { PRIVACY_POLICY_DEFAULT } from '@/lib/constants';

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
      toast({ variant: "destructive", title: "File Terlalu Besar", description: "Maksimal 1MB untuk performa terbaik." });
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
      toast({ title: "Berhasil", description: "Gambar berhasil diunggah." });
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
    toast({ title: "Tautan Disalin", description: "Bagikan tautan ini ke pelanggan atau sosial media Anda." });
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
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r md:relative md:translate-x-0 shrink-0">
        <div className="flex flex-col h-full">
          <div className="p-8 border-b">
            <h2 className="text-2xl font-black text-primary tracking-tighter">ADMIN PANEL</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1 font-bold">Bisnis Digital</p>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveSection(item.id as AdminSection)} 
                className={cn(
                  "flex items-center w-full gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all", 
                  activeSection === item.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 border-t bg-accent/5 space-y-3">
            <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={copyPublicLink}><Copy size={16} /> Salin Link Web</Button>
            <Button variant="destructive" className="w-full gap-2 rounded-xl" onClick={handleLogout}><LogOut size={16} /> Keluar</Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight capitalize">{activeSection}</h1>
              <p className="text-muted-foreground mt-1">Kelola bagaimana bisnis Anda tampil di publik.</p>
            </div>
            <Button onClick={handleSaveBusinessInfo} size="lg" className="rounded-2xl px-8 shadow-xl shadow-primary/20" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={20} />}
              Simpan Semua Perubahan
            </Button>
          </div>

          {(bookingsLoading || servicesLoading || settingsLoading) && (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>
          )}

          {activeSection === 'bookings' && (
            <Card className="rounded-[2rem] border-border/50 shadow-2xl">
              <CardHeader><CardTitle>Antrean Pesanan</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {bookings?.map((b: any) => (
                  <div key={b.id} className="flex justify-between items-center p-6 border rounded-3xl bg-background/50 hover:bg-accent/5 transition-colors">
                    <div className="space-y-1">
                      <p className="text-lg font-black">{b.fullName}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-primary"><ShoppingBag size={14} /> {b.service}</span>
                        <span className="flex items-center gap-1"><Phone size={14} /> {b.whatsapp}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="rounded-full px-4 py-1" variant={b.status === 'Selesai' ? 'default' : 'outline'}>{b.status}</Badge>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-full" onClick={() => deleteDoc(doc(firestore!, 'businesses', user.uid, 'bookings', b.id))}><Trash2 size={20} /></Button>
                    </div>
                  </div>
                ))}
                {!bookings?.length && !bookingsLoading && (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4"><ShoppingBag className="text-muted-foreground opacity-30" size={40} /></div>
                    <p className="text-muted-foreground font-medium">Belum ada pesanan masuk hari ini.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === 'services' && (
             <div className="space-y-6">
                <Button onClick={handleAddService} size="lg" className="rounded-2xl px-8 bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="mr-2" size={20} /> Tambah Paket Baru</Button>
                <div className="grid md:grid-cols-2 gap-6">
                  {services?.map((s: any) => (
                    <Card key={s.id} className="bg-background/50 rounded-3xl border-border/50 overflow-hidden group">
                      <div className="h-40 bg-muted relative">
                        {s.imageUrl ? (
                          <Image src={s.imageUrl} alt={s.name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground font-bold italic opacity-30">No Image</div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <Input type="file" className="hidden" id={`img-${s.id}`} onChange={(e) => handleImageUpload(e, s.id)} />
                          <Button variant="secondary" size="sm" asChild className="rounded-full shadow-lg"><label htmlFor={`img-${s.id}`} className="cursor-pointer">{isUploading === s.id ? 'Loading...' : 'Ganti Gambar'}</label></Button>
                          <Button variant="destructive" size="icon" className="rounded-full shadow-lg" onClick={() => deleteDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id))}><Trash2 size={16} /></Button>
                        </div>
                      </div>
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2"><Label>Nama Layanan</Label><Input defaultValue={s.name} className="rounded-xl" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id), { name: e.target.value })} /></div>
                           <div className="space-y-2"><Label>Harga</Label><Input defaultValue={s.price} className="rounded-xl" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id), { price: e.target.value })} /></div>
                        </div>
                        <div className="space-y-2"><Label>Deskripsi Singkat</Label><Textarea defaultValue={s.description} className="rounded-xl min-h-[80px]" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id), { description: e.target.value })} /></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          )}

          {activeSection === 'branding' && (
            <Card className="rounded-[2rem] border-border/50 shadow-2xl overflow-hidden">
              <CardHeader className="p-10 border-b bg-accent/5"><CardTitle className="text-2xl">Visual Identitas Bisnis</CardTitle></CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-4">
                  <Label className="text-lg font-bold">Logo Utama Bisnis</Label>
                  <div className="flex flex-col md:flex-row items-center gap-8 p-8 border-2 border-dashed border-border rounded-3xl bg-accent/5">
                    <div className="relative h-32 w-32 bg-background rounded-2xl flex items-center justify-center overflow-hidden border shadow-inner">
                      {businessInfo.logoUrl ? (
                        <Image src={businessInfo.logoUrl} alt="Preview Logo" fill className="object-contain p-4" unoptimized />
                      ) : (
                        <Layout className="text-muted-foreground opacity-20" size={48} />
                      )}
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <p className="text-sm text-muted-foreground leading-relaxed">Pilih gambar logo transparan (PNG) untuk hasil terbaik. Logo akan tampil di Navbar dan Footer.</p>
                      <div className="flex gap-4">
                        <Input type="file" className="hidden" id="logo-upload" onChange={(e) => handleImageUpload(e, 'logo')} />
                        <Button asChild variant="outline" className="rounded-xl cursor-pointer"><label htmlFor="logo-upload">{isUploading === 'logo' ? 'Mengunggah...' : 'Pilih File Logo'}</label></Button>
                        {businessInfo.logoUrl && <Button variant="ghost" className="text-destructive rounded-xl" onClick={() => setBusinessInfo({...businessInfo, logoUrl: ''})}>Hapus Logo</Button>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="font-bold">Nama Logo (Teks Putih)</Label>
                    <Input placeholder="Contoh: go Etnik" value={businessInfo.logoText} onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold">Nama Aksen (Teks Biru/Primer)</Label>
                    <Input placeholder="Contoh: Nusantara" value={businessInfo.logoAccentText} onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} className="rounded-xl h-12" />
                  </div>
                </div>

                <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 flex items-start gap-4">
                  <div className="p-2 bg-primary rounded-lg text-primary-foreground shrink-0"><Check size={20} /></div>
                  <p className="text-sm font-medium">Jangan lupa menekan tombol <strong>Simpan Semua</strong> di pojok kanan atas setelah selesai mengubah branding.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'contact' && (
            <Card className="rounded-[2rem] border-border/50 shadow-2xl">
              <CardContent className="p-10 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="font-bold">WhatsApp Admin</Label><Input placeholder="Contoh: 628123456789" value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} className="rounded-xl h-12" /></div>
                  <div className="space-y-2"><Label className="font-bold">Email Bisnis</Label><Input placeholder="email@bisnis.com" value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} className="rounded-xl h-12" /></div>
                </div>
                <div className="space-y-2"><Label className="font-bold">Alamat Lengkap Kantor/Toko</Label><Textarea placeholder="Jl. Raya..." value={businessInfo.address} onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})} className="rounded-xl min-h-[100px]" /></div>
                <div className="space-y-2"><Label className="font-bold">Google Maps Embed URL</Label><Input placeholder="https://www.google.com/maps/embed?..." value={businessInfo.mapEmbedUrl} onChange={(e) => setBusinessInfo({...businessInfo, mapEmbedUrl: e.target.value})} className="rounded-xl h-12" /></div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="font-bold">Link Instagram</Label><Input placeholder="https://instagram.com/..." value={businessInfo.socialInstagram} onChange={(e) => setBusinessInfo({...businessInfo, socialInstagram: e.target.value})} className="rounded-xl h-12" /></div>
                  <div className="space-y-2"><Label className="font-bold">Link Facebook</Label><Input placeholder="https://facebook.com/..." value={businessInfo.socialFacebook} onChange={(e) => setBusinessInfo({...businessInfo, socialFacebook: e.target.value})} className="rounded-xl h-12" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'privacy' && (
            <Card className="rounded-[2rem] border-border/50 shadow-2xl">
              <CardContent className="p-10">
                <Label className="text-lg font-bold mb-4 block">Konten Kebijakan Privasi</Label>
                <Textarea className="min-h-[400px] rounded-3xl p-6 bg-accent/5" value={businessInfo.privacyPolicy} onChange={(e) => setBusinessInfo({...businessInfo, privacyPolicy: e.target.value})} />
              </CardContent>
            </Card>
          )}

          {activeSection === 'hero' && (
            <Card className="rounded-[2rem] border-border/50 shadow-2xl">
              <CardContent className="p-10 space-y-6">
                <div className="space-y-4">
                  <Label className="text-lg font-bold">Banner Utama (Hero Image)</Label>
                  <div className="relative h-60 w-full bg-accent/5 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden">
                    {businessInfo.heroImageUrl ? (
                      <Image src={businessInfo.heroImageUrl} alt="Hero Banner" fill className="object-cover" unoptimized />
                    ) : (
                      <Globe className="text-muted-foreground opacity-20" size={60} />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Input type="file" className="hidden" id="hero-upload" onChange={(e) => handleImageUpload(e, 'hero')} />
                      <Button asChild className="rounded-xl cursor-pointer"><label htmlFor="hero-upload">{isUploading === 'hero' ? 'Sedang Memproses...' : 'Ubah Gambar Banner'}</label></Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2"><Label className="font-bold">Badge Teks (Teks kecil di atas judul)</Label><Input placeholder="Solusi Digital Terpercaya" value={businessInfo.heroBadge} onChange={(e) => setBusinessInfo({...businessInfo, heroBadge: e.target.value})} className="rounded-xl h-12" /></div>
                <div className="space-y-2"><Label className="font-bold">Judul Utama (Besar)</Label><Input placeholder="Pusat Layanan Digital" value={businessInfo.heroTitle} onChange={(e) => setBusinessInfo({...businessInfo, heroTitle: e.target.value})} className="rounded-xl h-12" /></div>
                <div className="space-y-2"><Label className="font-bold">Sub-judul (Deskripsi Hero)</Label><Textarea placeholder="Kami melayani..." value={businessInfo.heroSubtitle} onChange={(e) => setBusinessInfo({...businessInfo, heroSubtitle: e.target.value})} className="rounded-xl min-h-[120px]" /></div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'about' && (
            <Card className="rounded-[2rem] border-border/50 shadow-2xl">
              <CardContent className="p-10 space-y-6">
                <div className="space-y-2"><Label className="font-bold text-lg">Judul 'Tentang Kami'</Label><Input placeholder="Mengenal Lebih Dekat" value={businessInfo.aboutTitle} onChange={(e) => setBusinessInfo({...businessInfo, aboutTitle: e.target.value})} className="rounded-xl h-12" /></div>
                <div className="space-y-2"><Label className="font-bold text-lg">Konten/Sejarah Bisnis</Label><Textarea className="min-h-[300px] rounded-3xl p-6 bg-accent/5" placeholder="Tuliskan visi, misi, dan kelebihan bisnis Anda di sini..." value={businessInfo.aboutContent} onChange={(e) => setBusinessInfo({...businessInfo, aboutContent: e.target.value})} /></div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
