/**
 * --------------------------------------------------------------------------
 * FILE 1: INITIALIZATION (main.js)
 * Bootstraps the application when the DOM is ready.
 * --------------------------------------------------------------------------
 */

// Create a global instance
let app;

document.addEventListener('DOMContentLoaded', () => {
    // Check if dependencies are loaded
    if (typeof PRICING_DB === 'undefined') {
        console.error('CRITICAL: PRICING_DB not found. Check script loading order.');
        return;
    }
    
    if (typeof QuoteApp === 'undefined') {
        console.error('CRITICAL: QuoteApp Class not found. Check script loading order.');
        return;
    }

    // Initialize Application
    app = new QuoteApp();
    app.init();
});
