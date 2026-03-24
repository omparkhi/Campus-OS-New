import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import { REQUEST_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

const REQUIRED_DOCS = {
  bonafide: ['Student ID', 'Fee receipt of current semester'],
  id_card: ['Passport photo (2 copies)', 'Fee receipt', 'Previous ID card (if replacement)'],
  tc: ['Fee clearance certificate', 'Library NOC', 'Hostel NOC (if applicable)', 'Original ID card'],
  noc: ['Application letter', 'Event/internship details', 'HOD approval form'],
  migration: ['TC from current college', 'Mark sheets (all semesters)', 'Fee clearance', 'Character certificate'],
  character: ['Student ID', 'Request application letter'],
};

const PROCESSING_TIMES = {
  bonafide: '2-3 working days', id_card: '3-5 working days',
  tc: '5-7 working days', noc: '1-2 working days',
  migration: '7-10 working days', character: '2-3 working days',
};

const NewRequest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ type: '', description: '', priority: 'normal' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.type) return toast.error('Please select a request type');
    setLoading(true);
    try {
      await axios.post('/api/requests', form);
      toast.success('Request submitted successfully! 🎉');
      navigate('/student/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="New Request" subtitle="Submit an administrative request">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Progress steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
          {['Select Type', 'Add Details', 'Confirm'].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step > i + 1 ? '#10b981' : step === i + 1 ? 'var(--primary)' : 'var(--bg)',
                  color: step >= i + 1 ? 'white' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: 14, transition: 'all 0.2s'
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: step === i + 1 ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? '#10b981' : 'var(--border)', margin: '0 8px', marginBottom: 22, transition: 'background 0.3s' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Select type */}
        {step === 1 && (
          <div className="card" style={{ animation: 'pageFade 0.2s ease' }}>
            <div className="card-header">
              <span className="card-title">Select Request Type</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {Object.entries(REQUEST_TYPES).map(([key, val]) => (
                  <div key={key} onClick={() => setForm({ ...form, type: key })}
                    style={{
                      padding: '16px', borderRadius: 12, cursor: 'pointer',
                      border: `2px solid ${form.type === key ? val.color : 'var(--border)'}`,
                      background: form.type === key ? val.bg : 'white',
                      transition: 'all 0.15s', display: 'flex', alignItems: 'flex-start', gap: 12
                    }}>
                    <span style={{ fontSize: 24 }}>{val.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: form.type === key ? val.color : 'var(--text-primary)' }}>{val.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>⏱ {PROCESSING_TIMES[key]}</div>
                    </div>
                  </div>
                ))}
              </div>
              {form.type && (
                <div className="alert alert-info" style={{ marginTop: 16 }}>
                  <span>📄</span>
                  <div>
                    <strong>Required documents:</strong>
                    <ul style={{ margin: '6px 0 0 16px', fontSize: 12 }}>
                      {REQUIRED_DOCS[form.type]?.map(d => <li key={d}>{d}</li>)}
                    </ul>
                  </div>
                </div>
              )}
              <button className="btn btn-primary btn-full" style={{ marginTop: 20 }}
                disabled={!form.type} onClick={() => setStep(2)}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="card" style={{ animation: 'pageFade 0.2s ease' }}>
            <div className="card-header">
              <span className="card-title">
                {REQUEST_TYPES[form.type]?.icon} {REQUEST_TYPES[form.type]?.label}
              </span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Purpose / Additional Notes (Optional)</label>
                <textarea className="form-textarea"
                  placeholder="e.g., Needed for SBI bank loan application, internship at TCS, scholarship form..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ minHeight: 120 }} />
                <span className="form-hint">Providing context helps the admin process your request faster.</span>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['normal', 'urgent'].map(p => (
                    <div key={p} onClick={() => setForm({ ...form, priority: p })}
                      style={{
                        padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${form.priority === p ? 'var(--primary)' : 'var(--border)'}`,
                        background: form.priority === p ? 'var(--primary-soft)' : 'white',
                        fontWeight: 600, fontSize: 14, color: form.priority === p ? 'var(--primary)' : 'var(--text-secondary)',
                        transition: 'all 0.15s', flex: 1, textAlign: 'center',
                      }}>
                      {p === 'normal' ? '🟢 Normal' : '🚨 Urgent'}
                    </div>
                  ))}
                </div>
                <span className="form-hint">Urgent requests are prioritized in the admin queue.</span>
              </div>
              <div className="alert alert-warning" style={{ fontSize: 12 }}>
                <span>⚠️</span>
                <span>Ensure all required physical documents are ready before submitting. Admin may reject incomplete requests.</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep(3)}>Review Request →</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="card" style={{ animation: 'pageFade 0.2s ease' }}>
            <div className="card-header">
              <span className="card-title">Confirm & Submit</span>
            </div>
            <div className="card-body">
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Request Type</span>
                  <span style={{ fontWeight: 700 }}>{REQUEST_TYPES[form.type]?.icon} {REQUEST_TYPES[form.type]?.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Priority</span>
                  <span style={{ fontWeight: 700 }}>{form.priority === 'urgent' ? '🚨 Urgent' : '🟢 Normal'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Processing Time</span>
                  <span style={{ fontWeight: 600 }}>{PROCESSING_TIMES[form.type]}</span>
                </div>
                {form.description && (
                  <div style={{ fontSize: 14 }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Notes</div>
                    <div style={{ fontWeight: 500 }}>{form.description}</div>
                  </div>
                )}
              </div>
              <div className="alert alert-info" style={{ marginBottom: 20, fontSize: 13 }}>
                <span>📡</span>
                <span>You'll receive real-time notifications as admin processes your request. Track status from your dashboard anytime.</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span className="spinner" />Submitting...</> : '🚀 Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewRequest;
