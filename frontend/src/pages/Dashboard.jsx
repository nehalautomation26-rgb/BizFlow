import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const calculateDaysLeft = () => {
    if (!user.trialExpiresAt) return 0;
    const diff = new Date(user.trialExpiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = calculateDaysLeft();
  const isExpired = user.subscriptionStatus === 'Expired' || (user.subscriptionStatus === 'Trial' && daysLeft === 0);

  useEffect(() => {
    const fetchOverviewStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/analytics/overview', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch live business metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewStats();
  }, []);

  const quickActions = [
    {
      title: '💳 Launch POS Terminal',
      desc: 'Process sales, collect payments, and print invoices.',
      path: '/pos',
      color: '#4f46e5',
    },
    {
      title: '📦 Manage Inventory',
      desc: 'Add products, update stock levels, and set prices.',
      path: '/inventory',
      color: '#0891b2',
    },
    {
      title: '📅 Appointment Bookings',
      desc: 'Schedule slots and manage client bookings.',
      path: '/bookings',
      color: '#d97706',
    },
    {
      title: '👤 Customer Directory',
      desc: 'View customer details and loyalty point balances.',
      path: '/customers',
      color: '#059669',
    },
    {
      title: '📊 Sales & Revenue Analytics',
      desc: 'Inspect revenue charts and product performance.',
      path: '/analytics',
      color: '#7c3aed',
    },
    {
      title: '⭐ Subscription & Plans',
      desc: 'Upgrade your business plan and unlock features.',
      path: '/subscription',
      color: '#ea580c',
    },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Header Greeting Banner */}
      <div className="dashboard-welcome-header">
        <div>
          <h1 className="welcome-title">Good day, {user.name || 'Business Partner'}!</h1>
          <p className="welcome-sub">
            Here is what is happening at <strong>{user.businessName || 'Your Business'}</strong> today.
          </p>
        </div>
        <div className="welcome-plan-tag">
          <span className="plan-label">CURRENT PLAN</span>
          <span className="plan-value">{user.plan || 'Free Trial'}</span>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* Live Business Metrics Grid */}
      <section className="metrics-section">
        <h2 className="section-title">Live Business Overview</h2>
        {loading ? (
          <div className="loading-skeleton-grid">
            <div className="card loading-card">Loading stats...</div>
            <div className="card loading-card">Loading stats...</div>
            <div className="card loading-card">Loading stats...</div>
            <div className="card loading-card">Loading stats...</div>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <span className="stat-icon">💰</span>
              <div className="stat-info">
                <span className="stat-label">Today's Revenue</span>
                <span className="stat-value">Rs. {(stats?.todayRevenue || 0).toLocaleString()}</span>
                <span className="stat-sub">Real-time daily POS sales</span>
              </div>
            </div>

            <div className="stat-card stat-success">
              <span className="stat-icon">📈</span>
              <div className="stat-info">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value">Rs. {(stats?.totalRevenue || 0).toLocaleString()}</span>
                <span className="stat-sub">Lifetime earned revenue</span>
              </div>
            </div>

            <div className="stat-card stat-warning">
              <span className="stat-icon">⚠️</span>
              <div className="stat-info">
                <span className="stat-label">Low Stock Alert</span>
                <span className="stat-value">{stats?.lowStockCount || 0} Items</span>
                <span className="stat-sub">Stock below threshold limit</span>
              </div>
            </div>

            <div className="stat-card stat-info">
              <span className="stat-icon">📅</span>
              <div className="stat-info">
                <span className="stat-label">Pending Bookings</span>
                <span className="stat-value">{stats?.pendingBookingsCount || 0}</span>
                <span className="stat-sub">Appointments awaiting action</span>
              </div>
            </div>

            <div className="stat-card stat-purple">
              <span className="stat-icon">👥</span>
              <div className="stat-info">
                <span className="stat-label">Total Customers</span>
                <span className="stat-value">{stats?.totalCustomersCount || 0}</span>
                <span className="stat-sub">Registered accounts</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Quick Action Cards Grid */}
      <section className="quick-actions-section" style={{ marginTop: '36px' }}>
        <h2 className="section-title">Quick Operating Shortcuts</h2>
        <div className="quick-grid">
          {quickActions.map((action, idx) => {
            const isRestricted = isExpired && action.path !== '/subscription';
            return (
              <div
                key={idx}
                className={`card quick-card ${isRestricted ? 'card-disabled' : ''}`}
                onClick={() => !isRestricted && navigate(action.path)}
              >
                <div className="quick-card-header" style={{ borderLeftColor: action.color }}>
                  <h3>{action.title}</h3>
                </div>
                <p className="quick-card-desc">{action.desc}</p>
                <div className="quick-card-footer">
                  <button
                    className="btn-primary"
                    disabled={isRestricted}
                    style={{ background: isRestricted ? undefined : action.color }}
                  >
                    {isRestricted ? '🔒 Locked' : 'Open Module →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}