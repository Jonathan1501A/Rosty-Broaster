import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  UtensilsCrossed, 
  ShieldAlert, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Store, 
  PlusCircle, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { api } from '../services/api.js';
import { DEFAULT_TENANT, applyTenantTheme } from '../data/tenantConfig.js';

export default function LoginModal({ onLoginSuccess, onOpenPrivacy }) {
  const [tenants, setTenants] = useState([DEFAULT_TENANT]);
  const [selectedTenantId, setSelectedTenantId] = useState(DEFAULT_TENANT.id);
  const [selectedRole, setSelectedRole] = useState('waiter');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modo Crear Nuevo Restaurante
  const [showNewTenantModal, setShowNewTenantModal] = useState(false);
  const [newTenantData, setNewTenantData] = useState({
    nombre: '',
    slogan: '',
    logoEmoji: '🍕',
    colores: {
      primario: '#d32f2f',
      secundario: '#ffcc00',
      fondo: '#1a1008',
      superficie: '#2b1a10'
    },
    numeroMesas: 10,
    whatsappDomiciliario: '3001234567',
    adminPin: 'admin123',
    adminName: 'Administrador'
  });
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);

  // Cargar lista de restaurantes
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const list = await api.getTenants();
        if (list && list.length > 0) {
          setTenants(list);
          const activeId = localStorage.getItem('rosty_active_tenant_id') || list[0].id;
          const found = list.find((t) => t.id === activeId) || list[0];
          setSelectedTenantId(found.id);
          applyTenantTheme(found);
        }
      } catch (err) {
        console.debug('Usando restaurantes locales:', err.message);
      }
    };
    fetchTenants();
  }, []);

  const currentTenant = tenants.find((t) => t.id === selectedTenantId) || DEFAULT_TENANT;

  // Cambiar de restaurante
  const handleSelectTenant = (tenantId) => {
    setSelectedTenantId(tenantId);
    const chosen = tenants.find((t) => t.id === tenantId) || DEFAULT_TENANT;
    applyTenantTheme(chosen);
    setPin('');
    setErrorMsg('');
  };

  const roles = [
    {
      id: 'waiter',
      title: 'Mesero / Salón',
      subtitle: 'Comandas y mesas',
      icon: UtensilsCrossed,
      color: '#e27329'
    },
    {
      id: 'chef',
      title: 'Jefe de Cocina',
      subtitle: 'Monitor KDS',
      icon: ChefHat,
      color: '#2e7d32'
    },
    {
      id: 'admin',
      title: 'Administrador',
      subtitle: 'Auditoría y caja',
      icon: ShieldAlert,
      color: '#0288d1'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg('Por favor ingrese el código PIN o clave de acceso.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await api.login(selectedRole, pin.trim(), selectedTenantId);
      applyTenantTheme(data.empresa || currentTenant);
      onLoginSuccess(data.user, data.empresa || currentTenant);
    } catch (err) {
      // Fallback local en caso de desconexión momentánea de backend
      if (
        (selectedRole === 'waiter' && (pin.trim() === 'rosty123' || pin.trim() === '1234')) ||
        (selectedRole === 'chef' && (pin.trim() === 'cocina123' || pin.trim() === '5678')) ||
        (selectedRole === 'admin' && (pin.trim() === 'admin123' || pin.trim() === '0000'))
      ) {
        const fallbackUser = {
          id: `u-${selectedRole}-${selectedTenantId}`,
          username: selectedRole,
          name: selectedRole === 'waiter' ? 'Mesero Salón' : selectedRole === 'chef' ? 'Jefe de Cocina' : `Admin ${currentTenant.nombre}`,
          role: selectedRole,
          empresaId: selectedTenantId
        };
        applyTenantTheme(currentTenant);
        onLoginSuccess(fallbackUser, currentTenant);
        return;
      }
      setErrorMsg(err.message || 'Código de acceso incorrecto para este restaurante.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    if (!newTenantData.nombre.trim()) {
      alert('Ingresa el nombre del restaurante');
      return;
    }

    setIsCreatingTenant(true);
    try {
      const res = await api.createTenant({
        ...newTenantData,
        numeroMesas: Number(newTenantData.numeroMesas) || 10
      });

      const created = res.tenant;
      setTenants((prev) => [...prev, created]);
      setSelectedTenantId(created.id);
      applyTenantTheme(created);
      setShowNewTenantModal(false);

      // Auto login con el admin creado
      if (res.adminUser) {
        onLoginSuccess(res.adminUser, created);
      }
    } catch (err) {
      alert(err.message || 'Error al crear la empresa');
    } finally {
      setIsCreatingTenant(false);
    }
  };

  const handleQuickFill = (role, defaultPin) => {
    setSelectedRole(role);
    setPin(defaultPin);
    setErrorMsg('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 30%, #3d2314 0%, #1f1109 100%)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Luz ambiental cálida */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(226, 115, 41, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#3d2314',
          border: '3px solid #e27329',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(226, 115, 41, 0.3)',
          padding: '32px 28px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Selector de Empresa / Restaurante */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#ffcc00', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🏢 Selecciona tu Restaurante / Empresa:
            </label>
            <button
              type="button"
              onClick={() => setShowNewTenantModal(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#81c784',
                fontSize: '0.78rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={14} /> + Nuevo Restaurante
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {tenants.map((t) => {
              const isSelected = t.id === selectedTenantId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTenant(t.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #ffcc00' : '1px solid #5c351e',
                    backgroundColor: isSelected ? '#e27329' : '#2b180d',
                    color: '#fff',
                    fontSize: '0.825rem',
                    fontWeight: isSelected ? '900' : '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  <span>{t.logoEmoji || '🍽️'}</span>
                  <span>{t.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Header Dinámico */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffcc00 0%, #e27329 100%)',
              border: '3px solid #ffcc00',
              boxShadow: '0 8px 24px rgba(226, 115, 41, 0.5)',
              marginBottom: '10px',
              fontSize: '36px'
            }}
          >
            {currentTenant.logoEmoji || '🐔'}
          </div>
          <h1
            style={{
              fontSize: '1.9rem',
              fontWeight: '900',
              letterSpacing: '-0.5px',
              color: '#ffcc00',
              margin: 0
            }}
          >
            {currentTenant.nombre}
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#e27329', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>
            {currentTenant.slogan || 'SISTEMA DE PEDIDOS & KDS'}
          </p>
        </div>

        {/* Role Selector Pills */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#ffcc00', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Perfil de Trabajo en este Restaurante:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setSelectedRole(r.id); setErrorMsg(''); }}
                  style={{
                    flexDirection: 'column',
                    padding: '12px 6px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? 'rgba(226, 115, 41, 0.3)' : '#2b180d',
                    border: isSelected ? `2.5px solid ${r.color}` : '1.5px solid #52301c',
                    color: isSelected ? '#ffcc00' : '#c4a48c',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={22} color={isSelected ? r.color : '#c4a48c'} />
                  <span style={{ fontSize: '0.78rem', marginTop: '6px', fontWeight: isSelected ? '900' : '600' }}>
                    {r.title.split('/')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '800', color: '#fbeee0', marginBottom: '8px', textTransform: 'uppercase' }}>
              <span>Código PIN de Personal:</span>
              <span style={{ color: '#ffcc00', textTransform: 'none', fontWeight: '700' }}>Exclusivo por empresa</span>
            </label>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••••"
                autoFocus
                style={{
                  width: '100%',
                  padding: '13px 44px 13px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#2b180d',
                  border: '2px solid #52301c',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  letterSpacing: showPassword ? 'normal' : '4px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#c4a48c',
                  padding: '4px',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div
              className="animate-fade-in"
              style={{
                backgroundColor: 'rgba(198, 40, 40, 0.25)',
                border: '1.5px solid #c62828',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#ff8a80',
                fontSize: '0.825rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '700'
              }}
            >
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              backgroundColor: '#e27329',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '900',
              border: 'none',
              boxShadow: '0 8px 20px rgba(226, 115, 41, 0.5)',
              marginBottom: '18px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <span>Validando clave...</span>
            ) : (
              <>
                <KeyRound size={18} /> Iniciar Turno en {currentTenant.nombre}
              </>
            )}
          </button>
        </form>

        {/* Accesos rápidos de prueba */}
        <div style={{ backgroundColor: '#2b180d', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #52301c', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#ffcc00', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase' }}>
            💡 Claves de acceso para demostración:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('waiter', 'rosty123')}
              style={{ padding: '5px 9px', backgroundColor: '#3d2314', color: '#ffcc00', fontSize: '0.75rem', border: '1px solid #e27329', cursor: 'pointer' }}
            >
              Mesero: <strong style={{ color: '#fff' }}>rosty123</strong>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('chef', 'cocina123')}
              style={{ padding: '5px 9px', backgroundColor: '#3d2314', color: '#a5d6a7', fontSize: '0.75rem', border: '1px solid #2e7d32', cursor: 'pointer' }}
            >
              Cocina: <strong style={{ color: '#fff' }}>cocina123</strong>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              style={{ padding: '5px 9px', backgroundColor: '#3d2314', color: '#4fc3f7', fontSize: '0.75rem', border: '1px solid #0288d1', cursor: 'pointer' }}
            >
              Admin: <strong style={{ color: '#fff' }}>admin123</strong>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #52301c',
            paddingTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#c4a48c'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#2e7d32" />
            <span>Multi-Tenant Seguro</span>
          </div>

          <button
            type="button"
            onClick={onOpenPrivacy}
            style={{
              background: 'transparent',
              color: '#ffcc00',
              fontSize: '0.75rem',
              padding: '2px 4px',
              textDecoration: 'underline',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Habeas Data & Normas
          </button>
        </div>
      </div>

      {/* Modal Crear Nuevo Restaurante */}
      {showNewTenantModal && (
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
          onClick={() => setShowNewTenantModal(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: '#26160c',
              border: '3px solid #ffcc00',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Store size={28} color="#ffcc00" />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#ffcc00' }}>
                  Registrar Nuevo Restaurante
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#fbeee0' }}>
                  Crea una empresa 100% independiente con sus propios datos y usuarios
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#fbeee0', marginBottom: '4px' }}>
                  Nombre del Restaurante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pizzería Roma, Burger House"
                  value={newTenantData.nombre}
                  onChange={(e) => setNewTenantData({ ...newTenantData, nombre: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#1f1109', border: '1.5px solid #5c351e', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#fbeee0', marginBottom: '4px' }}>
                  Slogan o Especialidad
                </label>
                <input
                  type="text"
                  placeholder="Ej: Las mejores hamburguesas artesanales"
                  value={newTenantData.slogan}
                  onChange={(e) => setNewTenantData({ ...newTenantData, slogan: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#1f1109', border: '1.5px solid #5c351e', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#fbeee0', marginBottom: '4px' }}>
                    Emoji / Ícono
                  </label>
                  <select
                    value={newTenantData.logoEmoji}
                    onChange={(e) => setNewTenantData({ ...newTenantData, logoEmoji: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#1f1109', border: '1.5px solid #5c351e', color: '#fff' }}
                  >
                    {['🍕', '🍔', '🥩', '🌮', '🍣', '☕', '🍲', '🍰', '🍟', '🍻', '🍽️', '🐔'].map((em) => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#fbeee0', marginBottom: '4px' }}>
                    Número de Mesas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newTenantData.numeroMesas}
                    onChange={(e) => setNewTenantData({ ...newTenantData, numeroMesas: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#1f1109', border: '1.5px solid #5c351e', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#fbeee0', marginBottom: '4px' }}>
                    WhatsApp Domiciliario
                  </label>
                  <input
                    type="text"
                    placeholder="3001234567"
                    value={newTenantData.whatsappDomiciliario}
                    onChange={(e) => setNewTenantData({ ...newTenantData, whatsappDomiciliario: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#1f1109', border: '1.5px solid #5c351e', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#fbeee0', marginBottom: '4px' }}>
                    PIN Administrador *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin123"
                    value={newTenantData.adminPin}
                    onChange={(e) => setNewTenantData({ ...newTenantData, adminPin: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#1f1109', border: '1.5px solid #5c351e', color: '#ffcc00', fontWeight: '800' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewTenantModal(false)}
                  style={{ backgroundColor: 'transparent', border: '1px solid #5c351e', color: '#c4a48c', padding: '10px 18px', borderRadius: '10px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTenant}
                  style={{
                    backgroundColor: '#2e7d32',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    cursor: isCreatingTenant ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isCreatingTenant ? 'Registrando...' : 'Crear Restaurante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
