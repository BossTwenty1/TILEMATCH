import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';

export default function Confirmation() {
  const { orderNumber } = useParams();

  return (
    <div className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
        <CheckCircle size={64} style={{ color: 'var(--success)', marginBottom: 20 }} />
        <h1>Order Placed Successfully!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: '12px 0 32px' }}>
          Your order <strong>{orderNumber}</strong> has been confirmed. You will receive a confirmation email shortly.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/tracking?order=${orderNumber}`} className="btn btn-primary btn-lg">
            <Package size={18} /> Track Order
          </Link>
          <Link to="/shop" className="btn btn-secondary btn-lg">
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
