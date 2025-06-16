import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../contexts/BookContext';
import DataManagement from '../components/DataManagement';
import { Search, Book, Calendar, User, Filter } from 'lucide-react';

const BookList = () => {
  const { books, searchBooks } = useBooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // 全カテゴリーを取得
  const categories = useMemo(() => {
    const categorySet = new Set();
    books.forEach(book => {
      if (book.category) {
        // カンマ区切りの場合も考慮
        book.category.split(',').forEach(cat => {
          const trimmed = cat.trim();
          if (trimmed) categorySet.add(trimmed);
        });
      }
    });
    return Array.from(categorySet).sort();
  }, [books]);

  // フィルタリングされた書籍
  const displayedBooks = useMemo(() => {
    let filtered = books;

    // 検索クエリによるフィルタ
    if (searchQuery) {
      filtered = searchBooks(searchQuery);
    }

    // カテゴリによるフィルタ
    if (selectedCategory) {
      filtered = filtered.filter(book => 
        book.category && book.category.includes(selectedCategory)
      );
    }

    return filtered;
  }, [books, searchQuery, selectedCategory, searchBooks]);

  return (
    <div className="container">
      <div className="main-content">
        <h2 className="page-title">書籍一覧</h2>
        
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr auto', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={20} />
              <input
                type="text"
                placeholder="タイトル、著者、ISBNで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ position: 'relative', minWidth: '200px' }}>
              <Filter style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ 
                  paddingLeft: '40px',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px 10px 10px 40px',
                  fontSize: '16px',
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                <option value="">全カテゴリー</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {(searchQuery || selectedCategory) && (
          <div style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '0.875rem' }}>
            {displayedBooks.length}件の書籍が見つかりました
            {selectedCategory && ` (カテゴリー: ${selectedCategory})`}
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                style={{
                  marginLeft: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  padding: 0
                }}
              >
                フィルターをクリア
              </button>
            )}
          </div>
        )}

        {displayedBooks.length === 0 ? (
          <div className="empty-state">
            <Book size={64} />
            <h3>書籍が登録されていません</h3>
            <p style={{ marginTop: '1rem' }}>
              バーコードスキャンまたは手動で書籍を追加してください
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/scan">
                <button className="primary-button">スキャンで追加</button>
              </Link>
              <Link to="/add">
                <button className="secondary-button">手動で追加</button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="book-grid">
            {displayedBooks.map(book => (
              <Link 
                key={book.id} 
                to={`/book/${book.id}`} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card">
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {book.imageUrl && (
                      <div style={{ flexShrink: 0 }}>
                        <img
                          src={book.imageUrl}
                          alt={book.title}
                          style={{
                            width: '80px',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>{book.title}</h3>
                      {book.author && (
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', marginBottom: '0.5rem' }}>
                          <User size={16} />
                          {book.author}
                        </p>
                      )}
                      {book.isbn && (
                        <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          ISBN: {book.isbn}
                        </p>
                      )}
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#999', fontSize: '0.875rem' }}>
                        <Calendar size={16} />
                        {new Date(book.addedAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {books.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <DataManagement />
          </div>
        )}
      </div>

      <style jsx>{`
        .book-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default BookList;