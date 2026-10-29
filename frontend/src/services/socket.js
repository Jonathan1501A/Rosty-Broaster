import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000';

let socket = null;

export const initSocket = (tenantId = 'rosty-broaster', callbacks = {}) => {
  // Si ya existía un socket anterior, desconectarlo para evitar mezclar salas
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    query: { tenantId },
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
    timeout: 10000,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log(`⚡ Socket.IO conectado [ID: ${socket.id}] a la empresa [${tenantId}]`);
    socket.emit('join:tenant', tenantId);
    if (callbacks.onConnect) callbacks.onConnect(socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.warn('🔌 Socket.IO desconectado:', reason);
    if (callbacks.onDisconnect) callbacks.onDisconnect(reason);
  });

  socket.on('connect_error', (error) => {
    console.warn('⚠️ Error de conexión Socket.IO:', error.message);
    if (callbacks.onError) callbacks.onError(error);
  });

  if (callbacks.onInitialData) {
    socket.on('initial:data', (data) => {
      // Filtrar y aceptar solo si corresponde al tenant actual
      if (!data.tenantId || data.tenantId === tenantId) {
        callbacks.onInitialData(data);
      }
    });
  }

  if (callbacks.onOrderCreated) {
    socket.on('order:created', callbacks.onOrderCreated);
  }

  if (callbacks.onOrderUpdated) {
    socket.on('order:updated', callbacks.onOrderUpdated);
  }

  if (callbacks.onOrdersSettled) {
    socket.on('orders:settled', callbacks.onOrdersSettled);
  }

  if (callbacks.onOrderDeleted) {
    socket.on('order:deleted', callbacks.onOrderDeleted);
  }

  if (callbacks.onTablesUpdated) {
    socket.on('tables:updated', callbacks.onTablesUpdated);
  }

  if (callbacks.onOrdersTimerTick) {
    socket.on('orders:timer_tick', callbacks.onOrdersTimerTick);
  }

  if (callbacks.onStatsUpdated) {
    socket.on('stats:updated', callbacks.onStatsUpdated);
  }

  if (callbacks.onAnnouncement) {
    socket.on('superadmin:announcement', callbacks.onAnnouncement);
  }

  if (callbacks.onTenantStatusChanged) {
    socket.on('tenant:status_changed', callbacks.onTenantStatusChanged);
  }

  if (callbacks.onExpenseCreated) {
    socket.on('expense:created', callbacks.onExpenseCreated);
  }

  if (callbacks.onExpenseDeleted) {
    socket.on('expense:deleted', callbacks.onExpenseDeleted);
  }

  return socket;
};

export const joinTenantRoom = (tenantId) => {
  if (socket && tenantId) {
    socket.emit('join:tenant', tenantId);
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
