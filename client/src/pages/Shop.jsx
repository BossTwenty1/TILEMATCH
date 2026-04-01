import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/shop/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';
import './Shop.css';

const CATEGORIES = ['Ceramic', 'Porcelain', 'Glass', 'Natural Stone', 'Decorative'];
const SIZES = ['20x20', '30x30', '40x40', '60x60', '30x60'];
const ROOMS = ['Floor', 'Wall', 'Outdoor', 'Bathroom', 'Kitchen'];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') ? [searchParams.get('category')] : [],
    material: [], color: [], size: [], room: [],
    minPrice: '', maxPrice: '',
    sort: searchParams.get('sort') || 'newest'
  });
  const [filterOptions, setFilterOptions] = useState({ materials: [], colors: [] });
  const [showFilters, setShowFilters] = useState(false);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    productsAPI.getFilterOptions().then(({ data }) => setFilterOptions(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort: filters.sort, limit: 40 };
    if (filters.search) params.search = filters.search;
    if (filters.category.length) params.category = filters.category.join(',');
    if (filters.material.length) params.material = filters.material.join(',');
    if (filters.color.length) params.color = filters.color.join(',');
    if (filters.size.length) params.size = filters.size.join(',');
    if (filters.room.length) params.room = filters.room.join(',');
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;

    productsAPI.getAll(params)
      .then(({ data }) => setProducts(data?.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const toggleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => setFilters({
    search: '', category: [], material: [], color: [], size: [], room: [],
    minPrice: '', maxPrice: '', sort: 'newest'
  });

  const activeFilterCount = filters.category.length + filters.material.length + filters.color.length + filters.size.length + filters.room.length + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0);

  const handleAddToCart = async (productId) => {
    if (!isLoggedIn) { navigate('/account'); return; }
    try {
      const { data } = await addItem(productId, 1);
      addToast(data.message || 'Added to cart!');
    } catch (err) {
      addToast(err.response?.data?.error || 'Error', 'error');
    }
  };

  return (
    <div className="shop-page page">
      <div className="container">
        <div className="shop-header">
          <div>
            <h1>Shop Tiles</h1>
            <p className="text-secondary">{products.length} products found</p>
          </div>
          <div className="shop-controls">
            <button className="btn btn-secondary btn-sm filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            <select className="input" value={filters.sort} onChange={e => setFilters(p => ({...p, sort: e.target.value}))}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="best">Best Sellers</option>
            </select>
          </div>
        </div>

        <div className="shop-layout">
          <aside className={`shop-sidebar ${showFilters ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              {activeFilterCount > 0 && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All</button>}
              <button className="btn btn-ghost filter-close" onClick={() => setShowFilters(false)}><X size={20} /></button>
            </div>

            <div className="filter-group">
              <h4>Search</h4>
              <input className="input" placeholder="Search tiles..." value={filters.search} onChange={e => setFilters(p => ({...p, search: e.target.value}))} />
            </div>

            <div className="filter-group">
              <h4>Category</h4>
              {CATEGORIES.map(c => (
                <label key={c} className="filter-checkbox">
                  <input type="checkbox" checked={filters.category.includes(c)} onChange={() => toggleFilter('category', c)} />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Price Range (PHP)</h4>
              <div className="price-inputs">
                <input className="input" type="number" placeholder="Min" value={filters.minPrice} onChange={e => setFilters(p => ({...p, minPrice: e.target.value}))} />
                <span>—</span>
                <input className="input" type="number" placeholder="Max" value={filters.maxPrice} onChange={e => setFilters(p => ({...p, maxPrice: e.target.value}))} />
              </div>
            </div>

            <div className="filter-group">
              <h4>Size</h4>
              {SIZES.map(s => (
                <label key={s} className="filter-checkbox">
                  <input type="checkbox" checked={filters.size.includes(s)} onChange={() => toggleFilter('size', s)} />
                  <span>{s}cm</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Material</h4>
              {(filterOptions.materials || []).map(m => (
                <label key={m} className="filter-checkbox">
                  <input type="checkbox" checked={filters.material.includes(m)} onChange={() => toggleFilter('material', m)} />
                  <span>{m}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <h4>Color</h4>
              <div className="color-swatches">
                {(filterOptions.colors || []).map(c => (
                  <button key={c} className={`color-swatch ${filters.color.includes(c) ? 'active' : ''}`} title={c} onClick={() => toggleFilter('color', c)}>{c}</button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Room</h4>
              {ROOMS.map(r => (
                <label key={r} className="filter-checkbox">
                  <input type="checkbox" checked={filters.room.includes(r)} onChange={() => toggleFilter('room', r)} />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </aside>

          <main className="shop-products">
            {loading ? (
              <div className="grid grid-4">
                {[...Array(8)].map((_,i) => <div key={i} className="skeleton" style={{height:300,borderRadius:8}} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <h3>No tiles found</h3>
                <p>Try adjusting your filters or search term.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-4">{(products || []).map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />)}</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
