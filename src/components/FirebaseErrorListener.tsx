
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      if (error && error.context) {
        // Log detail ke konsol dengan format yang jelas
        console.error('Firestore Access Denied:', {
          path: error.context.path,
          operation: error.context.operation,
          message: error.message
        });

        // Abaikan notifikasi untuk path 'main' karena seringkali hanya delay propagasi rules
        if (!error.context.path.includes('main')) {
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
