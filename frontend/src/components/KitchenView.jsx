import React, { useState } from 'react';
import { 
  ChefHat, 
  Clock, 
  Check, 
  Flame, 
  CheckCircle2, 
  Send,
  MessageSquare 
} from 'lucide-react';
import { formatCurrency } from '../data/menu.js';
import { openWhatsAppDelivery } from '../services/whatsapp.js';

export default function KitchenView({ 
  orders = [], 
  onUpdateStatus, 
  onToggleItem,
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

  const renderOrderCard = (orden) => {
    const minutos = Number(orden.minutos) || 0;
    const limite = Number(orden.limite) || (orden.tipo === 'delivery' ? 20 : 15);
    const isLate = minutos >= limite;
    const isWarning = minutos >= limite - 4 && !isLate;

    const timerColor = isLate ? '#ff5252' : isWarning ? '#ffcc00' : '#81c784';

    return (
      <div
        key={orden.id}
        className={`animate-fade-in ${isLate ? 'animate-pulse-danger' : ''}`}
        style={{
          backgroundColor: 'var(--bg-surface, #3d2314)',
          border: `2px solid ${isLate ? '#c62828' : isWarning ? '#ffcc00' : 'var(--brand-primary, #e27329)'}`,
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
          position: 'relative'
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffcc00' }}>
                {orden.destino}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  color: '#fff',
                  backgroundColor: orden.tipo === 'delivery' ? '#0288d1' : orden.tipo === 'takeout' ? '#7b1fa2' : '#2e7d32',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                {orden.tipo === 'delivery' ? 'Domicilio' : orden.tipo === 'takeout' ? 'Llevar' : 'Salón'}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#fbeee0', marginTop: '2px', fontWeight: '600' }}>
              👤 {orden.cliente} {orden.datosExtra ? `• ${orden.datosExtra}` : ''}
            </div>
          </div>

          {/* Temporizador */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#2b180d',
              border: `1.5px solid ${timerColor}`,
              color: timerColor,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.825rem',
              fontWeight: '900',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <Clock size={14} />
            <span>{minutos}/{limite} min</span>
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

        {/* Footer y Botones de Transición de Estado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(orden.total)}
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {orden.tipo === 'delivery' && (
              <button
                type="button"
                onClick={() => openWhatsAppDelivery(orden, tenant?.whatsappDomiciliario, tenant?.nombre)}
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

            {orden.estado !== 'Listo' ? (
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
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)'
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
                  boxShadow: '0 4px 12px rgba(226, 115, 41, 0.4)'
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
              Control en tiempo real de cocción, tiempos y pedidos listos
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
                  border: isActive ? '1.5px solid #ffcc00' : '1px solid #5c351e'
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
