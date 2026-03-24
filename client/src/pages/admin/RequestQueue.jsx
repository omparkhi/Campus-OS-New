import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import useSocket from '../../hooks/useSocket';
import { REQUEST_TYPES, DEPARTMENTS, formatDate, timeAgo } from '../../utils/constants';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['', 'submitted', 'under_review', 'approved', 'ready', 'collected', 'rejected'];
const TYPE_FILTERS = ['', ...Object.keys(REQUEST_TYPES)];

const RequestQueue = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      const { data } = await axios.get(`/api/requests?${params}`);
      setRequests(data.requests || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [statusFilter, typeFilter]);

  useSocket({
    'request:created': (req) => {
      setRequests(prev => [req, ...prev]);
      toast.success(`📨 New: ${REQUEST_TYPES[req.type]?.label} from ${req.student?.name}`);
    },
    'request:updated': (req) => {
      setRequests(prev => prev.map(r => r._id === req._id ? req : r));
    },
  });

  const filtered = requests.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.student?.name?.toLowerCase().includes(q) ||
      r.student?.rollNo?.toLowerCase().includes(q) ||
      r.student?.department?.toLowerCase().includes(q) ||
      r.type?.includes(q)
    );
  });

  return (
    <Layout title="Request Queue" subtitle={`${requests.length} total requests`}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ minWidth: 200 }}>
          <span>🔍</span>
          <input placeholder="Search student, roll no..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_FILTERS.slice(1).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {TYPE_FILTERS.slice(1).map(t => <option key={t} value={t}>{REQUEST_TYPES[t]?.label}</option>)}
        </select>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No requests found</h3>
          <p>Try changing your filters or search query.</p>
        </div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Request Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Submitted</th>
                  <th>Last Update</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const typeConfig = REQUEST_TYPES[r.type] || { label: r.type, icon: '📄', color: '#94a3b8', bg: '#f8fafc' };
                  return (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.student?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.student?.rollNo} · {r.student?.department} Yr{r.student?.year}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{typeConfig.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{typeConfig.label}</span>
                        </div>
                      </td>
                      <td><StatusBadge status={r.status} size="sm" /></td>
                      <td>
                        {r.priority === 'urgent'
                          ? <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 13 }}>🚨 Urgent</span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Normal</span>}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(r.createdAt)}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{timeAgo(r.updatedAt)}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/admin/requests/${r._id}`)}>
                          Manage →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RequestQueue;
