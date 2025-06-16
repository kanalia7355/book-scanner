import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogIn, AlertCircle, Loader } from 'lucide-react';

const Login = () => {
  const { signInWithGoogle, loading, error, clearError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // コンポーネントマウント時にエラーをクリア
    clearError();
  }, [clearError]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      // エラーは AuthContext で処理済み
      console.error('Login failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={48} style={{ 
            animation: 'spin 1s linear infinite', 
            color: '#007bff',
            marginBottom: '1rem' 
          }} />
          <p style={{ color: '#666' }}>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div className="card" style={{ 
        maxWidth: '400px', 
        width: '100%',
        textAlign: 'center'
      }}>
        {/* アプリロゴ・タイトル */}
        <div style={{ marginBottom: '2rem' }}>
          <BookOpen 
            size={64} 
            style={{ 
              color: '#007bff', 
              marginBottom: '1rem',
              display: 'block',
              margin: '0 auto 1rem auto'
            }} 
          />
          <h1 style={{ 
            fontSize: '1.75rem', 
            marginBottom: '0.5rem',
            color: '#333'
          }}>
            📚 書籍管理アプリ
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: '1rem',
            lineHeight: '1.5'
          }}>
            スマホでバーコードスキャンして<br />
            書籍を簡単管理
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* 機能紹介 */}
        <div style={{ 
          marginBottom: '2rem',
          textAlign: 'left',
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px'
        }}>
          <h3 style={{ 
            marginBottom: '1rem',
            color: '#333',
            textAlign: 'center' 
          }}>
            ✨ 主な機能
          </h3>
          <ul style={{ 
            listStyle: 'none',
            padding: 0,
            margin: 0,
            lineHeight: '1.8'
          }}>
            <li style={{ marginBottom: '0.5rem' }}>
              📱 <strong>バーコードスキャン</strong> - ISBNを瞬時に読み取り
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              📍 <strong>保管場所管理</strong> - どこに置いたか記録
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              🔍 <strong>検索・フィルター</strong> - 素早く本を見つける
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              💾 <strong>データ管理</strong> - CSV/JSONでバックアップ
            </li>
            <li>
              🌐 <strong>クラウド同期</strong> - どこからでもアクセス
            </li>
          </ul>
        </div>

        {/* ログインボタン */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '500',
            backgroundColor: isSigningIn ? '#cccccc' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSigningIn ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'background-color 0.2s ease',
            marginBottom: '1rem'
          }}
          onMouseEnter={(e) => {
            if (!isSigningIn) e.target.style.backgroundColor = '#3367d6';
          }}
          onMouseLeave={(e) => {
            if (!isSigningIn) e.target.style.backgroundColor = '#4285f4';
          }}
        >
          {isSigningIn ? (
            <>
              <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
              サインイン中...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Googleでログイン
            </>
          )}
        </button>

        {/* プライバシー情報 */}
        <div style={{
          fontSize: '0.875rem',
          color: '#666',
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            🔒 <strong>プライバシー保護</strong>
          </p>
          <p style={{ margin: 0 }}>
            あなたの書籍データは安全に暗号化され、<br />
            Googleアカウントに紐づいて保存されます。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;