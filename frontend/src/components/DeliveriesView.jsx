import React, { useState } from 'react';
import { 
  Bike, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Check, 
  Send, 
  Plus, 
  Receipt, 
  X, 
  CreditCard, 
  Smartphone, 
  Wallet,
  Edit2,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '../data/menu.js';
import { openWhatsAppDelivery } from '../services/whatsapp.js';

export default function DeliveriesView({
  orders = [],
  tenant,
  onSettleOrders,
  onStartDelivery,
  onUpdateStatus,
  onEditOrder,
  onCancelOrder
}) {
  // Deduplicar órdenes por ID de forma defensiva
  const uniqueOrders = Array.from(new Map(orders.map((o) => [o.id, o])).values());

  // Solo pedidos de tipo Domicilio
  const deliveryOrders = uniqueOrders.filter((o) => o.tipo === 'delivery');

  // Filtros: 'pendientes' (sin cobrar), 'todos', 'cobrados'
  const [filter, setFilter] = useState('pendientes');
  const [filterDomiciliario, setFilterDomiciliario] = useState('todos');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal de Liquidación
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [ordersToSettle, setOrdersToSettle] = useState([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const domiciliarios = tenant?.domiciliarios || [];

  // Pedidos pendientes de pago
  const pendingPaymentOrders = deliveryOrders.filter((o) => !o.cobrado);
  const settledOrders = deliveryOrders.filter((o) => o.cobrado);

  // Cálculos financieros
  const totalPendienteCobro = pendingPaymentOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalCobradoHoy = settledOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Pedidos pendientes por repartidor seleccionado
  const pendingByDriver = filterDomiciliario === 'todos'
    ? pendingPaymentOrders
    : pendingPaymentOrders.filter((o) => o.domiciliarioId === filterDomiciliario);
  const totalPendienteDriver = pendingByDriver.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeDriverObj = domiciliarios.find((d) => d.id === filterDomiciliario);

  // Lista según filtro
  const displayedOrders = deliveryOrders.filter((o) => {
    if (filter === 'pendientes' && o.cobrado) return false;
    if (filter === 'cobrados' && !o.cobrado) return false;
    if (filterDomiciliario !== 'todos' && o.domiciliarioId !== filterDomiciliario) return false;
    return true;
  });

  // Abrir modal de liquidación para órdenes específicas o todas
  const handleOpenSettle = (ordersList) => {
    setOrdersToSettle(ordersList);
    const totalMonto = ordersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    setMontoRecibido(totalMonto.toString());
    setMetodoPago('efectivo');
    setIsSettleModalOpen(true);
  };

  // Confirmar liquidación
  const handleConfirmSettle = async () => {
    if (ordersToSettle.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const ids = ordersToSettle.map((o) => o.id);
      const totalAmount = ordersToSettle.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const received = Number(montoRecibido) || totalAmount;

      await onSettleOrders(ids, {
        metodoPago,
        montoRecibido: received
      });

      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      setIsSettleModalOpen(false);
      setOrdersToSettle([]);
    } catch (err) {
      console.error('Error al liquidar domicilios:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle de selección múltiple
  const toggleSelectOrder = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllPending = () => {
    const allPendingIds = pendingPaymentOrders.map((o) => o.id);
    if (selectedIds.length === allPendingIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allPendingIds);
    }
  };

  const totalModalSettle = ordersToSettle.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const cambio = Math.max(0, (Number(montoRecibido) || totalModalSettle) - totalModalSettle);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* KPI Top Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}
      >
        <div style={{ backgroundColor: 'var(--bg-surface, #3d2314)', border: '2px solid #5c351e', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: 'rgba(2, 136, 209, 0.25)', color: '#4fc3f7', border: '1.5px solid #0288d1', padding: '12px', borderRadius: '12px' }}>
            <Bike size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>Total Domicilios</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4fc3f7' }}>{deliveryOrders.length}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface, #3d2314)', border: '2px solid #e27329', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: 'rgba(226, 115, 41, 0.25)', color: '#ffcc00', border: '1.5px solid #e27329', padding: '12px', borderRadius: '12px' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>En la Calle (Por Cobrar)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totalPendienteCobro)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c4a48c', marginTop: '2px' }}>
              {pendingPaymentOrders.length} {pendingPaymentOrders.length === 1 ? 'pedido pendiente' : 'pedidos pendientes'}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface, #3d2314)', border: '2px solid #2e7d32', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: 'rgba(46, 125, 50, 0.25)', color: '#a5d6a7', border: '1.5px solid #2e7d32', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>Cobrado a Caja Hoy</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#a5d6a7', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totalCobradoHoy)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c4a48c', marginTop: '2px' }}>
              {settledOrders.length} {settledOrders.length === 1 ? 'domicilio liquidado' : 'domicilios liquidados'}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Acciones y Liquidación Rápida */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: 'var(--bg-surface, #3d2314)',
          border: '2px solid #5c351e',
          borderRadius: '16px',
          padding: '14px 20px'
        }}
      >
        {/* Filtros de Pestaña y Selector de Repartidor */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'pendientes', label: `Pendientes (${pendingPaymentOrders.length})` },
              { id: 'todos', label: `Todos (${deliveryOrders.length})` },
              { id: 'cobrados', label: `Liquidados (${settledOrders.length})` }
            ].map((f) => {
              const isActive = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '0.825rem',
                    fontWeight: '700',
                    backgroundColor: isActive ? 'var(--brand-primary, #e27329)' : '#2b180d',
                    color: isActive ? '#fff' : '#fbeee0',
                    border: isActive ? '1.5px solid var(--brand-gold, #ffcc00)' : '1px solid #5c351e',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Selector de Repartidor */}
          {domiciliarios.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#ffcc00', fontWeight: '800' }}>🛵 Repartidor:</span>
              <select
                value={filterDomiciliario}
                onChange={(e) => setFilterDomiciliario(e.target.value)}
                style={{
                  backgroundColor: '#1f1109',
                  color: '#ffcc00',
                  border: '1.5px solid #5c351e',
                  borderRadius: '10px',
                  padding: '7px 12px',
                  fontSize: '0.825rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                <option value="todos">Todos los Repartidores</option>
                {domiciliarios.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} ({pendingPaymentOrders.filter((o) => o.domiciliarioId === d.id).length} pend.)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Botones de Liquidación y Creación */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const selectedOrders = pendingPaymentOrders.filter((o) => selectedIds.includes(o.id));
                handleOpenSettle(selectedOrders);
              }}
              style={{
                backgroundColor: '#2e7d32',
                color: '#fff',
                padding: '9px 16px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.85rem',
                border: '1.5px solid #81c784',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)'
              }}
            >
              <DollarSign size={16} />
              <span>Cobrar {selectedIds.length} Seleccionados ({formatCurrency(pendingPaymentOrders.filter((o) => selectedIds.includes(o.id)).reduce((s, o) => s + (Number(o.total) || 0), 0))})</span>
            </button>
          )}

          {pendingByDriver.length > 0 && (
            <button
              type="button"
              onClick={() => handleOpenSettle(pendingByDriver)}
              title={activeDriverObj ? `Liquidar todos los domicilios entregados por ${activeDriverObj.nombre}` : 'Liquidar todos los domicilios pendientes'}
              style={{
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                color: '#ffcc00',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.85rem',
                border: '2px solid #ffcc00',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(46, 125, 50, 0.5)'
              }}
            >
              <Receipt size={18} />
              <span>💰 Liquidar {activeDriverObj ? activeDriverObj.nombre : 'Todo'} ({formatCurrency(totalPendienteDriver)})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStartDelivery}
            style={{
              backgroundColor: '#0288d1',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.85rem',
              border: '1.5px solid #4fc3f7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(2, 136, 209, 0.45)'
            }}
          >
            <Plus size={18} />
            <span>+ Nuevo Domicilio</span>
          </button>
        </div>
      </div>

      {/* Barra de Selección Masiva si hay pendientes */}
      {filter === 'pendientes' && pendingPaymentOrders.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
          <button
            type="button"
            onClick={selectAllPending}
            style={{
              backgroundColor: '#2b180d',
              color: '#ffcc00',
              border: '1px solid #5c351e',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {selectedIds.length === pendingPaymentOrders.length ? 'Desmarcar todos' : 'Marcar todos para liquidar'}
          </button>
          <span style={{ fontSize: '0.75rem', color: '#c4a48c' }}>
            {selectedIds.length} de {pendingPaymentOrders.length} seleccionados
          </span>
        </div>
      )}

      {/* Lista de Domicilios */}
      {displayedOrders.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-surface, #3d2314)',
            border: '2px dashed #5c351e',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#c4a48c'
          }}
        >
          <Bike size={48} style={{ margin: '0 auto 12px', opacity: 0.5, color: '#0288d1' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#fbeee0', fontWeight: '800', marginBottom: '6px' }}>
            {filter === 'pendientes' ? '¡No hay domicilios pendientes de cobro!' : 'No hay domicilios registrados'}
          </h3>
          <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
            {filter === 'pendientes'
              ? 'Todos los pedidos entregados por el domiciliario ya han sido liquidados e ingresados a la caja del día.'
              : 'Puedes registrar un nuevo pedido para entregar haciendo clic en "+ Nuevo Domicilio".'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px'
          }}
        >
          {displayedOrders.map((orden) => {
            const isSelected = selectedIds.includes(orden.id);
            const isCobrado = orden.cobrado;
            const minutos = Number(orden.minutos) || 0;
            const limite = Number(orden.limite) || 20;

            return (
              <div
                key={orden.id}
                style={{
                  backgroundColor: 'var(--bg-surface, #3d2314)',
                  border: isCobrado 
                    ? '2px solid #2e7d32' 
                    : isSelected 
                    ? '2px solid var(--brand-gold, #ffcc00)' 
                    : '2px solid #5c351e',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
                  position: 'relative'
                }}
              >
                {/* Header Domicilio */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!isCobrado && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(orden.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ffcc00' }}
                      />
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--brand-gold, #ffcc00)' }}>
                          {orden.id}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            color: '#fff',
                            backgroundColor: '#0288d1',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          DOMICILIO
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#c4a48c', marginTop: '2px' }}>
                        {new Date(orden.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </div>
                  </div>

                  {/* Badges de Estado */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {isCobrado ? (
                      <span
                        style={{
                          backgroundColor: 'rgba(46, 125, 50, 0.25)',
                          color: '#a5d6a7',
                          border: '1.5px solid #2e7d32',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle2 size={12} /> COBRADO ({orden.metodoPago || 'Efectivo'})
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: 'rgba(226, 115, 41, 0.25)',
                          color: '#ffcc00',
                          border: '1.5px solid #e27329',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Clock size={12} /> POR COBRAR
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: orden.estado === 'Despachado' ? '#4fc3f7' : orden.estado === 'Listo' ? '#a5d6a7' : '#ffcc00',
                        fontWeight: '700'
                      }}
                    >
                      {orden.estado === 'Despachado' ? '🏍️ En ruta' : orden.estado === 'Listo' ? '✅ Listo en cocina' : '🔥 Preparando'}
                    </span>
                  </div>
                </div>

                {/* Datos del Cliente y Destino */}
                <div
                  style={{
                    backgroundColor: '#2b180d',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    border: '1px solid #52301c',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#fff' }}>
                    📍 {orden.destino}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#fbeee0' }}>
                    👤 {orden.cliente} {orden.datosExtra ? `• 📞 ${orden.datosExtra}` : ''}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#ffcc00', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Bike size={13} /> Repartidor: {orden.domiciliarioNombre || 'Por asignar'}
                  </div>
                </div>

                {/* Ítems */}
                <div style={{ fontSize: '0.825rem', color: '#c4a48c', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {orden.items?.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{it.cantidad}x {it.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(it.price * it.cantidad)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Tarjeta */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #52301c',
                    paddingTop: '10px',
                    marginTop: 'auto',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>Total:</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--brand-gold, #ffcc00)', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(orden.total)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {onEditOrder && !isCobrado && (
                      <button
                        type="button"
                        onClick={() => onEditOrder(orden)}
                        title="Modificar productos de este domicilio"
                        style={{
                          backgroundColor: '#4a2c1a',
                          border: '1px solid #e27329',
                          color: '#ffcc00',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
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

                    {onCancelOrder && !isCobrado && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Seguro que deseas cancelar el domicilio #${orden.id} para ${orden.cliente}?`)) {
                            onCancelOrder(orden.id);
                          }
                        }}
                        title="Cancelar y eliminar este domicilio"
                        style={{
                          backgroundColor: '#491212',
                          border: '1px solid #c62828',
                          color: '#ff8a80',
                          padding: '7px 9px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openWhatsAppDelivery(orden, orden.domiciliarioTelefono || tenant?.whatsappDomiciliario, tenant?.nombre)}
                      title="Enviar comanda formateada al domiciliario por WhatsApp"
                      style={{
                        backgroundColor: '#25D366',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        boxShadow: '0 3px 10px rgba(37, 211, 102, 0.35)'
                      }}
                    >
                      <MessageSquare size={15} /> WhatsApp
                    </button>

                    {!isCobrado && (
                      <button
                        type="button"
                        onClick={() => handleOpenSettle([orden])}
                        style={{
                          backgroundColor: '#2e7d32',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(46, 125, 50, 0.4)'
                        }}
                      >
                        <DollarSign size={15} /> Cobrar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE LIQUIDACIÓN / COBRO DE DOMICILIOS */}
      {isSettleModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface, #3d2314)',
              border: '2px solid var(--brand-gold, #ffcc00)',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.8)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--brand-gold, #ffcc00)' }}>
                  💰 Liquidación de Domicilios
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#c4a48c', marginTop: '2px' }}>
                  {ordersToSettle.length} {ordersToSettle.length === 1 ? 'pedido a cobrar' : 'pedidos a cobrar en conjunto'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettleModalOpen(false)}
                style={{
                  backgroundColor: '#2b180d',
                  border: '1px solid #5c351e',
                  color: '#c4a48c',
                  padding: '6px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Resumen de Pedidos a Liquidar */}
            <div
              style={{
                backgroundColor: '#2b180d',
                borderRadius: '12px',
                padding: '12px 14px',
                border: '1px solid #52301c',
                maxHeight: '140px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              {ordersToSettle.map((o) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                  <span style={{ color: '#fff', fontWeight: '600' }}>
                    {o.id} • {o.destino}
                  </span>
                  <span style={{ color: 'var(--brand-gold, #ffcc00)', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(o.total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total a Entregar */}
            <div
              style={{
                backgroundColor: '#24140b',
                border: '1.5px solid var(--brand-primary, #e27329)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fbeee0' }}>
                Total a recibir del repartidor:
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--brand-gold, #ffcc00)', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(totalModalSettle)}
              </span>
            </div>

            {/* Método de Pago */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#c4a48c', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>
                Método de Pago Recibido:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'efectivo', label: 'Efectivo', icon: Wallet },
                  { id: 'nequi', label: 'Nequi', icon: Smartphone },
                  { id: 'daviplata', label: 'Daviplata', icon: Smartphone },
                  { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard }
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = metodoPago === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMetodoPago(m.id)}
                      style={{
                        backgroundColor: isSelected ? 'var(--brand-primary, #e27329)' : '#2b180d',
                        border: isSelected ? '2px solid var(--brand-gold, #ffcc00)' : '1px solid #5c351e',
                        color: isSelected ? '#fff' : '#fbeee0',
                        borderRadius: '10px',
                        padding: '10px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      <Icon size={18} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monto Recibido y Cambio si es Efectivo */}
            {metodoPago === 'efectivo' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#c4a48c', fontWeight: '700', marginBottom: '4px' }}>
                    Efectivo Recibido:
                  </label>
                  <input
                    type="number"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      backgroundColor: '#2b180d',
                      border: '1.5px solid #5c351e',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: '800',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#c4a48c', fontWeight: '700', marginBottom: '4px' }}>
                    Vueltas / Cambio:
                  </label>
                  <div
                    style={{
                      backgroundColor: '#2b180d',
                      border: '1.5px solid #5c351e',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#a5d6a7',
                      fontSize: '1rem',
                      fontWeight: '900',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {formatCurrency(cambio)}
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Confirmación */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsSettleModalOpen(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#2b180d',
                  border: '1px solid #5c351e',
                  color: '#c4a48c',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSettle}
                disabled={isSubmitting}
                style={{
                  flex: 2,
                  backgroundColor: '#2e7d32',
                  border: 'none',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(46, 125, 50, 0.5)'
                }}
              >
                {isSubmitting ? 'Registrando en Caja...' : `Confirmar y Cobrar (${formatCurrency(totalModalSettle)})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
