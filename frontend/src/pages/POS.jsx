import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function POS() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const [completedOrder, setCompletedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const searchInputRef = useRef(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchInventoryAndCustomers();
  }, []);

  const fetchInventoryAndCustomers = async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products', getAuthHeader()),
        axios.get('http://localhost:5000/api/customers', getAuthHeader()),
      ]);
      setProducts(prodRes.data || []);
      setCustomers(custRes.data || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response.data.message);
      } else {
        setError('Failed to fetch store inventory or customer directory.');
      }
    }
  };

  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    if (product.quantity <= 0) return;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id);
      if (existing) {
        if (existing.cartQty >= product.quantity) return prevCart;
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, cartQty: item.cartQty + 1 } : item
        );
      }
      return [...prevCart, { ...product, cartQty: 1 }];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item._id === productId) {
            const newQty = item.cartQty + delta;
            if (newQty > item.quantity) return item;
            return newQty > 0 ? { ...item, cartQty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const clearCart = () => setCart([]);

  const grandTotal = cart.reduce((sum, item) => sum + item.price * item.cartQty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setError('');
    setSuccessMsg('');

    const custObj = customers.find((c) => c._id === selectedCustomer);

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.cartQty,
        })),
        paymentMethod,
        customerName: custObj ? custObj.name : 'Walk-in Customer',
        customerPhone: custObj ? custObj.phone : '',
        customerEmail: custObj ? custObj.email : '',
      };

      const res = await axios.post('http://localhost:5000/api/pos/checkout', payload, getAuthHeader());

      setCompletedOrder(res.data.sale);
      setSuccessMsg('Sale recorded successfully!');
      setShowReceipt(true);
      clearCart();
      setSelectedCustomer('');
      fetchInventoryAndCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pos-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
      <div className="pos-catalog-column">
        <div className="card" style={{ marginBottom: '20px', padding: '18px 24px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="🔍 Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <select
                className="select-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>Category: {cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
          {filteredProducts.map((p) => {
            const isOutOfStock = p.quantity <= 0;
            return (
              <div
                key={p._id}
                className="card"
                onClick={() => !isOutOfStock && addToCart(p)}
                style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer', opacity: isOutOfStock ? 0.5 : 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>{p.category || 'General'}</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', marginTop: '4px' }}>{p.name}</h4>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: '800', color: '#4f46e5' }}>Rs. {p.price.toLocaleString()}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: isOutOfStock ? '#991b1b' : '#0369a1' }}>
                    {isOutOfStock ? 'Out of Stock' : `${p.quantity} in stock`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pos-cart-column card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>🛒 Active Sales Ticket</h3>

        {successMsg && <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.875rem' }}>{successMsg}</div>}

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label>Assign Customer</label>
          <select className="select-input" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
            <option value="">-- Walk-in Guest --</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>👤 {c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>Cart is empty</p>
          ) : (
            cart.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: '700' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rs. {item.price} × {item.cartQty}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button className="btn-secondary" style={{ padding: '4px 10px' }} onClick={() => updateCartQty(item._id, -1)}>-</button>
                  <span style={{ fontWeight: '700' }}>{item.cartQty}</span>
                  <button className="btn-secondary" style={{ padding: '4px 10px' }} onClick={() => updateCartQty(item._id, 1)}>+</button>
                  <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.25rem', fontWeight: '800' }}>
            <span>Grand Total:</span>
            <span style={{ color: '#4f46e5' }}>Rs. {grandTotal.toLocaleString()}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {['Cash', 'Card', 'EasyPaisa'].map((method) => (
              <button
                key={method}
                type="button"
                className={paymentMethod === method ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px 0', fontSize: '0.8125rem' }}
                onClick={() => setPaymentMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={clearCart} disabled={cart.length === 0}>Clear</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={handleCheckout} disabled={cart.length === 0 || isProcessing}>
              {isProcessing ? 'Processing...' : 'Complete Sale ➔'}
            </button>
          </div>
        </div>
      </div>

      {showReceipt && completedOrder && (
        <div className="modal-overlay">
          <div className="card" style={{ width: '360px', padding: '24px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: '800' }}>{user.businessName || 'BizFlow POS'}</h2>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666', marginBottom: '4px' }}>Sales Receipt</p>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#666', marginBottom: '12px' }}>Invoice: {completedOrder.invoiceNumber}</p>

            <table style={{ width: '100%', fontSize: '0.8125rem', marginBottom: '12px' }}>
              <tbody>
                {completedOrder.items.map((it, i) => (
                  <tr key={i}>
                    <td>{it.name} x{it.quantity}</td>
                    <td style={{ textAlign: 'right' }}>Rs. {it.subtotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: '1px dashed #ccc', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
              <span>Total Paid ({completedOrder.paymentMethod}):</span>
              <span>Rs. {completedOrder.totalAmount?.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowReceipt(false)}>Close</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => window.print()}>🖨️ Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}