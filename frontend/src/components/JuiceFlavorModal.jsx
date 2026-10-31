import React, { useState, useEffect } from 'react';
import { X, Check, Droplets, Milk, Sparkles, MessageSquare } from 'lucide-react';
import { formatCurrency } from '../data/menu.js';

const POPULAR_FLAVORS = [
  { id: 'mora', name: 'Mora', emoji: '🍇' },
  { id: 'mango', name: 'Mango', emoji: '🥭' },
  { id: 'maracuya', name: 'Maracuyá', emoji: '🟡' },
  { id: 'lulo', name: 'Lulo', emoji: '🍈' },
  { id: 'fresa', name: 'Fresa', emoji: '🍓' },
  { id: 'guanabana', name: 'Guanábana', emoji: '🍈' },
  { id: 'limonada', name: 'Limonada Natural', emoji: '🍋' },
  { id: 'maracumango', name: 'Maracumango', emoji: '🍹' },
  { id: 'frutos_rojos', name: 'Frutos Rojos', emoji: '🫐' },
  { id: 'pina', name: 'Piña', emoji: '🍍' },
  { id: 'naranja', name: 'Naranja', emoji: '🍊' },
  { id: 'mandarina', name: 'Mandarina', emoji: '🍊' }
];

export default function JuiceFlavorModal({
  isOpen,
  onClose,
  product,
  initialFlavor = '',
  initialBase = '',
  initialNote = '',
  onConfirmFlavor
}) {
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [customFlavor, setCustomFlavor] = useState('');
  const [baseType, setBaseType] = useState('agua'); // 'agua' | 'leche'
  const [specialNote, setSpecialNote] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      const isLeche = product.name?.toLowerCase().includes('leche') || initialBase === 'leche';
      setBaseType(isLeche ? 'leche' : 'agua');
      
      const flavorMatch = POPULAR_FLAVORS.find(f => f.name.toLowerCase() === (initialFlavor || '').toLowerCase());
      if (flavorMatch) {
        setSelectedFlavor(flavorMatch.name);
        setCustomFlavor('');
      } else if (initialFlavor) {
        setSelectedFlavor('Otro');
        setCustomFlavor(initialFlavor);
      } else {
        setSelectedFlavor(POPULAR_FLAVORS[0].name);
        setCustomFlavor('');
      }
      setSpecialNote(initialNote || '');
    }
  }, [isOpen, product, initialFlavor, initialBase, initialNote]);

  if (!isOpen || !product) return null;

  const finalFlavorName = selectedFlavor === 'Otro' 
    ? (customFlavor.trim() || 'Sabor Especial') 
    : selectedFlavor;

  const basePrice = baseType === 'leche' 
    ? (product.name.toLowerCase().includes('leche') ? product.price : product.price + 1000) 
    : (product.name.toLowerCase().includes('leche') ? Math.max(0, product.price - 1000) : product.price);

  const handleConfirm = () => {
    if (!finalFlavorName.trim()) {
      alert('Por favor selecciona o escribe el sabor del jugo natural.');
      return;
    }

    const baseTitle = baseType === 'leche' ? 'Jugo Natural en Leche' : 'Jugo Natural en Agua';
    const customizedProduct = {
      ...product,
      name: `${baseTitle} (${finalFlavorName})`,
      baseName: baseTitle,
      sabor: finalFlavorName,
      base: baseType,
      price: basePrice,
      nota: specialNote.trim() ? specialNote.trim() : `Sabor: ${finalFlavorName}`,
      // ID único para diferenciar en el carrito un jugo de mora de uno de lulo
      id: `${product.id || 601}-${finalFlavorName.toLowerCase().replace(/\s+/g, '_')}-${baseType}`
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
          border: '2.5px solid #ffcc00',
          borderRadius: '22px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.95)'
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
            <span style={{ fontSize: '26px' }}>🥤</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                Escoge el Sabor del Jugo
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#fbeee0', margin: 0 }}>
                Personaliza la preparación y la fruta favorita del cliente
              </p>
            </div>
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
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '72vh' }}>
          {/* Base Preparation (En Agua vs En Leche) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#c4a48c', textTransform: 'uppercase', marginBottom: '8px' }}>
              Base de Preparación:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setBaseType('agua')}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: baseType === 'agua' ? 'rgba(2, 136, 209, 0.25)' : '#341e11',
                  border: baseType === 'agua' ? '2px solid #0288d1' : '1.5px solid #52301c',
                  color: baseType === 'agua' ? '#4fc3f7' : '#c4a48c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '800',
                  fontSize: '0.85rem'
                }}
              >
                <Droplets size={16} /> En Agua
              </button>
              <button
                type="button"
                onClick={() => setBaseType('leche')}
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: baseType === 'leche' ? 'rgba(255, 204, 0, 0.25)' : '#341e11',
                  border: baseType === 'leche' ? '2px solid #ffcc00' : '1.5px solid #52301c',
                  color: baseType === 'leche' ? '#ffcc00' : '#c4a48c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '800',
                  fontSize: '0.85rem'
                }}
              >
                <Milk size={16} /> En Leche (Cremoso)
              </button>
            </div>
          </div>

          {/* Flavor Selection Grid */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#c4a48c', textTransform: 'uppercase', marginBottom: '8px' }}>
              Selecciona la Fruta / Sabor:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {POPULAR_FLAVORS.map((f) => {
                const isSelected = selectedFlavor === f.name;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedFlavor(f.name);
                      setCustomFlavor('');
                    }}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'var(--brand-primary, #e27329)' : '#341e11',
                      border: isSelected ? '2px solid #ffcc00' : '1.5px solid #52301c',
                      color: isSelected ? '#ffffff' : '#fbeee0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '800'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{f.emoji}</span>
                    <span>{f.name}</span>
                  </button>
                );
              })}

              {/* Botón Otro / Personalizado */}
              <button
                type="button"
                onClick={() => setSelectedFlavor('Otro')}
                style={{
                  padding: '10px 6px',
                  borderRadius: '10px',
                  backgroundColor: selectedFlavor === 'Otro' ? 'var(--brand-primary, #e27329)' : '#341e11',
                  border: selectedFlavor === 'Otro' ? '2px solid #ffcc00' : '1.5px solid #52301c',
                  color: selectedFlavor === 'Otro' ? '#ffffff' : '#fbeee0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '800'
                }}
              >
                <Sparkles size={20} color="#ffcc00" />
                <span>Otro Sabor</span>
              </button>
            </div>

            {selectedFlavor === 'Otro' && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  value={customFlavor}
                  onChange={(e) => setCustomFlavor(e.target.value)}
                  placeholder="Escribe el sabor aquí (ej. Maracuyá con Hierbabuena)"
                  autoFocus
                  style={{
                    width: '100%',
                    backgroundColor: '#1f1109',
                    border: '1.5px solid #ffcc00',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            )}
          </div>

          {/* Notas o Especificaciones Especiales */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: '800', color: '#c4a48c', textTransform: 'uppercase', marginBottom: '6px' }}>
              <MessageSquare size={13} /> Especificaciones (Opcional):
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {['Sin azúcar', 'Bajo en dulce', 'Poco hielo', 'Sin hielo', 'Bien frío'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (specialNote.includes(tag)) {
                      setSpecialNote(specialNote.replace(tag, '').trim());
                    } else {
                      setSpecialNote(specialNote ? `${specialNote}, ${tag}` : tag);
                    }
                  }}
                  style={{
                    backgroundColor: specialNote.includes(tag) ? 'rgba(255, 204, 0, 0.25)' : '#341e11',
                    border: specialNote.includes(tag) ? '1px solid #ffcc00' : '1px solid #52301c',
                    color: specialNote.includes(tag) ? '#ffcc00' : '#c4a48c',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  {specialNote.includes(tag) ? '✓ ' : '+ '}{tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="Ej: Sin azúcar, muy frío..."
              style={{
                width: '100%',
                backgroundColor: '#1f1109',
                border: '1.5px solid #52301c',
                color: '#fff',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {/* Footer Modal con Precio y Confirmación */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#3d2314',
            borderTop: '2px solid #5c351e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: '#c4a48c', textTransform: 'uppercase', fontWeight: '800' }}>
              Precio Final:
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(basePrice)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#2b180d',
                border: '1.5px solid #5c351e',
                color: '#fbeee0',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: '700'
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              style={{
                backgroundColor: '#e27329',
                border: '1.5px solid #ffcc00',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(226, 115, 41, 0.5)'
              }}
            >
              <Check size={16} /> Confirmar ({finalFlavorName})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
