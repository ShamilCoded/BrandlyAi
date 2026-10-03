import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { AppConfig } from '@/lib/config/env';

let firebaseAppInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseClientApp(): FirebaseApp | null {
  if (!AppConfig.isCloudFirestoreConfigured()) {
    return null;
  }
  if (firebaseAppInstance) {
    return firebaseAppInstance;
  }
  const config = AppConfig.getFirebaseConfig();
  firebaseAppInstance = getApps().length > 0 ? getApp() : initializeApp(config);
  return firebaseAppInstance;
}

export function getFirestoreDb(): Firestore | null {
  if (firestoreInstance) {
    return firestoreInstance;
  }
  const app = getFirebaseClientApp();
  if (!app) {
    return null;
  }
  firestoreInstance = getFirestore(app);
  return firestoreInstance;
}
