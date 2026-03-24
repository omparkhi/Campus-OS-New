import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/constants';
import toast from 'react-hot-toast';

const StudentNav = [
  { path: '/student/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/student/new-request', icon: '➕', label: 'New Request' },
  { path: '/student/requests', icon: '📋', label: 'My Requests' },
  { path: '/student/history', icon: '🕐', label: 'History' },
];

const AdminNav = [
  { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/admin/requests', icon: '📋', label: 'Request Queue' },
  { path: '/admin/students', icon: '👥', label: 'Students' },
  { path: '/admin/analytics', icon: '📊', label: 'Analytics' },
  { path: '/admin/config', icon: '⚙️', label: 'AI Knowledge Base' },
];

const Sidebar = ({ notifCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === 'admin' ? AdminNav : StudentNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎓</div>
        <div>
          <div className="sidebar-logo-text">CampusOS</div>
          <div className="sidebar-logo-sub">PBCE Nagpur</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">
          {user?.role === 'admin' ? 'Admin Panel' : 'Student Portal'}
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
            {item.label === 'My Requests' && notifCount > 0 && (
              <span className="sidebar-badge">{notifCount}</span>
            )}
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 16 }}>Account</div>
        <button className="sidebar-item" onClick={handleLogout}>
          <span className="icon">🚪</span>
          Logout
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{getInitials(user?.name)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role} · {user?.department}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
