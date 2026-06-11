
'use client';

import { useEffect } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

interface DynamicFontLoaderProps {
  businessId: string;
}

export function DynamicFontLoader({ businessId }: DynamicFontLoaderProps) {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', businessId, 'settings', 'profile') : null, 
    [firestore, businessId]
  );
  const { data: settings } = useDoc(settingsRef);

  useEffect(() => {
    const font = settings?.fontFamily || 'Inter';
    // Menetapkan variabel CSS global untuk font yang dipilih
    document.documentElement.style.setProperty('--selected-font', `'${font}', sans-serif`);
    
    // Khusus untuk font etnik nusantara yang berat serf-nya
    if (['Cinzel', 'Almendra', 'Playfair Display', 'Marcellus', 'Lora'].includes(font)) {
      document.documentElement.style.setProperty('--font-weight-display', '700');
    } else {
      document.documentElement.style.setProperty('--font-weight-display', '800');
    }
  }, [settings]);

  return null;
}
