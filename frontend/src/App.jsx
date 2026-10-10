import React, { useState, useEffect, useCallback } from 'react';
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
import Toast from './components/Toast.jsx';

import { api } from './services/api.js';
import { initSocket, disconnectSocket } from './services/socket.js';
import { playNewOrderSound, playReadySound } from './services/sound.js';
import { DEFAULT_TENANT, applyTenantTheme, getStoredTenant } from './data/tenantConfig.js';

// Función para generar mesas dinámicas según la configuración del restaurante
const generateTables = (count = 14, existingTables = []) => {
  return Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    const existing = existingTables.find((t) => t.numero === num);
    if (existing) return existing;
    return {
      id: num,
      numero: num,
      capacidad: 4,
      estado: num === 3 ? 'ocupada' : num === 7 ? 'ocupada' : num === 9 ? 'cuenta' : 'libre',
      apertura: num === 3 ? new Date(Date.now() - 25 * 60000).toISOString() : null,
      pedidoActual:
        num === 3
          ? [
              { id: 103, name: '1 Pollo + Yuca + Arepa', price: 38000, cantidad: 1 },
              { id: 703, name: 'Gaseosa Familiar 1.5L', price: 7000, cantidad: 1 }
            ]
          : num === 7
            ? [{ id: 405, name: 'Combo 1 Chow Fan (400 gr + 1/4 Pollo)', price: 25000, cantidad: 1 }]
            : []
    };
  });
};

// Órdenes iniciales por defecto
const DEFAULT_ORDERS = [
  {
    id: 'ORD-201',
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
  },
  {
    id: 'ORD-203',
    tipo: 'takeout',
    destino: 'Recoge en Barra',
    cliente: 'Luz Marina',
    datosExtra: 'Para llevar',
    items: [
      { id: 103, name: '1 Pollo + Yuca + Arepa', price: 38000, cantidad: 1, completado: true }
    ],
    total: 38000,
    estado: 'Listo',
    minutos: 3,
    limite: 15
  }
];

export default function App() {
  const [user, setUser] = useState(() => api.getCurrentUser());
  const [tenant, setTenant] = useState(() => getStoredTenant());

  const [activeTab, setActiveTab] = useState(() => {
    const currentUser = api.getCurrentUser();
    return currentUser?.role === 'chef' ? 'kitchen' : currentUser?.role === 'admin' ? 'reports' : 'tables';
  });
  const [isConnected, setIsConnected] = useState(false);

  // Datos principales persistentes
  const [tables, setTables] = useState(() => {
    try {
      const activeTenantId = localStorage.getItem('rosty_active_tenant_id') || 'rosty-broaster';
      const saved = localStorage.getItem(`rosty_tables_${activeTenantId}`);
      if (saved) return JSON.parse(saved);
      return generateTables(getStoredTenant()?.numeroMesas || 14);
    } catch {
      return generateTables(14);
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const activeTenantId = localStorage.getItem('rosty_active_tenant_id') || 'rosty-broaster';
      const saved = localStorage.getItem(`rosty_orders_${activeTenantId}`);
      return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
    } catch {
      return DEFAULT_ORDERS;
    }
  });

  const [stats, setStats] = useState(null);

  // Estados de Modales de Operación
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

  // Sistema de Notificaciones Toasts
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

  // Aplicar tema dinámico de colores de la marca
  useEffect(() => {
    if (tenant) {
      applyTenantTheme(tenant);
    }
  }, [tenant]);

  // Sincronizar número de mesas cuando cambia en la configuración del restaurante
  useEffect(() => {
    if (tenant?.numeroMesas && tables.length !== tenant.numeroMesas) {
      setTables((prev) => generateTables(tenant.numeroMesas, prev));
    }
  }, [tenant?.numeroMesas]);

  // Guardar en localStorage aislado por empresa
  useEffect(() => {
    try {
      const tenantId = tenant?.id || 'rosty-broaster';
      localStorage.setItem(`rosty_tables_${tenantId}`, JSON.stringify(tables));
    } catch (e) {
      console.debug('Storage table save error:', e.message);
    }
  }, [tables, tenant?.id]);

  useEffect(() => {
    try {
      const tenantId = tenant?.id || 'rosty-broaster';
      localStorage.setItem(`rosty_orders_${tenantId}`, JSON.stringify(orders));
    } catch (e) {
      console.debug('Storage order save error:', e.message);
    }
  }, [orders, tenant?.id]);

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

  // Sincronización en tiempo real entre múltiples pestañas del navegador (BroadcastChannel)
  useEffect(() => {
    let channel;
    try {
      channel = new BroadcastChannel(`rosty_sync_${tenant?.id || 'rosty-broaster'}`);
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
    } catch (e) {
      console.debug('BroadcastChannel error:', e);
    }

    return () => {
      if (channel) channel.close();
    };
  }, [tenant?.id, addToast]);

  // Cargar datos iniciales desde el backend si está activo
  const fetchData = useCallback(async () => {
    try {
      const [fetchedTables, fetchedOrders, fetchedStats, fetchedTenant] = await Promise.all([
        api.getTables().catch(() => null),
        api.getOrders().catch(() => null),
        api.getStats().catch(() => null),
        api.getTenant(tenant?.id || 'rosty-broaster').catch(() => null)
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
  }, [tenant?.id]);

  // Inicializar WebSockets y sincronización
  useEffect(() => {
    if (!user) return;

    fetchData();

    initSocket({
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
        if (data.tables && data.tables.length > 0) setTables(data.tables);
        if (data.orders && data.orders.length > 0) setOrders(data.orders);
        if (data.stats) setStats(data.stats);
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
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [user, fetchData, addToast]);

  // Manejar Login Estricto con Empresa y PIN
  const handleLoginSuccess = (authenticatedUser, selectedTenant) => {
    setUser(authenticatedUser);
    if (selectedTenant) {
      setTenant(selectedTenant);
      applyTenantTheme(selectedTenant);
      localStorage.setItem('rosty_active_tenant_id', selectedTenant.id);
      localStorage.setItem(`rosty_tenant_${selectedTenant.id}`, JSON.stringify(selectedTenant));
    }
    setActiveTab(authenticatedUser.role === 'chef' ? 'kitchen' : authenticatedUser.role === 'admin' ? 'reports' : 'tables');
    addToast('success', `Turno iniciado en ${selectedTenant?.nombre || 'el restaurante'} como ${authenticatedUser.name || authenticatedUser.username}.`, '¡Bienvenido!');
  };

  // Manejar Logout
  const handleLogout = () => {
    api.logout();
    disconnectSocket();
    setUser(null);
    addToast('info', 'Sesión cerrada correctamente. Requiere PIN para volver a ingresar.', 'Turno Finalizado');
  };

  // Guardar Personalización del Restaurante (Colores, Nombre, Mesas, WhatsApp)
  const handleSaveConfig = async (newConfig) => {
    const updated = await api.updateTenantConfig(tenant.id, newConfig);
    setTenant(updated);
    applyTenantTheme(updated);
    localStorage.setItem(`rosty_tenant_${tenant.id}`, JSON.stringify(updated));
    if (newConfig.numeroMesas) {
      setTables((prev) => generateTables(newConfig.numeroMesas, prev));
    }
    addToast('success', `Configuración de "${updated.nombre}" guardada con éxito.`, 'Restaurante Actualizado');
  };

  // Guardar Menú Actualizado (Platos, Categorías y Precios)
  const handleSaveMenu = async (newMenu) => {
    const saved = await api.updateTenantMenu(tenant.id, newMenu);
    setTenant((prev) => ({ ...prev, menu: saved }));
    localStorage.setItem(`rosty_tenant_${tenant.id}`, JSON.stringify({ ...tenant, menu: saved }));
    addToast('success', 'El menú y los precios fueron actualizados en tiempo real.', 'Menú Guardado');
  };

  // Cierre de Caja del Día (Corte Z)
  const handleConfirmCloseCash = async (closureData) => {
    try {
      const closure = await api.closeCashRegister(tenant.id, closureData);
      // Reiniciar ventas activas a $0 de inmediato en el front
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
      // Si el backend no respondió, limpiar localmente
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

  // Enviar pedido desde OrderDrawer
  const handleSendOrder = async (orderPayload) => {
    const localId = `ORD-${Date.now().toString().slice(-4)}`;
    const newOrder = {
      id: localId,
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

    // Notificar a otras pestañas
    try {
      const channel = new BroadcastChannel(`rosty_sync_${tenant?.id || 'rosty-broaster'}`);
      channel.postMessage({ type: 'NEW_ORDER', payload: newOrder });
      channel.close();
    } catch (e) {}

    // Sincronizar en segundo plano con el backend
    try {
      const serverOrder = await api.createOrder(orderPayload);
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
      const channel = new BroadcastChannel(`rosty_sync_${tenant?.id || 'rosty-broaster'}`);
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
      await api.closeTable(closePayload.numero, closePayload);
      api.getStats().then((st) => setStats(st)).catch(() => {});
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
      const channel = new BroadcastChannel(`rosty_sync_${tenant?.id || 'rosty-broaster'}`);
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
      await api.updateOrderStatus(orderId, nuevoEstado);
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
      const channel = new BroadcastChannel(`rosty_sync_${tenant?.id || 'rosty-broaster'}`);
      channel.postMessage({ type: 'UPDATE_ORDER', payload: { id: orderId, itemId, toggle: true } });
      channel.close();
    } catch (e) {}

    try {
      await api.toggleOrderItem(orderId, itemId);
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

      {/* Drawer de Toma de Comanda con Menú Dinámico */}
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
