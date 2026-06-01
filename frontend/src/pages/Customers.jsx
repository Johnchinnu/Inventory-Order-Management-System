import { useEffect, useState } from 'react';
import { customersApi } from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Trash2, Users, Search, X, Mail, Phone } from 'lucide-react';

const emptyForm = { full_name: '', email: '', phone: '' };

function CustomerModal({ onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await customersApi.create(form);
      toast.success('Customer created successfully');
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
          <h2 className="modal-title">Add New Customer</h2>
          <button className="btn-close" onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input id="customer-name" className={`form-input${errors.full_name ? ' error' : ''}`} value={form.full_name} onChange={set('full_name')} placeholder="e.g. John Smith" />
              {errors.full_name && <div className="form-error">{errors.full_name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input id="customer-email" type="email" className={`form-input${errors.email ? ' error' : ''}`} value={form.email} onChange={set('email')} placeholder="john@example.com" />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input id="customer-phone" type="tel" className="form-input" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="customer-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ customer, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      await customersApi.delete(customer.id);
      toast.success('Customer deleted');
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
          <h2 className="modal-title">Delete Customer</h2>
          <button className="btn-close" onClick={onClose}><X /></button>
        </div>
        <div className="modal-body">
          <div className="alert alert-danger">
            <Trash2 size={16} />
            Deleting <strong>"{customer.full_name}"</strong> will also remove all associated orders.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button id="confirm-delete-customer" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteCustomer, setDeleteCustomer] = useState(null);

  const fetchCustomers = () => {
    setLoading(true);
    customersApi.getAll()
      .then(res => setCustomers(res.data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const avatarColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];
  const getColor = (id) => avatarColors[id % avatarColors.length];

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="search-wrapper">
            <Search />
            <input id="customer-search" className="search-input" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button id="add-customer-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Users />
            <h3>No customers found</h3>
            <p>{search ? 'Try adjusting your search' : 'Add your first customer to get started'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{c.id}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: getColor(c.id),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0
                        }}>
                          {getInitials(c.full_name)}
                        </div>
                        <span className="td-primary">{c.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Mail size={13} color="var(--text-muted)" />
                        {c.email}
                      </div>
                    </td>
                    <td>
                      {c.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone size={13} color="var(--text-muted)" />
                          {c.phone}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <button
                          id={`delete-customer-${c.id}`}
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => setDeleteCustomer(c)}
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

      {showModal && <CustomerModal onClose={() => setShowModal(false)} onSaved={fetchCustomers} />}
      {deleteCustomer && <DeleteConfirm customer={deleteCustomer} onClose={() => setDeleteCustomer(null)} onDeleted={fetchCustomers} />}
    </div>
  );
}
