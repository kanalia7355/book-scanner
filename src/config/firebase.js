import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase設定
// 実際のプロジェクトでは環境変数を使用してください
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "book-scanner-demo.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://book-scanner-demo-default-rtdb.firebaseio.com/",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "book-scanner-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "book-scanner-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo-app-id"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Auth初期化
export const auth = getAuth(app);

// Realtime Database初期化
export const database = getDatabase(app);

// デバッグ情報
console.log('Firebase initialized with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL,
  hasApiKey: !!firebaseConfig.apiKey
});

// Google認証プロバイダー
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;