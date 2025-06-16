import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BookProvider } from './contexts/BookContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import BookList from './pages/BookList';
import Scanner from './pages/Scanner';
import AddBook from './pages/AddBook';
import BookDetail from './pages/BookDetail';
import EditBook from './pages/EditBook';

function App() {
  return (
    <AuthProvider>
      <BookProvider>
        <Router>
          <PrivateRoute>
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
          </PrivateRoute>
        </Router>
      </BookProvider>
    </AuthProvider>
  );
}

export default App
