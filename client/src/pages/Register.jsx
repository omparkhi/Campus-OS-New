import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../utils/constants';
import toast from 'react-hot-toast';

const Register = () => {
  // Added 'role' to the initial state
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', department: 'CSE', year: '2', rollNo: '', phone: '', role: 'student' 
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create payload and remove student-specific fields if registering as admin
      const payload = { ...form, year: parseInt(form.year) };
      if (form.role === 'admin') {
        delete payload.rollNo;
        delete payload.year;
      }

      await register(payload);
      toast.success('Account created! Welcome to CampusOS 🎉');
      
      // Navigate based on the selected role
      navigate(`/${form.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
      alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{
        background: 'white', borderRadius: 24, padding: '36px 32px',
        width: '100%', maxWidth: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>CampusOS</div>
            {/* Dynamically update the title */}
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {form.role === 'admin' ? 'Admin Registration' : 'Student Registration'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Role Selection Toggle */}
          <div className="form-group" style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>
              <input type="radio" name="role" value="student" checked={form.role === 'student'}
                onChange={e => setForm({ ...form, role: e.target.value })} />
              Student
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}>
              <input type="radio" name="role" value="admin" checked={form.role === 'admin'}
                onChange={e => setForm({ ...form, role: e.target.value })} />
              Admin
            </label>
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Aarav Sharma" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            {/* Hide Roll Number for Admins */}
            {form.role === 'student' && (
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input className="form-input" placeholder="CSE2021001" value={form.rollNo}
                  onChange={e => setForm({ ...form, rollNo: e.target.value })} required />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@pbce.ac.in" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              {/* Allow Admins to see all departments, potentially including 'Administration' */}
              <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                {DEPARTMENTS.filter(d => form.role === 'admin' ? true : d !== 'Administration').map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            {/* Hide Year for Admins */}
            {form.role === 'student' && (
              <div className="form-group">
                <label className="form-label">Year</label>
                <select className="form-select" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Phone (Optional)</label>
            <input className="form-input" placeholder="9876543210" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><span className="spinner" />Creating account...</> : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;