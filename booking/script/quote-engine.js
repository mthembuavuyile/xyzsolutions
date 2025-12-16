class QuoteApp {
    constructor() {
        this.state = {
            step: 1,
            region: null,
            activeTags: [], // Allows "Kitchen" + "Residential" at same time
            selectedServiceIds: [],
            items: {}, // { itemId: qty }
            discountActive: false,
            totals: {
                subtotal: 0,
                discount: 0,
                total: 0,
                minChargeApplied: false
            }
        };

        this.flatItemMap = new Map();
    }

    // --- INITIALIZATION ---
    init() {
        this.cacheItems();
        this.renderCategories();
        this.updateSummary();

        const refEl = document.getElementById('quote-ref');
        if (refEl) refEl.innerText = 'Q-' + Math.floor(1000 + Math.random() * 9000);
    }

    cacheItems() {
        SERVICES_MASTER.forEach(svc => {
            svc.groups.forEach(grp => {
                grp.items.forEach(itm => {
                    this.flatItemMap.set(itm.id, { ...itm,
                        serviceName: svc.name
                    });
                });
            });
        });
    }

    // --- STEP 1: CATEGORY SELECTION ---
    renderCategories() {
        const grid = document.getElementById('category-grid');
        if (!grid) return;

        grid.innerHTML = CATEGORIES.map(cat => `
            <div class="selection-card" id="cat-card-${cat.id}" onclick="app.toggleCategory('${cat.id}')">
                <div class="card-content">
                    <i class="fas ${cat.icon} card-icon"></i>
                    <span class="card-title">${cat.name}</span>
                    <span class="card-desc">${cat.desc}</span> 
                </div>
                <div class="check-mark"><i class="fas fa-check"></i></div>
            </div>
        `).join('');
    }

    toggleCategory(catId) {
        // Multi-select logic for "Ultimate Flexibility"
        const index = this.state.activeTags.indexOf(catId);
        const card = document.getElementById(`cat-card-${catId}`);

        if (index > -1) {
            this.state.activeTags.splice(index, 1);
            if (card) card.classList.remove('selected');
        } else {
            this.state.activeTags.push(catId);
            if (card) card.classList.add('selected');
        }
    }

    setRegion(region, element) {
        this.state.region = region;
        document.querySelectorAll('#step-1 .selection-card.region-card').forEach(el => el.classList.remove('selected'));
        if (element) element.classList.add('selected');
    }

    // --- STEP 2: SERVICE DISPLAY (WITH TAG FILTER) ---
    renderServices() {
        const grid = document.getElementById('service-type-grid');
        if (!grid) return;

        // Filter: Show service if it matches ANY selected tag
        const visibleServices = SERVICES_MASTER.filter(svc =>
            svc.tags.some(tag => this.state.activeTags.includes(tag))
        );

        // Render cards WITHOUT "Min Call Out" badge
        const cardsHtml = visibleServices.map(svc => {
            const isSelected = this.state.selectedServiceIds.includes(svc.id) ? 'selected' : '';
            return `
            <div class="selection-card ${isSelected}" onclick="app.toggleService('${svc.id}', this)">
                <i class="fas ${svc.icon} card-icon"></i>
                <span class="card-title">${svc.name}</span>
                <span class="card-desc">${svc.desc}</span>
                <div class="check-mark"><i class="fas fa-check"></i></div>
            </div>
        `
        }).join('');

        // Add the single Global Disclaimer at the bottom
        const disclaimerHtml = `
            <div class="global-service-notice" style="grid-column: 1 / -1; width: 100%;">
                <p class="small-text" style="text-align:center; color:#666; margin-top:20px; font-size:0.8rem; font-style:italic;">
                    ${CONFIG.DISCLAIMER_TEXT}
                </p>
            </div>
        `;

        grid.innerHTML = (cardsHtml.length > 0 ? cardsHtml : '<p>Please select a category in Step 1</p>') + disclaimerHtml;
    }

    toggleService(serviceId, element) {
        const index = this.state.selectedServiceIds.indexOf(serviceId);
        if (index > -1) {
            this.state.selectedServiceIds.splice(index, 1);
            element.classList.remove('selected');
        } else {
            this.state.selectedServiceIds.push(serviceId);
            element.classList.add('selected');
        }
    }

    // --- STEP 3: ITEM SELECTION ---
    renderItems() {
        const container = document.getElementById('items-container');
        if (!container) return;

        const activeServices = SERVICES_MASTER.filter(s => this.state.selectedServiceIds.includes(s.id));

        let html = '';
        activeServices.forEach(service => {
            html += `<div class="service-section-header"><h3><i class="fas ${service.icon}"></i> ${service.name}</h3></div>`;
            service.groups.forEach(group => {
                html += `
                <div class="item-group">
                    <div class="group-title">${group.name}</div>
                    ${group.items.map(item => `
                        <div class="item-row">
                            <div class="item-info">
                                <span class="item-name">${item.name}</span>
                                <span class="item-price">${CONFIG.CURRENCY}${item.price.toFixed(2)}</span>
                            </div>
                            <div class="item-controls">
                                <button class="qty-btn" onclick="app.updateQty('${item.id}', -1)">-</button>
                                <div class="qty-display" id="qty-${item.id}">${this.state.items[item.id] || 0}</div>
                                <button class="qty-btn" onclick="app.updateQty('${item.id}', 1)">+</button>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
            });
        });
        container.innerHTML = html;
    }

    // --- NAVIGATION ---
    nextStep() {
        if (this.state.step === 1) {
            if (!this.state.region) return alert('Please select a Region.');
            if (this.state.activeTags.length === 0) return alert('Please select at least one Category.');
            this.renderServices();
        }
        if (this.state.step === 2) {
            if (this.state.selectedServiceIds.length === 0) return alert('Please select at least one Service Type.');
            this.renderItems();
        }
        if (this.state.step === 3) {
            if (this.state.totals.total === 0) return alert('Please add items to your quote.');
        }
        if (this.state.step === 4) return this.submitQuote();

        this.state.step++;
        this.updateUI();
    }

    prevStep() {
        if (this.state.step > 1) this.state.step--;
        this.updateUI();
    }

    updateUI() {
        // 1. Handle Step Visibility
        document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
        const currentStep = document.getElementById(`step-${this.state.step}`);
        if (currentStep) currentStep.classList.add('active');

        // 2. Update Bottom Buttons
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.innerText = this.state.step === 4 ? 'Submit Quote' : 'Next Step';
            nextBtn.className = this.state.step === 4 ? 'btn btn-submit' : 'btn btn-primary';
        }

        // 3. Handle Top Back Button Visibility
        const topBackBtn = document.getElementById('topBackBtn');
        if (topBackBtn) {
            if (this.state.step > 1) {
                topBackBtn.classList.add('visible'); // Show on Step 2, 3, 4
            } else {
                topBackBtn.classList.remove('visible'); // Hide on Step 1
            }
        }

        // 4. Scroll to top
        window.scrollTo(0, 0);
    }

    // --- CALCULATIONS ---
    updateQty(itemId, delta) {
        if (!this.state.items[itemId]) this.state.items[itemId] = 0;
        this.state.items[itemId] += delta;
        if (this.state.items[itemId] < 0) this.state.items[itemId] = 0;

        const display = document.getElementById(`qty-${itemId}`);
        if (display) display.innerText = this.state.items[itemId];

        this.calculateTotals();
    }

    toggleDiscount() {
        const chk = document.getElementById('contract-discount');
        this.state.discountActive = chk ? chk.checked : false;
        this.calculateTotals();
    }

    calculateTotals() {
        let subtotal = 0;
        Object.keys(this.state.items).forEach(itemId => {
            const qty = this.state.items[itemId];
            if (qty > 0) {
                const itemDef = this.flatItemMap.get(itemId);
                if (itemDef) subtotal += (itemDef.price * qty);
            }
        });

        let gross = subtotal;
        let discountAmount = 0;

        if (this.state.discountActive) {
            discountAmount = gross * CONFIG.DISCOUNT_RATE;
            gross -= discountAmount;
        }

        // MINIMUM CHARGE LOGIC (Floor)
        // If total > 0 but less than 950, set to 950.
        const minChargeApplied = gross > 0 && gross < CONFIG.BASE_MIN_CHARGE;
        if (minChargeApplied) {
            gross = CONFIG.BASE_MIN_CHARGE;
        }

        this.state.totals = {
            subtotal,
            discount: discountAmount,
            total: gross,
            minChargeApplied
        };
        this.updateSummary();
    }

    updateSummary() {
        const list = document.getElementById('summary-list');
        const totalDisp = document.getElementById('total-display');
        const mobileTotal = document.getElementById('mobile-total');
        const notice = document.getElementById('min-charge-notice');

        if (!list) return;

        let html = '';
        Object.keys(this.state.items).forEach(itemId => {
            const qty = this.state.items[itemId];
            if (qty > 0) {
                const def = this.flatItemMap.get(itemId);
                html += `
                <div class="summary-item" style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span>${def.name} x${qty}</span>
                    <span>${CONFIG.CURRENCY}${(def.price * qty).toFixed(2)}</span>
                </div>`;
            }
        });

        totalDisp.innerText = `${CONFIG.CURRENCY}${this.state.totals.total.toFixed(2)}`;
        if (mobileTotal) {
            mobileTotal.innerText = `${CONFIG.CURRENCY}${this.state.totals.total.toFixed(2)}`;
        }

        if (this.state.totals.discount > 0) {
            html += `<div style="color:green; display:flex; justify-content:space-between;"><span>Discount (25%)</span><span>-${CONFIG.CURRENCY}${this.state.totals.discount.toFixed(2)}</span></div>`;
        }

        list.innerHTML = html || '<p style="color:#999; text-align:center">No items added</p>';
        totalDisp.innerText = `${CONFIG.CURRENCY}${this.state.totals.total.toFixed(2)}`;

        if (notice) {
            if (this.state.totals.minChargeApplied) {
                notice.style.display = 'block';
                notice.innerHTML = `<i class="fas fa-exclamation-circle"></i> Minimum Call Out Charge of ${CONFIG.CURRENCY}${CONFIG.BASE_MIN_CHARGE} applied.`;
            } else {
                notice.style.display = 'none';
            }
        }
    }

    // --- SUBMISSION ---
    async submitQuote() {
        const btn = document.getElementById('nextBtn');
        const originalText = btn.innerText;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const phone = document.getElementById('contact-phone').value;
        const addr = document.getElementById('property-address').value;
        const date = document.getElementById('booking-date').value;
        const notes = document.getElementById('special-req') ? document.getElementById('special-req').value : '';
        const ref = document.getElementById('quote-ref') ? document.getElementById('quote-ref').innerText : 'REF';

        if (!name || !email || !phone || !addr) {
            alert("Please fill in all required contact fields.");
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        // Generate Item List HTML for Email
        let itemsHtml = "<ul>";
        Object.keys(this.state.items).forEach(itemId => {
            const qty = this.state.items[itemId];
            if (qty > 0) {
                const itemDef = this.flatItemMap.get(itemId);
                if (itemDef) {
                    const lineTotal = itemDef.price * qty;
                    itemsHtml += `<li>[${itemDef.serviceName}] ${itemDef.name} (x${qty}) - ${CONFIG.CURRENCY}${lineTotal.toFixed(2)}</li>`;
                }
            }
        });
        itemsHtml += "</ul>";

        const formData = {
            access_key: CONFIG.WEB3_KEY,
            subject: `New Quote: ${ref} from ${name}`,
            from_name: "Quote Engine",

            // Customer Info
            reference_number: ref,
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            property_address: addr,
            preferred_date: date,
            special_notes: notes,

            // Quote Data
            region: this.state.region,
            service_tags: this.state.activeTags.join(', '),

            // Financials
            subtotal: `${CONFIG.CURRENCY}${this.state.totals.subtotal.toFixed(2)}`,
            discount_amount: `${CONFIG.CURRENCY}${this.state.totals.discount.toFixed(2)}`,
            min_charge_applied: this.state.totals.minChargeApplied ? "Yes" : "No",
            ESTIMATED_TOTAL: `${CONFIG.CURRENCY}${this.state.totals.total.toFixed(2)}`,

            // Breakdown
            selected_items: itemsHtml
        };

        try {
            await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify(formData)
            });
            alert(`Success! Quote ${ref} has been sent.`);
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Error sending quote. Please check your internet connection.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}