import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Configuración de CORS segura para producción y desarrollo
export const getCorsMiddleware = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

  return cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como apps móviles, Postman o SSR) en dev o si coincide
      if (
        !origin || 
        allowedOrigins.includes('*') || 
        allowedOrigins.includes(origin) || 
        (typeof origin === 'string' && origin.endsWith('.vercel.app')) ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS: Origen no permitido por la política de seguridad.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-tenant-id']
  });
};

// Cabeceras HTTP seguras con Helmet y estándares OWASP
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
      frameAncestors: ["'none'"]
    }
  },
  frameguard: {
    action: 'deny'
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  crossOriginEmbedderPolicy: false
});

// Middleware complementario para asegurar cabeceras de seguridad estrictas en todas las respuestas
export const securityHeadersMiddleware = (req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
};

// Limitador de tasa global para mitigar DoS (Denegación de Servicio)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Máximo 1000 peticiones por IP en 15 minutos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiadas solicitudes desde esta dirección IP. Intente de nuevo en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Limitador estricto para autenticación contra ataques de fuerza bruta
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // Máximo 20 intentos de login por IP cada 10 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados intentos de acceso fallidos. Por seguridad, la cuenta está temporalmente bloqueada.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

// Limitador para creación de comandas para evitar spam o flooding
export const orderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // 60 órdenes por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Ritmo de creación de pedidos excesivo. Espere unos momentos.',
    code: 'ORDER_RATE_LIMIT'
  }
});
