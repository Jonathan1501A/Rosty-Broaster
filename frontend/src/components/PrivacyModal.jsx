import React from 'react';
import { ShieldCheck, Lock, Check, X, Server, Scale } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
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
          backgroundColor: '#2b180d',
          border: '2px solid #e27329',
          borderRadius: '20px',
          maxWidth: '740px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#3d2314',
            borderBottom: '2px solid #5c351e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                backgroundColor: 'rgba(46, 125, 50, 0.25)',
                border: '2px solid #2e7d32',
                color: '#a5d6a7',
                padding: '10px',
                borderRadius: '12px',
                display: 'flex'
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                Cumplimiento Legal, Normativas y Seguridad
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#fbeee0', margin: 0 }}>
                Políticas de Datos Personales (Habeas Data Ley 1581) y Estándares de Publicación
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#2b180d',
              color: '#fbeee0',
              border: '1px solid #5c351e',
              padding: '6px 10px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            fontSize: '0.9rem',
            color: '#fbeee0',
            lineHeight: 1.6
          }}
        >
          {/* Tarjeta 1: Habeas Data */}
          <div
            style={{
              backgroundColor: '#3d2314',
              borderRadius: '14px',
              padding: '18px',
              border: '1.5px solid #5c351e'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#ffcc00' }}>
              <Scale size={20} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: 0, color: '#ffcc00' }}>
                1. Política de Tratamiento de Datos Personales (Ley 1581 / Habeas Data)
              </h3>
            </div>
            <p style={{ margin: 0, color: '#fbeee0' }}>
              En cumplimiento del Régimen General de Protección de Datos Personales, <strong>ROSTY Broaster</strong> informa
              que los datos de clientes capturados en este software (nombre, teléfono de contacto y dirección para entrega de domicilios)
              se utilizan exclusivamente con el fin de gestionar la entrega, facturación y soporte del pedido gastronómico en curso.
            </p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#c4a48c', fontSize: '0.85rem' }}>
              <li>Los datos nunca son comercializados ni compartidos con empresas externas de publicidad.</li>
              <li>El titular puede solicitar la eliminación, actualización o rectificación de su historial en cualquier momento.</li>
              <li>Finalidad operativa limitada estrictamente a la prestación del servicio de restaurante.</li>
            </ul>
          </div>

          {/* Tarjeta 2: Criptografía y Seguridad */}
          <div
            style={{
              backgroundColor: '#3d2314',
              borderRadius: '14px',
              padding: '18px',
              border: '1.5px solid #5c351e'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#ffcc00' }}>
              <Lock size={20} color="#e27329" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: 0, color: '#ffcc00' }}>
                2. Arquitectura de Seguridad Técnica para Producción
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
              <div style={{ backgroundColor: '#2b180d', padding: '12px', borderRadius: '10px', border: '1px solid #52301c' }}>
                <strong style={{ color: '#ffcc00', display: 'block', fontSize: '0.85rem' }}>🔐 Hashing con Bcrypt:</strong>
                <span style={{ fontSize: '0.8rem', color: '#c4a48c' }}>Ninguna contraseña se almacena ni transmite en texto plano.</span>
              </div>
              <div style={{ backgroundColor: '#2b180d', padding: '12px', borderRadius: '10px', border: '1px solid #52301c' }}>
                <strong style={{ color: '#ffcc00', display: 'block', fontSize: '0.85rem' }}>🛡️ Tokens JWT Seguros:</strong>
                <span style={{ fontSize: '0.8rem', color: '#c4a48c' }}>Autenticación sin estado con expiración controlada por rol.</span>
              </div>
              <div style={{ backgroundColor: '#2b180d', padding: '12px', borderRadius: '10px', border: '1px solid #52301c' }}>
                <strong style={{ color: '#ffcc00', display: 'block', fontSize: '0.85rem' }}>🛑 Rate Limiting & DoS:</strong>
                <span style={{ fontSize: '0.8rem', color: '#c4a48c' }}>Protección activa contra ataques de fuerza bruta al login y spam.</span>
              </div>
              <div style={{ backgroundColor: '#2b180d', padding: '12px', borderRadius: '10px', border: '1px solid #52301c' }}>
                <strong style={{ color: '#ffcc00', display: 'block', fontSize: '0.85rem' }}>🌐 Cabeceras Helmet & CSP:</strong>
                <span style={{ fontSize: '0.8rem', color: '#c4a48c' }}>Mitigación estricta de XSS, sniffing de MIME y clickjacking.</span>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Auditoría y Facturación */}
          <div
            style={{
              backgroundColor: '#3d2314',
              borderRadius: '14px',
              padding: '18px',
              border: '1.5px solid #5c351e'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#a5d6a7' }}>
              <Server size={20} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: 0, color: '#a5d6a7' }}>
                3. Trazabilidad Contable y Auditoría
              </h3>
            </div>
            <p style={{ margin: 0, color: '#fbeee0' }}>
              Cada comanda despachada y mesa cobrada genera un registro inmutable con número de comprobante,
              fecha/hora, desglose de ítems, método de pago seleccionado y usuario que ejecutó la operación,
              garantizando total transparencia contable y operativa para inspecciones o auditorías.
            </p>
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
            gap: '12px'
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#e27329',
              color: '#fff',
              padding: '11px 24px',
              borderRadius: '10px',
              fontWeight: '900',
              boxShadow: '0 4px 14px rgba(226, 115, 41, 0.4)'
            }}
          >
            <Check size={18} /> Entendido y Conforme
          </button>
        </div>
      </div>
    </div>
  );
}
