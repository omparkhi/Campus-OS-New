import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { REQUEST_TYPES, formatDate, timeAgo } from '../utils/constants';

const RequestCard = ({ request, isAdmin = false }) => {
  const navigate = useNavigate();
  const typeConfig = REQUEST_TYPES[request.type] || { label: request.type, icon: '📄', color: '#94a3b8', bg: '#f8fafc' };

  const handleClick = () => {
    const path = isAdmin ? `/admin/requests/${request._id}` : `/student/requests/${request._id}`;
    navigate(path);
  };

  return (
    <div className="request-card" onClick={handleClick}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div className="request-type-icon" style={{ background: typeConfig.bg, color: typeConfig.color }}>
          {typeConfig.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>
              {typeConfig.label}
            </span>
            <StatusBadge status={request.status} size="sm" />
          </div>
          {isAdmin && request.student && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              <strong>{request.student.name}</strong> · {request.student.rollNo} · {request.student.department}
            </div>
          )}
          {request.description && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {request.description}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>📅 {formatDate(request.createdAt)}</span>
            <span>🕐 {timeAgo(request.updatedAt)}</span>
            {request.priority === 'urgent' && (
              <span style={{ color: '#ef4444', fontWeight: 600 }}>🚨 Urgent</span>
            )}
          </div>
          {request.adminRemarks && request.status === 'rejected' && (
            <div className="alert alert-error" style={{ marginTop: 8, padding: '6px 10px', fontSize: 12 }}>
              ⚠️ {request.adminRemarks}
            </div>
          )}
          {request.adminRemarks && request.status === 'ready' && (
            <div className="alert alert-success" style={{ marginTop: 8, padding: '6px 10px', fontSize: 12 }}>
              ✅ {request.adminRemarks}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
