import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) { setItems([]); return; }
    try {
      setLoading(true);
      const { data } = await cartAPI.get();
      setItems(data.items || []);
    } catch { setItems([]); }
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

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const shippingFee = subtotal >= 2000 ? 0 : 200;
  const tax = Math.round(subtotal * 0.12 * 100) / 100;
  const total = Math.round((subtotal + shippingFee + tax) * 100) / 100;

  return (
    <CartContext.Provider value={{ items, loading, addItem, updateQty, removeItem, clearCart, fetchCart, itemCount, subtotal, shippingFee, tax, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
