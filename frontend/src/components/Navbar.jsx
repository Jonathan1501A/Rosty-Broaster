import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  ChefHat, 
  BarChart3, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  LogOut, 
  Wifi, 
  WifiOff, 
  Clock,
  Settings,
  Users,
  DollarSign,
  Building2,
  Bike
} from 'lucide-react';
import { toggleSound, getSoundEnabled } from '../services/sound.js';

export default function Navbar({ 
  user, 
  tenant,
  activeTab, 
  setActiveTab, 
  onLogout, 
  onOpenPrivacy,
  onOpenSettings,
  onOpenUsers,
  onOpenMenu,
  onOpenCloseCash,
  isConnected,
  pendingOrdersCount = 0,
  pendingDeliveriesCount = 0
}) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [soundOn, setSoundOn] = useState(() => getSoundEnabled());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const role = user?.role || 'waiter';

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface, #3d2314)',
        borderBottom: '3px solid var(--brand-primary, #e27329)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 6px 18px rgba(0,0,0,0.5)'
      }}
    >
      {/* Brand & Connection State Dinámico según Restaurante */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-gold, #ffcc00) 0%, var(--brand-primary, #e27329) 100%)',
              border: '2px solid var(--brand-gold, #ffcc00)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
              flexShrink: 0
            }}
          >
            {tenant?.logoEmoji || '🍽️'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--brand-gold, #ffcc00)', letterSpacing: '-0.5px' }}>
                {tenant?.nombre || 'Restaurante'}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#fbeee0', fontWeight: '700', letterSpacing: '0.5px' }}>
              {tenant?.slogan || 'Sistema POS & Cocina'}
            </div>
          </div>
        </div>

        {/* Live WebSocket Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isConnected ? 'rgba(46, 125, 50, 0.3)' : 'rgba(198, 40, 40, 0.3)',
            border: `1.5px solid ${isConnected ? '#2e7d32' : '#c62828'}`,
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: '800',
            color: isConnected ? '#a5d6a7' : '#ff8a80'
          }}
        >
          {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isConnected ? 'En Línea' : 'Reconectando...'}</span>
        </div>
      </div>

      {/* Control Estricto de Roles (RBAC en Navegación) */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {role === 'waiter' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('tables')}
              style={{
                backgroundColor: activeTab === 'tables' ? 'var(--brand-primary, #e27329)' : '#2b180d',
                color: activeTab === 'tables' ? '#fff' : '#fbeee0',
                padding: '7px 14px',
                borderRadius: '10px',
                border: activeTab === 'tables' ? '1.5px solid var(--brand-gold, #ffcc00)' : '1.5px solid #5c351e',
                fontSize: '0.825rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <UtensilsCrossed size={16} />
              <span>Salón / Mesas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('deliveries')}
              style={{
                backgroundColor: activeTab === 'deliveries' ? '#0288d1' : '#2b180d',
                color: activeTab === 'deliveries' ? '#fff' : '#fbeee0',
                padding: '7px 14px',
                borderRadius: '10px',
                border: activeTab === 'deliveries' ? '1.5px solid #4fc3f7' : '1.5px solid #5c351e',
                fontSize: '0.825rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Bike size={16} />
              <span>Domicilios</span>
              {pendingDeliveriesCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#e27329',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: '900',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    marginLeft: '2px'
                  }}
                >
                  {pendingDeliveriesCount}
                </span>
              )}
            </button>
          </div>
        )}

        {role === 'chef' && (
          <div
            style={{
              backgroundColor: '#2b180d',
              border: '1.5px solid #2e7d32',
              color: '#a5d6a7',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '800',
              fontSize: '0.85rem'
            }}
          >
            <ChefHat size={18} color="#2e7d32" />
            <span>MONITOR DE COCINA (KDS)</span>
            {pendingOrdersCount > 0 && (
              <span
                style={{
                  backgroundColor: '#c62828',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: '900',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  marginLeft: '4px'
                }}
              >
                {pendingOrdersCount} pendientes
              </span>
            )}
          </div>
        )}

        {role === 'admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* Vistas operativas */}
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              style={{
                backgroundColor: activeTab === 'reports' ? '#e27329' : '#2b180d',
                color: activeTab === 'reports' ? '#fff' : '#fbeee0',
                padding: '7px 13px',
                borderRadius: '10px',
                border: activeTab === 'reports' ? '1.5px solid #ffcc00' : '1.5px solid #5c351e',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <BarChart3 size={15} />
              <span>Auditoría</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tables')}
              style={{
                backgroundColor: activeTab === 'tables' ? '#e27329' : '#2b180d',
                color: activeTab === 'tables' ? '#fff' : '#fbeee0',
                padding: '7px 13px',
                borderRadius: '10px',
                border: activeTab === 'tables' ? '1.5px solid #ffcc00' : '1.5px solid #5c351e',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <UtensilsCrossed size={15} />
              <span>Mesas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('deliveries')}
              style={{
                backgroundColor: activeTab === 'deliveries' ? '#0288d1' : '#2b180d',
                color: activeTab === 'deliveries' ? '#fff' : '#fbeee0',
                padding: '7px 13px',
                borderRadius: '10px',
                border: activeTab === 'deliveries' ? '1.5px solid #4fc3f7' : '1.5px solid #5c351e',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Bike size={15} />
              <span>Domicilios</span>
              {pendingDeliveriesCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#e27329',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: '900',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    marginLeft: '2px'
                  }}
                >
                  {pendingDeliveriesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kitchen')}
              style={{
                backgroundColor: activeTab === 'kitchen' ? '#2e7d32' : '#2b180d',
                color: activeTab === 'kitchen' ? '#fff' : '#fbeee0',
                padding: '7px 13px',
                borderRadius: '10px',
                border: activeTab === 'kitchen' ? '1.5px solid #81c784' : '1.5px solid #5c351e',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <ChefHat size={15} />
              <span>Cocina</span>
            </button>

            {/* Separador */}
            <div style={{ width: '1px', height: '24px', backgroundColor: '#5c351e', margin: '0 4px' }} />

            {/* Herramientas de Administración del Restaurante */}
            <button
              type="button"
              onClick={onOpenSettings}
              title="Personalizar restaurante: colores, nombre, mesas y domicilios"
              style={{
                backgroundColor: '#2b180d',
                color: '#ffcc00',
                border: '1.5px solid #ffcc00',
                padding: '7px 12px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Settings size={15} />
              <span>Ajustes</span>
            </button>

            <button
              type="button"
              onClick={onOpenMenu}
              title="Administrar productos, categorías y precios del menú"
              style={{
                backgroundColor: '#2b180d',
                color: '#ffcc00',
                border: '1.5px solid #e27329',
                padding: '7px 12px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <UtensilsCrossed size={15} />
              <span>Menú</span>
            </button>

            <button
              type="button"
              onClick={onOpenUsers}
              title="Gestionar empleados y contraseñas PIN"
              style={{
                backgroundColor: '#2b180d',
                color: '#ffcc00',
                border: '1.5px solid #0288d1',
                padding: '7px 12px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Users size={15} />
              <span>Personal</span>
            </button>

            <button
              type="button"
              onClick={onOpenCloseCash}
              title="Realizar Cierre de Caja del Día (Corte Z) y reiniciar ventas"
              style={{
                backgroundColor: 'rgba(46, 125, 50, 0.25)',
                color: '#81c784',
                border: '1.5px solid #2e7d32',
                padding: '7px 12px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <DollarSign size={15} />
              <span>Cerrar Caja</span>
            </button>
          </div>
        )}
      </nav>

      {/* Right Controls: Clock, Sound, Privacy, User & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Real-time Clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#2b180d',
            border: '1px solid #5c351e',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.78rem',
            fontWeight: '700',
            color: '#ffcc00',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <Clock size={13} color="#e27329" />
          <span>{formatTime(currentTime)}</span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={handleSoundToggle}
          title={soundOn ? 'Sonido de comandas activado' : 'Sonido silenciado'}
          style={{
            backgroundColor: soundOn ? 'rgba(255, 204, 0, 0.2)' : '#2b180d',
            color: soundOn ? '#ffcc00' : '#c4a48c',
            border: '1px solid #5c351e',
            padding: '8px',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Normas & Privacidad Button */}
        <button
          onClick={onOpenPrivacy}
          title="Ver normativas de seguridad y datos"
          style={{
            backgroundColor: 'rgba(226, 115, 41, 0.15)',
            color: '#ffcc00',
            border: '1px solid #e27329',
            padding: '7px 10px',
            borderRadius: '10px',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer'
          }}
        >
          <ShieldCheck size={15} />
          <span>Normativa</span>
        </button>

        {/* User Pill - Estricto e Inalterable sin Logout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#2b180d',
            border: '1.5px solid #5c351e',
            padding: '6px 12px',
            borderRadius: '10px'
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: role === 'chef' ? '#2e7d32' : role === 'admin' ? '#0288d1' : '#e27329',
              boxShadow: '0 0 8px currentColor'
            }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ffffff' }}>
            {user?.name || user?.username || 'Personal'}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: '800',
              backgroundColor: role === 'chef' ? 'rgba(46,125,50,0.3)' : role === 'admin' ? 'rgba(2,136,209,0.3)' : 'rgba(226,115,41,0.3)',
              color: role === 'chef' ? '#81c784' : role === 'admin' ? '#4fc3f7' : '#ffb74d',
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}
          >
            {role === 'chef' ? 'Cocina' : role === 'admin' ? 'Admin' : 'Mesero'}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Cerrar turno de trabajo"
          style={{
            backgroundColor: '#c62828',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.825rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <LogOut size={16} />
          <span>Cerrar Turno</span>
        </button>
      </div>
    </header>
  );
}
