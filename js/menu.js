// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navContainer = document.querySelector('.nav-container');
    
    if (menuToggle && navContainer) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navContainer.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navContainer.contains(e.target) && !menuToggle.contains(e.target) && navContainer.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navContainer.classList.remove('active');
            }
        });

        // Close menu when window is resized beyond mobile breakpoint
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                menuToggle.classList.remove('active');
                navContainer.classList.remove('active');
            }
        });
    }
});
