import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import StatusTimeline from '../../components/StatusTimeline';
import useSocket from '../../hooks/useSocket';
import { REQUEST_TYPES, formatDateTime } from '../../utils/constants';
import toast from 'react-hot-toast';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/requests/${id}`)
      .then(({ data }) => setRequest(data.request))
      .catch(() => toast.error('Request not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useSocket({
    'request:updated': ({ request: updated }) => {
      if (updated._id === id) {
        setRequest(updated);
        toast.success('🔄 Status updated live!', { duration: 3000 });
      }
    },
    'request:rejected': ({ request: updated }) => {
      if (updated._id === id) {
        setRequest(updated);
        toast.error('Request rejected. See remarks below.');
      }
    },
  });

  if (loading) return <Layout title="Request Details"><div style={{ textAlign: 'center', padding: 80 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div></Layout>;
  if (!request) return <Layout title="Request Details"><div className="empty-state"><h3>Request not found</h3><button className="btn btn-primary" onClick={() => navigate('/student/requests')}>Back to Requests</button></div></Layout>;

  const typeConfig = REQUEST_TYPES[request.type] || { label: request.type, icon: '📄', color: '#94a3b8', bg: '#f8fafc' };

  return (
    <Layout title="Request Details" subtitle={`#${request._id.slice(-8).toUpperCase()}`}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/requests')} style={{ marginBottom: 20 }}>
          ← Back to Requests
        </button>

        {/* Header card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: typeConfig.bg, color: typeConfig.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                {typeConfig.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800 }}>{typeConfig.label}</h2>
                  <StatusBadge status={request.status} />
                  {request.priority === 'urgent' && (
                    <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>🚨 Urgent</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Submitted on {formatDateTime(request.createdAt)} · Last updated {formatDateTime(request.updatedAt)}
                </div>
              </div>
            </div>

            {request.description && (
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>YOUR NOTE</div>
                <div style={{ fontSize: 14 }}>{request.description}</div>
              </div>
            )}

            {request.adminRemarks && (
              <div className={`alert ${request.status === 'rejected' ? 'alert-error' : 'alert-success'}`}>
                <span>{request.status === 'rejected' ? '❌' : '✅'}</span>
                <div>
                  <strong>Admin Note:</strong> {request.adminRemarks}
                </div>
              </div>
            )}

            {request.status === 'ready' && (
              <div className="alert alert-success" style={{ marginTop: 12 }}>
                <span>📍</span>
                <span><strong>Your document is ready!</strong> Collect from Admin Office, Room 101 during office hours (Mon-Fri 9 AM – 5 PM).</span>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Request Timeline</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Updates in real-time via Socket.io</span>
          </div>
          <div className="card-body">
            <StatusTimeline history={request.statusHistory || []} />
          </div>
        </div>

        {/* Live indicator */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Live updates enabled — status changes instantly when admin acts
        </div>
      </div>
    </Layout>
  );
};

export default RequestDetail;
