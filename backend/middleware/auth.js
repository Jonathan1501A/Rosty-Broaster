import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rosty_secret_dev_key_2026_local';

/**
 * Middleware para autenticar solicitudes mediante JWT Bearer token
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Acceso no autorizado: Token de sesión ausente.',
      code: 'UNAUTHORIZED'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Sesión expirada. Por favor ingrese de nuevo.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({
      error: 'Token inválido o manipulado.',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Middleware para restringir acceso por roles autorizados
 * @param {string[]} rolesPermitidos - Lista de roles permitidos, ej: ['waiter', 'chef', 'admin']
 */
export const requireRole = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({
        error: `Permiso denegado: Esta acción requiere rol de [${rolesPermitidos.join(', ')}].`,
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};

/**
 * Genera un token JWT firmado
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '10h'
  });
};
