import { useState } from 'react';
import { fetchBookByJAN } from '../utils/bookAPI';
import { TestTube, CheckCircle, XCircle, BookOpen } from 'lucide-react';

const OpenBDTestButton = () => {
  const [testCode, setTestCode] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 実在のJANコードのサンプル
  const sampleCodes = [
    '9784822283940', // 実在の書籍例
    '9784065295830', // 実在の書籍例
    '4910000000000', // テスト用JAN
  ];

  const testOpenBD = async () => {
    if (!testCode) {
      setResult({
        success: false,
        message: 'コードを入力してください'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      console.log('=== openBD API Test ===');
      const bookInfo = await fetchBookByJAN(testCode);
      
      if (bookInfo) {
        setResult({
          success: true,
          bookInfo: bookInfo,
          message: 'openBD APIで書籍情報を取得しました'
        });
      } else {
        setResult({
          success: false,
          message: 'openBD APIで書籍が見つかりませんでした'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `エラー: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h4 style={{ marginBottom: '1rem', color: '#333' }}>openBD API テスト</h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          書籍コード（ISBN/JAN）:
        </label>
        <input
          type="text"
          value={testCode}
          onChange={(e) => setTestCode(e.target.value)}
          placeholder="例: 9784822283940"
          style={{
            width: '200px',
            padding: '8px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>サンプルコード:</p>
        {sampleCodes.map((code, index) => (
          <button
            key={index}
            onClick={() => setTestCode(code)}
            style={{
              marginRight: '0.5rem',
              marginBottom: '0.5rem',
              padding: '4px 8px',
              fontSize: '0.8rem',
              border: '1px solid #007bff',
              backgroundColor: 'white',
              color: '#007bff',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {code}
          </button>
        ))}
      </div>

      <button
        onClick={testOpenBD}
        disabled={!testCode || isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '8px 16px',
          fontSize: '0.9rem',
          borderRadius: '4px',
          border: '1px solid #28a745',
          backgroundColor: (testCode && !isLoading) ? '#28a745' : '#f8f9fa',
          color: (testCode && !isLoading) ? 'white' : '#666',
          cursor: (testCode && !isLoading) ? 'pointer' : 'not-allowed'
        }}
      >
        <TestTube size={16} />
        {isLoading ? 'テスト中...' : 'openBD APIテスト'}
      </button>

      {result && (
        <div style={{
          marginTop: '1rem',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '0.9rem',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          color: result.success ? '#155724' : '#721c24',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {result.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
            <strong>{result.success ? '成功' : '失敗'}</strong>
          </div>
          
          <div style={{ marginBottom: '0.5rem' }}>{result.message}</div>
          
          {result.success && result.bookInfo && (
            <div style={{ marginTop: '1rem', padding: '8px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <BookOpen size={16} />
                <strong>取得された書籍情報:</strong>
              </div>
              <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                <div><strong>タイトル:</strong> {result.bookInfo.title}</div>
                <div><strong>著者:</strong> {result.bookInfo.author}</div>
                <div><strong>出版社:</strong> {result.bookInfo.publisher}</div>
                <div><strong>出版日:</strong> {result.bookInfo.publishDate}</div>
                {result.bookInfo.pages && <div><strong>ページ数:</strong> {result.bookInfo.pages}</div>}
                <div><strong>データソース:</strong> {result.bookInfo.source}</div>
              </div>
            </div>
          )}
          
          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
            詳細なAPIレスポンスはブラウザのコンソールで確認できます。
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenBDTestButton;