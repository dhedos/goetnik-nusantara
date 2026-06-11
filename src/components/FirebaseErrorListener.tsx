
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      if (error && error.context) {
        // Abaikan notifikasi untuk path 'main' karena seringkali hanya delay propagasi rules di awal
        // atau saat auth sedang diinisialisasi.
        const isMainPath = error.context.path.includes('main');
        
        if (!isMainPath) {
          // Log detail ke konsol hanya untuk error yang bukan transien
          console.error('Firestore Access Denied Details:', JSON.stringify({
            path: error.context.path,
            operation: error.context.operation,
            message: error.message
          }, null, 2));

          toast({
            variant: "destructive",
            title: "Akses Ditolak",
            description: `Gagal mengakses ${error.context.path}. Pastikan Anda memiliki izin.`,
          });
        }
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
