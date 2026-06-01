import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/client';
import StatCard from '../components/StatCard';
import {
  Package, Users, ShoppingCart, DollarSign,
  AlertTriangle, ArrowRight, TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardApi.getStats()
      .then(res => setStats(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          <AlertTriangle size={16} />
          Failed to load dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back 👋</h1>
          <p className="page-subtitle">Here's what's happening with your inventory today.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <StatCard
          label="Total Products"
          value={stats.total_products.toLocaleString()}
          sub="In catalog"
          icon={Package}
          color="accent"
        />
        <StatCard
          label="Total Customers"
          value={stats.total_customers.toLocaleString()}
          sub="Registered"
          icon={Users}
          color="success"
        />
        <StatCard
          label="Total Orders"
          value={stats.total_orders.toLocaleString()}
          sub="All time"
          icon={ShoppingCart}
          color="info"
        />
        <StatCard
          label="Total Revenue"
          value={`$${parseFloat(stats.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub="From all orders"
          icon={DollarSign}
          color="warning"
        />
      </div>

      {/* Quick Actions + Low Stock */}
      <div className="grid-2">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="section-title">
            <TrendingUp size={16} color="var(--accent)" />
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { to: '/products', label: 'Manage Products', sub: 'Add, edit, or remove products', icon: Package, color: 'var(--accent)' },
              { to: '/customers', label: 'View Customers', sub: 'Browse customer directory', icon: Users, color: 'var(--success)' },
              { to: '/orders', label: 'Create Order', sub: 'Place a new customer order', icon: ShoppingCart, color: 'var(--info)' },
            ].map(({ to, label, sub, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px', background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    transition: 'var(--transition)', cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ background: `${color}22`, borderRadius: '8px', padding: '8px', display: 'flex' }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</div>
                  </div>
                  <ArrowRight size={16} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <h2 className="section-title">
            <AlertTriangle size={16} color="var(--warning)" />
            Low Stock Alerts
          </h2>
          {stats.low_stock_products.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <Package size={36} />
              <h3>All stocked up!</h3>
              <p>No products below the low stock threshold</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.low_stock_products.map(product => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px', background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{product.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SKU: {product.sku}</div>
                  </div>
                  <span className={`badge ${product.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                    {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
