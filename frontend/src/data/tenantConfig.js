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

export const DEFAULT_PIZZERIA = {
  id: 'pizzeria-napoles',
  nombre: 'Pizzería Nápoles',
  slogan: 'Auténtica pizza al horno de leña y pastas artesanales',
  logoEmoji: '🍕',
  colores: {
    primario: '#d32f2f',      // Rojo salsa napolitana
    secundario: '#ffcc00',    // Dorado queso fundido
    fondo: '#1a1008',         // Carbón de leña
    superficie: '#2b1a10'     // Madera cálida
  },
  numeroMesas: 10,
  telefono: '3109876543',
  direccion: 'Carrera 15 #80-10',
  whatsappDomiciliario: '3109876543'
};

export const INITIAL_TENANTS = [DEFAULT_TENANT, DEFAULT_PIZZERIA];

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

export const resolveTenantFromUrlOrStorage = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('empresa') || params.get('restaurante') || params.get('tenant');
    if (fromUrl) {
      const clean = fromUrl.trim().toLowerCase();
      localStorage.setItem('rosty_active_tenant_id', clean);
      return clean;
    }
    return localStorage.getItem('rosty_active_tenant_id') || 'rosty-broaster';
  } catch {
    return 'rosty-broaster';
  }
};

export const getStoredTenant = () => {
  try {
    const activeId = resolveTenantFromUrlOrStorage();
    const stored = localStorage.getItem(`rosty_tenant_${activeId}`);
    if (stored) return JSON.parse(stored);
    if (activeId === 'pizzeria-napoles') return DEFAULT_PIZZERIA;
    if (activeId === 'rosty-broaster') return DEFAULT_TENANT;
    return null;
  } catch {
    return DEFAULT_TENANT;
  }
};
