import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import RequestCard from '../../components/RequestCard';
import StatusBadge from '../../components/StatusBadge';
import useSocket from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';
import { REQUEST_TYPES, formatDate } from '../../utils/constants';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get('/api/requests/my');
      setRequests(data.requests || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  // Real-time socket updates — THE WOW MOMENT
  useSocket({
    'request:updated': ({ request }) => {
      setRequests(prev => prev.map(r => r._id === request._id ? request : r));
      toast.success(`📦 Status updated: ${request.type.replace('_', ' ')} → ${request.status.replace('_', ' ')}`, { duration: 4000 });
    },
    'request:rejected': ({ request }) => {
      setRequests(prev => prev.map(r => r._id === request._id ? request : r));
      toast.error(`❌ Request rejected. Check remarks.`, { duration: 5000 });
    },
    'request:completed': ({ request }) => {
      setRequests(prev => prev.map(r => r._id === request._id ? request : r));
      toast.success(`🎉 Request completed!`, { duration: 4000 });
    },
  });

  const active = requests.filter(r => !['collected', 'rejected'].includes(r.status));
  const recent = requests.slice(0, 3);

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: '📋', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Active', value: active.length, icon: '⚡', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Ready to Collect', value: requests.filter(r => r.status === 'ready').length, icon: '📦', color: '#10b981', bg: '#ecfdf5' },
    { label: 'Completed', value: requests.filter(r => r.status === 'collected').length, icon: '✅', color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <Layout title="My Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0]}!`}>
      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Active requests */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Active Requests</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/requests')}>
              View all →
            </button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
          ) : active.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No active requests</h3>
                <p>Submit your first request to get started</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/student/new-request')}>
                  + New Request
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {active.map(r => <RequestCard key={r._id} request={r} />)}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick submit promo */}
          <div className="promo-card">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Need a certificate?</h3>
              <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 14, lineHeight: 1.5 }}>
                Submit your request online. Track it live. No office visits needed.
              </p>
              <button className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}
                onClick={() => navigate('/student/new-request')}>
                Submit Request →
              </button>
            </div>
          </div>

          {/* Ready to collect */}
          {requests.filter(r => r.status === 'ready').length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">🟢 Ready to Collect</span>
              </div>
              <div className="card-body" style={{ paddingTop: 12 }}>
                {requests.filter(r => r.status === 'ready').map(r => (
                  <div key={r._id} onClick={() => navigate(`/student/requests/${r._id}`)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{REQUEST_TYPES[r.type]?.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Updated {formatDate(r.updatedAt)}</div>
                    </div>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                ))}
                <div className="alert alert-success" style={{ marginTop: 12, fontSize: 12 }}>
                  📍 Collect from Admin Office, Room 101 during office hours.
                </div>
              </div>
            </div>
          )}

          {/* Request types quick guide */}
          <div className="card">
            <div className="card-header" style={{ paddingBottom: 0 }}>
              <span className="card-title">📖 Request Types</span>
            </div>
            <div className="card-body" style={{ paddingTop: 12 }}>
              {Object.entries(REQUEST_TYPES).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: 18 }}>{val.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{val.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
