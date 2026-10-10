import bcrypt from 'bcryptjs';
import { DEFAULT_MENU } from './defaultMenu.js';

// Empresa insignia por defecto: ROSTY Broaster
const DEFAULT_TENANT_ID = 'rosty-broaster';

const INITIAL_ROSTY_CONFIG = {
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

const INITIAL_ROSTY_USERS = [
  {
    id: 'u-rosty-waiter',
    empresaId: 'rosty-broaster',
    username: 'waiter',
    pinHash: bcrypt.hashSync('rosty123', 10),
    name: 'Mesero Salón & Caja',
    role: 'waiter'
  },
  {
    id: 'u-rosty-chef',
    empresaId: 'rosty-broaster',
    username: 'chef',
    pinHash: bcrypt.hashSync('cocina123', 10),
    name: 'Jefe de Cocina (KDS)',
    role: 'chef'
  },
  {
    id: 'u-rosty-admin',
    empresaId: 'rosty-broaster',
    username: 'admin',
    pinHash: bcrypt.hashSync('admin123', 10),
    name: 'Administración & Auditoría',
    role: 'admin'
  }
];

const createTablesArray = (count = 14) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    capacidad: 4,
    estado: i === 2 ? 'ocupada' : i === 6 ? 'ocupada' : i === 8 ? 'cuenta' : 'libre',
    apertura: i === 2 ? new Date(Date.now() - 25 * 60000).toISOString() : null,
    pedidoActual:
      i === 2
        ? [
            { id: 103, name: '1 Pollo + Yuca + Arepa', price: 38000, cantidad: 1 },
            { id: 703, name: 'Gaseosa Familiar 1.5L', price: 7000, cantidad: 1 }
          ]
        : i === 6
          ? [{ id: 405, name: 'Combo 1 Chow Fan (400 gr + 1/4 Pollo)', price: 25000, cantidad: 1 }]
          : []
  }));
};

class Store {
  constructor() {
    this.tenants = [
      {
        ...INITIAL_ROSTY_CONFIG,
        menu: JSON.parse(JSON.stringify(DEFAULT_MENU)),
        tables: createTablesArray(14),
        orders: [
          {
            id: 'ORD-201',
            empresaId: 'rosty-broaster',
            tipo: 'dine_in',
            destino: 'Mesa 3',
            cliente: 'Salón',
            datosExtra: 'Puestos: 4',
            items: [
              { id: 103, name: '1 Pollo + Yuca + Arepa', price: 38000, cantidad: 1, completado: true },
              { id: 703, name: 'Gaseosa Familiar 1.5L', price: 7000, cantidad: 1, completado: false }
            ],
            total: 45000,
            estado: 'En preparación',
            createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
            minutos: 10,
            limite: 15
          },
          {
            id: 'ORD-202',
            empresaId: 'rosty-broaster',
            tipo: 'delivery',
            destino: 'Calle 5 #10-20',
            cliente: 'Diego Arévalo',
            datosExtra: 'Tel: 3227801140',
            items: [
              { id: 405, name: 'Combo 1 Chow Fan (400 gr + 1/4 Pollo)', price: 25000, cantidad: 1, completado: false }
            ],
            total: 25000,
            estado: 'En preparación',
            createdAt: new Date(Date.now() - 17 * 60000).toISOString(),
            minutos: 17,
            limite: 20
          },
          {
            id: 'ORD-203',
            empresaId: 'rosty-broaster',
            tipo: 'takeout',
            destino: 'Recoge en Barra',
            cliente: 'Luz Marina',
            datosExtra: 'Para llevar',
            items: [
              { id: 103, name: '1 Pollo + Yuca + Arepa', price: 38000, cantidad: 1, completado: true }
            ],
            total: 38000,
            estado: 'Listo',
            createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
            minutos: 3,
            limite: 15
          }
        ],
        salesHistory: [
          {
            id: 'REC-1001',
            ordenId: 'ORD-198',
            destino: 'Mesa 1',
            cliente: 'Salón',
            total: 58000,
            metodoPago: 'efectivo',
            montoRecibido: 60000,
            cambio: 2000,
            despachadoPor: 'waiter',
            timestamp: new Date(Date.now() - 120 * 60000).toISOString()
          },
          {
            id: 'REC-1002',
            ordenId: 'ORD-199',
            destino: 'Cra 12 #4-15',
            cliente: 'Carlos Peña',
            total: 47000,
            metodoPago: 'nequi',
            montoRecibido: 47000,
            cambio: 0,
            despachadoPor: 'waiter',
            timestamp: new Date(Date.now() - 85 * 60000).toISOString()
          }
        ],
        closures: []
      }
    ];

    this.users = [...INITIAL_ROSTY_USERS];
  }

  // --- GESTIÓN DE EMPRESAS (TENANTS) ---

  getTenants() {
    return this.tenants.map(t => ({
      id: t.id,
      nombre: t.nombre,
      slogan: t.slogan,
      logoEmoji: t.logoEmoji,
      colores: t.colores,
      numeroMesas: t.numeroMesas,
      telefono: t.telefono,
      direccion: t.direccion,
      whatsappDomiciliario: t.whatsappDomiciliario
    }));
  }

  getTenant(tenantId = DEFAULT_TENANT_ID) {
    let t = this.tenants.find(ten => ten.id === tenantId);
    if (!t) {
      t = this.tenants[0]; // Fallback seguro
    }
    return t;
  }

  createTenant({
    nombre,
    slogan = '',
    logoEmoji = '🍽️',
    colores = { primario: '#e27329', secundario: '#ffcc00', fondo: '#1f1109', superficie: '#3d2314' },
    numeroMesas = 10,
    telefono = '',
    direccion = '',
    whatsappDomiciliario = '',
    adminPin = 'admin123',
    adminName = 'Administrador'
  }) {
    const slug = nombre
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-') || `empresa-${Date.now().toString().slice(-4)}`;

    const tenantId = this.tenants.some(t => t.id === slug) ? `${slug}-${Date.now().toString().slice(-3)}` : slug;

    const newTenant = {
      id: tenantId,
      nombre: nombre.trim(),
      slogan: slogan.trim(),
      logoEmoji,
      colores,
      numeroMesas: Number(numeroMesas) || 10,
      telefono,
      direccion,
      whatsappDomiciliario: whatsappDomiciliario || telefono,
      menu: JSON.parse(JSON.stringify(DEFAULT_MENU)), // Clona catálogo base
      tables: Array.from({ length: Number(numeroMesas) || 10 }, (_, i) => ({
        id: i + 1,
        numero: i + 1,
        capacidad: 4,
        estado: 'libre',
        apertura: null,
        pedidoActual: []
      })),
      orders: [],
      salesHistory: [],
      closures: []
    };

    this.tenants.push(newTenant);

    // Crear usuario administrador inicial para la empresa
    const adminUser = {
      id: `u-${tenantId}-admin`,
      empresaId: tenantId,
      username: 'admin',
      name: adminName || `Admin ${nombre}`,
      role: 'admin',
      pinHash: bcrypt.hashSync(adminPin, 10)
    };

    // Crear usuario mesero inicial
    const waiterUser = {
      id: `u-${tenantId}-waiter`,
      empresaId: tenantId,
      username: 'waiter',
      name: `Mesero 1`,
      role: 'waiter',
      pinHash: bcrypt.hashSync('1234', 10)
    };

    // Crear usuario cocinero inicial
    const chefUser = {
      id: `u-${tenantId}-chef`,
      empresaId: tenantId,
      username: 'chef',
      name: `Cocinero 1`,
      role: 'chef',
      pinHash: bcrypt.hashSync('1234', 10)
    };

    this.users.push(adminUser, waiterUser, chefUser);

    return { tenant: newTenant, adminUser };
  }

  updateTenantConfig(tenantId, config) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return null;

    if (config.nombre) tenant.nombre = config.nombre.trim();
    if (config.slogan !== undefined) tenant.slogan = config.slogan;
    if (config.logoEmoji) tenant.logoEmoji = config.logoEmoji;
    if (config.colores) tenant.colores = { ...tenant.colores, ...config.colores };
    if (config.telefono !== undefined) tenant.telefono = config.telefono;
    if (config.direccion !== undefined) tenant.direccion = config.direccion;
    if (config.whatsappDomiciliario !== undefined) tenant.whatsappDomiciliario = config.whatsappDomiciliario;

    // Actualizar número de mesas si cambió
    if (config.numeroMesas && Number(config.numeroMesas) !== tenant.numeroMesas) {
      const newCount = Math.max(1, Math.min(50, Number(config.numeroMesas)));
      tenant.numeroMesas = newCount;

      if (newCount > tenant.tables.length) {
        // Agregar nuevas mesas
        for (let i = tenant.tables.length + 1; i <= newCount; i++) {
          tenant.tables.push({
            id: i,
            numero: i,
            capacidad: 4,
            estado: 'libre',
            apertura: null,
            pedidoActual: []
          });
        }
      } else if (newCount < tenant.tables.length) {
        // Reducir solo si están libres
        tenant.tables = tenant.tables.slice(0, newCount);
      }
    }

    return tenant;
  }

  updateTenantMenu(tenantId, newMenu) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return null;
    tenant.menu = newMenu;
    return tenant.menu;
  }

  // --- GESTIÓN DE USUARIOS POR EMPRESA ---

  getUsersByTenant(tenantId) {
    return this.users
      .filter(u => u.empresaId === tenantId)
      .map(u => ({
        id: u.id,
        empresaId: u.empresaId,
        username: u.username,
        name: u.name,
        role: u.role
      }));
  }

  createUser(tenantId, { username, name, role, pin }) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) throw new Error('Empresa no encontrada.');

    // Verificar si el username ya existe en esa empresa
    const exists = this.users.some(
      u => u.empresaId === tenantId && u.username.toLowerCase() === username.toLowerCase()
    );
    if (exists) {
      throw new Error(`El usuario "${username}" ya existe en este restaurante.`);
    }

    const newUser = {
      id: `u-${tenantId}-${Date.now().toString().slice(-4)}`,
      empresaId: tenantId,
      username: username.trim().toLowerCase(),
      name: name.trim(),
      role: role || 'waiter',
      pinHash: bcrypt.hashSync(pin || '1234', 10)
    };

    this.users.push(newUser);
    return {
      id: newUser.id,
      empresaId: newUser.empresaId,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role
    };
  }

  deleteUser(tenantId, userId) {
    const initialLen = this.users.length;
    this.users = this.users.filter(u => !(u.empresaId === tenantId && u.id === userId));
    return this.users.length < initialLen;
  }

  findUser(tenantId, identifier) {
    return this.users.find(
      u => u.empresaId === tenantId && (
        u.username.toLowerCase() === identifier.toLowerCase() ||
        u.role.toLowerCase() === identifier.toLowerCase()
      )
    );
  }

  // --- MESAS POR EMPRESA ---

  getTables(tenantId = DEFAULT_TENANT_ID) {
    return this.getTenant(tenantId).tables;
  }

  occupyTable(tenantId, numero, items = []) {
    const tenant = this.getTenant(tenantId);
    const tableIndex = tenant.tables.findIndex((t) => t.numero === Number(numero));
    if (tableIndex !== -1) {
      tenant.tables[tableIndex] = {
        ...tenant.tables[tableIndex],
        estado: 'ocupada',
        apertura: tenant.tables[tableIndex].apertura || new Date().toISOString(),
        pedidoActual: items
      };
      return tenant.tables[tableIndex];
    }
    return null;
  }

  closeTable(tenantId, numero, metodoPago = 'efectivo', montoRecibido = 0, atendidoPor = 'Sistema') {
    const tenant = this.getTenant(tenantId);
    const tableIndex = tenant.tables.findIndex((t) => t.numero === Number(numero));
    if (tableIndex === -1) return null;

    const table = tenant.tables[tableIndex];
    const totalMesa = table.pedidoActual.reduce((sum, item) => sum + item.price * item.cantidad, 0);

    const receipt = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      ordenId: `MESA-${numero}`,
      destino: `Mesa ${numero}`,
      cliente: 'Salón',
      total: totalMesa,
      metodoPago,
      montoRecibido: Number(montoRecibido) || totalMesa,
      cambio: Math.max(0, (Number(montoRecibido) || totalMesa) - totalMesa),
      despachadoPor: atendidoPor,
      timestamp: new Date().toISOString()
    };

    if (totalMesa > 0) {
      tenant.salesHistory.unshift(receipt);
    }

    // Actualizar pedidos de esa mesa a 'Despachado'
    tenant.orders = tenant.orders.map((o) =>
      o.destino === `Mesa ${numero}` ? { ...o, estado: 'Despachado', updatedAt: new Date().toISOString() } : o
    );

    // Resetear mesa a libre
    tenant.tables[tableIndex] = {
      ...tenant.tables[tableIndex],
      estado: 'libre',
      apertura: null,
      pedidoActual: []
    };

    return { table: tenant.tables[tableIndex], receipt };
  }

  // --- ÓRDENES POR EMPRESA ---

  getOrders(tenantId = DEFAULT_TENANT_ID) {
    return this.getTenant(tenantId).orders;
  }

  addOrder(tenantId, orderData) {
    const tenant = this.getTenant(tenantId);
    const newOrder = {
      id: orderData.id || `ORD-${Date.now().toString().slice(-4)}`,
      empresaId: tenant.id,
      tipo: orderData.tipo,
      destino: orderData.destino,
      cliente: orderData.cliente || 'Cliente Salón',
      datosExtra: orderData.datosExtra || '',
      items: orderData.items || [],
      total: Number(orderData.total) || 0,
      estado: 'En preparación',
      createdAt: new Date().toISOString(),
      minutos: 0,
      limite: orderData.tipo === 'delivery' ? 25 : 15,
      ...orderData
    };

    tenant.orders.unshift(newOrder);

    if (orderData.tipo === 'dine_in' && orderData.mesaNumero) {
      this.occupyTable(tenantId, orderData.mesaNumero, orderData.items);
    }

    return newOrder;
  }

  updateOrderStatus(tenantId, orderId, nuevoEstado) {
    const tenant = this.getTenant(tenantId);
    const orderIndex = tenant.orders.findIndex((o) => String(o.id) === String(orderId));
    if (orderIndex === -1) return null;

    tenant.orders[orderIndex] = {
      ...tenant.orders[orderIndex],
      estado: nuevoEstado,
      updatedAt: new Date().toISOString()
    };

    return tenant.orders[orderIndex];
  }

  toggleItemComplete(tenantId, orderId, itemId) {
    const tenant = this.getTenant(tenantId);
    const order = tenant.orders.find((o) => String(o.id) === String(orderId));
    if (!order || !order.items) return null;

    const item = order.items.find((i) => i.id === Number(itemId));
    if (item) {
      item.completado = !item.completado;
    }
    return order;
  }

  // --- CIERRE DE CAJA DEL DÍA (CORTE Z) & ESTADÍSTICAS ---

  getStats(tenantId = DEFAULT_TENANT_ID) {
    const tenant = this.getTenant(tenantId);
    const totalVendido = tenant.salesHistory.reduce((sum, r) => sum + r.total, 0);
    const totalComandasDespachadas = tenant.salesHistory.length;
    const promedioTicket = totalComandasDespachadas > 0 ? Math.round(totalVendido / totalComandasDespachadas) : 0;

    const totalEfectivo = tenant.salesHistory.filter(s => s.metodoPago === 'efectivo').reduce((sum, s) => sum + s.total, 0);
    const totalNequi = tenant.salesHistory.filter(s => s.metodoPago === 'nequi').reduce((sum, s) => sum + s.total, 0);
    const totalDaviplata = tenant.salesHistory.filter(s => s.metodoPago === 'daviplata').reduce((sum, s) => sum + s.total, 0);
    const totalTarjeta = tenant.salesHistory.filter(s => s.metodoPago === 'tarjeta').reduce((sum, s) => sum + s.total, 0);

    const ordenesActivas = tenant.orders.filter((o) => o.estado !== 'Despachado').length;
    const ordenesListas = tenant.orders.filter((o) => o.estado === 'Listo').length;

    const mesasOcupadas = tenant.tables.filter((t) => t.estado === 'ocupada' || t.estado === 'cuenta').length;
    const mesasLibres = tenant.tables.filter((t) => t.estado === 'libre').length;

    return {
      empresa: {
        id: tenant.id,
        nombre: tenant.nombre,
        logoEmoji: tenant.logoEmoji,
        colores: tenant.colores
      },
      totalVendido,
      totalComandasDespachadas,
      promedioTicket,
      desgloseMetodos: {
        efectivo: totalEfectivo,
        nequi: totalNequi,
        daviplata: totalDaviplata,
        tarjeta: totalTarjeta
      },
      ordenesActivas,
      ordenesListas,
      mesasOcupadas,
      mesasLibres,
      ultimasVentas: tenant.salesHistory.slice(0, 15),
      cierresAnteriores: tenant.closures.slice(0, 10)
    };
  }

  closeCashRegister(tenantId, { closedBy = 'Administrador', baseCash = 0, actualCash = 0, notes = '' }) {
    const tenant = this.getTenant(tenantId);
    const totalVendido = tenant.salesHistory.reduce((sum, r) => sum + r.total, 0);
    const totalComandas = tenant.salesHistory.length;

    const totalEfectivo = tenant.salesHistory.filter(s => s.metodoPago === 'efectivo').reduce((sum, s) => sum + s.total, 0);
    const totalNequi = tenant.salesHistory.filter(s => s.metodoPago === 'nequi').reduce((sum, s) => sum + s.total, 0);
    const totalDaviplata = tenant.salesHistory.filter(s => s.metodoPago === 'daviplata').reduce((sum, s) => sum + s.total, 0);
    const totalTarjeta = tenant.salesHistory.filter(s => s.metodoPago === 'tarjeta').reduce((sum, s) => sum + s.total, 0);

    const base = Number(baseCash) || 0;
    const efectivoEsperado = base + totalEfectivo;
    const real = Number(actualCash) || efectivoEsperado;
    const diferencia = real - efectivoEsperado;

    const closureRecord = {
      id: `CORTE-${Date.now().toString().slice(-4)}`,
      empresaId: tenant.id,
      fecha: new Date().toISOString(),
      fechaFormateada: new Date().toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' }),
      cerradoPor: closedBy,
      totalVendido,
      totalComandas,
      porMetodoPago: {
        efectivo: totalEfectivo,
        nequi: totalNequi,
        daviplata: totalDaviplata,
        tarjeta: totalTarjeta
      },
      baseCaja: base,
      efectivoEsperado,
      efectivoReal: real,
      diferencia,
      notas: notes || '',
      comprobantes: [...tenant.salesHistory]
    };

    tenant.closures.unshift(closureRecord);

    // REINICIAR LAS VENTAS DEL DÍA A $0
    tenant.salesHistory = [];

    // Limpiar órdenes finalizadas para el siguiente día
    tenant.orders = tenant.orders.filter(o => o.estado !== 'Despachado');

    return closureRecord;
  }

  tickOrderTimers() {
    let changed = false;
    for (const tenant of this.tenants) {
      if (!tenant.orders) continue;
      tenant.orders = tenant.orders.map((o) => {
        if (o.estado !== 'Listo' && o.estado !== 'Despachado') {
          changed = true;
          return { ...o, minutos: (Number(o.minutos) || 0) + 1 };
        }
        return o;
      });
    }
    return changed;
  }
}

export const store = new Store();
