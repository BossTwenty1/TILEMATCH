import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { formatPHP, ORDER_STATUSES, getStatusIndex } from '../utils/helpers';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import './Tracking.css';

const STATUS_ICONS = [Clock, Package, Truck, CheckCircle];

export default function Tracking() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('order')) handleSearch(searchParams.get('order'));
  }, []);

  const handleSearch = async (num) => {
    const query = num || orderNumber;
    if (!query.trim()) return;
    setLoading(true); setError('');
    try {
      const { data } = await ordersAPI.track(query.trim());
      setOrder(data);
    } catch { setError('Order not found. Please check the order number.'); setOrder(null); }
    finally { setLoading(false); }
  };

  const statusIdx = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="tracking-page page">
      <div className="container">
        <div className="tracking-header">
          <h1>Track Your Order</h1>
          <p className="text-secondary">Enter your order number to see delivery status</p>
        </div>

        <div className="tracking-search card card-body">
          <div className="tracking-input">
            <input className="input" placeholder="Enter Order Number (e.g. ORD-2025-0001)" value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button className="btn btn-primary" onClick={() => handleSearch()} disabled={loading}>
              <Search size={18} /> {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </div>

        {error && <div className="alert-error" style={{maxWidth:600,margin:'20px auto',textAlign:'center'}}>{error}</div>}

        {order && (
          <div className="tracking-result card card-body">
            <div className="tracking-order-header">
              <div><h3>Order {order.order_number}</h3><span className="text-secondary">{new Date(order.created_at).toLocaleDateString()}</span></div>
              <span className={`badge badge-${order.status === 'Delivered' ? 'success' : order.status === 'Shipped' ? 'info' : order.status === 'Processing' ? 'warning' : 'primary'}`}>{order.status}</span>
            </div>

            <div className="status-timeline">
              {ORDER_STATUSES.map((s, i) => {
                const Icon = STATUS_ICONS[i];
                const isActive = i <= statusIdx;
                return (
                  <div key={s} className={`timeline-step ${isActive ? 'active' : ''}`}>
                    <div className="timeline-icon"><Icon size={20} /></div>
                    <span>{s}</span>
                    {i < 3 && <div className={`timeline-line ${i < statusIdx ? 'active' : ''}`} />}
                  </div>
                );
              })}
            </div>

            <div className="tracking-details">
              <div className="tracking-section">
                <h4>Items</h4>
                {(order.items || []).map((item, i) => (
                  <div key={i} className="checkout-item">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>{formatPHP(item.line_total)}</span>
                  </div>
                ))}
              </div>
              <div className="tracking-section">
                <h4>Shipping Address</h4>
                <p>{order.ship_street}, {order.ship_barangay}<br/>{order.ship_city}, {order.ship_municipality} {order.ship_postal_code}</p>
              </div>
              <div className="tracking-section">
                <h4>Payment</h4>
                <p>GCash Ref: <strong>{order.payment_ref}</strong></p>
                <p>Total: <strong>{formatPHP(order.total)}</strong></p>
                {order.estimated_delivery && <p>Est. Delivery: <strong>{new Date(order.estimated_delivery).toLocaleDateString()}</strong></p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
