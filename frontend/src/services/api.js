const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getActiveTenantId = () => {
  try {
    const stored = localStorage.getItem('rosty_active_tenant_id');
    return stored || 'rosty-broaster';
  } catch {
    return 'rosty-broaster';
  }
};

const getHeaders = (overrideTenantId) => {
  const token = localStorage.getItem('rosty_auth_token');
  const tenantId = overrideTenantId || getActiveTenantId();
  const headers = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Autenticación Multi-Tenant y Superadmin
  login: async (identifier, pin, empresaId = 'rosty-broaster') => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: identifier, 
        role: identifier, 
        pin, 
        empresaId 
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }
    if (data.token) {
      localStorage.setItem('rosty_auth_token', data.token);
      localStorage.setItem('rosty_auth_user', JSON.stringify(data.user));
      if (empresaId && empresaId !== 'global') {
        localStorage.setItem('rosty_active_tenant_id', empresaId);
        if (data.empresa) {
          localStorage.setItem(`rosty_tenant_${empresaId}`, JSON.stringify(data.empresa));
        }
      }
    }
    return data;
  },

  loginSuperadmin: async (username, password) => {
    return api.login(username, password, 'global');
  },

  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem('rosty_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('rosty_auth_token');
    localStorage.removeItem('rosty_auth_user');
  },

  // Gestión de Empresas (Tenants) - Protegido Superadmin
  getTenants: async () => {
    const res = await fetch(`${API_URL}/api/tenants`, {
      headers: getHeaders('global')
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al listar empresas');
    }
    const data = await res.json();
    return data.tenants;
  },

  createTenant: async (tenantData) => {
    const res = await fetch(`${API_URL}/api/tenants`, {
      method: 'POST',
      headers: getHeaders('global'),
      body: JSON.stringify(tenantData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear la empresa');
    return data;
  },

  deleteTenant: async (tenantId) => {
    const res = await fetch(`${API_URL}/api/tenants/${tenantId}`, {
      method: 'DELETE',
      headers: getHeaders('global')
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar restaurante');
    return data;
  },

  updateTenantStatus: async (tenantId, estado) => {
    const res = await fetch(`${API_URL}/api/tenants/${tenantId}/status`, {
      method: 'PUT',
      headers: getHeaders('global'),
      body: JSON.stringify({ estado })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cambiar estado del restaurante');
    return data;
  },

  updateTenantAdmin: async (tenantId, adminData) => {
    const res = await fetch(`${API_URL}/api/tenants/${tenantId}/admin`, {
      method: 'PUT',
      headers: getHeaders('global'),
      body: JSON.stringify(adminData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar el administrador');
    return data.admin;
  },

  sendSuperadminNotification: async ({ tenantId, title, message, type }) => {
    const res = await fetch(`${API_URL}/api/tenants/notify`, {
      method: 'POST',
      headers: getHeaders('global'),
      body: JSON.stringify({ tenantId, title, message, type })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al enviar notificación');
    return data;
  },

  getTenant: async (tenantId) => {
    const res = await fetch(`${API_URL}/api/tenants/${tenantId}`);
    if (!res.ok) throw new Error('Restaurante no encontrado');
    const data = await res.json();
    return data.tenant;
  },

  updateTenantConfig: async (tenantId, config) => {
    const res = await fetch(`${API_URL}/api/tenants/${tenantId}/config`, {
      method: 'PUT',
      headers: getHeaders(tenantId),
      body: JSON.stringify(config)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar configuración');
    return data.tenant;
  },

  updateTenantMenu: async (tenantId, menu) => {
    const res = await fetch(`${API_URL}/api/tenants/${tenantId}/menu`, {
      method: 'PUT',
      headers: getHeaders(tenantId),
      body: JSON.stringify({ menu })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar menú');
    return data.menu;
  },

  // Personal y Usuarios por Empresa
  getTenantUsers: async (tenantId) => {
    const res = await fetch(`${API_URL}/api/tenants/${tenantId}/users`, {
      headers: getHeaders(tenantId)
    });
    if (!res.ok) throw new Error('Error al listar usuarios');
    const data = await res.json();
    return data.users;
  },

  createTenantUser: async (tenantId, userData) => {
    const res = await fetch(`${API_URL}/api/tenants/${tenantId}/users`, {
      method: 'POST',
      headers: getHeaders(tenantId),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear usuario');
    return data.user;
  },

  deleteTenantUser: async (tenantId, userId) => {
    const res = await fetch(`${API_URL}/api/tenants/${tenantId}/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(tenantId)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
    return data;
  },

  // Cierre de Caja del Día (Corte Z)
  closeCashRegister: async (tenantId, closureData) => {
    const res = await fetch(`${API_URL}/api/tenants/${tenantId}/close-cash`, {
      method: 'POST',
      headers: getHeaders(tenantId),
      body: JSON.stringify(closureData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cerrar caja');
    return data.closure;
  },

  // Mesas
  getTables: async (tenantId) => {
    const res = await fetch(`${API_URL}/api/tables`, { headers: getHeaders(tenantId) });
    if (!res.ok) throw new Error('Error al cargar mesas');
    const data = await res.json();
    return data.tables;
  },

  closeTable: async (numero, payload, tenantId) => {
    const res = await fetch(`${API_URL}/api/tables/${numero}/close`, {
      method: 'POST',
      headers: getHeaders(tenantId),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cerrar mesa');
    return data;
  },

  // Órdenes
  getOrders: async (params = {}, tenantId) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/orders${query ? `?${query}` : ''}`, {
      headers: getHeaders(tenantId)
    });
    if (!res.ok) throw new Error('Error al consultar órdenes');
    const data = await res.json();
    return data.orders;
  },

  createOrder: async (orderData, tenantId) => {
    const targetTenant = tenantId || orderData?.tenantId || orderData?.empresaId || getActiveTenantId();
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: getHeaders(targetTenant),
      body: JSON.stringify({ ...orderData, tenantId: targetTenant })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear la comanda');
    return data.order;
  },

  updateOrderStatus: async (orderId, estado, tenantId) => {
    const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getHeaders(tenantId),
      body: JSON.stringify({ estado })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar comanda');
    return data.order;
  },

  toggleOrderItem: async (orderId, itemId, tenantId) => {
    const res = await fetch(`${API_URL}/api/orders/${orderId}/items/${itemId}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(tenantId)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar ítem');
    return data.order;
  },

  // Métricas y Auditoría
  getStats: async (tenantId) => {
    const res = await fetch(`${API_URL}/api/stats`, { headers: getHeaders(tenantId) });
    if (!res.ok) throw new Error('Error al cargar métricas');
    const data = await res.json();
    return data.stats;
  },

  // Estado del servidor y normativas
  getHealth: async () => {
    const res = await fetch(`${API_URL}/api/health`);
    if (!res.ok) throw new Error('Servidor fuera de línea');
    return res.json();
  }
};
