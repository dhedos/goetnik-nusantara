import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { DynamicStyleLoader } from '@/components/DynamicStyleLoader';

export const metadata: Metadata = {
  title: 'Pusat Layanan Digital & Service',
  description: 'Solusi profesional untuk kebutuhan teknologi, desain, dan aplikasi Anda.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cinzel:wght@400;700;900&family=Marcellus&family=Almendra:wght@400;700&family=Lora:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const cache = localStorage.getItem('goetnik-theme-cache');
                  if (cache) {
                    const theme = JSON.parse(cache);
                    const root = document.documentElement;
                    
                    if (theme.primary) root.style.setProperty('--primary', theme.primary);
                    if (theme.accent) root.style.setProperty('--accent', theme.accent);
                    if (theme.background) root.style.setProperty('--background', theme.background);
                    if (theme.fontFamily) root.style.setProperty('--selected-font', theme.fontFamily);
                    
                    if (theme.logoUrl) {
                      const updateIcon = (url) => {
                        const existingIcons = document.querySelectorAll("link[rel*='icon']");
                        if (existingIcons.length > 0) {
                          existingIcons.forEach(link => {
                            if (link.getAttribute('href') !== url) {
                              link.setAttribute('href', url);
                            }
                          });
                        } else {
                          const icon = document.createElement('link');
                          icon.rel = 'icon';
                          icon.href = url;
                          document.head.appendChild(icon);
                        }
                      };
                      updateIcon(theme.logoUrl);
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        <FirebaseClientProvider>
          <DynamicStyleLoader businessId="main" />
          {children}
          <FirebaseErrorListener />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
