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

    columns.forEach((column, colIndex) => {
        // Apply entrance animation
        column.classList.add('mosaic-entrance-animation');
        column.style.animationDelay = `${0.1 * (colIndex + 1)}s`; // Staggered entrance

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
                // Remove 'active' class from current image
                images[currentIndex].classList.remove('active');

                // Calculate index of the next image
                currentIndex = (currentIndex + 1) % images.length;

                // Add 'active' class to the new image
                images[currentIndex].classList.add('active');
            }, 4000); // Change image every 4 seconds
        }, colIndex * 1333); // Stagger the start of each column's interval for a more noticeable effect
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
        // Make sure body is visible even if there's an error
        document.body.style.visibility = 'visible';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const modelId = params.get('id');
    console.log("Model ID from URL:", modelId);

    if (!modelId) {
        mainContainer.innerHTML = '<h1>Model not specified.</h1>';
        // Make sure body is visible
        document.body.style.visibility = 'visible';
        return;
    }

    try {
        console.log("Fetching models.json and translations.json...");
        const [data, translations] = await fetchData(['/json/models.json', '/json/translations.json']);
        console.log("Successfully parsed models.json and translations.json");

        const model = data.models.find(m => m.id === modelId);
        console.log("Found model:", model);

        if (!model) {
            mainContainer.innerHTML = '<h1>Model not found.</h1>';
            // Make sure body is visible
            document.body.style.visibility = 'visible';
            return;
        }

        document.title = `Contacto Basico - ${model.name}`;

        // Populate Model Name
        const modelNameElement = document.querySelector('.modelNameBook');
        if (modelNameElement) {
            modelNameElement.textContent = model.name;
        }

        // Populate Model Measurements
        const measurementsList = document.querySelector('.modelBookMeasurements');
        if (measurementsList) {
            measurementsList.innerHTML = ''; // Clear existing placeholders
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

        // Custom Carousel Implementation with Slide Animation
        const carouselImagesContainer = document.querySelector('.carousel-images');
        const prevButton = document.querySelector('.carousel-button.prev');
        const nextButton = document.querySelector('.carousel-button.next');
        let currentImageIndex = 0;

        if (carouselImagesContainer && model.portfolioImages && model.portfolioImages.length > 0) {
            carouselImagesContainer.innerHTML = ''; // Clear existing images

            // Create image pairs (first image alone, others in pairs)
            const imageElements = [];
            
            // First image (alone and centered)
            const firstImg = document.createElement('img');
            firstImg.src = model.portfolioImages[0];
            firstImg.alt = `${model.name} 1`;
            firstImg.classList.add('carousel-image');
            firstImg.classList.add('active');
            carouselImagesContainer.appendChild(firstImg);
            imageElements.push(firstImg);

            // Create pairs for remaining images
            for (let i = 1; i < model.portfolioImages.length; i += 2) {
                const pairContainer = document.createElement('div');
                pairContainer.classList.add('carousel-image-pair');
                
                const img1 = document.createElement('img');
                img1.src = model.portfolioImages[i];
                img1.alt = `${model.name} ${i + 1}`;
                
                pairContainer.appendChild(img1);
                
                // Check if there's a second image for this pair
                if (i + 1 < model.portfolioImages.length) {
                    const img2 = document.createElement('img');
                    img2.src = model.portfolioImages[i + 1];
                    img2.alt = `${model.name} ${i + 2}`;
                    pairContainer.appendChild(img2);
                }
                
                carouselImagesContainer.appendChild(pairContainer);
                imageElements.push(pairContainer);
            }

            const showImage = (index) => {
                // Remove all active classes
                imageElements.forEach(element => {
                    element.classList.remove('active', 'prev-active', 'next-active');
                });

                // Add the appropriate classes for CSS transitions
                imageElements.forEach((element, i) => {
                    if (i === index) {
                        element.classList.add('active');
                    } else if (i === (index - 1 + imageElements.length) % imageElements.length) {
                        element.classList.add('prev-active');
                    } else if (i === (index + 1) % imageElements.length) {
                        element.classList.add('next-active');
                    }
                });
            };

            prevButton.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex - 1 + imageElements.length) % imageElements.length;
                showImage(currentImageIndex);
            });

            nextButton.addEventListener('click', () => {
                currentImageIndex = (currentImageIndex + 1) % imageElements.length;
                showImage(currentImageIndex);
            });

            // Initialize carousel display
            showImage(currentImageIndex);

        } else if (carouselImagesContainer) {
            carouselImagesContainer.innerHTML = '<p>No portfolio images available.</p>';
        }

        console.log("Portfolio page built successfully");

    } catch (error) {
        mainContainer.innerHTML = '<h1>Error loading portfolio. Please try again later.</h1>';
        console.error('Fetch error:', error);
    } finally {
        // Always make sure the body is visible
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
});
