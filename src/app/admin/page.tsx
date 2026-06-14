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
import { doc, setDoc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp, query, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  Loader2, Plus, Trash2, Save, LogOut, 
  Globe, Layout, Info, Phone, Shield, 
  Settings, ShoppingBag, ExternalLink as ExternalLinkIcon, MapPin, Instagram, Facebook, Youtube, CheckCircle2, Type, Grid3X3, UploadCloud, Link as LinkIcon, ImageIcon, X,
  Menu, Palette, Link as LinkSimpleIcon, ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';
import { PRIVACY_POLICY_DEFAULT, BUSINESS_NAME_DEFAULT, BUSINESS_ADDRESS_DEFAULT, BUSINESS_EMAIL_DEFAULT, OWNER_WHATSAPP_DEFAULT, MAIN_BUSINESS_ID, THEMES, ICON_OPTIONS } from '@/lib/constants';

type AdminSection = 'bookings' | 'services' | 'portfolio' | 'links' | 'branding' | 'hero' | 'about' | 'contact' | 'social' | 'privacy';

const ETHNIC_FONTS = [
  { name: 'Cinzel', label: 'Cinzel (Etnik Nusantara)' },
  { name: 'Marcellus', label: 'Marcellus (Klasik Bersih)' },
  { name: 'Almendra', label: 'Almendra (Etnik Ukiran)' },
  { name: 'Lora', label: 'Lora (Serif Anggun)' },
  { name: 'Playfair Display', label: 'Playfair (Mewah)' },
  { name: 'Inter', label: 'Inter (Modern Standar)' }
];

const PLATFORM_OPTIONS = [
  "Shopee", 
  "Tokopedia", 
  "Lazada", 
  "TikTok Shop", 
  "Pinterest", 
  "Behance", 
  "Dribbble", 
  "GitHub", 
  "Vercel", 
  "Netlify", 
  "CodePen", 
  "LinkedIn", 
  "Website", 
  "Lainnya"
];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<AdminSection>('bookings');
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const hasLoadedSettings = useRef(false);

  // Form states for new items
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
    mapEmbedUrl: '',
    mapDirectUrl: '',
    logoText: '',
    logoAccentText: '',
    logoUrl: '',
    logoHeight: '36',
    fontFamily: 'Inter',
    themeId: 'heritage-red',
    heroBadge: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImageUrl: '',
    heroImagePosition: '50%',
    aboutTitle: 'Tentang Bisnis Kami',
    aboutContent: '',
    servicesSectionBadge: '',
    servicesSectionTitle: 'Layanan Unggulan',
    servicesSectionSubtitle: '',
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
        fontFamily: settings.fontFamily || 'Inter',
        themeId: settings.themeId || 'heritage-red',
        showPhoneNumber: settings.showPhoneNumber ?? false,
        showPortfolioExternalUrl: settings.showPortfolioExternalUrl ?? false,
        footerCopyright: settings.footerCopyright || ''
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
        toast({ title: "Berhasil Disimpan", description: "Perubahan telah diterapkan ke website utama." });
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

  const resizeAndCompressImage = (file: File, isLogo: boolean = false): Promise<string> => {
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
          // Favicons should be small for performance and browser compatibility
          const maxWidth = isLogo ? 256 : 1920; 
          
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context failed'));
          
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // Use PNG for logos to preserve transparency if available
          const format = isLogo ? 'image/png' : 'image/webp';
          const quality = isLogo ? 0.9 : 0.7;
          
          const dataUrl = canvas.toDataURL(format, quality);
          resolve(dataUrl);
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
      const dataUrl = await resizeAndCompressImage(file, isLogo);
      
      if (isLogo) {
        setBusinessInfo(prev => ({ ...prev, logoUrl: dataUrl }));
        // Save logo immediately to database for favicon sync
        const docRef = doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'settings', 'profile');
        await setDoc(docRef, { logoUrl: dataUrl }, { merge: true });
      } else if (target === 'hero') {
        setBusinessInfo(prev => ({ ...prev, heroImageUrl: dataUrl }));
      } else {
        const docRef = doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'services', target);
        await updateDoc(docRef, { imageUrl: dataUrl });
      }
      toast({ title: "Berhasil", description: "Gambar telah dioptimalkan." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal Mengunggah", description: err.message || "Gagal memproses gambar." });
    } finally {
      setIsUploading(null);
    }
  };

  const handleServiceGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, serviceId: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !user || !firestore) return;

    setIsUploading(`gallery-${serviceId}`);
    try {
      for (const file of files) {
        const dataUrl = await resizeAndCompressImage(file);
        const docRef = doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'services', serviceId);
        await updateDoc(docRef, { galleryUrls: arrayUnion(dataUrl) });
      }
      toast({ title: "Berhasil", description: "Foto galeri telah ditambahkan." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal", description: err.message || "Gagal mengunggah foto galeri." });
    } finally {
      setIsUploading(null);
      e.target.value = '';
    }
  };

  const handleRemoveGalleryImage = async (serviceId: string, imageUrl: string) => {
    if (!firestore) return;
    try {
      const docRef = doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'services', serviceId);
      await updateDoc(docRef, { galleryUrls: arrayRemove(imageUrl) });
      toast({ title: "Berhasil", description: "Foto galeri dihapus." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus foto." });
    }
  };

  const handleMultiplePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !user || !firestore) return;

    setIsUploading('portfolio');
    let count = 0;
    try {
      for (const file of files) {
        const dataUrl = await resizeAndCompressImage(file);
        const colRef = collection(firestore, 'businesses', MAIN_BUSINESS_ID, 'portfolio');
        await addDoc(colRef, {
          imageUrl: dataUrl,
          createdAt: serverTimestamp(),
          ownerId: user.uid
        });
        count++;
      }
      toast({ title: "Berhasil", description: `${count} foto portofolio telah diunggah.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal", description: err.message || "Gagal mengunggah foto." });
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
      iconName: 'Laptop',
      imageUrl: '',
      galleryUrls: [],
      features: ['Fitur Layanan'],
      ownerId: user.uid,
      createdAt: serverTimestamp()
    });
  };

  const handleAddLink = async () => {
    if (!firestore || !user || !newLink.title || !newLink.url) return;
    try {
      const colRef = collection(firestore, 'businesses', MAIN_BUSINESS_ID, 'external-links');
      await addDoc(colRef, {
        ...newLink,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewLink({ title: '', url: '', platform: 'Website' });
      toast({ title: "Berhasil", description: "Tautan telah ditambahkan." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menambahkan tautan." });
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
    { id: 'contact', label: 'Alamat & Kontak', icon: MapPin },
    { id: 'privacy', label: 'Privasi', icon: Shield },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-primary tracking-tighter uppercase">PANEL ADMIN</h2>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => { setActiveSection(item.id as AdminSection); setIsSidebarOpen(false); }} 
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
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground transition-colors duration-500" style={{ fontFamily: 'var(--selected-font)' }}>
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <h2 className="text-lg font-black text-primary tracking-tighter uppercase">ADMIN</h2>
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-card border-r border-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col shrink-0">
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background/50">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-foreground">{navItems.find(n => n.id === activeSection)?.label}</h1>
            <div className="flex flex-col items-end gap-2">
              <Button onClick={handleSaveBusinessInfo} size="lg" className="w-full md:w-auto rounded-xl px-10 h-14 font-bold shadow-2xl transition-all active:scale-95" disabled={isSaving}>
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
                  <div key={b.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-border rounded-2xl bg-background/40 hover:bg-background/60 transition-colors gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-lg">{b.fullName}</p>
                      <p className="text-sm text-muted-foreground">{b.service} • {b.whatsapp}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1 italic">{b.notes || 'Tanpa catatan'}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                       <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none rounded-xl h-10 px-4 font-bold"><a href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank">Chat WA</a></Button>
                       <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-10 w-10" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'bookings', b.id))}><Trash2 size={18} /></Button>
                    </div>
                  </div>
                ))}
                {bookings?.length === 0 && <p className="text-center text-muted-foreground py-16 font-medium">Belum ada pesanan terbaru.</p>}
              </CardContent>
            </Card>
          )}

          {activeSection === 'links' && (
            <div className="space-y-6">
              <Card className="rounded-3xl border-border bg-card shadow-xl overflow-hidden">
                <CardHeader className="p-6 border-b border-border"><CardTitle>Tambah Tautan Baru</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase">Judul Tautan</Label>
                      <Input placeholder="Contoh: Toko Shopee" value={newLink.title} onChange={(e) => setNewLink({...newLink, title: e.target.value})} className="rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase">URL Lengkap</Label>
                      <Input placeholder="https://..." value={newLink.url} onChange={(e) => setNewLink({...newLink, url: e.target.value})} className="rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase">Platform</Label>
                      <Select value={newLink.platform} onValueChange={(val) => setNewLink({...newLink, platform: val})}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PLATFORM_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAddLink} className="w-full rounded-xl font-bold"><Plus className="mr-2" size={16} /> Tambahkan Tautan</Button>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {externalLinks?.map((link: any) => (
                  <div key={link.id} className="flex justify-between items-center p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><LinkSimpleIcon size={18} /></div>
                      <div>
                        <p className="font-bold text-sm">{link.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[200px] md:max-w-md">{link.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-secondary rounded-full opacity-60">{link.platform}</span>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'external-links', link.id))}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'portfolio' && (
            <Card className="rounded-3xl border-border bg-card shadow-xl overflow-hidden">
              <CardHeader className="p-8 border-b border-border">
                <CardTitle className="flex items-center gap-2"><Grid3X3 size={20} className="text-primary" /> Galeri Portofolio</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase">Tautan Portofolio Utama (Selengkapnya)</Label>
                    <Switch 
                      checked={businessInfo.showPortfolioExternalUrl} 
                      onCheckedChange={(val) => setBusinessInfo({...businessInfo, showPortfolioExternalUrl: val})}
                    />
                  </div>
                  <Input 
                    placeholder="Contoh: https://pinterest.com/profilanda" 
                    value={businessInfo.portfolioExternalUrl} 
                    onChange={(e) => setBusinessInfo({...businessInfo, portfolioExternalUrl: e.target.value})}
                    className="rounded-xl h-12 bg-background border-border"
                  />
                  <p className="text-[10px] text-muted-foreground italic uppercase font-medium">Link ini akan muncul sebagai tombol "PORTFOLIO KAMI SELENGKAPNYA" di bagian bawah galeri.</p>
                </div>

                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-3xl bg-primary/5 group hover:bg-primary/10 transition-all">
                  <input type="file" id="portfolio-up" className="hidden" multiple accept="image/*" onChange={handleMultiplePortfolioUpload} />
                  <label htmlFor="portfolio-up" className="flex flex-col items-center gap-4 cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      {isUploading === 'portfolio' ? <Loader2 className="animate-spin" size={32} /> : <UploadCloud size={32} />}
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">Klik untuk Unggah Foto Karya</p>
                      <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Bisa pilih banyak foto sekaligus</p>
                    </div>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {portfolio?.map((item: any) => (
                    <div key={item.id} className="relative rounded-2xl overflow-hidden border border-border group shadow-lg bg-card flex flex-col">
                      <div className="relative h-48 w-full">
                        <Image 
                          src={item.imageUrl} 
                          alt="Portfolio" 
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain transition-transform group-hover:scale-105" 
                        />
                        <div className="absolute top-2 right-2">
                           <Button variant="destructive" size="icon" className="rounded-full h-8 w-8 shadow-lg" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'portfolio', item.id))}><Trash2 size={14} /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'branding' && (
            <div className="space-y-8">
              <Card className="rounded-3xl border-border bg-card shadow-xl">
                <CardHeader><CardTitle className="flex items-center gap-2"><Palette size={20} className="text-primary" /> Pilih Tema Website</CardTitle></CardHeader>
                <CardContent className="p-4 md:p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {THEMES.map((theme) => (
                      <button key={theme.id} onClick={() => setBusinessInfo({...businessInfo, themeId: theme.id})} className={cn("relative flex flex-col gap-3 p-4 rounded-2xl border transition-all", businessInfo.themeId === theme.id ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-border bg-background/40")}>
                        <div className="flex gap-1 h-14 w-full rounded-lg overflow-hidden border border-border">
                          <div className="flex-1" style={{ backgroundColor: `hsl(${theme.background})` }} /><div className="w-1/3" style={{ backgroundColor: `hsl(${theme.primary})` }} /><div className="w-1/3" style={{ backgroundColor: `hsl(${theme.accent})` }} />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-center">{theme.label}</span>
                        {businessInfo.themeId === theme.id && <CheckCircle2 size={18} className="absolute -top-2 -right-2 text-primary bg-background rounded-full shadow-lg" />}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-border bg-card shadow-xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <Label className="text-foreground uppercase font-black text-xs flex items-center gap-2"><Type size={14} className="text-primary" /> Gaya Huruf</Label>
                    <select value={businessInfo.fontFamily} onChange={(e) => setBusinessInfo({...businessInfo, fontFamily: e.target.value})} className="w-full rounded-xl h-12 bg-background/50 border-border font-bold px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {ETHNIC_FONTS.map((font) => (<option key={font.name} value={font.name} style={{ fontFamily: font.name }}>{font.label}</option>))}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-foreground uppercase font-black text-xs">Logo Bisnis</Label>
                    <div className="flex flex-col items-center gap-8 p-8 border-2 border-dashed border-border rounded-3xl bg-background/20">
                      <div className="relative min-h-[8rem] min-w-[8rem] rounded-2xl overflow-hidden border border-border flex items-center justify-center p-4 bg-transparent shadow-inner">
                        {businessInfo.logoUrl ? (
                          <img 
                            src={businessInfo.logoUrl} 
                            alt="Logo" 
                            className="object-contain" 
                            style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
                          />
                        ) : (
                          <div className="text-[10px] opacity-20 uppercase font-bold">Logo Belum Diunggah</div>
                        )}
                      </div>
                      <div className="flex-1 space-y-4 w-full">
                        <input type="file" className="hidden" id="logo-up" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                        <Button asChild variant="secondary" className="w-full h-12 rounded-xl font-bold"><label htmlFor="logo-up">{isUploading === 'logo' ? <Loader2 className="animate-spin" /> : 'Unggah Logo Baru'}</label></Button>
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-bold uppercase"><span>Ukuran Logo</span><span>{businessInfo.logoHeight}px</span></div>
                          <Slider value={[parseInt(businessInfo.logoHeight) || 36]} min={20} max={100} onValueChange={(v) => setBusinessInfo({...businessInfo, logoHeight: v[0].toString()})} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6"><div className="space-y-2"><Label className="text-xs font-bold uppercase">Judul Logo</Label><Input value={businessInfo.logoText} onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} className="rounded-xl h-12 bg-background border-border font-bold" /></div><div className="space-y-2"><Label className="text-xs font-bold uppercase">Aksen</Label><Input value={businessInfo.logoAccentText} onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} className="rounded-xl h-12 bg-background border-border text-primary font-bold" /></div></div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'hero' && (
            <Card className="rounded-3xl border-border bg-card shadow-xl">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase">Background Hero</Label>
                  <div className="relative h-72 w-full bg-background rounded-3xl overflow-hidden border border-border group">
                    {businessInfo.heroImageUrl ? <Image src={businessInfo.heroImageUrl} alt="Hero" fill sizes="100vw" className="object-cover opacity-60" style={{ objectPosition: `center ${businessInfo.heroImagePosition}` }} /> : <div className="flex items-center justify-center h-full opacity-10"><Globe size={64} /></div>}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40">
                      <input type="file" className="hidden" id="hero-up" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} />
                      <Button asChild variant="secondary" className="rounded-xl px-8 h-12 font-bold"><label htmlFor="hero-up">{isUploading === 'hero' ? <Loader2 className="animate-spin" /> : 'Ganti Background'}</label></Button>
                    </div>
                  </div>
                  <Slider value={[parseInt(businessInfo.heroImagePosition) || 50]} max={100} onValueChange={(v) => setBusinessInfo({...businessInfo, heroImagePosition: `${v[0]}%`})} />
                </div>
                <div className="space-y-6 pt-4 border-t border-border">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Judul Utama</Label><Input value={businessInfo.heroTitle} onChange={(e) => setBusinessInfo({...businessInfo, heroTitle: e.target.value})} className="rounded-xl h-12 bg-background border-border font-bold" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Deskripsi Hero</Label><Textarea value={businessInfo.heroSubtitle} onChange={(e) => setBusinessInfo({...businessInfo, heroSubtitle: e.target.value})} className="rounded-xl min-h-[120px] bg-background border-border" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'services' && (
             <div className="space-y-8">
                <Card className="rounded-3xl border-border bg-card shadow-xl">
                  <CardHeader><CardTitle className="text-lg">Pengaturan Seksi Layanan</CardTitle></CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase">Judul Seksi</Label><Input value={businessInfo.servicesSectionTitle} onChange={(e) => setBusinessInfo({...businessInfo, servicesSectionTitle: e.target.value})} className="rounded-xl h-12 font-bold" /></div>
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase">Deskripsi Seksi</Label><Textarea value={businessInfo.servicesSectionSubtitle} onChange={(e) => setBusinessInfo({...businessInfo, servicesSectionSubtitle: e.target.value})} className="rounded-xl h-24" /></div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-xl font-bold uppercase tracking-tight">Daftar Layanan</h3>
                  <Button onClick={handleAddService} size="lg" className="w-full sm:w-auto rounded-2xl px-8 h-12 font-black uppercase bg-primary text-primary-foreground shadow-lg"><Plus className="mr-2" size={18} /> Tambah Layanan</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {services?.map((s: any) => (
                    <Card key={s.id} className="bg-card rounded-3xl border-border overflow-hidden shadow-lg group flex flex-col">
                      <div className="h-56 bg-muted/20 relative overflow-hidden flex items-center justify-center">
                        {s.imageUrl ? (
                          <Image 
                            src={s.imageUrl} 
                            alt={s.name} 
                            fill 
                            sizes="(max-width: 768px) 100vw, 50vw" 
                            className="object-contain transition-transform group-hover:scale-105" 
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                            <ImageIcon size={48} />
                            <span className="uppercase text-[10px] font-black tracking-widest">Utama Belum Ada</span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                          <input type="file" className="hidden" id={`s-main-${s.id}`} accept="image/*" onChange={(e) => handleImageUpload(e, s.id)} />
                          <Button variant="secondary" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity shadow-lg rounded-full px-4"><label htmlFor={`s-main-${s.id}`}>{isUploading === s.id ? <Loader2 className="animate-spin" /> : 'Ganti Utama'}</label></Button>
                          <Button variant="destructive" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shadow-lg h-9 w-9 rounded-full" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id))}><Trash2 size={16} /></Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-6 space-y-6 flex-1">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                             <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Galeri Contoh Gambar</Label>
                             <div className="relative">
                                <input type="file" className="hidden" id={`s-gallery-${s.id}`} multiple accept="image/*" onChange={(e) => handleServiceGalleryUpload(e, s.id)} />
                                <Button variant="outline" size="sm" asChild className="h-7 text-[10px] rounded-lg px-2"><label htmlFor={`s-gallery-${s.id}`}>{isUploading === `gallery-${s.id}` ? <Loader2 className="animate-spin" /> : '+ Tambah Foto'}</label></Button>
                             </div>
                           </div>
                           <div className="grid grid-cols-4 gap-2">
                              {s.galleryUrls?.map((img: string, idx: number) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border group/gal bg-transparent">
                                   <Image 
                                      src={img} 
                                      alt="Gallery" 
                                      fill 
                                      sizes="(max-width: 768px) 25vw, 12vw" 
                                      className="object-contain" 
                                   />
                                   <button 
                                      onClick={() => handleRemoveGalleryImage(s.id, img)}
                                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/gal:opacity-100 transition-opacity"
                                   >
                                      <X size={10} />
                                   </button>
                                </div>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border">
                          <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Nama Layanan</Label><Input defaultValue={s.name} className="rounded-xl h-12 bg-background border-border font-bold" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { name: e.target.value })} /></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Harga / Biaya</Label><Input defaultValue={s.price} className="rounded-xl h-12 bg-background border-border font-bold text-primary" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { price: e.target.value })} /></div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Ikon (Lucide)</Label>
                              <Select defaultValue={s.iconName} onValueChange={(val) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { iconName: val })}>
                                <SelectTrigger className="rounded-xl h-12 bg-background border-border font-bold"><SelectValue /></SelectTrigger>
                                <SelectContent>{ICON_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-1"><Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Deskripsi Singkat</Label><Textarea defaultValue={s.description} className="rounded-xl min-h-[100px] bg-background border-border text-sm leading-relaxed" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { description: e.target.value })} /></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          )}

          {activeSection === 'contact' && (
            <Card className="rounded-3xl border-border bg-card shadow-xl">
              <CardContent className="p-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Nama Bisnis</Label><Input value={businessInfo.name} onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})} className="rounded-xl h-12 bg-background border-border font-bold" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Email</Label><Input value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} className="rounded-xl h-12 bg-background border-border" /></div>
                </div>
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">WhatsApp</Label><Input value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} className="rounded-xl h-12 bg-background border-border font-bold" /></div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><Label className="text-xs font-bold uppercase">No Telp</Label><Switch checked={businessInfo.showPhoneNumber} onCheckedChange={(val) => setBusinessInfo({...businessInfo, showPhoneNumber: val})} /></div>
                    <Input value={businessInfo.phoneNumber} onChange={(e) => setBusinessInfo({...businessInfo, phoneNumber: e.target.value})} className="rounded-xl h-12 bg-background border-border" disabled={!businessInfo.showPhoneNumber} />
                  </div>
                </div>
                <div className="pt-4 border-t border-border space-y-4">
                   <div className="space-y-2">
                     <Label className="text-xs font-bold uppercase">Teks Hak Cipta (Footer Copyright)</Label>
                     <Input 
                       value={businessInfo.footerCopyright} 
                       onChange={(e) => setBusinessInfo({...businessInfo, footerCopyright: e.target.value})} 
                       placeholder="Contoh: © 2024 Goetnik Nusantara. All Rights Reserved." 
                       className="rounded-xl h-12 bg-background border-border" 
                     />
                     <p className="text-[10px] text-muted-foreground italic uppercase">Kosongkan jika ingin menggunakan format otomatis.</p>
                   </div>
                </div>
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
        </div>
      </main>
    </div>
  );
}
