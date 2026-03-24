import React from 'react';
import { STATUS_CONFIG, formatDateTime } from '../utils/constants';

const StatusTimeline = ({ history = [] }) => {
  return (
    <div className="timeline">
      {history.map((item, i) => {
        const config = STATUS_CONFIG[item.status] || {};
        const colorMap = {
          submitted: '#3b82f6', under_review: '#f59e0b', approved: '#8b5cf6',
          ready: '#10b981', collected: '#0d9488', rejected: '#ef4444'
        };
        const bgMap = {
          submitted: '#eff6ff', under_review: '#fffbeb', approved: '#f5f3ff',
          ready: '#ecfdf5', collected: '#f0fdfa', rejected: '#fef2f2'
        };
        const color = colorMap[item.status] || '#94a3b8';
        const bg = bgMap[item.status] || '#f8fafc';

        return (
          <div className="timeline-item" key={i}>
            {i < history.length - 1 && <div className="timeline-line" />}
            <div className="timeline-dot" style={{ background: bg, color }}>
              <span style={{ fontSize: 14 }}>{config.icon || '•'}</span>
            </div>
            <div className="timeline-content">
              <div className="title" style={{ color }}>{config.label || item.status}</div>
              {item.remark && <div className="remark">{item.remark}</div>}
              <div className="time">
                {formatDateTime(item.timestamp)}
                {item.updatedBy && ` · by ${item.updatedBy?.name || 'Admin'}`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
