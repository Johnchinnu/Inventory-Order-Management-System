export default function StatCard({ label, value, sub, icon: Icon, color = 'accent', gradient }) {
  const colorMap = {
    accent: { bg: 'var(--accent-light)', color: 'var(--accent-hover)', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    success: { bg: 'var(--success-light)', color: 'var(--success)', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    warning: { bg: 'var(--warning-light)', color: 'var(--warning)', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    danger: { bg: 'var(--danger-light)', color: 'var(--danger)', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
    info: { bg: 'var(--info-light)', color: 'var(--info)', gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)' },
  };

  const scheme = colorMap[color];

  return (
    <div
      className="stat-card"
      style={{ '--gradient': gradient || scheme.gradient }}
    >
      <div className="stat-icon" style={{ background: scheme.bg }}>
        <Icon size={22} color={scheme.color} />
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
