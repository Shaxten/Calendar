import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Notes from './pages/Notes';

function Navigation() {
  const { user, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      padding: '1rem',
      background: '#6c757d',
      borderBottom: '1px solid #555',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#fff' }}>📅 Calendar App</Link>
        
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#fff',
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>

        <ul style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }} className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <li><Link to="/" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none' }}>Home</Link></li>
          {user && <li><Link to="/calendar" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none' }}>Calendar</Link></li>}
          {user && <li><Link to="/notes" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none' }}>Notes</Link></li>}
          {user && <li><Link to="/profile" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none' }}>{profile?.display_name}</Link></li>}
          {!user && <li><Link to="/auth" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none' }}>Sign In</Link></li>}
          {user && <li><button onClick={() => { signOut(); setMenuOpen(false); }} style={{ background: '#495057', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Sign Out</button></li>}
        </ul>
      </div>
      <style>{`
        .mobile-menu-btn {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          .nav-links {
            position: absolute;
            top: 60px;
            left: 0;
            right: 0;
            background: #6c757d;
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: none !important;
            gap: 1rem !important;
            z-index: 1000;
          }
          .nav-links.open {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
