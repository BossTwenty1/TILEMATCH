import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3><span style={{ color: 'var(--primary)' }}>TILE</span><span style={{ color: 'var(--accent)' }}>MATCH</span></h3>
            <p>Premium tiles for every space. Transform your home with our curated collection of ceramic, porcelain, glass, natural stone, and decorative tiles.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/shop">Shop All Tiles</Link>
            <Link to="/shop?category=Ceramic">Ceramic</Link>
            <Link to="/shop?category=Porcelain">Porcelain</Link>
            <Link to="/shop?category=Glass">Glass</Link>
          </div>
          <div className="footer-links">
            <h4>Customer Service</h4>
            <Link to="/tracking">Track Order</Link>
            <Link to="/account">My Account</Link>
            <Link to="/cart">Shopping Cart</Link>
          </div>
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p><Mail size={14} /> support@tilematch.com</p>
            <p><Phone size={14} /> 0917-TILE-MATCH</p>
            <p><MapPin size={14} /> Naga City, Camarines Sur</p>
          </div>
          <div className="footer-payments">
            <h4>Payment Methods</h4>
            <div className="payment-pills">
              <span className="payment-pill gcash">GCash</span>
            </div>
            <p className="secure-badge" style={{marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--success)'}}>
              <ShieldCheck size={16} /> Secure Checkout
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} TileMatch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
