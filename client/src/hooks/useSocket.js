import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let socketInstance = null;

const useSocket = (eventHandlers = {}) => {
  const { token } = useAuth();
  const handlersRef = useRef(eventHandlers);
  handlersRef.current = eventHandlers;

  useEffect(() => {
    if (!token) return;

    // Create singleton socket
    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    const socket = socketInstance;

    socket.on('connect', () => console.log('🔌 Socket connected:', socket.id));
    socket.on('disconnect', () => console.log('🔴 Socket disconnected'));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    // Attach dynamic event handlers
    const events = ['request:created', 'request:updated', 'request:rejected', 'request:completed'];
    events.forEach(event => {
      socket.on(event, (data) => {
        if (handlersRef.current[event]) {
          handlersRef.current[event](data);
        }
      });
    });

    return () => {
      events.forEach(event => socket.off(event));
    };
  }, [token]);

  const emit = useCallback((event, data) => {
    if (socketInstance?.connected) {
      socketInstance.emit(event, data);
    }
  }, []);

  return { socket: socketInstance, emit };
};

export default useSocket;
