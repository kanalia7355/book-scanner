import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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

  // 研究室共有データとしてLocalStorageに保存
  const STORAGE_KEY = 'lab_books_shared';

  // 初回読み込み時にデータを取得
  useEffect(() => {
    const savedBooks = localStorage.getItem(STORAGE_KEY);
    setBooks(savedBooks ? JSON.parse(savedBooks) : []);
  }, []);

  // データ変更時にLocalStorageに保存
  useEffect(() => {
    if (books.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }
  }, [books]);

  const addBook = (bookData) => {
    const newBook = {
      id: uuidv4(),
      ...bookData,
      addedAt: new Date().toISOString(),
      // 画像URLが外部URLの場合はそのまま、ローカル画像はBase64として保存
      imageUrl: bookData.imageUrl || null,
    };
    setBooks(prev => [...prev, newBook]);
    return newBook;
  };

  const updateBook = (id, bookData) => {
    setBooks(prev => prev.map(book => 
      book.id === id ? { ...book, ...bookData, updatedAt: new Date().toISOString() } : book
    ));
  };

  const deleteBook = (id) => {
    setBooks(prev => prev.filter(book => book.id !== id));
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