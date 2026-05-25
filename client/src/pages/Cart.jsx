import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPHP } from '../utils/helpers';
import { Gift, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getPricedTotals } from '../utils/pricing';
import './Cart.css';

export default function Cart() {
  const { items, updateQty, removeItem } = useCart();
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [quantityDrafts, setQuantityDrafts] = useState({});
  const [selectedMap, setSelectedMap] = useState({});
  const [selectionTouched, setSelectionTouched] = useState(false);
  const paidItems = items.filter((item) => !item.is_freebie);
  const selectedProductIds = selectionTouched
    ? paidItems.filter((item) => selectedMap[item.product_id]).map((item) => Number(item.product_id))
    : paidItems.map((item) => Number(item.product_id));
  const selectedItems = items.filter((item) => (
    item.is_freebie
      ? selectedProductIds.includes(Number(item.parent_product_id))
      : selectedProductIds.includes(Number(item.product_id))
  ));
  const selectedTotals = getPricedTotals(selectedItems);
  const selectedCount = selectedProductIds.length;
  const allSelected = paidItems.length > 0 && selectedCount === paidItems.length;

  const clampQty = (value, max) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return 1;
    const wholeNumber = Math.floor(numericValue);
    return Math.min(Math.max(wholeNumber, 1), Number(max) || Number.MAX_SAFE_INTEGER);
  };

  const handleQtyChange = async (productId, newQty) => {
    try { await updateQty(productId, newQty); }
    catch (err) {
      addToast(err.response?.data?.error || 'Error', 'error');
      throw err;
    }
  };

  const commitQty = async (item, value) => {
    const nextQty = clampQty(value, item.stock_qty);
    setQuantityDrafts((previous) => ({ ...previous, [item.product_id]: String(nextQty) }));
    await handleQtyChange(item.product_id, nextQty);
  };

  const handleCheckout = async () => {
    try {
      for (const item of paidItems) {
        if (!selectedProductIds.includes(Number(item.product_id))) continue;
        const draft = quantityDrafts[item.product_id];
        if (draft && Number(draft) !== Number(item.quantity)) {
          await commitQty(item, draft);
        }
      }
      if (selectedProductIds.length === 0) {
        addToast('Select at least one product to checkout.', 'error');
        return;
      }
      sessionStorage.setItem('tilematch_checkout_items', JSON.stringify(selectedProductIds));
      navigate('/checkout');
    } catch {
      // Toast is already shown by handleQtyChange.
    }
  };

  const handleRemove = async (productId) => {
    try { await removeItem(productId); addToast('Item removed'); }
    catch { addToast('Error removing item', 'error'); }
  };

  const toggleItem = (productId) => {
    setSelectedMap((previous) => {
      const baseSelection = selectionTouched
        ? previous
        : Object.fromEntries(paidItems.map((item) => [item.product_id, true]));
      return { ...baseSelection, [productId]: !baseSelection[productId] };
    });
    setSelectionTouched(true);
  };

  const toggleAll = () => {
    setSelectionTouched(true);
    if (allSelected) {
      setSelectedMap({});
      return;
    }

    setSelectedMap(Object.fromEntries(paidItems.map((item) => [item.product_id, true])));
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
            <div className="cart-select-row">
              <label>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                Select all products
              </label>
              <span>{selectedCount} of {paidItems.length} selected</span>
            </div>
            {items.map(item => (
              <div key={`${item.is_freebie ? 'freebie' : 'item'}-${item.parent_product_id || item.product_id}-${item.product_id}`} className={`cart-item card ${item.is_freebie ? 'cart-freebie' : ''}`}>
                {!item.is_freebie && (
                  <label className="cart-select-item" aria-label={`Select ${item.name} for checkout`}>
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(Number(item.product_id))}
                      onChange={() => toggleItem(item.product_id)}
                    />
                  </label>
                )}
                <Link to={`/product/${item.product_id}`}><img src={item.image_url} alt={item.name} /></Link>
                <div className="cart-item-info">
                  {item.is_freebie && <span className="cart-bonus-label"><Gift size={14} /> Bonus item</span>}
                  <Link to={`/product/${item.product_id}`}><h4>{item.name}</h4></Link>
                  <span className="product-category">{item.category}</span>
                  {item.promo_message && <span className="cart-promo-message">{item.promo_message}</span>}
                  <span className="cart-item-price">
                    {item.promo_applied && !item.is_freebie && item.effective_price !== item.price ? (
                      <><s>{formatPHP(item.price)}</s> {formatPHP(item.effective_price)} each</>
                    ) : item.is_freebie ? (
                      <><s>{formatPHP(item.price)}</s> FREE</>
                    ) : (
                      <>{formatPHP(item.price)} each</>
                    )}
                  </span>
                </div>
                <div className="cart-item-controls">
                  {item.is_freebie ? (
                    <span className="cart-locked"><Lock size={14} /> Locked</span>
                  ) : (
                    <div className="qty-selector">
                      <button aria-label="Decrease quantity" onClick={() => commitQty(item, item.quantity - 1)}><Minus size={14} /></button>
                      <input
                        className="qty-input"
                        type="number"
                        min="1"
                        max={item.stock_qty}
                        value={quantityDrafts[item.product_id] ?? String(item.quantity)}
                        onChange={(event) => {
                          const value = event.target.value.replace(/[^\d]/g, '');
                          setQuantityDrafts((previous) => ({ ...previous, [item.product_id]: value }));
                        }}
                        onBlur={(event) => commitQty(item, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') event.currentTarget.blur();
                        }}
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <button aria-label="Increase quantity" onClick={() => commitQty(item, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                  )}
                  <span className="cart-item-total">{item.is_freebie ? 'FREE' : formatPHP(item.line_total ?? item.price * item.quantity)}</span>
                  {!item.is_freebie && <button className="btn btn-ghost" onClick={() => handleRemove(item.product_id)}><Trash2 size={16} /></button>}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary card card-body">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Selected Items</span><span>{selectedCount}</span></div>
            <div className="summary-row"><span>Subtotal</span><span>{formatPHP(selectedTotals.subtotal)}</span></div>
            {selectedTotals.savings > 0 && <div className="summary-row promo-savings"><span>Promo Savings</span><span>-{formatPHP(selectedTotals.savings)}</span></div>}
            <div className="summary-row"><span>Shipping</span><span>{selectedTotals.shippingFee === 0 ? <em style={{color:'var(--success)'}}>Free!</em> : formatPHP(selectedTotals.shippingFee)}</span></div>
            <hr />
            <div className="summary-row total"><span>Total</span><span>{formatPHP(selectedTotals.total)}</span></div>
            {selectedCount > 0 && selectedTotals.discountedSubtotal < 2000 && (
              <p className="free-ship-hint">Add {formatPHP(2000 - selectedTotals.discountedSubtotal)} more for free shipping!</p>
            )}
            <button className="btn btn-primary btn-lg btn-block" onClick={handleCheckout} disabled={selectedCount === 0}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
