// scrii/main.js

// 1. Declare the variable 'app' globally so the HTML onclick="" events can see it.
let app;

// 2. Wait for the HTML to finish loading before starting the logic
document.addEventListener('DOMContentLoaded', () => {
    
    // 3. Create a new instance of your QuoteApp (from engine.js)
    app = new QuoteApp();
    
    // 4. Run the initialization function
    app.init();
    
    console.log("Quote App Initialized");
});