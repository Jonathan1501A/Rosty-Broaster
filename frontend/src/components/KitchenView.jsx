import React, { useState } from 'react';
import { 
  ChefHat, 
  Check, 
  Flame, 
  CheckCircle2, 
  Send,
  MessageSquare,
  Edit2,
  Trash2,
  Bike,
  ShoppingBag,
  UtensilsCrossed,
  Clock
} from 'lucide-react';
import { formatCurrency } from '../data/menu.js';
import { openWhatsAppDelivery } from '../services/whatsapp.js';

export default function KitchenView({ 
  orders = [], 
  onUpdateStatus, 
  onToggleItem,
  onEditOrder,
  onCancelOrder,
  tenant
}) {
  const [filterTipo, setFilterTipo] = useState('todos');

  // Filtrar comandas activas (no despachadas)
  const activeOrders = orders.filter((o) => (o.estado || '').toLowerCase() !== 'despachado');
  const filteredOrders = activeOrders.filter((o) =>
    filterTipo === 'todos' ? true : o.tipo === filterTipo
  );

  // Columnas Kanban: Flujo directo (1. En Cola / Cocina -> 2. Listos para Servir)
  const colPendientes = filteredOrders.filter((o) => {
    const est = (o.estado || '').toLowerCase();
    return est !== 'listo';
  });

  const colListas = filteredOrders.filter((o) => {
    const est = (o.estado || '').toLowerCase();
    return est === 'listo';
  });

  const formatCreationTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  const renderOrderCard = (orden) => {
    const isReady = (orden.estado || '').toLowerCase() === 'listo';
    const isDelivery = orden.tipo === 'delivery';
    const isTakeout = orden.tipo === 'takeout';
    const isDineIn = orden.tipo === 'dine_in';
    const mesaNum = isDineIn && orden.destino ? Number(orden.destino.replace(/\D/g, '')) || null : null;

    return (
      <div
        key={orden.id}
        className="animate-fade-in"
        style={{
          backgroundColor: '#3d2314',
          border: `2px solid ${isReady ? '#2e7d32' : '#e27329'}`,
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
          position: 'relative'
        }}
      >
        {/* Card Header: Tipo de Servicio Claro & Hora de Ingreso */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffcc00' }}>
                {orden.destino}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  color: '#fff',
                  backgroundColor: isDelivery ? '#0288d1' : isTakeout ? '#7b1fa2' : '#2e7d32',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isDelivery ? <Bike size={14} /> : isTakeout ? <ShoppingBag size={14} /> : <UtensilsCrossed size={14} />}
                {isDelivery ? 'Domicilio' : isTakeout ? 'Para Llevar' : 'Mesa Salón'}
              </span>
            </div>

            <div style={{ fontSize: '0.825rem', color: '#fbeee0', marginTop: '4px', fontWeight: '600' }}>
              👤 {orden.cliente} {orden.datosExtra ? `• ${orden.datosExtra}` : ''}
            </div>

            {/* Domiciliario asignado si es delivery */}
            {isDelivery && (
              <div style={{ fontSize: '0.78rem', color: '#ffcc00', marginTop: '3px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bike size={14} /> Repartidor: {orden.domiciliarioNombre || 'Por asignar'}
              </div>
            )}
          </div>

          {/* Hora de Ingreso Fija (Sin temporizador confuso) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#2b180d',
              border: '1.5px solid #5c351e',
              color: '#ffcc00',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '800'
            }}
          >
            <Clock size={13} color="#e27329" />
            <span>{formatCreationTime(orden.createdAt) || 'Reciente'}</span>
          </div>
        </div>

        {/* Lista de Platos con Checkboxes */}
        <div
          style={{
            backgroundColor: '#2b180d',
            borderRadius: '12px',
            padding: '12px',
            border: '1.5px solid #52301c',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {orden.items && orden.items.length > 0 ? (
            orden.items.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleItem && onToggleItem(orden.id, item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '8px',
                  backgroundColor: item.completado ? 'rgba(46, 125, 50, 0.25)' : 'transparent',
                  border: item.completado ? '1px solid #2e7d32' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: `2px solid ${item.completado ? '#2e7d32' : '#e27329'}`,
                    backgroundColor: item.completado ? '#2e7d32' : 'transparent',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {item.completado && <Check size={16} />}
                </div>

                <div style={{ flex: 1, fontSize: '0.9rem' }}>
                  <span
                    style={{
                      fontWeight: '800',
                      color: item.completado ? '#c4a48c' : '#ffffff',
                      textDecoration: item.completado ? 'line-through' : 'none'
                    }}
                  >
                    {item.cantidad}x {item.name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#c4a48c' }}>Sin platos especificados</div>
          )}
        </div>

        {/* Footer y Acciones de la Comanda */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', paddingTop: '4px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(orden.total)}
            </span>

            {/* Botón Editar Comanda */}
            {onEditOrder && (
              <button
                type="button"
                onClick={() => onEditOrder(orden)}
                title="Editar comanda en cocina"
                style={{
                  backgroundColor: '#4a2c1a',
                  border: '1px solid #e27329',
                  color: '#ffcc00',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Edit2 size={13} /> Editar
              </button>
            )}

            {/* Botón Cancelar Comanda */}
            {onCancelOrder && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`¿Seguro que deseas cancelar la comanda #${orden.id} (${orden.destino})?`)) {
                    onCancelOrder(orden.id, mesaNum);
                  }
                }}
                title="Cancelar y eliminar esta comanda"
                style={{
                  backgroundColor: '#491212',
                  border: '1px solid #c62828',
                  color: '#ff8a80',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={13} /> Cancelar
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {isDelivery && (
              <button
                type="button"
                onClick={() => openWhatsAppDelivery(orden, orden.domiciliarioTelefono || tenant?.whatsappDomiciliario, tenant?.nombre)}
                title="Enviar comanda formateada al domiciliario por WhatsApp"
                style={{
                  backgroundColor: '#25D366',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 13px',
                  borderRadius: '10px',
                  fontSize: '0.825rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)'
                }}
              >
                <MessageSquare size={16} /> WhatsApp
              </button>
            )}

            {!isReady ? (
              <button
                type="button"
                onClick={() => onUpdateStatus(orden.id, 'Listo')}
                style={{
                  backgroundColor: '#2e7d32',
                  color: '#fff',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={18} /> Marcar Listo
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onUpdateStatus(orden.id, 'Despachado')}
                style={{
                  backgroundColor: '#e27329',
                  color: '#fff',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  boxShadow: '0 4px 12px rgba(226, 115, 41, 0.4)',
                  cursor: 'pointer'
                }}
              >
                <Send size={16} /> Despachado
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      {/* Top Header KDS */}
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
              backgroundColor: 'rgba(46, 125, 50, 0.25)',
              border: '2px solid #2e7d32',
              color: '#81c784',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChefHat size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
              Pantalla de Cocina & Despacho (KDS)
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#fbeee0', margin: 0 }}>
              Control claro por tipo de servicio (Mesa / Llevar / Domicilio) y preparación de pedidos
            </p>
          </div>
        </div>

        {/* Filtros de Tipo */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'todos', label: 'Todas las Órdenes' },
            { id: 'dine_in', label: 'Salón' },
            { id: 'delivery', label: 'Domicilios' },
            { id: 'takeout', label: 'Para Llevar' }
          ].map((f) => {
            const isActive = filterTipo === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterTipo(f.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.825rem',
                  backgroundColor: isActive ? '#e27329' : '#2b180d',
                  color: isActive ? '#fff' : '#fbeee0',
                  border: isActive ? '1.5px solid #ffcc00' : '1px solid #5c351e',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Columnas Kanban KDS: Flujo Directo de 2 Pasos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* Columna 1: En Cola / Cocina */}
        <div
          style={{
            backgroundColor: '#2b180d',
            borderRadius: '16px',
            border: '2px solid #e27329',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#3d2314',
              borderBottom: '3px solid #e27329',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffcc00', fontWeight: '900', fontSize: '0.95rem' }}>
              <Flame size={20} color="#e27329" />
              <span>1. EN COLA / EN COCINA</span>
            </div>
            <span style={{ backgroundColor: '#2b180d', color: '#ffcc00', border: '1.5px solid #e27329', fontSize: '0.8rem', fontWeight: '900', padding: '3px 10px', borderRadius: '12px' }}>
              {colPendientes.length}
            </span>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '340px' }}>
            {colPendientes.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#c4a48c', padding: '50px 10px', fontSize: '0.9rem' }}>
                <ChefHat size={36} color="#c4a48c" style={{ opacity: 0.35, margin: '0 auto 8px auto', display: 'block' }} />
                Sin órdenes en espera de preparación
              </div>
            ) : (
              colPendientes.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* Columna 2: Listos para Servir y Despachar */}
        <div
          style={{
            backgroundColor: '#2b180d',
            borderRadius: '16px',
            border: '2px solid #2e7d32',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#3d2314',
              borderBottom: '3px solid #2e7d32',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#81c784', fontWeight: '900', fontSize: '0.95rem' }}>
              <CheckCircle2 size={20} color="#2e7d32" />
              <span>2. LISTOS PARA SERVIR</span>
            </div>
            <span style={{ backgroundColor: '#2b180d', color: '#81c784', border: '1.5px solid #2e7d32', fontSize: '0.8rem', fontWeight: '900', padding: '3px 10px', borderRadius: '12px' }}>
              {colListas.length}
            </span>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '340px' }}>
            {colListas.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#c4a48c', padding: '50px 10px', fontSize: '0.9rem' }}>
                <CheckCircle2 size={36} color="#c4a48c" style={{ opacity: 0.35, margin: '0 auto 8px auto', display: 'block' }} />
                Ningún pedido esperando entrega o retiro
              </div>
            ) : (
              colListas.map(renderOrderCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
