import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/shop/ProductCard';
import { formatPHP } from '../utils/helpers';
import { ArrowRight, Truck, Shield, Headphones, Sparkles } from 'lucide-react';
import './Home.css';

const CATEGORIES = [
  { name: 'Ceramic', color: '#c4713b', desc: 'Versatile & affordable' },
  { name: 'Porcelain', color: '#8a8a8a', desc: 'Durable & elegant' },
  { name: 'Glass', color: '#0f52ba', desc: 'Modern & luminous' },
  { name: 'Natural Stone', color: '#5c3317', desc: 'Timeless beauty' },
  { name: 'Decorative', color: '#1a5276', desc: 'Artistic accent' }
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    productsAPI.getAll({ sort: 'best', limit: 8 })
      .then(({ data }) => setFeatured(data?.products || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (productId) => {
    if (!isLoggedIn) { navigate('/account'); return; }
    try {
      const { data } = await addItem(productId, 1);
      addToast(data.message || 'Added to cart!');
    } catch (err) {
      addToast(err.response?.data?.error || 'Error adding to cart', 'error');
    }
  };

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for contrast with white text */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(0,0,0,0.72), rgba(0,0,0,0.9))', zIndex: 1 }} />

        <div className="container hero-content" style={{ position: 'relative', zIndex: 2, padding: '40px 0' }}>
          <div className="hero-text" style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(7px)', border: '1px solid rgba(255,255,255,0.2)', padding: '30px', borderRadius: '14px' }}>
            <span className="hero-badge">Premium Tile Collection</span>
            <h1>Transform Your Space with <span className="hero-accent">Perfect Tiles</span></h1>
            <p>Discover our curated collection of 30+ premium tiles. From timeless ceramic to luxurious natural stone — find the perfect match for every room.</p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-accent btn-lg">Shop Now <ArrowRight size={18} /></Link>
              <Link to="/shop?category=Natural+Stone" className="btn btn-secondary btn-lg">Explore Stone</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-tile-grid">
              <div className="hero-tile" style={{ background: '#e8e0d5' }} />
              <div className="hero-tile" style={{ background: '#c4713b' }} />
              <div className="hero-tile" style={{ background: '#1C1C1C' }} />
              <div className="hero-tile" style={{ background: '#A39171' }} />
            </div>
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="promo-banner">
        <div className="container flex items-center justify-center gap-md">
          <Truck size={20} />
          <span><strong>Free Shipping</strong> on orders above {formatPHP(2000)}</span>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section container">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">Explore our 5 premium tile collections</p>
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} key={cat.name} className="category-card card">
              <div className="category-swatch" style={{ background: cat.color }} />
              <div className="category-info">
                <h4>{cat.name}</h4>
                <span>{cat.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section container">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-subtitle">Our most popular tiles, loved by homeowners</p>
          </div>
          <Link to="/shop?sort=best" className="btn btn-secondary">View All <ArrowRight size={16} /></Link>
        </div>
        {loading ? (
          <div className="grid grid-4" style={{ marginTop: 24 }}>
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 8 }} />)}
          </div>
        ) : (
          <div className="grid grid-4" style={{ marginTop: 24 }}>
            {(featured || []).map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
          </div>
        )}
      </section>

      {/* BRAND STORY */}
      <section className="brand-story">
        <div className="container">
          <div className="brand-story-inner">
            <div className="brand-story-text">
              <span className="hero-badge">Our Story</span>
              <h2>Crafting Beautiful Spaces Since 2020</h2>
              <p>TileMatch was born from a passion for transforming ordinary spaces into extraordinary ones. We partner with the finest tile manufacturers in the Philippines and around the world to bring you a curated collection that combines quality, style, and value.</p>
              <p>Whether you're renovating a cozy bathroom or designing a grand living area, our expert team helps you find the perfect tile match for your vision.</p>
            </div>
            <div className="brand-values">
              <div className="value-item"><Shield size={24} /><div><strong>Quality Guaranteed</strong><span>Every tile passes strict quality standards</span></div></div>
              <div className="value-item"><Headphones size={24} /><div><strong>Expert Support</strong><span>Our team guides you through tile selection</span></div></div>
              <div className="value-item"><Sparkles size={24} /><div><strong>Premium Selection</strong><span>Curated from top manufacturers worldwide</span></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Ready to Transform Your Space?</h2>
          <p>Browse our full collection and find your perfect match today.</p>
          <Link to="/shop" className="btn btn-accent btn-lg" style={{ marginTop: 16 }}>Explore All Tiles <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
