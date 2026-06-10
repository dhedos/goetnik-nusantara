
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In development, this will trigger the Next.js error overlay with context
      if (process.env.NODE_ENV === 'development') {
        throw new Error(
          `Firestore Permission Denied:\nPath: ${error.context.path}\nOperation: ${error.context.operation}\n\nPastikan Security Rules Anda mengizinkan operasi ini.`
        );
      } else {
        toast({
          variant: "destructive",
          title: "Izin Ditolak",
          description: "Anda tidak memiliki izin untuk melakukan operasi ini.",
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
