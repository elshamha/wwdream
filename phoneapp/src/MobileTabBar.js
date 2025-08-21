import React from 'react';

const TABS = [
  { name: 'Home', icon: '🏠' },
  { name: 'Projects', icon: '📁' },
  { name: 'Documents', icon: '📝' },
  { name: 'Reminders', icon: '⏰' },
  { name: 'AI', icon: '🤖' },
  { name: 'Profile', icon: '👤' }
];

export default function MobileTabBar({ active, onTab }) {
  return (
    <nav aria-label="Main navigation" style={{position:'fixed',bottom:0,left:0,right:0,background:'var(--primary)',color:'#fff',display:'flex',justifyContent:'space-around',alignItems:'center',height:60,zIndex:100,boxShadow:'0 -2px 8px #cce'}}>
      {TABS.map(tab => (
        <button
          key={tab.name}
          aria-label={tab.name}
          onClick={() => onTab(tab.name)}
          style={{
            background:'none',
            border:'none',
            color:active===tab.name?'var(--accent)':'#fff',
            fontSize:'1.5em',
            flex:1,
            padding:0,
            cursor:'pointer',
            fontWeight:active===tab.name?700:400,
            outline:active===tab.name?'2px solid var(--accent)':'none'
          }}
          tabIndex={0}
        >
          <span role="img" aria-label={tab.name}>{tab.icon}</span>
          <div style={{fontSize:'0.7em'}}>{tab.name}</div>
        </button>
      ))}
    </nav>
  );
}
