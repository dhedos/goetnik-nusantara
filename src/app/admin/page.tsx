
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
  Settings, ShoppingBag, Upload, Instagram, Facebook, Youtube, Copy
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
    const docRef = doc(firestore, 'businesses', user.uid, 'settings', 'profile');
    const data = {
      ...businessInfo,
      ownerId: user.uid,
      updatedAt: serverTimestamp()
    };
    
    setDoc(docRef, data, { merge: true })
      .then(() => {
        toast({ title: "Berhasil", description: "Pengaturan telah disimpan." });
      })
      .catch(async (e) => {
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

    if (file.size > 800000) {
      toast({ variant: "destructive", title: "File Terlalu Besar", description: "Maksimal 800KB." });
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
    };
    reader.readAsDataURL(file);
  };

  const handleAddService = () => {
    if (!firestore || !user) return;
    const colRef = collection(firestore, 'businesses', user.uid, 'services');
    const newService = {
      name: 'Layanan Baru',
      price: 'Rp 0',
      description: 'Deskripsi...',
      iconName: 'Monitor',
      imageUrl: '',
      features: ['Fitur 1'],
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
    
    toast({ title: "Berhasil", description: "Layanan ditambahkan." });
  };

  const copyPublicLink = () => {
    if (!user) return;
    const url = `${window.location.origin}?id=${user.uid}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Tautan Disalin", description: "Bagikan tautan ini ke pelanggan Anda." });
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return null;

  const navItems = [
    { id: 'bookings', label: 'Pesanan', icon: ShoppingBag },
    { id: 'services', label: 'Layanan', icon: Settings },
    { id: 'branding', label: 'Branding & Logo', icon: Layout },
    { id: 'hero', label: 'Beranda (Hero)', icon: Globe },
    { id: 'about', label: 'Tentang Kami', icon: Info },
    { id: 'contact', label: 'Kontak & Media Sosial', icon: Phone },
    { id: 'privacy', label: 'Kebijakan Privasi', icon: Shield },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r md:relative md:translate-x-0 shrink-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b"><h2 className="text-xl font-bold text-primary">Bisnis Anda</h2></div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveSection(item.id as AdminSection)} className={cn("flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-medium", activeSection === item.id ? "bg-primary text-primary-foreground" : "hover:bg-accent")}>
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full mb-2 gap-2" onClick={copyPublicLink}><Copy size={16} /> Salin Link Web</Button>
            <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}><LogOut size={18} /> Keluar</Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold capitalize">{activeSection}</h1>
            <Button onClick={handleSaveBusinessInfo}><Save className="mr-2" size={18} /> Simpan Semua</Button>
          </div>

          {(bookingsLoading || servicesLoading || settingsLoading) && (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>
          )}

          {activeSection === 'bookings' && (
            <Card>
              <CardHeader><CardTitle>Daftar Pesanan</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {bookings?.map((b: any) => (
                  <div key={b.id} className="flex justify-between p-4 border rounded-lg bg-background/50">
                    <div>
                      <p className="font-bold">{b.fullName}</p>
                      <p className="text-sm text-muted-foreground">{b.service} - {b.whatsapp}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={b.status === 'Selesai' ? 'default' : 'outline'}>{b.status}</Badge>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteDoc(doc(firestore!, 'businesses', user.uid, 'bookings', b.id))}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
                {!bookings?.length && !bookingsLoading && <p className="text-center text-muted-foreground py-8">Belum ada pesanan masuk.</p>}
              </CardContent>
            </Card>
          )}

          {activeSection === 'services' && (
             <div className="space-y-6">
                <Button onClick={handleAddService}><Plus className="mr-2" size={18} /> Tambah Layanan</Button>
                <div className="grid md:grid-cols-2 gap-4">
                  {services?.map((s: any) => (
                    <Card key={s.id} className="bg-background/50">
                      <CardContent className="p-4 space-y-4">
                        <Input defaultValue={s.name} onBlur={(e) => updateDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id), { name: e.target.value })} />
                        <Input defaultValue={s.price} onBlur={(e) => updateDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id), { price: e.target.value })} />
                        <div className="flex justify-between">
                          <Input type="file" className="hidden" id={`img-${s.id}`} onChange={(e) => handleImageUpload(e, s.id)} />
                          <Button variant="outline" size="sm" asChild><label htmlFor={`img-${s.id}`} className="cursor-pointer">{isUploading === s.id ? 'Loading...' : 'Ganti Gambar'}</label></Button>
                          <Button variant="destructive" size="sm" onClick={() => deleteDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id))}><Trash2 size={14} /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          )}

          {activeSection === 'branding' && (
            <Card><CardContent className="p-6 space-y-6">
              <Label>Logo Bisnis (Gambar)</Label>
              <div className="flex items-center gap-4">
                {businessInfo.logoUrl && <Image src={businessInfo.logoUrl} alt="Logo" width={50} height={50} className="rounded object-contain" unoptimized />}
                <Input type="file" onChange={(e) => handleImageUpload(e, 'logo')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Teks Utama Logo" value={businessInfo.logoText} onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} />
                <Input placeholder="Teks Aksen Logo" value={businessInfo.logoAccentText} onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} />
              </div>
            </CardContent></Card>
          )}

          {activeSection === 'contact' && (
            <Card><CardContent className="p-6 space-y-4">
              <Input placeholder="WhatsApp" value={businessInfo.whatsapp} onChange={(e) => setBusinessInfo({...businessInfo, whatsapp: e.target.value})} />
              <Input placeholder="Email" value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} />
              <Textarea placeholder="Alamat" value={businessInfo.address} onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})} />
              <Input placeholder="Maps Embed URL" value={businessInfo.mapEmbedUrl} onChange={(e) => setBusinessInfo({...businessInfo, mapEmbedUrl: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Instagram URL" value={businessInfo.socialInstagram} onChange={(e) => setBusinessInfo({...businessInfo, socialInstagram: e.target.value})} />
                <Input placeholder="Facebook URL" value={businessInfo.socialFacebook} onChange={(e) => setBusinessInfo({...businessInfo, socialFacebook: e.target.value})} />
              </div>
            </CardContent></Card>
          )}

          {activeSection === 'privacy' && (
            <Card><CardContent className="p-6">
              <Textarea className="min-h-[300px]" value={businessInfo.privacyPolicy} onChange={(e) => setBusinessInfo({...businessInfo, privacyPolicy: e.target.value})} />
            </CardContent></Card>
          )}

          {activeSection === 'hero' && (
            <Card><CardContent className="p-6 space-y-4">
              <Label>Gambar Hero</Label>
              <Input type="file" onChange={(e) => handleImageUpload(e, 'hero')} />
              <Input placeholder="Badge Hero" value={businessInfo.heroBadge} onChange={(e) => setBusinessInfo({...businessInfo, heroBadge: e.target.value})} />
              <Input placeholder="Judul Hero" value={businessInfo.heroTitle} onChange={(e) => setBusinessInfo({...businessInfo, heroTitle: e.target.value})} />
              <Textarea placeholder="Subjudul Hero" value={businessInfo.heroSubtitle} onChange={(e) => setBusinessInfo({...businessInfo, heroSubtitle: e.target.value})} />
            </CardContent></Card>
          )}

          {activeSection === 'about' && (
            <Card><CardContent className="p-6 space-y-4">
              <Input placeholder="Judul Tentang" value={businessInfo.aboutTitle} onChange={(e) => setBusinessInfo({...businessInfo, aboutTitle: e.target.value})} />
              <Textarea className="min-h-[200px]" placeholder="Konten Tentang" value={businessInfo.aboutContent} onChange={(e) => setBusinessInfo({...businessInfo, aboutContent: e.target.value})} />
            </CardContent></Card>
          )}
        </div>
      </main>
    </div>
  );
}
