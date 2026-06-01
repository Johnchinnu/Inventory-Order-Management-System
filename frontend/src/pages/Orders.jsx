import { useEffect, useState } from 'react';
import { ordersApi, customersApi, productsApi } from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Trash2, ShoppingCart, Eye, X, AlertTriangle, Package } from 'lucide-react';

function CreateOrderModal({ onClose, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([customersApi.getAll(), productsApi.getAll()])
      .then(([cRes, pRes]) => {
        setCustomers(cRes.data);
        setProducts(pRes.data.filter(p => p.quantity > 0));
      })
      .catch(err => toast.error(err.message))
      .finally(() => setFetchLoading(false));
  }, []);

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }]);
  const removeItem = (idx) => setItems(i => i.filter((_, ii) => ii !== idx));
  const updateItem = (idx, field, value) => {
    setItems(i => i.map((item, ii) => ii === idx ? { ...item, [field]: value } : item));
  };

  const getProduct = (id) => products.find(p => p.id === parseInt(id));

  const calcTotal = () => items.reduce((sum, item) => {
    const p = getProduct(item.product_id);
    return sum + (p ? parseFloat(p.price) * parseInt(item.quantity || 0) : 0);
  }, 0);

  const validate = () => {
    const e = {};
    if (!customerId) e.customer = 'Please select a customer';
    if (items.length === 0) e.items = 'Add at least one product';
    items.forEach((item, idx) => {
      if (!item.product_id) e[`item_${idx}_product`] = 'Select a product';
      else {
        const p = getProduct(item.product_id);
        if (p && parseInt(item.quantity) > p.quantity) {
          e[`item_${idx}_qty`] = `Max available: ${p.quantity}`;
        }
      }
      if (!item.quantity || parseInt(item.quantity) < 1) e[`item_${idx}_qty`] = 'Min quantity: 1';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await ordersApi.create({
        customer_id: parseInt(customerId),
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      });
      toast.success('Order created successfully!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Order</h2>
          <button className="btn-close" onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {fetchLoading ? (
              <div className="loading-container" style={{ padding: '30px' }}><div className="spinner" /></div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  <select
                    id="order-customer"
                    className={`form-select${errors.customer ? ' error' : ''}`}
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                  >
                    <option value="">— Select a customer —</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                    ))}
                  </select>
                  {errors.customer && <div className="form-error">{errors.customer}</div>}
                </div>

                <div className="section-title" style={{ marginTop: '20px' }}>
                  <Package size={14} color="var(--accent)" />
                  Order Items
                </div>

                {items.map((item, idx) => {
                  const product = getProduct(item.product_id);
                  return (
                    <div key={idx} className="order-item-row">
                      <div>
                        <select
                          id={`order-product-${idx}`}
                          className={`form-select${errors[`item_${idx}_product`] ? ' error' : ''}`}
                          value={item.product_id}
                          onChange={e => updateItem(idx, 'product_id', e.target.value)}
                        >
                          <option value="">— Select product —</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} — ${parseFloat(p.price).toFixed(2)} (Stock: {p.quantity})
                            </option>
                          ))}
                        </select>
                        {errors[`item_${idx}_product`] && <div className="form-error">{errors[`item_${idx}_product`]}</div>}
                      </div>
                      <div>
                        <input
                          id={`order-qty-${idx}`}
                          type="number" min="1"
                          max={product ? product.quantity : undefined}
                          className={`form-input${errors[`item_${idx}_qty`] ? ' error' : ''}`}
                          value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                        />
                        {errors[`item_${idx}_qty`] && <div className="form-error">{errors[`item_${idx}_qty`]}</div>}
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}

                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginTop: '8px' }}>
                  <Plus size={14} /> Add Item
                </button>

                {calcTotal() > 0 && (
                  <div style={{
                    marginTop: '16px', padding: '14px', background: 'var(--accent-light)',
                    border: '1px solid var(--border-hover)', borderRadius: 'var(--radius-sm)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Estimated Total</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-hover)' }}>
                      ${calcTotal().toFixed(2)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="order-submit" type="submit" className="btn btn-primary" disabled={loading || fetchLoading}>
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Order #{order.id} Details</h2>
          <button className="btn-close" onClick={onClose}><X /></button>
        </div>
        <div className="modal-body">
          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Customer</div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>{order.customer?.full_name || '—'}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{order.customer?.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Order Info</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Status: <span className="badge badge-info" style={{ fontSize: '11px' }}>{order.status}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Date: {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
              </div>
            </div>
          </div>

          <div className="section-title"><Package size={14} color="var(--accent)" />Items</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map(item => (
                  <tr key={item.id}>
                    <td className="td-primary">{item.product?.name || `Product #${item.product_id}`}</td>
                    <td><span className="badge badge-accent font-mono">{item.product?.sku || '—'}</span></td>
                    <td>{item.quantity}</td>
                    <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            marginTop: '16px', padding: '14px',
            background: 'var(--accent-light)', border: '1px solid var(--border-hover)',
            borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between'
          }}>
            <span style={{ fontWeight: 600 }}>Total Amount</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-hover)' }}>
              ${parseFloat(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    ordersApi.getAll()
      .then(res => setOrders(res.data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await ordersApi.delete(deleteOrder.id);
      toast.success('Order cancelled and stock restored');
      setDeleteOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <button id="create-order-btn" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Create Order
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart />
            <h3>No orders yet</h3>
            <p>Create your first order to get started</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="td-primary font-mono">#{order.id}</td>
                    <td>
                      <div className="td-primary">{order.customer?.full_name || '—'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.customer?.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-accent">{order.order_items?.length || 0} item(s)</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-hover)' }}>
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td><span className="badge badge-info">{order.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button
                          id={`view-order-${order.id}`}
                          className="btn btn-secondary btn-sm btn-icon"
                          onClick={() => setViewOrder(order)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          id={`delete-order-${order.id}`}
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => setDeleteOrder(order)}
                          title="Cancel Order"
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

      {showCreate && <CreateOrderModal onClose={() => setShowCreate(false)} onSaved={fetchOrders} />}
      {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}

      {deleteOrder && (
        <div className="modal-overlay" onClick={() => setDeleteOrder(null)}>
          <div className="modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Cancel Order</h2>
              <button className="btn-close" onClick={() => setDeleteOrder(null)}><X /></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <AlertTriangle size={16} />
                Cancelling order <strong>#{deleteOrder.id}</strong> will restore the stock for all items in this order.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteOrder(null)}>Keep Order</button>
              <button id="confirm-cancel-order" className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
