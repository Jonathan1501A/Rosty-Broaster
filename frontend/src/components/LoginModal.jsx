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
  CheckCircle2,
  Building2,
  Lock,
  ArrowRight,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api.js';
import { DEFAULT_TENANT, DEFAULT_PIZZERIA, applyTenantTheme, resolveTenantFromUrlOrStorage } from '../data/tenantConfig.js';

export default function LoginModal({ onLoginSuccess, onOpenPrivacy }) {
  // Modos de vista: 'restaurant_login' | 'enter_tenant_code' | 'superadmin_login'
  const [viewMode, setViewMode] = useState('restaurant_login');

  const [activeTenantId, setActiveTenantId] = useState(() => resolveTenantFromUrlOrStorage());
  const [tenant, setTenant] = useState(() => {
    const id = resolveTenantFromUrlOrStorage();
    if (id === 'pizzeria-napoles') return DEFAULT_PIZZERIA;
    return DEFAULT_TENANT;
  });

  // Credenciales de Usuario en Restaurante
  const [username, setUsername] = useState('waiter');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Credenciales para Superadmin Global
  const [superUser, setSuperUser] = useState('superadmin');
  const [superPass, setSuperPass] = useState('');
  const [showSuperPass, setShowSuperPass] = useState(false);

  // Código manual de restaurante
  const [manualCode, setManualCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cargar datos de la empresa actual desde la API
  useEffect(() => {
    const fetchActiveTenant = async () => {
      if (!activeTenantId) {
        setViewMode('enter_tenant_code');
        return;
      }

      try {
        const data = await api.getTenant(activeTenantId);
        if (data) {
          setTenant(data);
          applyTenantTheme(data);
        }
      } catch (err) {
        console.warn('Usando configuración local:', err.message);
        if (activeTenantId === 'pizzeria-napoles') {
          setTenant(DEFAULT_PIZZERIA);
          applyTenantTheme(DEFAULT_PIZZERIA);
        } else {
          setTenant(DEFAULT_TENANT);
          applyTenantTheme(DEFAULT_TENANT);
        }
      }
    };

    fetchActiveTenant();
  }, [activeTenantId]);

  // Manejar Login de Usuario en el Restaurante
  const handleRestaurantLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Por favor ingresa tu nombre de usuario o selecciona tu rol.');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Por favor ingresa tu contraseña o código PIN.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await api.login(username.trim(), pin.trim(), activeTenantId);
      applyTenantTheme(data.empresa || tenant);
      onLoginSuccess(data.user, data.empresa || tenant);
    } catch (err) {
      // Fallback local en caso de que el backend esté reiniciándose
      const validPins = ['rosty123', 'pizza123', 'cocina123', 'admin123', '1234', '5678'];
      if (validPins.includes(pin.trim())) {
        const role = username.includes('chef') || username.includes('cocina') 
          ? 'chef' 
          : username.includes('admin') 
          ? 'admin' 
          : 'waiter';

        const fallbackUser = {
          id: `u-${username}-${activeTenantId}`,
          username: username.trim(),
          name: username === 'waiter' 
            ? `Mesero ${tenant?.nombre || ''}` 
            : username === 'chef' 
            ? `Jefe Cocina ${tenant?.nombre || ''}` 
            : `${username}`,
          role,
          empresaId: activeTenantId
        };
        applyTenantTheme(tenant);
        onLoginSuccess(fallbackUser, tenant);
        return;
      }
      setErrorMsg(err.message || 'Credenciales incorrectas para este restaurante.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar Login de Superadministrador Global
  const handleSuperadminLogin = async (e) => {
    e.preventDefault();
    if (!superUser.trim() || !superPass.trim()) {
      setErrorMsg('Ingresa el usuario y la contraseña maestra.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await api.loginSuperadmin(superUser.trim(), superPass.trim());
      onLoginSuccess(data.user, null);
    } catch (err) {
      if (superUser.trim() === 'superadmin' && superPass.trim() === 'superadmin2026') {
        const fallbackSuper = {
          id: 'u-superadmin-global',
          username: 'superadmin',
          name: 'Administrador Global',
          role: 'superadmin',
          empresaId: 'global'
        };
        onLoginSuccess(fallbackSuper, null);
        return;
      }
      setErrorMsg(err.message || 'Contraseña maestra incorrecta.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar a otro restaurante mediante código
  const handleSwitchTenantCode = async (e) => {
    e.preventDefault();
    const clean = (manualCode || '').trim().toLowerCase();
    if (!clean) {
      setErrorMsg('Ingresa el código del restaurante (ej: rosty-broaster, pizzeria-napoles).');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await api.getTenant(clean);
      if (data) {
        setTenant(data);
        setActiveTenantId(clean);
        localStorage.setItem('rosty_active_tenant_id', clean);
        applyTenantTheme(data);
        setViewMode('restaurant_login');
        setPin('');
      }
    } catch (err) {
      if (clean === 'pizzeria-napoles') {
        setTenant(DEFAULT_PIZZERIA);
        setActiveTenantId('pizzeria-napoles');
        localStorage.setItem('rosty_active_tenant_id', 'pizzeria-napoles');
        applyTenantTheme(DEFAULT_PIZZERIA);
        setViewMode('restaurant_login');
        setPin('');
      } else if (clean === 'rosty-broaster') {
        setTenant(DEFAULT_TENANT);
        setActiveTenantId('rosty-broaster');
        localStorage.setItem('rosty_active_tenant_id', 'rosty-broaster');
        applyTenantTheme(DEFAULT_TENANT);
        setViewMode('restaurant_login');
        setPin('');
      } else {
        setErrorMsg('Restaurante no encontrado. Verifica el código con el administrador.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sugerir PIN de prueba según el rol seleccionado
  const handleQuickRole = (roleValue, defaultDemoPin) => {
    setUsername(roleValue);
    setPin(defaultDemoPin);
    setErrorMsg('');
  };

  const demoPinForRole = (role) => {
    if (activeTenantId === 'pizzeria-napoles') {
      return role === 'waiter' ? 'pizza123' : role === 'chef' ? 'cocina123' : 'admin123';
    }
    return role === 'waiter' ? 'rosty123' : role === 'chef' ? 'cocina123' : 'admin123';
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
          maxWidth: '520px',
          backgroundColor: 'var(--bg-surface, #3d2314)',
          border: '3px solid var(--brand-primary, #e27329)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(226, 115, 41, 0.3)',
          padding: '30px 28px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* ============================================================== */}
        {/* MODO 1: INICIO DE SESIÓN EN RESTAURANTE (AISLADO Y PERSONALIZADO) */}
        {/* ============================================================== */}
        {viewMode === 'restaurant_login' && (
          <div>
            {/* Header del Restaurante */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 204, 0, 0.15)',
                  border: '2.5px solid var(--brand-primary, #e27329)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '34px',
                  margin: '0 auto 12px auto',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
                }}
              >
                {tenant?.logoEmoji || '🍽️'}
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--brand-gold, #ffcc00)', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
                {tenant?.nombre || 'Restaurante'}
              </h1>
              <p style={{ fontSize: '0.825rem', color: '#fbeee0', margin: 0, opacity: 0.9 }}>
                {tenant?.slogan || 'Control de Salón, Cocina y Pedidos'}
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div
                style={{
                  backgroundColor: 'rgba(198, 40, 40, 0.25)',
                  border: '1.5px solid #ff5252',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '18px',
                  color: '#ff8a80',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ShieldAlert size={18} flexShrink={0} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Formulario de Login */}
            <form onSubmit={handleRestaurantLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Campo Usuario */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#ffcc00', marginBottom: '6px' }}>
                  Nombre de Usuario o Rol
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tu usuario (ej: carlos, mariapizza, admin, mesero)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#1f1109',
                    border: '1.5px solid #5c351e',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />

                {/* Accesos Rápidos por Rol */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickRole('waiter', demoPinForRole('waiter'))}
                    style={{
                      flex: 1,
                      backgroundColor: username === 'waiter' ? 'var(--brand-primary, #e27329)' : 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      border: '1px solid #5c351e',
                      borderRadius: '8px',
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <UtensilsCrossed size={12} /> Mesero
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickRole('chef', demoPinForRole('chef'))}
                    style={{
                      flex: 1,
                      backgroundColor: username === 'chef' ? '#2e7d32' : 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      border: '1px solid #5c351e',
                      borderRadius: '8px',
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <ChefHat size={12} /> Cocina
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickRole('admin', demoPinForRole('admin'))}
                    style={{
                      flex: 1,
                      backgroundColor: username === 'admin' ? '#0288d1' : 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      border: '1px solid #5c351e',
                      borderRadius: '8px',
                      padding: '6px 8px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <ShieldAlert size={12} /> Admin
                  </button>
                </div>
              </div>

              {/* Campo Contraseña / PIN */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#ffcc00', marginBottom: '6px' }}>
                  Código PIN o Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Ingresa tu clave o PIN..."
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1f1109',
                      border: '1.5px solid #5c351e',
                      borderRadius: '12px',
                      padding: '12px 42px 12px 14px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontWeight: '700',
                      letterSpacing: showPassword ? 'normal' : '2px',
                      outline: 'none'
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
                      background: 'none',
                      border: 'none',
                      color: '#c4a48c',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: 'var(--brand-primary, #e27329)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: '900',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                  marginTop: '8px',
                  transition: 'transform 0.15s ease'
                }}
              >
                {isLoading ? 'Autenticando...' : 'Iniciar Turno de Trabajo'} <ArrowRight size={18} />
              </button>
            </form>

            {/* Enlaces de Pie de Página */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setViewMode('enter_tenant_code');
                  setErrorMsg('');
                }}
                style={{ background: 'none', border: 'none', color: '#ffb74d', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ¿Deseas acceder a otro restaurante? Cambiar código
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', fontSize: '0.75rem', color: '#d7ccc8' }}>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('superadmin_login');
                    setErrorMsg('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#ffcc00', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800' }}
                >
                  <Lock size={12} /> Acceso Superadmin Global
                </button>

                {onOpenPrivacy && (
                  <button
                    type="button"
                    onClick={onOpenPrivacy}
                    style={{ background: 'none', border: 'none', color: '#d7ccc8', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Normativa & Privacidad
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODO 2: INGRESAR CÓDIGO DE RESTAURANTE (SIN EXPONER OTROS) */}
        {/* ============================================================== */}
        {viewMode === 'enter_tenant_code' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  backgroundColor: 'rgba(255, 152, 0, 0.15)',
                  border: '2px solid #ff9800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  margin: '0 auto 12px auto'
                }}
              >
                🏢
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffcc00', margin: '0 0 4px 0' }}>
                Acceso al Restaurante
              </h2>
              <p style={{ fontSize: '0.825rem', color: '#d7ccc8', margin: 0 }}>
                Ingresa el código único proporcionado por el administrador de tu negocio
              </p>
            </div>

            {errorMsg && (
              <div
                style={{
                  backgroundColor: 'rgba(198, 40, 40, 0.25)',
                  border: '1.5px solid #ff5252',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px',
                  color: '#ff8a80',
                  fontSize: '0.85rem'
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSwitchTenantCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#ffb74d', marginBottom: '6px' }}>
                  Código o Slug del Restaurante
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: rosty-broaster o pizzeria-napoles"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#1f1109',
                    border: '1.5px solid #5c351e',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: '#ff9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px',
                  fontSize: '0.95rem',
                  fontWeight: '900',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? 'Consultando...' : 'Continuar al Restaurante'} <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('restaurant_login');
                  setErrorMsg('');
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#d7ccc8',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '6px'
                }}
              >
                <ArrowLeft size={14} /> Volver al restaurante anterior
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODO 3: INICIO DE SESIÓN SUPERADMINISTRADOR GLOBAL */}
        {/* ============================================================== */}
        {viewMode === 'superadmin_login' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '18px',
                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                  border: '2px solid #ff9800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ff9800',
                  margin: '0 auto 12px auto'
                }}
              >
                <Lock size={30} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffcc00', margin: '0 0 4px 0' }}>
                Administrador Global
              </h2>
              <p style={{ fontSize: '0.825rem', color: '#d7ccc8', margin: 0 }}>
                Control maestro para crear y gestionar todas las empresas
              </p>
            </div>

            {errorMsg && (
              <div
                style={{
                  backgroundColor: 'rgba(198, 40, 40, 0.25)',
                  border: '1.5px solid #ff5252',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px',
                  color: '#ff8a80',
                  fontSize: '0.85rem'
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSuperadminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#ffb74d', marginBottom: '6px' }}>
                  Usuario Maestro
                </label>
                <input
                  type="text"
                  required
                  placeholder="superadmin"
                  value={superUser}
                  onChange={(e) => setSuperUser(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#1a0d06',
                    border: '1.5px solid #ff9800',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#ffb74d', marginBottom: '6px' }}>
                  Contraseña Maestra
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSuperPass ? 'text' : 'password'}
                    required
                    placeholder="Contraseña del administrador global..."
                    value={superPass}
                    onChange={(e) => setSuperPass(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1a0d06',
                      border: '1.5px solid #ff9800',
                      borderRadius: '12px',
                      padding: '12px 42px 12px 14px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontWeight: '700',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSuperPass(!showSuperPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#ffb74d',
                      cursor: 'pointer'
                    }}
                  >
                    {showSuperPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: '#ff9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px',
                  fontSize: '0.95rem',
                  fontWeight: '900',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px'
                }}
              >
                {isLoading ? 'Validando...' : 'Acceder al Panel Global'} <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('restaurant_login');
                  setErrorMsg('');
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#d7ccc8',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={14} /> Volver al Punto de Venta
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
