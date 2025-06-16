import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBooks } from '../contexts/BookContext';
import { ArrowLeft, Edit, Trash2, Book, User, Building, Calendar, Hash, FileText, Tag, MapPin } from 'lucide-react';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBook, deleteBook } = useBooks();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const book = getBook(id);

  if (!book) {
    return (
      <div className="container">
        <div className="main-content">
          <div className="empty-state">
            <Book size={64} />
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

  const handleDelete = () => {
    deleteBook(id);
    navigate('/');
  };

  return (
    <div className="container">
      <div className="main-content">
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#007bff', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={20} />
            一覧に戻る
          </Link>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', color: '#333' }}>{book.title}</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to={`/edit/${id}`}>
                <button className="secondary-button" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit size={16} />
                  編集
                </button>
              </Link>
              <button 
                className="danger-button" 
                onClick={() => setShowDeleteConfirm(true)}
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Trash2 size={16} />
                削除
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: book.imageUrl ? 'auto 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
            {book.imageUrl && (
              <div>
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  style={{
                    maxWidth: '200px',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {book.author && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} style={{ color: '#666' }} />
                <span style={{ fontWeight: '500' }}>著者:</span>
                <span>{book.author}</span>
              </div>
            )}

            {book.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} style={{ color: '#007bff' }} />
                <span style={{ fontWeight: '500' }}>保管場所:</span>
                <span style={{ 
                  backgroundColor: '#e3f2fd', 
                  color: '#1976d2', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.875rem' 
                }}>
                  {book.location}
                </span>
              </div>
            )}

            {book.isbn && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Hash size={20} style={{ color: '#666' }} />
                <span style={{ fontWeight: '500' }}>ISBN:</span>
                <span>{book.isbn}</span>
              </div>
            )}

            {book.publisher && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={20} style={{ color: '#666' }} />
                <span style={{ fontWeight: '500' }}>出版社:</span>
                <span>{book.publisher}</span>
              </div>
            )}

            {book.publishDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} style={{ color: '#666' }} />
                <span style={{ fontWeight: '500' }}>出版日:</span>
                <span>{new Date(book.publishDate).toLocaleDateString('ja-JP')}</span>
              </div>
            )}

            {book.pages && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} style={{ color: '#666' }} />
                <span style={{ fontWeight: '500' }}>ページ数:</span>
                <span>{book.pages}ページ</span>
              </div>
            )}

            {book.category && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={20} style={{ color: '#666' }} />
                <span style={{ fontWeight: '500' }}>カテゴリー:</span>
                <span>{book.category}</span>
              </div>
            )}

            {book.description && (
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>説明・メモ</h3>
                <p style={{ whiteSpace: 'pre-wrap', color: '#666', lineHeight: '1.6' }}>
                  {book.description}
                </p>
              </div>
            )}

            <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#999' }}>
                登録日: {new Date(book.addedAt).toLocaleDateString('ja-JP')} {new Date(book.addedAt).toLocaleTimeString('ja-JP')}
              </p>
              {book.updatedAt && (
                <p style={{ fontSize: '0.875rem', color: '#999' }}>
                  更新日: {new Date(book.updatedAt).toLocaleDateString('ja-JP')} {new Date(book.updatedAt).toLocaleTimeString('ja-JP')}
                </p>
              )}
            </div>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
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
          }}>
            <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
              <h3 style={{ marginBottom: '1rem' }}>書籍を削除しますか？</h3>
              <p style={{ marginBottom: '2rem', color: '#666' }}>
                この操作は取り消せません。「{book.title}」を削除してもよろしいですか？
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  className="secondary-button"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  キャンセル
                </button>
                <button 
                  className="danger-button"
                  onClick={handleDelete}
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;