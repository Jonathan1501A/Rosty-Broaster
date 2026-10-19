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
  const { role, username, pin, password, empresaId } = req.body;
  const userPin = String(pin || password || '').trim();
  const identifier = String(username || role || '').trim();

  if (!identifier || !userPin) {
    return res.status(400).json({
      error: 'Se requiere especificar el usuario y el PIN o contraseña de acceso.',
      code: 'MISSING_CREDENTIALS'
    });
  }

  // 1. Acceso Universal o Auto-detectado por credenciales (Sin forzar restaurante previo)
  if (!empresaId || empresaId === 'auto' || empresaId === 'global' || identifier.toLowerCase() === 'superadmin') {
    const match = store.findUserGlobal(identifier, userPin);
    if (!match) {
      return res.status(401).json({
        error: 'Credenciales inválidas. Verifica tu usuario y contraseña.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const { user, tenant } = match;

    // Si es Superadmin Global
    if (user.role === 'superadmin' || !tenant) {
      const token = generateToken({
        id: user.id,
        empresaId: 'global',
        username: user.username,
        role: 'superadmin',
        name: user.name
      });

      return res.json({
        message: 'Bienvenido al Panel de Superadministrador.',
        token,
        user: {
          id: user.id,
          empresaId: 'global',
          username: user.username,
          role: 'superadmin',
          name: user.name
        },
        empresa: null
      });
    }

    // Verificar si el restaurante está cerrado o suspendido
    if (tenant.estado === 'cerrado') {
      return res.status(403).json({
        error: `El restaurante "${tenant.nombre}" se encuentra temporalmente cerrado o suspendido por la administración de la plataforma.`,
        code: 'TENANT_CLOSED'
      });
    }

    const token = generateToken({
      id: user.id,
      empresaId: user.empresaId,
      username: user.username,
      role: user.role,
      name: user.name
    });

    return res.json({
      message: `Inicio de sesión exitoso en ${tenant.nombre}.`,
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
        domiciliarios: tenant.domiciliarios || [],
        estado: tenant.estado || 'activo'
      }
    });
  }

  // 2. Acceso específico con empresaId explícito (compatibilidad hacia atrás)
  const tenant = store.getTenant(empresaId);
  if (!tenant) {
    return res.status(404).json({
      error: 'El restaurante o empresa no fue encontrada con este código.',
      code: 'TENANT_NOT_FOUND'
    });
  }

  if (tenant.estado === 'cerrado') {
    return res.status(403).json({
      error: `El restaurante "${tenant.nombre}" se encuentra temporalmente cerrado o suspendido por la administración de la plataforma.`,
      code: 'TENANT_CLOSED'
    });
  }

  const user = store.findUser(empresaId, identifier, userPin);

  if (!user) {
    return res.status(401).json({
      error: `Usuario "${identifier}" no encontrado en este restaurante (${tenant.nombre}).`,
      code: 'INVALID_CREDENTIALS'
    });
  }

  const isMatch = bcrypt.compareSync(userPin, user.pinHash);

  if (!isMatch) {
    return res.status(401).json({
      error: 'Código de acceso PIN o contraseña incorrecta.',
      code: 'INVALID_CREDENTIALS'
    });
  }

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
      domiciliarios: tenant.domiciliarios || [],
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
 * @route GET /api/auth/check-username
 * @desc Verificar disponibilidad de un nombre de usuario en toda la plataforma
 */
router.get('/check-username', (req, res) => {
  const { username, excludeUserId } = req.query;
  if (!username || !String(username).trim()) {
    return res.status(400).json({ error: 'Debes ingresar un nombre de usuario.', available: false });
  }

  const clean = String(username).trim().toLowerCase();

  if (clean.length < 3) {
    return res.json({
      available: false,
      username: clean,
      reason: 'El nombre de usuario debe tener al menos 3 caracteres.'
    });
  }

  if (!/^[a-z0-9_.-]+$/.test(clean)) {
    return res.json({
      available: false,
      username: clean,
      reason: 'Solo se permiten letras, números, puntos, guiones y guiones bajos (sin espacios).'
    });
  }

  const isTaken = store.isUsernameTaken(clean, excludeUserId ? String(excludeUserId).trim() : null);

  return res.json({
    available: !isTaken,
    username: clean,
    reason: isTaken ? `El usuario "${clean}" ya está en uso. Elige otro nombre único.` : 'Usuario disponible.'
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
