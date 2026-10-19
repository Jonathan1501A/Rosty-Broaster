import { formatCurrency } from '../data/menu.js';

/**
 * Genera el enlace oficial de WhatsApp para despacho de domicilios
 * @param {Object} order - Objeto comanda
 * @param {string} driverPhone - Teléfono del domiciliario o grupo de despacho
 * @param {string} restaurantName - Nombre del restaurante remitente
 * @returns {string} Enlace wa.me codificado listo para abrir
 */
export const buildWhatsAppDeliveryLink = (order, driverPhone = '', restaurantName = 'ROSTY Broaster') => {
  if (!order) return '';

  const cleanPhone = (driverPhone || '').replace(/[^0-9]/g, '');

  const itemsList = (order.items || [])
    .map((item) => `• *${item.cantidad}x* ${item.name} (${formatCurrency(item.price * item.cantidad)})`)
    .join('\n');

  const driverLine = order.domiciliarioNombre ? `🏍️ *Domiciliario:* ${order.domiciliarioNombre}\n` : '';

  const messageText = `🛵 *PEDIDO PARA DOMICILIO - ${restaurantName.toUpperCase()}*

📋 *Comanda:* #${order.id}
${driverLine}👤 *Cliente:* ${order.cliente || 'Cliente'}
📍 *Dirección de Entrega:* ${order.destino || 'Sin dirección'}
📞 *Contacto Cliente:* ${order.datosExtra ? order.datosExtra.replace('Tel: ', '') : 'No especificado'}

🍱 *Detalle del Pedido:*
${itemsList}

💰 *TOTAL A COBRAR:* ${formatCurrency(order.total)}

_Por favor confirmar recibido y salida hacia la entrega._`;

  const encodedMessage = encodeURIComponent(messageText);

  if (cleanPhone) {
    // Si tiene indicativo o celular directo
    const formattedPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
  }

  // Si no hay teléfono fijo configurado, abre WhatsApp para seleccionar el contacto o grupo
  return `https://api.whatsapp.com/send?text=${encodedMessage}`;
};

/**
 * Abre directamente WhatsApp Web o app nativa
 */
export const openWhatsAppDelivery = (order, driverPhone = '', restaurantName = 'ROSTY Broaster') => {
  const url = buildWhatsAppDeliveryLink(order, driverPhone, restaurantName);
  window.open(url, '_blank', 'noopener,noreferrer');
};
