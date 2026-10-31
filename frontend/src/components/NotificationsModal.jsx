import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Send, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  Clock,
  User,
  Plus
} from 'lucide-react';

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications = [],
  currentUser,
  tenant,
  onMarkRead,
  onMarkAllRead,
  onCreateNotification,
  onDeleteNotification
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal'); // 'normal' | 'alta' | 'urgente'
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentUserId = currentUser?.id || currentUser?.username || 'user';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  const unreadCount = notifications.filter(
    (n) => !Array.isArray(n.leidoPor) || !n.leidoPor.includes(currentUserId)
  ).length;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Por favor ingresa el mensaje de la notificación.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateNotification({
        titulo: title.trim() || 'Aviso de Administración General',
        mensaje: message.trim(),
        prioridad: priority,
        creadoPor: currentUser?.name || currentUser?.username || 'Administración General'
      });
      setTitle('');
      setMessage('');
      setPriority('normal');
      setShowCreateForm(false);
    } catch (err) {
      alert(err.message || 'Error al emitir notificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgente':
        return (
          <span style={{ backgroundColor: 'rgba(198, 40, 40, 0.35)', color: '#ff8a80', border: '1px solid #c62828', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} /> URGENTE
          </span>
        );
      case 'alta':
        return (
          <span style={{ backgroundColor: 'rgba(255, 204, 0, 0.25)', color: '#ffcc00', border: '1px solid #ffcc00', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={12} /> IMPORTANTE
          </span>
        );
      default:
        return (
          <span style={{ backgroundColor: 'rgba(2, 136, 209, 0.25)', color: '#4fc3f7', border: '1px solid #0288d1', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={12} /> INFORMATIVA
          </span>
        );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(5px)',
        zIndex: 10030,
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
          maxWidth: '560px',
          maxHeight: '88vh',
          backgroundColor: '#26160c',
          border: '2.5px solid #ffcc00',
          borderRadius: '22px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95)'
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
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 204, 0, 0.2)',
                border: '1.5px solid #ffcc00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffcc00'
              }}
            >
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ffcc00', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Notificaciones Oficiales
                {unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: '#e27329',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: '900',
                      padding: '2px 8px',
                      borderRadius: '999px'
                    }}
                  >
                    {unreadCount} nuevas
                  </span>
                )}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#fbeee0', margin: 0 }}>
                Circulares y avisos de la Administración General
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unreadCount > 0 && onMarkAllRead && (
              <button
                type="button"
                onClick={() => onMarkAllRead(currentUserId)}
                title="Marcar todas como leídas"
                style={{
                  backgroundColor: '#2b180d',
                  border: '1px solid #5c351e',
                  color: '#81c784',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={14} /> Leídas
              </button>
            )}

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
        </div>

        {/* Admin Compose Bar */}
        {isAdmin && (
          <div
            style={{
              padding: '10px 18px',
              backgroundColor: '#2e190e',
              borderBottom: '1px solid #52301c',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '0.78rem', color: '#c4a48c', fontWeight: '700' }}>
              Herramienta de Administración:
            </span>
            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                backgroundColor: showCreateForm ? '#491212' : '#e27329',
                border: '1px solid #ffcc00',
                color: '#ffffff',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              {showCreateForm ? <X size={14} /> : <Plus size={14} />}
              {showCreateForm ? 'Cancelar' : 'Publicar Nuevo Aviso'}
            </button>
          </div>
        )}

        {/* Compose Form */}
        {showCreateForm && isAdmin && (
          <form
            onSubmit={handleCreate}
            style={{
              padding: '16px 20px',
              backgroundColor: '#341e11',
              borderBottom: '2px solid #e27329',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#c4a48c', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Título del Aviso:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Directriz de cocina / Turno festivo"
                  style={{
                    width: '100%',
                    backgroundColor: '#1f1109',
                    border: '1.5px solid #52301c',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '0.825rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#c4a48c', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Prioridad:
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#1f1109',
                    border: '1.5px solid #52301c',
                    color: '#ffcc00',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '0.825rem',
                    fontWeight: '800'
                  }}
                >
                  <option value="normal">Informativa 🔵</option>
                  <option value="alta">Importante 🟡</option>
                  <option value="urgente">Urgente 🔴</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#c4a48c', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>
                Mensaje a todo el personal:
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe las instrucciones o comunicado general aquí..."
                required
                style={{
                  width: '100%',
                  backgroundColor: '#1f1109',
                  border: '1.5px solid #52301c',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '0.825rem',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#2e7d32',
                  border: '1.5px solid #81c784',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Send size={14} /> {isSubmitting ? 'Transmitiendo...' : 'Transmitir Notificación'}
              </button>
            </div>
          </form>
        )}

        {/* Notifications List */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#c4a48c' }}>
              <Bell size={36} color="#5c351e" style={{ margin: '0 auto 10px auto', display: 'block' }} />
              <div style={{ fontWeight: '800', color: '#ffcc00', fontSize: '0.95rem' }}>
                Bandeja de avisos al día
              </div>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                No hay comunicados pendientes de la administración en este momento.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = Array.isArray(n.leidoPor) && n.leidoPor.includes(currentUserId);
              const fechaFormat = new Date(n.fecha).toLocaleString('es-CO', {
                dateStyle: 'short',
                timeStyle: 'short'
              });

              return (
                <div
                  key={n.id}
                  style={{
                    backgroundColor: isRead ? '#341e11' : '#3d2314',
                    border: isRead ? '1.5px solid #52301c' : '2px solid #e27329',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: isRead ? 'none' : '0 4px 14px rgba(226, 115, 41, 0.25)',
                    position: 'relative'
                  }}
                >
                  {/* Top Bar of Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {getPriorityBadge(n.prioridad)}
                      <span style={{ fontSize: '0.72rem', color: '#c4a48c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {fechaFormat}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {!isRead && onMarkRead && (
                        <button
                          type="button"
                          onClick={() => onMarkRead(n.id, currentUserId)}
                          title="Marcar como leída"
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #5c351e',
                            color: '#a5d6a7',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          Marcar leída
                        </button>
                      )}

                      {isAdmin && onDeleteNotification && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('¿Deseas eliminar este comunicado de forma permanente?')) {
                              onDeleteNotification(n.id);
                            }
                          }}
                          title="Eliminar comunicado"
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#ff8a80',
                            padding: '4px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div style={{ fontSize: '0.95rem', fontWeight: '900', color: isRead ? '#fbeee0' : '#ffcc00' }}>
                    {n.titulo}
                  </div>

                  {/* Message Content */}
                  <div style={{ fontSize: '0.85rem', color: '#ffffff', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                    {n.mensaje}
                  </div>

                  {/* Footer Author */}
                  <div style={{ fontSize: '0.72rem', color: '#c4a48c', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <User size={12} color="#e27329" />
                    <span>Emitido por: <strong>{n.creadoPor || 'Administración'}</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#3d2314',
            borderTop: '1.5px solid #5c351e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#c4a48c' }}>
            {notifications.length} avisos archivados
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: '#2b180d',
              border: '1.5px solid #5c351e',
              color: '#fbeee0',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.825rem'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
