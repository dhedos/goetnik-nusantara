
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Tampilkan detail error di console log untuk bantuan teknis
      console.error('Firestore Permission Denied:', {
        path: error.context.path,
        operation: error.context.operation,
      });

      // Jangan tampilkan toast mengganggu ke pengunjung jika path adalah 'main'
      // karena biasanya itu hanya masalah propagasi rules awal.
      if (!error.context.path.includes('main')) {
        toast({
          variant: "destructive",
          title: "Koneksi Terbatas",
          description: `Gagal mengakses data. Silakan refresh halaman atau pastikan data sudah dipublikasikan.`,
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
