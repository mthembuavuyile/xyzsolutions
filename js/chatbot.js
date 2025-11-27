function initializeChatbot() {
    // --- Icon Mapping (Font Awesome) ---
    const icons = {
        quote: 'fa-solid fa-file-invoice-dollar',
        services: 'fa-solid fa-broom',
        pricing: 'fa-solid fa-tags',
        contact: 'fa-solid fa-phone',
        home: 'fa-solid fa-house',
        business: 'fa-solid fa-building',
        specialized: 'fa-solid fa-sparkles',
        back: 'fa-solid fa-arrow-left',
        recurring: 'fa-solid fa-rotate',
        onceoff: 'fa-solid fa-star',
        commercial: 'fa-solid fa-briefcase',
        form: 'fa-solid fa-file-lines',
        phone_jhb: 'fa-solid fa-phone',
        phone_dbn: 'fa-solid fa-phone',
        whatsapp: 'fa-brands fa-whatsapp',
        email: 'fa-solid fa-envelope',
        construction: 'fa-solid fa-hammer',
        event: 'fa-solid fa-champagne-glasses',
        airbnb: 'fa-solid fa-key',
        car: 'fa-solid fa-car',
        couch: 'fa-solid fa-couch',
        kitchen: 'fa-solid fa-fire-burner',
        window: 'fa-solid fa-table-cells',
        policy: 'fa-solid fa-shield-halved',
        faq: 'fa-solid fa-circle-question',
    };

    // --- Element Selection ---
    const elements = {
        toggler: document.querySelector('.chatbot-toggler'),
        popup: document.querySelector('.chatbot-popup'),
        closeBtn: document.querySelector('.close-chatbot-btn'),
        messagesContainer: document.getElementById('messages'),
        composer: document.getElementById('composer'),
        input: document.getElementById('input'),
        quickbar: document.getElementById('quickbar'),
        typingIndicator: document.getElementById('typing'),
    };

    if (Object.values(elements).some(el => !el)) {
        console.error("Chatbot initialization failed: Missing HTML elements.");
        return;
    }

    // --- Image Mapping ---
    // Ensure these paths match your actual folder structure
    const serviceImages = {
        regular: 'images/regular-domestic.jpeg',
        commercial: 'images/commercial-office.jpeg',
        deep: 'images/end-of-lease-deep.jpeg',
        airbnb: 'images/airbnb-cleanups.jpeg',
        event: 'images/event-cleanups.jpeg',
        construction: 'images/construction-cleanups.jpeg',
        move: 'images/move-in-or-out.jpeg',
        complex: 'images/complex-common-areas.jpeg',
    };

    // Helper for icons
    const icon = (key) => `<i class="${icons[key] || icons.services}"></i>`;

    // --- Conversation Tree (The Brain) ---
    const conversationTree = {
        greeting: {
            text: "👋 Hello! Welcome to <b>XYZSolutions & Projects</b>.<br>We provide premium, eco-friendly cleaning in JHB & Durban.<br><br>How can we help you today?",
            options: [
                { text: `${icon('quote')} Get a Quote`, value: "quote_entry" },
                { text: `${icon('pricing')} Itemized Pricing`, value: "pricing_categories" },
                { text: `${icon('services')} Our Services`, value: "services" },
                { text: `${icon('policy')} Policies & FAQs`, value: "policies_menu" },
                { text: `${icon('contact')} Contact Us`, value: "contact" },
            ],
        },

        // --- Services Section ---
        services: {
            text: "We offer tailored solutions for every need. Select a category:",
            options: [
                { text: `${icon('home')} Residential`, value: "services_home" },
                { text: `${icon('business')} Commercial`, value: "services_business" },
                { text: `${icon('specialized')} Specialized`, value: "services_specialized" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        services_home: {
            text: "<b>Residential Services:</b>",
            images: [serviceImages.regular, serviceImages.deep],
            details: [
                "• <b>Regular Domestic:</b> Dusting, vacuuming, mopping, bathrooms & kitchens.",
                "• <b>Deep / End-of-Lease:</b> Degreasing, descaling, skirting boards, windows.",
                "• <b>Move-in/Move-out:</b> Inside cupboards, sanitizing all surfaces."
            ],
            options: [
                { text: `${icon('quote')} Get Home Quote`, value: "quote_home" },
                { text: `${icon('pricing')} See Pricing`, value: "pricing_categories" },
                { text: `${icon('back')} Back`, value: "services" },
            ],
        },
        services_business: {
            text: "<b>Commercial Solutions:</b>",
            images: [serviceImages.commercial, serviceImages.complex],
            details: [
                "• <b>Office Cleaning:</b> Workspaces, restrooms, reception, waste removal.",
                "• <b>Complexes:</b> Lobbies, stairwells, shared facilities (gyms/pools).",
                "• <b>Flexible Contracts:</b> We work around your business hours."
            ],
            options: [
                { text: `${icon('quote')} Get Office Quote`, value: "quote_business" },
                { text: `${icon('contact')} Discuss Contract`, value: "contact" },
                { text: `${icon('back')} Back`, value: "services" },
            ],
        },
        services_specialized: {
            text: "<b>Specialized Cleaning:</b>",
            images: [serviceImages.construction, serviceImages.airbnb],
            details: [
                "• <b>Post-Construction:</b> Dust/debris removal, paint residue, fittings.",
                "• <b>Airbnb:</b> Linen change, restocking, guest-ready checks.",
                "• <b>Events:</b> Pre-setup, during-event waste, post-event deep clean."
            ],
            options: [
                { text: `${icon('quote')} Request Quote`, value: "quote_specialized" },
                { text: `${icon('back')} Back`, value: "services" },
            ],
        },

        // --- Detailed Pricing Section (Data Integration) ---
        pricing_categories: {
            text: `${icon('pricing')} <b>Price Guide (VAT Incl):</b><br>Select a category to view specific item costs:`,
            options: [
                { text: `${icon('couch')} Furniture & Carpets`, value: "pricing_upholstery" },
                { text: `${icon('kitchen')} Kitchen & Ovens`, value: "pricing_kitchen" },
                { text: `${icon('car')} Vehicles`, value: "pricing_vehicles" },
                { text: `${icon('window')} Windows & Structural`, value: "pricing_structural" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        pricing_upholstery: {
            text: "<b>🛋️ Upholstery, Carpets & Mattresses:</b>",
            details: [
                "<b>Couches:</b>",
                "• 1-Seater: R275 | 2-Seater: R395",
                "• 3-Seater: R455 | L-Shape/U-Shape: R845",
                "• Dining Chair: R95 | Wingback: R275",
                "<br><b>Carpets & Rugs:</b>",
                "• Loose Rug (<2x2m): R245",
                "• Std Room Carpet: R375",
                "• Office Carpet: R21/m²",
                "<br><b>Mattresses:</b>",
                "• Single: R295 | Double/Queen/King: R495"
            ],
            options: [
                { text: `${icon('quote')} Book This`, value: "quote_entry" },
                { text: `${icon('back')} Categories`, value: "pricing_categories" },
            ],
        },
        pricing_kitchen: {
            text: "<b>🍳 Kitchen Deep Cleans:</b>",
            details: [
                "<b>Ovens:</b>",
                "• Single (60-80cm): R1450",
                "• Double (60-80cm): R1950",
                "• Extractor/Hood: R750",
                "<br><b>Stoves & Braais:</b>",
                "• Modern Complete Stove: R1950",
                "• Vintage Stove: R3250",
                "• Portable Braai: R1550 | Built-in: R1750"
            ],
            options: [
                { text: `${icon('quote')} Book This`, value: "quote_entry" },
                { text: `${icon('back')} Categories`, value: "pricing_categories" },
            ],
        },
        pricing_vehicles: {
            text: "<b>🚗 Vehicle Valet (Interior):</b>",
            details: [
                "• 5 Seats (Standard): R545",
                "• 6–9 Seats (SUV/Minivan): R675",
                "• 10–14 Seats (Bus): R955",
                "• Infant Car Seat: R155"
            ],
            options: [
                { text: `${icon('quote')} Book Valet`, value: "quote_entry" },
                { text: `${icon('back')} Categories`, value: "pricing_categories" },
            ],
        },
        pricing_structural: {
            text: "<b>🪟 Windows & Structural:</b>",
            details: [
                "<b>Windows:</b>",
                "• Square Plain: R35",
                "• Square Cottage: R55",
                "• Sliding Door (x2 panels): R45",
                "• Foldable Stack Door: R125",
                "<br><b>Discounts:</b>",
                "• 25% OFF for 6+ month contracts."
            ],
            options: [
                { text: `${icon('quote')} Get Quote`, value: "quote_entry" },
                { text: `${icon('back')} Categories`, value: "pricing_categories" },
            ],
        },

        // --- Policies & FAQs ---
        policies_menu: {
            text: "<b>ℹ️ Information Desk:</b>",
            options: [
                { text: "Payment Terms", value: "policy_payment" },
                { text: "Cancellations", value: "policy_cancellation" },
                { text: "Safety & Insurance", value: "policy_safety" },
                { text: "FAQs", value: "faqs" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        policy_payment: {
            text: "<b>💳 Payment Terms:</b>",
            details: [
                "• <b>Deposit:</b> 50% required to confirm booking.",
                "• <b>Balance:</b> Remaining 50% due upon completion.",
                "• <b>Method:</b> EFT Only. No cash or credit cards accepted.",
                "• <b>Note:</b> Work does not commence without proof of payment."
            ],
            options: [{ text: `${icon('back')} Back`, value: "policies_menu" }],
        },
        policy_cancellation: {
            text: "<b>🚫 Cancellation Policy:</b>",
            details: [
                "• <b>Notice:</b> Minimum 48 hours required.",
                "• <b>Late Fee:</b> 50% of service cost if cancelled within 48hrs.",
                "• <b>No-Access Fee:</b> 100% charged if we cannot access property upon arrival."
            ],
            options: [{ text: `${icon('back')} Back`, value: "policies_menu" }],
        },
        policy_safety: {
            text: "<b>🛡️ Safety & Guarantee:</b>",
            details: [
                "• <b>Guarantee:</b> Unsatisfied? Notify us within 24hrs and we return for free.",
                "• <b>Insurance:</b> Fully insured for property damage & staff injury.",
                "• <b>Staff:</b> Background-checked, uniformed, and trained.",
                "• <b>Products:</b> Eco-friendly, non-toxic, safe for pets/kids."
            ],
            options: [{ text: `${icon('back')} Back`, value: "policies_menu" }],
        },
        faqs: {
            text: "<b>❓ Frequently Asked Questions:</b>",
            details: [
                "<b>Q: Do you bring equipment?</b><br>A: Yes, we bring all machines and eco-friendly supplies.",
                "<b>Q: Can I leave the cleaner alone?</b><br>A: Yes, our staff are vetted professionals.",
                "<b>Q: What if something breaks?</b><br>A: We are insured. Report it within 24hrs."
            ],
            options: [
                { text: `${icon('quote')} I'm Ready to Book`, value: "quote_entry" },
                { text: `${icon('back')} Back`, value: "policies_menu" },
            ],
        },

        // --- Quote Logic ---
        quote_entry: {
            text: "Let's build your quote. Where are you located?",
            options: [
                { text: "Johannesburg / Gauteng", value: "quote_type_jhb" },
                { text: "Durban / KZN", value: "quote_type_dbn" },
            ],
        },
        quote_type_jhb: {
            text: "Great! We serve JHB, Pretoria, Sandton & surrounds. What do you need?",
            options: [
                { text: "Home Cleaning", value: "quote_final_jhb" },
                { text: "Office/Commercial", value: "quote_final_jhb" },
                { text: "Deep Clean / Move", value: "quote_final_jhb" },
                { text: "Specific Item (Couch/Oven)", value: "quote_final_jhb" },
            ],
        },
        quote_type_dbn: {
            text: "Perfect! We serve Durban North, Umhlanga, Ballito & surrounds. What do you need?",
            options: [
                { text: "Home Cleaning", value: "quote_final_dbn" },
                { text: "Office/Commercial", value: "quote_final_dbn" },
                { text: "Deep Clean / Move", value: "quote_final_dbn" },
                { text: "Specific Item (Couch/Oven)", value: "quote_final_dbn" },
            ],
        },
        quote_final_jhb: {
            text: "Please use our Online Quote Tool or contact our JHB team directly:",
            options: [
                { text: `${icon('form')} Quote Form`, value: "redirectToContact" },
                { text: `${icon('phone_jhb')} Call 068 029 7313`, value: "call_jhb" },
                { text: `${icon('whatsapp')} WhatsApp Us`, value: "whatsapp" },
            ],
        },
        quote_final_dbn: {
            text: "Please use our Online Quote Tool or contact our Durban team directly:",
            options: [
                { text: `${icon('form')} Quote Form`, value: "redirectToContact" },
                { text: `${icon('phone_dbn')} Call 062 297 6614`, value: "call_dbn" },
                { text: `${icon('whatsapp')} WhatsApp Us`, value: "whatsapp" },
            ],
        },

        // --- Contact Actions ---
        contact: {
            text: "<b>📞 Contact Details:</b>",
            details: [
                "<b>JHB:</b> 068 029 7313",
                "<b>DBN:</b> 062 297 6614",
                "<b>Email:</b> quotes@xyzsolutions.co.za",
                "<b>Hours:</b> Mon-Fri 8-5, Sat 9-1"
            ],
            options: [
                { text: `${icon('phone_jhb')} Call JHB`, value: "call_jhb" },
                { text: `${icon('phone_dbn')} Call DBN`, value: "call_dbn" },
                { text: `${icon('whatsapp')} WhatsApp`, value: "whatsapp" },
                { text: `${icon('back')} Main Menu`, value: "greeting" },
            ],
        },
        whatsapp: { action: () => redirectTo('https://wa.me/27622976614', `${icon('whatsapp')} Opening WhatsApp...`) },
        call_jhb: { action: () => callNumber('0680297313', `${icon('phone_jhb')} Dialing JHB Team...`) },
        call_dbn: { action: () => callNumber('0622976614', `${icon('phone_dbn')} Dialing DBN Team...`) },
        redirectToContact: { action: () => redirectTo('contact.html', "✅ Loading Quote Form...") },
        
        default: {
            text: "🤔 I didn't quite catch that. Try selecting an option below or type 'help'.",
            options: [
                { text: "Get a Quote", value: "quote_entry" },
                { text: "See Prices", value: "pricing_categories" },
                { text: "Services", value: "services" },
            ],
        },
    };

    // --- Core Logic ---
    const toggleChatbot = () => {
        elements.popup.classList.toggle('show');
        if (elements.popup.classList.contains('show')) setTimeout(() => elements.input.focus(), 300);
    };

    const showTyping = () => elements.typingIndicator.classList.remove('hidden');
    const hideTyping = () => elements.typingIndicator.classList.add('hidden');

    const addMessage = (sender, text, images = null, details = null) => {
        const msg = document.createElement('div');
        msg.className = `message ${sender}`;
        
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'message-content';
        
        const textPara = document.createElement('p');
        textPara.innerHTML = text;
        contentWrapper.appendChild(textPara);
        
        // Render Lists/Details
        if (details && details.length > 0) {
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'message-details';
            details.forEach(detail => {
                const detailPara = document.createElement('p');
                detailPara.innerHTML = detail;
                detailsDiv.appendChild(detailPara);
            });
            contentWrapper.appendChild(detailsDiv);
        }
        
        // Render Images
        if (images && images.length > 0) {
            const imagesDiv = document.createElement('div');
            imagesDiv.className = 'message-images';
            images.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.className = 'service-image';
                img.onerror = function() { this.style.display = 'none'; }; // Hide if missing
                imagesDiv.appendChild(img);
            });
            contentWrapper.appendChild(imagesDiv);
        }
        
        msg.appendChild(contentWrapper);
        elements.messagesContainer.appendChild(msg);
        
        setTimeout(() => {
            elements.messagesContainer.scrollTo({ top: elements.messagesContainer.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    const renderOptions = (options) => {
        elements.quickbar.innerHTML = '';
        if (!options) return;
        
        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply';
            btn.innerHTML = opt.text;
            btn.dataset.value = opt.value;
            btn.style.animationDelay = `${idx * 0.05}s`;
            elements.quickbar.appendChild(btn);
        });
    };

    const processResponse = (key, showTypingEffect = true) => {
        elements.quickbar.innerHTML = '';
        const res = conversationTree[key] || conversationTree.default;

        if (res.action) return res.action();

        const display = () => {
            addMessage('bot', res.text, res.images, res.details);
            renderOptions(res.options);
        };

        if (showTypingEffect) {
            showTyping();
            setTimeout(() => {
                hideTyping();
                display();
            }, 600 + Math.random() * 400);
        } else {
            display();
        }
    };

    // --- Smarter Keyword Matching ---
    const handleFreeTextInput = (input) => {
        const text = input.toLowerCase().trim();
        
        // Priority Mapping
        const mapping = [
            // Specific Pricing Items
            { keywords: ['couch', 'sofa', 'chair', 'upholstery', 'rug', 'carpet', 'mattress'], key: 'pricing_upholstery', priority: 10 },
            { keywords: ['oven', 'stove', 'braai', 'kitchen', 'hob', 'extractor'], key: 'pricing_kitchen', priority: 10 },
            { keywords: ['car', 'vehicle', 'valet', 'bus', 'seat'], key: 'pricing_vehicles', priority: 10 },
            { keywords: ['window', 'glass', 'door', 'sliding'], key: 'pricing_structural', priority: 10 },
            
            // Policies
            { keywords: ['cancel', 'cancellation', 'refund', 'late'], key: 'policy_cancellation', priority: 9 },
            { keywords: ['pay', 'payment', 'eft', 'cash', 'card', 'deposit'], key: 'policy_payment', priority: 9 },
            { keywords: ['insurance', 'damage', 'break', 'safety', 'trust'], key: 'policy_safety', priority: 9 },
            
            // Locations
            { keywords: ['jhb', 'johannesburg', 'gauteng', 'pretoria', 'sandton'], key: 'quote_type_jhb', priority: 8 },
            { keywords: ['dbn', 'durban', 'natal', 'umhlanga', 'ballito'], key: 'quote_type_dbn', priority: 8 },
            
            // General Services
            { keywords: ['office', 'business', 'commercial'], key: 'services_business', priority: 7 },
            { keywords: ['construction', 'renovation', 'build'], key: 'services_specialized', priority: 7 },
            { keywords: ['move', 'moving', 'lease'], key: 'services_home', priority: 7 },
            { keywords: ['quote', 'cost', 'price', 'estimate'], key: 'quote_entry', priority: 6 },
            { keywords: ['contact', 'call', 'email', 'number'], key: 'contact', priority: 6 },
            { keywords: ['hi', 'hello', 'help'], key: 'greeting', priority: 5 }
        ];

        let bestMatch = null;
        let bestScore = 0;

        for (const map of mapping) {
            if (map.keywords.some(k => text.includes(k))) {
                if (map.priority > bestScore) {
                    bestScore = map.priority;
                    bestMatch = map.key;
                }
            }
        }

        processResponse(bestMatch || 'default');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userInput = elements.input.value.trim();
        if (!userInput) return;
        
        addMessage('user', userInput);
        elements.input.value = '';
        handleFreeTextInput(userInput);
    };

    const handleQuickReply = (e) => {
        if (!e.target.classList.contains('quick-reply')) return;
        addMessage('user', e.target.textContent); // Echo user choice
        processResponse(e.target.dataset.value);
    };

    const callNumber = (number, msg) => {
        addMessage('bot', msg);
        setTimeout(() => window.location.href = `tel:${number}`, 1000);
        setTimeout(() => processResponse('contact', false), 2000);
    };

    const redirectTo = (url, msg) => {
        addMessage('bot', msg);
        setTimeout(() => window.location.href = url, 1000);
    };

    // --- Event Listeners ---
    elements.toggler.addEventListener('click', toggleChatbot);
    elements.closeBtn.addEventListener('click', toggleChatbot);
    elements.quickbar.addEventListener('click', handleQuickReply);
    elements.composer.addEventListener('submit', handleFormSubmit);
    elements.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFormSubmit(e); }
    });

    // Start
    setTimeout(() => processResponse('greeting', false), 500);
}

// Init
document.addEventListener('DOMContentLoaded', initializeChatbot);