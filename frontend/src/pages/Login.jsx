import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Branding Panel */}
      <div className="auth-brand-panel">
        <div className="brand-logo">
          <span className="brand-icon">⚡</span> BizFlow
        </div>
        <div className="auth-hero-content">
          <h1>Supercharge your business operations.</h1>
          <p>All-in-one POS, Inventory, Appointments, and Sales Analytics built for growth.</p>
          <div className="auth-feature-pills">
            <span className="auth-pill">⚡ Instant POS</span>
            <span className="auth-pill">📦 Automated Inventory</span>
            <span className="auth-pill">📊 Real-time Reports</span>
          </div>
        </div>
        <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>© 2026 BizFlow OS. All rights reserved.</p>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Log in to manage your daily business operations</p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to BizFlow'}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Start 14-day free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}