
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
        
        // Hanya abaikan error JIKA itu adalah operasi pembacaan (get/list) pada jalur utama (saat auth init)
        // Jika itu operasi penulisan (write/create/update) atau pada jalur lain, tampilkan detailnya.
        if (!(isMainPath && isReadOperation)) {
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
