
'use client';

import { useMemo } from 'react';

/**
 * Hook untuk menstabilkan referensi atau query Firebase.
 * Karena fungsi seperti doc() dan collection() mengembalikan instance baru setiap dipanggil,
 * hook ini memastikan instance yang sama dikembalikan jika dependensi tidak berubah.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps);
}
