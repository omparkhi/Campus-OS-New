import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import StatusTimeline from '../../components/StatusTimeline';
import { REQUEST_TYPES, formatDateTime } from '../../utils/constants';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['submitted', 'under_review', 'approved', 'ready', 'collected'];
const STATUS_LABELS = {
  submitted: 'Submitted', under_review: 'Under Review', approved: 'Approved',
  ready: 'Ready to Collect', collected: 'Collected', rejected: 'Rejected'
};

const AdminRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateModal, setUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    axios.get(`/api/requests/${id}`)
      .then(({ data }) => { setRequest(data.request); setNewStatus(data.request.status); })
      .catch(() => toast.error('Request not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      const { data } = await axios.patch(`/api/requests/${id}/status`, { status: newStatus, remark });
      setRequest(data.request);
      setUpdateModal(false);
      setRemark('');
      toast.success(`✅ Status updated to: ${STATUS_LABELS[newStatus]}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  if (loading) return <Layout title="Request Detail"><div style={{ textAlign: 'center', padding: 80 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div></Layout>;
  if (!request) return <Layout title="Request Detail"><div className="empty-state"><h3>Not found</h3><button className="btn btn-primary" onClick={() => navigate('/admin/requests')}>Back</button></div></Layout>;

  const typeConfig = REQUEST_TYPES[request.type] || { label: request.type, icon: '📄', color: '#94a3b8', bg: '#f8fafc' };
  const currentIdx = STATUS_FLOW.indexOf(request.status);

  return (
    <Layout title="Request Detail" subtitle={`Managing #${id.slice(-8).toUpperCase()}`}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/requests')} style={{ marginBottom: 20 }}>
          ← Back to Queue
        </button>

        {/* Status flow stepper */}
        {request.status !== 'rejected' && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {STATUS_FLOW.map((s, i) => {
                  const done = i <= currentIdx;
                  const current = i === currentIdx;
                  const colorMap = { submitted: '#3b82f6', under_review: '#f59e0b', approved: '#8b5cf6', ready: '#10b981', collected: '#0d9488' };
                  const color = colorMap[s];
                  return (
                    <React.Fragment key={s}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: done ? color : 'var(--bg)', color: done ? 'white' : 'var(--text-muted)',
                          fontWeight: 700, fontSize: 13, border: current ? `3px solid ${color}` : '2px solid transparent',
                          boxShadow: current ? `0 0 0 3px ${color}33` : 'none', transition: 'all 0.3s'
                        }}>
                          {done && i < currentIdx ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: done ? color : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {STATUS_LABELS[s]}
                        </span>
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div style={{ flex: 1, height: 2, background: i < currentIdx ? colorMap[STATUS_FLOW[i + 1]] : 'var(--border)', margin: '0 6px 22px', transition: 'background 0.3s' }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
          {/* Left: Request info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: typeConfig.bg, color: typeConfig.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {typeConfig.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>{typeConfig.label}</div>
                    <StatusBadge status={request.status} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Submitted', formatDateTime(request.createdAt)],
                    ['Last Updated', formatDateTime(request.updatedAt)],
                    ['Priority', request.priority === 'urgent' ? '🚨 Urgent' : '🟢 Normal'],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 10, borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                      <span style={{ fontWeight: 600 }}>{val}</span>
                    </div>
                  ))}
                </div>

                {request.description && (
                  <div style={{ marginTop: 12, background: 'var(--bg)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>STUDENT NOTE</div>
                    <div style={{ fontSize: 13 }}>{request.description}</div>
                  </div>
                )}

                {request.adminRemarks && (
                  <div className="alert alert-info" style={{ marginTop: 12, fontSize: 13 }}>
                    <span>💬</span><span><strong>Last remark:</strong> {request.adminRemarks}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Student info */}
            <div className="card">
              <div className="card-header"><span className="card-title">👤 Student Details</span></div>
              <div className="card-body" style={{ paddingTop: 12 }}>
                {request.student && [
                  ['Name', request.student.name],
                  ['Roll No', request.student.rollNo],
                  ['Department', request.student.department],
                  ['Year', request.student.year ? `Year ${request.student.year}` : '—'],
                  ['Email', request.student.email],
                  ['Phone', request.student.phone || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Update + Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Update status panel */}
            {!['collected', 'rejected'].includes(request.status) && (
              <div className="card" style={{ border: '2px solid var(--primary-mid)' }}>
                <div className="card-header" style={{ background: 'var(--primary-soft)', borderRadius: '12px 12px 0 0', margin: '-1px' }}>
                  <span className="card-title" style={{ color: 'var(--primary)' }}>⚡ Update Request Status</span>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="alert alert-info" style={{ fontSize: 12 }}>
                    <span>📡</span>
                    <span>Updating status will instantly notify the student via Socket.io — no refresh needed on their end.</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Status</label>
                    <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                      {[...STATUS_FLOW, 'rejected'].map(s => (
                        <option key={s} value={s} disabled={STATUS_FLOW.indexOf(s) < currentIdx && s !== 'rejected'}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Remark (Optional but recommended)</label>
                    <textarea className="form-textarea" rows={3} style={{ minHeight: 80 }}
                      placeholder={newStatus === 'rejected' ? 'Reason for rejection (student will see this)...' : 'e.g., Please collect before 5 PM today...'}
                      value={remark} onChange={e => setRemark(e.target.value)} />
                  </div>

                  {newStatus === 'rejected' && (
                    <div className="alert alert-error" style={{ fontSize: 12 }}>
                      <span>⚠️</span><span>Rejection is final. Student will be notified immediately.</span>
                    </div>
                  )}

                  <button className="btn btn-primary btn-full" onClick={handleUpdateStatus}
                    disabled={updating || newStatus === request.status}>
                    {updating ? <><span className="spinner" />Updating...</> : `🚀 Update to "${STATUS_LABELS[newStatus]}"`}
                  </button>
                </div>
              </div>
            )}

            {['collected', 'rejected'].includes(request.status) && (
              <div className={`alert ${request.status === 'rejected' ? 'alert-error' : 'alert-success'}`}>
                <span>{request.status === 'rejected' ? '❌' : '✅'}</span>
                <span>This request is <strong>{request.status}</strong> and closed.</span>
              </div>
            )}

            {/* Timeline */}
            <div className="card">
              <div className="card-header"><span className="card-title">📋 Status Timeline</span></div>
              <div className="card-body">
                <StatusTimeline history={request.statusHistory || []} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminRequestDetail;
