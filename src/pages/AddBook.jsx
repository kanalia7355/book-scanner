import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooks } from '../contexts/BookContext';
import { fetchBookInfo } from '../utils/bookAPI';
import ImageUpload from '../components/ImageUpload';
import LocationInput from '../components/LocationInput';
import { Save, X, Search, Loader } from 'lucide-react';

const AddBook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addBook } = useBooks();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publishDate: '',
    pages: '',
    description: '',
    category: '',
    imageUrl: '',
    location: '',
  });

  const [janCode, setJanCode] = useState('');
  const [errors, setErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [lastSearchedCode, setLastSearchedCode] = useState('');

  // スキャンから遷移してきた場合のISBNまたはJANを設定
  useEffect(() => {
    if (location.state?.isbn) {
      setFormData(prev => ({
        ...prev,
        isbn: location.state.isbn
      }));
    }
    
    if (location.state?.janCode) {
      setJanCode(location.state.janCode);
      // JANコードをそのまま表示（変換は行わない）
    }
  }, [location.state]);

  // ISBN/JANコードの自動検索
  useEffect(() => {
    const searchCode = formData.isbn.trim();
    
    // コードが有効で、前回検索したコードと異なる場合のみ検索
    if (searchCode && 
        searchCode !== lastSearchedCode && 
        (searchCode.length === 10 || searchCode.length === 13) &&
        searchCode.match(/^\d+$/)) {
      
      const timeoutId = setTimeout(async () => {
        setIsSearching(true);
        setSearchResult(null);
        setLastSearchedCode(searchCode);
        
        try {
          console.log('Auto-searching for code:', searchCode);
          const bookInfo = await fetchBookInfo(searchCode);
          
          if (bookInfo) {
            setSearchResult({
              success: true,
              data: bookInfo,
              message: '書籍情報が見つかりました'
            });
          } else {
            setSearchResult({
              success: false,
              message: '書籍情報が見つかりませんでした'
            });
          }
        } catch (error) {
          console.error('Auto-search error:', error);
          setSearchResult({
            success: false,
            message: '検索中にエラーが発生しました'
          });
        } finally {
          setIsSearching(false);
        }
      }, 1000); // 1秒のデバウンス

      return () => clearTimeout(timeoutId);
    }
  }, [formData.isbn, lastSearchedCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = '保管場所は必須です';
    }
    
    if (formData.isbn && !formData.isbn.match(/^[\d-]{10,13}$/)) {
      newErrors.isbn = '有効なISBNまたはJANコードを入力してください';
    }
    
    if (formData.pages && !formData.pages.match(/^\d+$/)) {
      newErrors.pages = 'ページ数は数字で入力してください';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const bookData = {
      ...formData,
      pages: formData.pages ? parseInt(formData.pages) : null,
    };
    
    try {
      const newBook = await addBook(bookData);
      navigate(`/book/${newBook.id}`);
    } catch (error) {
      console.error('Error adding book:', error);
      setErrors({ submit: '書籍の追加中にエラーが発生しました。' });
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleImageChange = (imageData) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: imageData
    }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  const applyBookInfo = (bookInfo) => {
    setFormData(prev => ({
      ...prev,
      title: bookInfo.title || prev.title,
      author: bookInfo.author || prev.author,
      publisher: bookInfo.publisher || prev.publisher,
      publishDate: bookInfo.publishDate || prev.publishDate,
      pages: bookInfo.pages ? bookInfo.pages.toString() : prev.pages,
      description: bookInfo.description || prev.description,
      category: bookInfo.category || prev.category,
      imageUrl: bookInfo.imageUrl || prev.imageUrl,
    }));
  };

  const handleLocationChange = (location) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
    
    // エラーをクリア
    if (errors.location) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.location;
        return newErrors;
      });
    }
  };

  return (
    <div className="container">
      <div className="main-content">
        <h2 className="page-title">書籍を手動で追加</h2>
        
        <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="form-group">
            <label className="form-label">
              タイトル <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="書籍のタイトル"
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          <LocationInput
            value={formData.location}
            onChange={handleLocationChange}
            required={true}
          />
          {errors.location && <div className="error-message">{errors.location}</div>}

          <div className="form-group">
            <label className="form-label">著者</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="著者名"
            />
          </div>

          {janCode && (
            <div className="card" style={{ backgroundColor: '#f8f9fa', marginBottom: '1rem' }}>
              <strong>スキャンされた日本図書コード（JAN）: {janCode}</strong>
              <div style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                JANコードから書籍情報の取得に失敗しました。手動で入力してください。
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">ISBN / JAN</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="978-0000000000 or 4910000000000"
                style={{ paddingRight: '40px' }}
              />
              {isSearching && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#007bff'
                }}>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              )}
            </div>
            {errors.isbn && <div className="error-message">{errors.isbn}</div>}
            
            {/* 検索結果の表示 */}
            {searchResult && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                backgroundColor: searchResult.success ? '#d4edda' : '#fff3cd',
                border: `1px solid ${searchResult.success ? '#c3e6cb' : '#ffeaa7'}`,
                color: searchResult.success ? '#155724' : '#856404'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Search size={16} />
                  <span>{searchResult.message}</span>
                </div>
                
                {searchResult.success && searchResult.data && (
                  <>
                    <div style={{ fontSize: '0.8rem', marginBottom: '0.75rem', opacity: 0.8 }}>
                      検出された書籍情報:
                    </div>
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                      <div><strong>タイトル:</strong> {searchResult.data.title}</div>
                      <div><strong>著者:</strong> {searchResult.data.author}</div>
                      <div><strong>出版社:</strong> {searchResult.data.publisher}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyBookInfo(searchResult.data)}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Search size={14} />
                      この情報を自動入力
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">出版社</label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              placeholder="出版社名"
            />
          </div>

          <div className="form-group">
            <label className="form-label">出版日</label>
            <input
              type="date"
              name="publishDate"
              value={formData.publishDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ページ数</label>
            <input
              type="text"
              name="pages"
              value={formData.pages}
              onChange={handleChange}
              placeholder="300"
            />
            {errors.pages && <div className="error-message">{errors.pages}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">カテゴリー</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="小説、ビジネス、技術書など"
            />
          </div>

          <ImageUpload
            imageUrl={formData.imageUrl}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
          />

          <div className="form-group">
            <label className="form-label">説明・メモ</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="書籍についてのメモや感想"
              rows={4}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="secondary-button"
              onClick={handleCancel}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <X size={16} />
              キャンセル
            </button>
            <button 
              type="submit" 
              className="primary-button"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;