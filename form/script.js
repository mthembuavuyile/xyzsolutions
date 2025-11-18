document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PRICING DATABASE ---
    // We map the requested "Residential" long names to internal IDs
    // For Corporate/Hospitality, we force a "Consultation" mode.
    const pricingData = {
        // Mapped Residential Services
        'res_carpet': {
            name: 'Carpet, Upholstery & Leather',
            callOutFee: 500.00,
            packages: [], 
            addons: [
                { id: 'cpt_room', name: 'Carpet (Per Room)', price: 350.00 },
                { id: 'uph_couch', name: 'Couch (Per Seat)', price: 120.00 },
                { id: 'lea_clean', name: 'Leather Treatment', price: 200.00 }
            ]
        },
        'res_curtain': {
            name: 'Curtain & Blind Cleaning',
            callOutFee: 700.00,
            packages: [],
            addons: [
                { id: 'cur_set', name: 'Curtains (Per Rail)', price: 450.00 },
                { id: 'bln_set', name: 'Blinds (Per Window)', price: 150.00 }
            ]
        },
        'res_tile': {
            name: 'Tile & Grout Cleaning',
            callOutFee: 450.00,
            packages: [{ id: 'tile_std', name: 'Standard Area (<30sqm)', price: 850.00, desc: 'Deep scrub and grout seal' }],
            addons: [{ id: 'tile_sqm', name: 'Extra sqm', price: 25.00 }]
        },
        'res_solar': {
            name: 'Window & Solar Panel',
            callOutFee: 550.00,
            packages: [],
            addons: [
                { id: 'win_std', name: 'Window (Standard)', price: 50.00 },
                { id: 'sol_pan', name: 'Solar Panel (Each)', price: 80.00 },
                { id: 'hgh_reach', name: 'Multi-storey Surcharge', price: 300.00 }
            ]
        },
        'res_oven': {
            name: 'Oven & BBQ Cleaning',
            callOutFee: 250.00,
            packages: [],
            addons: [
                { id: 'ovn_sgl', name: 'Single Oven', price: 450.00 },
                { id: 'ovn_dbl', name: 'Double Oven', price: 750.00 },
                { id: 'bbq_gas', name: 'Gas Braai/BBQ', price: 550.00 },
                { id: 'ext_fan', name: 'Extractor Fan', price: 250.00 }
            ]
        },
        // General Fallback for complex combinations
        'res_combo': {
            name: 'Full House Combo',
            callOutFee: 350.00,
            packages: [{ id: 'com_full', name: 'Full Day Team', price: 2500.00, desc: '8 Hours, 3 Cleaners, Equipment' }],
            addons: []
        },
        // Commercial / Other
        'consultation': {
            name: 'Commercial / Hospitality',
            requiresConsultation: true,
            message: "For Corporate, Industrial, and Hospitality services, we require a site visit to provide an accurate tailored quote."
        }
    };

    const residentialOptions = [
        { label: "Carpet, Upholstery and/or Leather Cleaning", id: "res_carpet" },
        { label: "Carpet, Upholstery, Leather, Curtain and/or Blind Cleaning", id: "res_curtain" }, // Mapping logic simplified for demo
        { label: "Carpet, Upholstery, Leather and/or Tile Cleaning", id: "res_tile" },
        { label: "Carpet, Upholstery, Leather, Tile, Solar Panel &/or Window Cleaning", id: "res_combo" },
        { label: "Window and/or Solar Panel Cleaning (Includes Multi-storey)", id: "res_solar" },
        { label: "Oven, Hob, Extractor, Range, and BBQ/Braai Cleaning", id: "res_oven" }
    ];

    const MINIMUM_CHARGE = 950.00;
    const DISCOUNT_RATE = 0.25;

    // --- STATE ---
    let state = {
        step: 1,
        region: '',
        serviceId: '',
        packageId: null,
        addons: {},
        isContract: false
    };

    // --- DOM ELEMENTS ---
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.step');
    
    // Step 1 Elements
    const regionSelect = document.getElementById('regionSelect');
    const categorySelect = document.getElementById('serviceCategorySelect');
    const specificSelect = document.getElementById('specificServiceSelect');
    const categoryWrapper = document.getElementById('serviceTypeWrapper');
    const specificWrapper = document.getElementById('specificServiceWrapper');
    const categoryHelper = document.getElementById('categoryHelper');

    // Sidebar & Summary Elements
    const sbCallout = document.getElementById('sb-callout');
    const sbPackage = document.getElementById('sb-package');
    const sbAddons = document.getElementById('sb-addons');
    const sbDiscountRow = document.getElementById('sb-discount-row');
    const sbDiscount = document.getElementById('sb-discount');
    const sbTotal = document.getElementById('sb-total');
    const sbWarning = document.getElementById('sb-min-warning');
    const mfTotal = document.getElementById('mf-total');

    // --- STEP 1 LOGIC: CASCADING DROPDOWNS ---

    // 1. Region Selected -> Show Category
    regionSelect.addEventListener('change', (e) => {
        state.region = e.target.value;
        regionSelect.classList.add('active-selection'); // Green border persistence
        categoryWrapper.classList.remove('hidden');
    });

    // 2. Category Selected -> Logic
    categorySelect.addEventListener('change', (e) => {
        const category = e.target.value;
        categorySelect.classList.add('active-selection');
        
        // Reset Child
        specificSelect.innerHTML = '<option value="" disabled selected>Select Service</option>';
        state.serviceId = '';

        if (category === 'residential') {
            // Show Residential List
            specificWrapper.classList.remove('hidden');
            categoryHelper.innerText = "";
            
            // Populate Options
            residentialOptions.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.id;
                option.innerText = opt.label;
                specificSelect.appendChild(option);
            });
        } else {
            // Corporate / Hospitality
            specificWrapper.classList.add('hidden');
            categoryHelper.innerText = "Offices, Hotels, Warehousing, etc.";
            state.serviceId = 'consultation'; // Direct mapping
        }
    });

    // 3. Specific Service Selected
    specificSelect.addEventListener('change', (e) => {
        state.serviceId = e.target.value;
        specificSelect.classList.add('active-selection');
    });

    // --- NAVIGATION LOGIC ---

    window.nextStep = function() {
        if (!validateStep(state.step)) return;

        if (state.step === 1) {
            prepareStep2();
        }
        if (state.step === 2) {
            calculateTotals();
        }
        if (state.step === 3) {
            renderSummary();
        }

        state.step++;
        updateUI();
    };

    window.prevStep = function() {
        state.step--;
        updateUI();
    };

    function updateUI() {
        // Show/Hide Steps
        steps.forEach(s => s.classList.remove('active'));
        document.getElementById(`step-${state.step}`).classList.add('active');

        // Update Progress Bar
        progressSteps.forEach((s, index) => {
            const stepNum = index + 1;
            s.classList.remove('active', 'completed');
            if (stepNum === state.step) s.classList.add('active');
            if (stepNum < state.step) s.classList.add('completed');
        });

        // Sidebar Visibility
        const service = pricingData[state.serviceId];
        const showSidebar = state.step > 1 && service && !service.requiresConsultation;
        document.getElementById('sidebar').style.display = showSidebar ? 'block' : 'none';
        document.getElementById('mobile-footer').style.display = (showSidebar && window.innerWidth <= 900) ? 'flex' : 'none';
        
        window.scrollTo(0, 0);
    }

    function validateStep(step) {
        if (step === 1) {
            if (!state.region) { alert('Please select a region.'); return false; }
            if (!categorySelect.value) { alert('Please select a service type.'); return false; }
            // If residential, must pick sub-service
            if (categorySelect.value === 'residential' && !state.serviceId) {
                alert('Please select a specific service.'); return false;
            }
        }
        if (step === 2) {
            const service = pricingData[state.serviceId];
            if (service && !service.requiresConsultation) {
                if (service.packages.length > 0 && !state.packageId) {
                    alert('Please select a package.'); return false;
                }
                if (service.packages.length === 0 && Object.keys(state.addons).length === 0) {
                    alert('Please add at least one item.'); return false;
                }
            }
        }
        if (step === 3) {
            const reqFields = ['userName', 'userEmail', 'userPhone', 'userAddress', 'serviceDate'];
            let isValid = true;
            reqFields.forEach(id => {
                const el = document.getElementById(id);
                if (!el.value.trim()) {
                    el.style.borderColor = 'red';
                    isValid = false;
                } else {
                    el.style.borderColor = '#e2e8f0';
                }
            });
            if (!isValid) alert('Please fill in all required details.');
            return isValid;
        }
        return true;
    }

    // --- STEP 2 BUILDER (Modified for new IDs) ---

    function prepareStep2() {
        const service = pricingData[state.serviceId];
        const optionsContainer = document.getElementById('dynamic-options-container');
        optionsContainer.innerHTML = '';
        
        // Reset Cart
        state.addons = {};
        state.packageId = null;

        // Fake Loader
        const loader = document.getElementById('loader');
        loader.style.display = 'block';
        optionsContainer.style.display = 'none';

        setTimeout(() => {
            loader.style.display = 'none';
            optionsContainer.style.display = 'block';
            
            if (service.requiresConsultation) {
                optionsContainer.innerHTML = `<div class="warning-msg" style="background:#e0f2fe; color:#0369a1;">${service.message}</div>`;
                return;
            }

            // Render Packages
            if (service.packages.length > 0) {
                const pkgGroup = document.createElement('div');
                pkgGroup.innerHTML = '<h4>Choose Package</h4>';
                service.packages.forEach(pkg => {
                    const div = document.createElement('div');
                    div.className = 'package-item';
                    div.innerHTML = `
                        <div class="item-details"><h4>${pkg.name}</h4><p>${pkg.desc}</p></div>
                        <div class="item-action">
                            <input type="radio" name="pkgGroup" value="${pkg.id}" onchange="selectPackage('${pkg.id}')">
                            <strong>R ${pkg.price}</strong>
                        </div>
                    `;
                    pkgGroup.appendChild(div);
                });
                optionsContainer.appendChild(pkgGroup);
            }

            // Render Addons
            if (service.addons.length > 0) {
                const addGroup = document.createElement('div');
                addGroup.style.marginTop = '20px';
                addGroup.innerHTML = '<h4>Add Items</h4>';
                service.addons.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'addon-item';
                    div.innerHTML = `
                        <div class="item-details"><h4>${item.name}</h4><p>+ R ${item.price}</p></div>
                        <div class="qty-control">
                            <button type="button" class="qty-btn" onclick="updateAddon('${item.id}', -1)">-</button>
                            <span class="qty-val" id="qty-${item.id}">0</span>
                            <button type="button" class="qty-btn" onclick="updateAddon('${item.id}', 1)">+</button>
                        </div>
                    `;
                    addGroup.appendChild(div);
                });
                optionsContainer.appendChild(addGroup);
            }
            
            calculateTotals();
        }, 500);
    }

    window.selectPackage = function(pkgId) {
        state.packageId = pkgId;
        calculateTotals();
    };

    window.updateAddon = function(itemId, change) {
        const current = state.addons[itemId] || 0;
        const newVal = current + change;
        if (newVal < 0) return;
        if (newVal === 0) delete state.addons[itemId];
        else state.addons[itemId] = newVal;
        document.getElementById(`qty-${itemId}`).innerText = newVal;
        calculateTotals();
    };

    // --- CALCULATION ENGINE ---

    function calculateTotals() {
        const service = pricingData[state.serviceId];
        if (!service || service.requiresConsultation) return 0;

        let callOut = service.callOutFee;
        let pkgPrice = 0;
        if (state.packageId) {
            const pkg = service.packages.find(p => p.id === state.packageId);
            pkgPrice = pkg ? pkg.price : 0;
        }

        let addonTotal = 0;
        Object.entries(state.addons).forEach(([id, qty]) => {
            const item = service.addons.find(a => a.id === id);
            if (item) addonTotal += (item.price * qty);
        });

        let serviceSubtotal = pkgPrice + addonTotal;
        let minApplied = false;
        
        // Apply Minimum Charge
        if (serviceSubtotal > 0 && serviceSubtotal < MINIMUM_CHARGE) {
            serviceSubtotal = MINIMUM_CHARGE;
            minApplied = true;
        }

        let runningTotal = serviceSubtotal + callOut;

        // Discount
        let discountAmt = 0;
        if (document.getElementById('contractDiscount').checked) {
            discountAmt = runningTotal * DISCOUNT_RATE;
        }

        let finalTotal = runningTotal - discountAmt;

        // Update HTML
        sbCallout.innerText = `R ${callOut.toFixed(2)}`;
        sbPackage.innerText = `R ${pkgPrice.toFixed(2)}`;
        sbAddons.innerText = `R ${addonTotal.toFixed(2)}`;
        sbTotal.innerText = `R ${finalTotal.toFixed(2)}`;
        mfTotal.innerText = `R ${finalTotal.toFixed(2)}`;

        if (discountAmt > 0) {
            sbDiscountRow.classList.remove('hidden');
            sbDiscount.innerText = `- R ${discountAmt.toFixed(2)}`;
        } else {
            sbDiscountRow.classList.add('hidden');
        }

        if (minApplied) sbWarning.classList.remove('hidden');
        else sbWarning.classList.add('hidden');
        
        return finalTotal;
    }

    document.getElementById('contractDiscount').addEventListener('change', calculateTotals);

    // --- SUMMARY RENDER ---
    function renderSummary() {
        const container = document.getElementById('final-summary-content');
        const service = pricingData[state.serviceId];
        
        let html = `<div class="review-group"><h4>Details</h4>`;
        html += `<div class="review-item"><span>Name</span><span>${document.getElementById('userName').value}</span></div>`;
        html += `<div class="review-item"><span>Region</span><span>${document.getElementById('regionSelect').options[document.getElementById('regionSelect').selectedIndex].text}</span></div>`;
        html += `</div>`;

        if (service.requiresConsultation) {
            html += `<p><strong>Consultation Request:</strong> ${service.name}</p>`;
        } else {
            const finalPrice = calculateTotals();
            html += `<div class="review-group"><h4>Service: ${service.name}</h4>`;
            if(state.packageId) html += `<div class="review-item"><span>Base Package</span><span>Selected</span></div>`;
            Object.keys(state.addons).forEach(k => {
                html += `<div class="review-item"><span>Extra Item</span><span>x ${state.addons[k]}</span></div>`;
            });
            html += `</div>`;
            html += `<div class="review-group" style="border:none; margin-top:10px;">
                        <div class="review-item" style="font-size:1.2rem; color:var(--accent);">
                            <span>Total</span><span>R ${finalPrice.toFixed(2)}</span>
                        </div>
                     </div>`;
        }
        container.innerHTML = html;
    }

    document.getElementById('bookingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Booking Request Sent! We will contact you shortly.');
        location.reload();
    });
});
