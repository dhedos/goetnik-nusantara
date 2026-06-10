
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
  Settings, ShoppingBag, Menu, X, Upload, Instagram, Facebook, Youtube, MapPin, Search, ExternalLink, Copy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { PRIVACY_POLICY_DEFAULT } from '@/lib/constants';

type AdminSection = 'bookings' | 'services' | 'branding' | 'hero' | 'about' | 'contact' | 'privacy';

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
    canFetchData ? collection(firestore, 'businesses', user.uid, 'services') : null, 
    [canFetchData, firestore, user?.uid]
  );
  const { data: services, loading: servicesLoading } = useCollection(servicesQuery);

  const bookingsQuery = useMemoFirebase(() => 
    canFetchData ? collection(firestore, 'businesses', user.uid, 'bookings') : null, 
    [canFetchData, firestore, user?.uid]
  );
  const { data: bookings, loading: bookingsLoading } = useCollection(bookingsQuery);

  const settingsRef = useMemoFirebase(() => 
    canFetchData ? doc(firestore, 'businesses', user.uid, 'settings', 'profile') : null, 
    [canFetchData, firestore, user?.uid]
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
    addDoc(colRef, {
      name: 'Layanan Baru',
      price: 'Rp 0',
      description: 'Deskripsi...',
      iconName: 'Monitor',
      imageUrl: '',
      features: ['Fitur 1'],
      ownerId: user.uid,
      createdAt: serverTimestamp()
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
    { id: 'contact', label: 'Kontak & Alamat', icon: Phone },
    { id: 'privacy', label: 'Kebijakan Privasi', icon: Shield },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 transform md:relative md:translate-x-0 shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
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
            <Button onClick={handleSaveBusinessInfo}><Save className="mr-2" size={18} /> Simpan</Button>
          </div>

          {activeSection === 'bookings' && (
            <Card>
              <CardHeader><CardTitle>Daftar Pesanan Masuk</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {bookings?.map((b: any) => (
                  <div key={b.id} className="flex justify-between p-4 border rounded-lg">
                    <div><p className="font-bold">{b.fullName}</p><p className="text-sm text-muted-foreground">{b.service} - {b.whatsapp}</p></div>
                    <Badge>{b.status}</Badge>
                  </div>
                ))}
                {!bookings?.length && <p className="text-center text-muted-foreground">Belum ada pesanan.</p>}
              </CardContent>
            </Card>
          )}

          {activeSection === 'services' && (
             <div className="space-y-6">
                <Button onClick={handleAddService}><Plus className="mr-2" /> Tambah Layanan</Button>
                <div className="grid md:grid-cols-2 gap-4">
                  {services?.map((s: any) => (
                    <Card key={s.id}>
                      <CardContent className="p-4 space-y-4">
                        <Input defaultValue={s.name} onBlur={(e) => updateDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id), { name: e.target.value })} />
                        <Input defaultValue={s.price} onBlur={(e) => updateDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id), { price: e.target.value })} />
                        <Button variant="destructive" size="sm" onClick={() => deleteDoc(doc(firestore!, 'businesses', user.uid, 'services', s.id))}>Hapus</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          )}

          {activeSection === 'branding' && (
            <Card><CardContent className="p-6 space-y-4">
              <Label>Logo Bisnis</Label>
              <Input type="file" onChange={(e) => handleImageUpload(e, 'logo')} />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Teks Logo" value={businessInfo.logoText} onChange={(e) => setBusinessInfo({...businessInfo, logoText: e.target.value})} />
                <Input placeholder="Aksen Teks" value={businessInfo.logoAccentText} onChange={(e) => setBusinessInfo({...businessInfo, logoAccentText: e.target.value})} />
              </div>
            </CardContent></Card>
          )}
          
          {/* Section lain menyesuaikan pola businessInfo... */}
        </div>
      </main>
    </div>
  );
}
