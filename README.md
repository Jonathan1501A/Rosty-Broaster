# 🍗 ROSTY Broaster & SaaS Gastronómico Multi-Empresa (POS & KDS)

> **Plataforma gastronómica integral y sistema Multi-Restaurante (SaaS)** para salones, comandas, pantallas de cocina (KDS), despachos por WhatsApp, gestión de menús, personal con PIN y auditoría contable con Cierre de Caja del Día (Corte Z).

---

## 🌟 Nuevas Características Implementadas

### 1. 🏢 Arquitectura Multi-Empresa (Multi-Tenant Independiente)
- Permite registrar múltiples restaurantes independientes en el mismo sistema.
- **Aislamiento 100% de datos**: Las mesas, ventas, comandas, cierres de caja y empleados de una empresa **nunca** se mezclan con otra.
- Menú base oficial precargado de **ROSTY Broaster** con precios y combos de los volantes originales.

### 2. 🎨 Personalización Completa por Restaurante
Desde el panel de **Ajustes** de cada empresa, el administrador puede:
- Modificar el **Nombre del Restaurante**, Slogan e Ícono/Emoji representativo.
- **Selector de Paleta de Colores Dinámica**: Inyecta variables CSS en tiempo real (`--brand-primary`, `--brand-gold`, `--bg-app`, `--bg-surface`) adaptando la interfaz a la identidad corporativa de cualquier negocio.
- **Número de Mesas Configurable**: Genera la grilla del salón con la cantidad exacta de mesas del local.
- **WhatsApp del Domiciliario**: Define el número central para el envío de comandas.

### 3. 📋 Gestión Dinámica de Menú & Precios
- Añadir nuevos platos con nombre, precio y descripción.
- Crear nuevas categorías con íconos personalizados.
- Editar precios y detalles de platos existentes en vivo.
- Eliminar platos o categorías obsoletas.
- Sincronización instantánea con el catálogo de comandas del mesero.

### 4. 👥 Gestión de Personal & Seguridad Estricta de Roles
- **Eliminación del cambio libre de roles**: Los empleados quedan restringidos a su rol y solo pueden cambiar de sesión cerrando turno e ingresando con su respectivo PIN de seguridad.
- Creación de nuevos usuarios con rol (**Mesero**, **Cocinero / KDS**, **Administrador**) y clave PIN cifrada con **Bcrypt**.
- **Mesero**: Únicamente salón, toma de comandas, cobro de mesas y registro de clientes.
- **Cocinero**: Monitor de cocina KDS con tarjetas de preparación y checklist de platos.
- **Administrador**: Auditoría contable, métricas del turno, ajustes de empresa, gestión de menú, personal y corte de caja.

### 5. 📲 Despacho a Domiciliarios por WhatsApp (1 Clic)
- En el monitor de cocina (KDS), cada pedido de domicilio cuenta con el botón directo: **📲 WhatsApp**.
- Genera un mensaje formateado con:
  - Número de comanda
  - Nombre del cliente y teléfono
  - Dirección exacta de entrega
  - Lista detallada de platos y cantidades
  - Total a cobrar y tiempo límite de entrega
- Abre automáticamente WhatsApp Web o la aplicación nativa enlazada al domiciliario asignado.

### 6. 💰 Cierre de Caja del Día (Corte Z) & Reinicio a $0
- Resumen consolidado de ventas del turno y desglose exacto por método de pago (**Efectivo**, **Nequi**, **Daviplata**, **Tarjeta / Datáfono**).
- Conteo de efectivo en caja, cálculo automático de faltantes o sobrantes y notas de cierre.
- **Impresión del Comprobante Fiscal Z**.
- **Reinicio de caja**: Archiva el turno en el historial y **restablece las ventas activas a $0** para iniciar el siguiente día comercial con total limpieza.

---

## 🚀 Inicio Rápido en Entorno Local

Puedes iniciar todo el sistema con un solo clic:
1. Haz doble clic en el archivo `iniciar_proyecto.bat`.
2. Se abrirán automáticamente el servidor backend (`http://localhost:4000`), el cliente frontend (`http://localhost:5173`) y tu navegador.

### Inicio manual por terminal:
```bash
# 1. Servidor Backend
cd backend
npm install
npm run dev

# 2. Cliente Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

---

## 🔑 Credenciales de Acceso Rápidas

| Restaurante | Rol | Usuario | PIN |
| :--- | :--- | :--- | :--- |
| **ROSTY Broaster** | Mesero | `waiter` | `rosty123` |
| **ROSTY Broaster** | Cocinero | `chef` | `cocina123` |
| **ROSTY Broaster** | Administrador | `admin` | `admin123` |

*(Cualquier nuevo restaurante creado dispondrá de su propio administrador configurado durante el registro).*

---

## 🌐 Guía de Publicación en la Nube (Producción)

### Opción A: Despliegue en Render (Backend) + Vercel (Frontend) [Recomendado y Gratuito]

#### 1. Backend en Render (https://render.com)
1. Crea una cuenta en Render y conecta tu repositorio de GitHub.
2. Selecciona **New Web Service**.
3. Configuración:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Variables de Entorno en Render:
   - `PORT`: `4000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `un_secreto_largo_y_seguro`
   - `ALLOWED_ORIGINS`: `https://tu-proyecto-frontend.vercel.app`
5. Copia la URL generada por Render (ej: `https://rosty-api.onrender.com`).

#### 2. Frontend en Vercel (https://vercel.com)
1. Crea una cuenta en Vercel e importa el mismo repositorio de GitHub.
2. Configuración:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Variables de Entorno en Vercel:
   - `VITE_API_URL`: `https://rosty-api.onrender.com` (la URL de tu backend en Render)
4. Haz clic en **Deploy**. ¡Tu sistema estará en línea con HTTPS y certificado SSL automático!

---

### Opción B: Despliegue en Servidor Local / Red Local (Restaurante Físico)

Para usarlo en tablets y celulares dentro del mismo restaurante sin depender de internet externo:
1. Conecta la computadora servidor (laptop o PC) al WiFi del restaurante.
2. Abre la terminal y consulta tu IP local con `ipconfig` (ej: `192.168.1.50`).
3. En `frontend/.env`, coloca:
   ```ini
   VITE_API_URL=http://192.168.1.50:4000
   ```
4. Ejecuta:
   ```bash
   cd frontend
   npm run dev -- --host
   ```
5. Desde cualquier celular, tablet o televisor conectado al mismo WiFi, abre `http://192.168.1.50:5173` y todos podrán tomar pedidos o monitorear la cocina en tiempo real.
