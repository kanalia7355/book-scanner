import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase設定の検証
const hasValidConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  return requiredVars.every(varName => {
    const value = import.meta.env[varName];
    return value && value !== 'your-api-key' && value !== 'demo-api-key';
  });
};

// Firebase設定
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
let app, auth, database;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Realtime Database初期化（設定が有効な場合のみ）
  if (hasValidConfig()) {
    database = getDatabase(app);
    console.log('Firebase initialized successfully with real config');
  } else {
    console.warn('Firebase initialized with demo config - some features may not work');
    database = null;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  auth = null;
  database = null;
}

export { auth, database };

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