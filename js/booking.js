document.addEventListener('DOMContentLoaded', () => {

    // --- DATA STORE: SINGLE SOURCE OF TRUTH FOR ALL PRICING ---
    const pricingData = {
        regular_domestic: {
            name: 'Regular Domestic Cleaning',
            callOutFee: 250.00,
            packages: [
                { id: 'rd_std', name: 'Standard Clean (1-2 Bedrooms)', price: 380.00, description: 'Includes: 1 kitchen, 1 bathroom, 2 bedrooms, and 1 general area (lounge/dining).' }
            ],
            addOns: [
                 { id: 'rd_add_bath', name: 'Additional Bathroom Sanitization', price: 150.00 },
                 { id: 'rd_add_bed', name: 'Additional Bedroom Cleaning', price: 130.00 },
                 { id: 'dc_windows_reg', name: 'Interior Windows & Sills (per room)', price: 90.00 },
            ]
        },
        deep_clean: {
            name: 'End-of-Lease / Deep Clean',
            callOutFee: 500.00,
            // This service is fully itemized (à la carte)
            packages: [],
            addOns: [
                { id: 'dc_oven', name: 'Deep Oven & Extractor Degrease', price: 350.00 },
                { id: 'dc_cabinets', name: 'Kitchen Cabinets (Interior & Exterior)', price: 250.00 },
                { id: 'dc_fridge', name: 'Interior Fridge/Freezer Clean', price: 150.00 },
                { id: 'dc_windows', name: 'Interior Windows & Sills (per room)', price: 90.00 },
                { id: 'dc_walls', name: 'Skirting Boards & Wall Spot-Cleaning (per room)', price: 120.00 },
                { id: 'dc_carpet_steam', name: 'Carpet Steam Cleaning (per room)', price: 380.00 },
                { id: 'dc_bathroom', name: 'Full Bathroom Deep Clean', price: 200.00 },
                { id: 'dc_bedroom', name: 'Full Bedroom Deep Clean', price: 180.00 },
            ]
        },
        airbnb: {
            name: 'Airbnb & Holiday Rentals',
            callOutFee: 300.00,
            packages: [
                { id: 'ab_studio', name: 'Studio / 1 Bedroom Turnover', price: 450.00, description: 'Full sanitization of 1 bathroom, kitchen surfaces, floors & dusting.' },
                { id: 'ab_2_bed', name: '2-3 Bedroom Turnover', price: 650.00, description: 'Full sanitization of up to 2 bathrooms, kitchen surfaces, floors & dusting.' },
            ],
            addOns: [
                { id: 'ab_linen', name: 'Linen & Towel Service (per bed)', price: 150.00 },
                { id: 'dc_oven_ab', name: 'Deep Oven & Extractor Degrease', price: 350.00 },
                { id: 'dc_fridge_ab', name: 'Interior Fridge/Freezer Clean', price: 150.00 },
            ]
        },
        commercial: { name: 'Commercial & Office Cleaning', requiresConsultation: true, message: 'A pristine workspace requires a custom plan. Please proceed to the next step to enter your details for a free consultation.' },
        post_construction: { name: 'Post-Construction Cleaning', requiresConsultation: true, message: 'Construction clean-ups are highly specialized. To give you an accurate quote, we need to assess the site. Please enter your details for a consultation.' },
        event_cleanup: { name: 'Event Clean-ups', requiresConsultation: true, message: 'From parties to corporate functions, we handle it all. Please provide your details, and we will contact you to discuss the scope of your event.' },
        complex_common: { name: 'Complex & Common Areas', requiresConsultation: true, message: 'Maintaining shared spaces requires a consistent schedule. Please enter your details to request a tailored maintenance proposal.' }
    };
    const MINIMUM_CHARGE = 950.00;
    const DISCOUNT_RATE = 0.25;

    // --- STATE MANAGEMENT ---
    let currentStep = 1;
    let selectedServiceKey = null;
    const cart = {
        packageId: null,
        addOns: {} // Stores { itemId: quantity }
    };

    // --- DOM ELEMENT CACHING ---
    const bookingForm = document.getElementById('booking-form');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-bar .step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const serviceSelectContainer = document.getElementById('service-select-container');
    const serviceSelectTrigger = serviceSelectContainer.querySelector('.custom-select-trigger');
    const serviceSelectOptions = serviceSelectContainer.querySelectorAll('.custom-select-option');
    const selectedServiceText = document.getElementById('selected-service-text');
    const hiddenServiceInput = document.getElementById('service_type');
    const itemListContainer = document.getElementById('item-list');
    const quoteContainer = document.getElementById('quote-summary-container');
    const discountCheckbox = document.getElementById('contractual_discount');
    const allSelects = document.querySelectorAll('select');

    // --- FLOATING SELECT LABELS HANDLER ---
    allSelects.forEach(select => {
        const updateValue = () => select.classList.toggle('has-value', !!select.value);
        select.addEventListener('change', updateValue);
        updateValue(); // Check on load
    });

    // --- CORE FUNCTIONS ---
    const renderCurrentStep = () => {
        formSteps.forEach(step => step.classList.remove('active'));
        document.getElementById(`form-step-${currentStep}`)?.classList.add('active');

        progressSteps.forEach((step, index) => {
            step.classList.toggle('completed', index + 1 < currentStep);
            step.classList.toggle('active', index + 1 === currentStep);
        });

        prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
        const service = pricingData[selectedServiceKey];
        const isLeadGenOnly = service && service.requiresConsultation;
        nextBtn.style.display = currentStep < 4 ? 'inline-block' : 'none';
        submitBtn.style.display = currentStep === 4 ? 'inline-block' : 'none';
        
        // Show quote summary only on step 2, and only if it's not a consultation service
        quoteContainer.style.display = (currentStep === 2 && !isLeadGenOnly) ? 'block' : 'none';

        if (currentStep === 4) renderBookingSummary();
    };

    const updateStep = (increment) => {
        // Validation logic before proceeding
        if (increment > 0) {
            if (currentStep === 1 && (!document.getElementById('service_area').value || !hiddenServiceInput.value)) {
                alert('Please select a service area and a service type.');
                return;
            }
            if (currentStep === 2) {
                 const service = pricingData[selectedServiceKey];
                 if (service && !service.requiresConsultation) {
                     const hasPackage = service.packages.length === 0 || !!cart.packageId;
                     const hasAddOns = Object.keys(cart.addOns).length > 0;
                     if (!hasPackage || (!hasAddOns && !cart.packageId) ) {
                         alert('Please select a service package or at least one add-on to continue.');
                         return;
                     }
                 }
            }
            if (currentStep === 3) {
                const requiredFields = ['name', 'email', 'phone', 'address', 'booking_date', 'booking_time'];
                if (!requiredFields.every(id => document.getElementById(id).value.trim() !== '')) {
                    alert('Please fill in all your contact and booking details.');
                    return;
                }
            }
        }
        currentStep += increment;
        window.scrollTo(0, 0); // Scroll to top on step change
        renderCurrentStep();
    };

    const selectService = (serviceKey) => {
        selectedServiceKey = serviceKey;
        cart.packageId = null;
        cart.addOns = {};

        const selectedOption = document.querySelector(`.custom-select-option[data-service="${serviceKey}"]`);
        selectedServiceText.innerText = selectedOption.querySelector('span').innerText;
        hiddenServiceInput.value = serviceKey;
        serviceSelectContainer.classList.add('has-value');
        serviceSelectContainer.classList.remove('open');

        populateItemList();
        calculateTotal();
    };

    const populateItemList = () => {
        const service = pricingData[selectedServiceKey];
        if (!service) return;

        document.getElementById('quote-builder-title').innerText = service.requiresConsultation ? 'Consultation Request' : `Build Your ${service.name} Quote`;
        itemListContainer.innerHTML = '';

        if (service.requiresConsultation) {
            itemListContainer.innerHTML = `<p class="consultation-message">${service.message}</p>`;
            return;
        }

        // Render Packages
        if (service.packages && service.packages.length > 0) {
            const packagesHTML = service.packages.map(pkg => `
                <label class="package-option">
                    <input type="radio" name="service_package" value="${pkg.id}" data-price="${pkg.price}">
                    <div class="package-details">
                        <span class="package-name">${pkg.name} - R ${pkg.price.toFixed(2)}</span>
                        <span class="package-desc">${pkg.description}</span>
                    </div>
                </label>
            `).join('');
            itemListContainer.innerHTML += `<h4 class="item-list-subtitle">1. Choose Your Base Package</h4>${packagesHTML}`;
        }

        // Render Add-Ons
        if (service.addOns && service.addOns.length > 0) {
            const subtitle = service.packages.length > 0 ? '2. Select Optional Add-Ons' : 'Build Your Quote';
            const addOnsHTML = service.addOns.map(item => `
                <div class="item-row" data-id="${item.id}" data-price="${item.price}">
                    <div class="item-info">
                        <span class="item-name">${item.name}</span>
                        <span class="item-price">R ${item.price.toFixed(2)}</span>
                    </div>
                    <div class="quantity-selector">
                        <button type="button" class="quantity-btn" data-action="decrement" aria-label="Decrease quantity">-</button>
                        <input type="text" class="quantity-input" value="0" readonly>
                        <button type="button" class="quantity-btn" data-action="increment" aria-label="Increase quantity">+</button>
                    </div>
                </div>
            `).join('');
             itemListContainer.innerHTML += `<h4 class="item-list-subtitle">${subtitle}</h4>${addOnsHTML}`;
        }
    };
    
    const getFinalTotals = () => {
        const service = pricingData[selectedServiceKey];
        if (!service || service.requiresConsultation) return { callOutFee: 0, packageTotal: 0, addOnSubtotal: 0, finalTotal: 0, discountAmount: 0, minimumChargeApplied: false };

        const callOutFee = service.callOutFee || 0;
        
        const selectedPackage = service.packages.find(p => p.id === cart.packageId);
        const packageTotal = selectedPackage ? selectedPackage.price : 0;

        const addOnSubtotal = Object.entries(cart.addOns).reduce((acc, [itemId, quantity]) => {
            // Search all services for the add-on, as some are shared
            let itemData = null;
            for (const key in pricingData) {
                const found = pricingData[key].addOns?.find(i => i.id === itemId);
                if (found) {
                    itemData = found;
                    break;
                }
            }
            return acc + (itemData ? itemData.price * quantity : 0);
        }, 0);

        let servicesSubtotal = packageTotal + addOnSubtotal;
        
        const minimumChargeApplied = servicesSubtotal > 0 && servicesSubtotal < MINIMUM_CHARGE;
        if (minimumChargeApplied) {
            servicesSubtotal = MINIMUM_CHARGE;
        }

        let preDiscountTotal = servicesSubtotal + callOutFee;

        let discountAmount = 0;
        if (discountCheckbox.checked) {
            // Discount applies to the services subtotal, not the callout fee
            discountAmount = servicesSubtotal * DISCOUNT_RATE;
        }

        const finalTotal = preDiscountTotal - discountAmount;
        
        return { callOutFee, packageTotal, addOnSubtotal, finalTotal, discountAmount, minimumChargeApplied };
    }

    const calculateTotal = () => {
        const service = pricingData[selectedServiceKey];
        if (!service || service.requiresConsultation) {
            quoteContainer.style.display = 'none';
            return;
        }
        
        quoteContainer.style.display = 'block';

        const { callOutFee, packageTotal, addOnSubtotal, finalTotal, discountAmount, minimumChargeApplied } = getFinalTotals();
        
        document.getElementById('summary-base-fee').innerText = `R ${callOutFee.toFixed(2)}`;
        document.getElementById('summary-package-total').innerText = `R ${packageTotal.toFixed(2)}`;
        document.getElementById('summary-item-subtotal').innerText = `R ${addOnSubtotal.toFixed(2)}`;
        document.getElementById('summary-discount').innerText = `- R ${discountAmount.toFixed(2)}`;
        
        document.getElementById('summary-total-desktop').innerText = `R ${finalTotal.toFixed(2)}`;
        document.getElementById('summary-total-mobile').innerText = `R ${finalTotal.toFixed(2)}`;        
        
        document.getElementById('summary-package-line').style.display = packageTotal > 0 ? 'flex' : 'none';
        document.getElementById('summary-item-line').style.display = addOnSubtotal > 0 ? 'flex' : 'none';
        document.getElementById('summary-discount-line').style.display = discountAmount > 0 ? 'flex' : 'none';
        document.getElementById('summary-minimum-charge-line').style.display = minimumChargeApplied ? 'flex' : 'none';
        document.getElementById('minimum-charge-value').innerText = `R ${MINIMUM_CHARGE.toFixed(2)}`;
    };
    
    const renderBookingSummary = () => {
        const summaryContainer = document.getElementById('booking-summary');
        const service = pricingData[selectedServiceKey];
        if (!service) return;

        let summaryHTML = `<div class="summary-section"><h5>Booking Details</h5>`;
        summaryHTML += `<div class="summary-item"><span class="item-name">Service Area:</span><span class="item-value">${document.getElementById('service_area').options[document.getElementById('service_area').selectedIndex].text}</span></div>`;
        summaryHTML += `<div class="summary-item"><span class="item-name">Service Type:</span><span class="item-value">${service.name}</span></div>`;
        summaryHTML += `<div class="summary-item"><span class="item-name">Preferred Date:</span><span class="item-value">${document.getElementById('booking_date').value}</span></div>`;
        summaryHTML += `<div class="summary-item"><span class="item-name">Preferred Time:</span><span class="item-value">${document.getElementById('booking_time').options[document.getElementById('booking_time').selectedIndex].text}</span></div>`;
        summaryHTML += `</div>`;

        summaryHTML += `<div class="summary-section"><h5>Contact Information</h5>`;
        summaryHTML += `<div class="summary-item"><span class="item-name">Name:</span><span class="item-value">${document.getElementById('name').value}</span></div>`;
        summaryHTML += `<div class="summary-item"><span class="item-name">Email:</span><span class="item-value">${document.getElementById('email').value}</span></div>`;
        summaryHTML += `<div class="summary-item"><span class="item-name">Phone:</span><span class="item-value">${document.getElementById('phone').value}</span></div>`;
        summaryHTML += `<div class="summary-item"><span class="item-name">Address:</span><span class="item-value">${document.getElementById('address').value}</span></div>`;
        summaryHTML += `</div>`;

        if (!service.requiresConsultation) {
            const { callOutFee, packageTotal, addOnSubtotal, finalTotal, discountAmount, minimumChargeApplied } = getFinalTotals();
            summaryHTML += `<div class="summary-section"><h5>Quote Summary</h5>`;
            summaryHTML += `<div class="summary-item"><span class="item-name">Call-Out Fee:</span><span class="item-value">R ${callOutFee.toFixed(2)}</span></div>`;
            if (packageTotal > 0) {
                 summaryHTML += `<div class="summary-item"><span class="item-name">Package:</span><span class="item-value">R ${packageTotal.toFixed(2)}</span></div>`;
            }
            if (addOnSubtotal > 0) {
                 summaryHTML += `<div class="summary-item"><span class="item-name">Add-Ons:</span><span class="item-value">R ${addOnSubtotal.toFixed(2)}</span></div>`;
            }
             if (minimumChargeApplied) {
                 summaryHTML += `<div class="summary-item"><span class="item-name">Minimum Charge Applied:</span><span class="item-value">R ${MINIMUM_CHARGE.toFixed(2)}</span></div>`;
            }
            if (discountAmount > 0) {
                 summaryHTML += `<div class="summary-item discount"><span class="item-name">Contractual Discount:</span><span class="item-value">- R ${discountAmount.toFixed(2)}</span></div>`;
            }
            summaryHTML += `<div class="summary-item final-total-summary"><span class="item-name">Total Estimate:</span><span class="item-value">R ${finalTotal.toFixed(2)}</span></div>`;
            summaryHTML += `</div>`;
        }

        summaryContainer.innerHTML = summaryHTML;
    };

    // --- EVENT LISTENERS ---
    prevBtn.addEventListener('click', () => updateStep(-1));
    nextBtn.addEventListener('click', () => updateStep(1));
    serviceSelectTrigger.addEventListener('click', () => serviceSelectContainer.classList.toggle('open'));
    serviceSelectOptions.forEach(option => {
        option.addEventListener('click', () => selectService(option.dataset.service));
    });
    // Close dropdown if clicking outside
    window.addEventListener('click', (e) => {
        if (!serviceSelectContainer.contains(e.target)) serviceSelectContainer.classList.remove('open');
    });

    // Use event delegation for dynamically added items
    itemListContainer.addEventListener('click', (e) => {
        // Handle quantity buttons for add-ons
        const quantityBtn = e.target.closest('.quantity-btn');
        if (quantityBtn) {
            const row = quantityBtn.closest('.item-row');
            const itemId = row.dataset.id;
            const input = row.querySelector('.quantity-input');
            let quantity = parseInt(input.value);
            
            if (quantityBtn.dataset.action === 'increment') quantity++;
            else if (quantityBtn.dataset.action === 'decrement' && quantity > 0) quantity--;

            input.value = quantity;
            if (quantity > 0) cart.addOns[itemId] = quantity;
            else delete cart.addOns[itemId];
            
            calculateTotal();
        }
        
        // Handle package selection
        const packageRadio = e.target.closest('input[name="service_package"]');
        if(packageRadio) {
            cart.packageId = packageRadio.value;
            calculateTotal();
        }
    });

    discountCheckbox.addEventListener('change', calculateTotal);

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const resultDiv = document.getElementById('form-result');
        resultDiv.innerHTML = '<p class="success-message">Thank you! Your booking request has been submitted. We will contact you shortly to confirm.</p>';
        bookingForm.reset();
        // Here you would typically send the data to a server
        console.log('Form Submitted. Data:', { ...cart, userDetails: new FormData(bookingForm) });
        setTimeout(() => {
           window.location.reload();
        }, 4000);
    });

    // --- INITIALIZATION ---
    renderCurrentStep();
});