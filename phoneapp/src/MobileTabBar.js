import React from 'react';

const TABS = [
  { name: 'Home', icon: '◉' },
  { name: 'Projects', icon: '⬢' },
  { name: 'Documents', icon: '⬛' },
  { name: 'Reminders', icon: '◈' },
  { name: 'AI', icon: '◇' },
  { name: 'Profile', icon: '⬟' }
];

export default function MobileTabBar({ active, onTab }) {
  return (
    <nav 
      aria-label="Main navigation" 
      className="mobile-tab-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--primary)',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 70,
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px'
      }}
    >
      {TABS.map(tab => (
        <button
          key={tab.name}
          aria-label={tab.name}
          onClick={() => onTab(tab.name)}
          style={{
            background: active === tab.name ? 'rgba(255, 255, 255, 0.2)' : 'none',
            border: 'none',
            color: active === tab.name ? '#fff' : 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.4em',
            flex: 1,
            padding: '8px 4px',
            cursor: 'pointer',
            fontWeight: active === tab.name ? 700 : 400,
            borderRadius: '12px',
            margin: '4px 2px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: active === tab.name ? 'scale(1.05)' : 'scale(1)',
          }}
          tabIndex={0}
        >
          <div style={{ marginBottom: '2px' }}>
            <span role="img" aria-label={tab.name}>{tab.icon}</span>
          </div>
          <div style={{ fontSize: '0.65em', fontWeight: 500 }}>{tab.name}</div>
        </button>
      ))}
    </nav>
  );
}
