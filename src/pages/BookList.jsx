import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../contexts/BookContext';
import DataManagement from '../components/DataManagement';
import FirebaseTestButton from '../components/FirebaseTestButton';
import JANTestButton from '../components/JANTestButton';
import OpenBDTestButton from '../components/OpenBDTestButton';
import { Search, Book, Calendar, User, Filter, MapPin } from 'lucide-react';

const BookList = () => {
  const { books, loading, error, searchBooks, getLocations, sortBooksByLocation } = useBooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('addedAt');

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

  // 全場所を取得
  const locations = useMemo(() => {
    return getLocations();
  }, [getLocations]);

  // フィルタリングとソートされた書籍
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

    // 場所によるフィルタ
    if (selectedLocation) {
      filtered = filtered.filter(book => 
        book.location && book.location === selectedLocation
      );
    }

    // ソート
    switch (sortBy) {
      case 'location':
        return sortBooksByLocation(filtered);
      case 'title':
        return [...filtered].sort((a, b) => a.title?.localeCompare(b.title) || 0);
      case 'author':
        return [...filtered].sort((a, b) => a.author?.localeCompare(b.author) || 0);
      case 'addedAt':
      default:
        return [...filtered].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    }
  }, [books, searchQuery, selectedCategory, selectedLocation, sortBy, searchBooks, sortBooksByLocation]);

  return (
    <div className="container">
      <div className="main-content">
        <h2 className="page-title">書籍一覧</h2>
        
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={20} />
              <input
                type="text"
                placeholder="タイトル、著者、ISBN、場所で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
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

          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <MapPin style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={20} />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
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
                <option value="">全ての場所</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ 
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '16px',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              <option value="addedAt">追加日順</option>
              <option value="location">場所順</option>
              <option value="title">タイトル順</option>
              <option value="author">著者順</option>
            </select>
          </div>
        </div>

        {(searchQuery || selectedCategory || selectedLocation) && (
          <div style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '0.875rem' }}>
            {displayedBooks.length}件の書籍が見つかりました
            {selectedCategory && ` (カテゴリー: ${selectedCategory})`}
            {selectedLocation && ` (場所: ${selectedLocation})`}
            {sortBy !== 'addedAt' && ` (${{
              location: '場所順',
              title: 'タイトル順', 
              author: '著者順'
            }[sortBy]}でソート)`}
            {(searchQuery || selectedCategory || selectedLocation) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedLocation('');
                  setSortBy('addedAt');
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>データを読み込み中...</div>
            <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>⚠️ エラーが発生しました</div>
            <div style={{ fontSize: '0.9rem' }}>{error}</div>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#666' }}>
              ローカルデータがある場合は表示されます
            </div>
          </div>
        ) : displayedBooks.length === 0 ? (
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
                          {book.isbn.startsWith('192') || book.isbn.startsWith('198') || 
                           book.isbn.startsWith('199') || book.isbn.startsWith('491') ? 'JAN:' : 'ISBN:'} {book.isbn}
                        </p>
                      )}
                      {book.location && (
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <MapPin size={14} style={{ color: '#007bff' }} />
                          <span style={{ 
                            backgroundColor: '#e3f2fd', 
                            color: '#1976d2', 
                            padding: '1px 6px', 
                            borderRadius: '8px', 
                            fontSize: '0.75rem' 
                          }}>
                            {book.location}
                          </span>
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

        {/* 開発・デバッグ用ツール */}
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h4 style={{ marginBottom: '1rem', color: '#666' }}>開発者ツール</h4>
          <FirebaseTestButton />
          <JANTestButton />
          <OpenBDTestButton />
        </div>
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