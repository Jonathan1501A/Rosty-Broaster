import express from 'express';
import { store } from '../data/store.js';
import { orderLimiter } from '../middleware/security.js';

const router = express.Router();

const getTenantId = (req) => req.headers['x-tenant-id'] || req.query.tenantId || req.body?.tenantId || 'rosty-broaster';

/**
 * @route GET /api/orders
 * @desc Obtener todas las órdenes o filtradas por empresa
 */
router.get('/', (req, res) => {
  const tenantId = getTenantId(req);
  const { tipo, estado } = req.query;
  let orders = store.getOrders(tenantId);

  if (tipo && tipo !== 'todos') {
    orders = orders.filter((o) => o.tipo === tipo);
  }

  if (estado && estado !== 'todos') {
    orders = orders.filter((o) => o.estado === estado);
  }

  res.json({ orders });
});

/**
 * @route POST /api/orders
 * @desc Crear nueva orden (Mesas, Domicilio o Llevar) para la empresa
 */
router.post('/', orderLimiter, (req, res) => {
  const tenantId = getTenantId(req);
  const { tipo, destino, cliente, datosExtra, items, total, mesaNumero } = req.body;

  if (!tipo || !['dine_in', 'delivery', 'takeout'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de servicio no válido (dine_in, delivery, takeout).' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'La comanda debe incluir al menos un producto.' });
  }

  const cleanDestino = tipo === 'dine_in' 
    ? `Mesa ${mesaNumero || 1}` 
    : tipo === 'delivery' 
    ? (destino || 'Domicilio Sin Dirección') 
    : 'Retiro en Barra';

  const cleanCliente = cliente && String(cliente).trim().length > 0 
    ? String(cliente).trim() 
    : (tipo === 'dine_in' ? 'Salón' : 'Cliente');

  const cleanItems = items.map((it) => ({
    id: it.id,
    name: String(it.name).slice(0, 80),
    price: Math.max(0, Number(it.price) || 0),
    cantidad: Math.max(1, Number(it.cantidad) || 1),
    completado: false
  }));

  const cleanTotal = cleanItems.reduce((acc, curr) => acc + curr.price * curr.cantidad, 0);

  const newOrder = store.addOrder(tenantId, {
    tipo,
    destino: cleanDestino,
    cliente: cleanCliente,
    datosExtra: datosExtra || '',
    items: cleanItems,
    total: cleanTotal,
    mesaNumero: tipo === 'dine_in' ? Number(mesaNumero) : null
  });

  const io = req.app.get('io');
  if (io) {
    io.to(tenantId).emit('order:created', newOrder);
    if (tipo === 'dine_in' && mesaNumero) {
      io.to(tenantId).emit('tables:updated', store.getTables(tenantId));
    }
  }

  res.status(201).json({
    message: 'Comanda registrada con éxito.',
    order: newOrder
  });
});

/**
 * @route PATCH /api/orders/:id/status
 * @desc Actualizar estado de comanda (En preparación, Listo, Despachado)
 */
router.patch('/:id/status', (req, res) => {
  const tenantId = getTenantId(req);
  const { id } = req.params;
  const { estado } = req.body;

  const validStatuses = ['En preparación', 'En cola', 'Pendiente', 'Listo', 'Despachado'];
  if (!validStatuses.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Debe ser: ${validStatuses.join(', ')}` });
  }

  const updatedOrder = store.updateOrderStatus(tenantId, id, estado);
  if (!updatedOrder) {
    return res.status(404).json({ error: 'Comanda no encontrada.' });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(tenantId).emit('order:updated', updatedOrder);
  }

  res.json({
    message: 'Estado de comanda actualizado.',
    order: updatedOrder
  });
});

/**
 * @route PATCH /api/orders/:id/items/:itemId/toggle
 * @desc Marcar o desmarcar ítem cocinado individualmente
 */
router.patch('/:id/items/:itemId/toggle', (req, res) => {
  const tenantId = getTenantId(req);
  const { id, itemId } = req.params;

  const updatedOrder = (store.toggleOrderItem && store.toggleOrderItem(tenantId, id, Number(itemId))) || 
                       (store.toggleItemComplete && store.toggleItemComplete(tenantId, id, Number(itemId)));
  if (!updatedOrder) {
    return res.status(404).json({ error: 'Comanda o ítem no encontrado.' });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(tenantId).emit('order:updated', updatedOrder);
  }

  res.json({
    message: 'Estado del ítem actualizado.',
    order: updatedOrder
  });
});

export default router;
