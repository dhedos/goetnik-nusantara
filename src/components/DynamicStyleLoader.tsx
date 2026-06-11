
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
    
    // Logic for Light vs Dark Text/Borders
    let foreground: string;
    let mutedForeground: string;
    let border: string;
    let input: string;
    let card: string;

    const h = bgParts[0];
    const s = bgParts[1];

    if (isLight) {
      // Light theme adjustments (Vintage Cream etc)
      foreground = '20 20% 12%'; // Warm dark charcoal/espresso
      mutedForeground = '20 10% 40%'; // Soft brown-gray
      border = '30 20% 85%'; // Subtle warm border
      input = '30 20% 85% / 0.5';
      card = `${h} ${s} ${Math.max(0, lValue - 3)}%`; // Slightly darker than BG
    } else {
      // Dark theme adjustments
      foreground = '210 40% 98%';
      mutedForeground = '215 20% 65%';
      border = '217 19% 27% / 0.15';
      input = '217 19% 27% / 0.1';
      card = `${h} ${s} ${Math.min(100, lValue + 3)}%`; // Slightly lighter than BG
    }

    document.documentElement.style.setProperty('--foreground', foreground);
    document.documentElement.style.setProperty('--card-foreground', foreground);
    document.documentElement.style.setProperty('--muted-foreground', mutedForeground);
    document.documentElement.style.setProperty('--border', border);
    document.documentElement.style.setProperty('--input', input);
    document.documentElement.style.setProperty('--card', card);

    // Save to Cache for instant reload (Termasuk logoUrl)
    try {
      localStorage.setItem('goetnik-theme-cache', JSON.stringify({
        primary: selectedTheme.primary,
        accent: selectedTheme.accent,
        background: selectedTheme.background,
        foreground,
        card,
        border,
        fontFamily: fontValue,
        logoUrl: settings.logoUrl || ''
      }));
    } catch (e) {
      console.warn("Gagal menyimpan preferensi tema ke localStorage.");
    }

  }, [settings]);

  return null;
}
