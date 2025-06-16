import { useState } from 'react';
import LocationInput from './LocationInput';
import { Save, X } from 'lucide-react';

const LocationModal = ({ isOpen, onClose, onSave, bookInfo }) => {
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!location.trim()) {
      setError('保管場所を入力してください');
      return;
    }
    
    onSave({
      ...bookInfo,
      location: location.trim()
    });
    
    // リセット
    setLocation('');
    setError('');
  };

  const handleClose = () => {
    setLocation('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card" style={{ 
        maxWidth: '500px', 
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          borderBottom: '1px solid #eee',
          paddingBottom: '1rem'
        }}>
          <h3 style={{ margin: 0, color: '#333' }}>📍 保管場所を入力</h3>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: '#666'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {bookInfo && (
          <div style={{ 
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>スキャンした書籍</h4>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>{bookInfo.title}</p>
            {bookInfo.author && (
              <p style={{ margin: '0', color: '#666', fontSize: '0.875rem' }}>著者: {bookInfo.author}</p>
            )}
            {bookInfo.isbn && (
              <p style={{ margin: '0', color: '#666', fontSize: '0.875rem' }}>ISBN: {bookInfo.isbn}</p>
            )}
          </div>
        )}

        <LocationInput
          value={location}
          onChange={(value) => {
            setLocation(value);
            if (error) setError('');
          }}
          required={true}
          label="この書籍の保管場所"
        />
        
        {error && (
          <div className="error-message" style={{ marginTop: '0.5rem' }}>
            {error}
          </div>
        )}

        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          fontSize: '0.875rem',
          color: '#1976d2'
        }}>
          💡 <strong>ヒント:</strong> 書籍がどこに保管されているかを正確に記録することで、後で見つけやすくなります。
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee'
        }}>
          <button 
            type="button" 
            className="secondary-button"
            onClick={handleClose}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <X size={16} />
            キャンセル
          </button>
          <button 
            type="button" 
            className="primary-button"
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={16} />
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;