'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

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
  storage: FirebaseStorage | null;
}

export function initializeFirebase(): FirebaseServices {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return { firebaseApp: null, firestore: null, auth: null, storage: null };
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
    
    // Inisialisasi Storage. Jika bucket tidak ada di config, Firebase mungkin akan error saat pemanggilan fungsi storage.
    let storage = null;
    try {
      storage = getStorage(app);
    } catch (e) {
      console.warn("Firebase Storage failed to initialize. Check if bucket is configured.");
    }

    return { firebaseApp: app, firestore, auth, storage };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return { firebaseApp: null, firestore: null, auth: null, storage: null };
  }
}
