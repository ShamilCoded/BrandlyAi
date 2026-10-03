/**
 * CONFIGURATION / SECRETS LAYER
 */

import firebaseAppletConfig from '@/firebase-applet-config.json';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

export const AppConfig = {
  appName: 'Brandly.ai',
  tagline: 'Find the right creator. Build the right campaign.',
  defaultCurrency: 'PKR' as const,
  defaultDemoBusinessId: 'biz-spacewise-pk',
  seedVersion: 'seed_manifest_v3',

  getFirebaseConfig(): FirebaseClientConfig {
    const json = (firebaseAppletConfig || {}) as Record<string, string>;
    return {
      apiKey: json.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: json.authDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: json.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: json.storageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: json.messagingSenderId || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: json.appId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      firestoreDatabaseId: json.firestoreDatabaseId || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID,
    };
  },

  isCloudFirestoreConfigured(): boolean {
    const cfg = this.getFirebaseConfig();
    return Boolean(cfg.apiKey && cfg.projectId);
  },
};
