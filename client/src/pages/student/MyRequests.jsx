import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import RequestCard from '../../components/RequestCard';
import useSocket from '../../hooks/useSocket';
import toast from 'react-hot-toast';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'ready', label: 'Ready' },
  { key: 'rejected', label: 'Rejected' },
];

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await axios.get(`/api/requests/my${params}`);
      setRequests(data.requests || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  useSocket({
    'request:updated': ({ request }) => {
      setRequests(prev => prev.map(r => r._id === request._id ? request : r));
      toast.success(`Status updated: ${request.status.replace('_', ' ')}`);
    },
    'request:rejected': ({ request }) => {
      setRequests(prev => prev.map(r => r._id === request._id ? request : r));
      toast.error('Request rejected. Check remarks.');
    },
  });

  const active = requests.filter(r => !['collected', 'rejected'].includes(r.status));

  return (
    <Layout title="My Requests" subtitle="Track all your submitted requests">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="filter-bar">
          {FILTERS.map(f => (
            <button key={f.key} className={`filter-chip ${filter === f.key ? 'active' : ''}`}
              onClick={() => { setFilter(f.key); setLoading(true); }}>
              {f.label}
              {f.key === '' && requests.length > 0 && ` (${requests.length})`}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/new-request')}>
          + New Request
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : requests.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>{filter ? `No ${filter.replace('_', ' ')} requests` : 'No requests yet'}</h3>
            <p>Submit a new request to track it here in real-time.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/student/new-request')}>
              + Submit New Request
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {requests.map(r => <RequestCard key={r._id} request={r} />)}
        </div>
      )}
    </Layout>
  );
};

export default MyRequests;
