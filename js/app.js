/**
 * SISTEMA GANADERO DE ÉLITE - GLOBAL JAVASCRIPT
 * Control de navegación móvil, estado global del carrito y notificaciones Toast
 */

(function () {
  'use strict';

  // 1. GESTIÓN DEL CONTADOR DEL CARRITO
  function getCartItemCount() {
    try {
      const cart = JSON.parse(localStorage.getItem('miCarrito') || '[]');
      if (Array.isArray(cart)) {
        return cart.reduce((acc, item) => acc + (Number(item.cantidad) || 1), 0);
      }
    } catch (e) {
      console.warn('Error al leer el carrito desde localStorage:', e);
    }
    return 0;
  }

  function updateCartBadges() {
    const count = getCartItemCount();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
      // Animación de rebote sutil
      badge.style.transform = 'scale(1.25)';
      setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
    });
  }

  // 2. SISTEMA DE TOAST NOTIFICATIONS
  window.showToast = function (title, message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
    
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-bell';
    toast.innerHTML = `
      <i class="fas ${iconClass}"></i>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  };

  // 3. INICIALIZACIÓN DE LA NAVEGACIÓN MÓVIL
  document.addEventListener('DOMContentLoaded', () => {
    updateCartBadges();

    // Toggle móvil
    const toggleBtn = document.querySelector('.mobile-toggle');
    const sidebar = document.querySelector('.sidebar');
    let overlay = document.querySelector('.sidebar-overlay');

    if (!overlay && sidebar) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }

    if (toggleBtn && sidebar && overlay) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    // Escuchar cambios en el almacenamiento local para sincronizar pestañas abiertas
    window.addEventListener('storage', (e) => {
      if (e.key === 'miCarrito') {
        updateCartBadges();
      }
    });
  });

  // Exportar helper de actualización para los módulos de la tienda
  window.updateCartBadges = updateCartBadges;
})();
