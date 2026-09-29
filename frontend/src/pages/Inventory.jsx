import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Inventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
  });

  // Edit Mode State
  const [editingId, setEditingId] = useState(null);

  // Helper to attach Auth Token
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/products', getAuthHeader());
      setProducts(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch products');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        // Update product
        await axios.put(
          `http://localhost:5000/api/products/${editingId}`,
          formData,
          getAuthHeader()
        );
        setEditingId(null);
      } else {
        // Create product
        await axios.post('http://localhost:5000/api/products', formData, getAuthHeader());
      }

      setFormData({ name: '', category: '', price: '', quantity: '' });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  // Populate form for Editing
  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
    });
  };

  // Cancel Edit Mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', category: '', price: '', quantity: '' });
  };

  // Delete Product
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, getAuthHeader());
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const lowStockCount = products.filter((p) => p.quantity < 5).length;

  return (
    <div>
      <nav className="navbar">
        <h2>BizFlow Inventory Management</h2>
        <div>
          <button onClick={() => navigate('/dashboard')} className="nav-btn">
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="inventory-container">
        {error && <div className="error-msg">{error}</div>}

        {/* Low Stock Alert Header */}
        {lowStockCount > 0 && (
          <div className="alert-banner">
            ⚠️ Attention: You have <strong>{lowStockCount}</strong> item(s) running low on stock (&lt; 5 units)!
          </div>
        )}

        {/* Product Input Form */}
        <div className="card">
          <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Shampoo 200ml"
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Haircare"
                required
              />
            </div>
            <div className="form-group">
              <label>Price (PKR)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Product Table */}
        <div className="card" style={{ marginTop: '30px' }}>
          <h3>All Products</h3>
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products found. Add your first item above.</p>
          ) : (
            <table className="product-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price (PKR)</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isLowStock = product.quantity < 5;
                  return (
                    <tr key={product._id} className={isLowStock ? 'row-low-stock' : ''}>
                      <td><strong>{product.name}</strong></td>
                      <td>{product.category}</td>
                      <td>Rs. {product.price.toLocaleString()}</td>
                      <td>{product.quantity}</td>
                      <td>
                        {isLowStock ? (
                          <span className="badge badge-low">Low Stock</span>
                        ) : (
                          <span className="badge badge-ok">In Stock</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleEdit(product)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}