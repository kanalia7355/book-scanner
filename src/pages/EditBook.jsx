import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBooks } from '../contexts/BookContext';
import ImageUpload from '../components/ImageUpload';
import LocationInput from '../components/LocationInput';
import { Save, X, ArrowLeft } from 'lucide-react';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBook, updateBook } = useBooks();
  
  const book = getBook(id);
  
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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        publishDate: book.publishDate || '',
        pages: book.pages ? book.pages.toString() : '',
        description: book.description || '',
        category: book.category || '',
        imageUrl: book.imageUrl || '',
        location: book.location || '',
      });
    }
  }, [book]);

  if (!book) {
    return (
      <div className="container">
        <div className="main-content">
          <div className="empty-state">
            <h3>書籍が見つかりません</h3>
            <Link to="/">
              <button className="primary-button" style={{ marginTop: '1rem' }}>
                一覧に戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      newErrors.isbn = '有効なISBNを入力してください';
    }
    
    if (formData.pages && !formData.pages.match(/^\d+$/)) {
      newErrors.pages = 'ページ数は数字で入力してください';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
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
    
    updateBook(id, bookData);
    navigate(`/book/${id}`);
  };

  const handleCancel = () => {
    navigate(`/book/${id}`);
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
        <div style={{ marginBottom: '1rem' }}>
          <Link to={`/book/${id}`} style={{ textDecoration: 'none', color: '#007bff', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={20} />
            詳細に戻る
          </Link>
        </div>

        <h2 className="page-title">書籍情報を編集</h2>
        
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

          <div className="form-group">
            <label className="form-label">ISBN</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="978-0-0000-0000-0"
            />
            {errors.isbn && <div className="error-message">{errors.isbn}</div>}
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
              更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;