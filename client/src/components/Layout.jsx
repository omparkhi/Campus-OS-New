import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import ChatWidget from './ChatWidget';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/constants';

const Layout = ({ children, title, subtitle }) => {
  const { user } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  return (
    <div className="app-layout">
      <Sidebar notifCount={notifCount} />
      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">{title || 'Dashboard'}</div>
            {subtitle && <div className="topbar-sub">{subtitle}</div>}
          </div>
          <div className="topbar-actions">
            {user?.role === 'student' && (
              <NotificationBell onCountChange={setNotifCount} />
            )}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 13
            }}>
              {getInitials(user?.name)}
            </div>
          </div>
        </header>
        <main className="page-content page-fade">
          {children}
        </main>
      </div>
      {user?.role === 'student' && <ChatWidget />}
    </div>
  );
};

export default Layout;
