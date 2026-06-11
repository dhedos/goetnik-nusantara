
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
  Settings, ShoppingBag, ExternalLink, Cpu, MapPin, Mail, Instagram, Facebook, Youtube, Music2, CheckCircle2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PRIVACY_POLICY_DEFAULT, BUSINESS_NAME_DEFAULT, BUSINESS_ADDRESS_DEFAULT, BUSINESS_EMAIL_DEFAULT, OWNER_WHATSAPP_DEFAULT, MAIN_BUSINESS_ID } from '@/lib/constants';

type AdminSection = 'bookings' | 'services' | 'branding' | 'hero' | 'about' | 'contact' | 'social' | 'privacy';

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
  
  const canFetchData = !!(firestore && user);

  const servicesQuery = useMemoFirebase(() => 
    canFetchData ? collection(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services') : null, 
    [canFetchData, firestore]
  );
  const { data: services } = useCollection(servicesQuery);

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
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (settings) {
      setBusinessInfo(prev => ({
        ...prev,
        ...settings,
      }));
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
          description: "Semua perubahan telah diterapkan ke website secara otomatis." 
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
        toast({ 
          variant: "destructive",
          title: "Gagal Menyimpan", 
          description: "Periksa koneksi internet atau izin akses Anda." 
        });
      });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'hero' | string) => {
    const file = e.target.files?.[0];
    if (!file || !user || !firestore) return;

    if (file.size > 1024 * 1024) { 
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
        const docRef = doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'services', target);
        updateDoc(docRef, { imageUrl: base64String });
      }
      setIsUploading(null);
      toast({ title: "Gambar Dimuat", description: "Klik 'Simpan Semua' untuk menyimpan permanen." });
    };
    reader.readAsDataURL(file);
  };

  const handleAddService = () => {
    if (!firestore || !user) return;
    const colRef = collection(firestore, 'businesses', MAIN_BUSINESS_ID, 'services');
    const newService = {
      name: 'Layanan Baru',
      price: 'Rp 0',
      description: 'Deskripsi layanan Anda...',
      iconName: 'Monitor',
      imageUrl: '',
      features: ['Fitur Utama'],
      ownerId: user.uid,
      createdAt: serverTimestamp()
    };
    addDoc(colRef, newService);
    toast({ title: "Layanan Ditambahkan", description: "Layanan baru muncul di daftar." });
  };

  const viewPublicSite = () => {
    window.open(window.location.origin, '_blank');
  };

  if (authLoading || !isMounted) return <div className="flex h-screen items-center justify-center bg-[#0B1120]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return null;

  const navItems = [
    { id: 'bookings', label: 'Pesanan', icon: ShoppingBag },
    { id: 'services', label: 'Layanan', icon: Settings },
    { id: 'branding', label: 'Logo & Teks', icon: Layout },
    { id: 'hero', label: 'Banner Utama', icon: Globe },
    { id: 'about', label: 'Tentang Kami', icon: Info },
    { id: 'contact', label: 'Kontak & Peta', icon: MapPin },
    { id: 'social', label: 'Media Sosial', icon: Instagram },
    { id: 'privacy', label: 'Privasi', icon: Shield },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1120] text-foreground">
      <aside className="w-64 bg-card border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-black text-primary tracking-tighter uppercase italic">PANEL ADMIN</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveSection(item.id as AdminSection)} 
              className={cn(
                "flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all", 
                activeSection === item.id ? "bg-primary text-white" : "hover:bg-white/5 text-muted-foreground"
              )}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <Button variant="outline" className="w-full gap-2 rounded-xl text-xs" onClick={viewPublicSite}><ExternalLink size={14} /> Lihat Website</Button>
          <Button variant="destructive" className="w-full gap-2 rounded-xl text-xs" onClick={handleLogout}><LogOut size={14} /> Keluar</Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-[#0B1120]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-black italic uppercase text-white">{activeSection}</h1>
            <div className="flex flex-col items-end gap-2">
              <Button onClick={handleSaveBusinessInfo} size="lg" className="rounded-xl px-8 h-12 font-bold shadow-xl" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={20} />}
                Simpan Semua
              </Button>
              {lastSaved && (
                <div className="flex items-center gap-1.5 text-[10px] text-primary font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
                  <CheckCircle2 size={12} />
                  Tersimpan: {lastSaved.toLocaleTimeString('id-ID')}
                </div>
              )}
            </div>
          </div>

          {activeSection === 'bookings' && (
            <Card className="rounded-3xl border-white/5 bg-card/50 overflow-hidden">
              <CardHeader className="p-6 border-b border-white/5"><CardTitle>Pesanan Masuk</CardTitle></CardHeader>
              <CardContent className="p-6 space-y-4">
                {bookings?.map((b: any) => (
                  <div key={b.id} className="flex justify-between items-center p-4 border border-white/5 rounded-2xl bg-background/30">
                    <div>
                      <p className="font-bold text-white">{b.fullName}</p>
                      <p className="text-sm text-muted-foreground">{b.service} - {b.whatsapp}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'bookings', b.id))}><Trash2 size={18} /></Button>
                  </div>
                ))}
                {bookings?.length === 0 && <p className="text-center text-muted-foreground py-10">Belum ada pesanan.</p>}
              </CardContent>
            </Card>
          )}

          {activeSection === 'branding' && (
            <Card className="rounded-3xl border-white/5 bg-card/50">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label className="text-white uppercase font-bold text-xs">Logo Bisnis</Label>
                  <div className="flex items-center gap-6 p-6 border-2 border-dashed border-white/10 rounded-3xl bg-background/20">
                    <div className="relative h-24 w-24 bg-[#0B1120] rounded-xl overflow-hidden border border-white/5">
                      {businessInfo.logoUrl ? <Image src={businessInfo.logoUrl} alt="Logo" fill className="object-contain p-2" unoptimized /> : <Cpu className="w-full h-full p-6 opacity-20" />}
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm text-muted-foreground">Upload PNG/JPG max 1MB.</p>
                      <input type="file" className="hidden" id="logo-up" onChange={(e) => handleImageUpload(e, 'logo')} />
                      <Button asChild variant="secondary" className="cursor-pointer h-10 px-6 rounded-xl font-bold"><label htmlFor="logo-up">{isUploading === 'logo' ? '...' : 'Pilih File'}</label></Button>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Nama Logo (Putih)</Label><Input value={businessInfo.logoText} onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Nama Aksen (Biru)</Label><Input value={businessInfo.logoAccentText} onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5 text-primary" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'hero' && (
            <Card className="rounded-3xl border-white/5 bg-card/50">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase">Gambar Banner (Hero)</Label>
                  <div className="relative h-48 w-full bg-[#0B1120] rounded-2xl overflow-hidden border border-white/5">
                    {businessInfo.heroImageUrl ? <Image src={businessInfo.heroImageUrl} alt="Hero" fill className="object-cover opacity-50" unoptimized /> : <Globe className="w-full h-full p-20 opacity-10" />}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <input type="file" className="hidden" id="hero-up" onChange={(e) => handleImageUpload(e, 'hero')} />
                      <Button asChild variant="secondary" className="cursor-pointer shadow-2xl rounded-xl"><label htmlFor="hero-up">{isUploading === 'hero' ? '...' : 'Ganti Banner'}</label></Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Badge Hero</Label><Input value={businessInfo.heroBadge} onChange={(e) => setBusinessInfo({...businessInfo, heroBadge: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Judul Hero</Label><Input value={businessInfo.heroTitle} onChange={(e) => setBusinessInfo({...businessInfo, heroTitle: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Sub-judul Hero</Label><Textarea value={businessInfo.heroSubtitle} onChange={(e) => setBusinessInfo({...businessInfo, heroSubtitle: e.target.value})} className="rounded-xl min-h-[100px] bg-background/50 border-white/5" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'about' && (
            <Card className="rounded-3xl border-white/5 bg-card/50">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2"><Label className="text-xs font-bold uppercase">Judul Tentang Kami</Label><Input value={businessInfo.aboutTitle} onChange={(e) => setBusinessInfo({...businessInfo, aboutTitle: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                <div className="space-y-2"><Label className="text-xs font-bold uppercase">Konten Tentang Kami</Label><Textarea value={businessInfo.aboutContent} onChange={(e) => setBusinessInfo({...businessInfo, aboutContent: e.target.value})} className="rounded-xl min-h-[200px] bg-background/50 border-white/5" /></div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'contact' && (
            <Card className="rounded-3xl border-white/5 bg-card/50">
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Nama Bisnis</Label><Input value={businessInfo.name} onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Nomor WhatsApp Admin (62xxx)</Label><Input value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Email Bisnis</Label><Input value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase">Alamat Lengkap</Label><Input value={businessInfo.address} onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                </div>
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase flex items-center gap-2"><MapPin size={14} /> Link Embed Google Maps (Src Iframe)</Label><Input placeholder="https://www.google.com/maps/embed?pb=..." value={businessInfo.mapEmbedUrl} onChange={(e) => setBusinessInfo({...businessInfo, mapEmbedUrl: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase flex items-center gap-2"><Globe size={14} /> Link Google Maps Langsung</Label><Input placeholder="https://maps.app.goo.gl/..." value={businessInfo.mapDirectUrl} onChange={(e) => setBusinessInfo({...businessInfo, mapDirectUrl: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'social' && (
            <Card className="rounded-3xl border-white/5 bg-card/50">
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase flex items-center gap-2"><Instagram size={14} /> Link Instagram</Label><Input value={businessInfo.socialInstagram} onChange={(e) => setBusinessInfo({...businessInfo, socialInstagram: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase flex items-center gap-2"><Facebook size={14} /> Link Facebook</Label><Input value={businessInfo.socialFacebook} onChange={(e) => setBusinessInfo({...businessInfo, socialFacebook: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase flex items-center gap-2"><Youtube size={14} /> Link Youtube</Label><Input value={businessInfo.socialYoutube} onChange={(e) => setBusinessInfo({...businessInfo, socialYoutube: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase flex items-center gap-2"><Music2 size={14} /> Link TikTok</Label><Input value={businessInfo.socialTiktok} onChange={(e) => setBusinessInfo({...businessInfo, socialTiktok: e.target.value})} className="rounded-xl h-12 bg-background/50 border-white/5" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'privacy' && (
            <Card className="rounded-3xl border-white/5 bg-card/50">
              <CardContent className="p-8 space-y-4">
                <Label className="text-xs font-bold uppercase">Kebijakan Privasi</Label>
                <Textarea value={businessInfo.privacyPolicy} onChange={(e) => setBusinessInfo({...businessInfo, privacyPolicy: e.target.value})} className="rounded-xl min-h-[400px] bg-background/50 border-white/5 leading-relaxed" />
              </CardContent>
            </Card>
          )}

          {activeSection === 'services' && (
             <div className="space-y-6">
                <Button onClick={handleAddService} size="lg" className="rounded-xl px-10 h-14 font-bold bg-white text-black hover:bg-white/90 shadow-xl"><Plus className="mr-2" size={24} /> Tambah Layanan Baru</Button>
                <div className="grid md:grid-cols-2 gap-6">
                  {services?.map((s: any) => (
                    <Card key={s.id} className="bg-card/50 rounded-3xl border-white/5 overflow-hidden">
                      <div className="h-40 bg-muted/20 relative">
                        {s.imageUrl ? <Image src={s.imageUrl} alt={s.name} fill className="object-cover" unoptimized /> : <div className="w-full h-full flex items-center justify-center text-xs opacity-10">NO IMAGE</div>}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <input type="file" className="hidden" id={`s-${s.id}`} onChange={(e) => handleImageUpload(e, s.id)} />
                          <Button variant="secondary" size="sm" asChild className="rounded-full h-8"><label htmlFor={`s-${s.id}`} className="cursor-pointer">{isUploading === s.id ? '...' : 'Ganti Gambar'}</label></Button>
                          <Button variant="destructive" size="icon" className="rounded-full h-8 w-8" onClick={() => deleteDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id))}><Trash2 size={14} /></Button>
                        </div>
                      </div>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold opacity-50">Nama Layanan</Label>
                          <Input defaultValue={s.name} className="rounded-lg h-10 bg-background/50 font-bold" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold opacity-50">Harga Mulai</Label>
                          <Input defaultValue={s.price} className="rounded-lg h-10 bg-background/50 text-primary font-bold" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { price: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold opacity-50">Deskripsi Singkat</Label>
                          <Textarea defaultValue={s.description} className="rounded-lg min-h-[80px] bg-background/50 text-xs" onBlur={(e) => updateDoc(doc(firestore!, 'businesses', MAIN_BUSINESS_ID, 'services', s.id), { description: e.target.value })} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
