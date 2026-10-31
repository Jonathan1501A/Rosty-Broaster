import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  Bike, 
  ShoppingBag, 
  UtensilsCrossed, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { MENU_CATEGORIES, formatCurrency } from '../data/menu.js';
import JuiceFlavorModal from './JuiceFlavorModal.jsx';

export default function OrderDrawer({ 
  isOpen, 
  onClose, 
  servicioTipo, // 'dine_in' | 'delivery' | 'takeout'
  mesaNumero, 
  initialItems = [], 
  onSendOrder,
  onUpdateExistingOrder,
  editingOrderId = null,
  menu,
  tenant
}) {
  const currentMenu = menu && Object.keys(menu).length > 0 ? menu : MENU_CATEGORIES;
  const categoriesList = Object.keys(currentMenu);
  const [activeCategory, setActiveCategory] = useState(categoriesList[0] || 'Pollo Broaster 🍗');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const domiciliarios = tenant?.domiciliarios || [];
  const [selectedDomiciliarioId, setSelectedDomiciliarioId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isJuiceModalOpen, setIsJuiceModalOpen] = useState(false);
  const [juiceModalProduct, setJuiceModalProduct] = useState(null);
  const [editingCartItem, setEditingCartItem] = useState(null);

  const isJuiceProduct = (product) => {
    if (!product) return false;
    const name = String(product.name || '').toLowerCase();
    const desc = String(product.desc || '').toLowerCase();
    const cat = String(activeCategory || '').toLowerCase();
    return name.includes('jugo') || desc.includes('mora') || desc.includes('maracuyá') || cat.includes('jugo');
  };

  const handleProductClick = (product) => {
    if (isJuiceProduct(product)) {
      setJuiceModalProduct(product);
      setEditingCartItem(null);
      setIsJuiceModalOpen(true);
    } else {
      handleAddToCart(product);
    }
  };

  const handleOpenFlavorForEdit = (cartItem) => {
    setJuiceModalProduct(cartItem);
    setEditingCartItem(cartItem);
    setIsJuiceModalOpen(true);
  };

  const handleConfirmJuiceFlavor = (customizedProduct) => {
    if (editingCartItem) {
      setCart((prev) =>
        prev.map((it) => (it.id === editingCartItem.id ? { ...customizedProduct, cantidad: editingCartItem.cantidad } : it))
      );
      setEditingCartItem(null);
    } else {
      setCart((prev) => {
        const exists = prev.find((item) => item.id === customizedProduct.id);
        if (exists) {
          return prev.map((item) =>
            item.id === customizedProduct.id ? { ...item, cantidad: item.cantidad + 1 } : item
          );
        }
        return [...prev, { ...customizedProduct, cantidad: 1, completado: false }];
      });
    }
  };

  useEffect(() => {
    if (categoriesList.length > 0 && !categoriesList.includes(activeCategory)) {
      setActiveCategory(categoriesList[0]);
    }
  }, [menu]);

  // Guardar referencia del estado anterior para inicializar solo al ABRIR
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Solo inicializar exactamente cuando el drawer se abre de cerrado a abierto
      setCart(initialItems && initialItems.length > 0 ? JSON.parse(JSON.stringify(initialItems)) : []);
      setCustomerData({ name: '', phone: '', address: '' });
      setSelectedDomiciliarioId(domiciliarios[0]?.id || '');
      setValidationError('');
      setSearchQuery('');
      setIsSubmitting(false);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  if (!isOpen) return null;

  // Agregar al carrito
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...product, cantidad: 1, completado: false }];
    });
  };

  // Restar del carrito
  const handleDecreaseQuantity = (productId) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === productId);
      if (!item) return prev;
      if (item.cantidad === 1) {
        return prev.filter((i) => i.id !== productId);
      }
      return prev.map((i) =>
        i.id === productId ? { ...i, cantidad: i.cantidad - 1 } : i
      );
    });
  };

  // Eliminar producto
  const handleRemoveProduct = (productId) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.cantidad, 0);
  };

  // Envío o actualización de comanda
  const handleSubmitOrder = async () => {
    setValidationError('');

    if (cart.length === 0) {
      setValidationError('Debe agregar al menos un plato o bebida a la comanda antes de enviar.');
      return;
    }

    // Nombres y datos con fallback inteligente
    const finalCustomerName = customerData.name.trim() || (servicioTipo === 'dine_in' ? 'Salón' : servicioTipo === 'delivery' ? 'Cliente Domicilio' : 'Cliente Barra');
    const finalPhone = customerData.phone.trim() || '3000000000';
    const finalAddress = customerData.address.trim() || (servicioTipo === 'delivery' ? 'Dirección de Entrega' : '');

    if (servicioTipo === 'delivery' && !customerData.address.trim() && !editingOrderId) {
      setValidationError('Por favor ingrese la dirección de entrega del domicilio.');
      return;
    }

    const chosenDriver = domiciliarios.find((d) => d.id === selectedDomiciliarioId);
    const domiciliarioId = chosenDriver ? chosenDriver.id : null;
    const domiciliarioNombre = chosenDriver ? chosenDriver.nombre : null;
    const domiciliarioTelefono = chosenDriver ? chosenDriver.telefono : null;

    const payload = {
      tipo: servicioTipo,
      mesaNumero: servicioTipo === 'dine_in' ? Number(mesaNumero || 1) : null,
      destino: servicioTipo === 'dine_in' ? `Mesa ${mesaNumero || 1}` : servicioTipo === 'delivery' ? finalAddress : 'Retiro en Barra',
      cliente: finalCustomerName,
      datosExtra: servicioTipo === 'delivery' ? `Tel: ${finalPhone}` : servicioTipo === 'takeout' ? (customerData.phone.trim() ? `Tel/Nota: ${customerData.phone.trim()}` : 'Para llevar') : 'Salón',
      items: cart,
      total: calculateTotal(),
      domiciliarioId,
      domiciliarioNombre,
      domiciliarioTelefono
    };

    setIsSubmitting(true);
    try {
      if (editingOrderId && onUpdateExistingOrder) {
        await onUpdateExistingOrder(editingOrderId, payload);
      } else {
        await onSendOrder(payload);
      }
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Error al procesar la comanda');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtro de productos
  const currentCategoryProducts = currentMenu[activeCategory] || [];
  const filteredProducts = currentCategoryProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(5px)',
        zIndex: 9990,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-in-right"
        style={{
          width: '100%',
          maxWidth: '960px',
          height: '100%',
          backgroundColor: '#1f1109',
          borderLeft: '3px solid #e27329',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.85)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#3d2314',
            borderBottom: '2px solid #5c351e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(226, 115, 41, 0.25)',
                border: '2px solid #e27329',
                color: '#ffcc00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {servicioTipo === 'dine_in' ? <UtensilsCrossed size={24} /> : servicioTipo === 'delivery' ? <Bike size={24} /> : <ShoppingBag size={24} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffcc00', margin: 0 }}>
                {editingOrderId 
                  ? `✏️ Modificar Comanda #${editingOrderId}`
                  : servicioTipo === 'dine_in'
                  ? `Comanda Mesa #${mesaNumero}`
                  : servicioTipo === 'delivery'
                  ? 'Nuevo Pedido Domicilio'
                  : 'Pedido Para Llevar'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#fbeee0', margin: 0 }}>
                {editingOrderId ? 'Agrega o retira platos de la comanda activa' : 'Selecciona los platos y bebidas del catálogo'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Botón Principal en el Header: Siempre 100% visible */}
            <button
              type="button"
              disabled={isSubmitting || cart.length === 0}
              onClick={handleSubmitOrder}
              style={{
                backgroundColor: cart.length > 0 ? '#e27329' : '#3d2314',
                color: cart.length > 0 ? '#ffffff' : '#c4a48c',
                border: cart.length > 0 ? '2px solid #ffcc00' : '1.5px solid #5c351e',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: '900',
                boxShadow: cart.length > 0 ? '0 4px 18px rgba(226, 115, 41, 0.6)' : 'none',
                opacity: cart.length === 0 ? 0.6 : 1,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={16} />
              <span>
                {isSubmitting
                  ? 'Guardando...'
                  : cart.length === 0
                  ? 'Comanda Vacía'
                  : editingOrderId
                  ? `💾 GUARDAR CAMBIOS (${formatCurrency(calculateTotal())})`
                  : `🔥 ENVIAR A COCINA (${formatCurrency(calculateTotal())})`}
              </span>
            </button>

            <button
              onClick={onClose}
              style={{
                backgroundColor: '#2b180d',
                color: '#fbeee0',
                border: '1.5px solid #5c351e',
                padding: '8px 12px',
                borderRadius: '8px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Layout Dividido: Catálogo a la izquierda, Carrito a la derecha */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
          {/* Columna Izquierda: Menú */}
          <div
            style={{
              flex: 1.35,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRight: '2px solid #3d2314',
              backgroundColor: '#26160c',
              overflow: 'hidden'
            }}
          >
            {/* Buscador y Categorías */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #3d2314', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} color="#c4a48c" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Buscar pollo, paisa, carta, porciones, bebida..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '38px',
                    backgroundColor: '#1f1109',
                    border: '1.5px solid #5c351e',
                    color: '#fff'
                  }}
                />
              </div>

              {/* Categorías Pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {categoriesList.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        padding: '7px 14px',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        borderRadius: '20px',
                        backgroundColor: isActive ? '#e27329' : '#3d2314',
                        color: isActive ? '#fff' : '#fbeee0',
                        border: isActive ? '1.5px solid #ffcc00' : '1px solid #5c351e'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid de Productos */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredProducts.map((product) => {
                const inCartItem = cart.find((i) => i.id === product.id);
                const quantityInCart = inCartItem ? inCartItem.cantidad : 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    style={{
                      backgroundColor: quantityInCart > 0 ? '#422515' : '#341e11',
                      border: quantityInCart > 0 ? '2px solid #e27329' : '1.5px solid #52301c',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#ffcc00';
                      e.currentTarget.style.backgroundColor = '#4d2b18';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = quantityInCart > 0 ? '#e27329' : '#52301c';
                      e.currentTarget.style.backgroundColor = quantityInCart > 0 ? '#422515' : '#341e11';
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffffff' }}>
                          {product.name}
                        </span>
                        {quantityInCart > 0 && (
                          <span
                            style={{
                              backgroundColor: '#e27329',
                              color: '#fff',
                              fontSize: '0.72rem',
                              fontWeight: '900',
                              padding: '2px 7px',
                              borderRadius: '10px'
                            }}
                          >
                            x{quantityInCart}
                          </span>
                        )}
                      </div>
                      {product.desc && (
                        <p style={{ fontSize: '0.8rem', color: '#c4a48c', marginTop: '2px' }}>
                          {product.desc}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: '900', color: '#ffcc00', fontSize: '1.05rem', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(product.price)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        style={{
                          backgroundColor: '#e27329',
                          color: '#fff',
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Barra rápida de catálogo: visible en cuanto se agrega al menos 1 producto */}
            {cart.length > 0 && (
              <div
                style={{
                  flexShrink: 0,
                  padding: '12px 18px',
                  backgroundColor: '#341e11',
                  borderTop: '2px solid #e27329',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 -6px 20px rgba(0,0,0,0.6)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#c4a48c', fontWeight: '700' }}>
                    {cart.reduce((s, i) => s + i.cantidad, 0)} {cart.reduce((s, i) => s + i.cantidad, 0) === 1 ? 'plato seleccionado' : 'platos seleccionados'}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                    {formatCurrency(calculateTotal())}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: '#e27329',
                    border: '2px solid #ffcc00',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: '900',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 16px rgba(226, 115, 41, 0.7)'
                  }}
                >
                  <Send size={16} /> 🔥 ENVIAR A COCINA
                </button>
              </div>
            )}
          </div>

          {/* Columna Derecha: Formulario & Carrito */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#1f1109',
              overflow: 'hidden'
            }}
          >
            {/* Formulario de Domicilio o Llevar */}
            {servicioTipo === 'delivery' && (
              <div style={{ padding: '16px', backgroundColor: '#2b180d', borderBottom: '1.5px solid #5c351e' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#ffcc00', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  🛵 Datos del Domicilio & Cliente
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {domiciliarios.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#ffcc00', marginBottom: '4px', fontWeight: '700' }}>
                        🛵 Asignar Domiciliario:
                      </label>
                      <select
                        value={selectedDomiciliarioId}
                        onChange={(e) => setSelectedDomiciliarioId(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#1f1109',
                          border: '1.5px solid #5c351e',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#ffcc00',
                          fontSize: '0.85rem',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">-- Sin asignar (Cualquiera disponible) --</option>
                        {domiciliarios.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombre} ({d.telefono || 'Sin WhatsApp'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Nombre completo del cliente"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="tel"
                      placeholder="Teléfono / WhatsApp"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                      style={{ fontSize: '0.85rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Dirección exacta"
                      value={customerData.address}
                      onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
                {/* Nota Habeas Data */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.72rem', color: '#c4a48c' }}>
                  <ShieldCheck size={14} color="#2e7d32" />
                  <span>Tratamiento de datos exclusivo para despacho (Ley 1581).</span>
                </div>
              </div>
            )}

            {servicioTipo === 'takeout' && (
              <div style={{ padding: '16px', backgroundColor: '#2b180d', borderBottom: '1.5px solid #5c351e', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#ffcc00', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    🛍️ Nombre del cliente (Retiro en barra): *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Luz Marina / Carlos"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#c4a48c', display: 'block', marginBottom: '4px' }}>
                    Teléfono o Nota adicional (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 3201234567 / Sin cebolla"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            )}

            {/* Lista del Carrito */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ffcc00', textTransform: 'uppercase' }}>
                  Ítems de la Comanda ({cart.reduce((s, i) => s + i.cantidad, 0)})
                </span>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart([])}
                    style={{ background: 'transparent', color: '#c62828', fontSize: '0.75rem', padding: '2px 4px' }}
                  >
                    Vaciar
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#c4a48c' }}>
                  <ShoppingBag size={40} style={{ opacity: 0.35, margin: '0 auto 10px auto', display: 'block' }} />
                  <p style={{ fontSize: '0.9rem', color: '#fbeee0', fontWeight: '700' }}>No hay platos agregados.</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Toca cualquier plato del menú para agregarlo.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#341e11',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      border: '1.5px solid #52301c',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '800', color: '#ffffff', flex: 1 }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(item.price * item.cantidad)}
                      </span>
                    </div>

                    {(item.sabor || item.nota) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {item.sabor && (
                          <button
                            type="button"
                            onClick={() => handleOpenFlavorForEdit(item)}
                            title="Haz clic para modificar el sabor"
                            style={{
                              backgroundColor: 'rgba(255, 204, 0, 0.15)',
                              border: '1px solid #ffcc00',
                              color: '#ffcc00',
                              fontSize: '0.72rem',
                              fontWeight: '800',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            🥤 Sabor: {item.sabor} ✏️
                          </button>
                        )}
                        {item.nota && item.nota !== `Sabor: ${item.sabor}` && (
                          <span style={{ fontSize: '0.72rem', color: '#c4a48c', fontStyle: 'italic' }}>
                            "{item.nota}"
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#c4a48c' }}>
                        {formatCurrency(item.price)} c/u
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleDecreaseQuantity(item.id)}
                          style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: '#4a2c1a',
                            color: '#fff',
                            borderRadius: '6px',
                            padding: 0
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '0.9rem', fontWeight: '900', minWidth: '18px', textAlign: 'center', color: '#ffcc00' }}>
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: '#e27329',
                            color: '#fff',
                            borderRadius: '6px',
                            padding: 0
                          }}
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(item.id)}
                          style={{
                            background: 'transparent',
                            color: '#c62828',
                            padding: '4px',
                            marginLeft: '4px'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Errores de Validación */}
            {validationError && (
              <div
                style={{
                  margin: '0 16px 10px 16px',
                  backgroundColor: 'rgba(198, 40, 40, 0.2)',
                  border: '1.5px solid #c62828',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  color: '#ff8a80',
                  fontSize: '0.825rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Footer Carrito & Enviar */}
            <div
              style={{
                flexShrink: 0,
                padding: '16px 20px',
                backgroundColor: '#2b180d',
                borderTop: '2px solid #5c351e',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', color: '#fbeee0', fontWeight: '800' }}>Total Comanda:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffcc00', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(calculateTotal())}
                </span>
              </div>

              <button
                type="button"
                disabled={isSubmitting || cart.length === 0}
                onClick={handleSubmitOrder}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: cart.length > 0 ? '#e27329' : '#3d2314',
                  border: cart.length > 0 ? '2px solid #ffcc00' : '1.5px solid #5c351e',
                  color: cart.length > 0 ? '#fff' : '#c4a48c',
                  fontSize: '1rem',
                  fontWeight: '900',
                  boxShadow: cart.length > 0 ? '0 6px 20px -2px rgba(226, 115, 41, 0.6)' : 'none',
                  opacity: cart.length === 0 ? 0.6 : 1,
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? (
                  <span>Procesando comanda...</span>
                ) : cart.length === 0 ? (
                  <span>🛒 Selecciona platos para enviar</span>
                ) : editingOrderId ? (
                  <>
                    <Send size={18} /> 💾 GUARDAR CAMBIOS EN COMANDA ({formatCurrency(calculateTotal())})
                  </>
                ) : (
                  <>
                    <Send size={18} /> 🔥 ENVIAR A COCINA ({formatCurrency(calculateTotal())})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Selección y Personalización de Sabores de Jugo */}
      <JuiceFlavorModal
        isOpen={isJuiceModalOpen}
        onClose={() => {
          setIsJuiceModalOpen(false);
          setEditingCartItem(null);
        }}
        product={juiceModalProduct}
        initialFlavor={editingCartItem?.sabor || ''}
        initialBase={editingCartItem?.base || ''}
        initialNote={editingCartItem?.nota || ''}
        onConfirmFlavor={handleConfirmJuiceFlavor}
      />
    </div>
  );
}
