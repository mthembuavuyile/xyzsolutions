/**
 * --------------------------------------------------------------------------
 * FILE 1: PRICING DATABASE (pricing-data.js)
 * Comprehensive list of all services, items, prices, and metadata.
 * --------------------------------------------------------------------------
 */
const PRICING_DB = {
    categories: [
        {
            id: 'RES',
            name: 'Residential Cleaning',
            icon: 'fa-home',
            desc: 'Houses, Apartments, Townhouses, and similar residences'
        },
        {
            id: 'CORP',
            name: 'Corporate & Industrial',
            icon: 'fa-building',
            desc: 'Offices, Hospitals, Schools, Warehouses, Parks, and similar commercial spaces'
        },
        {
            id: 'HOSP',
            name: 'Hospitality',
            icon: 'fa-hotel',
            desc: 'Hotels, BnBs, Guesthouses, Lodges, Resorts, and similar accommodations'
        },
        {
            id: 'SPEC',
            name: 'Specialized Services',
            icon: 'fa-star',
            desc: 'Solar panels, Pest control, Construction cleaning, and other specialized services'
        }
    ],

    services: {
        // --- RESIDENTIAL SERVICES ---
        'RES': [
            { 
                id: 'res_deep', name: 'Deep / Spring Clean', icon: 'fa-sparkles', callOut: 0, minCharge: 450,
                desc: 'Top-to-bottom deep clean including walls, skirting, and windows.',
                groups: [
                    {
                        name: 'Property Size (Base)',
                        items: [
                            { id: 'studio', name: 'Studio / Bachelor', price: 450 },
                            { id: 'bed1_bath1', name: '1 Bed / 1 Bath', price: 550 },
                            { id: 'bed2_bath1', name: '2 Bed / 1 Bath', price: 750 },
                            { id: 'bed2_bath2', name: '2 Bed / 2 Bath', price: 850 },
                            { id: 'bed3_bath2', name: '3 Bed / 2 Bath', price: 1100 },
                            { id: 'bed4_bath3', name: '4 Bed / 3 Bath', price: 1500 },
                        ]
                    },
                    {
                        name: 'Add-ons',
                        items: [
                            { id: 'oven', name: 'Oven Deep Clean', price: 250 },
                            { id: 'fridge', name: 'Fridge Interior', price: 150 },
                            { id: 'garage', name: 'Garage Sweep & Wash', price: 180 },
                            { id: 'patio', name: 'Patio Pressure Wash', price: 250 }
                        ]
                    }
                ]
            },
            {
                id: 'res_upholstery', name: 'Upholstery & Carpets', icon: 'fa-couch', callOut: 0, minCharge: 500,
                desc: 'Steam cleaning extraction for furniture and soft furnishings.',
                groups: [
                    {
                        name: 'Couches & Seating',
                        items: [
                            { id: 'couch_1', name: '1 Seater / Armchair', price: 275 },
                            { id: 'couch_2', name: '2 Seater Couch', price: 395 },
                            { id: 'couch_3', name: '3 Seater Couch', price: 455 },
                            { id: 'couch_l', name: 'L-Shape (Up to 5 seater)', price: 845 },
                            { id: 'couch_u', name: 'U-Shape / Corner Suite', price: 1100 },
                            { id: 'dining_chair', name: 'Dining Chair (Seat & Back)', price: 95 },
                            { id: 'ottoman', name: 'Ottoman', price: 145 }
                        ]
                    },
                    {
                        name: 'Carpets & Rugs',
                        items: [
                            { id: 'rug_small', name: 'Small Rug (<2m)', price: 245 },
                            { id: 'rug_large', name: 'Large Rug (>2m)', price: 295 },
                            { id: 'fitted_room', name: 'Fitted Carpet (Standard Room)', price: 350 },
                            { id: 'fitted_stairs', name: 'Staircase (Per flight)', price: 250 }
                        ]
                    },
                    {
                        name: 'Mattresses',
                        items: [
                            { id: 'mat_single', name: 'Single Mattress', price: 295 },
                            { id: 'mat_double', name: 'Double/Queen Mattress', price: 395 },
                            { id: 'mat_king', name: 'King Mattress', price: 495 }
                        ]
                    }
                ]
            }
        ],

        // --- CORPORATE SERVICES ---
        'CORP': [
            {
                id: 'corp_office', 
                name: 'Office & Workspace Cleaning', 
                icon: 'fa-briefcase', 
                callOut: 150, 
                minCharge: 950,
                desc: 'Desks, meeting rooms, chairs, floors, and common office areas.',
                groups: [
                    {
                        name: 'Area Cleaning',
                        items: [
                            { id: 'sqm_office', name: 'Office Space (per m²)', price: 21 },
                            { id: 'sqm_warehouse', name: 'Warehouse Floor (per m²)', price: 8 },
                            { id: 'toilet_deep', name: 'Ablution Block Deep Clean', price: 450 }
                        ]
                    },
                    {
                        name: 'Furniture & Fixtures',
                        items: [
                            { id: 'chair_office', name: 'Office Chair (Swivel)', price: 85 },
                            { id: 'chair_visitor', name: 'Visitor Chair', price: 65 }
                        ]
                    }
                ]
            },
            {
                id: 'corp_special', 
                name: 'Specialized Rooms & Facilities', 
                icon: 'fa-building', 
                callOut: 200, 
                minCharge: 1200,
                desc: 'Server rooms, labs, storage areas, and conference halls.',
                groups: [
                    {
                        name: 'Area Cleaning',
                        items: [
                            { id: 'sqm_lab', name: 'Lab/Server Room (per m²)', price: 20 },
                            { id: 'sqm_conference', name: 'Conference Hall (per m²)', price: 18 }
                        ]
                    }
                ]
            },
            {
                id: 'corp_floors', 
                name: 'Floors & Surfaces', 
                icon: 'fa-broom', 
                callOut: 100, 
                minCharge: 800,
                desc: 'Carpets, tiles, vinyl, and high-touch surfaces throughout corporate spaces.',
                groups: [
                    {
                        name: 'Surface Cleaning',
                        items: [
                            { id: 'carpet_clean', name: 'Carpet (per m²)', price: 22 },
                            { id: 'tile_clean', name: 'Tile (per m²)', price: 18 },
                            { id: 'vinyl_clean', name: 'Vinyl (per m²)', price: 15 }
                        ]
                    }
                ]
            }
        ],

        // --- SPECIALIZED SERVICES ---
        'SPEC': [
            {
                id: 'spec_pest', name: 'Pest Control', icon: 'fa-bug', callOut: 550, minCharge: 850,
                desc: 'Fumigation, Gel, and Baiting services. Includes inspection.',
                groups: [
                    {
                        name: 'Treatments',
                        items: [
                            { id: 'roach_gel', name: 'Cockroach Gel (Per Room)', price: 250 },
                            { id: 'ant_spray', name: 'Ant Surface Spray (Per Room)', price: 200 },
                            { id: 'rodent_station', name: 'Rodent Bait Station', price: 140 },
                            { id: 'bedbugs', name: 'Bed Bug Fumigation (Per Room)', price: 550 },
                            { id: 'fleas', name: 'Flea Treatment (Internal)', price: 650 }
                        ]
                    }
                ]
            },
            {
                id: 'spec_solar', name: 'Solar & Windows', icon: 'fa-solar-panel', callOut: 0, minCharge: 400,
                desc: 'De-ionized water cleaning for panels and glass.',
                groups: [
                    {
                        name: 'Solar Panels',
                        items: [
                            { id: 'panel', name: 'Solar Panel (Standard)', price: 75 }
                        ]
                    },
                    {
                        name: 'Windows',
                        items: [
                            { id: 'win_small', name: 'Small/Standard Window', price: 35 },
                            { id: 'win_large', name: 'Large/Sliding Door', price: 65 },
                            { id: 'win_high', name: 'High Reach (2nd Story)', price: 95 }
                        ]
                    }
                ]
            }
        ],
        
        // --- HOSPITALITY SERVICES ---
        'HOSP': [
            {
                id: 'hosp_rooms', 
                name: 'Guest Room Cleaning', 
                icon: 'fa-bed', 
                callOut: 150, 
                minCharge: 800,
                desc: 'Spotless rooms for guests: beds, floors, furniture, and bathrooms.',
                groups: [
                    {
                        name: 'Room Units',
                        items: [
                            { id: 'room_std', name: 'Standard Room Cleaning', price: 250 },
                            { id: 'room_suite', name: 'Suite Cleaning', price: 400 },
                            { id: 'linen_change', name: 'Bed Linen Change', price: 75 },
                            { id: 'bathroom_sanitize', name: 'Bathroom Sanitation', price: 120 }
                        ]
                    }
                ]
            },
            {
                id: 'hosp_common', 
                name: 'Common Area & Facility Cleaning', 
                icon: 'fa-building', 
                callOut: 200, 
                minCharge: 1000,
                desc: 'Maintain lobbies, corridors, dining areas, and high-traffic spaces.',
                groups: [
                    {
                        name: 'Shared Areas',
                        items: [
                            { id: 'lobby_clean', name: 'Lobby & Reception', price: 200 },
                            { id: 'hallway_clean', name: 'Hallways & Staircases', price: 150 },
                            { id: 'dining_clean', name: 'Dining Room / Lounge', price: 180 },
                            { id: 'elevator_touch', name: 'Elevators & High-Touch Surfaces', price: 100 }
                        ]
                    }
                ]
            },
            {
                id: 'hosp_deep', 
                name: 'Deep & Specialty Cleaning', 
                icon: 'fa-broom', 
                callOut: 250, 
                minCharge: 1200,
                desc: 'Periodic deep cleaning for hygiene and upkeep of all areas.',
                groups: [
                    {
                        name: 'Deep Cleaning Services',
                        items: [
                            { id: 'carpet_shampoo', name: 'Carpet Shampooing', price: 300 },
                            { id: 'tile_scrub', name: 'Tile Scrubbing', price: 250 },
                            { id: 'upholstery_clean', name: 'Upholstery & Furniture Deep Clean', price: 350 },
                            { id: 'window_clean', name: 'Window Cleaning', price: 150 },
                            { id: 'kitchen_clean', name: 'Kitchen / Pantry Sanitation', price: 400 },
                            { id: 'mattress_sanitize', name: 'Mattress UV Sanitize', price: 150 }
                        ]
                    }
                ]
            }
        ]
    }
};
