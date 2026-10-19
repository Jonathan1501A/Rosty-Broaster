import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  ChefHat, 
  UtensilsCrossed, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../services/api.js';

export default function UserManagementModal({ 
  isOpen, 
  onClose, 
  tenant, 
  currentUser 
}) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Formulario nuevo usuario
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('waiter');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validación de disponibilidad de usuario único en tiempo real
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    reason: ''
  });

  const tenantId = tenant?.id || 'rosty-broaster';

  const checkUsernameAvailability = async (candidate) => {
    const clean = String(candidate || '').trim().toLowerCase();
    if (!clean) {
      setUsernameStatus({ checking: false, available: null, reason: '' });
      return;
    }
    if (clean.length < 3) {
      setUsernameStatus({ checking: false, available: false, reason: 'Mínimo 3 caracteres.' });
      return;
    }
    if (!/^[a-z0-9_.-]+$/.test(clean)) {
      setUsernameStatus({ checking: false, available: false, reason: 'Solo letras, números, puntos y guiones.' });
      return;
    }

    setUsernameStatus({ checking: true, available: null, reason: 'Comprobando...' });
    try {
      const res = await api.checkUsername(clean);
      setUsernameStatus({
        checking: false,
        available: res.available,
        reason: res.reason || (res.available ? 'Usuario disponible' : 'Usuario no disponible')
      });
    } catch {
      setUsernameStatus({ checking: false, available: null, reason: '' });
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const fetched = await api.getTenantUsers(tenantId);
      setUsers(fetched || []);
    } catch (err) {
      console.warn('Error loading users:', err);
      // Fallback local users
      setUsers([
        { id: 'u-admin-1', username: 'admin', name: `Admin ${tenant?.nombre || 'General'}`, role: 'admin', pin: 'admin123' },
        { id: 'u-waiter-1', username: 'mesero1', name: 'Mesero Principal', role: 'waiter', pin: '1234' },
        { id: 'u-chef-1', username: 'cocina1', name: 'Jefe de Cocina', role: 'chef', pin: '5678' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setName('');
      setUsername('');
      setUsernameStatus({ checking: false, available: null, reason: '' });
      setRole('waiter');
      setPin('');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, tenantId]);

  if (!isOpen) return null;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Por favor ingresa el nombre de la persona.');
      return;
    }
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      setError('Por favor define un usuario para el sistema.');
      return;
    }
    if (cleanUser.length < 3) {
      setError('El nombre de usuario debe tener mínimo 3 caracteres.');
      return;
    }
    if (!/^[a-z0-9_.-]+$/.test(cleanUser)) {
      setError('El usuario solo puede incluir letras, números, puntos, guiones y guiones bajos (sin espacios).');
      return;
    }
    if (usernameStatus.available === false) {
      setError(usernameStatus.reason || 'Este nombre de usuario ya está registrado en el sistema. Elige otro.');
      return;
    }
    if (!pin.trim() || pin.length < 4) {
      setError('El PIN de seguridad debe tener al menos 4 dígitos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createTenantUser(tenantId, {
        name: name.trim(),
        username: cleanUser,
        role,
        pin: pin.trim()
      });

      setSuccessMsg(`¡Usuario "${created.name}" (@${created.username}) creado con éxito!`);
      setName('');
      setUsername('');
      setUsernameStatus({ checking: false, available: null, reason: '' });
      setPin('');
      setRole('waiter');
      loadUsers();
    } catch (err) {
      setError(err.message || 'Error al registrar usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.id === currentUser?.id) {
      alert('No puedes eliminar tu propio usuario actual de sesión.');
      return;
    }
    if (users.length <= 1) {
      alert('Debe existir al menos un usuario registrado en el restaurante.');
      return;
    }

    const confirmDelete = window.confirm(`¿Estás seguro de eliminar a ${userToDelete.name} (@${userToDelete.username})? Ya no podrá acceder.`);
    if (!confirmDelete) return;

    try {
      await api.deleteTenantUser(tenantId, userToDelete.id);
      setSuccessMsg(`Usuario ${userToDelete.name} eliminado.`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    } catch (err) {
      setError(err.message || 'Error al eliminar usuario.');
    }
  };

  const getRoleBadge = (userRole) => {
    switch (userRole) {
      case 'admin':
        return {
          icon: <Shield size={14} />,
          label: 'Administrador',
          color: '#ffcc00',
          bg: 'rgba(255, 204, 0, 0.15)',
          border: '#ffcc00'
        };
      case 'chef':
        return {
          icon: <ChefHat size={14} />,
          label: 'Cocinero / KDS',
          color: '#81c784',
          bg: 'rgba(129, 199, 132, 0.15)',
          border: '#81c784'
        };
      case 'waiter':
      default:
        return {
          icon: <UtensilsCrossed size={14} />,
          label: 'Mesero / Salón',
          color: '#ff9800',
          bg: 'rgba(255, 152, 0, 0.15)',
          border: '#ff9800'
        };
    }
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
          maxWidth: '820px',
          maxHeight: '92vh',
          backgroundColor: '#26160c',
          border: '3px solid #e27329',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#3d2314',
            borderBottom: '2px solid #5c351e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(226, 115, 41, 0.2)',
                border: '2px solid #e27329',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffcc00'
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: '#ffcc00' }}>
                Personal & Accesos Exclusivos
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#fbeee0' }}>
                Restaurante: <strong>{tenant?.nombre || 'Mi Restaurante'}</strong> • Aislamiento 100% independiente
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#c4a48c',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Mensajes de feedback */}
        {error && (
          <div
            style={{
              margin: '16px 24px 0 24px',
              padding: '12px 16px',
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              border: '1.5px solid #f44336',
              borderRadius: '12px',
              color: '#ff8a80',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              margin: '16px 24px 0 24px',
              padding: '12px 16px',
              backgroundColor: 'rgba(46, 125, 50, 0.2)',
              border: '1.5px solid #4caf50',
              borderRadius: '12px',
              color: '#81c784',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Contenido dividido en 2 columnas: Formulario Crear + Lista Personal */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.3fr',
            gap: '24px'
          }}
        >
          {/* Columna Izquierda: Formulario de Creación */}
          <div
            style={{
              backgroundColor: '#1f1109',
              borderRadius: '16px',
              border: '2px solid #5c351e',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffcc00', fontWeight: '800', fontSize: '1rem' }}>
              <UserPlus size={18} color="#e27329" />
              <span>Registrar Nuevo Empleado</span>
            </div>

            {/* Banner de Regla de Nombres de Usuario Únicos */}
            <div style={{
              backgroundColor: 'rgba(255, 152, 0, 0.12)',
              border: '1px solid rgba(255, 152, 0, 0.35)',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '0.75rem',
              color: '#ffcc00',
              lineHeight: '1.4'
            }}>
              🔒 <strong>Regla del Sistema:</strong> No pueden existir dos nombres de usuario iguales en la plataforma. Cada usuario debe ser único para permitir el ingreso directo.
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Nombre Completo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#fbeee0', marginBottom: '6px' }}>
                  Nombre y Apellidos *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Arévalo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#2b180d',
                    border: '1.5px solid #5c351e',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Usuario de Acceso Único */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#fbeee0', marginBottom: '6px' }}>
                  Nombre de Usuario (Único) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: carlos_rosty, mesero_1..."
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/\s+/g, '');
                    setUsername(val);
                    checkUsernameAvailability(val);
                  }}
                  onBlur={() => checkUsernameAvailability(username)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#2b180d',
                    border: `1.5px solid ${
                      usernameStatus.available === true 
                        ? '#4caf50' 
                        : usernameStatus.available === false 
                        ? '#f44336' 
                        : '#5c351e'
                    }`,
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
                <div style={{ marginTop: '5px', minHeight: '18px' }}>
                  {usernameStatus.checking && (
                    <span style={{ color: '#ffb74d', fontSize: '0.75rem' }}>⏳ Verificando disponibilidad...</span>
                  )}
                  {!usernameStatus.checking && usernameStatus.available === true && (
                    <span style={{ color: '#81c784', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ Nombre de usuario único y disponible</span>
                  )}
                  {!usernameStatus.checking && usernameStatus.available === false && (
                    <span style={{ color: '#ff8a80', fontSize: '0.75rem', fontWeight: 'bold' }}>❌ {usernameStatus.reason}</span>
                  )}
                </div>
              </div>

              {/* Rol Asignado */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#fbeee0', marginBottom: '6px' }}>
                  Rol y Permisos *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'waiter', label: 'Mesero', icon: '🍽️' },
                    { id: 'chef', label: 'Cocina', icon: '👨‍🍳' },
                    { id: 'admin', label: 'Admin', icon: '👑' }
                  ].map((r) => {
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        style={{
                          padding: '10px 6px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #ffcc00' : '1px solid #5c351e',
                          backgroundColor: isSelected ? '#e27329' : '#2b180d',
                          color: '#fff',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{r.icon}</span>
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIN de Seguridad */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fbeee0' }}>
                    PIN de Acceso (4+ dígitos) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c4a48c',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showPin ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    placeholder="Ej: 1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#2b180d',
                      border: '1.5px solid #5c351e',
                      color: '#ffcc00',
                      fontSize: '1rem',
                      letterSpacing: showPin ? 'normal' : '3px',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <KeyRound size={16} color="#c4a48c" style={{ position: 'absolute', right: '12px', top: '13px' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: '6px',
                  backgroundColor: '#e27329',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(226, 115, 41, 0.4)'
                }}
              >
                <UserPlus size={18} />
                {isSubmitting ? 'Guardando...' : 'Crear Acceso'}
              </button>
            </form>
          </div>

          {/* Columna Derecha: Lista de Personal Activo */}
          <div
            style={{
              backgroundColor: '#1f1109',
              borderRadius: '16px',
              border: '2px solid #5c351e',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffcc00', fontWeight: '800', fontSize: '1rem' }}>
                <Users size={18} color="#e27329" />
                <span>Personal del Restaurante ({users.length})</span>
              </div>
              <button
                type="button"
                onClick={loadUsers}
                style={{
                  background: 'transparent',
                  border: '1px solid #5c351e',
                  color: '#c4a48c',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Actualizar
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', color: '#c4a48c', padding: '30px' }}>Cargando personal...</div>
              ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#c4a48c', padding: '30px' }}>No hay usuarios registrados</div>
              ) : (
                users.map((u) => {
                  const badge = getRoleBadge(u.role);
                  const isCurrent = u.id === currentUser?.id || u.username === currentUser?.username;

                  return (
                    <div
                      key={u.id || u.username}
                      style={{
                        backgroundColor: '#2b180d',
                        border: isCurrent ? '1.5px solid #ffcc00' : '1px solid #4a2816',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: badge.bg,
                            border: `1.5px solid ${badge.border}`,
                            color: badge.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: '900'
                          }}
                        >
                          {badge.icon}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '800', color: '#fff', fontSize: '0.9rem' }}>
                              {u.name}
                            </span>
                            {isCurrent && (
                              <span style={{ fontSize: '0.65rem', backgroundColor: '#e27329', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                                TÚ
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#c4a48c', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span>@{u.username}</span>
                            <span>•</span>
                            <span style={{ color: badge.color, fontWeight: '700' }}>{badge.label}</span>
                            <span>•</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>PIN: ****</span>
                          </div>
                        </div>
                      </div>

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          title="Eliminar usuario"
                          style={{
                            backgroundColor: 'rgba(244, 67, 54, 0.15)',
                            border: '1px solid #f44336',
                            color: '#ff8a80',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
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
            alignItems: 'center'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#5c351e',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
}
