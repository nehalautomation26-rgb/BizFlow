import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'POS Terminal', path: '/pos', icon: '💳' },
    { label: 'Inventory', path: '/inventory', icon: '📦' },
    { label: 'Bookings', path: '/bookings', icon: '📅' },
    { label: 'Customers', path: '/customers', icon: '👥' },
    { label: 'Analytics', path: '/analytics', icon: '📈' },
    { label: 'Subscription', path: '/subscription', icon: '⭐' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">
          <span>⚡</span> BizFlow
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Business OS</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="avatar">{(user.name || 'U').charAt(0).toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white' }}>{user.name || 'User'}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.businessName || 'Business'}</span>
            </div>
          </div>
          <NavLink to="/settings" className="settings-icon-link" title="Account Settings">
            ⚙️
          </NavLink>
        </div>

        <button onClick={handleLogout} className="logout-button">
          Sign Out
        </button>
      </div>
    </aside>
  );
}
