import { io } from 'socket.io-client';

let socket = null;
let heartbeatInterval = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;
  if (socket) {
    socket.disconnect();
    if (heartbeatInterval) clearInterval(heartbeatInterval);
  }

  const url = import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).origin : window.location.origin;
  const socketUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : url);

  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('[Fylo Socket] connected', socket.id);
    console.log(`
                       ____        __               
                      / __/_  ____/ /___            
                     / /_/ / / / / / __ \           
                    / __/ /_/ / /_/ /_//           
                   /_/  \__, /____/\____/           
                       /____/                       
  __________________________________________________
 |                                                  |
 |    [====]   WAREHOUSE OS   [v1.0]   [====]       |
 |__________________________________________________|      
      `)
    // Immediately request online list to fix refresh issue
    socket.emit('presence:get');
    socket.emit('user:heartbeat');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Fylo Socket] disconnected', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Fylo Socket] error', err.message);
  });

  socket.on('reconnect', () => {
    console.log('[Fylo Socket] reconnected');
    socket.emit('presence:get');
  });

  // Heartbeat every 25s - keep online status fresh
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    if (socket?.connected) {
      socket.emit('user:heartbeat');
    }
  }, 25000);

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
