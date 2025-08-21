import React from 'react';

export default function FloatingActionButton({ onClick, label = 'Create', icon = '➕' }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        right: 24,
        bottom: 80,
        zIndex: 200,
        background: 'var(--accent)',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 60,
        height: 60,
        fontSize: '2em',
        boxShadow: '0 2px 12px #cce',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
        outline: 'none',
      }}
      aria-label={label}
      tabIndex={0}
      onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <span>{icon}</span>
      <span style={{display:'none'}}>{label}</span>
    </button>
  );
}
