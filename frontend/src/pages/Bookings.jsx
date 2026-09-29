import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    serviceName: '',
    bookingDate: '',
    timeSlot: '10:00 AM',
    notes: '',
  });

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/bookings', getAuthHeader());
      setBookings(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:5000/api/bookings', formData, getAuthHeader());
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        serviceName: '',
        bookingDate: '',
        timeSlot: '10:00 AM',
        notes: '',
      });
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/bookings/${id}/status`,
        { status: newStatus },
        getAuthHeader()
      );
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`, getAuthHeader());
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete booking');
    }
  };

  const filteredBookings = bookings.filter((b) =>
    filterStatus === 'All' ? true : b.status === filterStatus
  );

  return (
    <div>
      <nav className="navbar">
        <h2>BizFlow Appointments</h2>
        <div>
          <button onClick={() => navigate('/pos')} className="nav-btn">
            💳 POS
          </button>
          <button onClick={() => navigate('/dashboard')} className="nav-btn">
            Dashboard
          </button>
        </div>
      </nav>

      <div className="inventory-container">
        {error && <div className="error-msg">{error}</div>}

        {/* Appointment Creation Form */}
        <div className="card">
          <h3>📅 New Appointment Booking (with Email Notification)</h3>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="e.g., Sara Ahmed"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="e.g., 03001234567"
                required
              />
            </div>

            <div className="form-group">
              <label>Customer Email (for confirmation)</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="e.g., sara@example.com"
              />
            </div>

            <div className="form-group">
              <label>Service Required</label>
              <input
                type="text"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                placeholder="e.g., Hair Styling / Dental Checkup"
                required
              />
            </div>

            <div className="form-group">
              <label>Booking Date</label>
              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Time Slot</label>
              <select
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                className="select-input"
                required
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Notes / Special Requests</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional details..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Book & Send Email
              </button>
            </div>
          </form>
        </div>

        {/* Bookings List & Filter */}
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="booking-header-row">
            <h3>Appointments Schedule</h3>
            <div className="filter-tabs">
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  className={`tab-btn ${filterStatus === st ? 'active' : ''}`}
                  onClick={() => setFilterStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ marginTop: '15px' }}>Loading appointments...</p>
          ) : filteredBookings.length === 0 ? (
            <p style={{ marginTop: '15px' }}>No bookings found under this filter.</p>
          ) : (
            <table className="product-table" style={{ marginTop: '15px' }}>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{new Date(b.bookingDate).toLocaleDateString()}</strong>
                      <div style={{ fontSize: '12px', color: '#718096' }}>{b.timeSlot}</div>
                    </td>
                    <td>
                      <strong>{b.customerName}</strong>
                      {b.notes && <div style={{ fontSize: '11px', color: '#a0aec0' }}>Note: {b.notes}</div>}
                    </td>
                    <td>
                      <div>{b.customerPhone}</div>
                      {b.customerEmail && <div style={{ fontSize: '11px', color: '#718096' }}>{b.customerEmail}</div>}
                    </td>
                    <td>{b.serviceName}</td>
                    <td>
                      <span className={`badge badge-booking-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b._id, e.target.value)}
                        className="select-input-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="btn-delete"
                        style={{ marginLeft: '8px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}