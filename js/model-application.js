document.addEventListener('DOMContentLoaded', function() {
    // Handle frontal photo upload
    const frontalPhotoArea = document.getElementById('frontalPhotoArea');
    const frontalPhotoInput = document.getElementById('frontalPhotoInput');
    const frontalPhotoPreview = document.getElementById('frontalPhotoPreview');
    
    // Handle profile photo upload
    const profilePhotoArea = document.getElementById('profilePhotoArea');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const profilePhotoPreview = document.getElementById('profilePhotoPreview');
    
    // Handle full body photo upload
    const fullBodyPhotoArea = document.getElementById('fullBodyPhotoArea');
    const fullBodyPhotoInput = document.getElementById('fullBodyPhotoInput');
    const fullBodyPhotoPreview = document.getElementById('fullBodyPhotoPreview');
    
    // Setup event listeners for frontal photo
    if (frontalPhotoArea && frontalPhotoInput && frontalPhotoPreview) {
        setupPhotoUpload(frontalPhotoArea, frontalPhotoInput, frontalPhotoPreview);
    }
    
    // Setup event listeners for profile photo
    if (profilePhotoArea && profilePhotoInput && profilePhotoPreview) {
        setupPhotoUpload(profilePhotoArea, profilePhotoInput, profilePhotoPreview);
    }
    
    // Setup event listeners for full body photo
    if (fullBodyPhotoArea && fullBodyPhotoInput && fullBodyPhotoPreview) {
        setupPhotoUpload(fullBodyPhotoArea, fullBodyPhotoInput, fullBodyPhotoPreview);
    }
    
    function setupPhotoUpload(dropArea, fileInput, previewContainer) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        // Handle dropped files
        dropArea.addEventListener('drop', handleDrop, false);
        
        // Handle click on drop area
        dropArea.addEventListener('click', () => fileInput.click());
        
        // Handle file selection via input
        fileInput.addEventListener('change', function() {
            handleFiles(this.files, previewContainer);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        function highlight() {
            dropArea.classList.add('drag-over');
        }
        
        function unhighlight() {
            dropArea.classList.remove('drag-over');
        }
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files, previewContainer);
        }
    }
    
    function handleFiles(files, previewContainer) {
        [...files].forEach(file => {
            if (!file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onloadend = function() {
                // Clear previous preview
                previewContainer.innerHTML = '';
                
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
                previewContainer.appendChild(div);
            };
        });
    }
});