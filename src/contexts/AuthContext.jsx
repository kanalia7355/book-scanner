import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google sign in error:', error);
      
      // エラーハンドリング
      let errorMessage = '認証に失敗しました。';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'ログインがキャンセルされました。';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'ポップアップがブロックされました。ポップアップを許可してください。';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'リクエストが多すぎます。しばらく待ってから再試行してください。';
          break;
        default:
          errorMessage = `認証エラー: ${error.message}`;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      setError('ログアウトに失敗しました。');
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    clearError,
    // ユーザー情報のヘルパー
    isAuthenticated: !!user,
    displayName: user?.displayName || 'ユーザー',
    email: user?.email || '',
    photoURL: user?.photoURL || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};