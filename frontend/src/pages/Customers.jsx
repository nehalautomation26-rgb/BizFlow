import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [redeemPointsInput, setRedeemPointsInput] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data || []);
    } catch (err) {
      setError('Failed to retrieve customer accounts directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/customers', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMsg('Customer account created successfully!');
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer account.');
    }
  };

  const handleRedeemPoints = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setError('');

    const pointsToRedeem = Number(redeemPointsInput);
    if (pointsToRedeem <= 0 || pointsToRedeem > (selectedCustomer.loyaltyPoints || 0)) {
      setError('Invalid points amount or insufficient customer balance.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/customers/${selectedCustomer._id}/redeem`,
        { points: pointsToRedeem },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg(`Successfully redeemed ${pointsToRedeem} points for ${selectedCustomer.name}!`);
      setShowRedeemModal(false);
      setRedeemPointsInput('');
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process points redemption.');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="customers-page">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="welcome-title">Customer Directory & Loyalty</h1>
          <p className="welcome-sub">Manage profiles, track purchase history, and handle points redemptions.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Add New Customer
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {successMsg && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600' }}>
          {successMsg}
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <input
          type="text"
          placeholder="🔍 Search customers by name, phone number, or email address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Customer Accounts Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customer registry...</div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No customer accounts found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9375rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '16px 20px' }}>Customer Name</th>
                <th style={{ padding: '16px 20px' }}>Contact Info</th>
                <th style={{ padding: '16px 20px' }}>Total Spent</th>
                <th style={{ padding: '16px 20px' }}>Loyalty Balance</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '700' }}>
                    <div>👤 {c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                      {c.address || 'No address specified'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div>{c.phone || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email || ''}</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '700', color: '#059669' }}>
                    Rs. {(c.totalSpent || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '16px', fontWeight: '800', fontSize: '0.8125rem' }}>
                      ⭐ {c.loyaltyPoints || 0} Points
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setShowRedeemModal(true);
                      }}
                    >
                      🎁 Redeem Points
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="card" style={{ width: '420px', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>➕ Add New Customer Profile</h3>
            <form onSubmit={handleCreateCustomer}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +92 300 1234567"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. client@example.com"
                />
              </div>

              <div className="form-group">
                <label>Address / Location</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Lahore, Pakistan"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redeem Points Modal */}
      {showRedeemModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="card" style={{ width: '400px', padding: '24px' }}>
            <h3 style={{ marginBottom: '8px' }}>🎁 Redeem Loyalty Points</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Available balance for <strong>{selectedCustomer.name}</strong>: {' '}
              <span style={{ color: '#d97706', fontWeight: '800' }}>{selectedCustomer.loyaltyPoints || 0} Points</span>
            </p>

            <form onSubmit={handleRedeemPoints}>
              <div className="form-group">
                <label>Points to Redeem</label>
                <input
                  type="number"
                  min="1"
                  max={selectedCustomer.loyaltyPoints || 0}
                  required
                  value={redeemPointsInput}
                  onChange={(e) => setRedeemPointsInput(e.target.value)}
                  placeholder="Enter point amount..."
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowRedeemModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Confirm Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}