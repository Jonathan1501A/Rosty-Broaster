import React, { useState } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  ShieldCheck, 
  Download, 
  RefreshCw,
  Wallet,
  PlusCircle,
  FileSpreadsheet,
  History,
  Calendar,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '../data/menu.js';
import ClosureDetailModal from './ClosureDetailModal.jsx';

export default function ReportsView({ stats, tenant, onRefresh, onOpenCloseCash, onOpenExpenses }) {
  const [activeTab, setActiveTab] = useState('turno'); // 'turno' | 'historial'
  const [isExporting, setIsExporting] = useState(false);
  const [selectedClosure, setSelectedClosure] = useState(null);

  // Datos del turno actual
  const totalVendido = Number(stats?.totalVendido) || 0;
  const totalComandas = Number(stats?.totalComandasDespachadas) || 0;
  const ticketPromedio = Number(stats?.promedioTicket) || 0;
  const ventas = stats?.ultimasVentas || [];

  const totalGastos = Number(stats?.totalGastos) || 0;
  const totalGastosEfectivo = Number(stats?.totalGastosEfectivo) || 0;
  const balanceNeto = stats?.balanceNeto !== undefined ? Number(stats.balanceNeto) : (totalVendido - totalGastos);
  const gastos = stats?.gastos || [];

  // Historial de cuentas y cierres pasados
  const cierresAnteriores = (stats?.cierresAnteriores || []).map((c) => {
    const venta = Number(c.totalVendido) || 0;
    const gasto = Number(c.totalGastos) || 0;
    const gastoEf = Number(c.totalGastosEfectivo) || 0;
    const neto = c.balanceNeto !== undefined ? Number(c.balanceNeto) : (venta - gasto);
    return {
      ...c,
      totalVendido: venta,
      totalGastos: gasto,
      totalGastosEfectivo: gastoEf,
      balanceNeto: neto
    };
  });

  // Totales acumulados históricos
  const historicoVentasTotal = cierresAnteriores.reduce((sum, c) => sum + c.totalVendido, 0);
  const historicoGastosTotal = cierresAnteriores.reduce((sum, c) => sum + c.totalGastos, 0);
  const historicoBalanceNeto = historicoVentasTotal - historicoGastosTotal;

  // Exportar ventas del turno actual a CSV
  const handleExportTurnoCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['ID Comprobante,Orden,Destino,Cliente,Total,Metodo Pago,Monto Recibido,Cambio,Atendido Por,Fecha'];
      const rows = ventas.map((v) => 
        `"${v.id}","${v.ordenId}","${v.destino}","${v.cliente}",${v.total},"${v.metodoPago}",${v.montoRecibido},${v.cambio},"${v.despachadoPor}","${v.timestamp}"`
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `auditoria_caja_rosty_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  // Exportar resumen de cuentas anteriores a CSV
  const handleExportHistorialCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['ID Corte,Fecha,Cerrado Por,Ventas Brutas Total,Gastos Totales,Ventas Netas (Utilidad),Comandas,Base Caja,Efectivo Esperado,Efectivo Real,Diferencia,Notas'];
      const rows = cierresAnteriores.map((c) => 
        `"${c.id}","${c.fechaFormateada || c.fecha}","${c.cerradoPor}",${c.totalVendido},${c.totalGastos},${c.balanceNeto},${c.totalComandas || 0},${c.baseCaja || 0},${c.efectivoEsperado || 0},${c.efectivoReal || 0},${c.diferencia || 0},"${c.notas || ''}"`
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `historial_cuentas_cierres_z_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Header Principal */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          backgroundColor: '#3d2314',
          border: '2px solid #5c351e',
          borderRadius: '16px',
          padding: '16px 22px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: 'rgba(2, 136, 209, 0.25)',
              border: '2px solid #0288d1',
              color: '#4fc3f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BarChart3 size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
              Auditoría Contable & Cuentas del Restaurante
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#fbeee0', margin: 0 }}>
              {tenant?.nombre || 'Restaurante'} • Turno actual, control de gastos e historial de cuentas anteriores
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              style={{
                backgroundColor: '#2b180d',
                border: '1.5px solid #5c351e',
                color: '#fbeee0',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={15} /> Actualizar
            </button>
          )}

          {activeTab === 'turno' && onOpenExpenses && (
            <button
              type="button"
              onClick={onOpenExpenses}
              style={{
                backgroundColor: 'rgba(226, 115, 41, 0.25)',
                color: '#ffcc00',
                border: '1.5px solid #e27329',
                padding: '9px 18px',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(226, 115, 41, 0.3)'
              }}
            >
              <TrendingDown size={16} color="#ff7043" /> Gastos del Día
            </button>
          )}

          {activeTab === 'turno' && onOpenCloseCash && (
            <button
              type="button"
              onClick={onOpenCloseCash}
              style={{
                backgroundColor: 'rgba(46, 125, 50, 0.25)',
                color: '#81c784',
                border: '1.5px solid #2e7d32',
                padding: '9px 18px',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(46, 125, 50, 0.3)'
              }}
            >
              <DollarSign size={16} /> Cierre de Caja (Corte Z)
            </button>
          )}

          <button
            type="button"
            disabled={isExporting}
            onClick={activeTab === 'turno' ? handleExportTurnoCSV : handleExportHistorialCSV}
            style={{
              backgroundColor: '#e27329',
              color: '#fff',
              padding: '9px 18px',
              borderRadius: '10px',
              fontWeight: '900',
              fontSize: '0.85rem',
              boxShadow: '0 4px 14px rgba(226, 115, 41, 0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación: Turno Actual vs Cuentas Anteriores */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#26160c',
          border: '2px solid #5c351e',
          borderRadius: '14px',
          overflow: 'hidden'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('turno')}
          style={{
            flex: 1,
            padding: '12px 18px',
            backgroundColor: activeTab === 'turno' ? '#e27329' : 'transparent',
            color: activeTab === 'turno' ? '#fff' : '#c4a48c',
            fontWeight: '900',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.15s ease'
          }}
        >
          <BarChart3 size={18} />
          <span>Turno Actual (En Vivo)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historial')}
          style={{
            flex: 1,
            padding: '12px 18px',
            backgroundColor: activeTab === 'historial' ? '#e27329' : 'transparent',
            color: activeTab === 'historial' ? '#fff' : '#c4a48c',
            fontWeight: '900',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.15s ease'
          }}
        >
          <History size={18} />
          <span>📚 Historial de Cuentas & Cierres Anteriores ({cierresAnteriores.length})</span>
        </button>
      </div>

      {/* VISTA 1: TURNO ACTUAL */}
      {activeTab === 'turno' && (
        <>
          {/* KPI Cards Turno Actual */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px'
            }}
          >
            {/* Ventas Brutas */}
            <div style={{ backgroundColor: '#3d2314', border: '2px solid #5c351e', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ffcc00', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase' }}>Ventas Brutas Turno</span>
                <DollarSign size={20} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(totalVendido)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#a5d6a7', marginTop: '6px', fontWeight: '700' }}>
                ✓ Recaudo total facturado hoy
              </div>
            </div>

            {/* Gastos del Día */}
            <div 
              onClick={onOpenExpenses}
              style={{ 
                backgroundColor: '#3d2314', 
                border: '2px solid #c62828', 
                borderRadius: '16px', 
                padding: '18px',
                cursor: onOpenExpenses ? 'pointer' : 'default'
              }}
              title="Haz clic para ver o registrar gastos"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ff8a80', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase' }}>Gastos del Día</span>
                <TrendingDown size={20} color="#ff5252" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ff5252', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(totalGastos)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#ffcc80', marginTop: '6px' }}>
                {formatCurrency(totalGastosEfectivo)} en efectivo de caja
              </div>
            </div>

            {/* Balance Neto Turno */}
            <div style={{ backgroundColor: '#3d2314', border: '2px solid #5c351e', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: balanceNeto >= 0 ? '#81c784' : '#ff8a80', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase' }}>Ventas Netas (Utilidad)</span>
                <Wallet size={20} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: balanceNeto >= 0 ? '#81c784' : '#ff5252', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(balanceNeto)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#c4a48c', marginTop: '6px' }}>
                Ventas ({formatCurrency(totalVendido)}) - Gastos ({formatCurrency(totalGastos)})
              </div>
            </div>

            {/* Comandas Facturadas */}
            <div style={{ backgroundColor: '#3d2314', border: '2px solid #5c351e', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#a5d6a7', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase' }}>Comandas Facturadas</span>
                <Receipt size={20} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff' }}>
                {totalComandas}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#c4a48c', marginTop: '6px' }}>
                Promedio: {formatCurrency(ticketPromedio)}
              </div>
            </div>
          </div>

          {/* Tabla de Gastos del Día */}
          <div
            style={{
              backgroundColor: '#3d2314',
              border: '2px solid #5c351e',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '2px solid #5c351e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2b180d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown size={20} color="#ff7043" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                  Control de Gastos Operativos del Turno
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {onOpenExpenses && (
                  <button
                    type="button"
                    onClick={onOpenExpenses}
                    style={{
                      backgroundColor: '#e27329',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <PlusCircle size={14} /> Registrar Gasto
                  </button>
                )}
                <span style={{ fontSize: '0.8rem', color: '#c4a48c', fontWeight: '700' }}>
                  {gastos.length} gastos registrados
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#341e11', color: '#ffcc00', borderBottom: '2px solid #5c351e' }}>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>ID / Código</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Concepto</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Categoría</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Método de Salida</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Monto</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Registrado Por</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#c4a48c' }}>
                        No hay gastos reportados en este turno.
                      </td>
                    </tr>
                  ) : (
                    gastos.map((g) => {
                      const dateObj = new Date(g.timestamp);
                      const isEfectivo = g.metodoPago === 'efectivo';

                      return (
                        <tr
                          key={g.id}
                          style={{
                            borderBottom: '1px solid #4a2c1a',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#422515')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '14px 18px', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                            {g.id}
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: '800', color: '#ffffff' }}>
                            {g.concepto}
                            {g.notas && <span style={{ display: 'block', fontSize: '0.75rem', color: '#c4a48c', fontWeight: '400' }}>📝 {g.notas}</span>}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: '#fbeee0',
                                backgroundColor: '#2b180d',
                                border: '1px solid #5c351e',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                textTransform: 'capitalize'
                              }}
                            >
                              {g.categoria}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: '#fff',
                                backgroundColor: isEfectivo ? '#e27329' : '#0288d1',
                                padding: '3px 9px',
                                borderRadius: '6px'
                              }}
                            >
                              {isEfectivo ? '💵 Efectivo (Gaveta)' : '📱 Transferencia'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: '900', color: '#ff5252', fontFamily: 'var(--font-mono)' }}>
                            -{formatCurrency(g.monto)}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#c4a48c' }}>
                            {g.registradoPor}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#c4a48c', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                            {dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Facturación & Ventas */}
          <div
            style={{
              backgroundColor: '#3d2314',
              border: '2px solid #5c351e',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '2px solid #5c351e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2b180d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#2e7d32" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                  Registro de Facturación & Trazabilidad de Ventas
                </h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#c4a48c', fontWeight: '700' }}>
                {ventas.length} comprobantes registrados
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#341e11', color: '#ffcc00', borderBottom: '2px solid #5c351e' }}>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>N° Comprobante</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Destino / Mesa</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Cliente</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Método de Pago</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Total</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Atendido Por</th>
                    <th style={{ padding: '14px 18px', fontWeight: '800' }}>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#c4a48c' }}>
                        No hay transacciones registradas en este turno aún.
                      </td>
                    </tr>
                  ) : (
                    ventas.map((v) => {
                      const methodBg = v.metodoPago === 'efectivo' ? '#2e7d32' : v.metodoPago === 'tarjeta' ? '#0288d1' : '#ad1457';
                      const dateObj = new Date(v.timestamp);

                      return (
                        <tr
                          key={v.id}
                          style={{
                            borderBottom: '1px solid #4a2c1a',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#422515')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '14px 18px', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                            {v.id}
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: '800', color: '#ffffff' }}>
                            {v.destino}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#fbeee0' }}>
                            {v.cliente}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: '#fff',
                                backgroundColor: methodBg,
                                padding: '3px 9px',
                                borderRadius: '6px',
                                textTransform: 'capitalize'
                              }}
                            >
                              {v.metodoPago}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                            {formatCurrency(v.total)}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#c4a48c' }}>
                            {v.despachadoPor}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#c4a48c', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                            {dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VISTA 2: HISTORIAL DE CUENTAS & CIERRES ANTERIORES (CORTES Z) */}
      {activeTab === 'historial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Tarjetas Acumuladas Históricas */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px'
            }}
          >
            {/* Ventas Totales Históricas */}
            <div style={{ backgroundColor: '#3d2314', border: '2px solid #ffcc00', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ffcc00', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase' }}>Ventas Brutas Históricas</span>
                <DollarSign size={20} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(historicoVentasTotal)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#c4a48c', marginTop: '6px' }}>
                Total acumulado en {cierresAnteriores.length} cierres registrados
              </div>
            </div>

            {/* Gastos Totales Históricos */}
            <div style={{ backgroundColor: '#3d2314', border: '2px solid #c62828', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ff8a80', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase' }}>Gastos Totales Históricos</span>
                <TrendingDown size={20} color="#ff5252" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ff5252', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(historicoGastosTotal)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#ffcc80', marginTop: '6px' }}>
                Salidas operativas acumuladas
              </div>
            </div>

            {/* Ventas Netas Totales Históricas */}
            <div style={{ backgroundColor: '#3d2314', border: '2px solid #2e7d32', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: historicoBalanceNeto >= 0 ? '#81c784' : '#ff8a80', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase' }}>Ventas Netas Acumuladas</span>
                <Wallet size={20} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: historicoBalanceNeto >= 0 ? '#81c784' : '#ff5252', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(historicoBalanceNeto)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#c4a48c', marginTop: '6px' }}>
                Utilidad bruta consolidada (Ventas - Gastos)
              </div>
            </div>

            {/* Total Cierres Archivados */}
            <div style={{ backgroundColor: '#3d2314', border: '2px solid #5c351e', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ba68c8', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase' }}>Cierres Archivados</span>
                <History size={20} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff' }}>
                {cierresAnteriores.length}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#c4a48c', marginTop: '6px' }}>
                Cortes Z con respaldo inmutable
              </div>
            </div>
          </div>

          {/* Tabla de Cuentas y Cierres Anteriores */}
          <div
            style={{
              backgroundColor: '#3d2314',
              border: '2px solid #5c351e',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '2px solid #5c351e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#2b180d'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={20} color="#ffcc00" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                  Historial de Cuentas Anteriores & Auditoría de Cierres Z
                </h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#c4a48c', fontWeight: '700' }}>
                {cierresAnteriores.length} cierres registrados
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#341e11', color: '#ffcc00', borderBottom: '2px solid #5c351e' }}>
                    <th style={{ padding: '14px 16px', fontWeight: '800' }}>Corte / Fecha</th>
                    <th style={{ padding: '14px 16px', fontWeight: '800' }}>Cerrado Por</th>
                    <th style={{ padding: '14px 16px', fontWeight: '800' }}>Ventas Brutas</th>
                    <th style={{ padding: '14px 16px', fontWeight: '800' }}>Gastos del Día</th>
                    <th style={{ padding: '14px 16px', fontWeight: '800' }}>Ventas Netas</th>
                    <th style={{ padding: '14px 16px', fontWeight: '800' }}>Comandas</th>
                    <th style={{ padding: '14px 16px', fontWeight: '800' }}>Cuadre Caja</th>
                    <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cierresAnteriores.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#c4a48c' }}>
                        No hay cierres anteriores registrados en el sistema todavía.
                      </td>
                    </tr>
                  ) : (
                    cierresAnteriores.map((c) => {
                      const diferencia = Number(c.diferencia) || 0;
                      return (
                        <tr
                          key={c.id}
                          style={{
                            borderBottom: '1px solid #4a2c1a',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#422515')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                              {c.id}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#c4a48c' }}>
                              {c.fechaFormateada || new Date(c.fecha).toLocaleString('es-CO')}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#fbeee0', fontWeight: '700' }}>
                            {c.cerradoPor || 'Administrador'}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                            {formatCurrency(c.totalVendido)}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: '800', color: '#ff5252', fontFamily: 'var(--font-mono)' }}>
                            {c.totalGastos > 0 ? `-${formatCurrency(c.totalGastos)}` : '$0'}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: '900', color: c.balanceNeto >= 0 ? '#81c784' : '#ff5252', fontFamily: 'var(--font-mono)' }}>
                            {formatCurrency(c.balanceNeto)}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#fbeee0' }}>
                            {c.totalComandas || 0}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                backgroundColor: diferencia === 0 ? 'rgba(46, 125, 50, 0.25)' : 'rgba(198, 40, 40, 0.25)',
                                color: diferencia === 0 ? '#81c784' : '#ff5252',
                                border: `1px solid ${diferencia === 0 ? '#2e7d32' : '#c62828'}`
                              }}
                            >
                              {diferencia === 0 ? '✓ Exacto' : `Dif: ${formatCurrency(diferencia)}`}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedClosure(c)}
                              style={{
                                backgroundColor: '#2b180d',
                                border: '1.5px solid #ffcc00',
                                color: '#ffcc00',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Eye size={14} /> Ver Detalle
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
      )}

      {/* Modal de Detalle de Cierre / Cuenta Pasada */}
      <ClosureDetailModal
        isOpen={Boolean(selectedClosure)}
        onClose={() => setSelectedClosure(null)}
        closure={selectedClosure}
        tenant={tenant}
      />
    </div>
  );
}
