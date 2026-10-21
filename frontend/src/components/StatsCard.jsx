import React from 'react';

const StatsCard = ({ title, value, subtitle, icon, trend, color = 'var(--primary)' }) => {
  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1 }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary)',
            display: 'block',
            marginBottom: '0.35rem',
          }}
        >
          {title}
        </span>
        <h3
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#FFFFFF',
            lineHeight: '1.2',
            marginBottom: '0.25rem',
          }}
        >
          {value}
        </h3>
        {subtitle && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </span>
        )}
      </div>

      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-md)',
          background: `rgba(99, 102, 241, 0.12)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
