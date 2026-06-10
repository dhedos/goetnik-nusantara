
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

      // Jangan menghentikan aplikasi (throw error) untuk operasi READ (get/list)
      // agar website tetap bisa tampil meskipun rules sedang diupdate.
      if (process.env.NODE_ENV === 'development') {
        if (error.context.operation !== 'get' && error.context.operation !== 'list') {
          throw new Error(
            `Firestore Permission Denied:\nPath: ${error.context.path}\nOperation: ${error.context.operation}\n\nPastikan Security Rules Anda mengizinkan operasi ini.`
          );
        }
      }

      // Tampilkan notifikasi kecil di pojok layar saja
      toast({
        variant: "destructive",
        title: "Akses Dibatasi",
        description: `Server menolak akses ke ${error.context.path}. Pastikan Rules sudah di-Publish.`,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
