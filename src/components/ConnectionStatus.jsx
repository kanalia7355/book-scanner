import { useBooks } from '../contexts/BookContext';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

const ConnectionStatus = () => {
  const { connected, error, loading } = useBooks();

  if (loading) {
    return null; // ローディング中は表示しない
  }

  return (
    <div style={{
      marginTop: '1rem',
      padding: '8px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: connected ? '#d4edda' : (error ? '#f8d7da' : '#fff3cd'),
      color: connected ? '#155724' : (error ? '#721c24' : '#856404'),
      border: `1px solid ${connected ? '#c3e6cb' : (error ? '#f5c6cb' : '#ffeaa7')}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {connected ? (
        <>
          <Wifi size={16} />
          <span>リアルタイム同期中</span>
        </>
      ) : error ? (
        <>
          <WifiOff size={16} />
          <span>オフライン</span>
        </>
      ) : (
        <>
          <AlertCircle size={16} />
          <span>接続中...</span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;