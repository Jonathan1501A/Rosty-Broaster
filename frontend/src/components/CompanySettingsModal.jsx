import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Palette, 
  UtensilsCrossed, 
  Phone, 
  MapPin, 
  Save, 
  CheckCircle2, 
  MessageSquare
} from 'lucide-react';

export default function CompanySettingsModal({ 
  isOpen, 
  onClose, 
  tenant, 
  onSaveConfig 
}) {
  const [nombre, setNombre] = useState(tenant?.nombre || '');
  const [slogan, setSlogan] = useState(tenant?.slogan || '');
  const [logoEmoji, setLogoEmoji] = useState(tenant?.logoEmoji || '🐔');
  const [numeroMesas, setNumeroMesas] = useState(tenant?.numeroMesas || 14);
  const [telefono, setTelefono] = useState(tenant?.telefono || '');
  const [direccion, setDireccion] = useState(tenant?.direccion || '');
  const [whatsappDomiciliario, setWhatsappDomiciliario] = useState(tenant?.whatsappDomiciliario || '');

  // Colores de la marca
  const [primario, setPrimario] = useState(tenant?.colores?.primario || '#e27329');
  const [secundario, setSecundario] = useState(tenant?.colores?.secundario || '#ffcc00');
  const [fondo, setFondo] = useState(tenant?.colores?.fondo || '#1f1109');
  const [superficie, setSuperficie] = useState(tenant?.colores?.superficie || '#3d2314');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await onSaveConfig({
        nombre: nombre.trim(),
        slogan: slogan.trim(),
        logoEmoji,
        numeroMesas: Number(numeroMesas) || 10,
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        whatsappDomiciliario: whatsappDomiciliario.trim(),
        colores: {
          primario,
          secundario,
          fondo,
          superficie
        }
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      alert(err.message || 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const EMOJI_OPTIONS = ['🐔', '🍕', '🍔', '🥩', '🌮', '🍣', '☕', '🍲', '🍰', '🍟', '🍻', '🍽️'];

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
          maxWidth: '740px',
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}
            >
              {logoEmoji}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                Personalizar Empresa & Marca
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#fbeee0', margin: 0 }}>
                Adapta el nombre, logo, número de mesas y colores para cualquier restaurante
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Datos Generales */}
          <div style={{ backgroundColor: '#341e11', border: '1.5px solid #52301c', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffcc00', fontWeight: '900', fontSize: '0.875rem', textTransform: 'uppercase' }}>
              <Store size={18} /> Identidad del Negocio
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '6px', fontWeight: '700' }}>
                  Nombre del Restaurante / Empresa:
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  style={{ width: '100%', fontSize: '1rem', fontWeight: '800' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '6px', fontWeight: '700' }}>
                  Ícono / Emoji:
                </label>
                <select
                  value={logoEmoji}
                  onChange={(e) => setLogoEmoji(e.target.value)}
                  style={{ fontSize: '1.4rem', padding: '6px 12px', backgroundColor: '#2b180d', border: '1.5px solid #5c351e', borderRadius: '10px', color: '#fff' }}
                >
                  {EMOJI_OPTIONS.map((em) => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '6px', fontWeight: '700' }}>
                Eslogan o Descripción:
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="Ej: El mejor sabor tradicional de la ciudad"
                style={{ width: '100%', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {/* 2. Paleta de Colores de la Marca */}
          <div style={{ backgroundColor: '#341e11', border: '1.5px solid #52301c', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffcc00', fontWeight: '900', fontSize: '0.875rem', textTransform: 'uppercase' }}>
              <Palette size={18} /> Colores de la Marca (Personalización Visual)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ backgroundColor: '#2b180d', padding: '12px', borderRadius: '12px', border: '1px solid #5c351e' }}>
                <span style={{ fontSize: '0.75rem', color: '#fbeee0', display: 'block', marginBottom: '8px', fontWeight: '700' }}>Color Primario:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={primario}
                    onChange={(e) => setPrimario(e.target.value)}
                    style={{ width: '38px', height: '38px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#ffcc00', fontFamily: 'var(--font-mono)', fontWeight: '800' }}>{primario}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#2b180d', padding: '12px', borderRadius: '12px', border: '1px solid #5c351e' }}>
                <span style={{ fontSize: '0.75rem', color: '#fbeee0', display: 'block', marginBottom: '8px', fontWeight: '700' }}>Color Dorado / Acento:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={secundario}
                    onChange={(e) => setSecundario(e.target.value)}
                    style={{ width: '38px', height: '38px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#ffcc00', fontFamily: 'var(--font-mono)', fontWeight: '800' }}>{secundario}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#2b180d', padding: '12px', borderRadius: '12px', border: '1px solid #5c351e' }}>
                <span style={{ fontSize: '0.75rem', color: '#fbeee0', display: 'block', marginBottom: '8px', fontWeight: '700' }}>Fondo Principal:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={fondo}
                    onChange={(e) => setFondo(e.target.value)}
                    style={{ width: '38px', height: '38px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#ffcc00', fontFamily: 'var(--font-mono)', fontWeight: '800' }}>{fondo}</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#2b180d', padding: '12px', borderRadius: '12px', border: '1px solid #5c351e' }}>
                <span style={{ fontSize: '0.75rem', color: '#fbeee0', display: 'block', marginBottom: '8px', fontWeight: '700' }}>Color Superficie:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={superficie}
                    onChange={(e) => setSuperficie(e.target.value)}
                    style={{ width: '38px', height: '38px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#ffcc00', fontFamily: 'var(--font-mono)', fontWeight: '800' }}>{superficie}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Configuración de Operación (Mesas y WhatsApp) */}
          <div style={{ backgroundColor: '#341e11', border: '1.5px solid #52301c', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffcc00', fontWeight: '900', fontSize: '0.875rem', textTransform: 'uppercase' }}>
              <UtensilsCrossed size={18} /> Capacidad & Despacho de Domicilios
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '6px', fontWeight: '700' }}>
                  Número de Mesas en Salón:
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={numeroMesas}
                  onChange={(e) => setNumeroMesas(Number(e.target.value))}
                  style={{ width: '100%', fontSize: '1rem', fontWeight: '800' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#c4a48c', marginTop: '4px', display: 'block' }}>
                  Genera automáticamente las mesas numeradas 1 a {numeroMesas}.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '6px', fontWeight: '700' }}>
                  WhatsApp para Domicilios (Domiciliario):
                </label>
                <input
                  type="text"
                  placeholder="Ej: 3001234567 o dejar vacío para grupo"
                  value={whatsappDomiciliario}
                  onChange={(e) => setWhatsappDomiciliario(e.target.value)}
                  style={{ width: '100%', fontSize: '0.9rem' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#c4a48c', marginTop: '4px', display: 'block' }}>
                  Número al que se enviará la comanda por WhatsApp al salir de cocina.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '6px', fontWeight: '700' }}>
                  Teléfono de Atención:
                </label>
                <input
                  type="text"
                  placeholder="PBX / Celular del local"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbeee0', marginBottom: '6px', fontWeight: '700' }}>
                  Dirección del Restaurante:
                </label>
                <input
                  type="text"
                  placeholder="Dirección física"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#2b180d',
                border: '1.5px solid #5c351e',
                color: '#fbeee0',
                padding: '10px 20px',
                borderRadius: '10px'
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                backgroundColor: '#e27329',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.95rem',
                border: '1.5px solid #ffcc00',
                boxShadow: '0 4px 18px rgba(226, 115, 41, 0.5)'
              }}
            >
              {isSaving ? (
                <span>Aplicando cambios...</span>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 size={18} /> ¡Cambios Guardados!
                </>
              ) : (
                <>
                  <Save size={18} /> Guardar Configuración
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
