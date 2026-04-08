import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, LayoutDashboard, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const navigate = useNavigate();

  const announcements = [
    <><Truck size={14} /> <span><strong>Free Shipping</strong> on all orders over ₱2,000</span></>,
    <><span><strong>SALE ALERT:</strong> Up to 30% off selected Premium Tiles!</span></>,
    <><span>New arrivals are here. <strong>Explore the 2026 Collection</strong></span></>
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  return (
    <header className="site-header">
      <div className="announcement-bar">
        <div className="container fade-content" key={announcementIndex}>
          {announcements[announcementIndex]}
        </div>
      </div>
      
      <nav className={`navbar ${scrolled ? 'scrolled glass' : ''}`}>
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo">
            <span className="logo-tile">TILE</span>
            <span className="logo-match" style={{ color: 'var(--accent)' }}>MATCH</span>
          </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search tiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/tracking">Track Order</Link>
          {isLoggedIn ? (
            <>
              {isAdmin && <Link to="/admin" className="nav-admin">Admin</Link>}
              <button className="btn btn-ghost btn-sm hide-mobile" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/account" className="btn btn-sm" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)', fontWeight: '700' }}>Login</Link>
          )}
          <Link to="/cart" className="navbar-cart">
            <ShoppingCart size={20} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <Menu size={24} color="var(--primary)" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {menuOpen && <div className="drawer-overlay" onClick={() => setMenuOpen(false)} />}
      
      {/* Mobile Menu Drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="navbar-logo">
            <span className="logo-tile">TILE</span><span style={{ color: 'var(--accent)' }}>MATCH</span>
          </span>
          <button onClick={() => setMenuOpen(false)} className="menu-toggle-close"><X size={24} color="var(--primary)" /></button>
        </div>
        <div className="drawer-content">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/tracking" onClick={() => setMenuOpen(false)}>Track Order</Link>
          {isLoggedIn ? (
            <>
              {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>}
              <button onClick={() => { logout(); setMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <Link to="/account" className="btn" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--primary)', fontWeight: '700' }} onClick={() => setMenuOpen(false)}>Login</Link>
          )}
        </div>
      </div>
    </nav>
    </header>
  );
}
