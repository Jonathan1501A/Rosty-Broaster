import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

/**
 * @route GET /api/tenants
 * @desc Listar todas las empresas registradas
 */
router.get('/', (req, res) => {
  res.json({ tenants: store.getTenants() });
});

/**
 * @route POST /api/tenants
 * @desc Registrar una nueva empresa / restaurante
 */
router.post('/', (req, res) => {
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
    io.emit('tenant:config_updated', updated);
    io.emit('tables:updated', updated.tables);
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
    io.emit('tenant:menu_updated', { tenantId: req.params.id, menu });
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
      io.emit('cash:closed', { tenantId: req.params.id, closure });
      io.emit('stats:updated', store.getStats(req.params.id));
      io.emit('orders:updated', store.getOrders(req.params.id));
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
