import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPHP } from '../utils/helpers';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Cart.css';

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, shippingFee, tax, total, loading } = useCart();
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleQtyChange = async (productId, newQty) => {
    try { await updateQty(productId, newQty); }
    catch (err) { addToast(err.response?.data?.error || 'Error', 'error'); }
  };

  const handleRemove = async (productId) => {
    try { await removeItem(productId); addToast('Item removed'); }
    catch { addToast('Error removing item', 'error'); }
  };

  if (!isLoggedIn) {
    return (
      <div className="page container">
        <div className="empty-state">
          <ShoppingBag size={48} style={{color:'var(--text-muted)', marginBottom: 16}} />
          <h2>Please log in to view your cart</h2>
          <p>You need an account to add items and checkout.</p>
          <Link to="/account" className="btn btn-primary" style={{marginTop:16}}>Login / Register</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page container">
        <div className="empty-state">
          <ShoppingBag size={48} style={{color:'var(--text-muted)', marginBottom: 16}} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any tiles yet.</p>
          <Link to="/shop" className="btn btn-primary" style={{marginTop:16}}>Go Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page">
      <div className="container">
        <h1>Shopping Cart</h1>
        <div className="cart-layout">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.product_id} className="cart-item card">
                <Link to={`/product/${item.product_id}`}><img src={item.image_url} alt={item.name} /></Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.product_id}`}><h4>{item.name}</h4></Link>
                  <span className="product-category">{item.category}</span>
                  <span className="cart-item-price">{formatPHP(item.price)} each</span>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-selector">
                    <button onClick={() => handleQtyChange(item.product_id, Math.max(1, item.quantity - 1))}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQtyChange(item.product_id, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                  <span className="cart-item-total">{formatPHP(item.price * item.quantity)}</span>
                  <button className="btn btn-ghost" onClick={() => handleRemove(item.product_id)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary card card-body">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>{formatPHP(subtotal)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shippingFee === 0 ? <em style={{color:'var(--success)'}}>Free!</em> : formatPHP(shippingFee)}</span></div>
            <div className="summary-row"><span>VAT (12%)</span><span>{formatPHP(tax)}</span></div>
            <hr />
            <div className="summary-row total"><span>Total</span><span>{formatPHP(total)}</span></div>
            {subtotal < 2000 && (
              <p className="free-ship-hint">Add {formatPHP(2000 - subtotal)} more for free shipping!</p>
            )}
            <button className="btn btn-primary btn-lg btn-block" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
