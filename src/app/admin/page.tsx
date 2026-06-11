"use client";

import { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useAuth, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, setDoc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  Loader2, Plus, Trash2, Save, LogOut, 
  Globe, Layout, Info, Phone, Shield, 
  Settings, ShoppingBag, ExternalLink as ExternalLinkIcon, Cpu, MapPin, Mail, Instagram, Facebook, Youtube, Music2, CheckCircle2, MoveVertical, Maximize, Type, Image as ImageIcon, Palette, Map as MapIcon, Search, Grid3X3, UploadCloud, Link as LinkIcon, ShoppingCart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PRIVACY_POLICY_DEFAULT, BUSINESS_NAME_DEFAULT, BUSINESS_ADDRESS_DEFAULT, BUSINESS_EMAIL_DEFAULT, OWNER_WHATSAPP_DEFAULT, MAIN_BUSINESS_ID, THEMES } from '@/lib/constants';

type AdminSection = 'bookings' | 'services' | 'portfolio' | 'links' | 'branding' | 'hero' | 'about' | 'contact' | 'social' | 'privacy';

const ETHNIC_FONTS = [
  { name: 'Cinzel', label: 'Cinzel (Etnik Nusantara)' },
  { name: 'Marcellus', label: 'Marcellus (Klasik Bersih)' },
  { name: 'Almendra', label: 'Almendra (Etnik Ukiran)' },
  { name: 'Lora', label: 'Lora (Serif Anggun)' },
  { name: 'Playfair Display', label: 'Playfair (Mewah)' },
  { name: 'Inter', label: 'Inter (Modern Standar)' }
];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>('bookings');
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const hasLoadedSettings = useRef(false);
  const [searchLocation, setSearchLocation] = useState('');
  
  const canFetchData = !!(firestore && user);

  const servicesQuery = useMemoFirebase(() => 
    canFetchData ? collection(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services') : null, 
    [canFetchData, firestore]
  );
  const { data: services } = useCollection(servicesQuery);

  const portfolioQuery = useMemoFirebase(() => 
    canFetchData ? query(collection(firestore!, 'businesses', MAIN_BUSINESS_ID, 'portfolio'), orderBy('createdAt', 'desc')) : null, 
    [canFetchData, firestore]
  );
  const { data: portfolio } = useCollection(portfolioQuery);

  const linksQuery = useMemoFirebase(() => 
    canFetchData ? query(collection(firestore!, 'businesses', MAIN_BUSINESS_ID, 'external-links'), orderBy('createdAt', 'desc')) : null, 
    [canFetchData, firestore]
  );
  const { data: externalLinks } = useCollection(linksQuery);

  const bookingsQuery = useMemoFirebase(() => 
    canFetchData ? collection(firestore!, 'businesses', MAIN_BUSINESS_ID, 'bookings') : null, 
    [canFetchData, firestore]
  );
  const { data: bookings } = useCollection(bookingsQuery);

  const settingsRef = useMemoFirebase(() => 
    canFetchData ? doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'settings', 'profile') : null, 
    [canFetchData, firestore]
  );
  const { data: settings } = useDoc(settingsRef);

  const [businessInfo, setBusinessInfo] = useState({
    name: BUSINESS_NAME_DEFAULT,
    whatsapp: OWNER_WHATSAPP_DEFAULT,
    address: BUSINESS_ADDRESS_DEFAULT,
    email: BUSINESS_EMAIL_DEFAULT,
    mapEmbedUrl: '',
    mapDirectUrl: '',
    logoText: 'Go Etnik',
    logoAccentText: 'NUSANTARA',
    logoUrl: '',
    logoHeight: '36',
    fontFamily: 'Inter',
    themeId: 'heritage-red',
    heroBadge: 'Solusi Digital Terpercaya',
    heroTitle: BUSINESS_NAME_DEFAULT,
    heroSubtitle: 'Kami melayani kebutuhan teknologi, desain grafis, dan pembuatan aplikasi secara profesional.',
    heroImageUrl: '',
    heroImagePosition: '50%',
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
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (settings && !hasLoadedSettings.current) {
      setBusinessInfo(prev => ({
        ...prev,
        ...settings,
        heroImagePosition: settings.heroImagePosition || '50%',
        logoHeight: settings.logoHeight || '36',
        fontFamily: settings.fontFamily || 'Inter',
        themeId: settings.themeId || 'heritage-red'
      }));
      hasLoadedSettings.current = true;
    }
  }, [settings]);

  useEffect(() => {
    const theme = THEMES.find(t => t.id === businessInfo.themeId) || THEMES[0];
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--background', theme.background);
    document.documentElement.style.setProperty('--selected-font', `'${businessInfo.fontFamily}', sans-serif`);
    
    const bgParts = theme.background.split(' ');
    const bgL = parseInt(bgParts[2]);
    if (bgL > 60) {
      document.documentElement.style.setProperty('--foreground', '20 20% 12%');
      document.documentElement.style.setProperty('--border', '30 20% 80%');
      document.documentElement.style.setProperty('--card', '30 20% 95%');
    } else {
      document.documentElement.style.setProperty('--foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--border', '222 47% 25% / 0.3');
      document.documentElement.style.setProperty('--card', `${bgParts[0]} ${bgParts[1]} ${bgL + 5}%`);
    }
  }, [businessInfo.themeId, businessInfo.fontFamily]);

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
    const docRef = doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'settings', 'profile');
    const data = {
      ...businessInfo,
      ownerId: user.uid,
      updatedAt: serverTimestamp()
    };
    
    setDoc(docRef, data, { merge: true })
      .then(() => {
        setLastSaved(new Date());
        toast({ 
          title: "Berhasil Disimpan", 
          description: "Perubahan telah diterapkan ke website utama." 
        });
        setIsSaving(false);
      })
      .catch((e) => {
        setIsSaving(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data,
        }));
      });
  };

  const resizeAndCompressImage = (file: File, maxWidth: number = 1200, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: string) => {
    const file = e.target.files?.[0];
    if (!file || !user || !firestore) return;

    if (file.size > 1024 * 1024 * 2) { 
      toast({ variant: "destructive", title: "File Terlalu Besar", description: "Maksimal 2MB sebelum kompresi." });
      return;
    }

    setIsUploading(target);
    try {
      const compressedBase64 = await resizeAndCompressImage(file);
      
      if (target === 'logo') {
        setBusinessInfo(prev => ({ ...prev, logoUrl: compressedBase64 }));
      } else if (target === 'hero') {
        setBusinessInfo(prev => ({ ...prev, heroImageUrl: compressedBase64 }));
      } else {
        const docRef = doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'services', target);
        updateDoc(docRef, { imageUrl: compressedBase64 });
      }
      toast({ title: "Gambar Berhasil Dimuat", description: "Klik simpan untuk menerapkan." });
    } catch (err) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal memproses gambar." });
    } finally {
      setIsUploading(null);
    }
  };

  const handleMultiplePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !user || !firestore) return;

    setIsUploading('portfolio');
    let count = 0;

    try {
      for (const file of files) {
        if (file.size > 1024 * 1024 * 3) {
          toast({ variant: "destructive", title: "File Terlalu Besar", description: `${file.name} melebihi 3MB.` });
          continue;
        }

        const compressedBase64 = await resizeAndCompressImage(file, 1000, 0.6);
        const colRef = collection(firestore, 'businesses', MAIN_BUSINESS_ID, 'portfolio');
        await addDoc(colRef, {
          imageUrl: compressedBase64,
          createdAt: serverTimestamp(),
          ownerId: user.uid
        });
        count++;
      }
      toast({ title: "Berhasil", description: `${count} foto portofolio telah diunggah.` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Gagal", description: "Beberapa gambar gagal diunggah karena ukuran dokumen Firestore terbatas (1MB)." });
    } finally {
      setIsUploading(null);
      e.target.value = '';
    }
  };

  const handleAddService = () => {
    if (!firestore || !user) return;
    const colRef = collection(firestore, 'businesses', MAIN_BUSINESS_ID, 'services');
    addDoc(colRef, {
      name: 'Layanan Baru',
      price: 'Rp 0',
      description: 'Deskripsi layanan...',
      iconName: 'Monitor',
      imageUrl: '',
      features: ['Fitur Layanan'],
      ownerId: user.uid,
      createdAt: serverTimestamp()
    });
  };

  const handleAddExternalLink = () => {
    if (!firestore || !user) return;
    const colRef = collection(firestore, 'businesses', MAIN_BUSINESS_ID, 'external-links');
    addDoc(colRef, {
      title: 'Tautan Baru',
      url: 'https://',
      platform: 'Website',
      ownerId: user.uid,
      createdAt: serverTimestamp()
    });
  };

  const handleAutoSearchMap = () => {
    if (!searchLocation.trim()) return;
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(searchLocation)}&output=embed`;
    const directUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchLocation)}`;
    setBusinessInfo({ ...businessInfo, mapEmbedUrl: embedUrl, mapDirectUrl: directUrl });
    toast({ title: "Lokasi Ditemukan", description: "Peta pratinjau telah diperbarui." });
  };

  if (authLoading || !isMounted) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return null;

  const navItems = [
    { id: 'bookings', label: 'Pesanan', icon: ShoppingBag },
    { id: 'services', label: 'Layanan', icon: Settings },
    { id: 'portfolio', label: 'Portofolio', icon: Grid3X3 },
    { id: 'links', label: 'Tautan Eksternal', icon: LinkIcon },
    { id: 'branding', label: 'Logo & Tema', icon: Layout },
    { id: 'hero', label: 'Banner Utama', icon: Globe },
    { id: 'about', label: 'Tentang Kami', icon: Info },
    { id: 'contact', label: 'Kontak & Peta', icon: MapPin },
    { id: 'social', label: 'Media Sosial', icon: Instagram },
    { id: 'privacy', label: 'Privasi', icon: Shield },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-500" style={{ fontFamily: 'var(--selected-font)' }}>
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 transition-colors duration-500">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary tracking-tighter uppercase">PANEL ADMIN</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveSection(item.id as AdminSection)} 
              className={cn(
                "flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all", 
                activeSection === item.id ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-primary/10 text-foreground/70"
              )}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <Button variant="outline" className="w-full gap-2 rounded-xl text-xs font-bold border-border" onClick={() => window.open(window.location.origin, '_blank')}><ExternalLinkIcon size={14} /> Lihat Website</Button>
          <Button variant="destructive" className="w-full gap-2 rounded-xl text-xs font-bold" onClick={handleLogout}><LogOut size={14} /> Keluar</Button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8 bg-background/50 transition-colors duration-500">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">{activeSection}</h1>
            <div className="flex flex-col items-end gap-2">
              <Button onClick={handleSaveBusinessInfo} size="lg" className="rounded-xl px-10 h-14 font-bold shadow-2xl transition-all active:scale-95" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={20} />}
                Simpan Semua
              </Button>
              {lastSaved && (
                <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Tersimpan: {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {activeSection === 'bookings' && (
            <Card className="rounded-3xl border-border bg-card shadow-xl overflow-hidden">
              <CardHeader className="p-6 border-b border-border"><CardTitle>Pesanan Masuk</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-4">
                {bookings?.map((b: any) => (
                  <div key={b.id} className="flex justify-between items-center p-5 border border-border rounded-2xl bg-background/40 hover:bg-background/60 transition-colors">
                    <div>
                      <p className="font-bold text-lg">{b.fullName}</p>
                      <p className="text-sm text-muted-foreground">{b.service} • {b.whatsapp}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1 italic">{b.notes || 'Tanpa catatan'}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'bookings', b.id))}><Trash2 size={18} /></Button>
                  </div>
                ))}
                {bookings?.length === 0 && <p className="text-center text-muted-foreground py-16 font-medium">Belum ada pesanan terbaru.</p>}
              </CardContent>
            </Card>
          )}

          {activeSection === 'links' && (
             <div className="space-y-6">
                <Button onClick={handleAddExternalLink} size="lg" className="rounded-2xl px-12 h-16 font-black uppercase tracking-widest bg-primary text-primary-foreground hover:scale-105 transition-all shadow-2xl"><Plus className="mr-2" size={24} /> Tambah Tautan</Button>
                <div className="grid md:grid-cols-1 gap-6">
                  {externalLinks?.map((link: any) => (
                    <Card key={link.id} className="bg-card rounded-3xl border-border overflow-hidden shadow-lg p-6">
                      <div className="grid md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Judul Link (Contoh: Shopee Store)</Label>
                          <Input defaultValue={link.title} className="rounded-xl h-12 bg-background border-border font-bold" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'external-links', link.id), { title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase">Platform</Label>
                          <Select 
                            defaultValue={link.platform} 
                            onValueChange={(val) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'external-links', link.id), { platform: val })}
                          >
                            <SelectTrigger className="rounded-xl h-12 bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Shopee">Shopee</SelectItem>
                              <SelectItem value="Tokopedia">Tokopedia</SelectItem>
                              <SelectItem value="Lazada">Lazada</SelectItem>
                              <SelectItem value="Website">Website Partner</SelectItem>
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs font-bold uppercase">URL / Link Lengkap</Label>
                            <Input defaultValue={link.url} className="rounded-xl h-12 bg-background border-border" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'external-links', link.id), { url: e.target.value })} />
                          </div>
                          <Button variant="destructive" size="icon" className="rounded-xl h-12 w-12 shrink-0" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'external-links', link.id))}><Trash2 size={18} /></Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {externalLinks?.length === 0 && (
                    <div className="py-20 text-center opacity-20 uppercase font-black tracking-widest text-xs">Belum ada tautan eksternal (Marketplace/Web Partner)</div>
                  )}
                </div>
             </div>
          )}

          {activeSection === 'portfolio' && (
            <div className="space-y-6">
              <Card className="rounded-3xl border-border bg-card shadow-xl overflow-hidden">
                <CardHeader className="p-8 border-b border-border">
                  <CardTitle className="flex items-center gap-2"><Grid3X3 size={20} className="text-primary" /> Galeri Portofolio (Hasil Karya)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-3xl bg-primary/5 group hover:bg-primary/10 transition-all">
                    <input 
                      type="file" 
                      id="portfolio-up" 
                      className="hidden" 
                      multiple 
                      accept="image/*" 
                      onChange={handleMultiplePortfolioUpload} 
                    />
                    <label htmlFor="portfolio-up" className="flex flex-col items-center gap-4 cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        {isUploading === 'portfolio' ? <Loader2 className="animate-spin" size={32} /> : <UploadCloud size={32} />}
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">Klik untuk Unggah Foto Karya</p>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Bisa pilih banyak foto sekaligus (Auto-Compress)</p>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {portfolio?.map((item: any) => (
                      <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden border border-border group shadow-lg">
                        <Image src={item.imageUrl} alt="Portfolio" fill className="object-cover transition-transform group-hover:scale-110" unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="destructive" size="icon" className="rounded-full h-10 w-10" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'portfolio', item.id))}>
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {portfolio?.length === 0 && (
                      <div className="col-span-full py-20 text-center opacity-20 uppercase font-black tracking-widest text-xs">Belum ada foto hasil karya yang diunggah</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'branding' && (
            <div className="space-y-8">
              <Card className="rounded-3xl border-border bg-card shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2"><Palette size={20} className="text-primary" /> Pilih Tema Website</CardTitle></CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setBusinessInfo({...businessInfo, themeId: theme.id})}
                        className={cn(
                          "relative group flex flex-col gap-3 p-4 rounded-2xl border transition-all hover:scale-105",
                          businessInfo.themeId === theme.id ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border bg-background/40"
                        )}
                      >
                        <div className="flex gap-1 h-14 w-full rounded-lg overflow-hidden border border-border">
                          <div className="flex-1" style={{ backgroundColor: `hsl(${theme.background})` }} />
                          <div className="w-1/3" style={{ backgroundColor: `hsl(${theme.primary})` }} />
                          <div className="w-1/3" style={{ backgroundColor: `hsl(${theme.accent})` }} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-center">{theme.label}</span>
                        {businessInfo.themeId === theme.id && <CheckCircle2 size={18} className="absolute -top-2 -right-2 text-primary bg-background rounded-full shadow-lg" />}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-border bg-card shadow-xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <Label className="text-foreground uppercase font-black text-xs flex items-center gap-2">
                      <Type size={14} className="text-primary" /> Gaya Huruf (Tipografi)
                    </Label>
                    <Select 
                      value={businessInfo.fontFamily} 
                      onValueChange={(val) => setBusinessInfo({...businessInfo, fontFamily: val})}
                    >
                      <SelectTrigger className="rounded-xl h-12 bg-background/50 border-border text-sm font-bold">
                        <SelectValue placeholder="Pilih Font" />
                      </SelectTrigger>
                      <SelectContent>
                        {ETHNIC_FONTS.map((font) => (
                          <SelectItem key={font.name} value={font.name} className="py-3">
                            <span style={{ fontFamily: font.name }} className="text-base">{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-foreground uppercase font-black text-xs">Logo Bisnis</Label>
                    <div className="flex flex-col md:flex-row items-center gap-8 p-8 border-2 border-dashed border-border rounded-3xl bg-background/20">
                      <div className="relative min-h-[8rem] min-w-[8rem] bg-background rounded-2xl overflow-hidden border border-border flex items-center justify-center p-4 shadow-inner">
                        {businessInfo.logoUrl ? (
                          <img src={businessInfo.logoUrl} alt="Logo" className="max-h-full w-auto object-contain" />
                        ) : (
                          <Cpu className="w-16 h-16 opacity-10" />
                        )}
                      </div>
                      <div className="flex-1 space-y-4 w-full">
                        <input type="file" className="hidden" id="logo-up" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                        <Button asChild variant="secondary" className="w-full cursor-pointer h-12 rounded-xl font-bold shadow-md"><label htmlFor="logo-up">{isUploading === 'logo' ? '...' : 'Unggah Logo Baru'}</label></Button>
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground"><span>Ukuran Logo</span><span>{businessInfo.logoHeight}px</span></div>
                          <Slider value={[parseInt(businessInfo.logoHeight) || 36]} min={20} max={100} onValueChange={(v) => setBusinessInfo({...businessInfo, logoHeight: v[0].toString()})} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase">Judul Logo</Label><Input value={businessInfo.logoText} onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} className="rounded-xl h-12 bg-background border-border font-bold" /></div>
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase">Sub Judul / Aksen</Label><Input value={businessInfo.logoAccentText} onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} className="rounded-xl h-12 bg-background border-border text-primary font-bold" /></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'hero' && (
            <Card className="rounded-3xl border-border bg-card shadow-xl">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase">Gambar Latar Belakang (Hero Background)</Label>
                  <div className="relative h-72 w-full bg-background rounded-3xl overflow-hidden border border-border group shadow-inner">
                    {businessInfo.heroImageUrl ? (
                      <Image src={businessInfo.heroImageUrl} alt="Hero" fill className="object-cover opacity-60" style={{ objectPosition: `center ${businessInfo.heroImagePosition}` }} unoptimized />
                    ) : (
                      <div className="flex items-center justify-center h-full opacity-10"><Globe size={64} /></div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-sm">
                      <input type="file" className="hidden" id="hero-up" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} />
                      <Button asChild variant="secondary" className="rounded-xl px-8 h-12 font-bold cursor-pointer"><label htmlFor="hero-up">Ganti Background</label></Button>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground"><span>Posisi Gambar Vertikal</span><span>{businessInfo.heroImagePosition}</span></div>
                    <Slider value={[parseInt(businessInfo.heroImagePosition) || 50]} max={100} onValueChange={(v) => setBusinessInfo({...businessInfo, heroImagePosition: `${v[0]}%`})} />
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-border">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Badge Atas</Label><Input value={businessInfo.heroBadge} onChange={(e) => setBusinessInfo({...businessInfo, heroBadge: e.target.value})} className="rounded-xl h-12 bg-background border-border" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Judul Utama (Teks)</Label><Input value={businessInfo.heroTitle} onChange={(e) => setBusinessInfo({...businessInfo, heroTitle: e.target.value})} className="rounded-xl h-12 bg-background border-border font-bold" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Sub-Judul / Deskripsi Hero</Label><Textarea value={businessInfo.heroSubtitle} onChange={(e) => setBusinessInfo({...businessInfo, heroSubtitle: e.target.value})} className="rounded-xl min-h-[120px] bg-background border-border leading-relaxed" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'services' && (
             <div className="space-y-6">
                <Button onClick={handleAddService} size="lg" className="rounded-2xl px-12 h-16 font-black uppercase tracking-widest bg-primary text-primary-foreground hover:scale-105 transition-all shadow-2xl"><Plus className="mr-2" size={24} /> Tambah Layanan</Button>
                <div className="grid md:grid-cols-2 gap-6">
                  {services?.map((s: any) => (
                    <Card key={s.id} className="bg-card rounded-3xl border-border overflow-hidden shadow-lg group hover:shadow-2xl transition-all">
                      <div className="h-44 bg-background/50 relative">
                        {s.imageUrl ? <Image src={s.imageUrl} alt={s.name} fill className="object-cover" unoptimized /> : <div className="flex items-center justify-center h-full opacity-10 font-bold uppercase text-xs">No Image</div>}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <input type="file" className="hidden" id={`s-${s.id}`} accept="image/*" onChange={(e) => handleImageUpload(e, s.id)} />
                          <Button variant="secondary" size="sm" asChild className="rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><label htmlFor={`s-${s.id}`} className="cursor-pointer">Ubah</label></Button>
                          <Button variant="destructive" size="icon" className="rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id))}><Trash2 size={14} /></Button>
                        </div>
                      </div>
                      <CardContent className="p-6 space-y-4">
                        <Input defaultValue={s.name} className="rounded-xl h-12 bg-background border-border font-bold text-lg" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { name: e.target.value })} />
                        <Input defaultValue={s.price} className="rounded-xl h-12 bg-background border-border font-bold text-primary" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { price: e.target.value })} />
                        <Textarea defaultValue={s.description} className="rounded-xl min-h-[100px] bg-background border-border text-sm" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { description: e.target.value })} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          )}

          {activeSection === 'contact' && (
            <Card className="rounded-3xl border-border bg-card shadow-xl">
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Nama Bisnis</Label><Input value={businessInfo.name} onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})} className="rounded-xl h-12 bg-background border-border font-bold" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">WhatsApp Admin</Label><Input value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} className="rounded-xl h-12 bg-background border-border font-bold" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Email</Label><Input value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} className="rounded-xl h-12 bg-background border-border font-bold" /></div>
                </div>
                
                <div className="space-y-6 pt-6 border-t border-border">
                  <div className="space-y-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <Label className="text-xs font-black uppercase flex items-center gap-2 text-primary"><Search size={14} /> 1. Cari Lokasi Otomatis</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Nama tempat atau alamat..." value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAutoSearchMap()} className="rounded-xl h-12 bg-background border-border" />
                      <Button onClick={handleAutoSearchMap} className="h-12 w-12 rounded-xl" variant="secondary"><Search size={18} /></Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase flex items-center gap-2"><MapPin size={14} className="text-primary" /> 2. Pratinjau Peta</Label>
                    <div className="rounded-3xl overflow-hidden border border-border h-72 bg-background flex items-center justify-center relative shadow-inner">
                      {businessInfo.mapEmbedUrl && businessInfo.mapEmbedUrl.startsWith('http') ? (
                        <iframe src={businessInfo.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-10 p-6 text-center"><MapIcon size={48} /><span className="text-xs font-black uppercase tracking-widest">Cari lokasi diatas untuk menampilkan peta</span></div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'about' && (
            <Card className="rounded-3xl border-border bg-card shadow-xl">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2"><Label className="text-xs font-bold uppercase">Judul Tentang Kami</Label><Input value={businessInfo.aboutTitle} onChange={(e) => setBusinessInfo({...businessInfo, aboutTitle: e.target.value})} className="rounded-xl h-12 bg-background border-border font-bold" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold uppercase">Konten Tentang Kami</Label><Textarea value={businessInfo.aboutContent} onChange={(e) => setBusinessInfo({...businessInfo, aboutContent: e.target.value})} className="rounded-xl min-h-[250px] bg-background border-border leading-relaxed" /></div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'privacy' && (
            <Card className="rounded-3xl border-border bg-card shadow-xl">
              <CardContent className="p-8 space-y-4">
                <Label className="text-xs font-bold uppercase">Kebijakan Privasi</Label>
                <Textarea value={businessInfo.privacyPolicy} onChange={(e) => setBusinessInfo({...businessInfo, privacyPolicy: e.target.value})} className="rounded-xl min-h-[400px] bg-background border-border text-sm leading-relaxed" />
              </CardContent>
            </Card>
          )}

          {activeSection === 'social' && (
            <Card className="rounded-3xl border-border bg-card shadow-xl">
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase flex items-center gap-2"><Instagram size={14} /> Instagram</Label><Input value={businessInfo.socialInstagram} onChange={(e) => setBusinessInfo({...businessInfo, socialInstagram: e.target.value})} className="rounded-xl h-12 bg-background border-border" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase flex items-center gap-2"><Facebook size={14} /> Facebook</Label><Input value={businessInfo.socialFacebook} onChange={(e) => setBusinessInfo({...businessInfo, socialFacebook: e.target.value})} className="rounded-xl h-12 bg-background border-border" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase flex items-center gap-2"><Youtube size={14} /> Youtube</Label><Input value={businessInfo.socialYoutube} onChange={(e) => setBusinessInfo({...businessInfo, socialYoutube: e.target.value})} className="rounded-xl h-12 bg-background border-border" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase flex items-center gap-2"><Music2 size={14} /> TikTok</Label><Input value={businessInfo.socialTiktok} onChange={(e) => setBusinessInfo({...businessInfo, socialTiktok: e.target.value})} className="rounded-xl h-12 bg-background border-border" /></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
