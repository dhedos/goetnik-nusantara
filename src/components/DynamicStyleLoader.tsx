
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
    const themeId = settings.themeId || 'heritage-red';
    const selectedTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

    document.documentElement.style.setProperty('--primary', selectedTheme.primary);
    document.documentElement.style.setProperty('--accent', selectedTheme.accent);
    document.documentElement.style.setProperty('--background', selectedTheme.background);
    
    // Check contrast for text/foreground
    const bgParts = selectedTheme.background.split(' ');
    const lValue = parseInt(bgParts[2]);
    const isLight = lValue > 60;
    
    // Set Foreground and Muted colors based on background brightness
    if (isLight) {
      document.documentElement.style.setProperty('--foreground', '20 20% 10%');
      document.documentElement.style.setProperty('--card-foreground', '20 20% 10%');
      document.documentElement.style.setProperty('--muted-foreground', '20 10% 40%');
      document.documentElement.style.setProperty('--border', '40 20% 80%');
      document.documentElement.style.setProperty('--input', '40 20% 85%');
    } else {
      document.documentElement.style.setProperty('--foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--card-foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--muted-foreground', '215 20.2% 65.1%');
      document.documentElement.style.setProperty('--border', '0 0% 20%');
      document.documentElement.style.setProperty('--input', '0 0% 15%');
    }

    // Update card background for subtle contrast
    const h = bgParts[0];
    const s = bgParts[1];
    const l = isLight ? lValue - 5 : lValue + 4;
    document.documentElement.style.setProperty('--card', `${h} ${s} ${l}%`);

  }, [settings]);

  return null;
}
