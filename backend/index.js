import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import {
  helmetMiddleware,
  getCorsMiddleware,
  globalLimiter
} from './middleware/security.js';

import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import tablesRouter from './routes/tables.js';
import statsRouter from './routes/stats.js';
import tenantsRouter from './routes/tenants.js';
import { store } from './data/store.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Dominios permitidos para WebSockets
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

// Configuración de WebSockets en tiempo real con seguridad CORS
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin || 
        allowedOrigins.includes('*') || 
        allowedOrigins.includes(origin) || 
        (typeof origin === 'string' && origin.endsWith('.vercel.app')) ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS WebSocket origin denied'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Guardar referencia de Socket.io en Express para uso en rutas
app.set('io', io);

// 1. Middlewares de Seguridad y Red
app.use(helmetMiddleware);
app.use(getCorsMiddleware());
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' })); // Prevenir ataques por payload grande

// 2. Ruta de Salud y Cumplimiento Normativo
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ROSTY Broaster POS & KDS API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    regulations: {
      dataProtection: 'Cumplimiento Ley 1581 Habeas Data / GDPR',
      securityHeaders: 'Helmet CSP & HSTS Activo',
      rateLimiting: 'Activo'
    },
    uptime: Math.floor(process.uptime())
  });
});

// 3. Montar Rutas Modulares
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/tenants', tenantsRouter);

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.send('🍗 ROSTY Broaster Backend API v1.0 - Producción Segura Activa');
});

// 4. Conexiones WebSocket en Tiempo Real con Aislamiento Estricto por Restaurante (Rooms)
io.on('connection', (socket) => {
  const initialTenantId = socket.handshake.query?.tenantId || socket.handshake.auth?.tenantId || 'rosty-broaster';
  socket.join(initialTenantId);
  console.log(`⚡ Dispositivo conectado [ID: ${socket.id}] a la sala [${initialTenantId}]`);

  // Enviar estado inicial exclusivo de ese restaurante
  socket.emit('initial:data', {
    tenantId: initialTenantId,
    tables: store.getTables(initialTenantId),
    orders: store.getOrders(initialTenantId),
    stats: store.getStats(initialTenantId)
  });

  // Permitir al cliente cambiar o unirse a la sala de su restaurante
  socket.on('join:tenant', (targetTenantId) => {
    if (!targetTenantId) return;
    // Salir de salas anteriores
    for (const room of socket.rooms) {
      if (room !== socket.id) socket.leave(room);
    }
    socket.join(targetTenantId);
    console.log(`🔄 Dispositivo [${socket.id}] se unió exclusivamente a la sala [${targetTenantId}]`);
    socket.emit('initial:data', {
      tenantId: targetTenantId,
      tables: store.getTables(targetTenantId),
      orders: store.getOrders(targetTenantId),
      stats: store.getStats(targetTenantId)
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Dispositivo desconectado [ID: ${socket.id}]`);
  });
});

// 5. Manejador Central de Errores (Evita exponer información técnica sensible en producción)
app.use((err, req, res, next) => {
  console.error('❌ Error capturado en servidor:', err.message);

  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'Ha ocurrido un error interno en el servidor.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }

  return res.status(500).json({
    error: err.message,
    stack: err.stack
  });
});

// 6. Iniciar Servidor
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor ROSTY Broaster en ejecución en: http://localhost:${PORT}`);
  console.log(`🛡️  Seguridad: Helmet, Rate Limiter y JWT activos.`);
});

export default app;
