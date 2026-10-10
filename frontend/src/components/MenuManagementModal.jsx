import React, { useState, useEffect } from 'react';
import { 
  X, 
  UtensilsCrossed, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Search, 
  Tag, 
  CheckCircle2, 
  AlertTriangle,
  FolderPlus
} from 'lucide-react';
import { formatCurrency, MENU_CATEGORIES } from '../data/menu.js';

export default function MenuManagementModal({ 
  isOpen, 
  onClose, 
  tenant, 
  onSaveMenu 
}) {
  const [menu, setMenu] = useState(() => tenant?.menu || MENU_CATEGORIES);
  const [selectedCat, setSelectedCat] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Estado para nuevo plato
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Estado para nueva categoría
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  // Estado para edición en línea de plato
  const [editingItem, setEditingItem] = useState(null); // { cat, id, name, price, desc }

  useEffect(() => {
    if (tenant?.menu) {
      setMenu(tenant.menu);
    } else {
      setMenu(MENU_CATEGORIES);
    }
  }, [tenant]);

  useEffect(() => {
    const cats = Object.keys(menu || {});
    if (cats.length > 0 && (!selectedCat || !cats.includes(selectedCat))) {
      setSelectedCat(cats[0]);
      setNewItemCategory(cats[0]);
    }
  }, [menu, selectedCat]);

  if (!isOpen) return null;

  const categories = Object.keys(menu || {});

  // Agregar nuevo producto
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice || Number(newItemPrice) <= 0) {
      setFeedback({ type: 'error', msg: 'Ingresa un nombre y precio válido para el plato.' });
      return;
    }

    const catKey = newItemCategory || selectedCat || categories[0];
    if (!catKey) {
      setFeedback({ type: 'error', msg: 'Selecciona una categoría para el producto.' });
      return;
    }

    const newId = Date.now();
    const createdItem = {
      id: newId,
      name: newItemName.trim(),
      price: Number(newItemPrice),
      desc: newItemDesc.trim() || 'Plato preparado al instante.'
    };

    setMenu((prev) => {
      const currentItems = prev[catKey] || [];
      return {
        ...prev,
        [catKey]: [...currentItems, createdItem]
      };
    });

    setNewItemName('');
    setNewItemPrice('');
    setNewItemDesc('');
    setFeedback({ type: 'success', msg: `¡"${createdItem.name}" añadido a ${catKey}!` });
  };

  // Agregar nueva categoría
  const handleAddCategory = (e) => {
    e.preventDefault();
    const catName = newCategoryName.trim();
    if (!catName) return;
    if (menu[catName]) {
      setFeedback({ type: 'error', msg: 'Esta categoría ya existe en el menú.' });
      return;
    }

    setMenu((prev) => ({
      ...prev,
      [catName]: []
    }));
    setSelectedCat(catName);
    setNewItemCategory(catName);
    setNewCategoryName('');
    setShowAddCat(false);
    setFeedback({ type: 'success', msg: `Categoría "${catName}" creada. ¡Ahora puedes añadirle platos!` });
  };

  // Iniciar edición de plato
  const startEdit = (cat, item) => {
    setEditingItem({
      category: cat,
      id: item.id,
      name: item.name,
      price: item.price,
      desc: item.desc || ''
    });
  };

  // Guardar edición de plato
  const saveEdit = () => {
    if (!editingItem) return;
    const { category, id, name, price, desc } = editingItem;
    if (!name.trim() || Number(price) <= 0) {
      alert('Nombre y precio son requeridos');
      return;
    }

    setMenu((prev) => {
      const updatedCatItems = (prev[category] || []).map((i) =>
        i.id === id ? { ...i, name: name.trim(), price: Number(price), desc: desc.trim() } : i
      );
      return {
        ...prev,
        [category]: updatedCatItems
      };
    });

    setEditingItem(null);
    setFeedback({ type: 'success', msg: 'Plato actualizado con éxito.' });
  };

  // Eliminar producto
  const handleDeleteItem = (cat, itemId, itemName) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${itemName}" del menú?`)) return;

    setMenu((prev) => {
      const updatedList = (prev[cat] || []).filter((i) => i.id !== itemId);
      return {
        ...prev,
        [cat]: updatedList
      };
    });
    setFeedback({ type: 'info', msg: `Plato "${itemName}" eliminado.` });
  };

  // Eliminar categoría completa
  const handleDeleteCategory = (cat) => {
    if (categories.length <= 1) {
      alert('Debe haber al menos una categoría en el menú.');
      return;
    }
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${cat}" y todos sus productos?`)) return;

    setMenu((prev) => {
      const copy = { ...prev };
      delete copy[cat];
      return copy;
    });

    const remaining = categories.filter((c) => c !== cat);
    setSelectedCat(remaining[0] || '');
    setFeedback({ type: 'info', msg: `Categoría "${cat}" eliminada.` });
  };

  // Guardar todo en Backend
  const handleSaveAll = async () => {
    setIsSaving(true);
    setFeedback({ type: '', msg: '' });

    try {
      await onSaveMenu(menu);
      setFeedback({ type: 'success', msg: '¡Menú guardado y publicado con éxito para todo el restaurante!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message || 'Error al guardar menú.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Platos filtrados por búsqueda o por categoría
  const activeItems = (menu[selectedCat] || []).filter((item) =>
    searchTerm ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
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
          width: '100%',
          maxWidth: '1050px',
          maxHeight: '92vh',
          backgroundColor: '#26160c',
          border: '3px solid #e27329',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#3d2314',
            borderBottom: '2px solid #5c351e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(226, 115, 41, 0.2)',
                border: '2px solid #e27329',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffcc00'
              }}
            >
              <UtensilsCrossed size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: '#ffcc00' }}>
                Gestión de Menú, Platos & Precios
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#fbeee0' }}>
                Restaurante: <strong>{tenant?.nombre || 'Mi Restaurante'}</strong> • Edita precios, añade platos y organiza tus categorías
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#c4a48c',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Notificación Feedback */}
        {feedback.msg && (
          <div
            style={{
              margin: '12px 24px 0 24px',
              padding: '10px 16px',
              backgroundColor: feedback.type === 'error' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(46, 125, 50, 0.2)',
              border: `1.5px solid ${feedback.type === 'error' ? '#f44336' : '#4caf50'}`,
              borderRadius: '10px',
              color: feedback.type === 'error' ? '#ff8a80' : '#81c784',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {feedback.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Contenido Principal */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Fila de Categorías y Buscador */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {categories.map((cat) => {
                const isSelected = selectedCat === cat;
                const count = (menu[cat] || []).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setSelectedCat(cat); setNewItemCategory(cat); }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '0.825rem',
                      fontWeight: '800',
                      border: isSelected ? '2px solid #ffcc00' : '1px solid #5c351e',
                      backgroundColor: isSelected ? '#e27329' : '#1f1109',
                      color: isSelected ? '#fff' : '#fbeee0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{cat}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8, backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '10px' }}>
                      {count}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowAddCat(!showAddCat)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.825rem',
                  fontWeight: '800',
                  border: '1.5px dashed #ffcc00',
                  backgroundColor: 'rgba(255, 204, 0, 0.1)',
                  color: '#ffcc00',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FolderPlus size={16} />
                <span>+ Nueva Categoría</span>
              </button>
            </div>

            {/* Buscador */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Buscar plato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '10px',
                  backgroundColor: '#1f1109',
                  border: '1.5px solid #5c351e',
                  color: '#fff',
                  fontSize: '0.825rem'
                }}
              />
              <Search size={15} color="#c4a48c" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            </div>
          </div>

          {/* Formulario Agregar Categoría (Si activo) */}
          {showAddCat && (
            <form
              onSubmit={handleAddCategory}
              className="animate-fade-in"
              style={{
                backgroundColor: '#1f1109',
                border: '1.5px solid #ffcc00',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                required
                placeholder="Nombre de la nueva categoría (Ej: Postres Caseros 🍨, Bebidas 🥤)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#2b180d',
                  border: '1px solid #5c351e',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#2e7d32',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Crear Categoría
              </button>
              <button
                type="button"
                onClick={() => setShowAddCat(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#c4a48c',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </form>
          )}

          {/* Formulario Añadir Nuevo Plato */}
          <div
            style={{
              backgroundColor: '#1f1109',
              borderRadius: '16px',
              border: '2px solid #5c351e',
              padding: '16px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffcc00', fontWeight: '800', fontSize: '0.95rem', marginBottom: '12px' }}>
              <Plus size={18} color="#e27329" />
              <span>Añadir Producto a "{selectedCat || 'Categoría'}"</span>
            </div>

            <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '12px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#fbeee0', marginBottom: '4px' }}>
                  Nombre del Plato *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Salchipapa Gigante con Queso"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#2b180d',
                    border: '1.5px solid #5c351e',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#fbeee0', marginBottom: '4px' }}>
                  Precio ($ COP) *
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  placeholder="Ej: 18000"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#2b180d',
                    border: '1.5px solid #5c351e',
                    color: '#ffcc00',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#fbeee0', marginBottom: '4px' }}>
                  Descripción / Acompañamiento
                </label>
                <input
                  type="text"
                  placeholder="Ej: Con papas a la francesa, ripio, salsas y queso costeño"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#2b180d',
                    border: '1.5px solid #5c351e',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#e27329',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(226, 115, 41, 0.4)'
                }}
              >
                <Plus size={16} /> Añadir
              </button>
            </form>
          </div>

          {/* Lista de Platos de la Categoría */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fbeee0' }}>
                Platos en {selectedCat} ({activeItems.length})
              </div>
              {selectedCat && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(selectedCat)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ff8a80',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Eliminar esta categoría
                </button>
              )}
            </div>

            {activeItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#c4a48c', padding: '30px', backgroundColor: '#1f1109', borderRadius: '12px' }}>
                No hay platos en esta categoría o no coinciden con la búsqueda.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '12px' }}>
                {activeItems.map((item) => {
                  const isEditing = editingItem?.id === item.id;

                  if (isEditing) {
                    return (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: '#2b180d',
                          border: '2px solid #ffcc00',
                          borderRadius: '14px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <input
                          type="text"
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#1f1109',
                            border: '1px solid #5c351e',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: '0.85rem'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="number"
                            value={editingItem.price}
                            onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                            style={{
                              width: '120px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#1f1109',
                              border: '1px solid #5c351e',
                              color: '#ffcc00',
                              fontWeight: '800',
                              fontSize: '0.85rem'
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Descripción"
                            value={editingItem.desc}
                            onChange={(e) => setEditingItem({ ...editingItem, desc: e.target.value })}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#1f1109',
                              border: '1px solid #5c351e',
                              color: '#c4a48c',
                              fontSize: '0.8rem'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setEditingItem(null)}
                            style={{
                              backgroundColor: '#5c351e',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={saveEdit}
                            style={{
                              backgroundColor: '#2e7d32',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontWeight: '800',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#1f1109',
                        border: '1.5px solid #4a2816',
                        borderRadius: '14px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontWeight: '800', color: '#ffffff', fontSize: '0.9rem' }}>
                            {item.name}
                          </span>
                          <span style={{ fontWeight: '900', color: '#ffcc00', fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        {item.desc && (
                          <div style={{ fontSize: '0.78rem', color: '#c4a48c', marginTop: '4px', lineHeight: 1.3 }}>
                            {item.desc}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid #331d10', paddingTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => startEdit(selectedCat, item)}
                          style={{
                            backgroundColor: 'rgba(255, 204, 0, 0.1)',
                            border: '1px solid #ffcc00',
                            color: '#ffcc00',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit2 size={12} /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(selectedCat, item.id, item.name)}
                          style={{
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            border: '1px solid #f44336',
                            color: '#ff8a80',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer con Botón Publicar Menú */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#3d2314',
            borderTop: '2px solid #5c351e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#c4a48c' }}>
            Los cambios se aplicarán en tiempo real en los salones y comandas.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1.5px solid #5c351e',
                color: '#fbeee0',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAll}
              style={{
                backgroundColor: '#2e7d32',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(46, 125, 50, 0.5)'
              }}
            >
              <Save size={18} />
              {isSaving ? 'Guardando...' : 'Guardar y Publicar Menú'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
