
'use client';

import { useEffect } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { THEMES } from '@/lib/constants';

interface DynamicStyleLoaderProps {
  businessId: string;
}

export function DynamicStyleLoader({ businessId }: DynamicStyleLoaderProps) {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', businessId, 'settings', 'profile') : null, 
    [firestore, businessId]
  );
  const { data: settings } = useDoc(settingsRef);

  useEffect(() => {
    if (!settings) return;

    // 1. Handle Font
    const font = settings.fontFamily || 'Inter';
    document.documentElement.style.setProperty('--selected-font', `'${font}', sans-serif`);
    
    if (['Cinzel', 'Almendra', 'Playfair Display', 'Marcellus', 'Lora'].includes(font)) {
      document.documentElement.style.setProperty('--font-weight-display', '700');
    } else {
      document.documentElement.style.setProperty('--font-weight-display', '800');
    }

    // 2. Handle Theme
    const themeId = settings.themeId || 'deep-sea';
    const selectedTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

    document.documentElement.style.setProperty('--primary', selectedTheme.primary);
    document.documentElement.style.setProperty('--accent', selectedTheme.accent);
    document.documentElement.style.setProperty('--background', selectedTheme.background);
    
    // Update card background based on main background for contrast
    const bgParts = selectedTheme.background.split(' ');
    const h = bgParts[0];
    const s = bgParts[1];
    const l = parseInt(bgParts[2]) + 2;
    document.documentElement.style.setProperty('--card', `${h} ${s} ${l}%`);

  }, [settings]);

  return null;
}
