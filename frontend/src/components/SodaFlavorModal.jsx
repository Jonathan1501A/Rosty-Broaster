import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { formatCurrency } from '../data/menu.js';

const TEMP_OPTIONS = [
  { id: 'fria_hielo', label: '❄️ Fría con Hielo' },
  { id: 'fria_sin_hielo', label: '🧊 Fría sin Hielo' },
  { id: 'al_clima', label: '🌤️ Al Clima' }
];

export default function SodaFlavorModal({
  isOpen,
  onClose,
  product,
  initialFlavor = '',
  initialTemp = 'fria_hielo',
  initialNote = '',
  onConfirmFlavor
}) {
  const [flavorText, setFlavorText] = useState('');
  const [tempType, setTempType] = useState('fria_hielo');
  const [specialNote, setSpecialNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && product) {
      setFlavorText(initialFlavor || '');
      setTempType(initialTemp || 'fria_hielo');
      setSpecialNote(initialNote || '');
      setErrorMessage('');

      // Enfocar automáticamente el campo de texto al abrir
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, product, initialFlavor, initialTemp, initialNote]);

  if (!isOpen || !product) return null;

  const handleConfirm = (e) => {
    if (e) e.preventDefault();
    const cleanFlavor = flavorText.trim();

    if (!cleanFlavor) {
      setErrorMessage('Por favor escribe el sabor de la gaseosa a mano.');
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    const tempLabel = TEMP_OPTIONS.find((t) => t.id === tempType)?.label || '';
    const cleanBaseName = product.baseName || product.name.replace(/\s*\(.*?\)\s*/g, '').trim();

    const customizedProduct = {
      ...product,
      name: `${cleanBaseName} (${cleanFlavor})`,
      baseName: cleanBaseName,
      sabor: cleanFlavor,
      temperatura: tempType,
      nota: specialNote.trim() 
        ? `${cleanFlavor} • ${tempLabel} [${specialNote.trim()}]`
        : `${cleanFlavor} • ${tempLabel}`,
      id: `${product.id || 701}-${cleanFlavor.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${tempType}`
    };

    onConfirmFlavor(customizedProduct);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 10040,
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
          maxWidth: '460px',
          backgroundColor: '#26160c',
          border: '2.5px solid #e27329',
          borderRadius: '22px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95)'
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
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(226, 115, 41, 0.25)',
                border: '2px solid #e27329',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}
            >
              🍾
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#ffcc00' }}>
                Sabor de la Gaseosa
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#c4a48c' }}>
                {product.name} • {formatCurrency(product.price)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#2b180d',
              border: '1.5px solid #5c351e',
              color: '#c4a48c',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleConfirm} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Único Campo: Cuadro de texto para escribir el sabor a mano */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '900', color: '#ffcc00', marginBottom: '8px' }}>
              ✍️ Escribe el sabor de la gaseosa: *
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ej: Colombiana, Manzana, Coca-Cola Zero, Quatro..."
              value={flavorText}
              onChange={(e) => {
                setFlavorText(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
              style={{
                width: '100%',
                padding: '13px 16px',
                backgroundColor: '#1f1109',
                border: errorMessage ? '2px solid #ef4444' : '2px solid #e27329',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: '800',
                outline: 'none',
                boxShadow: '0 0 0 3px rgba(226, 115, 41, 0.25)'
              }}
            />
            {errorMessage && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '700', marginTop: '5px', display: 'block' }}>
                {errorMessage}
              </span>
            )}
            <span style={{ fontSize: '0.74rem', color: '#c4a48c', marginTop: '6px', display: 'block' }}>
              💡 Presiona <kbd style={{ background: '#3d2314', padding: '2px 6px', borderRadius: '4px', color: '#ffcc00' }}>Enter</kbd> para agregar directamente a la comanda.
            </span>
          </div>

          {/* Preferencia de Temperatura */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#ffcc00', marginBottom: '6px' }}>
              Temperatura:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {TEMP_OPTIONS.map((t) => {
                const isSelected = tempType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTempType(t.id)}
                    style={{
                      padding: '9px 6px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(2, 136, 209, 0.35)' : '#341e11',
                      border: `1.5px solid ${isSelected ? '#0288d1' : '#52301c'}`,
                      color: isSelected ? '#4fc3f7' : '#fbeee0',
                      fontWeight: isSelected ? '800' : '600',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nota opcional */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#c4a48c', marginBottom: '4px', fontWeight: '700' }}>
              Nota o Petición adicional (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ej: vaso con limón, pitillo..."
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                backgroundColor: '#1f1109',
                border: '1px solid #52301c',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Footer y Confirmación */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1.5px solid #5c351e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginTop: '4px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#c4a48c' }}>Total:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(product.price)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#2b180d',
                  border: '1.5px solid #5c351e',
                  borderRadius: '10px',
                  color: '#fbeee0',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e27329',
                  border: '1.5px solid #ffcc00',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontWeight: '900',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(226, 115, 41, 0.45)'
                }}
              >
                <Check size={16} /> Confirmar Gaseosa
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
