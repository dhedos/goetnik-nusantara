
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      if (error && error.context) {
        // Log detail ke konsol dengan format yang jelas untuk debugging
        // Kita menggunakan stringify untuk memastikan objek tidak tampil kosong di konsol beberapa browser
        console.error('Firestore Access Denied Details:', JSON.stringify({
          path: error.context.path,
          operation: error.context.operation,
          message: error.message
        }, null, 2));

        // Abaikan notifikasi toast untuk path 'main' karena seringkali hanya delay propagasi rules di awal
        // atau saat auth sedang diinisialisasi.
        const isMainPath = error.context.path.includes('main');
        
        if (!isMainPath) {
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
