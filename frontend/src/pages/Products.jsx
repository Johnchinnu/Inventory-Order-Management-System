import { useEffect, useState } from 'react';
import { productsApi } from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Package, Search, X } from 'lucide-react';

const emptyForm = { name: '', sku: '', price: '', quantity: '', description: '' };

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product ? {
    name: product.name, sku: product.sku,
    price: product.price, quantity: product.quantity,
    description: product.description || ''
  } : emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
    if (form.quantity === '' || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Valid quantity required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
      if (product) {
        await productsApi.update(product.id, data);
        toast.success('Product updated successfully');
      } else {
        await productsApi.create(data);
        toast.success('Product created successfully');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="btn-close" onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input id="product-name" className={`form-input${errors.name ? ' error' : ''}`} value={form.name} onChange={set('name')} placeholder="e.g. Wireless Keyboard" />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SKU / Code *</label>
                <input id="product-sku" className={`form-input${errors.sku ? ' error' : ''}`} value={form.sku} onChange={set('sku')} placeholder="e.g. WK-001" />
                {errors.sku && <div className="form-error">{errors.sku}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Price (USD) *</label>
                <input id="product-price" type="number" step="0.01" min="0" className={`form-input${errors.price ? ' error' : ''}`} value={form.price} onChange={set('price')} placeholder="0.00" />
                {errors.price && <div className="form-error">{errors.price}</div>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity in Stock *</label>
              <input id="product-quantity" type="number" min="0" className={`form-input${errors.quantity ? ' error' : ''}`} value={form.quantity} onChange={set('quantity')} placeholder="0" />
              {errors.quantity && <div className="form-error">{errors.quantity}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea id="product-description" className="form-textarea" value={form.description} onChange={set('description')} placeholder="Optional product description..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="product-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ product, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      await productsApi.delete(product.id);
      toast.success('Product deleted');
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Delete Product</h2>
          <button className="btn-close" onClick={onClose}><X /></button>
        </div>
        <div className="modal-body">
          <div className="alert alert-danger">
            <Trash2 size={16} />
            This action cannot be undone. The product <strong>"{product.name}"</strong> will be permanently deleted.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button id="confirm-delete-product" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    productsApi.getAll()
      .then(res => setProducts(res.data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const getStockBadge = (qty) => {
    if (qty === 0) return <span className="badge badge-danger">Out of Stock</span>;
    if (qty <= 10) return <span className="badge badge-warning">Low Stock</span>;
    return <span className="badge badge-success">In Stock</span>;
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products in catalog</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="search-wrapper">
            <Search />
            <input
              id="product-search"
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button id="add-product-btn" className="btn btn-primary" onClick={() => { setEditProduct(null); setShowModal(true); }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Package />
            <h3>No products found</h3>
            <p>{search ? 'Try adjusting your search' : 'Add your first product to get started'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{product.id}</td>
                    <td>
                      <div className="td-primary">{product.name}</div>
                      {product.description && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {product.description.length > 50 ? product.description.slice(0, 50) + '…' : product.description}
                        </div>
                      )}
                    </td>
                    <td><span className="badge badge-accent font-mono">{product.sku}</span></td>
                    <td className="td-primary">${parseFloat(product.price).toFixed(2)}</td>
                    <td className="td-primary">{product.quantity}</td>
                    <td>{getStockBadge(product.quantity)}</td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button
                          id={`edit-product-${product.id}`}
                          className="btn btn-secondary btn-sm btn-icon"
                          onClick={() => { setEditProduct(product); setShowModal(true); }}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          id={`delete-product-${product.id}`}
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => setDeleteProduct(product)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSaved={fetchProducts}
        />
      )}
      {deleteProduct && (
        <DeleteConfirm
          product={deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onDeleted={fetchProducts}
        />
      )}
    </div>
  );
}
