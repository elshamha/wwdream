import React, { useState } from 'react';

function CompactSection({ title, children, defaultExpanded = false, icon = "📁" }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="section">
      <div 
        className="section-header" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{icon}</span>
          <h4 style={{ margin: 0, fontSize: '1em', fontWeight: 500 }}>{title}</h4>
        </div>
        <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>
      <div className={`section-content ${!isExpanded ? 'collapsed' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export default CompactSection;