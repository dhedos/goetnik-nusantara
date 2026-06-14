'use client';

import { useEffect } from 'react';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { THEMES, MAIN_BUSINESS_ID } from '@/lib/constants';

export function DynamicStyleLoader({ businessId }: { businessId: string }) {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'businesses', MAIN_BUSINESS_ID, 'settings', 'profile') : null, 
    [firestore]
  );
  const { data: settings } = useDoc(settingsRef);

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // 1. Gaya Huruf
    const font = settings.fontFamily || 'Inter';
    const fontValue = `'${font}', sans-serif`;
    root.style.setProperty('--selected-font', fontValue);

    // 2. Tema & Warna
    const themeId = settings.themeId || 'heritage-red';
    const selectedTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

    root.style.setProperty('--primary', selectedTheme.primary);
    root.style.setProperty('--accent', selectedTheme.accent);
    root.style.setProperty('--background', selectedTheme.background);
    
    const bgParts = selectedTheme.background.split(' ');
    const lValue = parseInt(bgParts[2]);
    const isLight = lValue > 60;
    const h = bgParts[0];
    const s = bgParts[1];

    if (isLight) {
      root.style.setProperty('--foreground', '20 20% 12%');
      root.style.setProperty('--card', `${h} ${s} ${Math.max(0, lValue - 3)}%`);
      root.style.setProperty('--border', '30 20% 85%');
    } else {
      root.style.setProperty('--foreground', '210 40% 98%');
      root.style.setProperty('--card', `${h} ${s} ${Math.min(100, lValue + 3)}%`);
      root.style.setProperty('--border', '217 19% 27% / 0.15');
    }

    // 3. Favicon & Logo Cache Sync
    const logoUrl = settings.logoUrl || '';
    if (logoUrl) {
      const updateFavicon = (url: string) => {
        const existingIcons = document.querySelectorAll("link[rel*='icon']");
        if (existingIcons.length > 0) {
          existingIcons.forEach(el => {
            el.setAttribute('href', url);
          });
        } else {
          ['icon', 'apple-touch-icon'].forEach(rel => {
            const newLink = document.createElement('link');
            newLink.rel = rel;
            newLink.href = url;
            document.head.appendChild(newLink);
          });
        }
      };
      updateFavicon(logoUrl);
    }

    // Update Local Cache
    try {
      localStorage.setItem('goetnik-theme-cache', JSON.stringify({
        primary: selectedTheme.primary,
        accent: selectedTheme.accent,
        background: selectedTheme.background,
        fontFamily: fontValue,
        logoUrl: logoUrl
      }));
    } catch (e) {}

  }, [settings]);

  return null;
}
