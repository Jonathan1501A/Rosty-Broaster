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
  CheckCircle2,
  Building2
} from 'lucide-react';
import { api } from '../services/api.js';
import { DEFAULT_TENANT, DEFAULT_PIZZERIA, INITIAL_TENANTS, applyTenantTheme } from '../data/tenantConfig.js';

export default function LoginModal({ onLoginSuccess, onOpenPrivacy }) {
  const [tenants, setTenants] = useState(() => INITIAL_TENANTS);
  const [selectedTenantId, setSelectedTenantId] = useState(() => {
    try {
      return localStorage.getItem('rosty_active_tenant_id') || DEFAULT_TENANT.id;
    } catch {
      return DEFAULT_TENANT.id;
    }
  });
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

  // Cargar lista de restaurantes desde Backend
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const list = await api.getTenants();
        if (list && list.length > 0) {
          setTenants(list);
          const activeId = localStorage.getItem('rosty_active_tenant_id');
          if (activeId && list.some((t) => t.id === activeId)) {
            setSelectedTenantId(activeId);
            const chosen = list.find((t) => t.id === activeId);
            applyTenantTheme(chosen);
          } else {
            // Default first
            applyTenantTheme(list[0]);
          }
        }
      } catch (err) {
        console.debug('Usando restaurantes locales preconfigurados:', err.message);
      }
    };
    fetchTenants();
  }, []);

  const currentTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0] || DEFAULT_TENANT;

  // Cambiar de restaurante
  const handleSelectTenant = (tenantId) => {
    setSelectedTenantId(tenantId);
    try {
      localStorage.setItem('rosty_active_tenant_id', tenantId);
    } catch (e) {}
    const chosen = tenants.find((t) => t.id === tenantId) || DEFAULT_TENANT;
    applyTenantTheme(chosen);
    setPin('');
    setErrorMsg('');
  };

  // Claves de demostración específicas según el restaurante seleccionado
  const demoPins = (() => {
    if (selectedTenantId === 'pizzeria-napoles') {
      return { waiter: 'pizza123', chef: 'cocina123', admin: 'admin123' };
    }
    if (selectedTenantId === 'rosty-broaster') {
      return { waiter: 'rosty123', chef: 'cocina123', admin: 'admin123' };
    }
    return { waiter: '1234', chef: '1234', admin: 'admin123' };
  })();

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
      const validPins = [
        'rosty123', 
        'pizza123', 
        'cocina123', 
        'admin123', 
        '1234', 
        '5678', 
        '4321'
      ];

      if (validPins.includes(pin.trim())) {
        const fallbackUser = {
          id: `u-${selectedRole}-${selectedTenantId}`,
          username: selectedRole,
          name: selectedRole === 'waiter' 
            ? `Mesero ${currentTenant.nombre}` 
            : selectedRole === 'chef' 
            ? `Jefe Cocina ${currentTenant.nombre}` 
            : `Admin ${currentTenant.nombre}`,
          role: selectedRole,
          empresaId: selectedTenantId
        };
        applyTenantTheme(currentTenant);
        onLoginSuccess(fallbackUser, currentTenant);
        return;
      }
      setErrorMsg(err.message || 'Código PIN incorrecto para este restaurante.');
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
      localStorage.setItem('rosty_active_tenant_id', created.id);
      applyTenantTheme(created);
      setShowNewTenantModal(false);

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
        background: 'radial-gradient(circle at 50% 30%, var(--bg-surface, #3d2314) 0%, var(--bg-app, #1f1109) 100%)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-surface, #3d2314)',
          border: '3px solid var(--brand-primary, #e27329)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(226, 115, 41, 0.3)',
          padding: '28px 26px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Selector Visual de Restaurantes */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: '900', color: '#ffcc00', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🏢 ¿A cuál restaurante deseas ingresar?
            </span>
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
              <PlusCircle size={14} /> + Nuevo
            </button>
          </div>

          {/* Tarjetas Grandes de Restaurantes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {tenants.map((t) => {
              const isSelected = t.id === selectedTenantId;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTenant(t.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: isSelected ? '2.5px solid #ffcc00' : '1.5px solid #5c351e',
                    backgroundColor: isSelected ? 'rgba(226, 115, 41, 0.25)' : '#26160c',
                    boxShadow: isSelected ? '0 0 16px rgba(255, 204, 0, 0.35)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{t.logoEmoji || '🍽️'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '900', fontSize: '0.9rem', color: isSelected ? '#ffcc00' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.nombre}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: isSelected ? '#ffffff' : '#c4a48c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.slogan?.split('-')[0] || 'Restaurante'}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={18} color="#ffcc00" style={{ flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Header del Restaurante Activo */}
        <div style={{ textAlign: 'center', marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '16px', border: '1px solid #52301c' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffcc00 0%, var(--brand-primary, #e27329) 100%)',
              border: '2.5px solid #ffcc00',
              boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
              marginBottom: '8px',
              fontSize: '32px'
            }}
          >
            {currentTenant.logoEmoji || '🍽️'}
          </div>
          <h1
            style={{
              fontSize: '1.7rem',
              fontWeight: '900',
              letterSpacing: '-0.5px',
              color: '#ffcc00',
              margin: 0
            }}
          >
            {currentTenant.nombre}
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#fbeee0', marginTop: '2px', fontWeight: '700' }}>
            {currentTenant.slogan || 'SISTEMA DE PEDIDOS & COCINA'}
          </p>
        </div>

        {/* Role Selector Pills */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#ffcc00', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Selecciona tu Perfil de Trabajo:
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
                    padding: '10px 4px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? 'rgba(226, 115, 41, 0.35)' : '#2b180d',
                    border: isSelected ? `2.5px solid ${r.color}` : '1.5px solid #52301c',
                    color: isSelected ? '#ffcc00' : '#c4a48c',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={20} color={isSelected ? r.color : '#c4a48c'} />
                  <span style={{ fontSize: '0.78rem', marginTop: '5px', fontWeight: isSelected ? '900' : '600' }}>
                    {r.title.split('/')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '800', color: '#fbeee0', marginBottom: '6px', textTransform: 'uppercase' }}>
              <span>Código PIN de Personal:</span>
              <span style={{ color: '#ffcc00', textTransform: 'none', fontWeight: '700' }}>Acceso seguro</span>
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
                  padding: '12px 44px 12px 16px',
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
                marginBottom: '14px',
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
              backgroundColor: 'var(--brand-primary, #e27329)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: '900',
              border: 'none',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              marginBottom: '16px',
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

        {/* Accesos rápidos de prueba específicos del restaurante */}
        <div style={{ backgroundColor: '#2b180d', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #52301c', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.75rem', color: '#ffcc00', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase' }}>
            💡 Claves demostración para {currentTenant.nombre}:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('waiter', demoPins.waiter)}
              style={{ padding: '5px 9px', backgroundColor: '#3d2314', color: '#ffcc00', fontSize: '0.75rem', border: '1px solid #e27329', cursor: 'pointer', borderRadius: '6px' }}
            >
              Mesero: <strong style={{ color: '#fff' }}>{demoPins.waiter}</strong>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('chef', demoPins.chef)}
              style={{ padding: '5px 9px', backgroundColor: '#3d2314', color: '#a5d6a7', fontSize: '0.75rem', border: '1px solid #2e7d32', cursor: 'pointer', borderRadius: '6px' }}
            >
              Cocina: <strong style={{ color: '#fff' }}>{demoPins.chef}</strong>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', demoPins.admin)}
              style={{ padding: '5px 9px', backgroundColor: '#3d2314', color: '#4fc3f7', fontSize: '0.75rem', border: '1px solid #0288d1', cursor: 'pointer', borderRadius: '6px' }}
            >
              Admin: <strong style={{ color: '#fff' }}>{demoPins.admin}</strong>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #52301c',
            paddingTop: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#c4a48c'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#2e7d32" />
            <span>Datos 100% aislados por restaurante</span>
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
                  placeholder="Ej: Pizzería Roma, Taquería del Sol"
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
                  placeholder="Ej: La auténtica pizza italiana"
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
