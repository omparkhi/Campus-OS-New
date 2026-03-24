import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import NewRequest from './pages/student/NewRequest';
import MyRequests from './pages/student/MyRequests';
import RequestDetail from './pages/student/RequestDetail';
import History from './pages/student/History';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import RequestQueue from './pages/admin/RequestQueue';
import AdminRequestDetail from './pages/admin/RequestDetail';
import Students from './pages/admin/Students';
import Analytics from './pages/admin/Analytics';
import CampusConfig from './pages/admin/CampusConfig';

// Route guards
const RequireAuth = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🎓</div>
        <span className="spinner" style={{ width: 28, height: 28 }} />
        <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 14 }}>Loading CampusOS...</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

    {/* Student routes */}
    <Route path="/student/dashboard" element={<RequireAuth role="student"><StudentDashboard /></RequireAuth>} />
    <Route path="/student/new-request" element={<RequireAuth role="student"><NewRequest /></RequireAuth>} />
    <Route path="/student/requests" element={<RequireAuth role="student"><MyRequests /></RequireAuth>} />
    <Route path="/student/requests/:id" element={<RequireAuth role="student"><RequestDetail /></RequireAuth>} />
    <Route path="/student/history" element={<RequireAuth role="student"><History /></RequireAuth>} />

    {/* Admin routes */}
    <Route path="/admin/dashboard" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
    <Route path="/admin/requests" element={<RequireAuth role="admin"><RequestQueue /></RequireAuth>} />
    <Route path="/admin/requests/:id" element={<RequireAuth role="admin"><AdminRequestDetail /></RequireAuth>} />
    <Route path="/admin/students" element={<RequireAuth role="admin"><Students /></RequireAuth>} />
    <Route path="/admin/analytics" element={<RequireAuth role="admin"><Analytics /></RequireAuth>} />
    <Route path="/admin/config" element={<RequireAuth role="admin"><CampusConfig /></RequireAuth>} />

    {/* Default redirects */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
