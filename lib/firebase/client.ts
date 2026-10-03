import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, type Firestore } from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '@/firebase-applet-config.json';

export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(app);

export function getFirebaseClientApp(): FirebaseApp {
  return app;
}

export function getFirestoreDb(): Firestore {
  return db;
}

export function getFirebaseAuth(): Auth {
  return auth;
}

/**
 * Ensures an authenticated session exists for the user.
 * Seamlessly initializes an anonymous Firebase Auth session if not already signed in.
 */
export async function ensureAuthSession(): Promise<FirebaseUser | null> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return null;
  }

  if (auth.currentUser) {
    return auth.currentUser;
  }

  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('[Brandly.ai] Firebase Auth sign-in note:', err);
    return null;
  }
}

export async function signOutAuthUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    await firebaseSignOut(auth);
  }
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Test connectivity to Firestore as recommended by the skill guidelines
 */
export async function testFirestoreConnection(): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Brandly.ai] Firestore client reports offline mode, checking network.');
    }
    return false;
  }
}
