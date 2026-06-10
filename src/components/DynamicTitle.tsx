'use client';

import { useEffect } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

export function DynamicTitle() {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'business') : null, 
    [firestore]
  );
  const { data: settings } = useDoc(settingsRef);

  useEffect(() => {
    if (settings?.name) {
      document.title = `${settings.name} | Solusi Profesional`;
    }
  }, [settings]);

  return null;
}
