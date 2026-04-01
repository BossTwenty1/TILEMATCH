import { Link } from 'react-router-dom';
import { formatPHP } from '../../utils/helpers';
import { ShoppingCart } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product, onAddToCart }) {
  const stockStatus = product.stock_qty === 0 ? 'out' : product.stock_qty < 10 ? 'low' : 'in';

  return (
    <div className="product-card card">
      <Link to={`/product/${product.id}`} className="product-card-img">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        <span className={`stock-dot ${stockStatus}`} />
      </Link>
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <Link to={`/product/${product.id}`}><h4 className="product-name">{product.name}</h4></Link>
        <div className="product-card-footer">
          <span className="product-price">{formatPHP(product.price)}</span>
          {stockStatus !== 'out' && (
            <button className="btn btn-primary btn-sm" onClick={() => onAddToCart?.(product.id)} aria-label="Add to Cart">
              <ShoppingCart size={14} />
            </button>
          )}
          {stockStatus === 'out' && <span className="badge badge-error">Sold Out</span>}
        </div>
      </div>
    </div>
  );
}
