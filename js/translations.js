// Función para detectar el idioma del navegador
function detectLanguage() {
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage) {
        return savedLanguage;
    }
    return 'es'; // Default to Spanish
}

// Función para cargar las traducciones
async function loadTranslations() {
    try {
        const response = await fetch('../json/translations.json');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

// Función para aplicar las traducciones
function applyTranslations(translations, language) {
    if (!translations || !translations[language]) {
        // If translations are not available, make sure the body is visible
        document.body.style.visibility = 'visible';
        return;
    }

    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[language][key]) {
            if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                element.placeholder = translations[language][key];
            } else {
                element.innerHTML = translations[language][key];
            }
        }
    });

    const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (translations[language][key]) {
            element.placeholder = translations[language][key];
        }
    });

    const translatableElements = document.querySelectorAll('[data-translation-key]');
    translatableElements.forEach(element => {
        const key = element.getAttribute('data-translation-key');
        if (translations[language][key]) {
            const metricValue = element.dataset.metric;
            const imperialValue = element.dataset.imperial;
            let displayValue = '';
            if (metricValue && imperialValue) {
                displayValue = language === 'en' ? imperialValue : metricValue;
            } else {
                // Check if there is a colon before splitting
                if (element.textContent.includes(':')) {
                    displayValue = element.textContent.split(':')[1].trim();
                } else {
                    displayValue = element.textContent;
                }
            }
            element.textContent = `${translations[language][key]}: ${displayValue}`;
        }
    });

    // Actualizar el selector de idioma
    const currentLangText = document.getElementById('current-lang-text');
    const enButton = document.getElementById('lang-en');
    const esButton = document.getElementById('lang-es');
    
    if (currentLangText) {
        if (language === 'en') {
            currentLangText.textContent = 'EN';
        } else {
            currentLangText.textContent = 'ES';
        }
    }

    // Guardar la preferencia del usuario
    localStorage.setItem('preferred_language', language);

    // Make the body visible after applying translations
    document.body.style.visibility = 'visible';
}

// Función para inicializar el sistema de traducción
async function initializeTranslation() {
    const translations = await loadTranslations();
    // Always apply translations, even if they are null, to make the body visible
    const currentLang = detectLanguage();
    applyTranslations(translations, currentLang);

    // Event listeners para el selector de idioma
    const currentLangButton = document.getElementById('current-lang');
    const languageDropdown = document.getElementById('language-dropdown');
    const enButton = document.getElementById('lang-en');
    const esButton = document.getElementById('lang-es');

    if (currentLangButton && languageDropdown) {
        // Toggle dropdown visibility
        currentLangButton.addEventListener('click', function(e) {
            e.stopPropagation();
            languageDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!languageDropdown.contains(e.target) && e.target !== currentLangButton) {
                languageDropdown.classList.remove('show');
            }
        });

        // Language selection
        if (enButton) {
            enButton.addEventListener('click', function(e) {
                e.stopPropagation();
                applyTranslations(translations, 'en');
                document.documentElement.lang = 'en';
                languageDropdown.classList.remove('show');
                location.reload();
            });
        }

        if (esButton) {
            esButton.addEventListener('click', function(e) {
                e.stopPropagation();
                applyTranslations(translations, 'es');
                document.documentElement.lang = 'es';
                languageDropdown.classList.remove('show');
                location.reload();
            });
        }
    }
}

// Asegurarse de que las traducciones se apliquen después de cargar el DOM
document.addEventListener('DOMContentLoaded', initializeTranslation);
