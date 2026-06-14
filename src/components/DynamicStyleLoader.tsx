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

    const root = document.documentElement;

    // 1. Gaya Huruf
    const font = settings.fontFamily || 'Inter';
    const fontValue = `'${font}', sans-serif`;
    root.style.setProperty('--selected-font', fontValue);
    
    const isEthnic = ['Cinzel', 'Almendra', 'Playfair Display', 'Marcellus', 'Lora'].includes(font);
    root.style.setProperty('--font-weight-display', isEthnic ? '700' : '800');

    // 2. Tema & Warna
    const themeId = settings.themeId || 'heritage-red';
    const selectedTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

    root.style.setProperty('--primary', selectedTheme.primary);
    root.style.setProperty('--accent', selectedTheme.accent);
    root.style.setProperty('--background', selectedTheme.background);
    
    const bgParts = selectedTheme.background.split(' ');
    const lValue = parseInt(bgParts[2]);
    const isLight = lValue > 60;
    
    let foreground: string;
    let mutedForeground: string;
    let border: string;
    let input: string;
    let card: string;

    const h = bgParts[0];
    const s = bgParts[1];

    if (isLight) {
      foreground = '20 20% 12%'; 
      mutedForeground = '20 10% 40%'; 
      border = '30 20% 85%'; 
      input = '30 20% 85% / 0.5';
      card = `${h} ${s} ${Math.max(0, lValue - 3)}%`; 
    } else {
      foreground = '210 40% 98%';
      mutedForeground = '215 20% 65%';
      border = '217 19% 27% / 0.15';
      input = '217 19% 27% / 0.1';
      card = `${h} ${s} ${Math.min(100, lValue + 3)}%`; 
    }

    root.style.setProperty('--foreground', foreground);
    root.style.setProperty('--card-foreground', foreground);
    root.style.setProperty('--muted-foreground', mutedForeground);
    root.style.setProperty('--border', border);
    root.style.setProperty('--input', input);
    root.style.setProperty('--card', card);

    // 3. Logo & Dynamic Branding (Favicon, iOS, Android)
    if (settings.logoUrl) {
      root.style.setProperty('--loading-logo', `url(${settings.logoUrl})`);
      root.classList.add('has-loading-logo');
      
      // Update Favicon with a more robust method to force browser refresh
      const updateFavicons = (url: string) => {
        const iconIds = ['dynamic-favicon', 'dynamic-shortcut-icon', 'dynamic-apple-icon'];
        
        iconIds.forEach(id => {
          const oldLink = document.getElementById(id) as HTMLLinkElement;
          const newLink = document.createElement('link');
          newLink.id = id;
          newLink.rel = id === 'dynamic-apple-icon' ? 'apple-touch-icon' : (id === 'dynamic-shortcut-icon' ? 'shortcut icon' : 'icon');
          newLink.href = url;
          if (id === 'dynamic-favicon') newLink.type = 'image/png';
          
          if (oldLink) {
            document.head.removeChild(oldLink);
          }
          document.head.appendChild(newLink);
        });
      };

      updateFavicons(settings.logoUrl);
    }

    // Cache untuk rendering instan saat reload (Head Script)
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
    } catch (e) {}

  }, [settings]);

  return null;
}