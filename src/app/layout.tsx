
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { DynamicStyleLoader } from '@/components/DynamicStyleLoader';

export const metadata: Metadata = {
  title: 'Pusat Layanan Digital & Service',
  description: 'Solusi profesional untuk kebutuhan teknologi, desain, dan aplikasi Anda.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cinzel:wght@400;700;900&family=Marcellus&family=Almendra:wght@400;700&family=Lora:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = JSON.parse(localStorage.getItem('goetnik-theme-cache'));
                  if (theme) {
                    const root = document.documentElement;
                    if (theme.primary) root.style.setProperty('--primary', theme.primary);
                    if (theme.accent) root.style.setProperty('--accent', theme.accent);
                    if (theme.background) root.style.setProperty('--background', theme.background);
                    if (theme.foreground) root.style.setProperty('--foreground', theme.foreground);
                    if (theme.card) root.style.setProperty('--card', theme.card);
                    if (theme.border) root.style.setProperty('--border', theme.border);
                    if (theme.fontFamily) root.style.setProperty('--selected-font', theme.fontFamily);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
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
