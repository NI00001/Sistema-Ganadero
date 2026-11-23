/**
 * CARRITO DE COMPRAS - LÓGICA DE CHECKOUT Y PEDIDO WHATSAPP
 */

document.addEventListener('DOMContentLoaded', () => {
  const cartTableBody = document.querySelector('#cartTable tbody');
  const emptyCartView = document.getElementById('emptyCartView');
  const cartContentLayout = document.getElementById('cartContentLayout');
  const cartItemsCount = document.getElementById('cartItemsCount');

  const subtotalEl = document.getElementById('cartSubtotal');
  const deliveryEl = document.getElementById('cartDelivery');
  const totalEl = document.getElementById('cartTotal');

  const modalCheckout = document.getElementById('modalCheckout');
  const btnOpenCheckout = document.getElementById('btnOpenCheckout');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const formWhatsApp = document.getElementById('formWhatsApp');
  const btnPrintProforma = document.getElementById('btnPrintProforma');

  let cart = [];
  let deliveryCost = 15.00; // Por defecto: Envío refrigerado

  // 1. CARGAR CARRITO
  function loadCart() {
    try {
      cart = JSON.parse(localStorage.getItem('miCarrito') || '[]');
      if (!Array.isArray(cart)) cart = [];
    } catch (e) {
      console.error('Error al leer miCarrito:', e);
      cart = [];
    }
    renderCart();
  }

  // 2. RENDERIZAR TABLA DE PRODUCTOS
  function renderCart() {
    if (cart.length === 0) {
      if (emptyCartView) emptyCartView.style.display = 'block';
      if (cartContentLayout) cartContentLayout.style.display = 'none';
      if (typeof window.updateCartBadges === 'function') window.updateCartBadges();
      return;
    }

    if (emptyCartView) emptyCartView.style.display = 'none';
    if (cartContentLayout) cartContentLayout.style.display = 'grid';

    cartTableBody.innerHTML = '';
    let totalItems = 0;
    let subtotal = 0;

    cart.forEach((item, index) => {
      const cant = Number(item.cantidad) || 1;
      const price = Number(item.precio) || 0;
      const rowSubtotal = cant * price;
      totalItems += cant;
      subtotal += rowSubtotal;

      const imgSrc = item.img ? (item.img.startsWith('..') ? item.img : (item.img.startsWith('imagenes-productos') ? `../Productos/${item.img}` : item.img)) : '../Productos/imagenes-productos/queso-mosarela.png';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="item-product-cell">
            <div class="item-thumb">
              <img src="${imgSrc}" alt="${item.nombre}">
            </div>
            <div class="item-info">
              <h4>${item.nombre}</h4>
              <span class="item-unit-price">S/. ${price.toFixed(2)} c/u</span>
            </div>
          </div>
        </td>
        <td>
          <div class="qty-selector">
            <button type="button" class="qty-btn" data-action="decrease" data-index="${index}">
              <i class="fas fa-minus"></i>
            </button>
            <input type="text" class="qty-input" value="${cant}" readonly>
            <button type="button" class="qty-btn" data-action="increase" data-index="${index}">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </td>
        <td>
          <span class="item-subtotal">S/. ${rowSubtotal.toFixed(2)}</span>
        </td>
        <td>
          <button type="button" class="btn-remove-item" data-action="remove" data-index="${index}" title="Quitar producto">
            <i class="fas fa-trash-can"></i>
          </button>
        </td>
      `;
      cartTableBody.appendChild(tr);
    });

    if (cartItemsCount) {
      cartItemsCount.textContent = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;
    }

    // Actualizar resumen
    if (subtotalEl) subtotalEl.textContent = `S/. ${subtotal.toFixed(2)}`;
    if (deliveryEl) deliveryEl.textContent = deliveryCost === 0 ? 'Gratis' : `S/. ${deliveryCost.toFixed(2)}`;

    const finalTotal = subtotal + deliveryCost;
    if (totalEl) totalEl.textContent = `S/. ${finalTotal.toFixed(2)}`;

    // Guardar cambios y actualizar badges en menú
    localStorage.setItem('miCarrito', JSON.stringify(cart));
    if (typeof window.updateCartBadges === 'function') {
      window.updateCartBadges();
    }
  }

  // 3. CONTROL DE CANTIDADES Y ELIMINACIÓN
  if (cartTableBody) {
    cartTableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.getAttribute('data-action');
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      if (isNaN(idx) || !cart[idx]) return;

      if (action === 'increase') {
        cart[idx].cantidad = (Number(cart[idx].cantidad) || 1) + 1;
        renderCart();
      } else if (action === 'decrease') {
        if (cart[idx].cantidad > 1) {
          cart[idx].cantidad -= 1;
        } else {
          cart.splice(idx, 1);
        }
        renderCart();
      } else if (action === 'remove') {
        const itemRemovido = cart[idx].nombre;
        cart.splice(idx, 1);
        renderCart();
        if (typeof window.showToast === 'function') {
          window.showToast('Producto eliminado', `${itemRemovido} se quitó del carrito.`, 'gold');
        }
      }
    });
  }

  // 4. CAMBIO DE MÉTODO DE ENVÍO
  const deliveryRadios = document.querySelectorAll('input[name="shipping_method"]');
  deliveryRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.delivery-radio-label').forEach(l => l.classList.remove('selected'));
      e.target.closest('.delivery-radio-label').classList.add('selected');

      deliveryCost = parseFloat(e.target.value) || 0;
      renderCart();
    });
  });

  // 5. MODAL DE PEDIDO POR WHATSAPP
  if (btnOpenCheckout) {
    btnOpenCheckout.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Tu carrito está vacío.');
        return;
      }
      modalCheckout.classList.add('active');
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      modalCheckout.classList.remove('active');
    });
  }

  if (modalCheckout) {
    modalCheckout.addEventListener('click', (e) => {
      if (e.target === modalCheckout) {
        modalCheckout.classList.remove('active');
      }
    });
  }

  // 6. ENVÍO DE FORMULARIO A WHATSAPP
  if (formWhatsApp) {
    formWhatsApp.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('clienteNombre').value.trim();
      const telefono = document.getElementById('clienteTelefono').value.trim();
      const direccion = document.getElementById('clienteDireccion').value.trim();
      const notas = document.getElementById('clienteNotas').value.trim();
      const deliveryMethod = deliveryCost === 0 ? 'Recojo en Hacienda (Gratis)' : 'Envío Refrigerado a Domicilio (S/. 15.00)';

      let subtotal = 0;
      let lineas = '';
      cart.forEach(item => {
        const cant = Number(item.cantidad) || 1;
        const sub = cant * Number(item.precio);
        subtotal += sub;
        lineas += `• ${cant}x ${item.nombre} - S/. ${sub.toFixed(2)}\n`;
      });

      const totalFinal = subtotal + deliveryCost;

      // Mensaje formateado para WhatsApp
      const mensaje = `🐄 *NUEVO PEDIDO - GANADERÍA ÉLITE* 🧀\n` +
        `----------------------------------------\n` +
        `👤 *Cliente:* ${nombre}\n` +
        `📞 *Teléfono:* ${telefono}\n` +
        `📍 *Dirección:* ${direccion}\n` +
        `🚚 *Método:* ${deliveryMethod}\n` +
        (notas ? `📝 *Observaciones:* ${notas}\n` : '') +
        `----------------------------------------\n` +
        `📦 *DETALLE DE LA COMPRA:*\n` +
        lineas +
        `----------------------------------------\n` +
        `💰 *SUBTOTAL:* S/. ${subtotal.toFixed(2)}\n` +
        `🚚 *ENVÍO:* ${deliveryCost === 0 ? 'Gratis' : 'S/. ' + deliveryCost.toFixed(2)}\n` +
        `🏆 *TOTAL A PAGAR:* S/. ${totalFinal.toFixed(2)}\n` +
        `----------------------------------------\n` +
        `¡Hola! Por favor confirmen mi pedido y los datos de pago/despacho. Muchas gracias.`;

      const numWhatsApp = '935464240'; // Número comercial ganadero
      const url = `https://wa.me/${numWhatsApp}?text=${encodeURIComponent(mensaje)}`;

      // Vaciar carrito tras checkout
      localStorage.removeItem('miCarrito');
      cart = [];
      modalCheckout.classList.remove('active');
      renderCart();

      // Abrir WhatsApp en nueva pestaña
      window.open(url, '_blank');
    });
  }

  // 7. IMPRIMIR PROFORMA
  if (btnPrintProforma) {
    btnPrintProforma.addEventListener('click', () => {
      window.print();
    });
  }

  // Inicializar
  loadCart();
});
