import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

const getTenantId = (req) => req.headers['x-tenant-id'] || req.query.tenantId || req.body?.tenantId || 'rosty-broaster';

/**
 * @route GET /api/stats
 * @desc Métricas de venta, rotación de mesas y auditoría contable por empresa
 */
router.get('/', (req, res) => {
  const tenantId = getTenantId(req);
  const stats = store.getStats(tenantId);
  res.json({ stats });
});

/**
 * @route GET /api/stats/closures
 * @desc Historial de cuentas y cierres anteriores (Cortes Z) de la empresa
 */
router.get('/closures', (req, res) => {
  const tenantId = getTenantId(req);
  const closures = store.getClosures(tenantId);
  res.json({ closures });
});

/**
 * @route GET /api/stats/closures/:id
 * @desc Detalle completo de una cuenta o cierre anterior específico
 */
router.get('/closures/:id', (req, res) => {
  const tenantId = getTenantId(req);
  const closure = store.getClosureById(tenantId, req.params.id);
  if (!closure) {
    return res.status(404).json({ error: 'Cierre no encontrado.' });
  }
  res.json({ closure });
});

export default router;
