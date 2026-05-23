import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ itemCount: 0, subtotal: 0, shippingFee: 0, tax: 0, total: 0, savings: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) { setItems([]); setTotals({ itemCount: 0, subtotal: 0, shippingFee: 0, tax: 0, total: 0, savings: 0 }); return; }
    try {
      setLoading(true);
      const { data } = await cartAPI.get();
      setItems(data.items || []);
      setTotals({
        itemCount: data.itemCount || 0,
        subtotal: Number(data.subtotal || 0),
        shippingFee: Number(data.shippingFee || 0),
        tax: Number(data.tax || 0),
        total: Number(data.total || 0),
        savings: Number(data.savings || 0)
      });
    } catch {
      setItems([]);
      setTotals({ itemCount: 0, subtotal: 0, shippingFee: 0, tax: 0, total: 0, savings: 0 });
    }
    finally { setLoading(false); }
  }, [isLoggedIn]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    const { data } = await cartAPI.add(productId, quantity);
    await fetchCart();
    return data;
  };

  const updateQty = async (productId, quantity) => {
    await cartAPI.update(productId, quantity);
    await fetchCart();
  };

  const removeItem = async (productId) => {
    await cartAPI.remove(productId);
    await fetchCart();
  };

  const clearCart = () => {
    setItems([]);
    setTotals({ itemCount: 0, subtotal: 0, shippingFee: 0, tax: 0, total: 0, savings: 0 });
  };

  const itemCount = totals.itemCount;
  const subtotal = totals.subtotal;
  const shippingFee = totals.shippingFee;
  const tax = totals.tax;
  const total = totals.total;
  const savings = totals.savings;

  return (
    <CartContext.Provider value={{ items, loading, addItem, updateQty, removeItem, clearCart, fetchCart, itemCount, subtotal, shippingFee, tax, total, savings }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
