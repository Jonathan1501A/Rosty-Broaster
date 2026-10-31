import React from 'react';
import { X, Printer } from 'lucide-react';
import { formatCurrency } from '../data/menu.js';

export default function ComandaPrintModal({
  isOpen,
  onClose,
  order,
  tenant,
  user
}) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const items = Array.isArray(order.items) ? order.items : [];
  const total = Number(order.total) || items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.cantidad) || 1), 0);
  const fecha = order.timestamp || order.createdAt || new Date().toISOString();
  const fechaFormateada = new Date(fecha).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const tipoServicioLabel = 
    order.tipo === 'dine_in' 
      ? `SALÓN • MESA #${order.mesaNumero || ''}` 
      : order.tipo === 'delivery' 
      ? 'PEDIDO A DOMICILIO 🛵' 
      : 'PARA LLEVAR / RETIRO EN BARRA 🛍️';

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(5px)',
        zIndex: 10050,
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
          maxWidth: '440px',
          backgroundColor: '#1f1109',
          border: '2px solid #e27329',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.9)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Actions */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#3d2314',
            borderBottom: '1.5px solid #5c351e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} color="#ffcc00" />
            <span style={{ fontWeight: '900', color: '#ffcc00', fontSize: '0.95rem' }}>
              Impresión de Comanda / Factura
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#2b180d',
              border: '1px solid #5c351e',
              color: '#c4a48c',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Printable Ticket Preview Area (White thermal paper look) */}
        <div style={{ padding: '16px', overflowY: 'auto', maxHeight: '72vh', backgroundColor: '#2b180d' }}>
          <div
            className="thermal-ticket-container"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              padding: '18px 14px',
              borderRadius: '6px',
              fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
              fontSize: '12px',
              lineHeight: 1.35,
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              margin: '0 auto',
              width: '100%',
              maxWidth: '340px'
            }}
          >
            {/* Header del Restaurante */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                {tenant?.nombre || 'ROSTY BROASTER'}
              </div>
              <div style={{ fontSize: '10px', marginTop: '2px' }}>
                {tenant?.slogan || 'El Original V. - Pollo & Especialidades'}
              </div>
              {tenant?.direccion && (
                <div style={{ fontSize: '10px', marginTop: '2px' }}>
                  📍 {tenant.direccion}
                </div>
              )}
              {tenant?.telefono && (
                <div style={{ fontSize: '10px', marginTop: '1px' }}>
                  📞 Tel/WhatsApp: {tenant.telefono}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

            {/* Datos de la Comanda */}
            <div style={{ fontSize: '11px', marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '13px', marginBottom: '4px' }}>
                {tipoServicioLabel}
              </div>
              <div><strong>Comanda:</strong> #{order.id}</div>
              <div><strong>Fecha:</strong> {fechaFormateada}</div>
              {order.cliente && <div><strong>Cliente:</strong> {order.cliente}</div>}
              {order.destino && order.tipo === 'delivery' && (
                <div><strong>Dirección:</strong> {order.destino}</div>
              )}
              {order.datosExtra && (
                <div><strong>Detalle/Tel:</strong> {order.datosExtra}</div>
              )}
              {order.domiciliarioNombre && (
                <div><strong>Repartidor:</strong> 🛵 {order.domiciliarioNombre}</div>
              )}
              {order.atendidoPor && (
                <div><strong>Atendido por:</strong> {order.atendidoPor}</div>
              )}
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

            {/* Listado de Platos & Bebidas */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                  <th style={{ width: '15%', paddingBottom: '3px' }}>Cant</th>
                  <th style={{ width: '55%', paddingBottom: '3px' }}>Producto</th>
                  <th style={{ width: '30%', textAlign: 'right', paddingBottom: '3px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const cant = Number(it.cantidad) || 1;
                  const itemTotal = (Number(it.price) || 0) * cant;
                  const sabor = it.sabor || it.flavor || (it.nota ? `[${it.nota}]` : null);
                  return (
                    <tr key={idx} style={{ verticalAlign: 'top' }}>
                      <td style={{ paddingTop: '4px', fontWeight: 'bold' }}>{cant}x</td>
                      <td style={{ paddingTop: '4px' }}>
                        <div style={{ fontWeight: '600' }}>{it.name}</div>
                        {sabor && (
                          <div style={{ fontSize: '10px', fontStyle: 'italic' }}>
                            👉 {sabor}
                          </div>
                        )}
                      </td>
                      <td style={{ paddingTop: '4px', textAlign: 'right', fontWeight: 'bold' }}>
                        {formatCurrency(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ borderTop: '1px dashed #000', margin: '10px 0 6px 0' }} />

            {/* Totales y Pago */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900', margin: '6px 0' }}>
              <span>TOTAL A PAGAR:</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {order.metodoPago && (
              <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                <span>Método de pago:</span>
                <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{order.metodoPago}</span>
              </div>
            )}

            {order.montoRecibido !== undefined && order.montoRecibido > 0 && order.metodoPago === 'efectivo' && (
              <>
                <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span>Efectivo recibido:</span>
                  <span>{formatCurrency(order.montoRecibido)}</span>
                </div>
                <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span>Cambio / Vueltas:</span>
                  <span>{formatCurrency(order.cambio || (order.montoRecibido - total))}</span>
                </div>
              </>
            )}

            <div style={{ borderTop: '1px dashed #000', margin: '12px 0 6px 0' }} />

            {/* Pie de Página Térmico */}
            <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '8px' }}>
              <div style={{ fontWeight: 'bold' }}>¡GRACIAS POR SU COMPRA!</div>
              <div style={{ marginTop: '2px', fontSize: '9px' }}>
                Documento de control interno • Software RostyBroaster POS
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal con Botones */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#3d2314',
            borderTop: '1.5px solid #5c351e',
            display: 'flex',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: '#2b180d',
              border: '1px solid #5c351e',
              color: '#fbeee0',
              padding: '11px',
              borderRadius: '10px',
              fontWeight: '700'
            }}
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              flex: 2,
              backgroundColor: '#e27329',
              border: '1.5px solid #ffcc00',
              color: '#ffffff',
              padding: '11px',
              borderRadius: '10px',
              fontWeight: '900',
              boxShadow: '0 4px 14px rgba(226, 115, 41, 0.5)'
            }}
          >
            <Printer size={16} /> Imprimir Comanda / Factura
          </button>
        </div>
      </div>
    </div>
  );
}
