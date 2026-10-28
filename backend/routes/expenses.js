import express from 'express';
import { store } from '../data/store.js';

const router = express.Router();

const getTenantId = (req) => req.headers['x-tenant-id'] || req.query.tenantId || req.body?.tenantId || 'rosty-broaster';

/**
 * @route GET /api/expenses
 * @desc Obtener la lista de gastos operativos del día para la empresa activa
 */
router.get('/', (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const expenses = store.getExpenses(tenantId);
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/expenses
 * @desc Registrar un nuevo gasto operativo del día
 */
router.post('/', (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { concepto, categoria, monto, metodoPago, registradoPor, notas } = req.body;

    const newExpense = store.addExpense(tenantId, {
      concepto,
      categoria,
      monto,
      metodoPago,
      registradoPor,
      notas
    });

    const io = req.app.get('io');
    if (io) {
      io.to(tenantId).emit('expense:created', { tenantId, expense: newExpense });
      io.to(tenantId).emit('stats:updated', store.getStats(tenantId));
    }

    res.status(201).json({
      message: 'Gasto registrado correctamente.',
      expense: newExpense
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/expenses/:id
 * @desc Anular o eliminar un gasto del día
 */
router.delete('/:id', (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const success = store.deleteExpense(tenantId, req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Gasto no encontrado o ya fue eliminado.' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(tenantId).emit('expense:deleted', { tenantId, id: req.params.id });
      io.to(tenantId).emit('stats:updated', store.getStats(tenantId));
    }

    res.json({
      message: 'Gasto eliminado correctamente.',
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
