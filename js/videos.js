document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const modelId = urlParams.get('id');
    const videoPlayerContainer = document.querySelector('.video-player-container');
    const modelNameElement = document.querySelector('.modelNameBook');

    if (!modelId) {
        console.error('No model ID found in URL');
        if (videoPlayerContainer) {
            videoPlayerContainer.innerHTML = '<p>No se encontró el ID del modelo.</p>';
        }
        return;
    }

    Promise.all([
        fetchData(['../json/models.json', '../json/translations.json'])
    ])
        .then(([[data, translations]]) => {
            const model = data.models.find(m => m.id === modelId);

            if (!model) {
                console.error(`Model with ID ${modelId} not found`);
                if (videoPlayerContainer) {
                    videoPlayerContainer.innerHTML = '<p>Modelo no encontrado.</p>';
                }
                return;
            }

            if (modelNameElement) {
                modelNameElement.textContent = model.name;
            }

            // Update portfolio and videos tab links
            const portfolioTab = document.getElementById('portfolio-tab');
            const videosTab = document.getElementById('videos-tab');
            const backButton = document.getElementById('backButton'); // Get the back button

            if (portfolioTab) {
                portfolioTab.href = `portfolio.html?id=${modelId}`;
            }
            if (videosTab) {
                if (model.videos && model.videos.length > 0) {
                    videosTab.href = `videos.html?id=${modelId}`;
                } else {
                    videosTab.style.display = 'none';
                }
            }

            // Update back button functionality
            if (backButton && model.category) {
                backButton.onclick = () => {
                    window.location.href = `../pages/${model.category}.html`;
                };
            }

            // Load model details
            const modelBookMeasurements = document.querySelector('.modelBookMeasurements');
            if (modelBookMeasurements && model.details) {
                modelBookMeasurements.innerHTML = ''; // Clear existing content
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
                    modelBookMeasurements.appendChild(measurementItem);
                }
            }

            if (model.videos && model.videos.length > 0) {
                model.videos.forEach(videoUrl => {
                    const videoWrapper = document.createElement('div');
                    videoWrapper.classList.add('video-wrapper');

            
                    // Check if the videoUrl is a local file (ends with .mp4 or .webm)
                    const isLocalVideo = videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm');

                    if (isLocalVideo) {
                        // Wrapper styling for custom controls
                        videoWrapper.style.position = 'relative';
                        videoWrapper.style.cursor = 'pointer';

                        const videoElement = document.createElement('video');
                        videoElement.setAttribute('autoplay', '');
                        videoElement.setAttribute('loop', '');
                        videoElement.setAttribute('playsinline', '');
                        videoElement.setAttribute('preload', 'metadata');
                        videoElement.poster = "";
                        videoElement.muted = true;
                        videoElement.style.width = '100%';
                        videoElement.style.height = '100%';
                        videoElement.style.objectFit = 'cover';

                        // Create custom play button
                        const playButton = document.createElement('div');
                        playButton.className = 'play-button';
                        
                        // Toggle play/pause on wrapper click
                        videoWrapper.addEventListener('click', () => {
                            if (videoElement.paused) {
                                videoElement.play();
                            } else {
                                videoElement.pause();
                            }
                        });

                        // Show/hide play button based on state
                        videoElement.addEventListener('play', () => {
                            playButton.style.display = 'none';
                        });
                        videoElement.addEventListener('pause', () => {
                            playButton.style.display = 'block';
                        });

                        const lastDotIndex = videoUrl.lastIndexOf('.');
                        const basePath = lastDotIndex !== -1 ? videoUrl.substring(0, lastDotIndex) : videoUrl;

                        const mp4Source = document.createElement('source');
                        mp4Source.src = `${basePath}.mp4`;
                        mp4Source.type = 'video/mp4';
                        videoElement.appendChild(mp4Source);

                        const fallbackText = document.createElement('p');
                        fallbackText.textContent = 'Tu navegador no soporta videos HTML5.';
                        videoElement.appendChild(fallbackText);

                        videoWrapper.appendChild(videoElement);
                        videoWrapper.appendChild(playButton); // Add play button to wrapper
                        videoPlayerContainer.appendChild(videoWrapper);
                    } else {
                        // Existing YouTube embed logic
                        let embedUrl = '';
                        if (videoUrl.includes('youtube.com/watch?v=')) {
                            const videoId = videoUrl.split('v=')[1].split('&')[0];
                            embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        } else if (videoUrl.includes('youtu.be/')) {
                            const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
                            embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        } else {
                            // If not a recognized YouTube URL, assume it's another embed link
                            embedUrl = videoUrl;
                        }

                        const iframe = document.createElement('iframe');
                        iframe.src = embedUrl;
                        iframe.setAttribute('frameborder', '0');
                        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                        iframe.setAttribute('allowfullscreen', '');
                        iframe.setAttribute('loading', 'lazy');
                        videoWrapper.appendChild(iframe);
                        videoPlayerContainer.appendChild(videoWrapper);
                    }
                });
            } else {
                if (videoPlayerContainer) {
                    videoPlayerContainer.innerHTML = '<p>No hay videos disponibles para este modelo.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading model data:', error);
            if (videoPlayerContainer) {
                videoPlayerContainer.innerHTML = '<p>Error al cargar los videos.</p>';
            }
        });
});
