
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
    
    // Set Foreground, Muted, and Border colors based on background brightness
    if (isLight) {
      document.documentElement.style.setProperty('--foreground', '20 30% 12%'); // Dark Brown/Black
      document.documentElement.style.setProperty('--card-foreground', '20 30% 12%');
      document.documentElement.style.setProperty('--muted-foreground', '20 10% 45%'); // Soft Grey
      document.documentElement.style.setProperty('--border', '20 20% 85%'); // Light Border
      document.documentElement.style.setProperty('--input', '20 20% 90%');
    } else {
      document.documentElement.style.setProperty('--foreground', '45 40% 98%'); // Near White Cream
      document.documentElement.style.setProperty('--card-foreground', '45 40% 98%');
      document.documentElement.style.setProperty('--muted-foreground', '45 10% 75%'); // Bright Muted for visibility
      document.documentElement.style.setProperty('--border', '0 0% 100% / 0.15'); // Transparent white border
      document.documentElement.style.setProperty('--input', '0 0% 100% / 0.1');
    }

    // Update card background for subtle contrast
    const h = bgParts[0];
    const s = bgParts[1];
    const l = isLight ? lValue - 6 : lValue + 5;
    document.documentElement.style.setProperty('--card', `${h} ${s} ${l}%`);

  }, [settings]);

  return null;
}
