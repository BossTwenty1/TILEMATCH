import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPHP, getStockBadge } from '../utils/helpers';
import { ShoppingCart, Minus, Plus, ArrowLeft, ZoomIn } from 'lucide-react';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    productsAPI.getById(id)
      .then(({ data }) => { setProduct(data); setSelectedImage(0); })
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = async () => {
    if (!isLoggedIn) { navigate('/account'); return; }
    try {
      const { data } = await addItem(product.id, quantity);
      addToast(data.message || 'Added to cart!');
      setQuantity(1);
    } catch (err) {
      addToast(err.response?.data?.error || 'Error', 'error');
    }
  };

  if (loading) return <div className="page container"><div className="skeleton" style={{height:500,borderRadius:12}} /></div>;
  if (!product) return null;

  const images = product.images || [product.image_url];
  const stock = getStockBadge(product.stock_qty);
  const outOfStock = product.stock_qty === 0;

  return (
    <div className="product-detail page">
      <div className="container">
        <button className="btn btn-ghost" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>

        <div className="pd-layout">
          <div className="pd-gallery">
            <div className="pd-main-image" onClick={() => setZoomed(!zoomed)}>
              <img src={images[selectedImage]} alt={product.name} className={zoomed ? 'zoomed' : ''} />
              <span className="zoom-hint"><ZoomIn size={16} /> Click to zoom</span>
            </div>
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((img, i) => (
                  <button key={i} className={`pd-thumb ${i === selectedImage ? 'active' : ''}`} onClick={() => setSelectedImage(i)}>
                    <img src={img} alt={`View ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pd-info">
            <span className="product-category">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="pd-price">{formatPHP(product.price)} <span>per piece</span></p>
            <span className={`badge ${stock.className}`}>{stock.label} {!outOfStock && `(${product.stock_qty} pcs)`}</span>

            <p className="pd-desc">{product.description}</p>

            <div className="pd-specs">
              <h4>Specifications</h4>
              <table>
                <tbody>
                  <tr><td>Category</td><td>{product.category}</td></tr>
                  <tr><td>Material</td><td>{product.material}</td></tr>
                  <tr><td>Size</td><td>{product.size}cm</td></tr>
                  <tr><td>Color</td><td>{product.color}</td></tr>
                  <tr><td>Room Application</td><td>{product.room_application}</td></tr>
                  {(product.characteristics || []).map(c => (
                    <tr key={c.attr_key}><td>{c.attr_key}</td><td>{c.attr_value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!outOfStock && (
              <div className="pd-actions">
                <div className="qty-selector">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}><Plus size={16} /></button>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleAdd}>
                  <ShoppingCart size={18} /> Add to Cart — {formatPHP(product.price * quantity)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
