import React, { useState } from 'react';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Receipt, 
  CheckCircle2, 
  X,
  Printer
} from 'lucide-react';
import { formatCurrency } from '../data/menu.js';
import ComandaPrintModal from './ComandaPrintModal.jsx';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  mesaNumero, 
  items = [], 
  onConfirmCloseTable,
  user,
  tenant
}) {
  const total = items.reduce((sum, item) => sum + item.price * item.cantidad, 0);

  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [cashGiven, setCashGiven] = useState(total);
  const [customerName, setCustomerName] = useState('Cliente Salón');
  const [customerDoc, setCustomerDoc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  if (!isOpen) return null;

  const change = Math.max(0, cashGiven - total);

  const paymentOptions = [
    { id: 'efectivo', name: 'Efectivo', icon: Banknote, color: '#2e7d32' },
    { id: 'tarjeta', name: 'Datáfono / Tarjeta', icon: CreditCard, color: '#0288d1' },
    { id: 'nequi', name: 'Nequi / Daviplata', icon: Smartphone, color: '#e27329' }
  ];

  const handlePresetCash = (amount) => {
    setCashGiven(amount);
  };

  const handleSubmit = async () => {
    if (paymentMethod === 'efectivo' && cashGiven < total) {
      alert('El monto en efectivo ingresado es menor al total de la cuenta.');
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirmCloseTable({
        numero: mesaNumero,
        metodoPago: paymentMethod,
        montoRecibido: paymentMethod === 'efectivo' ? cashGiven : total,
        cliente: customerName,
        documento: customerDoc,
        atendidoPor: user?.name || 'Mesero Salón'
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Error al procesar el cierre');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          backgroundColor: '#2b180d',
          border: '2px solid #e27329',
          borderRadius: '20px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#3d2314',
            borderBottom: '2px solid #5c351e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(46, 125, 50, 0.25)',
                border: '2px solid #2e7d32',
                color: '#81c784',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Receipt size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                Cierre y Facturación de Mesa {mesaNumero}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#fbeee0', margin: 0 }}>
                Registro contable con emisión de comprobante
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#2b180d',
              color: '#fbeee0',
              border: '1px solid #5c351e',
              padding: '6px 10px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Resumen Total */}
          <div
            style={{
              backgroundColor: '#3d2314',
              borderRadius: '14px',
              padding: '16px 20px',
              border: '1.5px solid #5c351e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>
                Monto Total a Cancelar
              </span>
              <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(total)}
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#fbeee0' }}>
              <div>{items.length} platos registrados</div>
              <div style={{ color: '#81c784', fontWeight: '700' }}>IVA & Consumo incluido</div>
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#fbeee0', marginBottom: '8px', textTransform: 'uppercase' }}>
              Método de Pago:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {paymentOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id)}
                    style={{
                      flexDirection: 'column',
                      padding: '12px 8px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(226, 115, 41, 0.25)' : '#3d2314',
                      border: isSelected ? `2px solid #ffcc00` : '1.5px solid #5c351e',
                      color: isSelected ? '#ffcc00' : '#fbeee0'
                    }}
                  >
                    <Icon size={22} color={isSelected ? '#ffcc00' : opt.color} />
                    <span style={{ fontSize: '0.8rem', marginTop: '6px', fontWeight: isSelected ? '900' : '600' }}>
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculadora de Vueltos en Efectivo */}
          {paymentMethod === 'efectivo' && (
            <div
              className="animate-fade-in"
              style={{
                backgroundColor: '#3d2314',
                borderRadius: '14px',
                padding: '16px',
                border: '1.5px solid #5c351e'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fbeee0' }}>
                  💵 Efectivo Recibido:
                </span>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(Number(e.target.value) || 0)}
                  style={{
                    width: '150px',
                    textAlign: 'right',
                    fontSize: '1.1rem',
                    fontWeight: '900',
                    color: '#ffcc00',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              {/* Botones de billetes rápidos colombianos */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => handlePresetCash(total)}
                  style={{ padding: '6px 12px', fontSize: '0.78rem', backgroundColor: '#2b180d', border: '1.5px solid #2e7d32', color: '#a5d6a7' }}
                >
                  Exacto (${total.toLocaleString()})
                </button>
                {[20000, 50000, 100000].map((billete) => (
                  <button
                    key={billete}
                    type="button"
                    onClick={() => handlePresetCash(billete)}
                    style={{ padding: '6px 12px', fontSize: '0.78rem', backgroundColor: '#2b180d', border: '1px solid #5c351e', color: '#fbeee0' }}
                  >
                    ${billete.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Cambio a devolver */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px dashed #5c351e',
                  fontSize: '0.95rem',
                  fontWeight: '800'
                }}
              >
                <span style={{ color: '#c4a48c' }}>Cambio / Vueltos:</span>
                <span style={{ color: change >= 0 ? '#a5d6a7' : '#ff5252', fontSize: '1.25rem', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(change)}
                </span>
              </div>
            </div>
          )}

          {/* Información de Facturación / Consumidor Final */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#c4a48c', marginBottom: '4px' }}>
                Nombre del Cliente:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Consumidor Final"
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#c4a48c', marginBottom: '4px' }}>
                Cédula / NIT (Opcional):
              </label>
              <input
                type="text"
                value={customerDoc}
                onChange={(e) => setCustomerDoc(e.target.value)}
                placeholder="222222222222"
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#3d2314',
            borderTop: '2px solid #5c351e',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#2b180d',
              color: '#fbeee0',
              padding: '10px 18px',
              border: '1.5px solid #5c351e'
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            style={{
              backgroundColor: '#2b180d',
              border: '1.5px solid #ffcc00',
              color: '#ffcc00',
              padding: '10px 16px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={16} /> Imprimir Pre-Factura
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSubmit}
            style={{
              backgroundColor: '#2e7d32',
              color: '#fff',
              padding: '11px 24px',
              fontSize: '0.925rem',
              fontWeight: '900',
              boxShadow: '0 4px 16px rgba(46, 125, 50, 0.45)'
            }}
          >
            {isProcessing ? (
              <span>Procesando pago...</span>
            ) : (
              <>
                <CheckCircle2 size={18} /> Confirmar Pago & Liberar Mesa
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de Impresión Térmica de Pre-Factura */}
      <ComandaPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        order={{
          id: `FAC-MESA-${mesaNumero}`,
          tipo: 'dine_in',
          mesaNumero,
          cliente: customerName || 'Salón',
          datosExtra: customerDoc ? `NIT/CC: ${customerDoc}` : '',
          items,
          total,
          metodoPago: paymentMethod,
          montoRecibido: paymentMethod === 'efectivo' ? cashGiven : total,
          cambio: change,
          atendidoPor: user?.name || 'Mesero Salón'
        }}
        tenant={tenant}
      />
    </div>
  );
}
