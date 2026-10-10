import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px',
        width: '100%',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isWarning = t.type === 'warning';

        const borderColor = isSuccess ? '#2e7d32' : isError ? '#c62828' : isWarning ? '#ffcc00' : '#e27329';
        const iconColor = borderColor;

        return (
          <div
            key={t.id}
            className="animate-fade-in"
            style={{
              pointerEvents: 'auto',
              backgroundColor: '#3d2314',
              borderLeft: `5px solid ${borderColor}`,
              borderTop: '1.5px solid #5c351e',
              borderRight: '1.5px solid #5c351e',
              borderBottom: '1.5px solid #5c351e',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              color: '#fbeee0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isSuccess && <CheckCircle2 size={22} color={iconColor} />}
              {isError && <XCircle size={22} color={iconColor} />}
              {isWarning && <AlertTriangle size={22} color={iconColor} />}
              {!isSuccess && !isError && !isWarning && <Info size={22} color={iconColor} />}
              <div>
                {t.title && <div style={{ fontWeight: '900', fontSize: '0.925rem', color: '#ffcc00' }}>{t.title}</div>}
                <div style={{ fontSize: '0.85rem', color: '#fbeee0', fontWeight: '600' }}>{t.message}</div>
              </div>
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#c4a48c',
                padding: '4px',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
