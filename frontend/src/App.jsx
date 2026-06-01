import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a2234',
            color: '#f0f4ff',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1a2234' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1a2234' } },
        }}
      />
    </BrowserRouter>
  );
}
