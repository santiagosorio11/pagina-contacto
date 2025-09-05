/**
 * Utilidad para traer datos de multiples archivos JSON
 * @param {string[]} urls - Array de URLs a traer
 * @returns {Promise<any[]>} - Promesa que resuelve a un array de datos parseados
 */
async function fetchData(urls) {
    try {
        // Ensure we're using absolute paths from the root
        const absoluteUrls = urls.map(url => {
            // If it's already an absolute path, return as is
            if (url.startsWith('http')) {
                return url;
            }
            // If it starts with '/', make sure it's correctly resolved
            if (url.startsWith('/')) {
                // For Vercel deployment, we might need to adjust the path
                // If we're in a subdirectory like /pages/, we might need to go up one level
                const currentPath = window.location.pathname;
                if (currentPath.includes('/pages/')) {
                    return '..' + url;  // Go up one level
                }
                return url;
            }
            // Otherwise, make it absolute from the root
            return '/' + url;
        });
        
        console.log('Fetching data from:', absoluteUrls);
        const responses = await Promise.all(absoluteUrls.map(url => {
            console.log('Fetching:', url);
            return fetch(url);
        }));
        const data = await Promise.all(responses.map((response, index) => {
            console.log(`Response for ${absoluteUrls[index]}:`, response.status, response.ok);
            if (!response.ok) {
                throw new Error(`Network response was not ok for ${absoluteUrls[index]}: ${response.status} ${response.statusText}`);
            }
            return response.json();
        }));
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error; // Re-throw to be caught by the calling function
    }
}


/**
 * Inicializa la animación de difuminado para el mosaico de la página de inicio.
 */
function initializeHomepage() {
    const columns = document.querySelectorAll('.mosaic-column');
    if (columns.length === 0) return;

    function getVisibleColumns() {
        // Get the computed style of the first column to check its display property
        const firstColumn = columns[0];
        const computedStyle = window.getComputedStyle(firstColumn);
        if (computedStyle.display === 'none') return 0;

        // Check viewport width for responsive design
        const viewportWidth = window.innerWidth;
        if (viewportWidth < 768) return 1; // Mobile: 1 column
        if (viewportWidth < 1024) return 2; // Tablet: 2 columns
        return 3; // Desktop: 3 columns
    }

    let visibleColumns = getVisibleColumns();

    columns.forEach((column, colIndex) => {
        // Apply entrance animation
        column.classList.add('mosaic-entrance-animation');
        
        // Only show the columns that should be visible based on screen size
        if (colIndex < visibleColumns) {
            column.style.animationDelay = `${0.1 * (colIndex + 1)}s`; // Staggered entrance
            column.style.display = 'block';
        } else {
            column.style.display = 'none';
        }

        const images = column.querySelectorAll('img');
        let currentIndex = 0;

        // Initial state for domino effect
        images.forEach((img, imgIndex) => {
            img.style.transitionDelay = `${0.1 * imgIndex}s`; // Stagger images within column
        });

        // Set the first image as active initially
        images[currentIndex].classList.add('active');

        // Staggered interval for image changes
        setTimeout(() => {
            setInterval(() => {
                if (colIndex < visibleColumns) { // Solo anima las columnas visibles
                    // Remove 'active' class from current image
                    images[currentIndex].classList.remove('active');

                    // Calculate index of the next image
                    currentIndex = (currentIndex + 1) % images.length;

                    // Add 'active' class to the new image
                    images[currentIndex].classList.add('active');
                }
            }, 4000); // Change image every 4 seconds
        }, colIndex * 1333); // Stagger the start of each column's interval
    });

    // Manejar cambios de tamaño de ventana
    window.addEventListener('resize', () => {
        const newVisibleColumns = getVisibleColumns();
        if (newVisibleColumns !== visibleColumns) {
            visibleColumns = newVisibleColumns;
            columns.forEach((column, colIndex) => {
                if (colIndex < visibleColumns) {
                    column.style.display = 'block';
                } else {
                    column.style.display = 'none';
                }
            });
        }
    });
}




/**
 * Carga el perfil de un modelo individual en portfolio.html
 */
async function loadPortfolioPage() {
    console.log("loadPortfolioPage function started");
    const mainContainer = document.getElementById('portfolio-main');
    if (!mainContainer) {
        console.error("Could not find the element with id 'portfolio-main'");
        document.body.style.visibility = 'visible';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const modelId = params.get('id');
    if (!modelId) {
        mainContainer.innerHTML = '<h1>Model not specified.</h1>';
        document.body.style.visibility = 'visible';
        return;
    }

    try {
        const [data, translations] = await fetchData(['/json/models.json', '/json/translations.json']);
        const model = data.models.find(m => m.id === modelId);

        if (!model) {
            mainContainer.innerHTML = '<h1>Model not found.</h1>';
            document.body.style.visibility = 'visible';
            return;
        }

        document.title = `Contacto Basico - ${model.name}`;
        const modelNameElement = document.querySelector('.modelNameBook');
        if (modelNameElement) {
            modelNameElement.textContent = model.name;
        }

        const measurementsList = document.querySelector('.modelBookMeasurements');
        if (measurementsList) {
            measurementsList.innerHTML = '';
            const currentLang = localStorage.getItem('preferred_language') || detectLanguage();
            for (const key in model.details) {
                const value = model.details[key];
                const measurementItem = document.createElement('div');
                measurementItem.classList.add('measurement-item');
                const nameSpan = document.createElement('span');
                nameSpan.className = 'measurementName';
                const translationKey = `detail_${key.toLowerCase()}`;
                nameSpan.setAttribute('data-translation-key', translationKey);
                const translatedLabel = translations[currentLang][translationKey] || key;
                nameSpan.textContent = `${translatedLabel}: `;
                const valueSpan = document.createElement('span');
                valueSpan.className = 'measurements';
                valueSpan.textContent = value;
                measurementItem.classList.add('non-convertible');
                measurementItem.appendChild(nameSpan);
                measurementItem.appendChild(valueSpan);
                measurementsList.appendChild(measurementItem);
            }
        }

        const carouselImagesContainer = document.querySelector('.carousel-images');
        const prevButton = document.querySelector('.carousel-button.prev');
        const nextButton = document.querySelector('.carousel-button.next');
        let currentImageIndex = 0;

        if (carouselImagesContainer && model.portfolioImages && model.portfolioImages.length > 0) {
            carouselImagesContainer.innerHTML = '';

            const isImageHorizontal = (imgUrl) => new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img.naturalWidth > img.naturalHeight);
                img.onerror = () => resolve(false);
                img.src = imgUrl;
            });

            const isMobile = () => window.innerWidth <= 768;

            const processImagesAndCreateCarousel = async () => {
                const imageChecks = model.portfolioImages.map(async (imgUrl, index) => ({ url: imgUrl, index, isHorizontal: await isImageHorizontal(imgUrl) }));
                const imageResults = await Promise.all(imageChecks);
                const regularImages = imageResults.filter(img => !img.isHorizontal);
                const horizontalImages = imageResults.filter(img => img.isHorizontal);

                const slideElements = [];
                carouselImagesContainer.innerHTML = '';

                if (isMobile()) {
                    // Filmstrip-style carousel for mobile
                    const allImages = [...regularImages, ...horizontalImages];

                    allImages.forEach((imgData) => {
                        const slideContainer = document.createElement('div');
                        slideContainer.classList.add('carousel-slide', 'loading');

                        // Crear spinner de carga
                        const loadingSpinner = document.createElement('div');
                        loadingSpinner.classList.add('image-loading');
                        slideContainer.appendChild(loadingSpinner);

                        const img = document.createElement('img');
                        img.src = imgData.url;
                        img.alt = `${model.name} ${imgData.index + 1}`;
                        img.loading = 'lazy';

                        // Manejar la carga de la imagen
                        img.onload = () => {
                            slideContainer.classList.remove('loading');
                            slideContainer.classList.add('loaded');
                            loadingSpinner.style.display = 'none';
                        };

                        img.onerror = () => {
                            slideContainer.classList.remove('loading');
                            loadingSpinner.style.display = 'none';
                            slideContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">Imagen no disponible</div>';
                        };

                        slideContainer.appendChild(img);
                        carouselImagesContainer.appendChild(slideContainer);
                    });

                    // Auto-scroll to center the first image after loading
                    setTimeout(() => {
                        const firstSlide = carouselImagesContainer.querySelector('.carousel-slide');
                        if (firstSlide) {
                            firstSlide.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                                inline: 'center'
                            });
                        }
                    }, 500);

                } else {
                    // On desktop, use the existing logic
                    for (let i = 0; i < regularImages.length; i++) {
                        let slideContainer = document.createElement('div');
                        slideContainer.classList.add('carousel-slide');
                        
                        if (i === 0) {
                            // First image alone
                            const img = document.createElement('img');
                            img.src = regularImages[i].url;
                            img.alt = `${model.name} ${regularImages[i].index + 1}`;
                            slideContainer.appendChild(img);
                        } else {
                            // Create pairs for remaining images
                            slideContainer.classList.add('pair');
                            
                            const img1 = document.createElement('img');
                            img1.src = regularImages[i].url;
                            img1.alt = `${model.name} ${regularImages[i].index + 1}`;
                            slideContainer.appendChild(img1);
                            
                            // Check if there's a second image for this pair
                            if (i + 1 < regularImages.length) {
                                const img2 = document.createElement('img');
                                img2.src = regularImages[i + 1].url;
                                img2.alt = `${model.name} ${regularImages[i + 1].index + 1}`;
                                slideContainer.appendChild(img2);
                                i++; // Skip next image as it's already processed
                            }
                        }
                        
                        carouselImagesContainer.appendChild(slideContainer);
                        slideElements.push(slideContainer);
                    }
                    
                    // Process horizontal images (alone at the end)
                    horizontalImages.forEach((imgData, hIndex) => {
                        const slideContainer = document.createElement('div');
                        slideContainer.classList.add('carousel-slide');
                        
                        const img = document.createElement('img');
                        img.src = imgData.url;
                        img.alt = `${model.name} ${imgData.index + 1}`;
                        slideContainer.appendChild(img);
                        
                        carouselImagesContainer.appendChild(slideContainer);
                        slideElements.push(slideContainer);
                    });

                    const showSlide = (index) => {
                        // Position all slides
                        slideElements.forEach((slide, i) => {
                            slide.classList.remove('active', 'prev', 'next');
                            
                            if (i === index) {
                                slide.classList.add('active');
                            } else if (i < index) {
                                slide.classList.add('prev');
                            } else {
                                slide.classList.add('next');
                            }
                        });
                        
                        // Update button states
                        if (index === 0) {
                            prevButton.disabled = true;
                            prevButton.style.opacity = '0.5';
                            prevButton.style.cursor = 'not-allowed';
                        } else {
                            prevButton.disabled = false;
                            prevButton.style.opacity = '1';
                            prevButton.style.cursor = 'pointer';
                        }
                        
                        // Always keep next button enabled for infinite looping
                        nextButton.disabled = false;
                        nextButton.style.opacity = '1';
                        nextButton.style.cursor = 'pointer';
                    };

                    const goToNextSlide = () => {
                        // Jump to first image when clicking next on the last image
                        if (currentImageIndex < slideElements.length - 1) {
                            currentImageIndex++;
                        } else {
                            currentImageIndex = 0; // Jump back to first image
                        }
                        showSlide(currentImageIndex);
                    };

                    const goToPrevSlide = () => {
                        // Non-infinite carousel - stop at the beginning
                        if (currentImageIndex > 0) {
                            currentImageIndex--;
                            showSlide(currentImageIndex);
                        }
                    };

                    prevButton.addEventListener('click', goToPrevSlide);
                    nextButton.addEventListener('click', goToNextSlide);

                    // Initialize carousel display
                    showSlide(currentImageIndex);
                }
            };

            processImagesAndCreateCarousel();

            let isMobileView = isMobile();
            window.addEventListener('resize', () => {
                const currentlyMobile = isMobile();
                if (isMobileView !== currentlyMobile) {
                    isMobileView = currentlyMobile;
                    currentImageIndex = 0;
                    processImagesAndCreateCarousel();
                }
            });

        } else if (carouselImagesContainer) {
            carouselImagesContainer.innerHTML = '<p>No portfolio images available.</p>';
        }

        const portfolioTab = document.getElementById('portfolio-tab');
        const polaroidsTab = document.getElementById('polaroids-tab');
        const videosTab = document.getElementById('videos-tab');
        if (portfolioTab) portfolioTab.href = `portfolio.html?id=${modelId}`;
        if (polaroidsTab) polaroidsTab.href = `polaroids.html?id=${modelId}`;
        if (videosTab) videosTab.href = `videos.html?id=${modelId}`;

    } catch (error) {
        mainContainer.innerHTML = '<h1>Error loading portfolio. Please try again later.</h1>';
        console.error('Fetch error:', error);
    } finally {
        document.body.style.visibility = 'visible';
    }
}


async function loadEventsPage() {
    const eventsContainer = document.querySelector('.events-container');
    if (!eventsContainer) {
        console.error('Events container not found');
        // Make sure body is visible even if there's an error
        document.body.style.visibility = 'visible';
        return;
    }

    try {
        const [events] = await fetchData(['/json/events.json']);

        eventsContainer.innerHTML = ''; // Clear loader or existing content

        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.innerHTML = `
                <img src="${event.image}" alt="${event.title_en}" loading="lazy">
                <h2 data-translate-title-en="${event.title_en}" data-translate-title-es="${event.title_es}">${event.title_en}</h2>
                <p class="event-date" data-translate-date-en="${event.date_en}" data-translate-date-es="${event.date_es}">${event.date_en}</p>
                <p data-translate-description-en="${event.description_en}" data-translate-description-es="${event.description_es}">${event.description_en}</p>
            `;
            eventsContainer.appendChild(eventElement);
        });
        // Re-apply translations after loading dynamic content
        initializeTranslation(); // Call the function from translations.js

    } catch (error) {
        eventsContainer.innerHTML = '<p>Error loading events. Please try again later.</p>';
        console.error('Fetch error:', error);
    } finally {
        // Always make sure the body is visible
        document.body.style.visibility = 'visible';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Add a small delay to ensure DOM is fully ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get the page name correctly when pages are in a subdirectory
    const pathParts = window.location.pathname.split("/");
    const page = pathParts[pathParts.length - 1];
    console.log('Current page:', page);
    console.log('Full path:', window.location.pathname);

    if (page === 'portfolio.html') {
        console.log('Loading portfolio page');
        await loadPortfolioPage();
    } else if (page === 'events.html') { // New condition for events page
        console.log('Loading events page');
        await loadEventsPage();
    }

    // Make body visible after content is loaded
    document.body.style.visibility = 'visible';

    /* --- LOGICA PARA OCULTAR HEADER EN SCROLL --- */
    let lastScrollTop = 0;
    const header = document.querySelector('.main-header');

    window.addEventListener('scroll', function() {
        if (!header) return; // No ejecutar en páginas sin el header fijo (como la homepage)

        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
            // Scroll hacia abajo
            header.classList.add('header-hidden');
        } else {
            // Scroll hacia arriba
            header.classList.remove('header-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });

    // Disable right-click on all images
    const images = document.querySelectorAll('img');
    images.forEach(function(image) {
        image.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    });
});
