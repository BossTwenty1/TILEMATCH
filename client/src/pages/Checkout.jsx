import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI } from '../services/api';
import { formatPHP, generateGCashRef } from '../utils/helpers';
import { ArrowLeft, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';
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
  const { items, subtotal, shippingFee, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [gcashRef, setGcashRef] = useState('');
  const [shipping, setShipping] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    email: user?.email || '', phone: user?.phone || '',
    municipality: user?.address?.municipality || '', city: user?.address?.city || '',
    barangay: user?.address?.barangay || '', street: user?.address?.street || '',
    postalCode: user?.address?.postalCode || ''
  });
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const e = {};
    if (!shipping.firstName.trim()) e.firstName = 'Required';
    if (!shipping.lastName.trim()) e.lastName = 'Required';
    if (!shipping.email.trim()) e.email = 'Required';
    if (!shipping.phone.trim()) e.phone = 'Required';
    if (!shipping.municipality.trim()) e.municipality = 'Required';
    if (!shipping.city.trim()) e.city = 'Required';
    if (!shipping.barangay.trim()) e.barangay = 'Required';
    if (!shipping.street.trim()) e.street = 'Required';
    if (!shipping.postalCode.trim()) e.postalCode = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!gcashRef.trim()) {
      return addToast('Please enter your GCash Reference Number', 'error');
    }
    setSubmitting(true);
    try {
      const { data } = await ordersAPI.place({
        municipality: shipping.municipality, city: shipping.city,
        barangay: shipping.barangay, street: shipping.street,
        postalCode: shipping.postalCode, paymentRef: gcashRef
      });
      clearCart();
      addToast('Order placed successfully!');
      navigate(`/confirmation/${data.order.orderNumber}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Error placing order', 'error');
    } finally { setSubmitting(false); }
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="checkout-page page">
      <div className="container">
        <h1>Checkout</h1>
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
                  <Field label="Municipality" name="municipality" shipping={shipping} setShipping={setShipping} errors={errors} />
                  <Field label="City" name="city" shipping={shipping} setShipping={setShipping} errors={errors} />
                  <Field label="Barangay" name="barangay" shipping={shipping} setShipping={setShipping} errors={errors} />
                  <Field label="Street + House No." name="street" shipping={shipping} setShipping={setShipping} errors={errors} />
                  <Field label="Postal Code" name="postalCode" shipping={shipping} setShipping={setShipping} errors={errors} />
                </div>
                <div className="form-actions">
                  <button className="btn btn-ghost" onClick={() => navigate('/cart')}><ArrowLeft size={16} /> Back to Cart</button>
                  <button className="btn btn-primary btn-lg" onClick={() => { if (validateStep1()) setStep(2); }}>Continue to Payment <ArrowRight size={18} /></button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="card card-body">
                <h3>GCash Payment</h3>
                <div className="gcash-section">
                  <div className="gcash-info">
                    <Smartphone size={32} className="gcash-icon" />
                    <div>
                      <h4>Pay via GCash</h4>
                      <p>Send the exact amount to the number below:</p>
                    </div>
                  </div>
                  <div className="gcash-details">
                    <div className="gcash-row"><span>GCash Number:</span><strong>0917-TILE-MATCH</strong></div>
                    <div className="gcash-row"><span>Amount to Pay:</span><strong className="gcash-amount">{formatPHP(total)}</strong></div>
                    <div className="gcash-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 12 }}>
                      <span style={{ marginBottom: 8, fontWeight: 500 }}>Reference No *</span>
                      <input 
                        className="input" 
                        placeholder="Enter the 13-digit reference number" 
                        value={gcashRef} 
                        onChange={e => setGcashRef(e.target.value)} 
                        required 
                        style={{ width: '100%', maxWidth: 300 }}
                      />
                    </div>
                  </div>
                  <p className="gcash-instruction">After sending payment via GCash, click "Confirm Order" below.</p>
                </div>

                <h4 style={{marginTop:24}}>Order Summary</h4>
                {items.map(item => (
                  <div key={item.product_id} className="checkout-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatPHP(item.price * item.quantity)}</span>
                  </div>
                ))}

                <div className="form-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
                  <button className="btn btn-accent btn-lg" onClick={handlePlaceOrder} disabled={submitting}>
                    {submitting ? 'Placing Order...' : <><CheckCircle size={18} /> Confirm Order</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-summary card card-body">
            <h3>Summary</h3>
            <div className="summary-row"><span>Items ({items.length})</span><span>{formatPHP(subtotal)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shippingFee === 0 ? 'Free' : formatPHP(shippingFee)}</span></div>
            <div className="summary-row"><span>VAT (12%)</span><span>{formatPHP(tax)}</span></div>
            <hr />
            <div className="summary-row total"><span>Total</span><span>{formatPHP(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
