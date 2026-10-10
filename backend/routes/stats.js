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

export default router;
