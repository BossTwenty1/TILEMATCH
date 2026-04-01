import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, authAPI } from '../services/api';
import { formatPHP } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import { User, LogOut, Package, Eye } from 'lucide-react';
import './Account.css';

export default function Account() {
  const { user, isLoggedIn, login, register, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '',
    municipality: '', city: '', barangay: '', street: '', postalCode: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      ordersAPI.history().then(({ data }) => setOrders(data)).catch(() => {});
    }
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      addToast('Welcome back!');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      addToast('Account created successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(formData.email);
      addToast('Password reset link sent to your email.');
      setMode('login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  const Field = React.memo(({ label, name, type = 'text' }) => (
    <div className="input-group">
      <label>{label}</label>
      <input className="input" type={type} value={formData[name]}
        onChange={e => setFormData(p => ({...p, [name]: e.target.value}))} required />
    </div>
  ));

  // Logged in: show profile + orders
  if (isLoggedIn) {
    return (
      <div className="account-page page">
        <div className="container">
          <div className="account-header">
            <div>
              <h1>My Account</h1>
              <p className="text-secondary">Welcome, {user.firstName} {user.lastName}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => { logout(); navigate('/'); }}><LogOut size={16} /> Logout</button>
          </div>

          <div className="account-grid">
            <div className="card card-body">
              <h3><User size={18} /> Profile</h3>
              <div className="profile-detail"><span>Name</span><strong>{user.firstName} {user.lastName}</strong></div>
              <div className="profile-detail"><span>Email</span><strong>{user.email}</strong></div>
              <div className="profile-detail"><span>Phone</span><strong>{user.phone || '—'}</strong></div>
              <div className="profile-detail"><span>Address</span><strong>
                {user.address?.street && `${user.address.street}, ${user.address.barangay}, ${user.address.city}, ${user.address.municipality} ${user.address.postalCode}`}
                {!user.address?.street && '—'}
              </strong></div>
            </div>

            <div className="card card-body">
              <h3><Package size={18} /> Order History</h3>
              {orders.length === 0 ? <p className="text-secondary">No orders yet.</p> : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Order #</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td><strong>{o.order_number}</strong></td>
                          <td>{new Date(o.created_at).toLocaleDateString()}</td>
                          <td>{formatPHP(o.total)}</td>
                          <td><span className={`badge badge-${o.status === 'Delivered' ? 'success' : o.status === 'Shipped' ? 'info' : o.status === 'Processing' ? 'warning' : 'primary'}`}>{o.status}</span></td>
                          <td><button className="btn btn-ghost btn-sm" onClick={() => navigate(`/tracking?order=${o.order_number}`)}><Eye size={14} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in: login/register forms
  return (
    <div className="auth-page page">
      <div className="container">
        <div className="auth-card card">
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Login</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Register</button>
          </div>

          <div className="card-body">
            {mode === 'login' ? (
              <form onSubmit={handleLogin}>
                <h2>Welcome Back</h2>
                <p className="text-secondary">Login to your TileMatch account</p>
                {error && <div className="alert-error">{error}</div>}
                <Field label="Email" name="email" type="email" />
                <Field label="Password" name="password" type="password" />
                <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <a href="#" className="text-secondary" onClick={(e) => { e.preventDefault(); setMode('forgot'); setError(''); }}>Forgot Password?</a>
                </div>
              </form>
            ) : mode === 'forgot' ? (
              <form onSubmit={handleForgotPassword}>
                <h2>Forgot Password</h2>
                <p className="text-secondary">Enter your email and we will send you a reset link.</p>
                {error && <div className="alert-error">{error}</div>}
                <Field label="Email" name="email" type="email" />
                <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading} style={{ marginTop: 20 }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <a href="#" className="text-secondary" onClick={(e) => { e.preventDefault(); setMode('login'); setError(''); }}>Back to Login</a>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <h2>Create Account</h2>
                <p className="text-secondary">Register for a new TileMatch account</p>
                {error && <div className="alert-error">{error}</div>}
                <div className="form-grid">
                  <Field label="First Name" name="firstName" />
                  <Field label="Last Name" name="lastName" />
                  <Field label="Email" name="email" type="email" />
                  <Field label="Password" name="password" type="password" />
                  <Field label="Phone" name="phone" type="tel" />
                  <Field label="Municipality" name="municipality" />
                  <Field label="City" name="city" />
                  <Field label="Barangay" name="barangay" />
                  <Field label="Street + House No." name="street" />
                  <Field label="Postal Code" name="postalCode" />
                </div>
                <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading} style={{marginTop:20}}>
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
