import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, MessageSquare, Snowflake, ThermometerSun } from 'lucide-react';
import { formatCurrency } from '../data/menu.js';

const SODA_FLAVORS = [
  { id: 'cocacola', name: 'Coca-Cola Original', emoji: '🔴', desc: 'Clásica e inconfundible' },
  { id: 'cocacola_zero', name: 'Coca-Cola Zero / Sin Azúcar', emoji: '⚫', desc: 'Cero azúcar y calorías' },
  { id: 'manzana', name: 'Postobón Manzana', emoji: '🍏', desc: 'El sabor tradicional de manzana' },
  { id: 'colombiana', name: 'Colombiana (La Nuestra)', emoji: '🟠', desc: 'Sabor único cola champaña' },
  { id: 'quatro', name: 'Quatro (Toronja)', emoji: '🟡', desc: 'Refrescante toronja cítrica' },
  { id: 'sprite', name: 'Sprite (Lima-Limón)', emoji: '🍋', desc: 'Cristalina y refrescante' },
  { id: 'pepsi', name: 'Pepsi', emoji: '🔵', desc: 'Sabor cola intenso' },
  { id: 'naranja', name: 'Postobón Naranja', emoji: '🍊', desc: 'Sabor dulce a naranja' },
  { id: 'uva', name: 'Postobón Uva', emoji: '🍇', desc: 'Sabor tradicional a uva' },
  { id: 'bretana', name: 'Bretaña (Agua con Gas)', emoji: '⚪', desc: 'Burbujeante y digestiva' },
  { id: 'te', name: 'Té Helado (Limón / Durazno)', emoji: '🧃', desc: 'Té frío refrescante' },
  { id: 'otro', name: 'Otro Sabor', emoji: '✨', desc: 'Especificar sabor personalizado' }
];

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
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [customFlavor, setCustomFlavor] = useState('');
  const [tempType, setTempType] = useState('fria_hielo');
  const [specialNote, setSpecialNote] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      const match = SODA_FLAVORS.find((f) => f.name.toLowerCase() === (initialFlavor || '').toLowerCase());
      if (match) {
        setSelectedFlavor(match.name);
        setCustomFlavor('');
      } else if (initialFlavor) {
        setSelectedFlavor('Otro Sabor');
        setCustomFlavor(initialFlavor);
      } else {
        setSelectedFlavor(SODA_FLAVORS[0].name);
        setCustomFlavor('');
      }
      setTempType(initialTemp || 'fria_hielo');
      setSpecialNote(initialNote || '');
    }
  }, [isOpen, product, initialFlavor, initialTemp, initialNote]);

  if (!isOpen || !product) return null;

  const finalFlavorName = selectedFlavor === 'Otro Sabor' 
    ? (customFlavor.trim() || 'Sabor Especial') 
    : selectedFlavor;

  const handleConfirm = () => {
    if (!finalFlavorName.trim()) {
      alert('Por favor selecciona o escribe el sabor de la gaseosa.');
      return;
    }

    const tempLabel = TEMP_OPTIONS.find((t) => t.id === tempType)?.label || '';
    const cleanBaseName = product.baseName || product.name.replace(/\s*\(.*?\)\s*/g, '').trim();

    const customizedProduct = {
      ...product,
      name: `${cleanBaseName} (${finalFlavorName})`,
      baseName: cleanBaseName,
      sabor: finalFlavorName,
      temperatura: tempType,
      nota: specialNote.trim() 
        ? `${finalFlavorName} • ${tempLabel} [${specialNote.trim()}]`
        : `${finalFlavorName} • ${tempLabel}`,
      // ID único para diferenciar en comanda una gaseosa Manzana de una Coca-Cola
      id: `${product.id || 701}-${finalFlavorName.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${tempType}`
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
          maxWidth: '520px',
          backgroundColor: '#26160c',
          border: '2.5px solid #e27329',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
          maxHeight: '92vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '18px 24px',
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
                Selecciona el Sabor de Gaseosa
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

        {/* Cuerpo / Opciones */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Sabores de Gaseosa */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '900', color: '#ffcc00', marginBottom: '8px' }}>
              1. Sabor de Gaseosa o Bebida:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
              {SODA_FLAVORS.map((f) => {
                const isSelected = selectedFlavor === f.name;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFlavor(f.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(226, 115, 41, 0.35)' : '#341e11',
                      border: `1.5px solid ${isSelected ? '#e27329' : '#52301c'}`,
                      color: isSelected ? '#ffcc00' : '#fbeee0',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: isSelected ? '900' : '600',
                      fontSize: '0.82rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.15rem' }}>{f.emoji}</span>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {f.name}
                    </span>
                    {isSelected && <Check size={14} color="#ffcc00" />}
                  </button>
                );
              })}
            </div>

            {/* Campo para sabor personalizado si elige 'Otro Sabor' */}
            {selectedFlavor === 'Otro Sabor' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Escribe el sabor exacto (Ej: Postobón Kola, Ginger, etc.)..."
                  value={customFlavor}
                  onChange={(e) => setCustomFlavor(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#1f1109',
                    border: '1.5px solid #e27329',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: '700'
                  }}
                />
              </div>
            )}
          </div>

          {/* Preferencia de Temperatura */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '900', color: '#ffcc00', marginBottom: '8px' }}>
              2. Preferencia de Temperatura:
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
                      padding: '10px 8px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(2, 136, 209, 0.3)' : '#341e11',
                      border: `1.5px solid ${isSelected ? '#0288d1' : '#52301c'}`,
                      color: isSelected ? '#4fc3f7' : '#fbeee0',
                      fontWeight: isSelected ? '800' : '600',
                      fontSize: '0.8rem',
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

          {/* Nota especial adicional */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#c4a48c', marginBottom: '4px', fontWeight: '700' }}>
              Nota o Petición para Cocina/Despacho (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ej: vaso con limón, pitillo, bien fría..."
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
        </div>

        {/* Footer y Confirmación */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#3d2314',
            borderTop: '2px solid #5c351e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#c4a48c' }}>Total del Producto:</div>
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
              type="button"
              onClick={handleConfirm}
              style={{
                padding: '10px 22px',
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
              <Check size={18} /> Confirmar Gaseosa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
