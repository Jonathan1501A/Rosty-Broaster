import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import LoginModal from './components/LoginModal.jsx';
import TablesView from './components/TablesView.jsx';
import OrderDrawer from './components/OrderDrawer.jsx';
import KitchenView from './components/KitchenView.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import ReportsView from './components/ReportsView.jsx';
import PrivacyModal from './components/PrivacyModal.jsx';
import CompanySettingsModal from './components/CompanySettingsModal.jsx';
import UserManagementModal from './components/UserManagementModal.jsx';
import MenuManagementModal from './components/MenuManagementModal.jsx';
import CloseCashModal from './components/CloseCashModal.jsx';
import SuperAdminView from './components/SuperAdminView.jsx';
import Toast from './components/Toast.jsx';

import { api } from './services/api.js';
import { initSocket, disconnectSocket, joinTenantRoom } from './services/socket.js';
import { playNewOrderSound, playReadySound } from './services/sound.js';
import { DEFAULT_TENANT, DEFAULT_PIZZERIA, applyTenantTheme, getStoredTenant } from './data/tenantConfig.js';

// Órdenes de prueba exclusivas para ROSTY Broaster
const DEFAULT_ROSTY_ORDERS = [
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
    estado: 'Listo',
    minutos: 17,
    limite: 20
  }
];

// Órdenes de prueba exclusivas para Pizzería Nápoles (Sin pollo ni platos ajenos)
const DEFAULT_PIZZERIA_ORDERS = [
  {
    id: 'PIZ-101',
    empresaId: 'pizzeria-napoles',
    tipo: 'dine_in',
    destino: 'Mesa 2',
    cliente: 'Salón',
    datosExtra: 'Mesa 2',
    items: [
      { id: 802, name: 'Pizza Pepperoni Mediana', price: 28000, cantidad: 1, completado: true },
      { id: 831, name: 'Gaseosa 1.5L Familiar', price: 7000, cantidad: 1, completado: false }
    ],
    total: 35000,
    estado: 'En preparación',
    minutos: 8,
    limite: 20
  },
  {
    id: 'PIZ-102',
    empresaId: 'pizzeria-napoles',
    tipo: 'delivery',
    destino: 'Av. Circunvalar #45-12',
    cliente: 'Andrea Torres',
    datosExtra: 'Tel: 3105559876',
    items: [
      { id: 810, name: 'Pizza Carnes de la Casa (Familiar)', price: 46000, cantidad: 1, completado: false }
    ],
    total: 46000,
    estado: 'En preparación',
    minutos: 12,
    limite: 25
  }
];

// Generador de mesas aislado por restaurante
const generateTables = (count = 10, existingTables = [], tenantId = '') => {
  const isRosty = tenantId === 'rosty-broaster';
  const isPizzeria = tenantId === 'pizzeria-napoles';

  return Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    const existing = existingTables.find((t) => t.numero === num);
    if (existing) return existing;

    if (isRosty && num === 3) {
      return {
        id: num,
        numero: num,
        capacidad: 4,
        estado: 'ocupada',
        apertura: new Date(Date.now() - 25 * 60000).toISOString(),
        pedidoActual: [
          { id: 103, name: '1 Pollo + Yuca + Arepa', price: 38000, cantidad: 1 },
          { id: 703, name: 'Gaseosa Familiar 1.5L', price: 7000, cantidad: 1 }
        ]
      };
    }

    if (isPizzeria && num === 2) {
      return {
        id: num,
        numero: num,
        capacidad: 4,
        estado: 'ocupada',
        apertura: new Date(Date.now() - 15 * 60000).toISOString(),
        pedidoActual: [
          { id: 802, name: 'Pizza Pepperoni Mediana', price: 28000, cantidad: 1 },
          { id: 831, name: 'Gaseosa 1.5L Familiar', price: 7000, cantidad: 1 }
        ]
      };
    }

    return {
      id: num,
      numero: num,
      capacidad: 4,
      estado: 'libre',
      apertura: null,
      pedidoActual: []
    };
  });
};

const getInitialOrders = (tenantId) => {
  try {
    const saved = localStorage.getItem(`rosty_orders_${tenantId}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  if (tenantId === 'rosty-broaster') return DEFAULT_ROSTY_ORDERS;
  if (tenantId === 'pizzeria-napoles') return DEFAULT_PIZZERIA_ORDERS;
  return [];
};

const getInitialTables = (tenant) => {
  const tenantId = tenant?.id || 'rosty-broaster';
  try {
    const saved = localStorage.getItem(`rosty_tables_${tenantId}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return generateTables(tenant?.numeroMesas || 10, [], tenantId);
};

export default function App() {
  const [user, setUser] = useState(() => api.getCurrentUser());
  const [tenant, setTenant] = useState(() => getStoredTenant());

  const [activeTab, setActiveTab] = useState(() => {
    const currentUser = api.getCurrentUser();
    return currentUser?.role === 'chef' ? 'kitchen' : currentUser?.role === 'admin' ? 'reports' : 'tables';
  });
  const [isConnected, setIsConnected] = useState(false);

  // Datos principales estrictamente aislados por restaurante
  const [tables, setTables] = useState(() => getInitialTables(getStoredTenant()));
  const [orders, setOrders] = useState(() => getInitialOrders(getStoredTenant()?.id || 'rosty-broaster'));
  const [stats, setStats] = useState(null);

  // Modales Operativos
  const [orderModal, setOrderModal] = useState({
    isOpen: false,
    servicioTipo: 'dine_in',
    mesaNumero: null,
    initialItems: []
  });

  const [checkoutModal, setCheckoutModal] = useState({
    isOpen: false,
    mesaNumero: null,
    items: []
  });

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Modales de Administración Multi-Empresa
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCloseCashOpen, setIsCloseCashOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const currentTenantId = tenant?.id || 'rosty-broaster';

  // Aplicar tema dinámico de colores de la empresa activa
  useEffect(() => {
    if (tenant) {
      applyTenantTheme(tenant);
    }
  }, [tenant]);

  // Sincronizar mesas si cambia la configuración de mesas de la empresa
  useEffect(() => {
    if (tenant?.numeroMesas && tables.length !== tenant.numeroMesas) {
      setTables((prev) => generateTables(tenant.numeroMesas, prev, currentTenantId));
    }
  }, [tenant?.numeroMesas, currentTenantId]);

  // Guardar en localStorage aislado estrictamente por tenantId
  useEffect(() => {
    try {
      localStorage.setItem(`rosty_tables_${currentTenantId}`, JSON.stringify(tables));
    } catch (e) {}
  }, [tables, currentTenantId]);

  useEffect(() => {
    try {
      localStorage.setItem(`rosty_orders_${currentTenantId}`, JSON.stringify(orders));
    } catch (e) {}
  }, [orders, currentTenantId]);

  // Temporizador de minutos de órdenes en cocina cada 15 segundos
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setOrders((prev) =>
        prev.map((o) => {
          const est = (o.estado || '').toLowerCase();
          return est !== 'listo' && est !== 'despachado' ? { ...o, minutos: (Number(o.minutos) || 0) + 1 } : o;
        })
      );
    }, 15000);
    return () => clearInterval(timerInterval);
  }, []);

  // Sincronización en tiempo real entre múltiples pestañas AISLADA por restaurante
  useEffect(() => {
    let channel;
    try {
      channel = new BroadcastChannel(`tenant_sync_${currentTenantId}`);
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'NEW_ORDER' && payload) {
          setOrders((prev) => [payload, ...prev.filter((o) => o.id !== payload.id)]);
          playNewOrderSound();
          addToast('success', `Comanda #${payload.id} (${payload.destino}) inyectada en cocina.`, '🔥 Nueva Comanda');
        } else if (type === 'UPDATE_ORDER' && payload) {
          setOrders((prev) => prev.map((o) => (o.id === payload.id ? { ...o, ...payload } : o)));
        } else if (type === 'UPDATE_TABLES' && payload) {
          setTables(payload);
        }
      };
    } catch (e) {}

    return () => {
      if (channel) channel.close();
    };
  }, [currentTenantId, addToast]);

  // Cargar datos iniciales desde el backend filtrados por currentTenantId
  const fetchData = useCallback(async () => {
    try {
      const [fetchedTables, fetchedOrders, fetchedStats, fetchedTenant] = await Promise.all([
        api.getTables(currentTenantId).catch(() => null),
        api.getOrders({}, currentTenantId).catch(() => null),
        api.getStats(currentTenantId).catch(() => null),
        api.getTenant(currentTenantId).catch(() => null)
      ]);

      if (fetchedTables && fetchedTables.length > 0) setTables(fetchedTables);
      if (fetchedOrders && fetchedOrders.length > 0) setOrders(fetchedOrders);
      if (fetchedStats) setStats(fetchedStats);
      if (fetchedTenant) {
        setTenant(fetchedTenant);
        applyTenantTheme(fetchedTenant);
      }
    } catch (err) {
      console.warn('Backend sync local:', err.message);
    }
  }, [currentTenantId]);

  // Manejar Logout / Cerrar Turno
  const handleLogout = useCallback(() => {
    api.logout();
    disconnectSocket();
    setUser(null);
    addToast('info', 'Sesión cerrada. Selecciona el restaurante para iniciar turno.', 'Turno Finalizado');
  }, [addToast]);

  // Inicializar WebSockets con sala exclusiva por empresa
  useEffect(() => {
    if (!user || user.role === 'superadmin') return;

    fetchData();

    initSocket(currentTenantId, {
      onConnect: () => {
        setIsConnected(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onError: () => {
        setIsConnected(false);
      },
      onInitialData: (data) => {
        // Acepta datos ÚNICAMENTE si corresponden a la sala de este restaurante
        if (!data.tenantId || data.tenantId === currentTenantId) {
          if (data.tables && data.tables.length > 0) setTables(data.tables);
          if (data.orders) setOrders(data.orders);
          if (data.stats) setStats(data.stats);
        }
      },
      onOrderCreated: (newOrder) => {
        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
        playNewOrderSound();
        addToast('success', `Comanda #${newOrder.id} (${newOrder.destino}) inyectada en cocina.`, '🔥 Nueva Comanda');
      },
      onOrderUpdated: (updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
        );
        if (updatedOrder.estado === 'Listo') {
          playReadySound();
          addToast('info', `¡Pedido para ${updatedOrder.destino} está listo para servir!`, '🍽️ Pedido Listo');
        }
      },
      onTablesUpdated: (updatedTables) => {
        setTables(updatedTables);
      },
      onOrdersTimerTick: (updatedOrders) => {
        setOrders(updatedOrders);
      },
      onStatsUpdated: (updatedStats) => {
        setStats(updatedStats);
      },
      onAnnouncement: (announcement) => {
        const toastType = announcement.type === 'danger' ? 'error' : 'info';
        addToast(toastType, announcement.message, `📢 ${announcement.title || 'Aviso de la Plataforma'}`);
      },
      onTenantStatusChanged: (data) => {
        if (data.tenantId === currentTenantId && data.estado === 'cerrado') {
          alert('⚠️ ATENCIÓN: Este restaurante ha sido cerrado o suspendido por la administración de la plataforma. La sesión finalizará de inmediato.');
          handleLogout();
        }
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [user, currentTenantId, fetchData, addToast, handleLogout]);

  // Manejar Login Estricto con Empresa y PIN
  const handleLoginSuccess = (authenticatedUser, selectedTenant) => {
    setUser(authenticatedUser);

    if (authenticatedUser.role === 'superadmin') {
      addToast('success', 'Sesión iniciada como Superadministrador Global.', 'Panel Maestro');
      return;
    }

    const targetTenant = selectedTenant || DEFAULT_TENANT;
    setTenant(targetTenant);
    applyTenantTheme(targetTenant);

    localStorage.setItem('rosty_active_tenant_id', targetTenant.id);
    localStorage.setItem(`rosty_tenant_${targetTenant.id}`, JSON.stringify(targetTenant));

    // RECARGAR MESAS Y ÓRDENES EXCLUSIVAS DE ESTE RESTAURANTE (Cero mezclas)
    const freshTables = getInitialTables(targetTenant);
    const freshOrders = getInitialOrders(targetTenant.id);
    setTables(freshTables);
    setOrders(freshOrders);
    setStats(null);

    // Unirse a la sala de WebSockets del restaurante
    joinTenantRoom(targetTenant.id);

    setActiveTab(authenticatedUser.role === 'chef' ? 'kitchen' : authenticatedUser.role === 'admin' ? 'reports' : 'tables');
    addToast('success', `Turno iniciado en ${targetTenant.nombre} como ${authenticatedUser.name || authenticatedUser.username}.`, '¡Bienvenido!');
  };

  // Guardar Personalización del Restaurante
  const handleSaveConfig = async (newConfig) => {
    const updated = await api.updateTenantConfig(currentTenantId, newConfig);
    setTenant(updated);
    applyTenantTheme(updated);
    localStorage.setItem(`rosty_tenant_${currentTenantId}`, JSON.stringify(updated));
    if (newConfig.numeroMesas) {
      setTables((prev) => generateTables(newConfig.numeroMesas, prev, currentTenantId));
    }
    addToast('success', `Configuración de "${updated.nombre}" guardada con éxito.`, 'Restaurante Actualizado');
  };

  // Guardar Menú Actualizado
  const handleSaveMenu = async (newMenu) => {
    const saved = await api.updateTenantMenu(currentTenantId, newMenu);
    setTenant((prev) => ({ ...prev, menu: saved }));
    localStorage.setItem(`rosty_tenant_${currentTenantId}`, JSON.stringify({ ...tenant, menu: saved }));
    addToast('success', 'El menú y los precios fueron actualizados en tiempo real.', 'Menú Guardado');
  };

  // Cierre de Caja del Día (Corte Z)
  const handleConfirmCloseCash = async (closureData) => {
    try {
      const closure = await api.closeCashRegister(currentTenantId, closureData);
      setOrders([]);
      setStats({
        totalVendido: 0,
        totalComandasDespachadas: 0,
        promedioTicket: 0,
        desgloseMetodos: { efectivo: 0, nequi: 0, daviplata: 0, tarjeta: 0 },
        ultimasVentas: [],
        cierresAnteriores: [closure, ...(stats?.cierresAnteriores || [])]
      });
      addToast('success', 'Cierre Z procesado. Las ventas han sido archivadas y la caja del día comienza en $0.', '💰 Caja Cerrada');
    } catch (err) {
      setOrders([]);
      setStats({
        totalVendido: 0,
        totalComandasDespachadas: 0,
        promedioTicket: 0,
        desgloseMetodos: { efectivo: 0, nequi: 0, daviplata: 0, tarjeta: 0 },
        ultimasVentas: []
      });
      addToast('info', 'Cierre de caja registrado y ventas restablecidas a $0.', '💰 Corte Z');
    }
  };

  // Abrir comanda de mesa
  const handleOpenTableOrder = (numero, pedidoActual) => {
    setOrderModal({
      isOpen: true,
      servicioTipo: 'dine_in',
      mesaNumero: numero,
      initialItems: pedidoActual || []
    });
  };

  // Abrir comanda de Domicilio
  const handleStartDelivery = () => {
    setOrderModal({
      isOpen: true,
      servicioTipo: 'delivery',
      mesaNumero: null,
      initialItems: []
    });
  };

  // Abrir comanda Para Llevar
  const handleStartTakeout = () => {
    setOrderModal({
      isOpen: true,
      servicioTipo: 'takeout',
      mesaNumero: null,
      initialItems: []
    });
  };

  // Abrir Cobro de Mesa
  const handleOpenCheckout = (numero, pedidoActual) => {
    setCheckoutModal({
      isOpen: true,
      mesaNumero: numero,
      items: pedidoActual || []
    });
  };

  // Enviar pedido desde OrderDrawer (Bloqueado al restaurante actual)
  const handleSendOrder = async (orderPayload) => {
    const localId = `ORD-${Date.now().toString().slice(-4)}`;
    const newOrder = {
      id: localId,
      empresaId: currentTenantId,
      tipo: orderPayload.tipo,
      destino: orderPayload.destino,
      cliente: orderPayload.cliente,
      datosExtra: orderPayload.datosExtra,
      items: orderPayload.items,
      total: orderPayload.total,
      estado: 'En preparación',
      minutos: 0,
      limite: orderPayload.tipo === 'delivery' ? 20 : 15,
      createdAt: new Date().toISOString()
    };

    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);

    if (orderPayload.tipo === 'dine_in' && orderPayload.mesaNumero) {
      setTables((prev) =>
        prev.map((t) =>
          t.numero === orderPayload.mesaNumero
            ? { ...t, estado: 'ocupada', apertura: t.apertura || new Date().toISOString(), pedidoActual: orderPayload.items }
            : t
        )
      );
    }

    playNewOrderSound();
    addToast('success', `Comanda #${newOrder.id} (${newOrder.destino}) enviada a la cocina.`, '🔥 ¡Comanda en Cocina!');

    // Notificar por BroadcastChannel exclusivo de esta empresa
    try {
      const channel = new BroadcastChannel(`tenant_sync_${currentTenantId}`);
      channel.postMessage({ type: 'NEW_ORDER', payload: newOrder });
      channel.close();
    } catch (e) {}

    // Sincronizar en segundo plano con el backend pasando currentTenantId
    try {
      const serverOrder = await api.createOrder(
        { ...orderPayload, empresaId: currentTenantId }, 
        currentTenantId
      );
      if (serverOrder && serverOrder.id) {
        setOrders((prev) => prev.map((o) => (o.id === localId ? serverOrder : o)));
      }
    } catch (err) {
      console.debug('Comanda persistida localmente:', err.message);
    }
  };

  // Confirmar cobro y cierre de mesa
  const handleConfirmCloseTable = async (closePayload) => {
    const totalMesa = closePayload.items?.reduce((s, i) => s + i.price * i.cantidad, 0) || 0;

    const newTables = tables.map((t) =>
      t.numero === closePayload.numero
        ? { ...t, estado: 'libre', apertura: null, pedidoActual: [] }
        : t
    );

    setTables(newTables);

    try {
      const channel = new BroadcastChannel(`tenant_sync_${currentTenantId}`);
      channel.postMessage({ type: 'UPDATE_TABLES', payload: newTables });
      channel.close();
    } catch (e) {}

    setOrders((prev) =>
      prev.map((o) =>
        o.destino === `Mesa ${closePayload.numero}` ? { ...o, estado: 'Despachado' } : o
      )
    );

    addToast(
      'success',
      `Mesa #${closePayload.numero} liberada. Pago de $${totalMesa.toLocaleString()} registrado.`,
      'Venta Consolidada'
    );

    try {
      await api.closeTable(closePayload.numero, closePayload, currentTenantId);
      api.getStats(currentTenantId).then((st) => setStats(st)).catch(() => {});
    } catch (err) {
      console.debug('Cierre de mesa guardado localmente:', err.message);
    }
  };

  // Actualizar estado de comanda desde Cocina KDS
  const handleUpdateOrderStatus = async (orderId, nuevoEstado) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, estado: nuevoEstado } : o))
    );

    try {
      const channel = new BroadcastChannel(`tenant_sync_${currentTenantId}`);
      channel.postMessage({ type: 'UPDATE_ORDER', payload: { id: orderId, estado: nuevoEstado } });
      channel.close();
    } catch (e) {}

    if (nuevoEstado === 'Listo') {
      playReadySound();
      addToast('info', 'Pedido marcado como LISTO para servir.', 'Cocina');
    } else if (nuevoEstado === 'Despachado') {
      addToast('success', 'Pedido despachado y entregado.', 'Despacho');
    }

    try {
      await api.updateOrderStatus(orderId, nuevoEstado, currentTenantId);
    } catch (err) {
      console.debug('Estado sincronizado localmente:', err.message);
    }
  };

  // Marcar ítem individual en cocina (Checklist)
  const handleToggleOrderItem = async (orderId, itemId) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId && o.items) {
          const updatedItems = o.items.map((i) =>
            i.id === itemId ? { ...i, completado: !i.completado } : i
          );
          return { ...o, items: updatedItems };
        }
        return o;
      })
    );

    try {
      const channel = new BroadcastChannel(`tenant_sync_${currentTenantId}`);
      channel.postMessage({ type: 'UPDATE_ORDER', payload: { id: orderId, itemId, toggle: true } });
      channel.close();
    } catch (e) {}

    try {
      await api.toggleOrderItem(orderId, itemId, currentTenantId);
    } catch (err) {
      console.debug('Checklist guardado localmente:', err.message);
    }
  };

  // Conteo de pedidos pendientes para el badge de cocina
  const pendingOrdersCount = orders.filter((o) => (o.estado || '').toLowerCase() !== 'listo' && (o.estado || '').toLowerCase() !== 'despachado').length;

  // Si no está autenticado, mostrar Login Modal estricto con selector de empresa
  if (!user) {
    return (
      <>
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
        />
        <PrivacyModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
        />
        <Toast toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // Si es Superadmin Global, renderizar el Panel Maestro de Empresas
  if (user.role === 'superadmin') {
    return (
      <>
        <SuperAdminView
          onLogout={handleLogout}
          onSelectTenantToOpen={(chosenTenant) => {
            localStorage.setItem('rosty_active_tenant_id', chosenTenant.id);
            setTenant(chosenTenant);
            applyTenantTheme(chosenTenant);
            const freshTables = getInitialTables(chosenTenant);
            const freshOrders = getInitialOrders(chosenTenant.id);
            setTables(freshTables);
            setOrders(freshOrders);
            joinTenantRoom(chosenTenant.id);
            setUser({
              id: `u-${chosenTenant.id}-admin`,
              empresaId: chosenTenant.id,
              username: 'admin',
              role: 'admin',
              name: `Superadmin (${chosenTenant.nombre})`
            });
            setActiveTab('tables');
            addToast('info', `Ingresaste en modo auditor a ${chosenTenant.nombre}`, 'Punto de Venta');
          }}
        />
        <Toast toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  const role = user.role;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app, #1f1109)' }}>
      {/* Navbar Superior con Control Estricto de Roles y Branding Dinámico */}
      <Navbar
        user={user}
        tenant={tenant}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUsers={() => setIsUsersOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenCloseCash={() => setIsCloseCashOpen(true)}
        isConnected={isConnected}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Contenido Principal con Aislamiento Estricto por Rol */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* EL MESERO SOLO PUEDE VER SALÓN Y MESAS */}
        {role === 'waiter' && (
          <TablesView
            tables={tables}
            onOpenTableOrder={handleOpenTableOrder}
            onStartDelivery={handleStartDelivery}
            onStartTakeout={handleStartTakeout}
            onOpenCheckout={handleOpenCheckout}
          />
        )}

        {/* EL CHEF SOLO PUEDE VER MONITOR DE COCINA KDS */}
        {role === 'chef' && (
          <KitchenView
            orders={orders}
            tenant={tenant}
            onUpdateStatus={handleUpdateOrderStatus}
            onToggleItem={handleToggleOrderItem}
          />
        )}

        {/* EL ADMINISTRADOR PUEDE NAVEGAR ENTRE REPORTES, MESAS Y COCINA */}
        {role === 'admin' && (
          <>
            {activeTab === 'reports' && (
              <ReportsView
                stats={stats}
                onRefresh={fetchData}
                onOpenCloseCash={() => setIsCloseCashOpen(true)}
              />
            )}
            {activeTab === 'tables' && (
              <TablesView
                tables={tables}
                onOpenTableOrder={handleOpenTableOrder}
                onStartDelivery={handleStartDelivery}
                onStartTakeout={handleStartTakeout}
                onOpenCheckout={handleOpenCheckout}
              />
            )}
            {activeTab === 'kitchen' && (
              <KitchenView
                orders={orders}
                tenant={tenant}
                onUpdateStatus={handleUpdateOrderStatus}
                onToggleItem={handleToggleOrderItem}
              />
            )}
          </>
        )}
      </main>

      {/* Drawer de Toma de Comanda con Menú Exclusivo del Restaurante Activo */}
      <OrderDrawer
        isOpen={orderModal.isOpen}
        onClose={() => setOrderModal((prev) => ({ ...prev, isOpen: false }))}
        servicioTipo={orderModal.servicioTipo}
        mesaNumero={orderModal.mesaNumero}
        initialItems={orderModal.initialItems}
        onSendOrder={handleSendOrder}
        menu={tenant?.menu}
      />

      {/* Modal de Cobro y Facturación */}
      <CheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal((prev) => ({ ...prev, isOpen: false }))}
        mesaNumero={checkoutModal.mesaNumero}
        items={checkoutModal.items}
        onConfirmCloseTable={handleConfirmCloseTable}
        user={user}
      />

      {/* Modal de Normativas, Legal & Seguridad */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Modales de Administración del Restaurante */}
      <CompanySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tenant={tenant}
        onSaveConfig={handleSaveConfig}
      />

      <UserManagementModal
        isOpen={isUsersOpen}
        onClose={() => setIsUsersOpen(false)}
        tenant={tenant}
        currentUser={user}
      />

      <MenuManagementModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        tenant={tenant}
        onSaveMenu={handleSaveMenu}
      />

      <CloseCashModal
        isOpen={isCloseCashOpen}
        onClose={() => setIsCloseCashOpen(false)}
        tenant={tenant}
        user={user}
        stats={stats}
        onConfirmCloseCash={handleConfirmCloseCash}
      />

      {/* Sistema Flotante de Toasts */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
