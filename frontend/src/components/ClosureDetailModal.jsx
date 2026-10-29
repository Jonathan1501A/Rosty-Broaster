import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Calendar, 
  User, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Receipt, 
  Wallet, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency } from '../data/menu.js';

export default function ClosureDetailModal({
  isOpen,
  onClose,
  closure,
  tenant
}) {
  const [activeTab, setActiveTab] = useState('resumen'); // 'resumen' | 'gastos' | 'ventas'

  if (!isOpen || !closure) return null;

  const totalVendido = Number(closure.totalVendido) || 0;
  const totalGastos = Number(closure.totalGastos) || 0;
  const totalGastosEfectivo = Number(closure.totalGastosEfectivo) || 0;
  const totalGastosTransferencia = Number(closure.totalGastosTransferencia) || 0;
  const balanceNeto = closure.balanceNeto !== undefined 
    ? Number(closure.balanceNeto) 
    : (totalVendido - totalGastos);

  const porMetodo = closure.porMetodoPago || { efectivo: 0, nequi: 0, daviplata: 0, tarjeta: 0 };
  const base = Number(closure.baseCaja) || 0;
  const esperado = Number(closure.efectivoEsperado) || (base + (porMetodo.efectivo || 0) - totalGastosEfectivo);
  const real = Number(closure.efectivoReal) !== undefined ? Number(closure.efectivoReal) : esperado;
  const diferencia = Number(closure.diferencia) !== undefined ? Number(closure.diferencia) : (real - esperado);

  const comprobantes = Array.isArray(closure.comprobantes) ? closure.comprobantes : [];
  const gastosRegistrados = Array.isArray(closure.gastosRegistrados) ? closure.gastosRegistrados : [];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Tipo,ID,Concepto/Destino,Cliente,Monto,Metodo Pago,Detalle,Fecha'];
      const rowsVentas = comprobantes.map((v) => 
        `"VENTA","${v.id}","${v.destino || ''}","${v.cliente || ''}",${v.total},"${v.metodoPago || ''}","${v.despachadoPor || ''}","${v.timestamp || closure.fecha}"`
      );
      const rowsGastos = gastosRegistrados.map((g) => 
        `"GASTO","${g.id}","${g.concepto || ''}","${g.categoria || ''}",-${g.monto},"${g.metodoPago || ''}","${g.registradoPor || ''}","${g.timestamp || closure.fecha}"`
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rowsVentas, ...rowsGastos].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `cierre_z_${closure.id}_${new Date(closure.fecha).toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('Error al exportar reporte a CSV');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
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
          border: '3px solid #ffcc00',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95)'
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
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 204, 0, 0.25)',
                border: '2px solid #ffcc00',
                color: '#ffcc00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Receipt size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                  Detalle de Cuenta: {closure.id}
                </h2>
                <span
                  style={{
                    backgroundColor: '#e27329',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: '900',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}
                >
                  CORTE Z HISTÓRICO
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#fbeee0', margin: '2px 0 0' }}>
                {tenant?.nombre || 'Restaurante'} • {closure.fechaFormateada || new Date(closure.fecha).toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                backgroundColor: '#2b180d',
                color: '#ffcc00',
                border: '1.5px solid #5c351e',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <FileSpreadsheet size={15} /> Exportar CSV
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                backgroundColor: '#2b180d',
                color: '#fbeee0',
                border: '1.5px solid #5c351e',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} /> Imprimir Z
            </button>

            <button
              type="button"
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

        {/* Barra de Tabs */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid #3d2314', backgroundColor: '#1f1109' }}>
          {[
            { id: 'resumen', label: '📊 Resumen & Arqueo Contable' },
            { id: 'gastos', label: `💸 Gastos del Día (${gastosRegistrados.length})` },
            { id: 'ventas', label: `🧾 Comprobantes de Venta (${comprobantes.length})` }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: isActive ? '#26160c' : 'transparent',
                  color: isActive ? '#ffcc00' : '#c4a48c',
                  borderBottom: isActive ? '3px solid #ffcc00' : 'none',
                  borderRadius: 0,
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenido según Tab */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {activeTab === 'resumen' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Tarjetas KPI de este Cierre */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px'
                }}
              >
                {/* Venta Bruta */}
                <div style={{ backgroundColor: '#341e11', border: '1.5px solid #5c351e', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ffcc00', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase' }}>Venta Bruta Total</span>
                    <DollarSign size={18} />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(totalVendido)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#a5d6a7', marginTop: '4px' }}>
                    {closure.totalComandas || comprobantes.length} comandas emitidas
                  </div>
                </div>

                {/* Gastos del Día */}
                <div style={{ backgroundColor: '#341e11', border: '1.5px solid #c62828', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ff8a80', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase' }}>Gastos del Día</span>
                    <TrendingDown size={18} color="#ff5252" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ff5252', fontFamily: 'var(--font-mono)' }}>
                    -{formatCurrency(totalGastos)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#ffcc80', marginTop: '4px' }}>
                    {formatCurrency(totalGastosEfectivo)} en efectivo de caja
                  </div>
                </div>

                {/* Ventas Netas */}
                <div style={{ backgroundColor: '#341e11', border: '1.5px solid #2e7d32', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: balanceNeto >= 0 ? '#81c784' : '#ff8a80', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase' }}>Ventas Netas (Utilidad)</span>
                    <TrendingUp size={18} />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: balanceNeto >= 0 ? '#81c784' : '#ff5252', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(balanceNeto)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#c4a48c', marginTop: '4px' }}>
                    Ventas ({formatCurrency(totalVendido)}) - Gastos ({formatCurrency(totalGastos)})
                  </div>
                </div>
              </div>

              {/* Desglose de Ventas por Método de Pago */}
              <div
                style={{
                  backgroundColor: '#2b180d',
                  border: '1.5px solid #5c351e',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#ffcc00', textTransform: 'uppercase' }}>
                  💳 Desglose de Ventas por Método de Pago
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                  <div style={{ backgroundColor: '#341e11', padding: '12px', borderRadius: '10px', border: '1px solid #4a2c1a' }}>
                    <div style={{ fontSize: '0.75rem', color: '#c4a48c', fontWeight: '700' }}>💵 Efectivo:</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#81c784', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(porMetodo.efectivo || 0)}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#341e11', padding: '12px', borderRadius: '10px', border: '1px solid #4a2c1a' }}>
                    <div style={{ fontSize: '0.75rem', color: '#c4a48c', fontWeight: '700' }}>📱 Nequi:</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ba68c8', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(porMetodo.nequi || 0)}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#341e11', padding: '12px', borderRadius: '10px', border: '1px solid #4a2c1a' }}>
                    <div style={{ fontSize: '0.75rem', color: '#c4a48c', fontWeight: '700' }}>📲 Daviplata:</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ef5350', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(porMetodo.daviplata || 0)}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#341e11', padding: '12px', borderRadius: '10px', border: '1px solid #4a2c1a' }}>
                    <div style={{ fontSize: '0.75rem', color: '#c4a48c', fontWeight: '700' }}>💳 Tarjeta / Datafono:</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#4fc3f7', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(porMetodo.tarjeta || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arqueo y Cuadre de Caja de ese Cierre */}
              <div
                style={{
                  backgroundColor: '#2b180d',
                  border: '1.5px solid #5c351e',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#ffcc00', textTransform: 'uppercase' }}>
                  💵 Arqueo y Cuadre de Gaveta de Caja
                </div>

                <div
                  style={{
                    backgroundColor: '#341e11',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '12px',
                    border: '1px solid #4a2c1a'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#c4a48c', fontWeight: '700' }}>Base Inicial de Caja:</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fbeee0', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(base)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#c4a48c', fontWeight: '700' }}>Efectivo Esperado:</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(esperado)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#c4a48c', fontWeight: '700' }}>Efectivo Real Contado:</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#81c784', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(real)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#c4a48c', fontWeight: '700' }}>Diferencia de Cuadre:</span>
                    <div
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: '900',
                        color: diferencia === 0 ? '#81c784' : diferencia < 0 ? '#ff5252' : '#ffcc00',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {diferencia === 0 ? '✓ Cuadre Exacto' : formatCurrency(diferencia)}
                    </div>
                  </div>
                </div>

                {closure.notas && (
                  <div style={{ fontSize: '0.8rem', color: '#fbeee0', backgroundColor: '#341e11', padding: '10px 14px', borderRadius: '10px', fontStyle: 'italic' }}>
                    📝 Observaciones del cierre: "{closure.notas}"
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: '#c4a48c' }}>
                  Cerrado por: <strong>{closure.cerradoPor || 'Administrador'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB DE GASTOS */}
          {activeTab === 'gastos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffcc00' }}>
                  Total Gastos Registrados: {formatCurrency(totalGastos)}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#c4a48c' }}>
                  {gastosRegistrados.length} egresos en este día
                </span>
              </div>

              {gastosRegistrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#c4a48c', backgroundColor: '#2b180d', borderRadius: '12px' }}>
                  No se registraron gastos operativos en este corte.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', backgroundColor: '#2b180d', borderRadius: '12px', border: '1px solid #5c351e' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#341e11', color: '#ffcc00', borderBottom: '1.5px solid #5c351e' }}>
                        <th style={{ padding: '10px 14px' }}>Concepto</th>
                        <th style={{ padding: '10px 14px' }}>Categoría</th>
                        <th style={{ padding: '10px 14px' }}>Salida de</th>
                        <th style={{ padding: '10px 14px' }}>Monto</th>
                        <th style={{ padding: '10px 14px' }}>Registrado Por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastosRegistrados.map((g, idx) => (
                        <tr key={g.id || idx} style={{ borderBottom: '1px solid #3d2314' }}>
                          <td style={{ padding: '10px 14px', color: '#fff', fontWeight: '700' }}>
                            {g.concepto}
                            {g.notas && <span style={{ display: 'block', fontSize: '0.72rem', color: '#c4a48c', fontWeight: '400' }}>{g.notas}</span>}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#c4a48c', textTransform: 'capitalize' }}>
                            {g.categoria || 'insumos'}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: g.metodoPago === 'efectivo' ? '#e27329' : '#0288d1', color: '#fff' }}>
                              {g.metodoPago === 'efectivo' ? '💵 Efectivo' : '📱 Transferencia'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#ff5252', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                            -{formatCurrency(g.monto)}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#c4a48c', fontSize: '0.75rem' }}>
                            {g.registradoPor || 'Admin'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB DE VENTAS */}
          {activeTab === 'ventas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffcc00' }}>
                  Total Facturado: {formatCurrency(totalVendido)}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#c4a48c' }}>
                  {comprobantes.length} comandas en este corte
                </span>
              </div>

              {comprobantes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#c4a48c', backgroundColor: '#2b180d', borderRadius: '12px' }}>
                  No hay detalle individual de comandas para este cierre.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', backgroundColor: '#2b180d', borderRadius: '12px', border: '1px solid #5c351e' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#341e11', color: '#ffcc00', borderBottom: '1.5px solid #5c351e' }}>
                        <th style={{ padding: '10px 14px' }}>N° Comprobante</th>
                        <th style={{ padding: '10px 14px' }}>Destino / Mesa</th>
                        <th style={{ padding: '10px 14px' }}>Cliente</th>
                        <th style={{ padding: '10px 14px' }}>Método</th>
                        <th style={{ padding: '10px 14px' }}>Total</th>
                        <th style={{ padding: '10px 14px' }}>Atendido Por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comprobantes.map((v, idx) => (
                        <tr key={v.id || idx} style={{ borderBottom: '1px solid #3d2314' }}>
                          <td style={{ padding: '10px 14px', color: '#ffcc00', fontFamily: 'var(--font-mono)', fontWeight: '800' }}>
                            {v.id}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#fff', fontWeight: '700' }}>
                            {v.destino}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#fbeee0' }}>
                            {v.cliente}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#3d2314', border: '1px solid #5c351e', color: '#fff', textTransform: 'capitalize' }}>
                              {v.metodoPago}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#ffcc00', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                            {formatCurrency(v.total)}
                          </td>
                          <td style={{ padding: '10px 14px', color: '#c4a48c', fontSize: '0.75rem' }}>
                            {v.despachadoPor || 'Caja'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
