import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  Trash2, 
  Receipt, 
  DollarSign, 
  Wallet, 
  CreditCard, 
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  Clock,
  TrendingDown
} from 'lucide-react';
import { formatCurrency } from '../data/menu.js';
import { api } from '../services/api.js';

const CATEGORIAS_GASTO = [
  { id: 'insumos', label: 'Insumos & Mercado 🍗' },
  { id: 'servicios', label: 'Servicios & Gas 🔥' },
  { id: 'personal', label: 'Personal & Adelantos 👨‍🍳' },
  { id: 'transporte', label: 'Domicilios & Gasolina 🛵' },
  { id: 'mantenimiento', label: 'Mantenimiento & Aseo 🧹' },
  { id: 'imprevistos', label: 'Imprevistos & Caja Menor ⚠️' },
  { id: 'otros', label: 'Otros Gastos 📦' }
];

export default function ExpensesModal({
  isOpen,
  onClose,
  tenant,
  user,
  stats,
  onExpenseAdded,
  onExpenseDeleted
}) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState('insumos');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notas, setNotas] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const tenantId = tenant?.id || 'rosty-broaster';

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const list = await api.getExpenses(tenantId);
      setExpenses(list);
    } catch (err) {
      console.error('Error cargando gastos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadExpenses();
      setErrorMsg('');
      setConcepto('');
      setMonto('');
      setNotas('');
    }
  }, [isOpen, tenantId]);

  if (!isOpen) return null;

  const totalGastos = expenses.reduce((sum, e) => sum + (Number(e.monto) || 0), 0);
  const totalEfectivo = expenses
    .filter((e) => e.metodoPago === 'efectivo')
    .reduce((sum, e) => sum + (Number(e.monto) || 0), 0);
  const totalTransferencia = expenses
    .filter((e) => e.metodoPago !== 'efectivo')
    .reduce((sum, e) => sum + (Number(e.monto) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanConcepto = concepto.trim();
    if (!cleanConcepto) {
      setErrorMsg('Por favor ingresa la descripción o concepto del gasto.');
      return;
    }

    const cleanMonto = Number(monto);
    if (isNaN(cleanMonto) || cleanMonto <= 0) {
      setErrorMsg('El valor del gasto debe ser un monto válido mayor a $0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newExpense = await api.createExpense(
        {
          concepto: cleanConcepto,
          categoria,
          monto: cleanMonto,
          metodoPago,
          registradoPor: user?.name || user?.username || 'Administrador',
          notas: notas.trim()
        },
        tenantId
      );

      setExpenses((prev) => [newExpense, ...prev]);
      setConcepto('');
      setMonto('');
      setNotas('');

      if (onExpenseAdded) onExpenseAdded(newExpense);
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el gasto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('¿Seguro que deseas anular este gasto? Se recalculará el balance del día.')) {
      return;
    }

    try {
      await api.deleteExpense(expenseId, tenantId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      if (onExpenseDeleted) onExpenseDeleted(expenseId);
    } catch (err) {
      alert(err.message || 'Error al eliminar el gasto.');
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['ID,Concepto,Categoria,Monto,Metodo Pago,Registrado Por,Notas,Fecha'];
      const rows = expenses.map(
        (e) =>
          `"${e.id}","${e.concepto}","${e.categoria}",${e.monto},"${e.metodoPago}","${e.registradoPor}","${e.notas || ''}","${e.timestamp}"`
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `gastos_del_dia_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error al exportar CSV');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '92vh',
          backgroundColor: '#26160c',
          border: '3px solid #e27329',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#3d2314',
            borderBottom: '2px solid #5c351e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(226, 115, 41, 0.25)',
                border: '2px solid #e27329',
                color: '#ffcc00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <TrendingDown size={22} color="#ff7043" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                Gastos del Día & Caja Menor
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#fbeee0', margin: 0 }}>
                {tenant?.nombre || 'Restaurante'} • Salidas operativas y deducción del arqueo
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {expenses.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                title="Descargar reporte de gastos en CSV"
                style={{
                  backgroundColor: '#2b180d',
                  color: '#ffcc00',
                  border: '1.5px solid #5c351e',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <FileSpreadsheet size={15} /> Exportar
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#2b180d',
                color: '#fbeee0',
                border: '1.5px solid #5c351e',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Resumen de Métricas de Gastos */}
        <div
          style={{
            backgroundColor: '#1f1109',
            padding: '14px 24px',
            borderBottom: '2px solid #3d2314',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}
        >
          <div
            style={{
              backgroundColor: '#2b180d',
              border: '1.5px solid #c62828',
              borderRadius: '12px',
              padding: '12px 16px'
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#ff8a80', fontWeight: '800', textTransform: 'uppercase' }}>
              Total Gastos de Hoy
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ff5252', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totalGastos)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#c4a48c' }}>{expenses.length} registros realizados</div>
          </div>

          <div
            style={{
              backgroundColor: '#2b180d',
              border: '1.5px solid #e27329',
              borderRadius: '12px',
              padding: '12px 16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', color: '#ffcc80', fontWeight: '800', textTransform: 'uppercase' }}>
                Salidas Efectivo Caja
              </span>
              <Wallet size={16} color="#e27329" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totalEfectivo)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#81c784' }}>✓ Descontado del arqueo Z</div>
          </div>

          <div
            style={{
              backgroundColor: '#2b180d',
              border: '1.5px solid #0288d1',
              borderRadius: '12px',
              padding: '12px 16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.72rem', color: '#81d4fa', fontWeight: '800', textTransform: 'uppercase' }}>
                Salidas Transferencia
              </span>
              <CreditCard size={16} color="#0288d1" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#4fc3f7', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totalTransferencia)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#c4a48c' }}>Nequi / Daviplata / Banco</div>
          </div>
        </div>

        {/* Cuerpo del Modal: Formulario y Tabla */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Formulario de Registro */}
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: '#2e190e',
              border: '2px solid #5c351e',
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffcc00', fontWeight: '800', fontSize: '0.9rem' }}>
              <PlusCircle size={18} color="#e27329" />
              <span>Registrar Nuevo Gasto del Día</span>
            </div>

            {errorMsg && (
              <div
                style={{
                  backgroundColor: 'rgba(198, 40, 40, 0.25)',
                  border: '1.5px solid #c62828',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#ff8a80',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {/* Concepto */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '5px', fontWeight: '700' }}>
                  Concepto / Descripción del Gasto: *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Compra de carbón 2 bultos, verduras, bolsas y salsas..."
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  required
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
              </div>

              {/* Categoría */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '5px', fontWeight: '700' }}>
                  Categoría:
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  style={{ width: '100%', fontSize: '0.875rem', backgroundColor: '#341e11', color: '#fff', border: '1.5px solid #5c351e', padding: '9px 12px', borderRadius: '10px' }}
                >
                  {CATEGORIAS_GASTO.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monto */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '5px', fontWeight: '700' }}>
                  Valor del Gasto ($ COP): *
                </label>
                <input
                  type="number"
                  placeholder="Ej: 35000"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  min="1"
                  required
                  style={{ width: '100%', fontSize: '0.95rem', fontWeight: '800', color: '#ffcc00' }}
                />
              </div>

              {/* Método de salida */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '5px', fontWeight: '700' }}>
                  Salida de Dinero:
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  style={{ width: '100%', fontSize: '0.875rem', backgroundColor: '#341e11', color: '#fff', border: '1.5px solid #5c351e', padding: '9px 12px', borderRadius: '10px' }}
                >
                  <option value="efectivo">💵 Efectivo (Gaveta de Caja)</option>
                  <option value="transferencia">📱 Transferencia (Nequi / Banco)</option>
                </select>
              </div>

              {/* Notas opcionales */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '5px', fontWeight: '700' }}>
                  Notas / Factura / Proveedor (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Factura #104, pagado a Don Pedro"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Aviso de impacto en caja */}
            <div
              style={{
                backgroundColor: metodoPago === 'efectivo' ? 'rgba(226, 115, 41, 0.15)' : 'rgba(2, 136, 209, 0.15)',
                borderLeft: `4px solid ${metodoPago === 'efectivo' ? '#e27329' : '#0288d1'}`,
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#fbeee0'
              }}
            >
              {metodoPago === 'efectivo'
                ? 'ℹ️ Al salir de Efectivo de Caja, este valor se descontará automáticamente del efectivo esperado en el Corte Z (Arqueo).'
                : 'ℹ️ Al salir por Transferencia o Cuenta, no alterará la gaveta física del efectivo en caja.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#e27329',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '0.875rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(226, 115, 41, 0.4)'
                }}
              >
                <PlusCircle size={16} />
                <span>{isSubmitting ? 'Guardando...' : 'Registrar Gasto'}</span>
              </button>
            </div>
          </form>

          {/* Tabla de Gastos de Hoy */}
          <div
            style={{
              backgroundColor: '#2e190e',
              border: '2px solid #5c351e',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                backgroundColor: '#341e11',
                borderBottom: '2px solid #5c351e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} color="#ffcc00" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                  Historial de Gastos Registrados Hoy
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#c4a48c', fontWeight: '700' }}>
                {expenses.length} movimientos
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#26160c', color: '#ffcc00', borderBottom: '1.5px solid #5c351e' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '800' }}>ID / Hora</th>
                    <th style={{ padding: '12px 16px', fontWeight: '800' }}>Concepto</th>
                    <th style={{ padding: '12px 16px', fontWeight: '800' }}>Categoría</th>
                    <th style={{ padding: '12px 16px', fontWeight: '800' }}>Salida De</th>
                    <th style={{ padding: '12px 16px', fontWeight: '800' }}>Monto</th>
                    <th style={{ padding: '12px 16px', fontWeight: '800' }}>Registró</th>
                    <th style={{ padding: '12px 16px', fontWeight: '800', textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#c4a48c' }}>
                        No hay gastos registrados en el turno de hoy.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => {
                      const isEfectivo = exp.metodoPago === 'efectivo';
                      const dateObj = new Date(exp.timestamp);
                      const timeStr = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

                      return (
                        <tr
                          key={exp.id}
                          style={{
                            borderBottom: '1px solid #422515',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#382012')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '12px 16px', color: '#ffcc00', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                            <div>{exp.id}</div>
                            <div style={{ color: '#c4a48c', fontSize: '0.72rem' }}>{timeStr}</div>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#ffffff', fontWeight: '700' }}>
                            {exp.concepto}
                            {exp.notas && (
                              <div style={{ fontSize: '0.72rem', color: '#c4a48c', fontWeight: '400' }}>
                                📝 {exp.notas}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#3d2314',
                                border: '1px solid #5c351e',
                                color: '#fbeee0',
                                textTransform: 'capitalize'
                              }}
                            >
                              {exp.categoria}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: '800',
                                backgroundColor: isEfectivo ? 'rgba(226, 115, 41, 0.25)' : 'rgba(2, 136, 209, 0.25)',
                                color: isEfectivo ? '#ffb74d' : '#4fc3f7',
                                border: `1px solid ${isEfectivo ? '#e27329' : '#0288d1'}`
                              }}
                            >
                              {isEfectivo ? '💵 Efectivo' : '📱 Transferencia'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '900', color: '#ff5252', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                            -{formatCurrency(exp.monto)}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#c4a48c', fontSize: '0.8rem' }}>
                            {exp.registradoPor}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleDelete(exp.id)}
                              title="Anular o eliminar este gasto"
                              style={{
                                backgroundColor: 'rgba(198, 40, 40, 0.2)',
                                border: '1px solid #c62828',
                                color: '#ff5252',
                                padding: '6px 9px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
