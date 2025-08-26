document.addEventListener('DOMContentLoaded', function() {
    const dragDropArea = document.getElementById('dragDropArea');
    const fileInput = document.getElementById('fileInput');
    const uploadedImages = document.getElementById('uploadedImages');

    // Prevenir el comportamiento por defecto del navegador
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Resaltar el área de drop cuando se arrastra un archivo sobre ella
    ['dragenter', 'dragover'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dragDropArea.addEventListener(eventName, unhighlight, false);
    });

    // Manejar el drop de archivos
    dragDropArea.addEventListener('drop', handleDrop, false);
    
    // Manejar click en el área para seleccionar archivos
    dragDropArea.addEventListener('click', () => fileInput.click());
    
    // Manejar selección de archivos mediante el input
    fileInput.addEventListener('change', handleFiles);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dragDropArea.classList.add('drag-over');
    }

    function unhighlight(e) {
        dragDropArea.classList.remove('drag-over');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(e) {
        const files = e.target?.files || e;
        [...files].forEach(previewFile);
    }

    function previewFile(file) {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onloadend = function() {
            const div = document.createElement('div');
            div.className = 'uploaded-image';
            
            const img = document.createElement('img');
            img.src = reader.result;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = function() {
                div.remove();
            };
            
            div.appendChild(img);
            div.appendChild(removeBtn);
            uploadedImages.appendChild(div);
        };
    }
});
