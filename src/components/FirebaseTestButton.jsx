import { useState } from 'react';
import { database } from '../config/firebase';
import { ref, set, push, onValue, off } from 'firebase/database';
import { TestTube, CheckCircle, XCircle } from 'lucide-react';

const FirebaseTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    // databaseが利用できない場合
    if (!database) {
      setTestResult({
        success: false,
        message: 'Firebase設定が無効です。環境変数を確認してください。'
      });
      setIsLoading(false);
      return;
    }

    try {
      // テストデータの参照を作成
      const testRef = ref(database, 'test/connection');
      const testData = {
        timestamp: Date.now(),
        message: 'Firebase connection test'
      };

      console.log('Testing Firebase write...');
      // データを書き込み
      await set(testRef, testData);
      
      console.log('Testing Firebase read...');
      // データを読み込んで確認
      const unsubscribe = onValue(testRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.timestamp === testData.timestamp) {
          console.log('Firebase read test successful:', data);
          setTestResult({
            success: true,
            message: 'Firebase接続テスト成功！リアルタイム同期が利用可能です。'
          });
        } else {
          setTestResult({
            success: false,
            message: 'データの読み込みに失敗しました。'
          });
        }
        off(testRef);
        setIsLoading(false);
      }, (error) => {
        console.error('Firebase read error:', error);
        setTestResult({
          success: false,
          message: `読み込みエラー: ${error.message}`
        });
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Firebase test error:', error);
      setTestResult({
        success: false,
        message: `接続エラー: ${error.message}`
      });
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        onClick={testFirebaseConnection}
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '8px 16px',
          fontSize: '0.9rem',
          borderRadius: '4px',
          border: '1px solid #007bff',
          backgroundColor: isLoading ? '#f8f9fa' : '#007bff',
          color: isLoading ? '#666' : 'white',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        <TestTube size={16} />
        {isLoading ? 'テスト中...' : 'Firebase接続テスト'}
      </button>

      {testResult && (
        <div style={{
          marginTop: '0.5rem',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          color: testResult.success ? '#155724' : '#721c24',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {testResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {testResult.message}
        </div>
      )}
    </div>
  );
};

export default FirebaseTestButton;