import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookProvider } from './contexts/BookContext';
import Header from './components/Header';
import BookList from './pages/BookList';
import Scanner from './pages/Scanner';
import AddBook from './pages/AddBook';
import BookDetail from './pages/BookDetail';
import EditBook from './pages/EditBook';

function App() {
  return (
    <BookProvider>
      <Router>
        <div id="root">
          <Header />
          <Routes>
            <Route path="/" element={<BookList />} />
            <Route path="/scan" element={<Scanner />} />
            <Route path="/add" element={<AddBook />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/edit/:id" element={<EditBook />} />
          </Routes>
        </div>
      </Router>
    </BookProvider>
  );
}

export default App
