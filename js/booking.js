document.addEventListener('DOMContentLoaded', () => {

    // --- DATA STORE ---
    const pricingData = {
        // ... (your existing pricingData object remains unchanged)
        regular_domestic: {
            name: 'Regular Domestic Cleaning',
            items: [
                { id: 'bedrooms', name: 'Number of Bedrooms', price: 250.00 },
                { id: 'bathrooms', name: 'Number of Bathrooms', price: 175.00 },
                { id: 'addon_laundry', name: 'Laundry & Ironing (per load)', price: 150.00 },
                { id: 'addon_fridge', name: 'Interior Fridge Clean', price: 120.00 },
            ]
        },
        deep_clean: {
            name: 'End-of-Lease / Deep Clean',
            items: [
                { id: 'base_1_bed', name: '1 Bedroom Property', price: 1250.00 },
                { id: 'base_2_bed', name: '2 Bedroom Property', price: 1650.00 },
                { id: 'base_3_bed', name: '3+ Bedroom Property', price: 2100.00 },
                { id: 'addon_oven', name: 'Deep Oven Clean', price: 250.00 },
                { id: 'addon_int_windows', name: 'Interior Windows & Tracks', price: 200.00 },
                { id: 'addon_carpet_steam', name: 'Carpet Steam Cleaning (per room)', price: 300.00 },
            ]
        },
        airbnb: {
            name: 'Airbnb & Holiday Rentals',
            items: [
                { id: 'turnover_studio', name: 'Studio Turnover', price: 550.00 },
                { id: 'turnover_1_bed', name: '1-2 Bedroom Turnover', price: 750.00 },
                { id: 'turnover_3_bed', name: '3+ Bedroom Turnover', price: 950.00 },
                { id: 'linen_service', name: 'Linen & Towel Service (per bed)', price: 150.00 },
            ]
        },
        commercial: {
            name: 'Commercial & Office Cleaning',
            requiresConsultation: true,
            message: 'A pristine workspace requires a custom plan. Please proceed to the next step to enter your details, and our team will contact you for a free, no-obligation consultation.'
        },
        post_construction: {
            name: 'Post-Construction Cleaning',
            requiresConsultation: true,
            message: 'Construction clean-ups are highly specialized. To give you an accurate quote, we need to assess the site. Please enter your details, and we will be in touch to arrange a consultation.'
        },
        event_cleanup: {
            name: 'Event Clean-ups',
            requiresConsultation: true,
            message: 'From parties to corporate functions, we handle it all. Please provide your details, and we will contact you to discuss the scope and requirements for your event.'
        },
        complex_common: {
            name: 'Complex & Common Areas',
            requiresConsultation: true,
            message: 'Maintaining shared spaces requires a consistent schedule. Please enter your details to request a consultation and a tailored maintenance proposal for your property.'
        }
    };
    const MINIMUM_CHARGE = 950.00;
    const DISCOUNT_RATE = 0.25;

    // --- STATE MANAGEMENT ---
    let currentStep = 1;
    let selectedServiceKey = null;
    const cart = {};

    // --- DOM ELEMENT CACHING ---
    const bookingForm = document.getElementById('booking-form');
    const formSteps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-bar .step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    // REMOVED: const serviceSelectionBtns = document.querySelectorAll('.service-card-select');
    // NEW: Custom select elements
    const serviceSelectContainer = document.getElementById('service-select-container');
    const serviceSelectTrigger = serviceSelectContainer.querySelector('.custom-select-trigger');
    const serviceSelectOptions = serviceSelectContainer.querySelectorAll('.custom-select-option');
    const selectedServiceText = document.getElementById('selected-service-text');
    const hiddenServiceInput = document.getElementById('service_type');

    const itemListContainer = document.getElementById('item-list');
    const quoteFloater = document.getElementById('quote-summary-floater');
    const discountCheckbox = document.getElementById('contractual_discount');
    const allSelects = document.querySelectorAll('select'); // Native selects

    // --- FLOATING SELECT LABELS HANDLER ---
    const handleSelectChange = (selectElement) => {
        selectElement.classList.toggle('has-value', !!selectElement.value);
    };
    allSelects.forEach(select => {
        handleSelectChange(select);
        select.addEventListener('change', (event) => handleSelectChange(event.target));
    });

    // --- CORE FUNCTIONS ---

    const renderCurrentStep = () => {
        // ... (this function remains unchanged)
        formSteps.forEach(step => step.classList.remove('active'));
        document.getElementById(`form-step-${currentStep}`)?.classList.add('active');
        
        progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            if (stepNum < currentStep) step.classList.add('completed');
            else if (stepNum === currentStep) step.classList.add('active');
        });

        prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
        nextBtn.style.display = currentStep < 4 ? 'inline-block' : 'none';
        submitBtn.style.display = currentStep === 4 ? 'inline-block' : 'none';
        
        const service = pricingData[selectedServiceKey];
        const showFloater = currentStep >= 2 && service && !service.requiresConsultation && Object.keys(cart).length > 0;
        quoteFloater.style.display = showFloater ? 'block' : 'none';
        
        if (currentStep === 4) renderBookingSummary();
    };

    const updateStep = (increment) => {
        if (increment > 0) {
            if (currentStep === 1) {
                // MODIFIED: Validation now checks the hidden input
                const area = document.getElementById('service_area').value;
                if (!hiddenServiceInput.value || !area) {
                    alert('Please select a service area and a service type to continue.');
                    return;
                }
            }
            if (currentStep === 2) {
                // ... (rest of the function is unchanged)
                const service = pricingData[selectedServiceKey];
                if (!service.requiresConsultation && Object.keys(cart).length === 0) {
                    alert('Please add at least one item to your quote.');
                    return;
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
        renderCurrentStep();
    };
    
    const selectService = (serviceKey) => {
        selectedServiceKey = serviceKey;
        Object.keys(cart).forEach(key => delete cart[key]);
        
        // NEW: Update the custom dropdown's display
        const selectedOption = document.querySelector(`.custom-select-option[data-service="${serviceKey}"]`);
        selectedServiceText.innerText = selectedOption.querySelector('span').innerText;
        hiddenServiceInput.value = serviceKey;
        serviceSelectContainer.classList.add('has-value'); // For floating label
        serviceSelectContainer.classList.remove('open'); // Close dropdown

        populateItemList();
        calculateTotal();
    };
    
    // ... (populateItemList, updateQuantity, calculateTotal, renderBookingSummary, getFinalTotals functions remain unchanged)
    const populateItemList = () => {
        const service = pricingData[selectedServiceKey];
        if (!service) return;

        document.getElementById('quote-builder-title').innerText = service.requiresConsultation ? 'Consultation Request' : `Build Your ${service.name} Quote`;
        itemListContainer.innerHTML = '';

        if (service.requiresConsultation) {
            itemListContainer.innerHTML = `<p class="consultation-message">${service.message}</p>`;
        } else {
            service.items.forEach(item => {
                const itemHTML = `
                    <div class="item-row" data-id="${item.id}">
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-price">R${item.price.toFixed(2)} per item</span>
                        </div>
                        <div class="quantity-selector">
                            <button type="button" class="quantity-btn" data-action="decrement" aria-label="Decrease quantity">-</button>
                            <input type="text" class="quantity-input" value="0" readonly>
                            <button type="button" class="quantity-btn" data-action="increment" aria-label="Increase quantity">+</button>
                        </div>
                        <div class="item-total">R0.00</div>
                    </div>`;
                itemListContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        }
    };

    const updateQuantity = (itemId, action) => {
        const row = document.querySelector(`.item-row[data-id="${itemId}"]`);
        const input = row?.querySelector('.quantity-input');
        if (!input) return;

        let quantity = parseInt(input.value);
        if (action === 'increment') quantity++;
        else if (action === 'decrement' && quantity > 0) quantity--;
        
        input.value = quantity;
        cart[itemId] = quantity;
        if (quantity === 0) delete cart[itemId];
        
        calculateTotal();
    };

    const calculateTotal = () => {
        const service = pricingData[selectedServiceKey];
        if (!service || service.requiresConsultation) {
            quoteFloater.style.display = 'none';
            return;
        }

        const { subtotal, total, discountAmount, feeApplied } = getFinalTotals();

        document.querySelectorAll('.item-row').forEach(row => {
            const itemId = row.dataset.id;
            const itemData = service.items.find(i => i.id === itemId);
            const quantity = cart[itemId] || 0;
            const itemTotal = itemData ? itemData.price * quantity : 0;
            row.querySelector('.item-total').innerText = `R${itemTotal.toFixed(2)}`;
        });
        
        document.getElementById('summary-fee-line').style.display = feeApplied ? 'flex' : 'none';
        document.getElementById('summary-discount-line').style.display = discountCheckbox.checked ? 'flex' : 'none';

        document.getElementById('summary-subtotal').innerText = `R${subtotal.toFixed(2)}`;
        document.getElementById('summary-discount').innerText = `- R${discountAmount.toFixed(2)}`;
        document.getElementById('summary-total').innerText = `R${total.toFixed(2)}`;

        quoteFloater.style.display = currentStep >= 2 && Object.keys(cart).length > 0 ? 'block' : 'none';
    };
    
    const renderBookingSummary = () => {
        const summaryContainer = document.getElementById('booking-summary');
        const service = pricingData[selectedServiceKey];
        if (!service) return;

        const details = {
            "Service Area": document.getElementById('service_area').selectedOptions[0].text,
            "Service Type": service.name,
            "Name": document.getElementById('name').value,
            "Email": document.getElementById('email').value,
            "Phone": document.getElementById('phone').value,
            "Address": document.getElementById('address').value,
            "Preferred Date": document.getElementById('booking_date').value,
            "Preferred Time": document.getElementById('booking_time').selectedOptions[0].text,
        };
        const detailsHTML = Object.entries(details).map(([key, value]) => 
            `<div class="summary-item"><span class="item-name"><strong>${key}</strong></span><span class="item-value">${value || ''}</span></div>`
        ).join('');

        let quoteHTML = '';
        if (service.requiresConsultation) {
            quoteHTML = `<p class="summary-notice">You have requested a consultation for ${service.name}. Our team will contact you shortly to discuss your requirements and provide a detailed quote.</p>`;
        } else {
            const { subtotal, total, discountAmount, feeApplied } = getFinalTotals();
            const itemsHTML = Object.entries(cart).map(([itemId, quantity]) => {
                const itemData = service.items.find(i => i.id === itemId);
                return `<div class="summary-item"><span class="item-name">${quantity} x ${itemData.name}</span><span class="item-value">R${(quantity * itemData.price).toFixed(2)}</span></div>`;
            }).join('');
            
            quoteHTML = `
                <h5>Quote Details</h5>
                ${itemsHTML}
                <hr style="margin: 1rem 0; border-color: #eee;">
                <div class="summary-item"><span class="item-name">Subtotal</span><span class="item-value">R${subtotal.toFixed(2)}</span></div>
                ${feeApplied ? `<div class="summary-item"><span class="item-name">Minimum Charge Applied</span><span class="item-value">R${MINIMUM_CHARGE.toFixed(2)}</span></div>` : ''}
                ${discountAmount > 0 ? `<div class="summary-item"><span class="item-name">Contractual Discount (25%)</span><span class="item-value">- R${discountAmount.toFixed(2)}</span></div>` : ''}
                <div class="summary-item final-total-summary"><span class="item-name">Final Estimated Total</span><span class="item-value">R${total.toFixed(2)}</span></div>`;
        }

        summaryContainer.innerHTML = `
            <div class="summary-section"><h5>Your Details</h5>${detailsHTML}</div>
            <div class="summary-section">${quoteHTML}</div>`;
    };
    
    function getFinalTotals() {
        const service = pricingData[selectedServiceKey];
        if (!service || service.requiresConsultation) return { subtotal: 0, total: 0, discountAmount: 0, feeApplied: false };

        let subtotal = Object.entries(cart).reduce((acc, [itemId, quantity]) => {
            const itemData = service.items.find(i => i.id === itemId);
            return acc + (itemData ? itemData.price * quantity : 0);
        }, 0);

        let total = subtotal;
        const feeApplied = subtotal > 0 && subtotal < MINIMUM_CHARGE;
        if (feeApplied) total = MINIMUM_CHARGE;

        let discountAmount = 0;
        if (discountCheckbox.checked) {
            discountAmount = total * DISCOUNT_RATE;
            total -= discountAmount;
        }
        return { subtotal, total, discountAmount, feeApplied };
    }


    // --- EVENT LISTENERS ---
    prevBtn.addEventListener('click', () => updateStep(-1));
    nextBtn.addEventListener('click', () => updateStep(1));
    
    // REMOVED: Old button listeners
    // serviceSelectionBtns.forEach(btn => btn.addEventListener('click', () => selectService(btn.dataset.service)));
    
    // NEW: Listeners for the custom dropdown
    serviceSelectTrigger.addEventListener('click', () => {
        serviceSelectContainer.classList.toggle('open');
    });

    serviceSelectOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectService(option.dataset.service);
        });
    });

    // Close dropdown if user clicks outside of it
    window.addEventListener('click', (e) => {
        if (!serviceSelectContainer.contains(e.target)) {
            serviceSelectContainer.classList.remove('open');
        }
    });

    itemListContainer.addEventListener('click', (e) => {
        // ... (this listener remains unchanged)
        const target = e.target.closest('.quantity-btn');
        if (target) {
            const row = target.closest('.item-row');
            updateQuantity(row.dataset.id, target.dataset.action);
        }
    });
    
    discountCheckbox.addEventListener('change', calculateTotal);
    
    bookingForm.addEventListener('submit', (e) => {
        // ... (this listener remains unchanged)
        e.preventDefault();
        const formResult = document.getElementById('form-result');
        formResult.style.display = 'block';
        formResult.className = 'success';
        formResult.innerText = 'Thank you! Your booking request has been sent. We will contact you shortly to confirm.';
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sent!✅';
        prevBtn.style.display = 'none';
    });

    // --- INITIALIZATION ---
    renderCurrentStep();
});