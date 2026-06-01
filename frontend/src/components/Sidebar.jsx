import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  Boxes, TrendingUp
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Boxes size={20} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-text">StockInv</div>
          <div className="sidebar-logo-sub">Inventory System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Main Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <div className="status-dot" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>System Online</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>All services running</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
