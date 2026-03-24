import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { timeAgo } from '../utils/constants';

const NotificationBell = ({ onCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('/api/notifications');
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
      if (onCountChange) onCountChange(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAll = async () => {
    await axios.patch('/api/notifications/read-all');
    fetchNotifications();
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="btn btn-ghost btn-icon notif-bell" onClick={() => setOpen(!open)}
        style={{ fontSize: 20, position: 'relative' }}>
        🔔
        {unread > 0 && <span className="notif-count">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '110%', width: 320,
          background: 'white', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
          zIndex: 200, overflow: 'hidden', animation: 'slideUp 0.15s ease'
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
              Notifications {unread > 0 && <span style={{ color: 'var(--primary)', fontSize: 13 }}>({unread} new)</span>}
            </span>
            {unread > 0 && (
              <button onClick={markAll} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 15).map(n => (
                <div key={n._id} style={{
                  padding: '12px 16px',
                  background: n.isRead ? 'white' : 'var(--primary-soft)',
                  borderBottom: '1px solid var(--border-light)',
                  transition: 'background 0.15s'
                }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
