
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
    const fontValue = `'${font}', sans-serif`;
    document.documentElement.style.setProperty('--selected-font', fontValue);
    
    const isEthnic = ['Cinzel', 'Almendra', 'Playfair Display', 'Marcellus', 'Lora'].includes(font);
    document.documentElement.style.setProperty('--font-weight-display', isEthnic ? '700' : '800');

    // 2. Handle Theme
    const themeId = settings.themeId || 'heritage-red';
    const selectedTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

    document.documentElement.style.setProperty('--primary', selectedTheme.primary);
    document.documentElement.style.setProperty('--accent', selectedTheme.accent);
    document.documentElement.style.setProperty('--background', selectedTheme.background);
    
    const bgParts = selectedTheme.background.split(' ');
    const lValue = parseInt(bgParts[2]);
    const isLight = lValue > 60;
    
    let foreground = isLight ? '222 47% 11%' : '210 40% 98%';
    let mutedForeground = isLight ? '215 16% 47%' : '215 20% 65%';
    let border = isLight ? '214 32% 91%' : '217 19% 27% / 0.15';
    let input = isLight ? '214 32% 91%' : '217 19% 27% / 0.1';
    
    const h = bgParts[0];
    const s = bgParts[1];
    const lCard = isLight ? lValue - 4 : lValue + 3;
    let card = `${h} ${s} ${lCard}%`;

    document.documentElement.style.setProperty('--foreground', foreground);
    document.documentElement.style.setProperty('--card-foreground', foreground);
    document.documentElement.style.setProperty('--muted-foreground', mutedForeground);
    document.documentElement.style.setProperty('--border', border);
    document.documentElement.style.setProperty('--input', input);
    document.documentElement.style.setProperty('--card', card);

    // Save to Cache for instant reload
    try {
      localStorage.setItem('goetnik-theme-cache', JSON.stringify({
        primary: selectedTheme.primary,
        accent: selectedTheme.accent,
        background: selectedTheme.background,
        foreground,
        card,
        border,
        fontFamily: fontValue
      }));
    } catch (e) {}

  }, [settings]);

  return null;
}
