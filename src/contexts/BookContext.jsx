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
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem('books');
    return savedBooks ? JSON.parse(savedBooks) : [];
  });

  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
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
      book.isbn?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const value = {
    books,
    addBook,
    updateBook,
    deleteBook,
    getBook,
    searchBooks,
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};