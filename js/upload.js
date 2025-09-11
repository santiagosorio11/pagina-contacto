document.addEventListener('DOMContentLoaded', function() {
    const uploadBoxes = document.querySelectorAll('.upload-box');

    uploadBoxes.forEach(box => {
        const input = box.querySelector('input[type="file"]');
        const imagePreview = box.querySelector('.image-preview');
        const uploadLabel = box.querySelector('.upload-label');
        
        // Create the preview structure
        const filePreviewContainer = document.createElement('div');
        filePreviewContainer.className = 'file-preview';
        filePreviewContainer.style.display = 'none';

        const previewImage = document.createElement('img');
        previewImage.className = 'file-preview-image';
        
        const previewDetails = document.createElement('div');
        previewDetails.className = 'file-preview-details';

        const previewName = document.createElement('span');
        previewName.className = 'file-preview-name';

        const previewActions = document.createElement('div');
        previewActions.className = 'file-preview-actions';

        const replaceBtn = document.createElement('button');
        replaceBtn.type = 'button';
        replaceBtn.className = 'file-replace-btn';
        replaceBtn.textContent = 'Reemplazar';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'file-delete-btn';
        deleteBtn.textContent = 'Eliminar';

        previewActions.appendChild(replaceBtn);
        previewActions.appendChild(deleteBtn);
        previewDetails.appendChild(previewName);
        previewDetails.appendChild(previewActions);
        filePreviewContainer.appendChild(previewImage);
        filePreviewContainer.appendChild(previewDetails);
        
        box.appendChild(filePreviewContainer);

        input.addEventListener('change', () => {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewName.textContent = file.name;
                    
                    imagePreview.style.display = 'none';
                    uploadLabel.style.display = 'none';
                    filePreviewContainer.style.display = 'flex';
                }
                reader.readAsDataURL(file);
            }
        });

        deleteBtn.addEventListener('click', () => {
            input.value = ''; // Clear the file input
            filePreviewContainer.style.display = 'none';
            imagePreview.style.display = 'block';
            uploadLabel.style.display = 'block';
        });

        replaceBtn.addEventListener('click', () => {
            input.click();
        });
    });
});