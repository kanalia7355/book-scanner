import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../config/firebase';
import { ref, push, set, onValue, off, remove, update } from 'firebase/database';

const BookContext = createContext();

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  // Firebase からリアルタイムでデータを取得
  useEffect(() => {
    // Firebaseが利用できない場合はローカルストレージのみを使用
    if (!database) {
      console.warn('Firebase database not available, using localStorage only');
      const savedBooks = localStorage.getItem('lab_books_shared');
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks));
      }
      setLoading(false);
      setConnected(false);
      setError('Firebase設定が無効です。ローカルストレージを使用します。');
      return;
    }

    const booksRef = ref(database, 'books');
    console.log('Setting up Firebase listener...');
    console.log('Database reference:', booksRef.toString());
    
    const unsubscribe = onValue(booksRef, (snapshot) => {
      try {
        const data = snapshot.val();
        console.log('Firebase data received:', data);
        setConnected(true);
        
        if (data) {
          // Firebase のオブジェクトを配列に変換
          const booksArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setBooks(booksArray);
        } else {
          setBooks([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error processing Firebase data:', err);
        setError(`データ処理エラー: ${err.message}`);
        setConnected(false);
        // エラー時はローカルストレージからフォールバック
        const savedBooks = localStorage.getItem('lab_books_shared');
        if (savedBooks) {
          setBooks(JSON.parse(savedBooks));
        }
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Firebase listener error:', err);
      setError(`接続エラー: ${err.message}`);
      setConnected(false);
      // エラー時はローカルストレージからフォールバック
      const savedBooks = localStorage.getItem('lab_books_shared');
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks));
      }
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up Firebase listener...');
      if (database && unsubscribe) {
        const booksRef = ref(database, 'books');
        off(booksRef);
      }
    };
  }, [database]);

  // ローカルストレージにバックアップ保存
  useEffect(() => {
    if (books.length >= 0 && !loading) {
      localStorage.setItem('lab_books_shared', JSON.stringify(books));
    }
  }, [books, loading]);

  const addBook = async (bookData) => {
    const newBook = {
      ...bookData,
      addedAt: new Date().toISOString(),
      // 画像URLが外部URLの場合はそのまま、ローカル画像はBase64として保存
      imageUrl: bookData.imageUrl || null,
    };

    // Firebaseが利用できない場合はローカルのみで追加
    if (!database) {
      const localBook = {
        id: uuidv4(),
        ...newBook,
      };
      setBooks(prev => [...prev, localBook]);
      return localBook;
    }

    try {
      // Firebase に保存（IDは自動生成）
      const booksRef = ref(database, 'books');
      const newBookRef = push(booksRef);
      console.log('Adding book to Firebase with ID:', newBookRef.key);
      await set(newBookRef, newBook);
      console.log('Book successfully added to Firebase');
      
      // IDを含む完全なオブジェクトを返す
      return {
        id: newBookRef.key,
        ...newBook
      };
    } catch (err) {
      console.error('Error adding book to Firebase:', err);
      setError(`書籍追加エラー: ${err.message}`);
      
      // フォールバック: ローカルのみで追加
      const localBook = {
        id: uuidv4(),
        ...newBook,
      };
      setBooks(prev => [...prev, localBook]);
      return localBook;
    }
  };

  const updateBook = async (id, bookData) => {
    const updateData = {
      ...bookData,
      updatedAt: new Date().toISOString()
    };

    // Firebaseが利用できない場合はローカルのみで更新
    if (!database) {
      setBooks(prev => prev.map(book => 
        book.id === id ? { ...book, ...updateData } : book
      ));
      return;
    }

    try {
      // Firebase で更新
      const bookRef = ref(database, `books/${id}`);
      await update(bookRef, updateData);
    } catch (err) {
      console.error('Error updating book in Firebase:', err);
      setError(`書籍更新エラー: ${err.message}`);
      
      // フォールバック: ローカルのみで更新
      setBooks(prev => prev.map(book => 
        book.id === id ? { ...book, ...updateData } : book
      ));
    }
  };

  const deleteBook = async (id) => {
    // Firebaseが利用できない場合はローカルのみで削除
    if (!database) {
      setBooks(prev => prev.filter(book => book.id !== id));
      return;
    }

    try {
      // Firebase から削除
      const bookRef = ref(database, `books/${id}`);
      await remove(bookRef);
    } catch (err) {
      console.error('Error deleting book from Firebase:', err);
      setError(`書籍削除エラー: ${err.message}`);
      
      // フォールバック: ローカルのみで削除
      setBooks(prev => prev.filter(book => book.id !== id));
    }
  };

  const getBook = (id) => {
    return books.find(book => book.id === id);
  };

  const searchBooks = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return books.filter(book => 
      book.title?.toLowerCase().includes(lowercaseQuery) ||
      book.author?.toLowerCase().includes(lowercaseQuery) ||
      book.isbn?.toLowerCase().includes(lowercaseQuery) ||
      book.location?.toLowerCase().includes(lowercaseQuery) ||
      book.managementNumber?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const sortBooksByLocation = (booksArray = books) => {
    return [...booksArray].sort((a, b) => {
      const locationA = a.location?.toLowerCase() || 'zzz';
      const locationB = b.location?.toLowerCase() || 'zzz';
      return locationA.localeCompare(locationB);
    });
  };

  const getBooksByLocation = (location) => {
    return books.filter(book => book.location === location);
  };

  const getLocations = () => {
    const locationSet = new Set();
    books.forEach(book => {
      if (book.location && book.location.trim()) {
        locationSet.add(book.location.trim());
      }
    });
    return Array.from(locationSet).sort();
  };

  const isManagementNumberDuplicate = (managementNumber, excludeId = null) => {
    if (!managementNumber || !managementNumber.trim()) {
      return false;
    }
    return books.some(book => 
      book.id !== excludeId && 
      book.managementNumber && 
      book.managementNumber.trim().toLowerCase() === managementNumber.trim().toLowerCase()
    );
  };

  const value = {
    books,
    loading,
    error,
    connected,
    addBook,
    updateBook,
    deleteBook,
    getBook,
    searchBooks,
    getLocations,
    sortBooksByLocation,
    getBooksByLocation,
    isManagementNumberDuplicate,
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};