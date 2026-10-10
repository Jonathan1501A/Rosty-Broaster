import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';
import { store } from '../data/store.js';

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Autenticación segura mediante PIN o usuario con aislamiento por empresa
 */
router.post('/login', authLimiter, (req, res) => {
  const { role, pin, empresaId = 'rosty-broaster' } = req.body;

  if (!role || !pin) {
    return res.status(400).json({
      error: 'Se requiere especificar el usuario o rol y el PIN de acceso.',
      code: 'MISSING_CREDENTIALS'
    });
  }

  const tenant = store.getTenant(empresaId);
  if (!tenant) {
    return res.status(404).json({
      error: 'El restaurante o empresa no fue encontrada.',
      code: 'TENANT_NOT_FOUND'
    });
  }

  // Buscar usuario específico de esa empresa
  const user = store.findUser(empresaId, role);

  if (!user) {
    return res.status(401).json({
      error: `Credenciales inválidas para este restaurante (${tenant.nombre}).`,
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Verificación con hash bcrypt (tiempo constante, anti-timing attack)
  const isMatch = bcrypt.compareSync(String(pin).trim(), user.pinHash);

  if (!isMatch) {
    return res.status(401).json({
      error: 'Código de acceso PIN incorrecto.',
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
      whatsappDomiciliario: tenant.whatsappDomiciliario
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
