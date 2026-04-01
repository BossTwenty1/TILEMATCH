import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import './Account.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    setError('');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      addToast('Password reset successfully. Please login with your new password.');
      navigate('/account');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page">
      <div className="container">
        <div className="auth-card card" style={{marginTop: 40}}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h2 style={{marginBottom: 8}}>Reset Password</h2>
              <p className="text-secondary" style={{marginBottom: 24}}>Enter your new password below</p>
              {error && <div className="alert-error" style={{marginBottom: 16}}>{error}</div>}
              
              <div className="input-group" style={{marginBottom: 16}}>
                <label>New Password</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              
              <div className="input-group" style={{marginBottom: 16}}>
                <label>Confirm Password</label>
                <input className="input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              
              <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading} style={{marginTop: 20}}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
