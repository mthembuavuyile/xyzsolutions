let app;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof CONFIG === 'undefined' || typeof SERVICES_MASTER === 'undefined' || typeof QuoteApp === 'undefined') {
        console.error('CRITICAL: One or more scripts failed to load. Check order: Config -> Data -> Engine -> Main');
        return;
    }

    app = new QuoteApp();
    app.init();
});
