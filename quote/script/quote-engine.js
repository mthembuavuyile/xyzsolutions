/**
 * --------------------------------------------------------------------------
 * FILE 2: APPLICATION LOGIC (quote-engine.js)
 * The Engine: Handles state, calculations, and DOM manipulation.
 * --------------------------------------------------------------------------
 */
class QuoteApp {
    constructor() {
        this.state = {
            step: 1,
            region: null,
            category: null,
            serviceId: null,
            items: {}, // { itemId: quantity }
            discountActive: false,
            totals: {
                subtotal: 0,
                callOut: 0,
                discount: 0,
                total: 0
            }
        };
    }

    init() {
        this.renderCategories();
        this.updateSummary();
        // Generate random reference
        const refEl = document.getElementById('quote-ref');
        if(refEl) refEl.innerText = 'Q-' + Math.floor(1000 + Math.random() * 9000);
    }

    // --- NAVIGATION ---
    
    setRegion(region, element) {
        this.state.region = region;
        document.querySelectorAll('#step-1 .selection-card').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    }

    setCategory(catId, element) {
        this.state.category = catId;
        document.querySelectorAll('#category-grid .selection-card').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        this.renderServices(catId);
    }

    setService(serviceId, element) {
        this.state.serviceId = serviceId;
        document.querySelectorAll('#service-type-grid .selection-card').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        this.renderItems(serviceId);
    }

    nextStep() {
        // Validation
        if (this.state.step === 1) {
            if (!this.state.region) return alert('Please select a Region.');
            if (!this.state.category) return alert('Please select a Category.');
        }
        if (this.state.step === 2) {
            if (!this.state.serviceId) return alert('Please select a Service Type.');
        }
        if (this.state.step === 3) {
            if (this.state.totals.total === 0) return alert('Please add items to your quote.');
        }
        if (this.state.step === 4) {
            return this.submitQuote();
        }

        this.state.step++;
        this.updateUI();
    }

    prevStep() {
        if (this.state.step > 1) this.state.step--;
        this.updateUI();
    }

    updateUI() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
        // Show current
        const currentStep = document.getElementById(`step-${this.state.step}`);
        if(currentStep) currentStep.classList.add('active');
        
        // Update Progress
        for(let i=1; i<=4; i++) {
            const el = document.getElementById(`indicator-${i}`);
            if(el) {
                el.classList.remove('active', 'completed');
                if (i < this.state.step) el.classList.add('completed');
                if (i === this.state.step) el.classList.add('active');
            }
        }

        // Button Logic
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if(prevBtn) prevBtn.style.display = this.state.step === 1 ? 'none' : 'block';
        
        if(nextBtn) {
            nextBtn.innerText = this.state.step === 4 ? 'Submit Quote' : 'Next Step';
            nextBtn.classList.toggle('btn-submit', this.state.step === 4);
            nextBtn.classList.toggle('btn-primary', this.state.step !== 4);
        }
        
        // Mobile button text
        const mobileBtn = document.getElementById('mobile-next-btn');
        if(mobileBtn) mobileBtn.innerText = this.state.step === 4 ? 'Submit' : 'Next';
        
        window.scrollTo(0,0);
    }

    // --- RENDERERS ---

    renderCategories() {
        const grid = document.getElementById('category-grid');
        if(!grid) return;
        grid.innerHTML = PRICING_DB.categories.map(cat => `
            <div class="selection-card" onclick="app.setCategory('${cat.id}', this)">
                <i class="fas ${cat.icon} card-icon"></i>
                <span class="card-title">${cat.name}</span>
                <span class="card-desc">${cat.desc}</span>
            </div>
        `).join('');
    }

    renderServices(catId) {
        const grid = document.getElementById('service-type-grid');
        if(!grid) return;
        const services = PRICING_DB.services[catId] || [];
        
        grid.innerHTML = services.map(svc => `
            <div class="selection-card" onclick="app.setService('${svc.id}', this)">
                <i class="fas ${svc.icon} card-icon"></i>
                <span class="card-title">${svc.name}</span>
                <div class="tag tag-blue" style="margin:5px 0">Min: R${svc.minCharge}</div>
                <span class="card-desc">${svc.desc}</span>
            </div>
        `).join('');
    }

    renderItems(serviceId) {
        // Find service in DB (iterate categories)
        let serviceData = null;
        Object.values(PRICING_DB.services).forEach(list => {
            const found = list.find(s => s.id === serviceId);
            if (found) serviceData = found;
        });

        if (!serviceData) return;

        const container = document.getElementById('items-container');
        if(!container) return;

        container.innerHTML = serviceData.groups.map(group => `
            <div class="item-group">
                <div class="group-title">${group.name}</div>
                ${group.items.map(item => `
                    <div class="item-row">
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-price">R${item.price.toFixed(2)}</span>
                        </div>
                        <div class="item-controls">
                            <button class="qty-btn" onclick="app.updateQty('${item.id}', -1)">-</button>
                            <div class="qty-display" id="qty-${item.id}">${this.state.items[item.id] || 0}</div>
                            <button class="qty-btn" onclick="app.updateQty('${item.id}', 1, ${item.price})">+</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    // --- LOGIC & CALCULATION ---

    updateQty(itemId, delta) {
        if (!this.state.items[itemId]) this.state.items[itemId] = 0;
        this.state.items[itemId] += delta;
        
        if (this.state.items[itemId] < 0) this.state.items[itemId] = 0;
        
        const qtyDisplay = document.getElementById(`qty-${itemId}`);
        if(qtyDisplay) qtyDisplay.innerText = this.state.items[itemId];
        
        this.calculateTotals();
    }

    toggleDiscount() {
        const chk = document.getElementById('contract-discount');
        this.state.discountActive = chk ? chk.checked : false;
        this.calculateTotals();
    }

    calculateTotals() {
        let subtotal = 0;
        
        // Find current service definition for MinCharge and CallOut
        let serviceDef = null;
        if (this.state.serviceId) {
            Object.values(PRICING_DB.services).forEach(list => {
                const found = list.find(s => s.id === this.state.serviceId);
                if (found) serviceDef = found;
            });
        }

        // Iterate all items to calc subtotal
        // We need to find the price of the item from the DB
        const allItemsFlat = [];
        Object.values(PRICING_DB.services).forEach(cat => {
            cat.forEach(svc => {
                svc.groups.forEach(grp => {
                    grp.items.forEach(itm => allItemsFlat.push(itm));
                });
            });
        });

        Object.keys(this.state.items).forEach(itemId => {
            const qty = this.state.items[itemId];
            const itemDef = allItemsFlat.find(i => i.id === itemId);
            if (itemDef && qty > 0) {
                subtotal += (itemDef.price * qty);
            }
        });

        let callOut = 0;
        let minCharge = 300; // Global floor
        
        if (serviceDef) {
            callOut = serviceDef.callOut;
            if (serviceDef.minCharge) minCharge = serviceDef.minCharge;
        }

        let gross = subtotal + callOut;
        let discountAmount = 0;

        if (this.state.discountActive) {
            discountAmount = gross * 0.25;
            gross -= discountAmount;
        }

        // Min Charge Logic
        const minChargeApplied = gross < minCharge && gross > 0;
        if (minChargeApplied) gross = minCharge;

        // Update State
        this.state.totals = {
            subtotal,
            callOut,
            discount: discountAmount,
            total: gross,
            minChargeApplied,
            minChargeValue: minCharge
        };

        this.updateSummary();
    }

    updateSummary() {
        const list = document.getElementById('summary-list');
        const totalDisp = document.getElementById('total-display');
        const mobileTotal = document.getElementById('mobile-total');
        const notice = document.getElementById('min-charge-notice');

        if(!list) return;

        // Render List
        let html = '';
        
        // Call Out
        if (this.state.totals.callOut > 0) {
            html += `
                <div class="summary-item">
                    <span>Call-Out Fee</span>
                    <span>R${this.state.totals.callOut.toFixed(2)}</span>
                </div>`;
        }

        // Items
        const allItemsFlat = [];
        Object.values(PRICING_DB.services).forEach(cat => {
            cat.forEach(svc => {
                svc.groups.forEach(grp => {
                    grp.items.forEach(itm => allItemsFlat.push(itm));
                });
            });
        });

        let hasItems = false;
        Object.keys(this.state.items).forEach(itemId => {
            const qty = this.state.items[itemId];
            if (qty > 0) {
                hasItems = true;
                const def = allItemsFlat.find(i => i.id === itemId);
                html += `
                <div class="summary-item">
                    <span>${def.name} <b style="color:var(--primary)">x${qty}</b></span>
                    <span>R${(def.price * qty).toFixed(2)}</span>
                </div>`;
            }
        });

        if (!hasItems && this.state.totals.callOut === 0) {
            html = `
            <div class="text-center" style="color:var(--text-light); padding-top:40px;">
                <i class="fas fa-calculator" style="font-size:40px; margin-bottom:10px;"></i>
                <p>Select items to see breakdown</p>
            </div>`;
        }

        // Discount
        if (this.state.totals.discount > 0) {
            html += `
            <div class="summary-divider"></div>
            <div class="summary-item" style="color:var(--success)">
                <span>Contract Discount (25%)</span>
                <span>- R${this.state.totals.discount.toFixed(2)}</span>
            </div>`;
        }

        list.innerHTML = html;
        
        if(totalDisp) totalDisp.innerText = `R${this.state.totals.total.toFixed(2)}`;
        if(mobileTotal) mobileTotal.innerText = `R${this.state.totals.total.toFixed(2)}`;

        // Notice
        if(notice) {
            if (this.state.totals.minChargeApplied) {
                notice.innerHTML = `<i class="fas fa-exclamation-circle"></i> Minimum charge of R${this.state.totals.minChargeValue} applied.`;
                notice.classList.add('active');
            } else {
                notice.classList.remove('active');
            }
        }
    }

    submitQuote() {
        // Form validation
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const phone = document.getElementById('contact-phone').value;
        const addr = document.getElementById('property-address').value;

        if(!name || !email || !phone || !addr) return alert("Please fill in all required contact fields.");

        // Success Simulation
        const btn = document.getElementById('nextBtn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        const ref = document.getElementById('quote-ref') ? document.getElementById('quote-ref').innerText : 'REF';

        setTimeout(() => {
            alert(`Quote Reference ${ref} has been sent to ${email}. We will contact you shortly!`);
            window.location.reload();
        }, 2000);
    }
}
