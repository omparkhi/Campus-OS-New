export const REQUEST_TYPES = {
  bonafide: { label: 'Bonafide Certificate', icon: '📋', color: '#3b82f6', bg: '#eff6ff' },
  id_card: { label: 'ID Card', icon: '🪪', color: '#8b5cf6', bg: '#f5f3ff' },
  tc: { label: 'Transfer Certificate', icon: '📄', color: '#f59e0b', bg: '#fffbeb' },
  noc: { label: 'NOC', icon: '✅', color: '#10b981', bg: '#ecfdf5' },
  migration: { label: 'Migration Certificate', icon: '🎓', color: '#6366f1', bg: '#eef2ff' },
  character: { label: 'Character Certificate', icon: '⭐', color: '#ec4899', bg: '#fdf2f8' },
};

export const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: '#3b82f6', icon: '📨' },
  under_review: { label: 'Under Review', color: '#f59e0b', icon: '🔍' },
  approved: { label: 'Approved', color: '#8b5cf6', icon: '✅' },
  ready: { label: 'Ready to Collect', color: '#10b981', icon: '📦' },
  collected: { label: 'Collected', color: '#0d9488', icon: '🎉' },
  rejected: { label: 'Rejected', color: '#ef4444', icon: '❌' },
};

export const DEPARTMENTS = ['CSE', 'Civil', 'Mechanical', 'Electrical', 'Electronics', 'Administration'];

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
};
