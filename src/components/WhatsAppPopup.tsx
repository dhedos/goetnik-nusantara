
"use client";

import { MessageCircle } from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { OWNER_WHATSAPP_DEFAULT } from '@/lib/constants';

export function WhatsAppPopup() {
  const firestore = useFirestore();
  const { data: settings } = useDoc(firestore ? doc(firestore, 'settings', 'business') : null);
  
  const whatsappNumber = settings?.whatsapp || OWNER_WHATSAPP_DEFAULT;
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all hover:scale-110 hover:bg-[#128C7E] active:scale-95 group"
      aria-label="Chat WhatsApp"
    >
      <div className="absolute -top-12 right-0 hidden whitespace-nowrap rounded-lg bg-card px-3 py-1 text-sm font-medium text-foreground shadow-lg border border-border group-hover:block animate-in fade-in slide-in-from-bottom-2">
        Hubungi Kami via WhatsApp
      </div>
      <MessageCircle size={32} className="fill-current" />
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-20"></span>
    </a>
  );
}
