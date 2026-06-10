
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

interface FirebaseServices {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

export function initializeFirebase(): FirebaseServices {
  // Cek apakah API Key tersedia
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn(
      "PERINGATAN: Firebase API Key belum diatur di Environment Variables. " +
      "Fitur database dan login tidak akan berfungsi sampai Anda mengaturnya di .env.local atau Dashboard Vercel."
    );
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    let app: FirebaseApp;
    
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    const firestore = getFirestore(app);
    const auth = getAuth(app);

    return { firebaseApp: app, firestore, auth };
  } catch (error) {
    console.error("Gagal menginisialisasi Firebase:", error);
    return { firebaseApp: null, firestore: null, auth: null };
  }
}
