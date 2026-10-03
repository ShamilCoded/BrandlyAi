/**
 * CONFIGURATION / SECRETS LAYER
 */

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const AppConfig = {
  appName: 'Brandly.ai',
  tagline: 'Find the right creator. Build the right campaign.',
  defaultCurrency: 'PKR' as const,
  defaultDemoBusinessId: 'biz-spacewise-pk',
  seedVersion: 'seed_manifest_v3',

  getFirebaseConfig(): FirebaseClientConfig {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  },

  isCloudFirestoreConfigured(): boolean {
    const cfg = this.getFirebaseConfig();
    return Boolean(cfg.apiKey && cfg.projectId);
  },
};
