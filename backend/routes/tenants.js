import express from 'express';
import jwt from 'jsonwebtoken';
import { store } from '../data/store.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'rosty_secret_dev_key_2026_local';

const isSuperadmin = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && decoded.role === 'superadmin';
  } catch {
    return false;
  }
};

/**
 * @route GET /api/tenants
 * @desc Listar todas las empresas registradas (Exclusivo Superadmin)
 */
router.get('/', (req, res) => {
  if (!isSuperadmin(req)) {
    return res.status(403).json({
      error: 'Acceso restringido: Solo el Administrador Global puede ver la lista de empresas.',
      tenants: []
    });
  }
  res.json({ tenants: store.getTenants() });
});

/**
 * @route POST /api/tenants
 * @desc Registrar una nueva empresa / restaurante (Exclusivo Superadmin)
 */
router.post('/', (req, res) => {
  if (!isSuperadmin(req)) {
    return res.status(403).json({
      error: 'Acceso restringido: Solo el Administrador Global puede registrar empresas.'
    });
  }

  const {
    nombre,
    slogan,
    logoEmoji,
    colores,
    numeroMesas,
    telefono,
    direccion,
    whatsappDomiciliario,
    adminPin,
    adminName
  } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre del restaurante es obligatorio.' });
  }

  try {
    const result = store.createTenant({
      nombre,
      slogan,
      logoEmoji,
      colores,
      numeroMesas,
      telefono,
      direccion,
      whatsappDomiciliario,
      adminPin: adminPin || 'admin123',
      adminName: adminName || `Admin ${nombre}`
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('tenants:updated', store.getTenants());
    }

    res.status(201).json({
      message: 'Restaurante creado con éxito.',
      tenant: result.tenant,
      adminUser: result.adminUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/tenants/:id
 * @desc Eliminar una empresa / restaurante (Exclusivo Superadmin)
 */
router.delete('/:id', (req, res) => {
  if (!isSuperadmin(req)) {
    return res.status(403).json({
      error: 'Acceso restringido: Solo el Administrador Global puede eliminar empresas.'
    });
  }

  const deleted = store.deleteTenant(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Restaurante no encontrado.' });
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('tenants:updated', store.getTenants());
  }

  res.json({ message: 'Restaurante eliminado con éxito.' });
});

/**
 * @route POST /api/tenants/notify
 * @desc Enviar notificación en tiempo real a uno o todos los restaurantes (Exclusivo Superadmin)
 */
router.post('/notify', (req, res) => {
  if (!isSuperadmin(req)) {
    return res.status(403).json({
      error: 'Acceso restringido: Solo el Administrador Global puede enviar notificaciones.'
    });
  }

  const { tenantId, title, message, type = 'info' } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'El mensaje de notificación es obligatorio.' });
  }

  const payload = {
    id: `notif-${Date.now()}`,
    title: title || 'Comunicado Oficial',
    message: message.trim(),
    type,
    timestamp: new Date().toISOString()
  };

  const io = req.app.get('io');
  if (io) {
    if (!tenantId || tenantId === 'all') {
      io.emit('superadmin:announcement', payload);
    } else {
      io.to(tenantId).emit('superadmin:announcement', payload);
    }
  }

  res.json({ message: 'Notificación enviada en tiempo real.', notification: payload });
});

/**
 * @route PUT /api/tenants/:id/status
 * @desc Cambiar estado del restaurante (activo vs cerrado) (Exclusivo Superadmin)
 */
router.put('/:id/status', (req, res) => {
  if (!isSuperadmin(req)) {
    return res.status(403).json({
      error: 'Acceso restringido: Solo el Administrador Global puede cambiar el estado de las empresas.'
    });
  }

  const { estado } = req.body;
  const updated = store.updateTenantStatus(req.params.id, estado);
  if (!updated) return res.status(404).json({ error: 'Restaurante no encontrado.' });

  const io = req.app.get('io');
  if (io) {
    io.to(req.params.id).emit('tenant:status_changed', { tenantId: req.params.id, estado: updated.estado });
    io.emit('tenants:updated', store.getTenants());
  }

  res.json({ message: `Estado actualizado a "${updated.estado}".`, tenant: updated });
});

/**
 * @route PUT /api/tenants/:id/admin
 * @desc Modificar datos y PIN del administrador de un restaurante (Exclusivo Superadmin)
 */
router.put('/:id/admin', (req, res) => {
  if (!isSuperadmin(req)) {
    return res.status(403).json({
      error: 'Acceso restringido: Solo el Administrador Global puede modificar administradores.'
    });
  }

  try {
    const updatedAdmin = store.updateTenantAdmin(req.params.id, req.body);
    res.json({ message: 'Administrador actualizado con éxito.', admin: updatedAdmin });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route GET /api/tenants/:id
 * @desc Obtener datos completos de una empresa (configuración y menú)
 */
router.get('/:id', (req, res) => {
  const tenant = store.getTenant(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Restaurante no encontrado.' });
  res.json({ tenant });
});

/**
 * @route PUT /api/tenants/:id/config
 * @desc Actualizar personalización de la empresa (colores, mesas, nombre, whatsapp)
 */
router.put('/:id/config', (req, res) => {
  const updated = store.updateTenantConfig(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Restaurante no encontrado.' });

  const io = req.app.get('io');
  if (io) {
    io.to(req.params.id).emit('tenant:config_updated', updated);
    if (updated.tables) {
      io.to(req.params.id).emit('tables:updated', updated.tables);
    }
  }

  res.json({ message: 'Configuración de restaurante actualizada.', tenant: updated });
});

/**
 * @route PUT /api/tenants/:id/menu
 * @desc Actualizar menú de platos y precios de la empresa
 */
router.put('/:id/menu', (req, res) => {
  const menu = store.updateTenantMenu(req.params.id, req.body.menu);
  if (!menu) return res.status(404).json({ error: 'Restaurante no encontrado.' });

  const io = req.app.get('io');
  if (io) {
    io.to(req.params.id).emit('tenant:menu_updated', { tenantId: req.params.id, menu });
  }

  res.json({ message: 'Menú actualizado con éxito.', menu });
});

/**
 * @route GET /api/tenants/:id/users
 * @desc Listar personal y usuarios de la empresa
 */
router.get('/:id/users', (req, res) => {
  const users = store.getUsersByTenant(req.params.id);
  res.json({ users });
});

/**
 * @route POST /api/tenants/:id/users
 * @desc Crear nuevo usuario para la empresa
 */
router.post('/:id/users', (req, res) => {
  try {
    const newUser = store.createUser(req.params.id, req.body);
    res.status(201).json({ message: 'Usuario creado con éxito.', user: newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/tenants/:id/users/:userId
 * @desc Eliminar usuario de la empresa
 */
router.delete('/:id/users/:userId', (req, res) => {
  const deleted = store.deleteUser(req.params.id, req.params.userId);
  if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.json({ message: 'Usuario eliminado.' });
});

/**
 * @route POST /api/tenants/:id/close-cash
 * @desc Realizar Cierre de Caja del Día (Corte Z), archivar y reiniciar a $0
 */
router.post('/:id/close-cash', (req, res) => {
  try {
    const closure = store.closeCashRegister(req.params.id, req.body);

    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('cash:closed', { tenantId: req.params.id, closure });
      io.to(req.params.id).emit('stats:updated', store.getStats(req.params.id));
      io.to(req.params.id).emit('orders:updated', store.getOrders(req.params.id));
    }

    res.json({
      message: 'Cierre de caja realizado con éxito. Las ventas del día han sido archivadas y la caja se reinició en $0.',
      closure
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
