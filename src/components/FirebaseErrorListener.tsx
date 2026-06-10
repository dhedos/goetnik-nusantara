
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Tampilkan detail error yang lebih lengkap di console
      console.error('🔥 FIRESTORE ERROR:', {
        message: error.message,
        path: error.context.path,
        operation: error.context.operation,
      });

      // Tampilkan notifikasi kecil di pojok layar
      toast({
        variant: "destructive",
        title: "Akses Terbatas",
        description: `Gagal mengakses ${error.context.path}. Pastikan data sudah dipublikasikan oleh Admin.`,
      });

      // Di mode development, kita beri peringatan lebih keras
      if (process.env.NODE_ENV === 'development') {
        console.warn('Pastikan Security Rules Anda di Firebase Console sudah di-Publish untuk path ini.');
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
