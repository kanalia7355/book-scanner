import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import { Loader } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // 認証状態の読み込み中
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
          <p style={{ color: '#666' }}>認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  // 認証されていない場合はログインページを表示
  if (!isAuthenticated) {
    return <Login />;
  }

  // 認証されている場合は子コンポーネントを表示
  return children;
};

export default PrivateRoute;