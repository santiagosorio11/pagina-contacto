document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('become-a-model-form');
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    // Load translations
    let translations = {};
    try {
        const response = await fetch('../json/translations.json');
        if (response.ok) {
            translations = await response.json();
        } else {
            console.error('Failed to load translations.');
        }
    } catch (error) {
        console.error('Error loading translations:', error);
    }

    // Create a status message container
    const statusMessage = document.createElement('p');
    statusMessage.className = 'form-status';
    statusMessage.style.textAlign = 'center';
    statusMessage.style.marginTop = '15px';
    statusMessage.style.display = 'none';
    form.appendChild(statusMessage);

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }

        // --- VALIDATION ---
        const headshot = form.querySelector('input[name="headshot"]').files[0];
        const sideprofile = form.querySelector('input[name="sideprofile"]').files[0];
        const fulllength = form.querySelector('input[name="fulllength"]').files[0];

        if (!headshot || !sideprofile || !fulllength) {
            const lang = localStorage.getItem('preferred_language') || 'es';
            const message = lang === 'es' ? 'Por favor, sube las tres fotos requeridas.' : 'Please upload all three required photos.';
            showStatus(message, 'error');
            return;
        }

        // --- START SUBMISSION ---
        setLoading(true);
        const lang = localStorage.getItem('preferred_language') || 'es';
        const sendingMessage = lang === 'es' ? 'Enviando tu aplicación, por favor espera...' : 'Sending your application, please wait...';
        showStatus(sendingMessage, 'loading');

        try {
            // 1. Convert images to Base64
            const headshotBase64 = await toBase64(headshot);
            const sideprofileBase64 = await toBase64(sideprofile);
            const fulllengthBase64 = await toBase64(fulllength);

            // 2. Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // 3. Construct payload
            const payload = {
                ...data,
                headshot: headshotBase64,
                sideprofile: sideprofileBase64,
                fulllength: fulllengthBase64,
                shoeSize: data['shoe-size'] // Handle hyphenated name
            };
            
            // --- IMPORTANT ---
            // Replace this URL with your actual Google Apps Script Web App URL
            const webAppUrl = 'https://script.google.com/macros/s/AKfycbwJfpCzONhiAqx8Z5ZQZtCcw34CjWy0rTjSC5AsSKmvRAufELNYpJufvOfKQI_seblqxg/exec';

            // 4. Send data to Google Apps Script
            const response = await fetch(webAppUrl, {
                method: 'POST',
                mode: 'cors',
                redirect: 'follow',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', // Required for Apps Script
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            // 5. Handle response
            if (result.status === 'success') {
                const successMessage = lang === 'es' ? '¡Aplicación enviada con éxito! Gracias por tu interés.' : 'Application submitted successfully! Thank you for your interest.';
                showStatus(successMessage, 'success');
                form.reset();
                // Reset file previews from upload.js
                document.querySelectorAll('.file-delete-btn').forEach(btn => btn.click());
            } else {
                throw new Error(result.message || (lang === 'es' ? 'Ocurrió un error desconocido.' : 'An unknown error occurred.'));
            }

        } catch (error) {
            console.error('Submission Error:', error);
            const errorMessage = lang === 'es' ? `Error al enviar: ${error.message}. Por favor, inténtalo de nuevo.` : `Error submitting: ${error.message}. Please try again.`;
            showStatus(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    });

    function validateForm() {
        let isValid = true;
        const lang = localStorage.getItem('preferred_language') || 'es';
        const requiredMessage = translations[lang]?.form_validation_required || 'Please fill out this field.';

        // Clear previous validation messages
        form.querySelectorAll('.validation-message').forEach(el => el.remove());

        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            const isCheckbox = field.type === 'checkbox';
            const isFile = field.type === 'file';
            let value = isCheckbox ? field.checked : field.value.trim();
            if (isFile) {
                value = field.files.length > 0;
            }

            if (!value) {
                isValid = false;
                field.classList.add('is-invalid');
                const error = document.createElement('div');
                error.className = 'validation-message';
                error.style.color = 'red';
                error.style.fontSize = '0.8em';
                error.textContent = requiredMessage;
                field.parentNode.insertBefore(error, field.nextSibling);
            } else {
                field.classList.remove('is-invalid');
            }
        });

        return isValid;
    }

    /**
     * Converts a file to a Base64 encoded string.
     * @param {File} file The file to convert.
     * @returns {Promise<string>} A promise that resolves with the Base64 string.
     */
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    /**
     * Sets the loading state of the submit button.
     * @param {boolean} isLoading Whether the form is loading.
     */
    function setLoading(isLoading) {
        const lang = localStorage.getItem('preferred_language') || 'es';
        const sendingText = lang === 'es' ? 'Enviando...' : 'Sending...';
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.innerHTML = `<span class="spinner"></span> ${sendingText}`;
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }

    /**
     * Displays a status message to the user.
     * @param {string} message The message to display.
     * @param {'loading'|'success'|'error'} type The type of message.
     */
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.style.display = 'block';
        statusMessage.style.color = type === 'success' ? 'green' : (type === 'error' ? 'red' : 'black');
    }
});
