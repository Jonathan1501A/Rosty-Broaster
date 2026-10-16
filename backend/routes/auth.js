import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';
import { store } from '../data/store.js';

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Autenticación segura mediante PIN o usuario con aislamiento por empresa y Superadmin
 */
router.post('/login', authLimiter, (req, res) => {
  const { role, username, pin, password, empresaId = 'rosty-broaster' } = req.body;
  const userPin = String(pin || password || '').trim();
  const identifier = String(username || role || '').trim();

  if (!identifier || !userPin) {
    return res.status(400).json({
      error: 'Se requiere especificar el usuario y el PIN o contraseña de acceso.',
      code: 'MISSING_CREDENTIALS'
    });
  }

  // 1. Acceso de Superadministrador Global
  if (empresaId === 'global' || identifier.toLowerCase() === 'superadmin') {
    const superUser = store.getSuperadmin();
    if (!superUser) {
      return res.status(401).json({ error: 'Superadministrador no configurado.' });
    }

    const isMatch = bcrypt.compareSync(userPin, superUser.pinHash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Contraseña de Superadministrador incorrecta.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const token = generateToken({
      id: superUser.id,
      empresaId: 'global',
      username: superUser.username,
      role: 'superadmin',
      name: superUser.name
    });

    return res.json({
      message: 'Inicio de sesión exitoso como Administrador Global.',
      token,
      user: {
        id: superUser.id,
        empresaId: 'global',
        username: superUser.username,
        role: 'superadmin',
        name: superUser.name
      },
      empresa: null
    });
  }

  // 2. Acceso de Usuario en Restaurante
  const tenant = store.getTenant(empresaId);
  if (!tenant) {
    return res.status(404).json({
      error: 'El restaurante o empresa no fue encontrada con este código.',
      code: 'TENANT_NOT_FOUND'
    });
  }

  // Verificar si el restaurante está cerrado o suspendido
  if (tenant.estado === 'cerrado') {
    return res.status(403).json({
      error: `El restaurante "${tenant.nombre}" se encuentra temporalmente cerrado o suspendido por la administración de la plataforma.`,
      code: 'TENANT_CLOSED'
    });
  }

  // Buscar usuario específico de esa empresa (por username, rol o PIN)
  const user = store.findUser(empresaId, identifier, userPin);

  if (!user) {
    return res.status(401).json({
      error: `Usuario "${identifier}" no encontrado en este restaurante (${tenant.nombre}).`,
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Verificación con hash bcrypt
  const isMatch = bcrypt.compareSync(userPin, user.pinHash);

  if (!isMatch) {
    return res.status(401).json({
      error: 'Código de acceso PIN o contraseña incorrecta.',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Generar Token JWT con empresaId incluida
  const token = generateToken({
    id: user.id,
    empresaId: user.empresaId,
    username: user.username,
    role: user.role,
    name: user.name
  });

  return res.json({
    message: 'Inicio de sesión exitoso.',
    token,
    user: {
      id: user.id,
      empresaId: user.empresaId,
      username: user.username,
      role: user.role,
      name: user.name
    },
    empresa: {
      id: tenant.id,
      nombre: tenant.nombre,
      slogan: tenant.slogan,
      logoEmoji: tenant.logoEmoji,
      colores: tenant.colores,
      numeroMesas: tenant.numeroMesas,
      whatsappDomiciliario: tenant.whatsappDomiciliario,
      estado: tenant.estado || 'activo'
    }
  });
});

/**
 * @route POST /api/auth/superadmin-login
 * @desc Autenticación directa para Superadministrador Global
 */
router.post('/superadmin-login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  const superUser = store.getSuperadmin();

  if (!superUser || username !== superUser.username || !bcrypt.compareSync(String(password || '').trim(), superUser.pinHash)) {
    return res.status(401).json({
      error: 'Credenciales maestras de Superadministrador incorrectas.'
    });
  }

  const token = generateToken({
    id: superUser.id,
    empresaId: 'global',
    username: superUser.username,
    role: 'superadmin',
    name: superUser.name
  });

  return res.json({
    message: 'Bienvenido al Panel Global.',
    token,
    user: {
      id: superUser.id,
      empresaId: 'global',
      username: superUser.username,
      role: 'superadmin',
      name: superUser.name
    }
  });
});

/**
 * @route GET /api/auth/me
 * @desc Verificar estado de la sesión activa
 */
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    user: req.user
  });
});

export default router;
