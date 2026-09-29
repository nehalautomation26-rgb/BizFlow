import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://biz-flow-beryl.vercel.app/api/analytics/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOverview(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics datasets.');
    } finally {
      setLoading(false);
    }
  };

  const topProducts = overview?.topProducts || [];
  const paymentBreakdown = overview?.paymentBreakdown || [];

  return (
    <div className="analytics-page">
      <div style={{ marginBottom: '28px' }}>
        <h1 className="welcome-title">Sales & Business Performance</h1>
        <p className="welcome-sub">Analyze revenue trends, item velocity, and payment distribution.</p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading business performance data...
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: '32px' }}>
            <div className="stat-card stat-primary">
              <span className="stat-icon">💵</span>
              <div className="stat-info">
                <span className="stat-label">Today's Sales</span>
                <span className="stat-value">Rs. {(overview?.todayRevenue || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card stat-success">
              <span className="stat-icon">💰</span>
              <div className="stat-info">
                <span className="stat-label">Lifetime Revenue</span>
                <span className="stat-value">Rs. {(overview?.totalRevenue || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card stat-purple">
              <span className="stat-icon">🧾</span>
              <div className="stat-info">
                <span className="stat-label">Total Processed Orders</span>
                <span className="stat-value">{overview?.totalOrders || 0}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>🏆 Top Performing Products</h3>
              {topProducts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No product sales recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {topProducts.map((prod, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '700' }}>#{idx + 1} {prod.name || prod._id}</span>
                      <span style={{ fontWeight: '800', color: '#059669' }}>Rs. {(prod.totalRevenue || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>💳 Revenue by Payment Channel</h3>
              {paymentBreakdown.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No payment channel data available.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {paymentBreakdown.map((pb, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '700' }}>{pb._id || 'Cash'}</span>
                      <span style={{ fontWeight: '800', color: '#4f46e5' }}>Rs. {(pb.total || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
