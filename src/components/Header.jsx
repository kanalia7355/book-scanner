import { Link, NavLink } from 'react-router-dom';
import { BookOpen, Scan, Plus } from 'lucide-react';

const Header = () => {

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

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;