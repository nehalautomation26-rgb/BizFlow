import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Subscription() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const calculateDaysLeft = () => {
    if (!user.trialExpiresAt) return 0;
    const diff = new Date(user.trialExpiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleSelectPlan = async (planName) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const res = await axios.post(
        'https://biz-flow-beryl.vercel.app/api/auth/subscribe',
        { plan: planName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update stored user details
      const updatedUser = { ...user, subscriptionStatus: res.data.subscriptionStatus, plan: res.data.plan };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage(res.data.message);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upgrade failed');
    } finally {
      setLoading(false);
    }
  };

  const daysLeft = calculateDaysLeft();

  return (
    <div>
      <nav className="navbar">
        <h2>BizFlow Subscription & Pricing</h2>
        <button onClick={() => navigate('/dashboard')} className="nav-btn">
          Dashboard
        </button>
      </nav>

      <div className="inventory-container" style={{ maxWidth: '1000px' }}>
        {message && <div className="card" style={{ background: '#c6f6d5', color: '#22543d', padding: '12px', marginBottom: '15px' }}>{message}</div>}
        {error && <div className="error-msg">{error}</div>}

        <div className="card" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h3>Current Plan Status</h3>
          <p style={{ marginTop: '8px', fontSize: '15px' }}>
            <strong>Plan:</strong> {user.plan || 'Free Trial'} |{' '}
            <strong>Status:</strong>{' '}
            <span style={{ color: user.subscriptionStatus === 'Active' ? '#2f855a' : '#c53030', fontWeight: 'bold' }}>
              {user.subscriptionStatus || 'Trial'}
            </span>
          </p>
          {user.subscriptionStatus === 'Trial' && (
            <p style={{ marginTop: '5px', fontSize: '14px', color: '#4a5568' }}>
              ⏳ <strong>{daysLeft} days remaining</strong> in your 14-day free trial.
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {/* Starter Plan */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #4299e1' }}>
            <div>
              <h3>Starter</h3>
              <h2 style={{ color: '#2b6cb0', margin: '15px 0' }}>Rs. 2,999 <span style={{ fontSize: '14px', color: '#718096' }}>/mo</span></h2>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li>✅ Up to 100 Products</li>
                <li>✅ Full POS Terminal</li>
                <li>✅ Basic Analytics</li>
                <li>❌ Email Notifications</li>
              </ul>
            </div>
            <button
              disabled={loading || user.plan === 'Starter'}
              onClick={() => handleSelectPlan('Starter')}
              className="btn-primary"
              style={{ marginTop: '20px', width: '100%' }}
            >
              {user.plan === 'Starter' ? 'Current Plan' : 'Select Starter'}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #2b6cb0', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
            <div>
              <span style={{ background: '#ebf8ff', color: '#2b6cb0', fontSize: '12px', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>MOST POPULAR</span>
              <h3 style={{ marginTop: '5px' }}>Pro Business</h3>
              <h2 style={{ color: '#2b6cb0', margin: '15px 0' }}>Rs. 5,999 <span style={{ fontSize: '14px', color: '#718096' }}>/mo</span></h2>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li>✅ Unlimited Products</li>
                <li>✅ Full POS & Receipts</li>
                <li>✅ Appointment Booking System</li>
                <li>✅ Automated Email Receipts</li>
                <li>✅ Advanced Analytics</li>
              </ul>
            </div>
            <button
              disabled={loading || user.plan === 'Pro'}
              onClick={() => handleSelectPlan('Pro')}
              className="btn-primary"
              style={{ marginTop: '20px', width: '100%', background: '#2b6cb0' }}
            >
              {user.plan === 'Pro' ? 'Current Plan' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #805ad5' }}>
            <div>
              <h3>Enterprise</h3>
              <h2 style={{ color: '#6b46c1', margin: '15px 0' }}>Rs. 11,999 <span style={{ fontSize: '14px', color: '#718096' }}>/mo</span></h2>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li>✅ Everything in Pro</li>
                <li>✅ Custom Loyalty Program</li>
                <li>✅ Priority Support</li>
                <li>✅ Multi-Location Ready</li>
              </ul>
            </div>
            <button
              disabled={loading || user.plan === 'Enterprise'}
              onClick={() => handleSelectPlan('Enterprise')}
              className="btn-primary"
              style={{ marginTop: '20px', width: '100%', background: '#6b46c1' }}
            >
              {user.plan === 'Enterprise' ? 'Current Plan' : 'Select Enterprise'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
