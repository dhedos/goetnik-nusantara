'use client';

import { useEffect } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

interface DynamicTitleProps {
  businessId: string;
}

export function DynamicTitle({ businessId }: DynamicTitleProps) {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', businessId, 'settings', 'profile') : null, 
    [firestore, businessId]
  );
  const { data: settings } = useDoc(settingsRef);

  useEffect(() => {
    if (settings?.name) {
      document.title = `${settings.name} | Solusi Profesional`;
    } else {
      document.title = 'Pusat Layanan Digital';
    }
  }, [settings]);

  return null;
}
