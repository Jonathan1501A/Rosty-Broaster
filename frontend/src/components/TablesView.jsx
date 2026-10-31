import React, { useState } from 'react';
import { 
  Users, 
  Bike, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Receipt, 
  DollarSign, 
  Utensils,
  Trash2,
  Printer
} from 'lucide-react';
import { formatCurrency } from '../data/menu.js';
import ComandaPrintModal from './ComandaPrintModal.jsx';

export default function TablesView({ 
  tables = [], 
  tenant,
  onOpenTableOrder, 
  onStartDelivery, 
  onStartTakeout, 
  onOpenCheckout,
  onCancelTableOrder
}) {
  const [filter, setFilter] = useState('todas'); // 'todas' | 'libres' | 'ocupadas' | 'cuenta'
  const [selectedPrintTable, setSelectedPrintTable] = useState(null);

  // Cálculos estadísticos rápidos
  const libresCount = tables.filter((t) => t.estado === 'libre').length;
  const ocupadasCount = tables.filter((t) => t.estado === 'ocupada').length;
  const cuentaCount = tables.filter((t) => t.estado === 'cuenta').length;

  const totalSalonActivo = tables.reduce((acc, t) => {
    const tableTotal = t.pedidoActual?.reduce((sum, item) => sum + item.price * item.cantidad, 0) || 0;
    return acc + tableTotal;
  }, 0);

  const filteredTables = tables.filter((t) => {
    if (filter === 'libres') return t.estado === 'libre';
    if (filter === 'ocupadas') return t.estado === 'ocupada';
    if (filter === 'cuenta') return t.estado === 'cuenta';
    return true;
  });

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* KPI Stats Top Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}
      >
        <div style={{ backgroundColor: '#3d2314', border: '2px solid #5c351e', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: 'rgba(46, 125, 50, 0.25)', color: '#a5d6a7', border: '1.5px solid #2e7d32', padding: '12px', borderRadius: '12px' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>Mesas Disponibles</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a5d6a7' }}>{libresCount} <span style={{ fontSize: '0.85rem', color: '#c4a48c' }}>/ {tables.length}</span></div>
          </div>
        </div>

        <div style={{ backgroundColor: '#3d2314', border: '2px solid #e27329', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: 'rgba(226, 115, 41, 0.25)', color: '#ffcc00', border: '1.5px solid #e27329', padding: '12px', borderRadius: '12px' }}>
            <Utensils size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>Mesas Ocupadas</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffcc00' }}>{ocupadasCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#3d2314', border: '2px solid #5c351e', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: 'rgba(2, 136, 209, 0.25)', color: '#4fc3f7', border: '1.5px solid #0288d1', padding: '12px', borderRadius: '12px' }}>
            <Receipt size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>Pidiendo Cuenta</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4fc3f7' }}>{cuentaCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#3d2314', border: '2px solid #5c351e', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: 'rgba(255, 204, 0, 0.2)', color: '#ffcc00', border: '1.5px solid #ffcc00', padding: '12px', borderRadius: '12px' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>Consumo en Salón</span>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totalSalonActivo)}
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
          backgroundColor: '#3d2314',
          border: '2px solid #5c351e',
          borderRadius: '16px',
          padding: '14px 20px'
        }}
      >
        {/* Filtros de Mesas */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'todas', label: 'Todas las Mesas' },
            { id: 'libres', label: 'Libres' },
            { id: 'ocupadas', label: 'Ocupadas' },
            { id: 'cuenta', label: 'Por Cobrar' }
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

        {/* Botones de Domicilios y Retiro */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onStartDelivery}
            style={{
              backgroundColor: '#0288d1',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(2, 136, 209, 0.45)',
              border: '1.5px solid #4fc3f7'
            }}
          >
            <Bike size={18} />
            <span>+ Nuevo Domicilio (20 min)</span>
          </button>

          <button
            type="button"
            onClick={onStartTakeout}
            style={{
              backgroundColor: '#7b1fa2',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(123, 31, 162, 0.45)',
              border: '1.5px solid #ba68c8'
            }}
          >
            <ShoppingBag size={18} />
            <span>+ Pedido Para Llevar (15 min)</span>
          </button>
        </div>
      </div>

      {/* Grid de Mesas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px'
        }}
      >
        {filteredTables.map((mesa) => {
          const isFree = mesa.estado === 'libre';
          const isOccupied = mesa.estado === 'ocupada';
          const isBill = mesa.estado === 'cuenta';

          const statusColor = isFree ? '#2e7d32' : isOccupied ? 'var(--brand-primary, #e27329)' : '#0288d1';
          const statusText = isFree ? 'Disponible' : isOccupied ? 'Ocupada' : 'Cuenta';

          const tableTotal = mesa.pedidoActual?.reduce((sum, item) => sum + item.price * item.cantidad, 0) || 0;
          const itemsCount = mesa.pedidoActual?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

          return (
            <div
              key={mesa.id}
              className="animate-fade-in"
              style={{
                backgroundColor: 'var(--bg-surface, #3d2314)',
                border: `2px solid ${isOccupied ? 'var(--brand-primary, #e27329)' : isBill ? '#0288d1' : '#5c351e'}`,
                borderRadius: '16px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: isOccupied ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header Mesa */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffcc00' }}>
                      Mesa {mesa.numero}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        color: '#fff',
                        backgroundColor: statusColor,
                        padding: '3px 9px',
                        borderRadius: '6px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {statusText}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#c4a48c', marginTop: '4px' }}>
                    <Users size={14} />
                    <span>{mesa.capacidad} puestos</span>
                  </div>
                </div>

                {mesa.apertura && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      color: '#ffcc00',
                      backgroundColor: '#2b180d',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      border: '1px solid #5c351e'
                    }}
                  >
                    <Clock size={13} color="#e27329" />
                    <span>Abierta</span>
                  </div>
                )}
              </div>

              {/* Detalle del Pedido Actual */}
              <div
                style={{
                  backgroundColor: '#2b180d',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1.5px solid #52301c',
                  minHeight: '70px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                {!isFree && itemsCount > 0 ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: '#fbeee0', marginBottom: '4px' }}>
                      <span>{itemsCount} productos en orden</span>
                      <span style={{ color: '#ffcc00', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(tableTotal)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#c4a48c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {mesa.pedidoActual.map((i) => `${i.cantidad}x ${i.name}`).join(', ')}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#c4a48c', fontSize: '0.825rem' }}>
                    Mesa lista para recibir clientes
                  </div>
                )}
              </div>

              {/* Acciones de la Mesa */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {isFree ? (
                  <button
                    type="button"
                    onClick={() => onOpenTableOrder(mesa.numero, [])}
                    style={{
                      width: '100%',
                      backgroundColor: '#2e7d32',
                      color: '#fff',
                      padding: '11px',
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)'
                    }}
                  >
                    <Plus size={18} /> Tomar Comanda
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenTableOrder(mesa.numero, mesa.pedidoActual)}
                      style={{
                        flex: 1,
                        backgroundColor: '#4a2c1a',
                        border: '1.5px solid #e27329',
                        color: '#ffcc00',
                        padding: '10px',
                        borderRadius: '10px',
                        fontSize: '0.825rem'
                      }}
                    >
                      Ver / Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenCheckout(mesa.numero, mesa.pedidoActual)}
                      style={{
                        flex: 1,
                        backgroundColor: '#0288d1',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: '10px',
                        fontSize: '0.825rem',
                        boxShadow: '0 4px 12px rgba(2, 136, 209, 0.4)'
                      }}
                    >
                      <Receipt size={16} /> Cobrar
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPrintTable({
                        id: `MESA-${mesa.numero}`,
                        tipo: 'dine_in',
                        mesaNumero: mesa.numero,
                        cliente: 'Salón',
                        items: mesa.pedidoActual || [],
                        total: tableTotal,
                        timestamp: mesa.apertura || new Date().toISOString()
                      })}
                      title="Imprimir comanda térmica o pre-cuenta para el cliente"
                      style={{
                        backgroundColor: '#2b180d',
                        border: '1.5px solid #ffcc00',
                        color: '#ffcc00',
                        padding: '10px 11px',
                        borderRadius: '10px',
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Printer size={16} />
                    </button>

                    {onCancelTableOrder && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de cancelar la comanda de la Mesa ${mesa.numero} y liberarla?`)) {
                            onCancelTableOrder(mesa.numero);
                          }
                        }}
                        title="Cancelar comanda y liberar mesa"
                        style={{
                          backgroundColor: '#491212',
                          border: '1.5px solid #c62828',
                          color: '#ff8a80',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Impresión Térmica de Pre-cuenta / Comanda de Mesa */}
      <ComandaPrintModal
        isOpen={Boolean(selectedPrintTable)}
        onClose={() => setSelectedPrintTable(null)}
        order={selectedPrintTable}
        tenant={tenant}
      />
    </div>
  );
}
