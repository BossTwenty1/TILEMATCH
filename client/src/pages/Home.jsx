import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/shop/ProductCard';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Box, Gem, Droplet, Mountain, Palette } from 'lucide-react';
import './Home.css';

const CATEGORIES = [
  { name: 'Ceramic', img: 'https://i.pinimg.com/1200x/97/ef/c7/97efc771707947ca02f70ee2eeeb4e22.jpg', icon: <Box size={24} />, desc: 'Versatile & affordable' },
  { name: 'Porcelain', img: 'https://i.pinimg.com/736x/98/3d/1a/983d1afb4adc6e652dec2b97cf2e856d.jpg', icon: <Gem size={24} />, desc: 'Durable & elegant' },
  { name: 'Glass', img: 'https://i.pinimg.com/1200x/07/9d/da/079ddaf41439dd1bd33af02c5281c928.jpg', icon: <Droplet size={24} />, desc: 'Modern & luminous' },
  { name: 'Natural Stone', img: 'https://i.pinimg.com/736x/d9/5e/c2/d95ec2b5a0f585eb79e265df00c27563.jpg', icon: <Mountain size={24} />, desc: 'Timeless beauty' },
  { name: 'Decorative', img: 'https://i.pinimg.com/736x/8c/26/51/8c26511e4c2a46903f0e9c74f6a0ce15.jpg', icon: <Palette size={24} />, desc: 'Artistic accent' }
];

const ROOMS = [
  { name: 'Kitchen', img: 'https://i.pinimg.com/736x/08/2a/e1/082ae1328dd98a72f2b9401a7537dca5.jpg', text: 'Classic & Modern Backsplashes' },
  { name: 'Bathroom', img: 'https://i.pinimg.com/1200x/0a/f9/9c/0af99c23e4af045a5d3dfe108acc31cf.jpg', text: 'Spa-like Retreats' },
  { name: 'Outdoor', img: 'https://i.pinimg.com/1200x/a4/f6/76/a4f676b406d952f50bab87fc99fbee3a.jpg', text: 'Durable Patios & Pools' },
  { name: 'Living Area', img: 'https://i.pinimg.com/736x/52/d0/d3/52d0d3072e476fd48197f5d2f3a90d7f.jpg', text: 'Warm & Inviting Spaces' }
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

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.1 });
    
    setTimeout(() => {
      document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));
    }, 100);
    return () => observer.disconnect();
  }, [loading]);

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
      <section className="hero fade-in-section">
        <video autoPlay muted loop playsInline className="hero-video">
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />

        <div className="container hero-content">
          <div className="hero-text glass">
            <span className="hero-badge">Premium Collection 2026</span>
            <h1>Craft Your Perfect Space with <span className="hero-accent">Luxury Tiles</span></h1>
            <p>Elevate your home with our curated selection of high-end tiles. Experience premium durability coupled with breathtaking modern design.</p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary btn-lg">Shop Collection <ArrowRight size={18} /></Link>
              <Link to="/shop?category=Porcelain" className="btn btn-secondary btn-lg">Explore Porcelain</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES STRIP */}
      <section className="trust-strip fade-in-section">
        <div className="container flex items-center justify-center gap-lg flex-wrap">
          <div className="trust-item"><Truck size={20} /> <strong>Free Delivery</strong> over ₱2,000</div>
          <div className="trust-item"><ShieldCheck size={20} /> <strong>Premium Sourcing</strong></div>
          <div className="trust-item"><RefreshCw size={20} /> <strong>Easy Returns</strong> 30 Days</div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section container fade-in-section">
        <div className="section-header center">
          <h2 className="section-title">Shop by Material</h2>
          <p className="section-subtitle">Discover our 5 premium tile collections tailored for every need.</p>
        </div>
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} key={cat.name} className="category-card-modern">
              <div className="category-img-wrapper">
                <img src={cat.img} alt={cat.name} className="category-img" />
              </div>
              <div className="category-info">
                <h4>{cat.icon} {cat.name}</h4>
                <span>{cat.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SHOP BY ROOM */}
      <section className="section section-light fade-in-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Find Your Inspiration</h2>
            <p className="section-subtitle">Shop tiles categorized by your favorite spaces.</p>
          </div>
          <div className="room-grid">
            {ROOMS.map(room => (
              <Link to="/shop" key={room.name} className="room-card" style={{ backgroundImage: `url(${room.img})` }}>
                <div className="room-overlay" />
                <div className="room-content">
                  <h3>{room.name}</h3>
                  <p>{room.text}</p>
                  <span className="room-cta">Shop {room.name} <ArrowRight size={16} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="section container fade-in-section">
        <div className="flex items-center justify-between section-header">
          <div>
            <h2 className="section-title">Trending Styles</h2>
            <p className="section-subtitle">Our most popular premium selections.</p>
          </div>
          <Link to="/shop?sort=best" className="btn btn-secondary">View All <ArrowRight size={16} /></Link>
        </div>
        {loading ? (
          <div className="grid grid-4" style={{ marginTop: 24 }}>
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div className="grid grid-4" style={{ marginTop: 24 }}>
            {(featured).map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}
          </div>
        )}
      </section>

    </div>
  );
}
