import { useState } from 'react';
import { convertJANtoISBN } from '../utils/googleVisionAPI';
import { TestTube, CheckCircle, XCircle, Copy } from 'lucide-react';

const JANTestButton = () => {
  const [testJAN, setTestJAN] = useState('');
  const [result, setResult] = useState(null);

  // テスト用のサンプルJANコード
  const sampleJANCodes = [
    '1920123456789', // 192で始まる日本図書コード
    '1980123456789', // 198で始まる日本図書コード
    '1990123456789', // 199で始まる日本図書コード  
    '4910123456789', // 491で始まる日本図書コード
  ];

  const testJANConversion = () => {
    if (!testJAN) {
      setResult({
        success: false,
        message: 'JANコードを入力してください'
      });
      return;
    }

    console.log('=== JAN Conversion Test ===');
    const isbn = convertJANtoISBN(testJAN);
    
    if (isbn) {
      setResult({
        success: true,
        isbn: isbn,
        message: `変換成功: ${isbn}`
      });
    } else {
      setResult({
        success: false,
        message: 'ISBNへの変換に失敗しました'
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h4 style={{ marginBottom: '1rem', color: '#333' }}>JAN→ISBN変換テスト</h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          JANコード（13桁）:
        </label>
        <input
          type="text"
          value={testJAN}
          onChange={(e) => setTestJAN(e.target.value)}
          placeholder="例: 4910123456789"
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
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>サンプルJANコード:</p>
        {sampleJANCodes.map((jan, index) => (
          <button
            key={index}
            onClick={() => setTestJAN(jan)}
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
            {jan}
          </button>
        ))}
      </div>

      <button
        onClick={testJANConversion}
        disabled={!testJAN}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '8px 16px',
          fontSize: '0.9rem',
          borderRadius: '4px',
          border: '1px solid #007bff',
          backgroundColor: testJAN ? '#007bff' : '#f8f9fa',
          color: testJAN ? 'white' : '#666',
          cursor: testJAN ? 'pointer' : 'not-allowed'
        }}
      >
        <TestTube size={16} />
        変換テスト
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
            <strong>{result.success ? '変換成功' : '変換失敗'}</strong>
          </div>
          
          {result.success && result.isbn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span>ISBN-13: <strong>{result.isbn}</strong></span>
              <button
                onClick={() => copyToClipboard(result.isbn)}
                style={{
                  padding: '2px 6px',
                  fontSize: '0.8rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: '#155724'
                }}
                title="クリップボードにコピー"
              >
                <Copy size={12} />
              </button>
            </div>
          )}
          
          <div>{result.message}</div>
          
          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
            詳細なログはブラウザのデベロッパーコンソールで確認できます。
          </div>
        </div>
      )}
    </div>
  );
};

export default JANTestButton;