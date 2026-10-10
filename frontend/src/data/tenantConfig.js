export const DEFAULT_TENANT = {
  id: 'rosty-broaster',
  nombre: 'ROSTY Broaster',
  slogan: 'El Original V. - El mejor pollo al estilo americano',
  logoEmoji: '🐔',
  colores: {
    primario: '#e27329',      // Naranja brasa
    secundario: '#ffcc00',    // Dorado
    fondo: '#1f1109',         // Chocolate oscuro
    superficie: '#3d2314'     // Café tostado
  },
  numeroMesas: 14,
  telefono: '3227801140',
  direccion: 'Calle 5 #10-20',
  whatsappDomiciliario: '3227801140'
};

export const applyTenantTheme = (tenant) => {
  if (!tenant || !tenant.colores) return;

  const root = document.documentElement;
  const { primario, secundario, fondo, superficie } = tenant.colores;

  if (primario) {
    root.style.setProperty('--brand-primary', primario);
    root.style.setProperty('--border-focus', primario);
    root.style.setProperty('--status-occupied', primario);
  }
  if (secundario) {
    root.style.setProperty('--brand-gold', secundario);
    root.style.setProperty('--text-gold', secundario);
  }
  if (fondo) {
    root.style.setProperty('--bg-app', fondo);
    document.body.style.backgroundColor = fondo;
  }
  if (superficie) {
    root.style.setProperty('--bg-surface-elevated', superficie);
    root.style.setProperty('--bg-surface', superficie);
  }
};

export const getStoredTenant = () => {
  try {
    const activeId = localStorage.getItem('rosty_active_tenant_id') || DEFAULT_TENANT.id;
    const stored = localStorage.getItem(`rosty_tenant_${activeId}`);
    return stored ? JSON.parse(stored) : DEFAULT_TENANT;
  } catch {
    return DEFAULT_TENANT;
  }
};
