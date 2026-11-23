/**
 * CATÁLOGO DE RAZAS - SCRIPT INTERACTIVO
 * Manejo de buscador en vivo y filtros por aptitud productiva
 */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchBreeds');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const breedCards = document.querySelectorAll('.breed-card');
  const noResults = document.getElementById('noResults');

  let activeCategory = 'all';
  let searchTerm = '';

  function filterBreeds() {
    let visibleCount = 0;

    breedCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const textToSearch = (
        card.querySelector('.breed-title').textContent + ' ' +
        card.querySelector('.breed-subtitle').textContent + ' ' +
        card.getAttribute('data-origin') + ' ' +
        category
      ).toLowerCase();

      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesSearch = textToSearch.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Evento de búsqueda
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      filterBreeds();
    });
  }

  // Evento de tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-filter');
      filterBreeds();
    });
  });
});
