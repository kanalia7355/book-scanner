import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Scan, Plus, LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, signOut, displayName, photoURL } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
            <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen />
              書籍管理
            </h1>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <nav>
              <ul className="nav-links">
                <li>
                  <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                    一覧
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/scan" className={({ isActive }) => isActive ? 'active' : ''}>
                    <Scan style={{ verticalAlign: 'middle', marginRight: '4px' }} size={16} />
                    スキャン
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/add" className={({ isActive }) => isActive ? 'active' : ''}>
                    <Plus style={{ verticalAlign: 'middle', marginRight: '4px' }} size={16} />
                    手動追加
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* ユーザー情報 */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={displayName}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <User size={32} style={{ 
                      color: '#666',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '50%',
                      padding: '6px'
                    }} />
                  )}
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: '#666',
                    display: 'none'
                  }}>
                    {displayName}
                  </span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#666',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.borderColor = '#007bff';
                    e.target.style.color = '#007bff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = '#ddd';
                    e.target.style.color = '#666';
                  }}
                >
                  <LogOut size={14} />
                  <span style={{ display: 'none' }}>ログアウト</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;