document.addEventListener('DOMContentLoaded', async function () {
    const modelGrid = document.getElementById('model-grid');
    if (!modelGrid) return;

    const category = document.body.dataset.pageCategory;

    if (!category) {
        // Do not run the script if the page is not men or women
        return;
    }

    // Ensure body is hidden initially while loading
    document.body.style.visibility = 'hidden';

    try {
        const [modelsResponse, translationsResponse] = await Promise.all([
            fetch('/json/models.json'),
            fetch('/json/translations.json')
        ]);

        if (!modelsResponse.ok) throw new Error('Network response for models was not ok');
        if (!translationsResponse.ok) throw new Error('Network response for translations was not ok');

        const modelsData = await modelsResponse.json();
        const translations = await translationsResponse.json();
        
        const currentLang = localStorage.getItem('preferred_language') || 'es';

        // Create a reverse map for Spanish translation values
        const esValueToKeyMap = {};
        if (translations.es) {
            for (const key in translations.es) {
                esValueToKeyMap[translations.es[key]] = key;
            }
        }

        const filteredModels = modelsData.models.filter(model => model.category === category);

        modelGrid.innerHTML = ''; // Clear existing static content

        filteredModels.forEach(model => {
            const modelCard = document.createElement('a');
            modelCard.href = `portfolio?id=${model.id}`;
            modelCard.className = 'model-card';

            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'model-image-wrapper';

            const image = document.createElement('img');
            image.src = model.thumbnailUrl;
            image.alt = model.name;
            image.loading = 'lazy';
            image.onerror = function() {
                this.onerror = null;
                this.src = 'https://via.placeholder.com/300x400?text=Image+Not+Found';
            };

            const overlay = document.createElement('div');
            overlay.className = 'model-card-overlay';

            const details = document.createElement('div');
            details.className = 'model-details';

            const detailsParagraph = document.createElement('p');
            let detailsHTML = '';
            if (model.details) {
                for (const [key, value] of Object.entries(model.details)) {
                    const translationKey = `detail_${key.toLowerCase()}`;
                    const translatedKey = (translations[currentLang] && translations[currentLang][translationKey]) || key;

                    let valueToDisplay = value;
                    const lowerKey = key.toLowerCase();

                    if (lowerKey === 'cabello' || lowerKey === 'ojos') {
                        const translationValueKey = esValueToKeyMap[value];
                        if (translationValueKey && translations[currentLang] && translations[currentLang][translationValueKey]) {
                            valueToDisplay = translations[currentLang][translationValueKey];
                        }
                    }

                    detailsHTML += `${translatedKey}: ${valueToDisplay}<br>`;
                }
            }
            detailsParagraph.innerHTML = detailsHTML;

            details.appendChild(detailsParagraph);
            overlay.appendChild(details);
            imageWrapper.appendChild(image);
            imageWrapper.appendChild(overlay);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'model-card-name';
            nameSpan.textContent = model.name;

            modelCard.appendChild(imageWrapper);
            modelCard.appendChild(nameSpan);

            modelGrid.appendChild(modelCard);
        });

        // Hide loader and make body visible
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.transition = 'opacity 0.3s';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }

        // Show body content after a brief delay to ensure loader animation finishes
        setTimeout(() => {
            document.body.style.visibility = 'visible';
        }, filteredModels.length > 0 ? 350 : 100);

    } catch (error) {
        console.error('Error loading or processing model data:', error);
        modelGrid.innerHTML = '<p>Error loading models. Please try again later.</p>';

        // Hide loader even in case of error and make body visible
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.transition = 'opacity 0.3s';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }

        // Show body content
        setTimeout(() => {
            document.body.style.visibility = 'visible';
        }, 100);
    }
});
