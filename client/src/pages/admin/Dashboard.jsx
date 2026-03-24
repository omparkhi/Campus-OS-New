import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Layout from '../../components/Layout';
import RequestCard from '../../components/RequestCard';
import useSocket from '../../hooks/useSocket';
import { REQUEST_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#0d9488', '#ef4444'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({ byType: [], byStatus: [], last7Days: [] });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, chartRes, reqRes] = await Promise.all([
        axios.get('/api/analytics/overview'),
        axios.get('/api/analytics/by-type'),
        axios.get('/api/requests?limit=5'),
      ]);
      setStats(statsRes.data.stats);
      setChartData({
        byType: (chartRes.data.byType || []).map(d => ({ name: REQUEST_TYPES[d._id]?.label || d._id, count: d.count })),
        byStatus: chartRes.data.byStatus || [],
        last7Days: chartRes.data.last7Days || [],
      });
      setRecentRequests((reqRes.data.requests || []).slice(0, 5));
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useSocket({
    'request:created': (req) => {
      setRecentRequests(prev => [req, ...prev.slice(0, 4)]);
      toast.success(`📨 New request: ${REQUEST_TYPES[req.type]?.label} from ${req.student?.name}`);
      fetchData();
    },
    'request:updated': () => fetchData(),
  });

  const statCards = stats ? [
    { label: 'Total Requests', value: stats.total, icon: '📋', color: '#3b82f6', bg: '#eff6ff', change: `+${stats.thisWeek} this week` },
    { label: 'Pending', value: stats.pending, icon: '⏳', color: '#f59e0b', bg: '#fffbeb', change: 'Needs attention' },
    { label: 'Ready to Collect', value: stats.ready, icon: '📦', color: '#10b981', bg: '#ecfdf5', change: 'Students waiting' },
    { label: 'Avg. Processing', value: `${stats.avgProcessingDays || 0}d`, icon: '⚡', color: '#8b5cf6', bg: '#f5f3ff', change: 'Per request' },
  ] : [];

  return (
    <Layout title="Admin Dashboard" subtitle="Smart Campus Administration Portal">
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {statCards.map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div>
                  <div className="stat-card-value">{s.value}</div>
                  <div className="stat-card-label">{s.label}</div>
                  <div className="stat-card-change up" style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{s.change}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
            {/* 7-day trend */}
            <div className="card">
              <div className="card-header"><span className="card-title">📈 Last 7 Days</span></div>
              <div className="card-body" style={{ paddingTop: 8 }}>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData.last7Days}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v) => [v, 'Requests']} labelFormatter={l => `Date: ${l}`} />
                    <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* By type */}
            <div className="card">
              <div className="card-header"><span className="card-title">📊 Requests by Type</span></div>
              <div className="card-body" style={{ paddingTop: 8 }}>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData.byType} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]}>
                      {chartData.byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 24 }}>
            {/* Recent requests */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Requests</h2>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/requests')}>View queue →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentRequests.length === 0 ? (
                  <div className="card"><div className="empty-state" style={{ padding: 32 }}><div className="empty-state-icon">📭</div><h3>No requests yet</h3></div></div>
                ) : (
                  recentRequests.map(r => <RequestCard key={r._id} request={r} isAdmin />)
                )}
              </div>
            </div>

            {/* Status breakdown + quick actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {stats && (
                <div className="card">
                  <div className="card-header"><span className="card-title">🔢 Status Breakdown</span></div>
                  <div className="card-body" style={{ paddingTop: 12 }}>
                    {[
                      { status: 'submitted', label: 'Submitted', val: stats.total - stats.pending - stats.approved - stats.ready - stats.collected - stats.rejected },
                      { status: 'under_review', label: 'Under Review', val: stats.pending },
                      { status: 'approved', label: 'Approved', val: stats.approved },
                      { status: 'ready', label: 'Ready to Collect', val: stats.ready },
                      { status: 'collected', label: 'Collected', val: stats.collected },
                      { status: 'rejected', label: 'Rejected', val: stats.rejected },
                    ].map(s => (
                      <div key={s.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{s.label}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{Math.max(0, s.val)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0 0' }}>
                      <span style={{ fontWeight: 700 }}>Total Students</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>{stats.totalStudents}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="card">
                <div className="card-header"><span className="card-title">⚡ Quick Actions</span></div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12 }}>
                  <button className="btn btn-primary btn-full" onClick={() => navigate('/admin/requests')}>📋 Open Request Queue</button>
                  <button className="btn btn-secondary btn-full" onClick={() => navigate('/admin/students')}>👥 View All Students</button>
                  <button className="btn btn-secondary btn-full" onClick={() => navigate('/admin/config')}>⚙️ Update AI Knowledge Base</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default AdminDashboard;
