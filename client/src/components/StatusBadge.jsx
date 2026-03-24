import React from 'react';
import { STATUS_CONFIG } from '../utils/constants';

const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || { label: status, color: '#94a3b8', icon: '•' };
  return (
    <span className={`status-badge ${status}`} style={{ fontSize: size === 'sm' ? '11px' : '12px' }}>
      <span className="dot" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
