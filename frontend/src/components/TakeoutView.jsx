import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Receipt, 
  X, 
  CreditCard, 
  Smartphone, 
  Wallet,
  Edit2,
  Trash2,
  Printer,
  ChevronRight,
  User
} from 'lucide-react';
import { formatCurrency } from '../data/menu.js';

export default function TakeoutView({
  orders = [],
  tenant,
  user,
  onSettleOrders,
  onStartTakeout,
  onUpdateStatus,
  onEditOrder,
  onCancelOrder
}) {
  // Deduplicar órdenes por ID
  const uniqueOrders = Array.from(new Map(orders.map((o) => [o.id, o])).values());

  // Filtrar exclusivamente los pedidos de tipo 'takeout' (Para Llevar)
  const takeoutOrders = uniqueOrders.filter((o) => o.tipo === 'takeout');

  // Filtros de vista
  const [filter, setFilter] = useState('pendientes'); // 'pendientes' | 'todos' | 'cobrados'
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal de Cobro / Liquidación individual o múltiple
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [ordersToSettle, setOrdersToSettle] = useState([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de Ticket / Impresión
  const [ticketOrder, setTicketOrder] = useState(null);

  // Separación por estado de pago
  const pendingPaymentOrders = takeoutOrders.filter((o) => !o.cobrado);
  const settledOrders = takeoutOrders.filter((o) => o.cobrado);

  // Cálculos estadísticos
  const totalPendienteCobro = pendingPaymentOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalCobradoHoy = settledOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pedidosListosSinCobrar = pendingPaymentOrders.filter((o) => o.estado === 'Listo').length;

  // Lista según filtro activo
  const displayedOrders = takeoutOrders.filter((o) => {
    if (filter === 'pendientes' && o.cobrado) return false;
    if (filter === 'cobrados' && !o.cobrado) return false;
    return true;
  });

  // Abrir modal de cobro para una orden específica
  const handleOpenSingleCheckout = (order) => {
    setOrdersToSettle([order]);
    setMontoRecibido(order.total ? order.total.toString() : '0');
    setMetodoPago('efectivo');
    setIsCheckoutOpen(true);
  };

  // Abrir modal de cobro para las órdenes seleccionadas
  const handleOpenBulkCheckout = (ordersList) => {
    if (!ordersList || ordersList.length === 0) return;
    setOrdersToSettle(ordersList);
    const totalAmount = ordersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    setMontoRecibido(totalAmount.toString());
    setMetodoPago('efectivo');
    setIsCheckoutOpen(true);
  };

  // Confirmar cobro
  const handleConfirmCheckout = async () => {
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
      setIsCheckoutOpen(false);
      setOrdersToSettle([]);
    } catch (err) {
      alert(err.message || 'Error al procesar el cobro');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const totalModalAmount = ordersToSettle.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const cambio = Math.max(0, (Number(montoRecibido) || totalModalAmount) - totalModalAmount);

  // Calcular tiempo transcurrido en minutos
  const getElapsedMinutes = (dateString) => {
    if (!dateString) return 0;
    const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
    return Math.max(0, diff);
  };

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
          <div style={{ backgroundColor: 'rgba(123, 31, 162, 0.25)', color: '#ba68c8', border: '1.5px solid #7b1fa2', padding: '12px', borderRadius: '12px' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>Total Pedidos Para Llevar</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ba68c8' }}>{takeoutOrders.length}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface, #3d2314)', border: '2px solid #e27329', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: 'rgba(226, 115, 41, 0.25)', color: '#ffcc00', border: '1.5px solid #e27329', padding: '12px', borderRadius: '12px' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>Pendiente por Cobrar</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totalPendienteCobro)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c4a48c', marginTop: '2px' }}>
              {pendingPaymentOrders.length} {pendingPaymentOrders.length === 1 ? 'pedido pendiente' : 'pedidos pendientes'}
              {pedidosListosSinCobrar > 0 && <strong style={{ color: '#81c784', marginLeft: '4px' }}>({pedidosListosSinCobrar} listos para entrega)</strong>}
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
              {settledOrders.length} {settledOrders.length === 1 ? 'pedido liquidado' : 'pedidos liquidados'}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Acciones y Filtros */}
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
        {/* Pestañas de Filtro */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'pendientes', label: `Pendientes de Cobro (${pendingPaymentOrders.length})` },
            { id: 'todos', label: `Todos los de Hoy (${takeoutOrders.length})` },
            { id: 'cobrados', label: `Cobrados / Entregados (${settledOrders.length})` }
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
                  fontWeight: '800',
                  backgroundColor: isActive ? '#7b1fa2' : '#2b180d',
                  color: isActive ? '#fff' : '#fbeee0',
                  border: isActive ? '1.5px solid #ba68c8' : '1px solid #5c351e',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => handleOpenBulkCheckout(pendingPaymentOrders.filter((o) => selectedIds.includes(o.id)))}
              style={{
                backgroundColor: '#2e7d32',
                color: '#fff',
                padding: '9px 16px',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.825rem',
                border: '1.5px solid #81c784',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(46, 125, 50, 0.4)'
              }}
            >
              <DollarSign size={16} />
              <span>Cobrar Seleccionados ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStartTakeout}
            style={{
              backgroundColor: '#7b1fa2',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '900',
              fontSize: '0.85rem',
              border: '1.5px solid #ba68c8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(123, 31, 162, 0.45)'
            }}
          >
            <Plus size={18} />
            <span>+ Nuevo Pedido Para Llevar</span>
          </button>
        </div>
      </div>

      {/* Barra de Selección Masiva si hay varios pendientes */}
      {filter === 'pendientes' && pendingPaymentOrders.length > 1 && (
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
            {selectedIds.length === pendingPaymentOrders.length ? 'Desmarcar todos' : 'Marcar todos para cobrar juntos'}
          </button>
          <span style={{ fontSize: '0.75rem', color: '#c4a48c' }}>
            {selectedIds.length} de {pendingPaymentOrders.length} seleccionados
          </span>
        </div>
      )}

      {/* Lista / Grid de Pedidos Para Llevar */}
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
          <ShoppingBag size={48} style={{ margin: '0 auto 12px', opacity: 0.5, color: '#ba68c8' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#fbeee0', fontWeight: '800', marginBottom: '6px' }}>
            {filter === 'pendientes' ? '¡No hay pedidos para llevar pendientes de cobro!' : 'No hay pedidos para llevar registrados hoy'}
          </h3>
          <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
            {filter === 'pendientes'
              ? 'Todos los pedidos para llevar han sido cobrados y registrados en caja. Puedes crear uno nuevo haciendo clic en "+ Nuevo Pedido Para Llevar".'
              : 'Empieza registrando una comanda de retiro en barra con el botón superior.'}
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
            const elapsedMins = getElapsedMinutes(orden.createdAt);
            const isListo = orden.estado === 'Listo';
            const isEnPreparacion = orden.estado === 'En preparación';

            return (
              <div
                key={orden.id}
                style={{
                  backgroundColor: 'var(--bg-surface, #3d2314)',
                  border: isCobrado 
                    ? '2px solid #2e7d32' 
                    : isListo
                    ? '2px solid #81c784'
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
                {/* Header de la Tarjeta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!isCobrado && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(orden.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ba68c8' }}
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
                            backgroundColor: '#7b1fa2',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          PARA LLEVAR
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#c4a48c', marginTop: '2px' }}>
                        {new Date(orden.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        <span style={{ marginLeft: '6px', color: elapsedMins > 20 ? '#ff5252' : '#fbeee0' }}>
                          • Hace {elapsedMins} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges de Estado */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {/* Badge de Cocina */}
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        backgroundColor: isListo ? 'rgba(46, 125, 50, 0.3)' : isEnPreparacion ? 'rgba(226, 115, 41, 0.25)' : '#334155',
                        color: isListo ? '#81c784' : isEnPreparacion ? '#ffcc00' : '#cbd5e1',
                        border: `1px solid ${isListo ? '#2e7d32' : isEnPreparacion ? '#e27329' : '#475569'}`
                      }}
                    >
                      {isListo ? '✅ LISTO PARA ENTREGAR' : isEnPreparacion ? '🔥 EN COCINA' : orden.estado || 'Despachado'}
                    </span>

                    {/* Badge de Cobro */}
                    {isCobrado ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          color: '#81c784',
                          backgroundColor: 'rgba(46, 125, 50, 0.2)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid #2e7d32'
                        }}
                      >
                        ✓ Cobrado ({orden.metodoPago || 'efectivo'})
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          color: '#ff8a80',
                          backgroundColor: 'rgba(198, 40, 40, 0.2)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid #c62828'
                        }}
                      >
                        ⚠️ Por Cobrar en Caja
                      </span>
                    )}
                  </div>
                </div>

                {/* Datos del Cliente */}
                <div
                  style={{
                    backgroundColor: '#26160c',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #4a2c1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.825rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={15} color="#ffcc00" />
                    <span style={{ fontWeight: '800', color: '#fbeee0' }}>
                      {orden.cliente || 'Cliente Barra'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#c4a48c' }}>
                    {orden.datosExtra || 'Retiro en Barra'}
                  </span>
                </div>

                {/* Lista de Productos del Pedido */}
                <div
                  style={{
                    backgroundColor: '#2b180d',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    border: '1px solid #422515',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  {(orden.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.825rem',
                        borderBottom: idx < orden.items.length - 1 ? '1px dashed #3d2314' : 'none',
                        paddingBottom: idx < orden.items.length - 1 ? '4px' : '0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbeee0' }}>
                        <span style={{ fontWeight: '900', color: '#ffcc00' }}>{item.cantidad}x</span>
                        <span>{item.name}</span>
                      </div>
                      <span style={{ color: '#c4a48c', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {formatCurrency(item.price * item.cantidad)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total de la Comanda */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '6px',
                    borderTop: '1px solid #4a2c1a'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#c4a48c', textTransform: 'uppercase' }}>
                    Total a Pagar
                  </span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(orden.total)}
                  </span>
                </div>

                {/* Botones de Acción Individuales */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {!isCobrado ? (
                    <>
                      {/* BOTÓN PRINCIPAL: COBRAR PEDIDO UNO A UNO */}
                      <button
                        type="button"
                        onClick={() => handleOpenSingleCheckout(orden)}
                        style={{
                          flex: 1,
                          backgroundColor: '#2e7d32',
                          color: '#fff',
                          border: '1.5px solid #81c784',
                          padding: '9px 14px',
                          borderRadius: '10px',
                          fontWeight: '900',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 14px rgba(46, 125, 50, 0.45)'
                        }}
                      >
                        <DollarSign size={16} />
                        <span>Cobrar {formatCurrency(orden.total)}</span>
                      </button>

                      {/* Botón Editar Comanda */}
                      {onEditOrder && (
                        <button
                          type="button"
                          onClick={() => onEditOrder(orden)}
                          title="Modificar o agregar productos al pedido"
                          style={{
                            backgroundColor: '#2b180d',
                            color: '#ffcc00',
                            border: '1px solid #5c351e',
                            padding: '9px 12px',
                            borderRadius: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                      )}

                      {/* Botón Cancelar Comanda */}
                      {onCancelOrder && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Seguro que deseas cancelar el pedido ${orden.id} para llevar?`)) {
                              onCancelOrder(orden.id);
                            }
                          }}
                          title="Cancelar comanda"
                          style={{
                            backgroundColor: 'rgba(198, 40, 40, 0.2)',
                            color: '#ff5252',
                            border: '1px solid #c62828',
                            padding: '9px 12px',
                            borderRadius: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </>
                  ) : (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#a5d6a7', fontWeight: '700' }}>
                        ✓ Entregado y registrado en caja
                      </span>
                      <button
                        type="button"
                        onClick={() => setTicketOrder(orden)}
                        style={{
                          backgroundColor: '#2b180d',
                          border: '1px solid #5c351e',
                          color: '#fbeee0',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Printer size={14} /> Ver Ticket
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE COBRO DE PEDIDO PARA LLEVAR (INDIVIDUAL O GRUPAL) */}
      {isCheckoutOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsCheckoutOpen(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#26160c',
              border: '3px solid #7b1fa2',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: '#3d2314',
                borderBottom: '2px solid #5c351e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(123, 31, 162, 0.3)',
                    border: '1.5px solid #7b1fa2',
                    color: '#ba68c8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                    Cobrar Pedido Para Llevar
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#c4a48c', margin: 0 }}>
                    {ordersToSettle.length === 1 ? `Comanda ${ordersToSettle[0].id} • ${ordersToSettle[0].cliente || 'Barra'}` : `${ordersToSettle.length} pedidos seleccionados`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                style={{
                  backgroundColor: '#2b180d',
                  border: '1px solid #5c351e',
                  color: '#fbeee0',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido Modal */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Total a Pagar Resaltado */}
              <div
                style={{
                  backgroundColor: '#341e11',
                  border: '2px solid #5c351e',
                  borderRadius: '14px',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>
                  Total a Recibir
                </span>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(totalModalAmount)}
                </div>
              </div>

              {/* Selector de Método de Pago */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#fbeee0', fontWeight: '800', marginBottom: '8px' }}>
                  Forma de Pago del Cliente:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { id: 'efectivo', label: 'Efectivo', icon: Wallet, color: '#2e7d32', border: '#81c784' },
                    { id: 'nequi', label: 'Nequi', icon: Smartphone, color: '#9c27b0', border: '#ba68c8' },
                    { id: 'daviplata', label: 'Daviplata', icon: Smartphone, color: '#d32f2f', border: '#ef5350' },
                    { id: 'tarjeta', label: 'Datafono', icon: CreditCard, color: '#0288d1', border: '#4fc3f7' }
                  ].map((m) => {
                    const isSelected = metodoPago === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMetodoPago(m.id)}
                        style={{
                          backgroundColor: isSelected ? m.color : '#2b180d',
                          color: isSelected ? '#fff' : '#fbeee0',
                          border: isSelected ? `2px solid ${m.border}` : '1.5px solid #5c351e',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={18} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conteo de Efectivo y Devuelta */}
              {metodoPago === 'efectivo' && (
                <div
                  style={{
                    backgroundColor: '#2b180d',
                    border: '1.5px solid #5c351e',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', fontWeight: '700', marginBottom: '6px' }}>
                      Efectivo Recibido del Cliente ($):
                    </label>
                    <input
                      type="number"
                      value={montoRecibido}
                      onChange={(e) => setMontoRecibido(e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        color: '#ffcc00',
                        borderColor: '#e27329'
                      }}
                    />
                  </div>

                  {/* Atajos de Billetes Rápidos */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setMontoRecibido(totalModalAmount.toString())}
                      style={{
                        backgroundColor: '#3d2314',
                        border: '1px solid #ffcc00',
                        color: '#ffcc00',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Exacto
                    </button>
                    {[10000, 20000, 50000, 100000].map((val) => {
                      if (val < totalModalAmount && totalModalAmount > 20000) return null;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setMontoRecibido(val.toString())}
                          style={{
                            backgroundColor: '#3d2314',
                            border: '1px solid #5c351e',
                            color: '#fbeee0',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          ${val / 1000}k
                        </button>
                      );
                    })}
                  </div>

                  {/* Devuelta / Cambio Calculado */}
                  <div
                    style={{
                      backgroundColor: 'rgba(46, 125, 50, 0.2)',
                      border: '1px solid #2e7d32',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: '#a5d6a7', fontWeight: '800' }}>
                      Devuelta / Cambio:
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#81c784', fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(cambio)}
                    </span>
                  </div>
                </div>
              )}

              {/* Botón de Confirmación */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmCheckout}
                style={{
                  backgroundColor: '#2e7d32',
                  color: '#fff',
                  border: '2px solid #81c784',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: '900',
                  fontSize: '1rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 18px rgba(46, 125, 50, 0.5)'
                }}
              >
                <CheckCircle2 size={20} />
                <span>{isSubmitting ? 'Registrando en caja...' : `Confirmar y Cobrar (${formatCurrency(totalModalAmount)})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE TICKET / COMPROBANTE DE PAGO */}
      {ticketOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setTicketOrder(null)}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: '#ffffff',
              color: '#000000',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
              fontFamily: 'monospace'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '12px', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '900' }}>{tenant?.nombre || 'ROSTY BROASTER'}</h2>
              <div style={{ fontSize: '0.8rem', color: '#444' }}>{tenant?.direccion || 'Calle Principal'}</div>
              <div style={{ fontSize: '0.8rem', color: '#444' }}>Tel: {tenant?.telefono || '3000000000'}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '6px' }}>TICKET DE VENTA (PARA LLEVAR)</div>
              <div style={{ fontSize: '0.75rem', color: '#555' }}>Orden: #{ticketOrder.id}</div>
              <div style={{ fontSize: '0.75rem', color: '#555' }}>Fecha: {new Date(ticketOrder.createdAt).toLocaleString('es-CO')}</div>
              <div style={{ fontSize: '0.75rem', color: '#555' }}>Cliente: {ticketOrder.cliente || 'Barra'}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', borderBottom: '2px dashed #000', paddingBottom: '12px', marginBottom: '12px' }}>
              {(ticketOrder.items || []).map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{it.cantidad}x {it.name}</span>
                  <span>{formatCurrency(it.price * it.cantidad)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '900', marginBottom: '12px' }}>
              <span>TOTAL:</span>
              <span>{formatCurrency(ticketOrder.total)}</span>
            </div>

            <div style={{ fontSize: '0.8rem', marginBottom: '16px', textAlign: 'center', color: '#333' }}>
              Método de pago: <strong>{(ticketOrder.metodoPago || 'efectivo').toUpperCase()}</strong>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Imprimir
              </button>
              <button
                type="button"
                onClick={() => setTicketOrder(null)}
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#000',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
