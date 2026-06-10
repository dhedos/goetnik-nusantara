
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In development, show a toast instead of crashing for non-critical read operations
      if (process.env.NODE_ENV === 'development') {
        console.error('Firestore Permission Error:', error.context);
        
        // Only throw for write operations or specific critical paths to avoid dev-mode crash loops
        if (error.context.operation !== 'get' && error.context.operation !== 'list') {
          throw new Error(
            `Firestore Permission Denied:\nPath: ${error.context.path}\nOperation: ${error.context.operation}\n\nPastikan Security Rules Anda mengizinkan operasi ini.`
          );
        }
      }

      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: `Gagal mengakses ${error.context.path}. Periksa Security Rules di Firebase Console.`,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
