import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useBooks } from '../contexts/BookContext';
import { fetchBookInfo } from '../utils/bookAPI';
import { enhancedBarcodeDetection, captureImageFromVideo } from '../utils/googleVisionAPI';
import LocationModal from '../components/LocationModal';
import { Scan, X, Loader, Eye } from 'lucide-react';

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pendingBookInfo, setPendingBookInfo] = useState(null);
  const [useVisionAPI, setUseVisionAPI] = useState(false);
  const [videoRef, setVideoRef] = useState(null);
  const [janCode, setJanCode] = useState('');
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
    
    // ISBNコードの検証
    if (decodedText.match(/^(978|979)\d{10}$/) || decodedText.match(/^\d{10}$/)) {
      handleISBNScanned(decodedText);
    } 
    // JANコード（日本図書コード）の検証
    else if (decodedText.match(/^(491|192)\d{10}$/)) {
      handleJANScanned(decodedText);
    } 
    else {
      setError('有効なISBNまたはJANコードではありません');
    }
  };

  const onScanFailure = (error) => {
    // スキャンエラーは頻繁に発生するので、ログには出力しない
  };

  const handleJANScanned = async (janCode) => {
    setJanCode(janCode);
    setScannedCode(`日本図書コード（JAN）: ${janCode}`);
    
    // JANコードを直接使って書籍情報を取得
    await handleBookCodeScanned(janCode);
  };

  const handleBookCodeScanned = async (code) => {
    setIsLoading(true);
    setError('');

    try {
      // APIから書籍情報を取得（JAN/ISBN自動判定）
      const bookInfo = await fetchBookInfo(code);

      if (bookInfo) {
        // API取得成功 - 場所入力モーダルを表示
        setPendingBookInfo(bookInfo);
        setShowLocationModal(true);
      } else {
        // API取得失敗 - 手動入力画面へ
        setError('書籍情報が見つかりませんでした。手動で入力してください。');
        setTimeout(() => {
          navigate('/add', { state: { isbn: code, janCode } });
        }, 2000);
      }
    } catch (err) {
      setError('書籍情報の取得中にエラーが発生しました。');
      console.error('Error fetching book info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleISBNScanned = async (isbn) => {
    setScannedCode(`ISBN: ${isbn}`);
    await handleBookCodeScanned(isbn);
  };

  const handleVisionAPICapture = async () => {
    if (!videoRef) return;
    
    setIsLoading(true);
    setError('');

    try {
      const imageData = captureImageFromVideo(videoRef);
      const detectedISBN = await enhancedBarcodeDetection(imageData);
      
      if (detectedISBN) {
        setScannedCode(`Vision API検出: ${detectedISBN}`);
        setIsScanning(false);
        await handleBookCodeScanned(detectedISBN);
      } else {
        setError('バーコードを検出できませんでした。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Vision API error:', error);
      setError('カメラ画像の処理中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setError('');
    setScannedCode('');
    setJanCode('');
  };

  const stopScanning = () => {
    setIsScanning(false);
    setVideoRef(null);
  };

  const handleLocationSave = async (bookDataWithLocation) => {
    try {
      const newBook = await addBook(bookDataWithLocation);
      setShowLocationModal(false);
      setPendingBookInfo(null);
      navigate(`/book/${newBook.id}`);
    } catch (error) {
      console.error('Error adding book:', error);
      setError('書籍の追加中にエラーが発生しました。');
    }
  };

  const handleLocationCancel = () => {
    setShowLocationModal(false);
    setPendingBookInfo(null);
    // スキャンに戻る
    setIsLoading(false);
  };

  return (
    <div className="container">
      <div className="main-content">
        <h2 className="page-title">バーコードスキャン</h2>

        {!isScanning ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Scan size={64} style={{ color: '#007bff', marginBottom: '1rem' }} />
            <p style={{ marginBottom: '2rem', color: '#666' }}>
              書籍のバーコード（ISBN・JAN）をスキャンして登録できます
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <button className="primary-button" onClick={startScanning}>
                標準スキャンを開始
              </button>
              <button 
                className="secondary-button" 
                onClick={() => { setUseVisionAPI(true); startScanning(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Eye size={20} />
                AI強化スキャン（Vision API）
              </button>
            </div>
            
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
            
            {useVisionAPI && (
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <button 
                  className="primary-button" 
                  onClick={handleVisionAPICapture}
                  disabled={isLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                >
                  <Eye size={20} />
                  AI画像解析でスキャン
                </button>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                  より高精度なバーコード検出を行います
                </p>
              </div>
            )}
            
            <div id="reader" style={{ width: '100%' }}></div>
          </div>
        )}

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#1976d2' }}>ヒント</h4>
          <ul style={{ marginLeft: '1.5rem', color: '#666' }}>
            <li>書籍の裏表紙にあるバーコード（ISBN・JAN）をスキャンしてください</li>
            <li>明るい場所でスキャンすると認識しやすくなります</li>
            <li>バーコードが画面内に収まるように調整してください</li>
            <li>標準スキャンで読み取れない場合は「AI強化スキャン」をお試しください</li>
            <li>JANコード（日本図書コード）で直接書籍情報を取得します</li>
          </ul>
        </div>
      </div>

      <LocationModal
        isOpen={showLocationModal}
        onClose={handleLocationCancel}
        onSave={handleLocationSave}
        bookInfo={pendingBookInfo}
      />
    </div>
  );
};

export default Scanner;