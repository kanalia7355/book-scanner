import { useState } from 'react';
import { Upload, X, Camera } from 'lucide-react';

const ImageUpload = ({ imageUrl, onImageChange, onImageRemove }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ファイルサイズチェック (2MB制限)
      if (file.size > 2 * 1024 * 1024) {
        alert('画像サイズは2MB以下にしてください');
        return;
      }

      // 画像ファイルチェック
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
      }

      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target.result);
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('画像の読み込みに失敗しました');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">書籍画像</label>
      
      {!imageUrl ? (
        <div 
          style={{
            border: '2px dashed #ddd',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#fafafa',
            transition: 'border-color 0.2s ease',
          }}
          onClick={() => document.getElementById('image-upload').click()}
          onMouseEnter={(e) => e.target.style.borderColor = '#007bff'}
          onMouseLeave={(e) => e.target.style.borderColor = '#ddd'}
        >
          {isUploading ? (
            <div>
              <Upload size={48} style={{ color: '#007bff', marginBottom: '1rem' }} />
              <p>アップロード中...</p>
            </div>
          ) : (
            <div>
              <Camera size={48} style={{ color: '#999', marginBottom: '1rem' }} />
              <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                クリックして画像を選択
              </p>
              <p style={{ color: '#999', fontSize: '0.875rem' }}>
                JPG, PNG, GIF (最大2MB)
              </p>
            </div>
          )}
          
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
        </div>
      ) : (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={imageUrl}
            alt="書籍画像"
            style={{
              maxWidth: '200px',
              maxHeight: '300px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(220, 53, 69, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
          
          <div style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="secondary-button"
              onClick={() => document.getElementById('image-upload').click()}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              画像を変更
            </button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;