'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      if (error && error.context) {
        const isMainPath = error.context.path.includes('main');
        const isReadOperation = error.context.operation === 'get' || error.context.operation === 'list';
        
        // Abaikan error pembacaan pada jalur utama saat inisialisasi (biasanya transien)
        if (!(isMainPath && isReadOperation)) {
          // Gunakan JSON.stringify agar rincian tidak tampil sebagai {} di log konsol
          console.error('Firestore Access Denied Details:', JSON.stringify({
            path: error.context.path,
            operation: error.context.operation,
            message: error.message
          }, null, 2));

          toast({
            variant: "destructive",
            title: "Akses Ditolak",
            description: `Gagal melakukan ${error.context.operation} pada ${error.context.path}. Pastikan Anda memiliki izin.`,
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