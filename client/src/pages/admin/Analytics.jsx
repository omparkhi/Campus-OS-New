import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import Layout from '../../components/Layout';
import { REQUEST_TYPES } from '../../utils/constants';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#0d9488', '#ef4444'];
const STATUS_COLORS = { submitted: '#3b82f6', under_review: '#f59e0b', approved: '#8b5cf6', ready: '#10b981', collected: '#0d9488', rejected: '#ef4444' };

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState({ byType: [], byStatus: [], last7Days: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([axios.get('/api/analytics/overview'), axios.get('/api/analytics/by-type')])
      .then(([s, c]) => {
        setStats(s.data.stats);
        setChart({
          byType: (c.data.byType || []).map(d => ({ name: REQUEST_TYPES[d._id]?.label || d._id, count: d.count, icon: REQUEST_TYPES[d._id]?.icon })),
          byStatus: (c.data.byStatus || []).map(d => ({ name: d._id.replace('_', ' '), value: d.count, color: STATUS_COLORS[d._id] || '#94a3b8' })),
          last7Days: c.data.last7Days || [],
        });
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Analytics"><div style={{ textAlign: 'center', padding: 80 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div></Layout>;

  return (
    <Layout title="Analytics" subtitle="Request trends and processing insights">
      {stats && (
        <>
          {/* Key metrics */}
          <div className="grid-4" style={{ marginBottom: 28 }}>
            {[
              { label: 'Total Requests', value: stats.total, icon: '📋', color: '#3b82f6', bg: '#eff6ff' },
              { label: 'This Week', value: stats.thisWeek, icon: '📅', color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'Avg Processing', value: `${stats.avgProcessingDays || 0} days`, icon: '⚡', color: '#f59e0b', bg: '#fffbeb' },
              { label: 'Completion Rate', value: stats.total > 0 ? `${Math.round((stats.collected / stats.total) * 100)}%` : '0%', icon: '🎯', color: '#10b981', bg: '#ecfdf5' },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div>
                  <div className="stat-card-value">{s.value}</div>
                  <div className="stat-card-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row 1 */}
          <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
            <div className="card">
              <div className="card-header"><span className="card-title">📈 Requests Last 7 Days</span></div>
              <div className="card-body" style={{ paddingTop: 8 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chart.last7Days}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v) => [v, 'Requests']} />
                    <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">🍩 Status Distribution</span></div>
              <div className="card-body" style={{ paddingTop: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={chart.byStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {chart.byStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {chart.byStatus.map(s => (
                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, textTransform: 'capitalize' }}>{s.name}</span>
                      <span style={{ fontWeight: 700 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* By type bar */}
          <div className="card">
            <div className="card-header"><span className="card-title">📊 Requests by Type</span></div>
            <div className="card-body" style={{ paddingTop: 8 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chart.byType}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chart.byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Analytics;
