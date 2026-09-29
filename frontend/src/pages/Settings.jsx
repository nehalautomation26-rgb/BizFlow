import React, { useState } from 'react';
import axios from 'axios';

export default function Settings() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [name, setName] = useState(currentUser.name || '');
  const [businessName, setBusinessName] = useState(currentUser.businessName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'https://biz-flow-beryl.vercel.app/api/auth/me',
        { name, businessName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Save updated shape into localStorage
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccessMsg('Profile and business details updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page" style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="welcome-title">Account Settings</h1>
        <p className="welcome-sub">Manage your owner profile and operating business identity.</p>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {successMsg && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600' }}>
          {successMsg}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Registered Email (Read-Only)</label>
            <input type="email" value={currentUser.email || ''} disabled style={{ background: '#f8fafc', color: '#64748b' }} />
          </div>

          <div className="form-group">
            <label>Owner Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="form-group">
            <label>Business Name</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Apex Retail Store"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Settings Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
