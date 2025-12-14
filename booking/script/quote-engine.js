/**
 * --------------------------------------------------------------------------
 * FILE 3: APPLICATION LOGIC (quote-engine.js)
 * The Engine: Handles state, calculations, and DOM manipulation.
 * Updated: Supports Multi-Service Selection
 * --------------------------------------------------------------------------
 */
class QuoteApp {
    constructor() {
        this.state = {
            step: 1,
            region: null,
            category: null,
            selectedServices: [], // Changed from single ID to Array
            items: {}, // { itemId: quantity }
            discountActive: false,
            totals: {
                subtotal: 0,
                callOut: 0,
                discount: 0,
                total: 0,
                minChargeApplied: false,
                minChargeValue: 0
            }
        };
        this.flatItemMap = new Map(); // Cache for item lookups
    }

    init() {
        this.cacheItems();
        this.renderCategories();
        this.updateSummary();
        
        // Generate random reference
        const refEl = document.getElementById('quote-ref');
        if(refEl) refEl.innerText = 'Q-' + Math.floor(1000 + Math.random() * 9000);
    }

    cacheItems() {
        Object.values(PRICING_DB.services).forEach(cat => {
            cat.forEach(svc => {
                svc.groups.forEach(grp => {
                    grp.items.forEach(itm => {
                        this.flatItemMap.set(itm.id, { ...itm, serviceName: svc.name });
                    });
                });
            });
        });
    }

    // --- NAVIGATION ---
    
    setRegion(region, element) {
        this.state.region = region;
        document.querySelectorAll('#step-1 .selection-card').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    }

    setCategory(catId, element) {
        this.state.category = catId;
        this.state.selectedServices = []; // Reset services if category changes
        
        // UI Updates
        document.querySelectorAll('#category-grid .selection-card').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        
        this.renderServices(catId);
    }

    // NEW: Toggle logic for multi-selection
    toggleService(serviceId, element) {
        const index = this.state.selectedServices.indexOf(serviceId);
        
        if (index > -1) {
            // Deselect
            this.state.selectedServices.splice(index, 1);
            element.classList.remove('selected');
        } else {
            // Select
            this.state.selectedServices.push(serviceId);
            element.classList.add('selected');
        }

        // We do NOT auto-advance step here anymore, user must click Next
    }

    nextStep() {
        // Validation
        if (this.state.step === 1) {
            if (!this.state.region) return alert('Please select a Region.');
            if (!this.state.category) return alert('Please select a Category.');
        }
        
        if (this.state.step === 2) {
            if (this.state.selectedServices.length === 0) {
                return alert('Please select at least one Service Type.');
            }
            // Prepare Step 3 rendering based on all selected services
            this.renderItems(); 
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
        
        // Update Progress Indicators
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
                <div class="card-content">
                    <i class="fas ${cat.icon} card-icon"></i>
                    <span class="card-title">${cat.name}</span>
                    <span class="card-desc">${cat.desc}</span> 
                </div>
                <div class="check-mark"><i class="fas fa-check"></i></div>
            </div>
        `).join('');
    }

    renderServices(catId) {
        const grid = document.getElementById('service-type-grid');
        if(!grid) return;
        const services = PRICING_DB.services[catId] || [];
        
        grid.innerHTML = services.map(svc => `
            <div class="selection-card" onclick="app.toggleService('${svc.id}', this)">
                <i class="fas ${svc.icon} card-icon"></i>
                <span class="card-title">${svc.name}</span>
                <div class="tag tag-blue" style="margin:5px 0">Min: R${svc.minCharge}</div>
                <span class="card-desc">${svc.desc}</span>
                <div class="check-mark"><i class="fas fa-check"></i></div>
            </div>
        `).join('');
    }

    // Updated: Renders groups for ALL selected services
    renderItems() {
        const container = document.getElementById('items-container');
        if(!container) return;
        
        container.innerHTML = ''; // Clear previous

        const categoryServices = PRICING_DB.services[this.state.category];
        
        // Filter DB services to only those selected
        const activeServices = categoryServices.filter(s => this.state.selectedServices.includes(s.id));

        if (activeServices.length === 0) return;

        let html = '';

        activeServices.forEach(service => {
            // Add a Service Header to separate sections
            html += `
            <div class="service-section-header">
                <h3><i class="fas ${service.icon}"></i> ${service.name}</h3>
            </div>`;

            service.groups.forEach(group => {
                html += `
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
                                <button class="qty-btn" onclick="app.updateQty('${item.id}', 1)">+</button>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
            });
        });

        container.innerHTML = html;
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
        let maxCallOut = 0;
        let maxMinCharge = 300; // Global floor default

        // 1. Calculate Subtotal (Loop through active items)
        Object.keys(this.state.items).forEach(itemId => {
            const qty = this.state.items[itemId];
            if(qty > 0) {
                const itemDef = this.flatItemMap.get(itemId);
                if(itemDef) {
                    subtotal += (itemDef.price * qty);
                }
            }
        });

        // 2. Calculate Service Fees (Callout & MinCharge)
        // Logic: We take the HIGHEST callout and HIGHEST minCharge 
        // among the selected services to ensure coverage.
        const categoryServices = PRICING_DB.services[this.state.category] || [];
        const activeServices = categoryServices.filter(s => this.state.selectedServices.includes(s.id));

        activeServices.forEach(svc => {
            if(svc.callOut > maxCallOut) maxCallOut = svc.callOut;
            if(svc.minCharge > maxMinCharge) maxMinCharge = svc.minCharge;
        });

        // 3. Totals
        let gross = subtotal + maxCallOut;
        let discountAmount = 0;

        if (this.state.discountActive) {
            discountAmount = gross * 0.25;
            gross -= discountAmount;
        }

        // 4. Min Charge Check
        const minChargeApplied = gross < maxMinCharge && gross > 0;
        if (minChargeApplied) gross = maxMinCharge;

        // 5. Update State
        this.state.totals = {
            subtotal,
            callOut: maxCallOut,
            discount: discountAmount,
            total: gross,
            minChargeApplied,
            minChargeValue: maxMinCharge
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
                    <span>Standard Call-Out</span>
                    <span>R${this.state.totals.callOut.toFixed(2)}</span>
                </div>`;
        }

        // Items
        let hasItems = false;
        Object.keys(this.state.items).forEach(itemId => {
            const qty = this.state.items[itemId];
            if (qty > 0) {
                hasItems = true;
                const def = this.flatItemMap.get(itemId);
                if(def) {
                    html += `
                    <div class="summary-item">
                        <span>${def.name} <b style="color:var(--primary)">x${qty}</b></span>
                        <span>R${(def.price * qty).toFixed(2)}</span>
                    </div>`;
                }
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

    async submitQuote() {
        // 1. Form validation
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const phone = document.getElementById('contact-phone').value;
        const addr = document.getElementById('property-address').value;
        const date = document.getElementById('booking-date').value;
        const notes = document.getElementById('special-req') ? document.getElementById('special-req').value : '';
        
        if(!name || !email || !phone || !addr) {
            alert("Please fill in all required contact fields (Name, Email, Phone, Address).");
            return;
        }

        // 2. UI Feedback (Loading State)
        const btn = document.getElementById('nextBtn');
        const originalText = btn.innerText;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        const ref = document.getElementById('quote-ref') ? document.getElementById('quote-ref').innerText : 'REF';

        // 3. Prepare the Item List for the Email
        let itemsHtml = "<ul>";
        
        Object.keys(this.state.items).forEach(itemId => {
            const qty = this.state.items[itemId];
            if (qty > 0) {
                const itemDef = this.flatItemMap.get(itemId);
                if (itemDef) {
                    const lineTotal = itemDef.price * qty;
                    // Format: [Service Name] Item Name (xQty)
                    const line = `[${itemDef.serviceName || 'General'}] ${itemDef.name} (x${qty}) - R${lineTotal.toFixed(2)}`;
                    itemsHtml += `<li>${line}</li>`;
                }
            }
        });
        itemsHtml += "</ul>";

        // 4. Construct the Data Payload
        const formData = {
            access_key: "9d215b07-c824-40ed-a51e-aa79fd714e28", // YOUR KEY
            subject: `New Quote Request: ${ref} from ${name}`,
            from_name: "XYZ Website Quote",
            
            // --- Customer Details ---
            reference_number: ref,
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            preferred_date: date || "Not specified",
            property_address: addr,
            special_notes: notes || "None",

            // --- Quote Specs ---
            region: this.state.region,
            service_category: this.state.category,
            // Join all selected service IDs for the record
            service_types: this.state.selectedServices.join(', '),
            
            // --- Financials ---
            subtotal: `R${this.state.totals.subtotal.toFixed(2)}`,
            call_out_fee: `R${this.state.totals.callOut.toFixed(2)}`,
            discount_applied: this.state.discountActive ? "Yes (25% Contract)" : "No",
            discount_amount: `-R${this.state.totals.discount.toFixed(2)}`,
            min_charge_applied: this.state.totals.minChargeApplied ? `Yes (R${this.state.totals.minChargeValue})` : "No",
            
            // --- FINAL TOTAL ---
            ESTIMATED_TOTAL: `R${this.state.totals.total.toFixed(2)}`,

            // --- Item Breakdown ---
            selected_items: itemsHtml
        };

        // 5. Send to Web3Forms
        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                alert(`Success! Quote ${ref} has been sent. We will contact you shortly.`);
                window.location.reload(); 
            } else {
                throw new Error(result.message || "Form submission failed");
            }
        } catch (error) {
            console.error(error);
            alert("There was an error sending your quote. Please try again or contact us directly.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}