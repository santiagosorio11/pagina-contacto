document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('modelSearch');
    const searchButton = document.querySelector('.search-button');
    if (!searchInput || !searchButton) return;

    // Función para realizar la búsqueda
    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const modelCards = document.querySelectorAll('.model-card');

        modelCards.forEach(card => {
            const modelName = card.querySelector('.model-card-name')?.textContent.toLowerCase() || '';
            const modelDetails = card.querySelector('.model-details')?.textContent.toLowerCase() || '';
            
            const matchesSearch = modelName.includes(searchTerm) || 
                                modelDetails.includes(searchTerm) ||
                                searchTerm === '';

            if (matchesSearch) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (card.style.opacity === '0') {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });
    };

    // Función para limpiar la búsqueda
    const clearSearch = () => {
        searchInput.value = '';
        performSearch();
    };

    // Evento para el botón de búsqueda
    searchButton.addEventListener('click', performSearch);

    // Evento para la tecla Enter en el input
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // Evento para búsqueda en tiempo real
    searchInput.addEventListener('input', performSearch);

    // Limpiar búsqueda con ESC
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            clearSearch();
        }
    });
});
