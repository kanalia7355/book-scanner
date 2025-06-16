import { useState, useEffect } from 'react';
import { useBooks } from '../contexts/BookContext';
import { MapPin, Plus } from 'lucide-react';

const LocationInput = ({ value, onChange, required = false, label = "保管場所" }) => {
  const { getLocations } = useBooks();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

  useEffect(() => {
    const locations = getLocations();
    setAllLocations(locations);
  }, [getLocations]);

  useEffect(() => {
    if (value && value.length > 0) {
      const filtered = allLocations.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowSuggestions(filtered.length > 0 && value !== '');
    } else {
      setFilteredLocations(allLocations);
      setShowSuggestions(false);
    }
  }, [value, allLocations]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length > 0) {
      const filtered = allLocations.filter(location =>
        location.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (location) => {
    onChange(location);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (allLocations.length > 0 && !value) {
      setFilteredLocations(allLocations);
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // 少し遅延させてクリックイベントを処理できるようにする
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // よく使われる場所の候補
  const commonLocations = [
    'リビング',
    '寝室',
    '書斎',
    '本棚1段目',
    '本棚2段目',
    '本棚3段目',
    'デスク',
    'クローゼット',
    '子供部屋',
    'オフィス',
    '倉庫',
    '実家',
    '貸出中'
  ];

  const suggestionsToShow = value ? filteredLocations : (allLocations.length > 0 ? allLocations : commonLocations);

  return (
    <div className="form-group">
      <label className="form-label">
        <MapPin size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
        {label}
        {required && <span style={{ color: '#dc3545' }}> *</span>}
      </label>
      
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="例: リビング、本棚1段目、書斎など"
          style={{
            paddingRight: '40px'
          }}
        />
        
        <MapPin 
          size={20} 
          style={{ 
            position: 'absolute', 
            right: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#999' 
          }} 
        />

        {showSuggestions && suggestionsToShow.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000
          }}>
            {suggestionsToShow.slice(0, 8).map((location, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(location)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: index < suggestionsToShow.length - 1 ? '1px solid #eee' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                {allLocations.includes(location) ? (
                  <MapPin size={14} style={{ color: '#007bff' }} />
                ) : (
                  <Plus size={14} style={{ color: '#28a745' }} />
                )}
                <span>{location}</span>
                {!allLocations.includes(location) && (
                  <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: 'auto' }}>
                    新規
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
        <p>💡 書籍がどこに保管されているかを記録できます</p>
        {allLocations.length > 0 && (
          <p style={{ marginTop: '0.25rem' }}>
            よく使う場所: {allLocations.slice(0, 3).join('、')}
            {allLocations.length > 3 && '...'}
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationInput;