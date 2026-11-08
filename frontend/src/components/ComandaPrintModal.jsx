import React from 'react';
import { X, Printer } from 'lucide-react';
import { formatCurrency } from '../data/menu.js';

const escapeHtml = (text) => {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const printThermalReceipt80mm = ({
  tenant,
  order,
  items,
  total,
  fechaFormateada,
  tipoServicioLabel
}) => {
  const nombre = tenant?.nombre || 'ROSTY BROASTER';
  const slogan = tenant?.slogan || 'El Original V. - El mejor pollo al estilo americano';
  const nit = tenant?.nit ? `NIT: ${tenant.nit}` : '';
  const direccion = tenant?.direccion ? `📍 ${tenant.direccion}` : '';
  const telefono = tenant?.telefono ? `📞 Tel: ${tenant.telefono}` : '';
  const mensajeFinal = tenant?.mensajeFactura || '¡GRACIAS POR SU COMPRA! VUELVA PRONTO';
  const pieFactura = tenant?.pieFactura || 'Documento de control interno • Software RostyBroaster POS';

  const itemsHtml = items.map(it => {
    const cant = Number(it.cantidad) || 1;
    const itemTotal = (Number(it.price) || 0) * cant;
    const sabor = it.sabor || it.flavor || (it.nota ? `[${it.nota}]` : null);
    return `
      <tr>
        <td class="col-cant">${cant}x</td>
        <td class="col-desc">
          <div class="prod-name">${escapeHtml(it.name)}</div>
          ${sabor ? `<div class="prod-flavor">👉 ${escapeHtml(sabor)}</div>` : ''}
        </td>
        <td class="col-price">${formatCurrency(itemTotal)}</td>
      </tr>
    `;
  }).join('');

  const paymentDetails = order.metodoPago ? `
    <div class="line-flex" style="margin-top: 4px;">
      <span>Método de pago:</span>
      <span class="bold uppercase">${escapeHtml(order.metodoPago)}</span>
    </div>
    ${order.montoRecibido !== undefined && order.montoRecibido > 0 && order.metodoPago === 'efectivo' ? `
      <div class="line-flex">
        <span>Efectivo recibido:</span>
        <span>${formatCurrency(order.montoRecibido)}</span>
      </div>
      <div class="line-flex">
        <span>Cambio / Vueltas:</span>
        <span class="bold">${formatCurrency(order.cambio || (order.montoRecibido - total))}</span>
      </div>
    ` : ''}
  ` : '';

  const ticketHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Comanda #${order.id} - 80mm</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            width: 80mm;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'JetBrains Mono', Consolas, 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.35;
          }
          body {
            padding: 4mm 4mm 15mm 4mm;
          }
          .ticket-wrapper {
            width: 72mm;
            max-width: 72mm;
            margin: 0 auto;
          }
          .center { text-align: center; }
          .bold { font-weight: 900; }
          .uppercase { text-transform: uppercase; }
          .title {
            font-size: 17px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            margin-bottom: 2px;
          }
          .subtitle { font-size: 10px; margin-bottom: 2px; }
          .meta-info { font-size: 10.5px; }
          .dashed-divider {
            border-top: 1px dashed #000000;
            margin: 6px 0;
          }
          .double-divider {
            border-top: 2px dashed #000000;
            margin: 8px 0;
          }
          .service-badge {
            font-size: 13px;
            font-weight: 900;
            text-align: center;
            margin-bottom: 4px;
          }
          .info-block { font-size: 11px; }
          .info-block div { margin-bottom: 1px; }
          table.items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
            margin: 4px 0;
          }
          table.items-table th {
            border-bottom: 1px solid #000000;
            padding-bottom: 3px;
            font-size: 10px;
            font-weight: 900;
            text-align: left;
          }
          table.items-table td {
            padding: 3px 0;
            vertical-align: top;
          }
          .col-cant { width: 14%; font-weight: 900; }
          .col-desc { width: 56%; }
          .col-price { width: 30%; text-align: right; font-weight: 900; white-space: nowrap; }
          .prod-name { font-weight: 700; word-break: break-word; }
          .prod-flavor { font-size: 10px; font-style: italic; margin-top: 1px; }
          .line-flex {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .total-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 15px;
            font-weight: 900;
            padding: 4px 0;
          }
          .footer-section {
            text-align: center;
            font-size: 10px;
            margin-top: 8px;
          }
          .footer-msg {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            margin-bottom: 3px;
          }
          .cutter-space {
            height: 14mm;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="ticket-wrapper">
          <div class="center">
            <div class="title">${escapeHtml(nombre)}</div>
            ${slogan ? `<div class="subtitle">${escapeHtml(slogan)}</div>` : ''}
            ${nit ? `<div class="meta-info bold">${escapeHtml(nit)}</div>` : ''}
            ${direccion ? `<div class="meta-info">${escapeHtml(direccion)}</div>` : ''}
            ${telefono ? `<div class="meta-info">${escapeHtml(telefono)}</div>` : ''}
          </div>

          <div class="dashed-divider"></div>

          <div class="info-block">
            <div class="service-badge uppercase">${escapeHtml(tipoServicioLabel)}</div>
            <div><strong>Comanda:</strong> #${escapeHtml(order.id)}</div>
            <div><strong>Fecha:</strong> ${escapeHtml(fechaFormateada)}</div>
            ${order.cliente ? `<div><strong>Cliente:</strong> ${escapeHtml(order.cliente)}</div>` : ''}
            ${order.destino && order.tipo === 'delivery' ? `<div><strong>Dirección:</strong> ${escapeHtml(order.destino)}</div>` : ''}
            ${order.datosExtra ? `<div><strong>Detalle/Tel:</strong> ${escapeHtml(order.datosExtra)}</div>` : ''}
            ${order.domiciliarioNombre ? `<div><strong>Repartidor:</strong> 🛵 ${escapeHtml(order.domiciliarioNombre)}</div>` : ''}
            ${order.atendidoPor ? `<div><strong>Atendido por:</strong> ${escapeHtml(order.atendidoPor)}</div>` : ''}
          </div>

          <div class="dashed-divider"></div>

          <table class="items-table">
            <thead>
              <tr>
                <th class="col-cant">Cant</th>
                <th class="col-desc">Producto</th>
                <th class="col-price" style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="double-divider"></div>

          <div class="total-box">
            <span>TOTAL A PAGAR:</span>
            <span>${formatCurrency(total)}</span>
          </div>

          ${paymentDetails}

          <div class="dashed-divider"></div>

          <div class="footer-section">
            <div class="footer-msg">${escapeHtml(mensajeFinal)}</div>
            <div>${escapeHtml(pieFactura)}</div>
          </div>

          <div class="cutter-space"></div>
        </div>
      </body>
    </html>
  `;

  let iframe = document.getElementById('comanda-thermal-printer-frame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'comanda-thermal-printer-frame';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '80mm';
    iframe.style.height = '100mm';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(ticketHtml);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      window.print();
    }
  }, 250);
};

export default function ComandaPrintModal({
  isOpen,
  onClose,
  order,
  tenant,
  user
}) {
  if (!isOpen || !order) return null;

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

  const handlePrint = () => {
    printThermalReceipt80mm({
      tenant,
      order,
      items,
      total,
      fechaFormateada,
      tipoServicioLabel
    });
  };

  return (
    <div
      className="thermal-print-modal-overlay"
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
        className="thermal-print-modal-content animate-fade-in"
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
          className="no-print"
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
              Impresión Térmica 80 mm
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
              padding: '18px 14px 24px 14px',
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
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                {tenant?.nombre || 'ROSTY BROASTER'}
              </div>
              {tenant?.slogan && (
                <div style={{ fontSize: '10px', marginTop: '2px' }}>
                  {tenant.slogan}
                </div>
              )}
              {tenant?.nit && (
                <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '2px' }}>
                  NIT: {tenant.nit}
                </div>
              )}
              {tenant?.direccion && (
                <div style={{ fontSize: '10px', marginTop: '2px' }}>
                  📍 {tenant.direccion}
                </div>
              )}
              {tenant?.telefono && (
                <div style={{ fontSize: '10px', marginTop: '1px' }}>
                  📞 Tel: {tenant.telefono}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

            {/* Datos de la Comanda */}
            <div style={{ fontSize: '11px', marginBottom: '8px' }}>
              <div style={{ fontWeight: '900', textAlign: 'center', fontSize: '13px', marginBottom: '4px' }}>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
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

            <div style={{ borderTop: '2px dashed #000', margin: '10px 0 6px 0' }} />

            {/* Totales y Pago */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', margin: '6px 0' }}>
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
                <div style={{ fontSize: '10.5px', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span>Efectivo recibido:</span>
                  <span>{formatCurrency(order.montoRecibido)}</span>
                </div>
                <div style={{ fontSize: '10.5px', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span>Cambio / Vueltas:</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(order.cambio || (order.montoRecibido - total))}</span>
                </div>
              </>
            )}

            <div style={{ borderTop: '1px dashed #000', margin: '12px 0 6px 0' }} />

            {/* Pie de Página Térmico */}
            <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '8px' }}>
              <div style={{ fontWeight: '900', fontSize: '11px', textTransform: 'uppercase' }}>
                {tenant?.mensajeFactura || '¡GRACIAS POR SU COMPRA! VUELVA PRONTO'}
              </div>
              <div style={{ marginTop: '3px', fontSize: '9.5px' }}>
                {tenant?.pieFactura || 'Documento de control interno • Software RostyBroaster POS'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal con Botones */}
        <div
          className="no-print"
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
              boxShadow: '0 4px 14px rgba(226, 115, 41, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} /> Imprimir Comanda / Factura (80 mm)
          </button>
        </div>
      </div>
    </div>
  );
}
