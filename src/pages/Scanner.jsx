import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useBooks } from '../contexts/BookContext';
import { fetchBookInfo } from '../utils/bookAPI';
import { Scan, X, Loader } from 'lucide-react';

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addBook } = useBooks();
  const navigate = useNavigate();

  useEffect(() => {
    let scanner;
    
    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1,
        },
        false
      );

      scanner.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => {
          console.error("Failed to clear scanner", error);
        });
      }
    };
  }, [isScanning]);

  const onScanSuccess = (decodedText, decodedResult) => {
    setScannedCode(decodedText);
    setIsScanning(false);
    
    // ISBNコードの簡単な検証
    if (decodedText.match(/^(978|979)\d{10}$/) || decodedText.match(/^\d{10}$/)) {
      handleISBNScanned(decodedText);
    } else {
      setError('有効なISBNコードではありません');
    }
  };

  const onScanFailure = (error) => {
    // スキャンエラーは頻繁に発生するので、ログには出力しない
  };

  const handleISBNScanned = async (isbn) => {
    setIsLoading(true);
    setError('');

    try {
      // APIから書籍情報を取得
      const bookInfo = await fetchBookInfo(isbn);

      if (bookInfo) {
        // API取得成功
        const newBook = addBook(bookInfo);
        navigate(`/book/${newBook.id}`);
      } else {
        // API取得失敗 - 手動入力画面へ
        setError('書籍情報が見つかりませんでした。手動で入力してください。');
        setTimeout(() => {
          navigate('/add', { state: { isbn } });
        }, 2000);
      }
    } catch (err) {
      setError('書籍情報の取得中にエラーが発生しました。');
      console.error('Error fetching book info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setError('');
    setScannedCode('');
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  return (
    <div className="container">
      <div className="main-content">
        <h2 className="page-title">バーコードスキャン</h2>

        {!isScanning ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Scan size={64} style={{ color: '#007bff', marginBottom: '1rem' }} />
            <p style={{ marginBottom: '2rem', color: '#666' }}>
              書籍のバーコード（ISBN）をスキャンして登録できます
            </p>
            <button className="primary-button" onClick={startScanning}>
              スキャンを開始
            </button>
            
            {scannedCode && (
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <p>スキャンされたコード: <strong>{scannedCode}</strong></p>
              </div>
            )}

            {error && (
              <div className="error-message" style={{ marginTop: '1rem' }}>
                {error}
              </div>
            )}

            {isLoading && (
              <div style={{ marginTop: '2rem' }}>
                <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: '#007bff' }} />
                <p style={{ marginTop: '0.5rem', color: '#666' }}>書籍情報を取得中...</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p>カメラを書籍のバーコードに向けてください</p>
              <button 
                className="secondary-button" 
                onClick={stopScanning}
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <X size={16} />
                キャンセル
              </button>
            </div>
            <div id="reader" style={{ width: '100%' }}></div>
          </div>
        )}

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#1976d2' }}>ヒント</h4>
          <ul style={{ marginLeft: '1.5rem', color: '#666' }}>
            <li>書籍の裏表紙にあるバーコードをスキャンしてください</li>
            <li>明るい場所でスキャンすると認識しやすくなります</li>
            <li>バーコードが画面内に収まるように調整してください</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Scanner;