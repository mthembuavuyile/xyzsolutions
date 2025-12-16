// 1. Categories (The filters for Step 1)
const CATEGORIES = [
    {
        id: 'residential',
        name: 'Residential & Upholstery',
        icon: 'fa-couch',
        desc: 'Couches, carpets, curtains, kitchens, general home cleaning.'
    },
    {
        id: 'kitchen',
        name: 'Kitchen & Braai',
        icon: 'fa-fire-burner',
        desc: 'Ovens, hobs, extractors, braai areas.'
    },
    {
        id: 'corporate',
        name: 'Corporate & Industrial',
        icon: 'fa-building',
        desc: 'Offices, schools, warehouses, carpeting.'
    },
    {
        id: 'hospitality',
        name: 'Hospitality',
        icon: 'fa-hotel',
        desc: 'Hotels, BnBs, lodges, room turnovers.'
    },
    {
        id: 'windows',
        name: 'Windows & Solar',
        icon: 'fa-window-maximize',
        desc: 'Windows, solar panels, balustrades.'
    }
];

// 2. Services Master List (All your data, tagged for flexibility)
const SERVICES_MASTER = [
    // --- UPHOLSTERY (Available in Residential, Corporate, Hospitality) ---
    {
        id: 'res_upholstery',
        name: 'Couches & Chairs',
        icon: 'fa-chair',
        tags: ['residential', 'corporate', 'hospitality'],
        desc: 'Deep cleaning for couches and chairs.',
        groups: [
            {
                name: 'Couches',
                items: [
                    { id: 'couch_1', name: '1-Seater Couch', price: 275.00 },
                    { id: 'couch_2', name: '2-Seater Couch', price: 395.00 },
                    { id: 'couch_3', name: '3-Seater Couch', price: 455.00 },
                    { id: 'couch_4', name: '4-Seater Couch', price: 625.00 },
                    { id: 'couch_5', name: '5-Seater Couch', price: 755.00 },
                    { id: 'couch_l_u', name: 'L-shape or U-shape Couch', price: 845.00 },
                    { id: 'couch_patio', name: 'Patio/Outside Couch (Per Seat)', price: 95.00 },
                    { id: 'daybed', name: 'Daybed', price: 395.00 }
                ]
            },
            {
                name: 'Chairs & Seating',
                items: [
                    { id: 'chair_special', name: 'Wingback/Lazy Boy', price: 275.00 },
                    { id: 'chair_dining', name: 'Dining Room Chair', price: 95.00 },
                    { id: 'stool_bar', name: 'Bar Stool', price: 95.00 },
                    { id: 'stool_foot', name: 'Foot Stool', price: 65.00 },
                    { id: 'bean_bag', name: 'Bean Bag', price: 249.00 },
                    { id: 'ottoman', name: 'Ottoman (per sq surface)', price: 145.00 }
                ]
            },
            {
                name: 'Extras',
                items: [
                    { id: 'pillow_loose', name: 'Loose/Scatter Pillow', price: 25.00 },
                    { id: 'pet_bed', name: 'Dog/Cat Bed', price: 145.00 }
                ]
            }
        ]
    },

    // --- KITCHEN APPLIANCES (Available in Kitchen, Residential, Hospitality) ---
    {
        id: 'kit_appliances',
        name: 'Oven, Hob & Extractor',
        icon: 'fa-fire-burner',
        tags: ['residential', 'kitchen', 'hospitality'],
        desc: 'Deep degreasing and cleaning.',
        groups: [
            {
                name: 'Ovens',
                items: [
                    { id: 'oven_s_std', name: 'Single Oven 60–80cm', price: 1050.00 },
                    { id: 'oven_s_lrg', name: 'Single Oven 90–110cm', price: 1250.00 },
                    { id: 'oven_d_std', name: 'Double Oven 60–80cm', price: 1550.00 },
                    { id: 'oven_d_lrg', name: 'Double Oven 90–110cm', price: 1850.00 }
                ]
            },
            {
                name: 'Hobs & Extractors',
                items: [
                    { id: 'hob_std', name: 'Hob Standard 4 Plate', price: 750.00 },
                    { id: 'extractor', name: 'Extractor / Hood', price: 750.00 },
                    { id: 'filter_rep', name: 'Cotton Filter Replacement', price: 120.00 }
                ]
            },
            {
                name: 'Complete Stoves',
                items: [
                    { id: 'stove_mod_std', name: 'Modern Complete Stove 60–80cm', price: 1950.00 },
                    { id: 'stove_mod_lrg', name: 'Modern Complete Stove 90–110cm', price: 1750.00 },
                    { id: 'stove_vintage', name: 'Vintage Complete Stove', price: 3250.00 }
                ]
            }
        ]
    },

    // --- BRAAI (Available in Kitchen, Residential, Hospitality) ---
    {
        id: 'kit_braai',
        name: 'Braai Cleaning',
        icon: 'fa-fire',
        tags: ['residential', 'kitchen', 'hospitality'],
        desc: 'Portable and Built-in Braai cleaning.',
        groups: [
            {
                name: 'Units',
                items: [
                    { id: 'braai_port', name: 'Portable Braai', price: 1150.00 },
                    { id: 'braai_built', name: 'Built-in Braai', price: 1350.00 }
                ]
            }
        ]
    },

    // --- CARPETS (Available in Residential, Hospitality, Corporate) ---
    {
        id: 'res_carpets',
        name: 'Loose Rugs & Mats',
        icon: 'fa-rug',
        tags: ['residential', 'hospitality', 'corporate'],
        desc: 'Cleaning of loose carpets, rugs, and mats.',
        groups: [
            {
                name: 'Loose Carpets',
                items: [
                    { id: 'rug_small', name: 'Loose Carpet/Rug (< 2m x 2m)', price: 245.00 },
                    { id: 'rug_large', name: 'Loose Carpet/Rug (2m x 2m +)', price: 295.00 },
                    { id: 'floor_mat', name: 'Floor Mat', price: 45.00 }
                ]
            }
        ]
    },

    // --- VEHICLES (Residential only usually, but added to Corp just in case) ---
    {
        id: 'res_vehicle',
        name: 'Vehicle Interiors',
        icon: 'fa-car',
        tags: ['residential', 'corporate'],
        desc: 'Deep clean of vehicle upholstery and carpets.',
        groups: [
            {
                name: 'Full Interior Valet',
                items: [
                    { id: 'car_5', name: 'Vehicle Interior (5 seats)', price: 545.00 },
                    { id: 'car_9', name: 'Vehicle Interior (6–9 seats)', price: 675.00 },
                    { id: 'car_14', name: 'Vehicle Interior (10–14 seats)', price: 955.00 },
                    { id: 'car_seat_baby', name: 'Infant Car Seat', price: 155.00 }
                ]
            }
        ]
    },

    // --- CURTAINS (Residential & Hospitality) ---
    {
        id: 'res_curtains',
        name: 'Curtains & Blinds',
        icon: 'fa-layer-group',
        tags: ['residential', 'hospitality'],
        desc: 'Cleaning done while hanging.',
        groups: [
            {
                name: 'Curtains',
                items: [
                    { id: 'curtain_std', name: 'Curtains Standard (~220cm)', price: 175.00 },
                    { id: 'curtain_xl', name: 'Curtains Extra Length (~250cm+)', price: 285.00 }
                ]
            },
            {
                name: 'Blinds',
                items: [
                    { id: 'blind_std', name: 'Blinds Standard (~220cm)', price: 175.00 },
                    { id: 'blind_xl', name: 'Blinds Extra Length (~250cm+)', price: 285.00 }
                ]
            }
        ]
    },

    // --- CORPORATE GENERAL (Corporate Only) ---
    {
        id: 'corp_general',
        name: 'Corporate & Office',
        icon: 'fa-building',
        tags: ['corporate'],
        desc: 'Offices, Hospitals, Schools, Warehousing.',
        groups: [
            {
                name: 'Flooring',
                items: [
                    { id: 'corp_carpet', name: 'Office Carpet (per m²)', price: 21.00 },
                    { id: 'corp_common', name: 'Common Areas Carpet/Tiles (per m²)', price: 21.00 }
                ]
            },
            {
                name: 'Office Furniture',
                items: [
                    { id: 'corp_chair_std', name: 'Office Chair (Standard)', price: 85.00 },
                    { id: 'corp_chair_exec', name: 'Office Chair (Executive/Leather)', price: 195.00 }
                ]
            }
        ]
    },

    // --- HOSPITALITY FIXED SPACES (Hospitality Only) ---
    {
        id: 'hosp_fixed',
        name: 'Fixed Floor Spaces',
        icon: 'fa-kaaba',
        tags: ['hospitality'],
        desc: 'Carpet or Tile cleaning for fixed rooms.',
        groups: [
            {
                name: 'Bedrooms',
                items: [
                    { id: 'room_master', name: 'Master Bedroom (4m x 4m +)', price: 395.00 },
                    { id: 'room_std', name: 'Standard Bedroom (<4m x 4m)', price: 375.00 },
                    { id: 'room_closet', name: 'Dressing/Closet Space', price: 195.00 }
                ]
            },
            {
                name: 'Living Areas',
                items: [
                    { id: 'room_living', name: 'Dining/Lounge/TV/Kitchen', price: 395.00 },
                    { id: 'room_study', name: 'Study/Office', price: 255.00 },
                    { id: 'room_passage', name: 'Passage/Staircase/Extra', price: 245.00 }
                ]
            },
            {
                name: 'Outdoor/Utility',
                items: [
                    { id: 'area_patio_lrg', name: 'Patio/Outside Tiles (4m x 4m +)', price: 395.00 },
                    { id: 'area_patio_sml', name: 'Patio/Outside Tiles (<4m x 4m)', price: 375.00 },
                    { id: 'area_garage_lrg', name: 'Garage Floor (4m x 4m +)', price: 395.00 },
                    { id: 'area_garage_sml', name: 'Garage Floor (<4m x 4m)', price: 375.00 }
                ]
            }
        ]
    },

    // --- HOSPITALITY BEDS (Hospitality Only) ---
    {
        id: 'hosp_beds',
        name: 'Beds & Bedding',
        icon: 'fa-bed',
        tags: ['hospitality'],
        desc: 'Mattress and frame cleaning.',
        groups: [
            {
                name: 'Mattresses',
                items: [
                    { id: 'mat_lrg', name: 'Mattress (3/4, Dbl, Queen, King)', price: 495.00 },
                    { id: 'mat_sng', name: 'Mattress (Single)', price: 295.00 },
                    { id: 'mat_cot', name: 'Baby Cot/Carry Cot', price: 155.00 }
                ]
            },
            {
                name: 'Frames',
                items: [
                    { id: 'headboard', name: 'Headboard', price: 185.00 },
                    { id: 'bed_base', name: 'Bed Base', price: 195.00 }
                ]
            }
        ]
    },

    // --- WINDOWS (Universal: Res, Corp, Hosp, Windows) ---
    {
        id: 'spec_window',
        name: 'Windows & Glass',
        icon: 'fa-window-maximize',
        tags: ['residential', 'corporate', 'hospitality', 'windows'],
        desc: 'Professional window cleaning per unit.',
        groups: [
            {
                name: 'Standard Windows',
                items: [
                    { id: 'win_sq_pl', name: 'Square Plain Window', price: 35.00 },
                    { id: 'win_sq_cot', name: 'Square Cottage Window', price: 55.00 },
                    { id: 'win_rec_pl', name: 'Rectangle Plain Window', price: 35.00 },
                    { id: 'win_rec_cot', name: 'Rectangle Cottage Window', price: 55.00 }
                ]
            },
            {
                name: 'Stack & Sliding',
                items: [
                    { id: 'win_stack_2', name: '2 x Stack Window', price: 35.00 },
                    { id: 'win_stack_2u', name: '2 x Stack Uneven Window', price: 35.00 },
                    { id: 'win_stack_3', name: '3 x Stack Window', price: 40.00 },
                    { id: 'win_stack_3u', name: '3 x Stack Uneven Window', price: 40.00 },
                    { id: 'win_stack_4', name: '4 x Stack Window', price: 45.00 },
                    { id: 'door_stack', name: 'Foldable Stack Glass Door', price: 125.00 },
                    { id: 'door_slide', name: '2 x Sliding Door Panels', price: 45.00 }
                ]
            },
            {
                name: 'Specialty Windows',
                items: [
                    { id: 'win_tilt_pl', name: 'Double Tilt Plain Window', price: 35.00 },
                    { id: 'win_tilt_cot', name: 'Double Tilt Cottage Window', price: 45.00 },
                    { id: 'win_skylight', name: 'Skylight Window', price: 89.00 },
                    { id: 'win_arch', name: 'Arch Window', price: 55.00 },
                    { id: 'win_tri', name: 'Triangle Window', price: 55.00 },
                    { id: 'win_slant', name: 'Slanted Window', price: 35.00 },
                    { id: 'win_circ', name: 'Circle Window', price: 35.00 },
                    { id: 'win_bay_pl', name: 'Plain Bay Window', price: 75.00 },
                    { id: 'win_bay_cot', name: 'Cottage Bay Window', price: 95.00 }
                ]
            }
        ]
    },

    // --- SOLAR (Universal) ---
    {
        id: 'spec_solar',
        name: 'Solar & Panels',
        icon: 'fa-solar-panel',
        tags: ['residential', 'corporate', 'windows'],
        desc: 'Solar panels and Balustrades.',
        groups: [
            {
                name: 'Panels',
                items: [
                    { id: 'solar_panel', name: 'Solar Panel (per panel)', price: 75.00 },
                    { id: 'balustrade', name: 'Balustrade (any size)', price: 15.00 }
                ]
            }
        ]
    }
];