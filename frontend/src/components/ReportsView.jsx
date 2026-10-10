import React, { useState } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  ShieldCheck, 
  Download, 
  RefreshCw 
} from 'lucide-react';
import { formatCurrency } from '../data/menu.js';

export default function ReportsView({ stats, onRefresh, onOpenCloseCash }) {
  const [isExporting, setIsExporting] = useState(false);

  const totalVendido = stats?.totalVendido || 0;
  const totalComandas = stats?.totalComandasDespachadas || 0;
  const ticketPromedio = stats?.promedioTicket || 0;
  const ventas = stats?.ultimasVentas || [];

  const handleExportCSV = () => {
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

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
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
              Auditoría Contable & Métricas del Turno
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#fbeee0', margin: 0 }}>
              Trazabilidad inmutable de ventas, flujo de caja y cumplimiento financiero
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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
                fontSize: '0.825rem'
              }}
            >
              <RefreshCw size={15} /> Actualizar
            </button>
          )}

          {onOpenCloseCash && (
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
            onClick={handleExportCSV}
            style={{
              backgroundColor: '#e27329',
              color: '#fff',
              padding: '9px 18px',
              borderRadius: '10px',
              fontWeight: '900',
              fontSize: '0.85rem',
              boxShadow: '0 4px 14px rgba(226, 115, 41, 0.4)'
            }}
          >
            <Download size={16} /> Exportar Libro (CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}
      >
        <div style={{ backgroundColor: '#3d2314', border: '2px solid #5c351e', borderRadius: '16px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ffcc00', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase' }}>Ventas Brutas Turno</span>
            <DollarSign size={20} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(totalVendido)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#a5d6a7', marginTop: '6px', fontWeight: '700' }}>
            ✓ Recaudo conciliado en caja
          </div>
        </div>

        <div style={{ backgroundColor: '#3d2314', border: '2px solid #5c351e', borderRadius: '16px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#a5d6a7', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase' }}>Comandas Facturadas</span>
            <Receipt size={20} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#ffffff' }}>
            {totalComandas}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#c4a48c', marginTop: '6px' }}>
            Total tickets emitidos
          </div>
        </div>

        <div style={{ backgroundColor: '#3d2314', border: '2px solid #5c351e', borderRadius: '16px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4fc3f7', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '900', textTransform: 'uppercase' }}>Ticket Promedio</span>
            <TrendingUp size={20} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(ticketPromedio)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#c4a48c', marginTop: '6px' }}>
            Valor medio por mesa/orden
          </div>
        </div>
      </div>

      {/* Tabla de Auditoría Contable */}
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
              Registro de Facturación & Trazabilidad
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#c4a48c', fontWeight: '700' }}>
            {ventas.length} registros registrados
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
    </div>
  );
}
