import { io } from "socket.io-client";

const isBrowser = typeof window !== "undefined";

const socketConfig = {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
};

export const socket = isBrowser ? io('localhost:3000', socketConfig) : {};

// Add connection event listeners for debugging
if (isBrowser) {
  socket.on('connect', () => {
    console.log('🔗 Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
  });
}