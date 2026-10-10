import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

const getTenantId = (req) => req.headers['x-tenant-id'] || req.query.tenantId || req.body?.tenantId || 'rosty-broaster';

/**
 * @route GET /api/tables
 * @desc Listado de las mesas del restaurante con su estado actual por empresa
 */
router.get('/', (req, res) => {
  const tenantId = getTenantId(req);
  res.json({ tables: store.getTables(tenantId) });
});

/**
 * @route POST /api/tables/:numero/close
 * @desc Cerrar cuenta de una mesa, registrar método de pago y emitir comprobante
 */
router.post('/:numero/close', (req, res) => {
  const tenantId = getTenantId(req);
  const { numero } = req.params;
  const { metodoPago, montoRecibido, atendidoPor } = req.body;

  const validPaymentMethods = ['efectivo', 'tarjeta', 'nequi', 'daviplata', 'transferencia'];
  const metodo = validPaymentMethods.includes(metodoPago) ? metodoPago : 'efectivo';

  const result = store.closeTable(tenantId, numero, metodo, montoRecibido, atendidoPor || 'Cajero de Turno');

  if (!result) {
    return res.status(404).json({ error: `La mesa #${numero} no existe o no pudo ser procesada.` });
  }

  const io = req.app.get('io');
  if (io) {
    io.to(tenantId).emit('tables:updated', store.getTables(tenantId));
    io.to(tenantId).emit('orders:refreshed', store.getOrders(tenantId));
    io.to(tenantId).emit('stats:updated', store.getStats(tenantId));
  }

  res.json({
    message: `Mesa #${numero} cerrada y facturada con éxito.`,
    table: result.table,
    receipt: result.receipt
  });
});

export default router;
