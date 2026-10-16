import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Store, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  LogOut, 
  Search, 
  Layers, 
  Users, 
  DollarSign, 
  UtensilsCrossed,
  MessageSquare,
  Phone,
  MapPin,
  RefreshCw,
  Palette,
  AlertTriangle,
  X
} from 'lucide-react';
import { api } from '../services/api.js';

export default function SuperAdminView({ onLogout, onSelectTenantToOpen }) {
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Modal para crear nueva empresa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTenant, setNewTenant] = useState({
    nombre: '',
    slogan: '',
    logoEmoji: '🍔',
    numeroMesas: 10,
    telefono: '',
    direccion: '',
    whatsappDomiciliario: '',
    adminName: 'Administrador',
    adminPin: 'admin123',
    colores: {
      primario: '#e53935',
      secundario: '#ffb300',
      fondo: '#1a1008',
      superficie: '#2c1810'
    }
  });

  const loadTenants = async () => {
    setIsLoading(true);
    setError('');
    try {
      const list = await api.getTenants();
      setTenants(list || []);
    } catch (err) {
      setError(err.message || 'Error al cargar las empresas registradas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleCopyLink = (tenantId) => {
    const origin = window.location.origin || 'http://localhost:5173';
    const link = `${origin}/?empresa=${tenantId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(tenantId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteTenant = async (tenant) => {
    const confirmName = window.prompt(
      `⚠️ ATENCIÓN: Esta acción eliminará permanentemente a "${tenant.nombre}" y todos sus usuarios, mesas y ventas.\n\nEscribe exactamente "${tenant.id}" para confirmar:`
    );

    if (confirmName !== tenant.id) {
      if (confirmName !== null) alert('El código no coincide. Operación cancelada.');
      return;
    }

    try {
      await api.deleteTenant(tenant.id);
      setTenants((prev) => prev.filter((t) => t.id !== tenant.id));
      alert(`Restaurante "${tenant.nombre}" eliminado exitosamente.`);
    } catch (err) {
      alert(err.message || 'Error al eliminar restaurante');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTenant.nombre.trim()) {
      alert('Por favor ingresa el nombre de la empresa o restaurante');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.createTenant({
        ...newTenant,
        numeroMesas: Number(newTenant.numeroMesas) || 10
      });
      alert(`¡Restaurante "${res.tenant.nombre}" registrado con éxito!\nCódigo de acceso: ${res.tenant.id}\nPIN de Admin: ${newTenant.adminPin}`);
      setIsModalOpen(false);
      setNewTenant({
        nombre: '',
        slogan: '',
        logoEmoji: '🍔',
        numeroMesas: 10,
        telefono: '',
        direccion: '',
        whatsappDomiciliario: '',
        adminName: 'Administrador',
        adminPin: 'admin123',
        colores: {
          primario: '#e53935',
          secundario: '#ffb300',
          fondo: '#1a1008',
          superficie: '#2c1810'
        }
      });
      loadTenants();
    } catch (err) {
      alert(err.message || 'Error al registrar la empresa');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    (t.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMesasGlobal = tenants.reduce((acc, t) => acc + (t.totalMesas || t.numeroMesas || 0), 0);
  const totalVentasGlobal = tenants.reduce((acc, t) => acc + (t.totalVentas || 0), 0);

  const EMOJI_OPTIONS = ['🐔', '🍕', '🍔', '🥩', '🌮', '🍣', '☕', '🍲', '🍰', '🍟', '🍻', '🍽️'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#140c06', color: '#fbeee0', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar Superadmin */}
      <header
        style={{
          backgroundColor: '#26140b',
          borderBottom: '3px solid #ff9800',
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff9800 0%, #e65100 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(255, 152, 0, 0.4)'
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#ffcc00', letterSpacing: '-0.5px' }}>
              Panel Global de Restaurantes
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#d7ccc8' }}>
              Plataforma Multi-Empresa • Control Maestro de Licencias & Tenants
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              backgroundColor: '#1b0e07',
              border: '1.5px solid #ff9800',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.825rem',
              fontWeight: '800',
              color: '#ffcc00',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4caf50', display: 'inline-block' }} />
            Superadmin Global
          </div>

          <button
            onClick={onLogout}
            style={{
              backgroundColor: '#c62828',
              color: '#fff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '28px' }}>
          <div style={{ backgroundColor: '#26140b', border: '1.5px solid #4a2815', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(255, 152, 0, 0.15)', border: '1.5px solid #ff9800', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9800' }}>
              <Store size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#d7ccc8', fontWeight: '700' }}>EMPRESAS REGISTRADAS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>{tenants.length}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#26140b', border: '1.5px solid #4a2815', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(33, 150, 243, 0.15)', border: '1.5px solid #2196f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2196f3' }}>
              <UtensilsCrossed size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#d7ccc8', fontWeight: '700' }}>TOTAL MESAS ACTIVAS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>{totalMesasGlobal}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#26140b', border: '1.5px solid #4a2815', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(76, 175, 80, 0.15)', border: '1.5px solid #4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4caf50' }}>
              <DollarSign size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#d7ccc8', fontWeight: '700' }}>VENTAS REGISTRADAS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#4caf50' }}>${totalVentasGlobal.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Actions & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={18} color="#ff9800" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre o código de empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#1f1008',
                border: '1.5px solid #4a2815',
                borderRadius: '12px',
                padding: '10px 14px 10px 42px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={loadTenants}
              title="Recargar datos"
              style={{
                backgroundColor: '#26140b',
                color: '#ffcc00',
                border: '1.5px solid #4a2815',
                borderRadius: '12px',
                padding: '10px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '700'
              }}
            >
              <RefreshCw size={16} /> Refrescar
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: '#2e7d32',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: '800',
                boxShadow: '0 4px 14px rgba(46, 125, 50, 0.4)'
              }}
            >
              <Plus size={18} /> + Registrar Nueva Empresa
            </button>
          </div>
        </div>

        {/* Tenant Cards Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ffcc00' }}>
            Cargando empresas registradas...
          </div>
        ) : error ? (
          <div style={{ backgroundColor: 'rgba(198, 40, 40, 0.2)', border: '2px solid #c62828', borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#ff8a80' }}>
            <AlertTriangle size={32} style={{ marginBottom: '8px' }} />
            <div>{error}</div>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div style={{ backgroundColor: '#26140b', border: '2px dashed #4a2815', borderRadius: '20px', padding: '50px 20px', textAlign: 'center', color: '#d7ccc8' }}>
            <Store size={48} color="#ff9800" style={{ marginBottom: '14px', opacity: 0.6 }} />
            <h3 style={{ margin: 0, color: '#ffcc00' }}>No se encontraron empresas</h3>
            <p style={{ margin: '8px 0 20px 0', fontSize: '0.9rem' }}>
              {searchTerm ? 'No hay coincidencias con tu búsqueda.' : 'Aún no has registrado ninguna empresa en la plataforma.'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
            >
              + Crear Primera Empresa
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '22px' }}>
            {filteredTenants.map((t) => {
              const primaryColor = t.colores?.primario || '#ff9800';
              const isCopied = copiedId === t.id;

              return (
                <div
                  key={t.id}
                  style={{
                    backgroundColor: '#26140b',
                    border: `2px solid ${primaryColor}`,
                    borderRadius: '20px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '18px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    position: 'relative'
                  }}
                >
                  {/* Card Header */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: `2px solid ${primaryColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '26px'
                          }}
                        >
                          {t.logoEmoji || '🍽️'}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>
                            {t.nombre}
                          </h3>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: '800',
                              backgroundColor: 'rgba(255, 152, 0, 0.2)',
                              color: '#ffb74d',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontFamily: 'monospace'
                            }}
                          >
                            ID: {t.id}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTenant(t)}
                        title="Eliminar esta empresa permanentemente"
                        style={{
                          backgroundColor: 'rgba(198, 40, 40, 0.15)',
                          border: '1px solid #c62828',
                          color: '#ff5252',
                          borderRadius: '8px',
                          padding: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p style={{ margin: '0 0 14px 0', fontSize: '0.825rem', color: '#d7ccc8', fontStyle: 'italic' }}>
                      "{t.slogan || 'Sin slogan'}"
                    </p>

                    {/* Datos Clave */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: '#1a0d06', padding: '12px', borderRadius: '12px', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: '#ffb74d', fontWeight: '700' }}>Mesas:</span> {t.totalMesas || t.numeroMesas || 10}
                      </div>
                      <div>
                        <span style={{ color: '#ffb74d', fontWeight: '700' }}>WhatsApp:</span> {t.whatsappDomiciliario || 'N/A'}
                      </div>
                      <div style={{ gridColumn: 'span 2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#ffb74d', fontWeight: '700' }}>Dir:</span> {t.direccion || 'Sin dirección registrada'}
                      </div>
                    </div>
                  </div>

                  {/* Enlace de Acceso Privado */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffcc00' }}>
                      🔗 Enlace Directo para el Restaurante:
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#140804',
                        border: '1px solid #4a2815',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      <span style={{ color: '#90caf9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                        {window.location.origin}/?empresa={t.id}
                      </span>
                      <button
                        onClick={() => handleCopyLink(t.id)}
                        style={{
                          backgroundColor: isCopied ? '#2e7d32' : '#3e2723',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        {isCopied ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>

                    {/* Botón de Abrir Restaurante */}
                    {onSelectTenantToOpen && (
                      <button
                        onClick={() => onSelectTenantToOpen(t)}
                        style={{
                          backgroundColor: primaryColor,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          marginTop: '4px'
                        }}
                      >
                        <ExternalLink size={15} /> Abrir Punto de Venta de {t.nombre}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Crear Nueva Empresa */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#26140b',
              border: '3px solid #ff9800',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '26px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '28px' }}>🏢</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#ffcc00' }}>
                    Registrar Nueva Empresa / Restaurante
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#d7ccc8' }}>
                    Crea una empresa totalmente aislada con su propio menú, mesas y personal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#d7ccc8', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffb74d' }}>Nombre del Restaurante *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Hamburguesas La Estación"
                    value={newTenant.nombre}
                    onChange={(e) => setNewTenant({ ...newTenant, nombre: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#1a0d06', border: '1.5px solid #4a2815', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffb74d' }}>Logo Emoji</label>
                  <select
                    value={newTenant.logoEmoji}
                    onChange={(e) => setNewTenant({ ...newTenant, logoEmoji: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#1a0d06', border: '1.5px solid #4a2815', borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
                  >
                    {EMOJI_OPTIONS.map((em) => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffb74d' }}>Slogan o Lema</label>
                <input
                  type="text"
                  placeholder="Ej: El auténtico sabor a la leña"
                  value={newTenant.slogan}
                  onChange={(e) => setNewTenant({ ...newTenant, slogan: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#1a0d06', border: '1.5px solid #4a2815', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffb74d' }}>Número de Mesas</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newTenant.numeroMesas}
                    onChange={(e) => setNewTenant({ ...newTenant, numeroMesas: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#1a0d06', border: '1.5px solid #4a2815', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffb74d' }}>WhatsApp Domicilios</label>
                  <input
                    type="text"
                    placeholder="3001234567"
                    value={newTenant.whatsappDomiciliario}
                    onChange={(e) => setNewTenant({ ...newTenant, whatsappDomiciliario: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#1a0d06', border: '1.5px solid #4a2815', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffb74d' }}>Color Principal</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={newTenant.colores.primario}
                      onChange={(e) => setNewTenant({ ...newTenant, colores: { ...newTenant.colores, primario: e.target.value } })}
                      style={{ width: '42px', height: '42px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{newTenant.colores.primario}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffb74d' }}>Dirección</label>
                  <input
                    type="text"
                    placeholder="Calle 10 #20-30"
                    value={newTenant.direccion}
                    onChange={(e) => setNewTenant({ ...newTenant, direccion: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#1a0d06', border: '1.5px solid #4a2815', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffb74d' }}>Teléfono Fijo / Móvil</label>
                  <input
                    type="text"
                    placeholder="6012345678"
                    value={newTenant.telefono}
                    onChange={(e) => setNewTenant({ ...newTenant, telefono: e.target.value })}
                    style={{ width: '100%', backgroundColor: '#1a0d06', border: '1.5px solid #4a2815', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Credenciales de Admin Inicial */}
              <div style={{ backgroundColor: '#1b0e07', border: '1.5px solid #ff9800', borderRadius: '14px', padding: '14px', marginTop: '6px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffcc00', marginBottom: '8px' }}>
                  🔑 Administrador Inicial del Restaurante
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#d7ccc8' }}>Nombre Administrador</label>
                    <input
                      type="text"
                      value={newTenant.adminName}
                      onChange={(e) => setNewTenant({ ...newTenant, adminName: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#26140b', border: '1px solid #4a2815', borderRadius: '8px', padding: '8px', color: '#fff', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#d7ccc8' }}>PIN Inicial de Acceso</label>
                    <input
                      type="text"
                      value={newTenant.adminPin}
                      onChange={(e) => setNewTenant({ ...newTenant, adminPin: e.target.value })}
                      style={{ width: '100%', backgroundColor: '#26140b', border: '1px solid #4a2815', borderRadius: '8px', padding: '8px', color: '#fff', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ backgroundColor: '#3e2723', color: '#d7ccc8', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontWeight: '800', cursor: 'pointer' }}
                >
                  {isCreating ? 'Registrando...' : 'Confirmar y Crear Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
