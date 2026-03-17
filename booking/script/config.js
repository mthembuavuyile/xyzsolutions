const CONFIG = {
    // Financial Settings
    CURRENCY: 'R',
    BASE_MIN_CHARGE: 950, // The floor price (Total cannot be lower than this)
    DISCOUNT_RATE: 0.25,  // 25% Contract discount
    
    // API Keys
    WEB3_KEY: "9d215b07-c824-40ed-a51e-aa79fd714e28",

    // Bank / Payment Details
    BANK_DETAILS: {
        bank: "FNB / Standard Bank", // Update this
        accountName: "XYZ Solutions & Projects",
        accountNumber: "1234567890", // Update this
        branchCode: "250655",
        accountType: "Business Cheque",
        emailPOP: "bookings@xyzsolutions.co.za"
    },

    // UI Text
    DISCLAIMER_TEXT: `<i class="fas fa-info-circle"></i> Note: A standard minimum call-out fee of R950 applies to all bookings.`
};