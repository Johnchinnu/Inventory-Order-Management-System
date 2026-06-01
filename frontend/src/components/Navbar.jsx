import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'System overview and key metrics' },
  '/products': { title: 'Products', subtitle: 'Manage your product catalog' },
  '/customers': { title: 'Customers', subtitle: 'View and manage customer accounts' },
  '/orders': { title: 'Orders', subtitle: 'Track and manage all orders' },
};

export default function Navbar() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'StockInv', subtitle: '' };
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="navbar">
      <div>
        <div className="navbar-title">{pageInfo.title}</div>
        <div className="navbar-subtitle">{pageInfo.subtitle}</div>
      </div>
      <div className="navbar-actions">
        <div className="navbar-time">
          {formatDate(time)} · {formatTime(time)}
        </div>
      </div>
    </header>
  );
}
