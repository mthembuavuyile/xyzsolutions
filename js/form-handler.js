document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quote-form');
    if (!form) return;

    // Element Selectors
    // We select all checkboxes with the specific name attribute
    const serviceTypeCheckboxes = form.querySelectorAll('input[name="service_type[]"]');
    const serviceTypeContainer = document.getElementById('service_type_container'); // For validation styling
    
    const frequencyOptions = document.getElementById('frequency-options');
    const additionalServices = document.getElementById('additional-services');
    const resultDiv = document.getElementById('form-result');
    const submitBtn = form.querySelector('button[type="submit"]');
    const selects = form.querySelectorAll('select');

    // Standard text/select fields to validate (removed 'service_type' as it is now handled separately)
    const fieldsToValidate = ['name', 'email', 'phone', 'service_area', 'message'];

    // --- 1. Validation Logic ---

    // Helper to validate standard inputs (Text, Email, Single Select)
    const validateField = (field) => {
        let isValid = true;
        field.classList.remove('valid', 'invalid');

        // Check required
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
        }

        // Check email
        if (isValid && field.type === 'email' && field.value.trim()) {
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        }

        // Check phone
        if (isValid && field.type === 'tel' && field.value.trim()) {
            isValid = /^\+?(\d[\s-]?){8,14}\d$/.test(field.value);
        }
        
        // Visual feedback
        if (field.value.trim() || field.classList.contains('touched')) {
            field.classList.add(isValid ? 'valid' : 'invalid');
        }

        return isValid;
    };

    // Helper to validate the Service Type Checkbox Group
    const validateServiceGroup = () => {
        const isChecked = Array.from(serviceTypeCheckboxes).some(checkbox => checkbox.checked);
        
        // Apply visual feedback to the container div
        if (serviceTypeContainer) {
            if (isChecked) {
                serviceTypeContainer.classList.remove('invalid');
                serviceTypeContainer.classList.add('valid');
            } else {
                serviceTypeContainer.classList.remove('valid');
                serviceTypeContainer.classList.add('invalid');
            }
        }
        return isChecked;
    };

    // --- 2. Event Listeners for Real-time Validation ---

    // Standard fields
    fieldsToValidate.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            const eventType = field.tagName === 'SELECT' ? 'change' : 'input';
            field.addEventListener(eventType, () => {
                field.classList.add('touched');
                validateField(field);
            });
        }
    });

    // Checkbox Group Validation Listener
    serviceTypeCheckboxes.forEach(box => {
        box.addEventListener('change', () => {
            validateServiceGroup();
            handleServiceTypeChange(); // Also trigger visibility logic
        });
    });

    // --- 3. Dynamic Visibility Logic (Multiple Selection) ---
    
    const handleServiceTypeChange = () => {
        // Get an array of all currently checked values
        const checkedValues = Array.from(serviceTypeCheckboxes)
            .filter(box => box.checked)
            .map(box => box.value);

        // Define which values trigger which sections
        const frequencyTriggers = ['regular_domestic', 'commercial_office', 'complex_common'];
        const extrasTriggers = ['regular_domestic', 'deep_clean', 'move_in_out', 'airbnb'];

        // Check if ANY of the selected services match the triggers
        // .some checks if at least one element in the array passes the test
        const showFrequency = checkedValues.some(val => frequencyTriggers.includes(val));
        const showExtras = checkedValues.some(val => extrasTriggers.includes(val));

        // Toggle visibility
        if (frequencyOptions) frequencyOptions.classList.toggle('hidden', !showFrequency);
        if (additionalServices) additionalServices.classList.toggle('hidden', !showExtras);
    };

    // --- 4. UX Helpers ---

    // Floating label styling for selects
    selects.forEach(select => {
        select.addEventListener('change', () => {
            select.classList.toggle('has-value', !!select.value);
        });
    });

    // --- 5. Form Submission ---

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate Standard Fields
        let isFormValid = true;
        fieldsToValidate.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.classList.add('touched');
                if (!validateField(field)) {
                    isFormValid = false;
                }
            }
        });

        // Validate Service Checkbox Group
        if (!validateServiceGroup()) {
            isFormValid = false;
        }

        if (!isFormValid) {
            resultDiv.className = 'error';
            resultDiv.textContent = 'Please fill out all required fields (including Service Type).';
            resultDiv.style.display = 'block';
            return;
        }

        // --- Prepare & Send ---
        const formData = new FormData(form);
        const originalBtnText = submitBtn.innerHTML;
        
        resultDiv.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                resultDiv.className = 'success';
                resultDiv.textContent = data.message || "Success! Your quote request has been sent.";
                
                form.reset();
                
                // Cleanup Classes & Visibility
                form.querySelectorAll('.valid, .invalid, .has-value, .touched').forEach(el => 
                    el.classList.remove('valid', 'invalid', 'has-value', 'touched')
                );
                // Reset checkbox container specific styling
                if (serviceTypeContainer) {
                    serviceTypeContainer.classList.remove('valid', 'invalid');
                }
                
                // Hide conditional sections
                if (frequencyOptions) frequencyOptions.classList.add('hidden');
                if (additionalServices) additionalServices.classList.add('hidden');

            } else {
                resultDiv.className = 'error';
                resultDiv.textContent = data.message || "An error occurred. Please try again.";
            }
        } catch (error) {
            resultDiv.className = 'error';
            resultDiv.textContent = "A network error occurred. Please check your connection.";
        } finally {
            resultDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
});