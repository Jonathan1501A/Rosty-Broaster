import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  Receipt, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  History,
  Lock,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../data/menu.js';

export default function CloseCashModal({ 
  isOpen, 
  onClose, 
  stats, 
  tenant, 
  user, 
  onConfirmCloseCash 
}) {
  const [baseCash, setBaseCash] = useState(50000);
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('cierre'); // 'cierre' | 'historial'

  if (!isOpen) return null;

  const totalVendido = stats?.totalVendido || 0;
  const totalComandas = stats?.totalComandasDespachadas || 0;
  const metodos = stats?.desgloseMetodos || { efectivo: 0, nequi: 0, daviplata: 0, tarjeta: 0 };
  const cierresAnteriores = stats?.cierresAnteriores || [];

  const base = Number(baseCash) || 0;
  const efectivoEsperado = base + (metodos.efectivo || 0);
  const efectivoReal = actualCash === '' ? efectivoEsperado : Number(actualCash) || 0;
  const diferencia = efectivoReal - efectivoEsperado;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmCloseCash({
        closedBy: user?.name || user?.username || 'Administrador',
        baseCash: base,
        actualCash: efectivoReal,
        notes: notes.trim()
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Error al cerrar caja');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintZ = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          backgroundColor: '#26160c',
          border: '3px solid #e27329',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
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
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(226, 115, 41, 0.25)',
                border: '2px solid #e27329',
                color: '#ffcc00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Lock size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                Cierre de Caja del Día (Reporte Z)
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#fbeee0', margin: 0 }}>
                {tenant?.nombre || 'Restaurante'} • Cuadre oficial de cuentas y reinicio diario
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#2b180d',
              color: '#fbeee0',
              border: '1.5px solid #5c351e',
              padding: '8px 12px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs de Cierre vs Historial */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid #3d2314', backgroundColor: '#1f1109' }}>
          <button
            type="button"
            onClick={() => setActiveTab('cierre')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === 'cierre' ? '#26160c' : 'transparent',
              color: activeTab === 'cierre' ? '#ffcc00' : '#c4a48c',
              borderBottom: activeTab === 'cierre' ? '3px solid #e27329' : 'none',
              borderRadius: 0,
              fontWeight: '800'
            }}
          >
            💰 Arqueo & Cierre Actual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historial')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: activeTab === 'historial' ? '#26160c' : 'transparent',
              color: activeTab === 'historial' ? '#ffcc00' : '#c4a48c',
              borderBottom: activeTab === 'historial' ? '3px solid #e27329' : 'none',
              borderRadius: 0,
              fontWeight: '800'
            }}
          >
            <History size={16} /> Historial de Cierres Anteriores ({cierresAnteriores.length})
          </button>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeTab === 'cierre' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Resumen Principal de Ventas */}
              <div
                style={{
                  backgroundColor: '#341e11',
                  border: '2px solid #52301c',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>
                    Venta Total Hoy
                  </span>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(totalVendido)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#a5d6a7', marginTop: '2px' }}>
                    {totalComandas} comandas cobradas
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>
                    Recaudo en Efectivo
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#81c784', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(metodos.efectivo || 0)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#c4a48c', marginTop: '2px' }}>
                    Dinero físico esperado
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>
                    Transferencias (Nequi/Daviplata)
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4fc3f7', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency((metodos.nequi || 0) + (metodos.daviplata || 0) + (metodos.tarjeta || 0))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#c4a48c', marginTop: '2px' }}>
                    Medios electrónicos
                  </div>
                </div>
              </div>

              {/* Formulario de Arqueo */}
              <div
                style={{
                  backgroundColor: '#2b180d',
                  border: '1.5px solid #5c351e',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#ffcc00', textTransform: 'uppercase' }}>
                  💵 Arqueo y Conteo de Caja Física
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '6px', fontWeight: '700' }}>
                      Base de Caja Inicial ($):
                    </label>
                    <input
                      type="number"
                      value={baseCash}
                      onChange={(e) => setBaseCash(Number(e.target.value))}
                      style={{ width: '100%', fontSize: '1rem', fontWeight: '700' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '6px', fontWeight: '700' }}>
                      Efectivo Contado al Cierre ($):
                    </label>
                    <input
                      type="number"
                      placeholder={efectivoEsperado.toString()}
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      style={{ width: '100%', fontSize: '1rem', fontWeight: '700', borderColor: '#e27329' }}
                    />
                  </div>
                </div>

                {/* Resultado de Cuadre */}
                <div
                  style={{
                    backgroundColor: diferencia === 0 ? 'rgba(46, 125, 50, 0.2)' : diferencia < 0 ? 'rgba(198, 40, 40, 0.2)' : 'rgba(255, 204, 0, 0.2)',
                    border: `1.5px solid ${diferencia === 0 ? '#2e7d32' : diferencia < 0 ? '#c62828' : '#ffcc00'}`,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {diferencia === 0 ? (
                      <CheckCircle2 size={24} color="#81c784" />
                    ) : (
                      <AlertTriangle size={24} color={diferencia < 0 ? '#ff5252' : '#ffcc00'} />
                    )}
                    <div>
                      <div style={{ fontWeight: '900', fontSize: '0.9rem', color: '#fff' }}>
                        {diferencia === 0
                          ? '¡Caja Cuadrada Perfectamente!'
                          : diferencia < 0
                          ? `Faltante en Caja: ${formatCurrency(Math.abs(diferencia))}`
                          : `Sobrante en Caja: ${formatCurrency(diferencia)}`}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#c4a48c' }}>
                        Esperado en gaveta: {formatCurrency(efectivoEsperado)} (Base: {formatCurrency(base)} + Efectivo ventas: {formatCurrency(metodos.efectivo || 0)})
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '6px', fontWeight: '700' }}>
                    Observaciones o Novedades del Turno:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Turno de tarde sin novedades, propinas entregadas..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Advertencia Informativa */}
              <div style={{ fontSize: '0.78rem', color: '#ffcc00', backgroundColor: '#3d2314', padding: '12px', borderRadius: '10px', border: '1px solid #5c351e' }}>
                ⚠️ <strong>Aviso de Reinicio Diario:</strong> Al confirmar el cierre, la venta de hoy ({formatCurrency(totalVendido)}) se guardará permanentemente en el historial contable y <strong>la caja comenzará limpia en $0 para el día de mañana</strong>.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cierresAnteriores.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 10px', color: '#c4a48c' }}>
                  No hay cierres anteriores registrados todavía.
                </div>
              ) : (
                cierresAnteriores.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      backgroundColor: '#341e11',
                      border: '1.5px solid #52301c',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '900', color: '#ffcc00', fontSize: '0.95rem' }}>
                        {c.fechaFormateada || new Date(c.fecha).toLocaleDateString()} • {c.id}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#c4a48c', marginTop: '2px' }}>
                        Cerrado por: <strong>{c.cerradoPor}</strong> • {c.totalComandas} comandas
                      </div>
                      {c.notas && (
                        <div style={{ fontSize: '0.75rem', color: '#fbeee0', fontStyle: 'italic', marginTop: '2px' }}>
                          "{c.notas}"
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#81c784', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(c.totalVendido)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: c.diferencia === 0 ? '#a5d6a7' : '#ff8a80' }}>
                        {c.diferencia === 0 ? '✓ Cuadre exacto' : `Dif: ${formatCurrency(c.diferencia)}`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'cierre' && (
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: '#3d2314',
              borderTop: '2px solid #5c351e',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <button
              type="button"
              onClick={handlePrintZ}
              style={{
                backgroundColor: '#2b180d',
                border: '1.5px solid #5c351e',
                color: '#fbeee0',
                padding: '10px 18px',
                borderRadius: '10px'
              }}
            >
              <Printer size={16} /> Imprimir Reporte Z
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              style={{
                backgroundColor: '#e27329',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.95rem',
                border: '1.5px solid #ffcc00',
                boxShadow: '0 4px 16px rgba(226, 115, 41, 0.5)'
              }}
            >
              {isSubmitting ? (
                <span>Archivando y cerrando...</span>
              ) : (
                <>
                  <Lock size={16} /> Confirmar Cierre y Reiniciar a $0
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
