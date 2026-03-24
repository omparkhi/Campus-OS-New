import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') setForm({ email: 'admin@pbce.ac.in', password: 'admin123' });
    else setForm({ email: 'student1@pbce.ac.in', password: 'student123' });
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decor */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      {/* Left hero panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎓</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.5px' }}>CampusOS</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>PBCE Nagpur · ICI Ideathon 2026</div>
          </div>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-1px' }}>
          Smart Campus<br />Administration<br />Portal
        </h1>
        <p style={{ fontSize: 16, opacity: 0.75, lineHeight: 1.7, maxWidth: 380, marginBottom: 40 }}>
          Real-time transparency for certificate, ID card & TC requests. Track your admin requests live — no more office visits.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '⚡', text: 'Real-time status updates via Socket.io' },
            { icon: '🤖', text: 'AI-powered campus assistant' },
            { icon: '🔒', text: 'Role-based access for students & admins' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ fontSize: 14, opacity: 0.85 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right login card */}
      <div style={{ width: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{
          background: 'white', borderRadius: 24, padding: '36px 32px',
          width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s ease'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>Sign in to your CampusOS account</p>

          {/* Demo buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button onClick={() => fillDemo('student')} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: 12 }}>
              👤 Demo Student
            </button>
            <button onClick={() => fillDemo('admin')} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: 12 }}>
              🛡️ Demo Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@pbce.ac.in"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" />Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="divider" style={{ margin: '20px 0' }} />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            New student?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </p>

          <div className="alert alert-info" style={{ marginTop: 16, fontSize: 12 }}>
            <span>💡</span>
            <span>Use the demo buttons above to try as Student or Admin instantly.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
