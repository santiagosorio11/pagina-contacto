(function () {
    const currentScript = document.currentScript;
    const measurementId = currentScript && currentScript.dataset ? currentScript.dataset.gaId : null;

    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
        console.warn('Google Analytics no se inicializó: configura un ID de medición válido en data-ga-id.');
        return;
    }

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }

    gtag('js', new Date());
    gtag('config', measurementId);

    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    gaScript.onload = () => {
        gtag('event', 'page_view', {
            page_path: window.location.pathname,
            page_location: window.location.href,
            page_title: document.title
        });
    };

    document.head.appendChild(gaScript);
})();

