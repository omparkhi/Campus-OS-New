import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const CampusConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('times');

  useEffect(() => {
    axios.get('/api/chat/config')
      .then(({ data }) => setConfig(data.config))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/chat/config', config);
      toast.success('✅ AI knowledge base updated! CampusBot will now use the new data.');
    } catch {
      toast.error('Failed to save. Try again.');
    } finally { setSaving(false); }
  };

  const updateProcessingTime = (key, val) => {
    setConfig(prev => ({ ...prev, processingTimes: { ...prev.processingTimes, [key]: val } }));
  };

  const updateNote = (i, val) => {
    const notes = [...(config.importantNotes || [])];
    notes[i] = val;
    setConfig(prev => ({ ...prev, importantNotes: notes }));
  };

  const addNote = () => setConfig(prev => ({ ...prev, importantNotes: [...(prev.importantNotes || []), ''] }));
  const removeNote = (i) => setConfig(prev => ({ ...prev, importantNotes: prev.importantNotes.filter((_, idx) => idx !== i) }));

  const TABS = [
    { key: 'times', label: '⏱ Processing Times' },
    { key: 'docs', label: '📄 Required Documents' },
    { key: 'office', label: '🕐 Office Info' },
    { key: 'notes', label: '📌 Important Notes' },
  ];

  if (loading) return <Layout title="AI Knowledge Base"><div style={{ textAlign: 'center', padding: 80 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div></Layout>;

  return (
    <Layout title="AI Knowledge Base" subtitle="Configure what CampusBot tells students">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          <span>🤖</span>
          <div>
            <strong>No code required.</strong> Changes here are instantly available to CampusBot. Students asking about documents, timelines, or office hours will get answers from this data.
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--bg)', padding: 6, borderRadius: 12 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{ flex: 1, padding: '8px 12px', border: 'none', cursor: 'pointer', borderRadius: 8,
                background: activeTab === t.key ? 'white' : 'transparent',
                color: activeTab === t.key ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === t.key ? 700 : 500, fontSize: 13,
                boxShadow: activeTab === t.key ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s'
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeTab === 'times' && config?.processingTimes && (
              <>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Set expected processing times for each request type. Students will see these when asking CampusBot.</p>
                {Object.entries(config.processingTimes).map(([key, val]) => (
                  <div className="form-group" key={key}>
                    <label className="form-label" style={{ textTransform: 'capitalize' }}>
                      {key.replace('_', ' ')} Certificate
                    </label>
                    <input className="form-input" value={val} onChange={e => updateProcessingTime(key, e.target.value)} placeholder="e.g., 2-3 working days" />
                  </div>
                ))}
              </>
            )}

            {activeTab === 'docs' && config?.requiredDocuments && (
              <>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Edit the required documents for each certificate type (comma-separated).</p>
                {Object.entries(config.requiredDocuments).map(([key, docs]) => (
                  <div className="form-group" key={key}>
                    <label className="form-label" style={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}</label>
                    <textarea className="form-textarea" rows={2} style={{ minHeight: 70 }}
                      value={Array.isArray(docs) ? docs.join(', ') : docs}
                      onChange={e => setConfig(prev => ({ ...prev, requiredDocuments: { ...prev.requiredDocuments, [key]: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }))} />
                  </div>
                ))}
              </>
            )}

            {activeTab === 'office' && (
              <>
                <div className="form-group">
                  <label className="form-label">Office Hours</label>
                  <textarea className="form-textarea" rows={2} style={{ minHeight: 70 }}
                    value={config?.officeHours || ''} onChange={e => setConfig(prev => ({ ...prev, officeHours: e.target.value }))} />
                </div>
                {config?.contactInfo && Object.entries(config.contactInfo).map(([key, val]) => (
                  <div className="form-group" key={key}>
                    <label className="form-label" style={{ textTransform: 'capitalize' }}>{key}</label>
                    <input className="form-input" value={val || ''}
                      onChange={e => setConfig(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, [key]: e.target.value } }))} />
                  </div>
                ))}
              </>
            )}

            {activeTab === 'notes' && (
              <>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>General notices about delays, holidays, or reminders shown to students.</p>
                {(config?.importantNotes || []).map((note, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" value={note} onChange={e => updateNote(i, e.target.value)} placeholder="Enter an important note..." />
                    <button className="btn btn-danger btn-sm" onClick={() => removeNote(i)}>✕</button>
                  </div>
                ))}
                <button className="btn btn-secondary" onClick={addNote}>+ Add Note</button>
              </>
            )}

            <div className="divider" />
            <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" />Saving...</> : '💾 Save & Update CampusBot'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CampusConfig;
