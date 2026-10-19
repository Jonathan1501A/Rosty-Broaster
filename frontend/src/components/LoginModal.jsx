import React, { useState } from 'react';
import { 
  ShieldAlert, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  AlertTriangle,
  Building2,
  UtensilsCrossed
} from 'lucide-react';
import { api } from '../services/api.js';
import { DEFAULT_TENANT, applyTenantTheme } from '../data/tenantConfig.js';

export default function LoginModal({ onLoginSuccess, onOpenPrivacy }) {
  // Modos de vista: 'universal_login' | 'enter_tenant_code' | 'superadmin_login'
  const [viewMode, setViewMode] = useState('universal_login');

  // Credenciales de Usuario
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Credenciales para Superadmin Global
  const [superUser, setSuperUser] = useState('');
  const [superPass, setSuperPass] = useState('');
  const [showSuperPass, setShowSuperPass] = useState(false);

  // Código manual de restaurante
  const [manualCode, setManualCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Manejar Login Universal Inteligente
  const handleUniversalLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Por favor ingresa tu nombre de usuario registrado.');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Por favor ingresa tu contraseña o PIN.');
      return;
    }

    setIsLoading(true);

    try {
      // El backend detecta automáticamente la empresa a la que pertenece el usuario
      const data = await api.login(username.trim(), pin.trim());
      
      if (data.empresa) {
        applyTenantTheme(data.empresa);
        onLoginSuccess(data.user, data.empresa);
      } else if (data.user?.role === 'superadmin') {
        onLoginSuccess(data.user, null);
      } else {
        onLoginSuccess(data.user, DEFAULT_TENANT);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales incorrectas o establecimiento no disponible.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar Login de Superadministrador Global
  const handleSuperadminLogin = async (e) => {
    e.preventDefault();
    if (!superUser.trim() || !superPass.trim()) {
      setErrorMsg('Por favor ingresa el usuario y contraseña maestra.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await api.loginSuperadmin(superUser.trim(), superPass.trim());
      onLoginSuccess(data.user, null);
    } catch (err) {
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
      setErrorMsg('Ingresa el código del restaurante asignado.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await api.getTenant(clean);
      if (data) {
        applyTenantTheme(data);
        localStorage.setItem('rosty_active_tenant_id', clean);
        localStorage.setItem(`rosty_tenant_${clean}`, JSON.stringify(data));
        setErrorMsg('');
        setViewMode('universal_login');
      }
    } catch (err) {
      setErrorMsg('Restaurante no encontrado. Verifica el código con la administración.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 30%, #3d2314 0%, #170d07 100%)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#26140b',
          border: '2.5px solid #e27329',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(226, 115, 41, 0.25)',
          padding: '36px 30px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* ============================================================== */}
        {/* MODO 1: LOGIN UNIVERSAL INTELIGENTE (REDIRECCIÓN AUTOMÁTICA)   */}
        {/* ============================================================== */}
        {viewMode === 'universal_login' && (
          <div>
            {/* Header del Portal Universal */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '22px',
                  backgroundColor: 'rgba(255, 152, 0, 0.15)',
                  border: '2.5px solid #e27329',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '34px',
                  margin: '0 auto 14px auto',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.45)'
                }}
              >
                🍽️
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#ffcc00', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
                Sistema POS Gastronómico
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#fbeee0', margin: 0, opacity: 0.9 }}>
                Ingresa con tus datos para acceder a tu restaurante
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

            {/* Formulario de Login Universal */}
            <form onSubmit={handleUniversalLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Campo Usuario */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#ffcc00', marginBottom: '6px' }}>
                  Usuario o Correo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tu usuario registrado..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#160b05',
                    border: '1.5px solid #5c351e',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#e27329'}
                  onBlur={(e) => e.target.style.borderColor = '#5c351e'}
                />
              </div>

              {/* Campo Contraseña / PIN */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#ffcc00', marginBottom: '6px' }}>
                  Contraseña o PIN
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Tu clave o PIN de acceso..."
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#160b05',
                      border: '1.5px solid #5c351e',
                      borderRadius: '12px',
                      padding: '12px 42px 12px 14px',
                      color: '#ffffff',
                      fontSize: '1rem',
                      fontWeight: '700',
                      letterSpacing: showPassword ? 'normal' : '2px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#e27329'}
                    onBlur={(e) => e.target.style.borderColor = '#5c351e'}
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
                  backgroundColor: '#e27329',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: '900',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(226, 115, 41, 0.4)',
                  marginTop: '8px',
                  transition: 'background-color 0.2s, transform 0.1s'
                }}
              >
                {isLoading ? 'Conectando...' : 'Ingresar al Establecimiento'} <ArrowRight size={18} />
              </button>
            </form>

            {/* Enlaces de Pie de Página */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center' }}>
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
        {/* MODO 2: INGRESAR CÓDIGO DE RESTAURANTE                         */}
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
                Ingresa el código único del establecimiento
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
                  Código o Identificador del Restaurante
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: rosty-broaster, pizzeria-napoles..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#160b05',
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
                {isLoading ? 'Verificando...' : 'Continuar al Restaurante'} <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('universal_login');
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
                <ArrowLeft size={14} /> Volver
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODO 3: INICIO DE SESIÓN SUPERADMINISTRADOR GLOBAL             */}
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
                Control maestro para crear, gestionar y supervisar empresas
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
                  placeholder="Ingresa tu usuario superadmin..."
                  value={superUser}
                  onChange={(e) => setSuperUser(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#160b05',
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
                      backgroundColor: '#160b05',
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
                  setViewMode('universal_login');
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
                <ArrowLeft size={14} /> Volver al Inicio
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
