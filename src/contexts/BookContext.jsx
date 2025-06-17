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

  // Firebase Realtime Database参照
  const booksRef = ref(database, 'books');

  // Firebase からリアルタイムでデータを取得
  useEffect(() => {
    console.log('Setting up Firebase listener...');
    
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
      off(booksRef);
    };
  }, []);

  // ローカルストレージにバックアップ保存
  useEffect(() => {
    if (books.length >= 0 && !loading) {
      localStorage.setItem('lab_books_shared', JSON.stringify(books));
    }
  }, [books, loading]);

  const addBook = async (bookData) => {
    try {
      const newBook = {
        ...bookData,
        addedAt: new Date().toISOString(),
        // 画像URLが外部URLの場合はそのまま、ローカル画像はBase64として保存
        imageUrl: bookData.imageUrl || null,
      };
      
      // Firebase に保存（IDは自動生成）
      const newBookRef = push(booksRef);
      await set(newBookRef, newBook);
      
      // IDを含む完全なオブジェクトを返す
      return {
        id: newBookRef.key,
        ...newBook
      };
    } catch (err) {
      console.error('Error adding book to Firebase:', err);
      setError(err.message);
      
      // フォールバック: ローカルのみで追加
      const newBook = {
        id: uuidv4(),
        ...bookData,
        addedAt: new Date().toISOString(),
        imageUrl: bookData.imageUrl || null,
      };
      setBooks(prev => [...prev, newBook]);
      return newBook;
    }
  };

  const updateBook = async (id, bookData) => {
    try {
      const updateData = {
        ...bookData,
        updatedAt: new Date().toISOString()
      };
      
      // Firebase で更新
      const bookRef = ref(database, `books/${id}`);
      await update(bookRef, updateData);
    } catch (err) {
      console.error('Error updating book in Firebase:', err);
      setError(err.message);
      
      // フォールバック: ローカルのみで更新
      setBooks(prev => prev.map(book => 
        book.id === id ? { ...book, ...bookData, updatedAt: new Date().toISOString() } : book
      ));
    }
  };

  const deleteBook = async (id) => {
    try {
      // Firebase から削除
      const bookRef = ref(database, `books/${id}`);
      await remove(bookRef);
    } catch (err) {
      console.error('Error deleting book from Firebase:', err);
      setError(err.message);
      
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
      book.location?.toLowerCase().includes(lowercaseQuery)
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
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};