import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import RequestCard from '../../components/RequestCard';

const History = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/requests/my')
      .then(({ data }) => setRequests((data.requests || []).filter(r => ['collected', 'rejected'].includes(r.status))))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Request History" subtitle="Completed and rejected requests">
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>✅</div>
          <div>
            <div className="stat-card-value">{requests.filter(r => r.status === 'collected').length}</div>
            <div className="stat-card-label">Completed</div>
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-card-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>❌</div>
          <div>
            <div className="stat-card-value">{requests.filter(r => r.status === 'rejected').length}</div>
            <div className="stat-card-label">Rejected</div>
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-card-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>📋</div>
          <div>
            <div className="stat-card-value">{requests.length}</div>
            <div className="stat-card-label">Total Closed</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : requests.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <h3>No history yet</h3>
          <p>Completed and rejected requests will appear here.</p>
        </div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {requests.map(r => <RequestCard key={r._id} request={r} />)}
        </div>
      )}
    </Layout>
  );
};

export default History;
