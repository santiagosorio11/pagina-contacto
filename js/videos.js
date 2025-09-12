document.addEventListener('DOMContentLoaded', async () => {
    const videoPlayerContainer = document.querySelector('.video-player-container');
    const modelNameElement = document.querySelector('.modelNameBook');
    const measurementsList = document.querySelector('.modelBookMeasurements');
    const mainContainer = document.getElementById('portfolio-main');

    if (!videoPlayerContainer) {
        console.error('Video player container not found!');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const modelId = params.get('id');

    if (!modelId) {
        mainContainer.innerHTML = '<h1>No se ha especificado un modelo.</h1>';
        return;
    }

    try {
        const response = await fetch('../json/models.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const model = data.models.find(m => m.id === modelId);

        if (!model) {
            mainContainer.innerHTML = '<h1>Modelo no encontrado.</h1>';
            return;
        }

        // Update tab links
        document.getElementById('portfolio-tab').href = `portfolio.html?id=${modelId}`;
        document.getElementById('polaroids-tab').href = `polaroids.html?id=${modelId}`;
        document.getElementById('videos-tab').href = `videos.html?id=${modelId}`;

        if (modelNameElement) {
            modelNameElement.textContent = model.name;
        }
        
        document.title = `Contacto Basico - ${model.name} - Videos`;

        if (measurementsList) {
            // This part can be simplified if you have a separate translation file,
            // but for simplicity, we'll just display the details as is.
            measurementsList.innerHTML = ''; // Clear existing placeholders
            for (const key in model.details) {
                const value = model.details[key];
                const measurementItem = document.createElement('div');
                measurementItem.classList.add('measurement-item');

                const nameSpan = document.createElement('span');
                nameSpan.className = 'measurementName';
                nameSpan.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}: `;

                const valueSpan = document.createElement('span');
                valueSpan.className = 'measurements';
                valueSpan.textContent = value;

                measurementItem.appendChild(nameSpan);
                measurementItem.appendChild(valueSpan);
                measurementsList.appendChild(measurementItem);
            }
        }

        videoPlayerContainer.innerHTML = ''; // Clear previous content

        if (model.videos && model.videos.length > 0) {
            model.videos.forEach(videoUrl => {
                const videoWrapper = document.createElement('div');
                videoWrapper.className = 'video-wrapper';

                const video = document.createElement('video');
                video.controls = true;
                video.preload = 'metadata';
                
                const source = document.createElement('source');
                source.src = `${videoUrl}`; // Assuming videoUrl starts with a slash
                
                // Basic type detection
                if (videoUrl.endsWith('.mp4')) {
                    source.type = 'video/mp4';
                } else if (videoUrl.endsWith('.webm')) {
                    source.type = 'video/webm';
                } else {
                    source.type = 'video/mp4'; // Fallback
                }

                video.appendChild(source);
                video.textContent = 'Tu navegador no soporta el tag de video.';
                
                videoWrapper.appendChild(video);
                videoPlayerContainer.appendChild(videoWrapper);
            });
        } else {
            videoPlayerContainer.innerHTML = '<p>No hay videos disponibles para este modelo.</p>';
        }

    } catch (error) {
        console.error('Error al cargar los datos del modelo:', error);
        mainContainer.innerHTML = '<h1>Error al cargar los videos.</h1>';
    } finally {
        document.body.style.visibility = 'visible';
    }
});
