import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_MENU } from './defaultMenu.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Empresa 1: ROSTY Broaster (Pollería Tradicional)
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
  whatsappDomiciliario: '3227801140',
  domiciliarios: [
    { id: 'dom-1', nombre: 'Domiciliario 1', telefono: '3227801140' },
    { id: 'dom-2', nombre: 'Domiciliario 2', telefono: '' }
  ]
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

// Empresa 2: Pizzería Nápoles (Pizzas & Pastas Artesanales)
const INITIAL_PIZZERIA_CONFIG = {
  id: 'pizzeria-napoles',
  nombre: 'Pizzería Nápoles',
  slogan: 'Auténtica pizza al horno de leña y pastas artesanales',
  logoEmoji: '🍕',
  colores: {
    primario: '#d32f2f',      // Rojo salsa pomodoro
    secundario: '#ffcc00',    // Dorado queso derretido
    fondo: '#1a1008',         // Carbón horno leña
    superficie: '#2b1a10'     // Madera rústica
  },
  numeroMesas: 10,
  telefono: '3109876543',
  direccion: 'Carrera 15 #80-10',
  whatsappDomiciliario: '3109876543',
  domiciliarios: [
    { id: 'dom-1', nombre: 'Domiciliario 1', telefono: '3109876543' },
    { id: 'dom-2', nombre: 'Domiciliario 2', telefono: '' }
  ]
};

const PIZZERIA_MENU = {
  'Pizzas Tradicionales 🍕': [
    { id: 801, name: 'Pizza Margarita Personal', price: 16000, desc: 'Salsa pomodoro napolitana, mozzarella fresca, albahaca y aceite de oliva virgen extra.' },
    { id: 802, name: 'Pizza Pepperoni Mediana', price: 28000, desc: 'Generosa capa de pepperoni americano crujiente con queso mozzarella fundido.' },
    { id: 803, name: 'Pizza Hawaiana Familiar', price: 38000, desc: 'Jamón artesanal seleccionado, piña caramelizada al horno y doble queso.' },
    { id: 804, name: 'Pizza Cuatro Quesos Especial', price: 42000, desc: 'Mozzarella, parmesano reggiano, queso azul y provolone fundido.' }
  ],
  'Pizzas Especiales & Carnes 🥩': [
    { id: 810, name: 'Pizza Carnes de la Casa (Familiar)', price: 46000, desc: 'Tocineta crocante, carne molida especiada, pepperoni, jamón y maíz tierno.' },
    { id: 811, name: 'Pizza Pollo con Champiñones', price: 36000, desc: 'Pechuga desmechada al vino blanco, champiñones salteados y mozzarella.' },
    { id: 812, name: 'Pizza Mexicana Picante', price: 39000, desc: 'Carne picada, jalapeños, nachos triturados, frijol refrito y queso.' }
  ],
  'Pastas & Lasagnas 🍝': [
    { id: 820, name: 'Lasagna Mixta al Horno', price: 24000, desc: 'Capas de pasta artesanal con carne bolognesa, pollo desmechado y gratinado de queso.' },
    { id: 821, name: 'Spaghetti a la Carbonara', price: 22000, desc: 'Tocineta dorada, crema de leche suave, queso parmesano y pimienta negra recién molida.' },
    { id: 822, name: 'Fettuccine Alfredo con Pollo', price: 25000, desc: 'Salsa Alfredo mantecosa con tiras de pechuga a la plancha y perejil fresco.' }
  ],
  'Entradas & Bebidas 🥤': [
    { id: 830, name: 'Pan de Ajo con Queso (4 unidades)', price: 9000, desc: 'Baguette tostado con mantequilla de ajo, orégano y queso derretido.' },
    { id: 831, name: 'Gaseosa 1.5L Familiar', price: 7000, desc: 'Coca-Cola, Postobón o Sprite fría.' },
    { id: 832, name: 'Cerveza Club Colombia / Corona', price: 6500, desc: 'Botella fría de cerveza premium.' }
  ]
};

const INITIAL_PIZZERIA_USERS = [
  {
    id: 'u-pizzeria-waiter',
    empresaId: 'pizzeria-napoles',
    username: 'waiter',
    pinHash: bcrypt.hashSync('pizza123', 10),
    name: 'Mesero Pizzería',
    role: 'waiter'
  },
  {
    id: 'u-pizzeria-chef',
    empresaId: 'pizzeria-napoles',
    username: 'chef',
    pinHash: bcrypt.hashSync('cocina123', 10),
    name: 'Maestro Pizzero (KDS)',
    role: 'chef'
  },
  {
    id: 'u-pizzeria-admin',
    empresaId: 'pizzeria-napoles',
    username: 'admin',
    pinHash: bcrypt.hashSync('admin123', 10),
    name: 'Administración Pizzería',
    role: 'admin'
  }
];

const createTablesArray = (count = 14) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    capacidad: 4,
    estado: 'libre',
    apertura: null,
    pedidoActual: []
  }));
};

class Store {
  constructor() {
    this.tenants = [];
    this.users = [];
    this.init();
  }

  init() {
    // Intentar cargar datos persistentes de disco si existen
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.tenants && parsed.tenants.length > 0) {
          this.tenants = parsed.tenants;
          this.users = parsed.users || [];
          this.ensureSuperadmin();
          console.log(`💾 Base de datos cargada de disco: ${this.tenants.length} restaurantes.`);
          return;
        }
      } catch (err) {
        console.warn('Error al leer db.json, reinicializando por defecto:', err.message);
      }
    }

    // Si no existe archivo, inicializar limpio sin órdenes de prueba
    this.tenants = [
      {
        ...INITIAL_ROSTY_CONFIG,
        menu: JSON.parse(JSON.stringify(DEFAULT_MENU)),
        tables: createTablesArray(14),
        orders: [],
        salesHistory: [],
        closures: []
      },
      {
        ...INITIAL_PIZZERIA_CONFIG,
        menu: JSON.parse(JSON.stringify(PIZZERIA_MENU)),
        tables: createTablesArray(10),
        orders: [],
        salesHistory: [],
        closures: []
      }
    ];

    this.users = [...INITIAL_ROSTY_USERS, ...INITIAL_PIZZERIA_USERS];
    this.ensureSuperadmin();
    this.persist();
  }

  ensureSuperadmin() {
    const existing = this.users.find(u => u.username === 'superadmin' || u.role === 'superadmin');
    if (!existing) {
      this.users.push({
        id: 'u-superadmin-global',
        empresaId: 'global',
        username: 'superadmin',
        pinHash: bcrypt.hashSync('superadmin2026', 10),
        name: 'Administrador Global',
        role: 'superadmin'
      });
      this.persist();
    }
  }

  getSuperadmin() {
    this.ensureSuperadmin();
    return this.users.find(u => u.role === 'superadmin' || u.username === 'superadmin') || null;
  }

  persist() {
    try {
      const dataToSave = {
        tenants: this.tenants,
        users: this.users
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error al persistir base de datos a disco:', e.message);
    }
  }

  // --- GESTIÓN DE EMPRESAS (TENANTS) ---

  getTenantAdmin(tenantId) {
    const admin = this.users.find(u => u.empresaId === tenantId && u.role === 'admin');
    if (!admin) return null;
    return {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role
    };
  }

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
      whatsappDomiciliario: t.whatsappDomiciliario,
      domiciliarios: t.domiciliarios || [],
      estado: t.estado || 'activo',
      admin: this.getTenantAdmin(t.id),
      totalMesas: t.tables?.length || t.numeroMesas || 10,
      totalOrdenes: t.orders?.length || 0,
      totalVentas: (t.salesHistory || []).reduce((acc, s) => acc + (s.total || 0), 0)
    }));
  }

  getTenant(tenantId = 'rosty-broaster') {
    if (!tenantId) return this.tenants[0] || null;
    return this.tenants.find(ten => ten.id === tenantId) || null;
  }

  updateTenantStatus(tenantId, nuevoEstado) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return null;
    tenant.estado = nuevoEstado === 'cerrado' ? 'cerrado' : 'activo';
    this.persist();
    return tenant;
  }

  updateTenantAdmin(tenantId, { username, name, pin }) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) throw new Error('Restaurante no encontrado.');

    let admin = this.users.find(u => u.empresaId === tenantId && u.role === 'admin');
    if (!admin) {
      admin = {
        id: `u-${tenantId}-admin`,
        empresaId: tenantId,
        username: (username || 'admin').trim().toLowerCase(),
        name: (name || 'Administrador').trim(),
        role: 'admin',
        pinHash: bcrypt.hashSync(pin || 'admin123', 10)
      };
      this.users.push(admin);
    } else {
      if (username && username.trim()) admin.username = username.trim().toLowerCase();
      if (name && name.trim()) admin.name = name.trim();
      if (pin && pin.trim()) admin.pinHash = bcrypt.hashSync(pin.trim(), 10);
    }
    this.persist();
    return {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role
    };
  }

  deleteTenant(tenantId) {
    const index = this.tenants.findIndex(t => t.id === tenantId);
    if (index === -1) return false;
    this.tenants.splice(index, 1);
    this.users = this.users.filter(u => u.empresaId !== tenantId);
    this.persist();
    return true;
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

    // Crear usuario admin para este nuevo restaurante
    const adminUser = {
      id: `u-${tenantId}-admin`,
      empresaId: tenantId,
      username: 'admin',
      pinHash: bcrypt.hashSync(adminPin, 10),
      name: adminName,
      role: 'admin'
    };

    // Crear usuario mesero por defecto
    const waiterUser = {
      id: `u-${tenantId}-waiter`,
      empresaId: tenantId,
      username: 'waiter',
      pinHash: bcrypt.hashSync('1234', 10),
      name: `Mesero ${nombre}`,
      role: 'waiter'
    };

    // Crear cocinero por defecto
    const chefUser = {
      id: `u-${tenantId}-chef`,
      empresaId: tenantId,
      username: 'chef',
      pinHash: bcrypt.hashSync('1234', 10),
      name: `Cocina ${nombre}`,
      role: 'chef'
    };

    this.users.push(adminUser, waiterUser, chefUser);
    this.persist();

    return {
      tenant: newTenant,
      adminUser: {
        id: adminUser.id,
        empresaId: adminUser.empresaId,
        username: adminUser.username,
        name: adminUser.name,
        role: adminUser.role
      }
    };
  }

  updateTenantConfig(tenantId, config) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return null;

    if (config.nombre) tenant.nombre = config.nombre.trim();
    if (config.slogan !== undefined) tenant.slogan = config.slogan.trim();
    if (config.logoEmoji) tenant.logoEmoji = config.logoEmoji;
    if (config.telefono !== undefined) tenant.telefono = config.telefono;
    if (config.direccion !== undefined) tenant.direccion = config.direccion;
    if (config.whatsappDomiciliario !== undefined) tenant.whatsappDomiciliario = config.whatsappDomiciliario;
    if (config.domiciliarios !== undefined && Array.isArray(config.domiciliarios)) {
      tenant.domiciliarios = config.domiciliarios;
    }

    if (config.colores) {
      tenant.colores = {
        ...tenant.colores,
        ...config.colores
      };
    }

    if (config.numeroMesas && Number(config.numeroMesas) > 0) {
      const newCount = Number(config.numeroMesas);
      tenant.numeroMesas = newCount;
      if (newCount > tenant.tables.length) {
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
        tenant.tables = tenant.tables.slice(0, newCount);
      }
    }

    this.persist();
    return tenant;
  }

  updateTenantMenu(tenantId, newMenu) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return null;
    tenant.menu = newMenu;
    this.persist();
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
    this.persist();

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
    const wasDeleted = this.users.length < initialLen;
    if (wasDeleted) this.persist();
    return wasDeleted;
  }

  findUser(tenantId, identifier, pin = null) {
    if (!identifier) return null;
    const cleanId = String(identifier).trim().toLowerCase();

    // 1. Acceso Superadmin Global
    if (tenantId === 'global' || cleanId === 'superadmin') {
      return this.getSuperadmin();
    }

    const tenantUsers = this.users.filter(u => u.empresaId === tenantId);

    // 2. Coincidencia por username exacto (ej: 'carlos', 'mariapizza', 'admin', 'waiter')
    const byUsername = tenantUsers.find(
      u => u.username && u.username.toLowerCase() === cleanId
    );
    if (byUsername) return byUsername;

    // 3. Coincidencia por rol (ej: 'waiter', 'chef', 'admin')
    const byRoleUsers = tenantUsers.filter(
      u => u.role && u.role.toLowerCase() === cleanId
    );

    if (byRoleUsers.length === 1) {
      return byRoleUsers[0];
    }

    // 4. Si hay múltiples usuarios para ese rol (ej: varios meseros) y se proporcionó PIN, probar hash
    if (byRoleUsers.length > 1 && pin) {
      const matched = byRoleUsers.find(u => {
        try {
          return bcrypt.compareSync(String(pin).trim(), u.pinHash);
        } catch {
          return false;
        }
      });
      if (matched) return matched;
    }

    return byRoleUsers[0] || null;
  }

  findUserGlobal(identifier, pin) {
    if (!identifier) return null;
    const cleanId = String(identifier).trim().toLowerCase();
    const cleanPin = String(pin || '').trim();

    // 1. Acceso Superadmin Global
    if (cleanId === 'superadmin') {
      const superUser = this.getSuperadmin();
      if (superUser && cleanPin && bcrypt.compareSync(cleanPin, superUser.pinHash)) {
        return { user: superUser, tenant: null };
      }
    }

    // 2. Buscar usuarios por username exacto
    const matchingUsers = this.users.filter(
      (u) => u.username && u.username.toLowerCase() === cleanId
    );

    for (const u of matchingUsers) {
      if (cleanPin && bcrypt.compareSync(cleanPin, u.pinHash)) {
        const tenant = this.getTenant(u.empresaId);
        return { user: u, tenant };
      }
    }

    // 3. Buscar por coincidencia de rol si no se encontró por username
    const roleUsers = this.users.filter(
      (u) => u.role && u.role.toLowerCase() === cleanId
    );
    for (const u of roleUsers) {
      if (cleanPin && bcrypt.compareSync(cleanPin, u.pinHash)) {
        const tenant = this.getTenant(u.empresaId);
        return { user: u, tenant };
      }
    }

    return null;
  }

  // --- MESAS POR EMPRESA ---

  getTables(tenantId = 'rosty-broaster') {
    const tenant = this.getTenant(tenantId) || this.tenants[0];
    return tenant ? tenant.tables : [];
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
      this.persist();
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

    tenant.orders = tenant.orders.map((o) =>
      o.destino === `Mesa ${numero}` ? { ...o, estado: 'Despachado', cobrado: true, updatedAt: new Date().toISOString() } : o
    );

    tenant.tables[tableIndex] = {
      ...tenant.tables[tableIndex],
      estado: 'libre',
      apertura: null,
      pedidoActual: []
    };

    this.persist();
    return { table: tenant.tables[tableIndex], receipt };
  }

  // --- ÓRDENES POR EMPRESA ---

  getOrders(tenantId = 'rosty-broaster') {
    return this.getTenant(tenantId).orders;
  }

  addOrder(tenantId, orderData) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return null;

    const orderId = orderData.id ? String(orderData.id).trim() : `ORD-${Date.now().toString().slice(-4)}`;
    const existingIndex = tenant.orders.findIndex((o) => o.id === orderId);

    const orderToSave = {
      id: orderId,
      empresaId: tenant.id,
      tipo: orderData.tipo,
      destino: orderData.destino,
      cliente: orderData.cliente || 'Cliente Salón',
      datosExtra: orderData.datosExtra || '',
      items: orderData.items || [],
      total: Number(orderData.total) || 0,
      estado: orderData.estado || 'En preparación',
      cobrado: Boolean(orderData.cobrado) || false,
      mesaNumero: orderData.tipo === 'dine_in' ? Number(orderData.mesaNumero) : null,
      domiciliarioId: orderData.domiciliarioId || null,
      domiciliarioNombre: orderData.domiciliarioNombre || '',
      domiciliarioTelefono: orderData.domiciliarioTelefono || '',
      createdAt: orderData.createdAt || new Date().toISOString()
    };

    if (existingIndex !== -1) {
      tenant.orders[existingIndex] = {
        ...tenant.orders[existingIndex],
        ...orderToSave
      };
    } else {
      tenant.orders.unshift(orderToSave);
    }

    if (orderData.tipo === 'dine_in' && orderData.mesaNumero) {
      this.occupyTable(tenant.id, orderData.mesaNumero, orderData.items);
    }

    this.persist();
    return existingIndex !== -1 ? tenant.orders[existingIndex] : orderToSave;
  }

  updateOrder(tenantId, orderId, updateData) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return null;

    const order = tenant.orders.find((o) => o.id === orderId);
    if (!order) return null;

    if (Array.isArray(updateData.items)) {
      order.items = updateData.items.map((it) => ({
        id: it.id,
        name: String(it.name).slice(0, 80),
        price: Math.max(0, Number(it.price) || 0),
        cantidad: Math.max(1, Number(it.cantidad) || 1),
        completado: it.completado || false
      }));
      order.total = order.items.reduce((acc, curr) => acc + curr.price * curr.cantidad, 0);

      // Si la comanda es de salón / mesa, sincronizar mesa
      if (order.tipo === 'dine_in' && order.mesaNumero) {
        const table = tenant.tables.find((t) => t.numero === Number(order.mesaNumero));
        if (table) {
          table.pedidoActual = order.items;
        }
      }
    }

    if (updateData.cliente !== undefined) order.cliente = String(updateData.cliente).trim();
    if (updateData.destino !== undefined) order.destino = String(updateData.destino).trim();
    if (updateData.datosExtra !== undefined) order.datosExtra = String(updateData.datosExtra).trim();
    if (updateData.domiciliarioId !== undefined) order.domiciliarioId = updateData.domiciliarioId;
    if (updateData.domiciliarioNombre !== undefined) order.domiciliarioNombre = updateData.domiciliarioNombre;
    if (updateData.domiciliarioTelefono !== undefined) order.domiciliarioTelefono = updateData.domiciliarioTelefono;

    order.updatedAt = new Date().toISOString();
    this.persist();
    return order;
  }

  cancelOrder(tenantId, orderId) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return null;

    const orderIndex = tenant.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return null;

    const order = tenant.orders[orderIndex];

    // Si es una orden de salón, liberar la mesa
    if (order.tipo === 'dine_in' && order.mesaNumero) {
      const table = tenant.tables.find((t) => t.numero === Number(order.mesaNumero));
      if (table) {
        table.estado = 'libre';
        table.apertura = null;
        table.pedidoActual = [];
      }
    }

    // Remover la orden de la lista
    tenant.orders.splice(orderIndex, 1);

    // Si estaba registrada en salesHistory, retirarla
    tenant.salesHistory = (tenant.salesHistory || []).filter((s) => s.ordenId !== orderId);

    this.persist();
    return { order, tableNumero: order.mesaNumero };
  }

  updateOrderStatus(tenantId, orderId, estado) {
    const tenant = this.getTenant(tenantId);
    const order = tenant.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.estado = estado;
    order.updatedAt = new Date().toISOString();
    if (estado === 'Despachado' && !order.despachadoAt) {
      order.despachadoAt = new Date().toISOString();
    }

    // NOTA OPERATIVA: La cocina únicamente actualiza el estado de preparación y despacho.
    // NUNCA inserta ventas en salesHistory para evitar duplicados con caja / meseros.

    this.persist();
    return order;
  }

  // Liquidación / Cobro de Domicilios y Pedidos (individual o masivo al cierre de ruta)
  settleOrders(tenantId, { orderIds = [], metodoPago = 'efectivo', montoRecibido = 0, atendidoPor = 'Caja' }) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return { settledOrders: [], receipts: [] };

    const idsToSettle = Array.isArray(orderIds) ? orderIds : [orderIds];
    const settledOrders = [];
    const receipts = [];

    for (const orderId of idsToSettle) {
      const order = tenant.orders.find((o) => o.id === orderId);
      if (!order) continue;

      order.cobrado = true;
      order.liquidadoAt = new Date().toISOString();
      order.metodoPago = metodoPago || 'efectivo';
      if (order.estado !== 'Despachado') {
        order.estado = 'Despachado';
      }
      settledOrders.push(order);

      // Verificar que no exista ya un recibo con este ID para evitar duplicidad
      const alreadyInHistory = (tenant.salesHistory || []).some((s) => s.ordenId === order.id);
      if (!alreadyInHistory && order.total > 0) {
        const receipt = {
          id: `REC-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`,
          ordenId: order.id,
          destino: order.destino,
          cliente: order.cliente,
          total: order.total,
          metodoPago: metodoPago || 'efectivo',
          montoRecibido: Number(montoRecibido) > 0 ? Number(montoRecibido) : order.total,
          cambio: Math.max(0, (Number(montoRecibido) || order.total) - order.total),
          despachadoPor: atendidoPor || 'Caja / Domicilios',
          timestamp: new Date().toISOString()
        };
        tenant.salesHistory.unshift(receipt);
        receipts.push(receipt);
      }
    }

    this.persist();
    return { settledOrders, receipts };
  }

  toggleOrderItem(tenantId, orderId, itemId) {
    const tenant = this.getTenant(tenantId);
    const order = tenant.orders.find((o) => o.id === orderId);
    if (!order || !order.items) return null;

    const item = order.items.find((i) => i.id === Number(itemId));
    if (item) {
      item.completado = !item.completado;
      this.persist();
      return order;
    }
    return null;
  }

  // --- MÉTRICAS Y AUDITORÍA POR EMPRESA ---

  getStats(tenantId = 'rosty-broaster') {
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

    this.persist();
    return closureRecord;
  }

  tickOrderTimers() {
    return false;
  }
}

export const store = new Store();
