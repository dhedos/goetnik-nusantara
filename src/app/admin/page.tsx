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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { doc, setDoc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  Loader2, Plus, Trash2, Save, LogOut, 
  Globe, Layout, Info, Phone, Shield, 
  Settings, ShoppingBag, ExternalLink as ExternalLinkIcon, MapPin, CheckCircle2, Grid3X3, UploadCloud, ImageIcon, X,
  Menu, Palette, Link as LinkSimpleIcon, Images, Instagram, Facebook, Youtube, Share2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import { MAIN_BUSINESS_ID, THEMES, ICON_OPTIONS, BUSINESS_NAME_DEFAULT, OWNER_WHATSAPP_DEFAULT, BUSINESS_ADDRESS_DEFAULT, BUSINESS_EMAIL_DEFAULT, PRIVACY_POLICY_DEFAULT } from '@/lib/constants';

type AdminSection = 'bookings' | 'services' | 'portfolio' | 'links' | 'branding' | 'hero' | 'about' | 'contact' | 'privacy';

const ETHNIC_FONTS = [
  { name: 'Cinzel', label: 'Cinzel (Etnik Nusantara)' },
  { name: 'Marcellus', label: 'Marcellus (Klasik Bersih)' },
  { name: 'Almendra', label: 'Almendra (Etnik Ukiran)' },
  { name: 'Lora', label: 'Lora (Serif Anggun)' },
  { name: 'Playfair Display', label: 'Playfair (Mewah)' },
  { name: 'Inter', label: 'Inter (Modern Standar)' }
];

const PLATFORM_OPTIONS = [
  "Shopee", "Tokopedia", "Lazada", "TikTok Shop", 
  "Pinterest", "Behance", "Dribbble", 
  "GitHub", "LinkedIn", "Website", "Lainnya"
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const hasLoadedSettings = useRef(false);

  const [newLink, setNewLink] = useState({ title: '', url: '', platform: 'Website' });
  
  const canFetchData = !!(firestore && user);

  const servicesQuery = useMemoFirebase(() => 
    canFetchData ? query(collection(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services'), orderBy('createdAt', 'desc')) : null, 
    [canFetchData, firestore]
  );
  const { data: services } = useCollection(servicesQuery);

  const portfolioQuery = useMemoFirebase(() => 
    canFetchData ? query(collection(firestore!, 'businesses', MAIN_BUSINESS_ID, 'portfolio'), orderBy('createdAt', 'desc')) : null, 
    [canFetchData, firestore]
  );
  const { data: portfolio } = useCollection(portfolioQuery);

  const bookingsQuery = useMemoFirebase(() => 
    canFetchData ? query(collection(firestore!, 'businesses', MAIN_BUSINESS_ID, 'bookings'), orderBy('createdAt', 'desc')) : null, 
    [canFetchData, firestore]
  );
  const { data: bookings } = useCollection(bookingsQuery);

  const linksQuery = useMemoFirebase(() => 
    canFetchData ? query(collection(firestore!, 'businesses', MAIN_BUSINESS_ID, 'external-links'), orderBy('createdAt', 'desc')) : null, 
    [canFetchData, firestore]
  );
  const { data: externalLinks } = useCollection(linksQuery);

  const settingsRef = useMemoFirebase(() => 
    canFetchData ? doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'settings', 'profile') : null, 
    [canFetchData, firestore]
  );
  const { data: settings } = useDoc(settingsRef);

  const [businessInfo, setBusinessInfo] = useState({
    name: BUSINESS_NAME_DEFAULT,
    whatsapp: OWNER_WHATSAPP_DEFAULT,
    phoneNumber: '',
    showPhoneNumber: false,
    address: BUSINESS_ADDRESS_DEFAULT,
    email: BUSINESS_EMAIL_DEFAULT,
    logoText: 'GOETNIK',
    logoAccentText: 'NUSANTARA',
    logoUrl: '',
    logoHeight: '36',
    fontFamily: 'Cinzel',
    themeId: 'heritage-red',
    heroBadge: 'Layanan Profesional',
    heroTitle: 'Solusi Digital Nusantara Terbaik',
    heroSubtitle: 'Kami menghadirkan layanan teknologi dan desain kreatif dengan sentuhan kearifan lokal untuk bisnis Anda.',
    heroImageUrl: '',
    heroImagePosition: '50%',
    aboutTitle: 'Membangun Masa Depan Digital',
    aboutContent: 'Go Etnik Nusantara adalah mitra strategis Anda dalam menghadapi era transformasi digital. Kami percaya bahwa setiap bisnis memiliki cerita unik yang layak dipresentasikan dengan cara yang istimewa.',
    servicesSectionTitle: 'Layanan Kami',
    servicesSectionSubtitle: 'Pilih paket layanan yang paling sesuai dengan kebutuhan bisnis atau kendala teknis Anda.',
    portfolioSectionTitle: 'Portofolio Kami',
    portfolioSectionSubtitle: 'Beberapa contoh hasil kerja nyata yang telah kami selesaikan dengan sepenuh hati.',
    portfolioExternalUrl: '',
    showPortfolioExternalUrl: false,
    privacyPolicy: PRIVACY_POLICY_DEFAULT,
    footerCopyright: '',
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
        fontFamily: settings.fontFamily || 'Cinzel',
        themeId: settings.themeId || 'heritage-red',
        showPhoneNumber: settings.showPhoneNumber ?? false,
        showPortfolioExternalUrl: settings.showPortfolioExternalUrl ?? false
      }));
      hasLoadedSettings.current = true;
    }
  }, [settings]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
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
        toast({ title: "Berhasil Disimpan", description: "Semua pengaturan telah diterapkan." });
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

  const resizeAndCompressImage = (file: File, quality: number = 0.7, maxWidth: number = 1200): Promise<string> => {
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
          if (!ctx) return reject(new Error('Canvas context failed'));
          
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', quality));
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar.'));
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: string) => {
    const file = e.target.files?.[0];
    if (!file || !user || !firestore) return;
    
    setIsUploading(target);
    try {
      const isLogo = target === 'logo';
      const isHero = target === 'hero';
      const dataUrl = await resizeAndCompressImage(file, isLogo ? 0.9 : 0.7, isLogo ? 128 : 1200);
      
      if (isLogo) {
        setBusinessInfo(prev => ({ ...prev, logoUrl: dataUrl }));
        await setDoc(doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'settings', 'profile'), { logoUrl: dataUrl }, { merge: true });
      } else if (isHero) {
        setBusinessInfo(prev => ({ ...prev, heroImageUrl: dataUrl }));
        await setDoc(doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'settings', 'profile'), { heroImageUrl: dataUrl }, { merge: true });
      } else {
        await updateDoc(doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'services', target), { imageUrl: dataUrl });
      }
      toast({ title: "Berhasil", description: "Gambar telah diperbarui." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal", description: err.message });
    } finally {
      setIsUploading(null);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, serviceId: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !user || !firestore) return;
    
    setIsUploading(`gallery-${serviceId}`);
    try {
      const serviceRef = doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'services', serviceId);
      const serviceSnap = await getDoc(serviceRef);
      const currentGallery = serviceSnap.data()?.galleryUrls || [];
      
      const newDataUrls = [];
      for (const file of files) {
        const dataUrl = await resizeAndCompressImage(file);
        newDataUrls.push(dataUrl);
      }
      
      await updateDoc(serviceRef, {
        galleryUrls: [...currentGallery, ...newDataUrls]
      });
      
      toast({ title: "Berhasil", description: `${files.length} foto ditambahkan ke galeri.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal", description: err.message });
    } finally {
      setIsUploading(null);
    }
  };

  const removeFromGallery = async (serviceId: string, index: number) => {
    if (!firestore) return;
    try {
      const serviceRef = doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'services', serviceId);
      const serviceSnap = await getDoc(serviceRef);
      const currentGallery = serviceSnap.data()?.galleryUrls || [];
      const newGallery = currentGallery.filter((_: any, i: number) => i !== index);
      
      await updateDoc(serviceRef, { galleryUrls: newGallery });
      toast({ title: "Berhasil", description: "Foto dihapus dari galeri." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus foto." });
    }
  };

  if (authLoading || !isMounted) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return null;

  const navItems = [
    { id: 'bookings', label: 'Pesanan', icon: ShoppingBag },
    { id: 'services', label: 'Layanan', icon: Settings },
    { id: 'portfolio', label: 'Portofolio', icon: Grid3X3 },
    { id: 'links', label: 'Tautan Luar', icon: LinkSimpleIcon },
    { id: 'branding', label: 'Logo & Tema', icon: Layout },
    { id: 'hero', label: 'Banner Utama', icon: Globe },
    { id: 'about', label: 'Tentang Kami', icon: Info },
    { id: 'contact', label: 'Kontak & Footer', icon: MapPin },
    { id: 'privacy', label: 'Privasi', icon: Shield },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-black text-primary tracking-tighter uppercase">ADMIN PANEL</h2>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => { setActiveSection(item.id as AdminSection); setIsSidebarOpen(false); }} 
            className={cn(
              "flex items-center w-full gap-3 px-4 py-3 rounded-none text-sm font-bold transition-all", 
              activeSection === item.id ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-primary/10 text-foreground/70"
            )}
          >
            <item.icon size={18} /> {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-border space-y-2">
        <Button variant="outline" className="w-full gap-2 rounded-none text-xs font-bold border-border" onClick={() => window.open(window.location.origin, '_blank')}><ExternalLinkIcon size={14} /> Lihat Website</Button>
        <Button variant="destructive" className="w-full gap-2 rounded-none text-xs font-bold" onClick={handleLogout}><LogOut size={14} /> Keluar</Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground">
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <h2 className="text-lg font-black text-primary tracking-tighter uppercase">ADMIN</h2>
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-card border-r border-border rounded-none">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col shrink-0">
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-foreground">{navItems.find(n => n.id === activeSection)?.label}</h1>
            <div className="flex flex-col items-end gap-2">
              <Button onClick={handleSaveBusinessInfo} size="lg" className="w-full md:w-auto rounded-none px-10 h-14 font-bold shadow-2xl transition-all" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={20} />}
                Simpan Perubahan
              </Button>
              {lastSaved && (
                <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Tersimpan: {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {activeSection === 'bookings' && (
            <Card className="rounded-none border-border bg-card shadow-xl overflow-hidden">
              <CardHeader className="p-6 border-b border-border"><CardTitle>Pesanan Masuk</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-4">
                {bookings?.map((b: any) => (
                  <div key={b.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-border rounded-none bg-background/40 hover:bg-background/60 transition-colors gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-lg">{b.fullName}</p>
                      <p className="text-sm text-muted-foreground">{b.service} • {b.whatsapp}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1 italic">{b.notes || 'Tanpa catatan'}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                       <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none rounded-none h-10 px-4 font-bold"><a href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank">Chat WA</a></Button>
                       <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-10 w-10 rounded-none" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'bookings', b.id))}><Trash2 size={18} /></Button>
                    </div>
                  </div>
                ))}
                {bookings?.length === 0 && <p className="text-center text-muted-foreground py-16 font-medium">Belum ada pesanan terbaru.</p>}
              </CardContent>
            </Card>
          )}

          {activeSection === 'hero' && (
            <Card className="rounded-none border-border bg-card shadow-xl overflow-hidden">
              <CardHeader className="p-8 border-b border-border">
                <CardTitle className="flex items-center gap-2"><Globe size={20} className="text-primary" /> Pengaturan Banner Utama</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Judul Utama (Hero Title)</Label>
                    <Textarea 
                      value={businessInfo.heroTitle} 
                      onChange={(e) => setBusinessInfo({...businessInfo, heroTitle: e.target.value})} 
                      className="rounded-none h-24 text-lg font-bold"
                      placeholder="Judul banner anda..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Sub-judul (Hero Subtitle)</Label>
                    <Textarea 
                      value={businessInfo.heroSubtitle} 
                      onChange={(e) => setBusinessInfo({...businessInfo, heroSubtitle: e.target.value})} 
                      className="rounded-none h-24"
                      placeholder="Deskripsi singkat dibawah judul..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase">Gambar Latar Banner</Label>
                  <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-border rounded-none bg-background/20">
                    <div className="relative h-48 w-full rounded-none overflow-hidden border border-border bg-muted flex items-center justify-center">
                      {businessInfo.heroImageUrl ? (
                        <img src={businessInfo.heroImageUrl} alt="Hero Preview" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="text-[10px] opacity-20 uppercase font-bold text-center p-4">Klik Unggah untuk Gambar Banner</div>
                      )}
                    </div>
                    <div className="w-full space-y-4">
                      <input type="file" className="hidden" id="hero-up" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} />
                      <Button asChild variant="secondary" className="w-full h-12 rounded-none font-bold">
                        <label htmlFor="hero-up">
                          {isUploading === 'hero' ? <Loader2 className="animate-spin" /> : 'Unggah Gambar Banner'}
                        </label>
                      </Button>
                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span>Posisi Gambar Vertikal</span>
                          <span>{businessInfo.heroImagePosition}</span>
                        </div>
                        <Slider 
                          value={[parseInt(businessInfo.heroImagePosition) || 50]} 
                          min={0} 
                          max={100} 
                          onValueChange={(v) => setBusinessInfo({...businessInfo, heroImagePosition: `${v[0]}%`})} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'about' && (
            <Card className="rounded-none border-border bg-card shadow-xl overflow-hidden">
              <CardHeader className="p-8 border-b border-border">
                <CardTitle className="flex items-center gap-2"><Info size={20} className="text-primary" /> Pengaturan Tentang Kami</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Judul Tentang Kami</Label>
                  <Input 
                    value={businessInfo.aboutTitle} 
                    onChange={(e) => setBusinessInfo({...businessInfo, aboutTitle: e.target.value})} 
                    className="rounded-none h-12 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Deskripsi / Konten</Label>
                  <Textarea 
                    value={businessInfo.aboutContent} 
                    onChange={(e) => setBusinessInfo({...businessInfo, aboutContent: e.target.value})} 
                    className="rounded-none min-h-[250px]"
                    placeholder="Ceritakan sejarah atau visi misi anda..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'branding' && (
            <div className="space-y-8">
              <Card className="rounded-none border-border bg-card shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2"><Palette size={20} className="text-primary" /> Pilih Tema Website</CardTitle></CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {THEMES.map((theme) => (
                      <button key={theme.id} onClick={() => setBusinessInfo({...businessInfo, themeId: theme.id})} className={cn("relative flex flex-col gap-3 p-4 rounded-none border transition-all", businessInfo.themeId === theme.id ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border bg-background/40")}>
                        <div className="flex gap-1 h-14 w-full rounded-none overflow-hidden border border-border">
                          <div className="flex-1" style={{ backgroundColor: `hsl(${theme.background})` }} /><div className="w-1/3" style={{ backgroundColor: `hsl(${theme.primary})` }} /><div className="w-1/3" style={{ backgroundColor: `hsl(${theme.accent})` }} />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-center">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-none border-border bg-card shadow-xl">
                <CardContent className="p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-6 p-6 bg-primary/5 rounded-none border border-primary/10">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Teks Logo Header (Kiri)</Label>
                      <Input 
                        value={businessInfo.logoText} 
                        onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} 
                        className="rounded-none h-12 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase">Teks Logo Header (Aksen)</Label>
                      <Input 
                        value={businessInfo.logoAccentText} 
                        onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} 
                        className="rounded-none h-12 font-bold text-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-6 bg-primary/5 rounded-none border border-primary/10">
                    <Label className="text-foreground uppercase font-black text-xs">Pilih Gaya Huruf (Font)</Label>
                    <select value={businessInfo.fontFamily} onChange={(e) => setBusinessInfo({...businessInfo, fontFamily: e.target.value})} className="w-full rounded-none h-12 bg-background/50 border-border font-bold px-3">
                      {ETHNIC_FONTS.map((font) => (<option key={font.name} value={font.name}>{font.label}</option>))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-foreground uppercase font-black text-xs">Logo Bisnis & Ikon Tab Browser</Label>
                    <div className="flex flex-col items-center gap-8 p-8 border-2 border-dashed border-border rounded-none bg-background/20">
                      <div className="relative h-32 w-32 rounded-none overflow-hidden border border-border flex items-center justify-center bg-transparent">
                        {businessInfo.logoUrl ? <img src={businessInfo.logoUrl} alt="Logo" className="object-contain max-h-full max-w-full" /> : <div className="text-[10px] opacity-20 uppercase font-bold text-center">Logo Belum Diunggah</div>}
                      </div>
                      <div className="w-full space-y-4">
                        <input type="file" className="hidden" id="logo-up" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                        <Button asChild variant="secondary" className="w-full h-12 rounded-none font-bold"><label htmlFor="logo-up">{isUploading === 'logo' ? <Loader2 className="animate-spin" /> : 'Unggah Logo Baru'}</label></Button>
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-bold uppercase"><span>Ukuran Logo Header</span><span>{businessInfo.logoHeight}px</span></div>
                          <Slider value={[parseInt(businessInfo.logoHeight) || 36]} min={20} max={100} onValueChange={(v) => setBusinessInfo({...businessInfo, logoHeight: v[0].toString()})} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'portfolio' && (
            <Card className="rounded-none border-border bg-card shadow-xl overflow-hidden">
              <CardHeader className="p-8 border-b border-border">
                <CardTitle className="flex items-center gap-2"><Grid3X3 size={20} className="text-primary" /> Galeri Portofolio</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="p-6 bg-primary/5 rounded-none border border-primary/10 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Judul Seksi Portofolio</Label>
                    <Input 
                      value={businessInfo.portfolioSectionTitle} 
                      onChange={(e) => setBusinessInfo({...businessInfo, portfolioSectionTitle: e.target.value})} 
                      className="rounded-none h-12 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">Deskripsi Seksi Portofolio</Label>
                    <Textarea 
                      value={businessInfo.portfolioSectionSubtitle} 
                      onChange={(e) => setBusinessInfo({...businessInfo, portfolioSectionSubtitle: e.target.value})} 
                      className="rounded-none h-24"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                    <Label className="text-xs font-bold uppercase">Tombol Tautan Portofolio Luar</Label>
                    <Switch checked={businessInfo.showPortfolioExternalUrl} onCheckedChange={(val) => setBusinessInfo({...businessInfo, showPortfolioExternalUrl: val})} />
                  </div>
                  <Input 
                    placeholder="Contoh: pinterest.com/anda" 
                    value={businessInfo.portfolioExternalUrl} 
                    onChange={(e) => setBusinessInfo({...businessInfo, portfolioExternalUrl: e.target.value})}
                    className="rounded-none h-12 bg-background border-border"
                  />
                  <p className="text-[10px] text-muted-foreground italic uppercase">Link ini akan tampil di tombol "Selengkapnya" di bawah daftar foto.</p>
                </div>

                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-none bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer">
                  <input type="file" id="portfolio-up" className="hidden" multiple accept="image/*" onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0 || !user || !firestore) return;
                    setIsUploading('portfolio');
                    for (const file of files) {
                      const dataUrl = await resizeAndCompressImage(file);
                      await addDoc(collection(firestore, 'businesses', MAIN_BUSINESS_ID, 'portfolio'), {
                        imageUrl: dataUrl,
                        createdAt: serverTimestamp(),
                        ownerId: user.uid
                      });
                    }
                    setIsUploading(null);
                    toast({ title: "Berhasil", description: `${files.length} foto ditambahkan.` });
                  }} />
                  <label htmlFor="portfolio-up" className="flex flex-col items-center gap-4 cursor-pointer w-full h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {isUploading === 'portfolio' ? <Loader2 className="animate-spin" size={32} /> : <UploadCloud size={32} />}
                    </div>
                    <p className="font-bold">Klik untuk Unggah Foto Portofolio</p>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {portfolio?.map((item: any) => (
                    <div key={item.id} className="relative rounded-none overflow-hidden border border-border group aspect-square">
                      <img src={item.imageUrl} alt="Portfolio" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="destructive" size="icon" className="rounded-none h-8 w-8" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'portfolio', item.id))}><Trash2 size={14} /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'contact' && (
            <div className="space-y-8">
              <Card className="rounded-none border-border bg-card shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={20} className="text-primary" /> Kontak Bisnis</CardTitle></CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase">Nama Bisnis</Label><Input value={businessInfo.name} onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})} className="rounded-none h-12 font-bold" /></div>
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase">WhatsApp Admin</Label><Input value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} className="rounded-none h-12 font-bold" /></div>
                  </div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Email Bisnis</Label><Input value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} className="rounded-none h-12" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Alamat Kantor / Bisnis</Label><Textarea value={businessInfo.address} onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})} className="rounded-none min-h-[100px]" /></div>
                </CardContent>
              </Card>

              <Card className="rounded-none border-border bg-card shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2"><Share2 size={20} className="text-primary" /> Link Media Sosial</CardTitle></CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2"><Instagram size={14} /> Instagram</Label>
                      <Input 
                        placeholder="Contoh: instagram.com/username" 
                        value={businessInfo.socialInstagram} 
                        onChange={(e) => setBusinessInfo({...businessInfo, socialInstagram: e.target.value})} 
                        className="rounded-none h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2"><Facebook size={14} /> Facebook</Label>
                      <Input 
                        placeholder="Contoh: facebook.com/page" 
                        value={businessInfo.socialFacebook} 
                        onChange={(e) => setBusinessInfo({...businessInfo, socialFacebook: e.target.value})} 
                        className="rounded-none h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2"><Youtube size={14} /> YouTube</Label>
                      <Input 
                        placeholder="Contoh: youtube.com/@channel" 
                        value={businessInfo.socialYoutube} 
                        onChange={(e) => setBusinessInfo({...businessInfo, socialYoutube: e.target.value})} 
                        className="rounded-none h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2">TikTok</Label>
                      <Input 
                        placeholder="Contoh: tiktok.com/@username" 
                        value={businessInfo.socialTiktok} 
                        onChange={(e) => setBusinessInfo({...businessInfo, socialTiktok: e.target.value})} 
                        className="rounded-none h-12"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-none border-border bg-card shadow-xl">
                <CardHeader><CardTitle className="text-sm">Pengaturan Footer</CardTitle></CardHeader>
                <CardContent className="p-8 space-y-4">
                  <div className="space-y-2 pt-4 border-t border-border">
                    <Label className="text-xs font-bold uppercase">Teks Hak Cipta (Footer Copyright)</Label>
                    <Input value={businessInfo.footerCopyright} onChange={(e) => setBusinessInfo({...businessInfo, footerCopyright: e.target.value})} placeholder="Contoh: © 2024 Goetnik Nusantara. Seluruh Hak Cipta Dilindungi." className="rounded-none h-12" />
                    <p className="text-[10px] text-muted-foreground italic">Kosongkan untuk menggunakan format otomatis berdasarkan nama bisnis.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'services' && (
             <div className="space-y-8">
                <Card className="rounded-none border-border bg-card shadow-xl">
                  <CardHeader><CardTitle className="text-lg">Pengaturan Seksi Layanan</CardTitle></CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase">Judul Seksi Layanan</Label><Input value={businessInfo.servicesSectionTitle} onChange={(e) => setBusinessInfo({...businessInfo, servicesSectionTitle: e.target.value})} className="rounded-none h-12 font-bold" /></div>
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase">Deskripsi Seksi</Label><Textarea value={businessInfo.servicesSectionSubtitle} onChange={(e) => setBusinessInfo({...businessInfo, servicesSectionSubtitle: e.target.value})} className="rounded-none h-24" /></div>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold uppercase">Daftar Layanan</h3>
                  <Button onClick={() => {
                    if (!firestore || !user) return;
                    addDoc(collection(firestore, 'businesses', MAIN_BUSINESS_ID, 'services'), {
                      name: 'Layanan Baru',
                      price: 'Rp 0',
                      description: 'Rincian layanan anda...',
                      iconName: 'Laptop',
                      imageUrl: '',
                      galleryUrls: [],
                      features: ['Unggulan Layanan'],
                      ownerId: user.uid,
                      createdAt: serverTimestamp()
                    });
                  }} className="rounded-none px-6 h-12 font-black uppercase"><Plus className="mr-2" size={18} /> Tambah Layanan</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {services?.map((s: any) => (
                    <Card key={s.id} className="bg-card rounded-none border-border overflow-hidden shadow-lg group">
                      <div className="h-56 bg-muted/20 relative flex items-center justify-center overflow-hidden">
                        {s.imageUrl ? <img src={s.imageUrl} alt={s.name} className="absolute inset-0 w-full h-full object-contain" /> : <ImageIcon size={48} className="opacity-10" />}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <input type="file" className="hidden" id={`s-main-${s.id}`} accept="image/*" onChange={(e) => handleImageUpload(e, s.id)} />
                          <Button variant="secondary" size="sm" asChild className="rounded-none"><label htmlFor={`s-main-${s.id}`}>Ubah Gambar Utama</label></Button>
                          <Button variant="destructive" size="icon" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id))} className="rounded-none"><Trash2 size={16} /></Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-6 space-y-6">
                        <div className="space-y-1"><Label className="text-[10px] font-black uppercase opacity-40">Nama Layanan</Label><Input defaultValue={s.name} className="rounded-none h-12 font-bold" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { name: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1"><Label className="text-[10px] font-black uppercase opacity-40">Harga Layanan</Label><Input defaultValue={s.price} className="rounded-none h-12 font-bold text-primary" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { price: e.target.value })} /></div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-black uppercase opacity-40">Pilih Ikon</Label>
                            <Select defaultValue={s.iconName} onValueChange={(val) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { iconName: val })}>
                              <SelectTrigger className="rounded-none h-12 font-bold"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-none">{ICON_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase flex items-center gap-2"><Images size={14} /> Galeri Foto Layanan</Label>
                            <div className="flex gap-2">
                              <input type="file" className="hidden" id={`gallery-up-${s.id}`} multiple accept="image/*" onChange={(e) => handleGalleryUpload(e, s.id)} />
                              <Button asChild variant="outline" size="sm" className="h-8 rounded-none text-[10px] font-bold"><label htmlFor={`gallery-up-${s.id}`}>{isUploading === `gallery-${s.id}` ? <Loader2 className="animate-spin h-3 w-3" /> : 'Tambah Foto'}</label></Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2">
                            {s.galleryUrls?.map((url: string, idx: number) => (
                              <div key={idx} className="relative aspect-square border border-border group/gal rounded-none overflow-hidden">
                                <img src={url} alt={`Gallery ${idx}`} className="absolute inset-0 w-full h-full object-cover" />
                                <button 
                                  onClick={() => removeFromGallery(s.id, idx)}
                                  className="absolute top-1 right-1 h-5 w-5 bg-destructive text-white rounded-none flex items-center justify-center opacity-0 group-hover/gal:opacity-100 transition-opacity"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                            {(!s.galleryUrls || s.galleryUrls.length === 0) && (
                              <div className="col-span-4 py-4 text-center border border-dashed border-border text-[10px] text-muted-foreground uppercase">Galeri masih kosong</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          )}

          {activeSection === 'links' && (
            <div className="space-y-6">
              <Card className="rounded-none border-border bg-card shadow-xl overflow-hidden">
                <CardHeader className="p-6 border-b border-border"><CardTitle>Kelola Tautan Partner</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input placeholder="Nama Toko / Link" value={newLink.title} onChange={(e) => setNewLink({...newLink, title: e.target.value})} className="rounded-none" />
                    <Input placeholder="URL Lengkap (https://...)" value={newLink.url} onChange={(e) => setNewLink({...newLink, url: e.target.value})} className="rounded-none" />
                    <Select value={newLink.platform} onValueChange={(val) => setNewLink({...newLink, platform: val})}>
                      <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-none">{PLATFORM_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button onClick={async () => {
                    if (!firestore || !user || !newLink.title || !newLink.url) return;
                    await addDoc(collection(firestore, 'businesses', MAIN_BUSINESS_ID, 'external-links'), {
                      ...newLink,
                      ownerId: user.uid,
                      createdAt: serverTimestamp()
                    });
                    setNewLink({ title: '', url: '', platform: 'Website' });
                    toast({ title: "Berhasil", description: "Tautan ditambahkan." });
                  }} className="w-full rounded-none font-bold"><Plus className="mr-2" size={16} /> Tambahkan Tautan</Button>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {externalLinks?.map((link: any) => (
                  <div key={link.id} className="flex justify-between items-center p-4 bg-card border border-border rounded-none">
                    <div>
                      <p className="font-bold text-sm">{link.title}</p>
                      <p className="text-[10px] text-muted-foreground">{link.url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-3 py-1 bg-secondary rounded-none">{link.platform}</span>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-none" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'external-links', link.id))}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <Card className="rounded-none border-border bg-card shadow-xl">
              <CardContent className="p-8">
                <Label className="text-xs font-bold uppercase block mb-4">Kebijakan Privasi</Label>
                <Textarea value={businessInfo.privacyPolicy} onChange={(e) => setBusinessInfo({...businessInfo, privacyPolicy: e.target.value})} className="rounded-none min-h-[400px]" />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}