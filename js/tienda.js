/**
 * TIENDA DE PRODUCTOS - LÓGICA DE COMPRA Y FILTRADO
 */

document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchProducts');
  const catTabs = document.querySelectorAll('.prod-tab');
  const productCards = document.querySelectorAll('.product-card');

  // 1. SELECTOR DE CANTIDADES
  document.addEventListener('click', (e) => {
    // Botón Menos
    if (e.target.closest('.qty-minus')) {
      const row = e.target.closest('.qty-selector');
      const input = row.querySelector('.qty-input');
      let val = parseInt(input.value, 10) || 1;
      if (val > 1) input.value = val - 1;
    }

    // Botón Más
    if (e.target.closest('.qty-plus')) {
      const row = e.target.closest('.qty-selector');
      const input = row.querySelector('.qty-input');
      let val = parseInt(input.value, 10) || 1;
      if (val < 99) input.value = val + 1;
    }

    // Botón Añadir al Carrito
    if (e.target.closest('.btn-add-cart')) {
      const btn = e.target.closest('.btn-add-cart');
      const card = btn.closest('.product-card');
      if (!card) return;

      const nombre = card.querySelector('.product-title').textContent.trim();
      const precioAttr = card.getAttribute('data-price');
      const precio = parseFloat(precioAttr) || 0;
      const img = card.querySelector('.product-img-wrap img').getAttribute('src');
      const qtyInput = card.querySelector('.qty-input');
      const cantidad = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;

      addToCart({ nombre, precio, img, cantidad });

      // Feedback visual en el botón
      const originalHtml = btn.innerHTML;
      btn.classList.add('added');
      btn.innerHTML = '<i class="fas fa-check"></i> ¡Listo!';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = originalHtml;
        if (qtyInput) qtyInput.value = 1; // Resetear cantidad
      }, 1200);

      // Notificación Toast no invasiva
      if (typeof window.showToast === 'function') {
        window.showToast(
          '¡Añadido al Carrito!',
          `${cantidad}x ${nombre} (S/. ${(precio * cantidad).toFixed(2)}) agregado con éxito.`,
          'success'
        );
      }
    }
  });

  // 2. FUNCIÓN AGREGAR AL CARRITO
  function addToCart(item) {
    try {
      const cart = JSON.parse(localStorage.getItem('miCarrito') || '[]');
      const existing = cart.find(i => i.nombre === item.nombre);

      if (existing) {
        existing.cantidad = (Number(existing.cantidad) || 1) + item.cantidad;
        if (!existing.img && item.img) existing.img = item.img;
      } else {
        cart.push(item);
      }

      localStorage.setItem('miCarrito', JSON.stringify(cart));
      if (typeof window.updateCartBadges === 'function') {
        window.updateCartBadges();
      }
    } catch (e) {
      console.error('Error al guardar en el carrito:', e);
    }
  }

  // 3. FILTRADO Y BÚSQUEDA DE PRODUCTOS
  let currentCategory = 'all';
  let currentSearch = '';

  function filterProducts() {
    let visible = 0;
    productCards.forEach(card => {
      const cat = card.getAttribute('data-category');
      const title = card.querySelector('.product-title').textContent.toLowerCase();
      const desc = card.querySelector('.product-desc').textContent.toLowerCase();

      const matchCat = currentCategory === 'all' || cat === currentCategory;
      const matchSearch = title.includes(currentSearch) || desc.includes(currentSearch);

      if (matchCat && matchSearch) {
        card.style.display = 'flex';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    const noProd = document.getElementById('noProducts');
    if (noProd) {
      noProd.style.display = visible === 0 ? 'block' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      filterProducts();
    });
  }

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-category');
      filterProducts();
    });
  });
});
