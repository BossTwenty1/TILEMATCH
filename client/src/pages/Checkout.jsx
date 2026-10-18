import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI } from '../services/api';
import { getPricedTotals } from '../utils/pricing';
import { formatPHP } from '../utils/helpers';
import { ArrowLeft, ArrowRight, CheckCircle, Gift, Smartphone } from 'lucide-react';
import AddressFields from '../components/AddressFields';
import './Checkout.css';

const Field = React.memo(({ label, name, type = 'text', shipping, setShipping, errors }) => (
  <div className="input-group">
    <label>{label} *</label>
    <input className={`input ${errors[name] ? 'input-error' : ''}`} type={type}
      value={shipping[name]} onChange={e => setShipping(p => ({ ...p, [name]: e.target.value }))} />
    {errors[name] && <span className="error-text">{errors[name]}</span>}
  </div>
));

export default function Checkout() {
  const { items, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    email: user?.email || '', phone: user?.phone || '',
    municipality: user?.address?.municipality || '', city: user?.address?.municipality || user?.address?.city || '',
    barangay: user?.address?.barangay || '', street: user?.address?.street || '',
    postalCode: user?.address?.postalCode || ''
  });
  const [errors, setErrors] = useState({});
  const [orderCompleted, setOrderCompleted] = useState(false);

  const handleAddressChange = React.useCallback((updates) => {
    setShipping((previous) => ({ ...previous, ...updates }));
  }, []);

  const checkoutProductIds = React.useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('tilematch_checkout_items') || '[]').map(Number).filter(Boolean);
    } catch {
      return [];
    }
  }, []);
  const selectedProductIds = checkoutProductIds.length
    ? checkoutProductIds
    : items.filter((item) => !item.is_freebie).map((item) => Number(item.product_id));
  const checkoutItems = items.filter((item) => (
    item.is_freebie
      ? selectedProductIds.includes(Number(item.parent_product_id))
      : selectedProductIds.includes(Number(item.product_id))
  ));
  const checkoutTotals = getPricedTotals(checkoutItems);
  const selectedPaidItems = checkoutItems.filter((item) => !item.is_freebie);

  const validateStep1 = () => {
    const e = {};
    if (!shipping.firstName.trim()) e.firstName = 'Required';
    if (!shipping.lastName.trim()) e.lastName = 'Required';
    if (!shipping.email.trim()) e.email = 'Required';
    if (!shipping.phone.trim()) e.phone = 'Required';
    if (!shipping.municipality.trim()) e.municipality = 'Required';
    if (!shipping.barangay.trim()) e.barangay = 'Required';
    if (!shipping.street.trim()) e.street = 'Required';
    if (!shipping.postalCode.trim()) e.postalCode = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const { data } = await ordersAPI.place({
        municipality: shipping.municipality,
        city: shipping.municipality,
        barangay: shipping.barangay, street: shipping.street,
        postalCode: shipping.postalCode,
        productIds: selectedPaidItems.map((item) => item.product_id)
      });
      setOrderCompleted(true);
      sessionStorage.removeItem('tilematch_checkout_items');
      if (selectedPaidItems.length === items.filter((item) => !item.is_freebie).length) clearCart();
      else await fetchCart();
      addToast('Demo order placed. No payment was collected.');
      navigate(`/confirmation/${data.order.orderNumber}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Error placing order', 'error');
    } finally { setSubmitting(false); }
  };

  if ((items.length === 0 || selectedPaidItems.length === 0) && !orderCompleted) { navigate('/cart'); return null; }

  return (
    <div className="checkout-page page">
      <div className="container">
        <h1>Checkout</h1>
        <p className="gcash-instruction" role="note">Academic demonstration only. No real payments or deliveries. Do not send money.</p>
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}><span>1</span> Shipping</div>
          <div className="step-line" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}><span>2</span> Payment</div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-form">
            {step === 1 && (
              <div className="card card-body">
                <h3>Shipping Details</h3>
                <div className="form-grid">
                  <Field label="First Name" name="firstName" shipping={shipping} setShipping={setShipping} errors={errors} />
                  <Field label="Last Name" name="lastName" shipping={shipping} setShipping={setShipping} errors={errors} />
                  <Field label="Email" name="email" type="email" shipping={shipping} setShipping={setShipping} errors={errors} />
                  <Field label="Phone" name="phone" type="tel" shipping={shipping} setShipping={setShipping} errors={errors} />
                  <AddressFields values={shipping} onChange={handleAddressChange} errors={errors} />
                </div>
                <div className="form-actions">
                  <button className="btn btn-ghost" onClick={() => navigate('/cart')}><ArrowLeft size={16} /> Back to Cart</button>
                  <button className="btn btn-primary btn-lg" onClick={() => { if (validateStep1()) setStep(2); }}>Continue to Payment <ArrowRight size={18} /></button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="card card-body">
                <h3>GCash Payment Simulation</h3>
                <div className="gcash-section">
                  <div className="gcash-info">
                    <Smartphone size={32} className="gcash-icon" />
                    <div>
                      <h4>Simulated academic checkout</h4>
                      <p>No money is collected. Do not send money or enter a real GCash reference.</p>
                    </div>
                  </div>
                  <div className="gcash-details" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <div className="gcash-row"><span>Demo total:</span><strong className="gcash-amount">{formatPHP(checkoutTotals.total)}</strong></div>
                      <div className="gcash-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 12 }}>
                        <span>A DEMO reference will be generated automatically.</span>
                      </div>
                    </div>
                  </div>
                  <p className="gcash-instruction">Click "Confirm Demo Order" to complete the simulation without payment.</p>
                </div>

                <h4 style={{marginTop:24}}>Order Summary</h4>
                {checkoutItems.map(item => (
                  <div key={`${item.is_freebie ? 'freebie' : 'item'}-${item.parent_product_id || item.product_id}-${item.product_id}`} className={`checkout-item ${item.is_freebie ? 'checkout-freebie' : ''}`}>
                    <span>{item.is_freebie && <Gift size={14} />} {item.is_freebie ? `[Bonus] ${item.name}` : item.name} x {item.quantity}</span>
                    <span>{item.is_freebie ? 'FREE' : formatPHP(item.line_total ?? item.price * item.quantity)}</span>
                  </div>
                ))}

                <div className="form-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
                  <button className="btn btn-accent btn-lg" onClick={handlePlaceOrder} disabled={submitting}>
                    {submitting ? 'Placing Demo Order...' : <><CheckCircle size={18} /> Confirm Demo Order</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-summary card card-body">
            <h3>Summary</h3>
            <div className="summary-row"><span>Items ({selectedPaidItems.length})</span><span>{formatPHP(checkoutTotals.subtotal)}</span></div>
            {checkoutTotals.savings > 0 && <div className="summary-row promo-savings"><span>Promo Savings</span><span>-{formatPHP(checkoutTotals.savings)}</span></div>}
            <div className="summary-row"><span>Shipping</span><span>{checkoutTotals.shippingFee === 0 ? 'Free' : formatPHP(checkoutTotals.shippingFee)}</span></div>
            <hr />
            <div className="summary-row total"><span>Total</span><span>{formatPHP(checkoutTotals.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
