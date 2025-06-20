// Comprehensive mock data based on TBWA client brands and Philippine market structure

import React from 'react';
export interface Region {
  code: string;
  name: string;
  weight: number;
  major_cities: string[];
  barangays: string[];
}

export interface Brand {
  name: string;
  company: string;
  is_client: boolean;
  category: string;
  skus: string[];
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  duration_seconds: number;
  region: string;
  city: string;
  barangay: string;
  location_id: string;
  channel: string;
  basket: BasketItem[];
  total: number;
  consumer_profile: ConsumerProfile;
  substitution_from?: string;
  substitution_to?: string;
  requested_as: 'branded' | 'unbranded' | 'unsure';
  request_type: 'verbal' | 'pointing' | 'indirect';
  storeowner_suggested: boolean;
  accepted_suggestion: boolean;
  ai_recommendation_id?: string;
}

export interface BasketItem {
  sku: string;
  brand: string;
  category: string;
  units: number;
  price: number;
}

export interface ConsumerProfile {
  gender: string;
  age_bracket: string;
  inferred_income: string;
  payment: string;
}

// Complete Philippine Regions Structure (All 17 Regions)
export const regions: Region[] = [
  {
    code: "NCR",
    name: "NCR",
    weight: 0.25,
    major_cities: ["Manila", "Quezon City", "Makati", "Pasig", "Taguig"],
    barangays: ["Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5"]
  },
  {
    code: "R1",
    name: "Ilocos Region",
    weight: 0.05,
    major_cities: ["Laoag", "Vigan", "San Fernando", "Dagupan"],
    barangays: ["Poblacion", "San Jose", "Santa Rosa", "San Miguel", "Santo Tomas"]
  },
  {
    code: "R2",
    name: "Cagayan Valley",
    weight: 0.03,
    major_cities: ["Tuguegarao", "Ilagan", "Santiago", "Cauayan"],
    barangays: ["Centro", "Poblacion", "San Roque", "Santa Ana", "San Pedro"]
  },
  {
    code: "R3",
    name: "Central Luzon",
    weight: 0.15,
    major_cities: ["San Fernando", "Angeles", "Olongapo", "Malolos", "Cabanatuan"],
    barangays: ["Poblacion", "San Jose", "Santa Rosa", "San Miguel", "Santo Tomas"]
  },
  {
    code: "R4A",
    name: "CALABARZON",
    weight: 0.18,
    major_cities: ["Calamba", "Antipolo", "Bacoor", "San Pedro", "Biñan"],
    barangays: ["Poblacion", "San Antonio", "Santa Cruz", "San Vicente", "Santo Niño"]
  },
  {
    code: "R4B",
    name: "MIMAROPA",
    weight: 0.03,
    major_cities: ["Calapan", "Puerto Princesa", "Mamburao", "Boac"],
    barangays: ["Poblacion", "San Roque", "Santa Maria", "San Jose", "Santo Tomas"]
  },
  {
    code: "R5",
    name: "Bicol Region",
    weight: 0.06,
    major_cities: ["Legazpi", "Naga", "Iriga", "Tabaco", "Ligao"],
    barangays: ["Centro", "Poblacion", "San Antonio", "Santa Cruz", "San Vicente"]
  },
  {
    code: "R6",
    name: "Western Visayas",
    weight: 0.08,
    major_cities: ["Iloilo City", "Bacolod", "Kalibo", "Roxas", "San Jose"],
    barangays: ["Centro", "Poblacion", "San Roque", "Santa Ana", "San Pedro"]
  },
  {
    code: "R7",
    name: "Central Visayas",
    weight: 0.08,
    major_cities: ["Cebu City", "Lapu-Lapu", "Mandaue", "Tagbilaran", "Dumaguete"],
    barangays: ["Centro", "Poblacion", "San Roque", "Santa Ana", "San Pedro"]
  },
  {
    code: "R8",
    name: "Eastern Visayas",
    weight: 0.04,
    major_cities: ["Tacloban", "Ormoc", "Maasin", "Borongan", "Catbalogan"],
    barangays: ["Poblacion", "San Miguel", "Santa Maria", "San Jose", "Santo Tomas"]
  },
  {
    code: "R9",
    name: "Zamboanga Peninsula",
    weight: 0.04,
    major_cities: ["Zamboanga City", "Pagadian", "Dipolog", "Dapitan"],
    barangays: ["Centro", "Poblacion", "San Roque", "Santa Ana", "San Pedro"]
  },
  {
    code: "R10",
    name: "Northern Mindanao",
    weight: 0.05,
    major_cities: ["Cagayan de Oro", "Iligan", "Valencia", "Malaybalay", "Gingoog"],
    barangays: ["Poblacion", "San Miguel", "Santa Maria", "San Jose", "Santo Tomas"]
  },
  {
    code: "R11",
    name: "Davao Region",
    weight: 0.06,
    major_cities: ["Davao City", "Tagum", "Panabo", "Samal", "Digos"],
    barangays: ["Poblacion", "San Antonio", "Santa Cruz", "San Vicente", "Santo Niño"]
  },
  {
    code: "R12",
    name: "SOCCSKSARGEN",
    weight: 0.04,
    major_cities: ["General Santos", "Koronadal", "Tacurong", "Kidapawan"],
    barangays: ["Centro", "Poblacion", "San Roque", "Santa Ana", "San Pedro"]
  },
  {
    code: "R13",
    name: "Caraga",
    weight: 0.03,
    major_cities: ["Butuan", "Surigao", "Bayugan", "Cabadbaran"],
    barangays: ["Poblacion", "San Miguel", "Santa Maria", "San Jose", "Santo Tomas"]
  },
  {
    code: "CAR",
    name: "CAR",
    weight: 0.02,
    major_cities: ["Baguio", "La Trinidad", "Tabuk", "Bangued"],
    barangays: ["Centro", "Poblacion", "San Antonio", "Santa Cruz", "San Vicente"]
  },
  {
    code: "BARMM",
    name: "BARMM",
    weight: 0.01,
    major_cities: ["Cotabato City", "Marawi", "Lamitan", "Jolo"],
    barangays: ["Poblacion", "San Roque", "Santa Maria", "San Jose", "Santo Tomas"]
  }
];

// FMCG categories filter - Updated to include tobacco
const FMCG_CATEGORIES = [
  'Dairy & Milk Products',
  'Snacks & Confectionery', 
  'Beverages',
  'Personal Care',
  'Household Cleaning',
  'Food & Grocery',
  'Health & Wellness',
  'Baby Care',
  'Tobacco Products',
  'Frozen Foods',
  'Canned Goods',
  'Condiments & Sauces',
  'Bakery Products',
  'Fresh Produce'
];

// TBWA Client Brands - Updated categories to match FMCG filter
export const tbwaClientBrands: Brand[] = [
  // Alaska Milk Corporation
  { name: "Alaska Evaporated Milk", company: "Alaska Milk Corporation", is_client: true, category: "Dairy & Milk Products", skus: ["Original", "Full Cream", "Low Fat"] },
  { name: "Alaska Condensed Milk", company: "Alaska Milk Corporation", is_client: true, category: "Dairy & Milk Products", skus: ["Original", "Sweetened"] },
  { name: "Alaska Powdered Milk", company: "Alaska Milk Corporation", is_client: true, category: "Dairy & Milk Products", skus: ["Small Pack", "Family Pack"] },
  { name: "Krem-Top (Coffee Creamer)", company: "Alaska Milk Corporation", is_client: true, category: "Dairy & Milk Products", skus: ["Regular", "Sugar-Free"] },
  { name: "Alpine (Evaporated & Condensed Milk)", company: "Alaska Milk Corporation", is_client: true, category: "Dairy & Milk Products", skus: ["Evaporated", "Condensed"] },
  { name: "Cow Bell (Powdered Milk)", company: "Alaska Milk Corporation", is_client: true, category: "Dairy & Milk Products", skus: ["Small Pack", "Large Pack"] },

  // Oishi (Liwayway Marketing Corporation)
  { name: "Oishi Prawn Crackers", company: "Oishi", is_client: true, category: "Snacks & Confectionery", skus: ["Original", "Spicy"] },
  { name: "Oishi Pillows", company: "Oishi", is_client: true, category: "Snacks & Confectionery", skus: ["Chocolate", "Milk"] },
  { name: "Oishi Marty's", company: "Oishi", is_client: true, category: "Snacks & Confectionery", skus: ["Baconette Strips", "Vegetarian Chicharon"] },
  { name: "Oishi Ridges", company: "Oishi", is_client: true, category: "Snacks & Confectionery", skus: ["Cheese", "Sour Cream"] },
  { name: "Oishi Bread Pan", company: "Oishi", is_client: true, category: "Snacks & Confectionery", skus: ["Garlic", "Cheese"] },
  { name: "Gourmet Picks", company: "Oishi", is_client: true, category: "Snacks & Confectionery", skus: ["Truffle", "Sour Cream"] },
  { name: "Crispy Patata", company: "Oishi", is_client: true, category: "Snacks & Confectionery", skus: ["Classic", "Barbecue"] },
  { name: "Smart C+ (Vitamin Drinks)", company: "Oishi", is_client: true, category: "Beverages", skus: ["Lemon", "Orange", "Pomelo"] },
  { name: "Oaties", company: "Oishi", is_client: true, category: "Snacks & Confectionery", skus: ["Milk", "Chocolate"] },
  { name: "Hi-Ho", company: "Oishi", is_client: true, category: "Snacks & Confectionery", skus: ["Original"] },
  { name: "Rinbee", company: "Oishi", is_client: true, category: "Snacks & Confectionery", skus: ["Cheese", "Sweet Corn"] },
  { name: "Deli Mex", company: "Oishi", is_client: true, category: "Snacks & Confectionery", skus: ["Sour Cream", "Barbecue"] },

  // Peerless Products Manufacturing Corporation
  { name: "Champion", company: "Peerless", is_client: true, category: "Household Cleaning", skus: ["Detergent", "Fabric Conditioner"] },
  { name: "Calla", company: "Peerless", is_client: true, category: "Personal Care", skus: ["Shampoo", "Body Wash"] },
  { name: "Hana", company: "Peerless", is_client: true, category: "Personal Care", skus: ["Shampoo", "Conditioner"] },
  { name: "Cyclone", company: "Peerless", is_client: true, category: "Household Cleaning", skus: ["Bleach"] },
  { name: "Pride", company: "Peerless", is_client: true, category: "Household Cleaning", skus: ["Dishwashing Liquid"] },
  { name: "Care Plus", company: "Peerless", is_client: true, category: "Personal Care", skus: ["Alcohol", "Hand Sanitizer"] },

  // Del Monte Philippines
  { name: "Del Monte Pineapple", company: "Del Monte", is_client: true, category: "Beverages", skus: ["Juice", "Chunks", "Slices"] },
  { name: "Del Monte Tomato Sauce & Ketchup", company: "Del Monte", is_client: true, category: "Condiments & Sauces", skus: ["Tomato Sauce", "Ketchup"] },
  { name: "Del Monte Spaghetti Sauce", company: "Del Monte", is_client: true, category: "Condiments & Sauces", skus: ["Italian Style", "Sweet Style"] },
  { name: "Del Monte Fruit Cocktail", company: "Del Monte", is_client: true, category: "Canned Goods", skus: ["Standard", "Fiesta"] },
  { name: "Del Monte Pasta", company: "Del Monte", is_client: true, category: "Food & Grocery", skus: ["Spaghetti", "Penne", "Elbow Macaroni"] },
  { name: "S&W (Premium Fruit & Vegetable Products)", company: "Del Monte", is_client: true, category: "Canned Goods", skus: ["Pineapple", "Corn"] },
  { name: "Today's (Budget-Friendly Product Line)", company: "Del Monte", is_client: true, category: "Food & Grocery", skus: ["Fruit Cocktail", "Pasta"] },
  { name: "Fit 'n Right (Juice Drinks)", company: "Del Monte", is_client: true, category: "Beverages", skus: ["Apple", "Pineapple", "Grape"] },

  // Japan Tobacco International (JTI)
  { name: "Winston", company: "JTI", is_client: true, category: "Tobacco Products", skus: ["Red", "Blue", "White"] },
  { name: "Camel", company: "JTI", is_client: true, category: "Tobacco Products", skus: ["Blue", "Filters"] },
  { name: "Mevius", company: "JTI", is_client: true, category: "Tobacco Products", skus: ["Mild Seven", "Lights"] },
  { name: "LD", company: "JTI", is_client: true, category: "Tobacco Products", skus: ["Red", "Blue"] },
  { name: "Mighty", company: "JTI", is_client: true, category: "Tobacco Products", skus: ["Pack"] },
  { name: "Caster", company: "JTI", is_client: true, category: "Tobacco Products", skus: ["Mild", "Super Mild"] },
  { name: "Glamour", company: "JTI", is_client: true, category: "Tobacco Products", skus: ["Super Slims"] }
];

// Competitor Brands (40% of transactions) - Updated categories to match FMCG filter
export const competitorBrands: Brand[] = [
  { name: "Nestlé Bear Brand", company: "Nestlé", is_client: false, category: "Dairy & Milk Products", skus: ["Powdered Milk", "Sterilized", "Ready-to-Drink"] },
  { name: "Nestlé Milo", company: "Nestlé", is_client: false, category: "Beverages", skus: ["Powder", "Ready-to-Drink"] },
  { name: "Nescafé", company: "Nestlé", is_client: false, category: "Beverages", skus: ["Classic", "3in1", "Gold"] },
  { name: "Nestea", company: "Nestlé", is_client: false, category: "Beverages", skus: ["Lemon", "Apple", "Calamansi"] },

  { name: "Surf", company: "Unilever", is_client: false, category: "Household Cleaning", skus: ["Powder Detergent", "Liquid Detergent"] },
  { name: "Sunsilk", company: "Unilever", is_client: false, category: "Personal Care", skus: ["Shampoo", "Conditioner"] },
  { name: "Close-Up", company: "Unilever", is_client: false, category: "Personal Care", skus: ["Red Hot", "Menthol Fresh"] },
  { name: "Lipton", company: "Unilever", is_client: false, category: "Beverages", skus: ["Yellow Label", "Green Tea"] },

  { name: "Tide", company: "P&G", is_client: false, category: "Household Cleaning", skus: ["Bar", "Powder", "Liquid"] },
  { name: "Downy", company: "P&G", is_client: false, category: "Household Cleaning", skus: ["Sunrise Fresh", "Antibac"] },
  { name: "Pantene", company: "P&G", is_client: false, category: "Personal Care", skus: ["Shampoo", "Conditioner"] },
  { name: "Head & Shoulders", company: "P&G", is_client: false, category: "Personal Care", skus: ["Menthol", "Cool Blast"] },

  { name: "Piattos", company: "Jack 'n Jill", is_client: false, category: "Snacks & Confectionery", skus: ["Cheese", "Sour Cream"] },
  { name: "Chippy", company: "Jack 'n Jill", is_client: false, category: "Snacks & Confectionery", skus: ["BBQ", "Chili & Cheese"] },
  { name: "Roller Coaster", company: "Jack 'n Jill", is_client: false, category: "Snacks & Confectionery", skus: ["Cheese", "Barbecue"] },
  { name: "Chiz Curls", company: "Jack 'n Jill", is_client: false, category: "Snacks & Confectionery", skus: ["Cheese"] },

  { name: "San Mig Light", company: "San Miguel", is_client: false, category: "Beverages", skus: ["Bottle", "Can"] },
  { name: "Magnolia Ice Cream", company: "San Miguel", is_client: false, category: "Frozen Foods", skus: ["Vanilla", "Chocolate", "Strawberry"] },
  { name: "Purefoods", company: "San Miguel", is_client: false, category: "Food & Grocery", skus: ["Tender Juicy", "Corned Beef"] },

  { name: "Lactum", company: "Wyeth", is_client: false, category: "Dairy & Milk Products", skus: ["6+", "3+"] },
  { name: "Lucky Me! Pancit Canton", company: "Monde Nissin", is_client: false, category: "Food & Grocery", skus: ["Original", "Chilimansi", "Calamansi"] },
  { name: "Lucky Me! Supreme", company: "Monde Nissin", is_client: false, category: "Food & Grocery", skus: ["Batchoy", "Lomi"] },

  // Additional FMCG competitors
  { name: "Marlboro", company: "Philip Morris", is_client: false, category: "Tobacco Products", skus: ["Red", "Gold", "Ice Blast"] },
  { name: "Philip Morris", company: "Philip Morris", is_client: false, category: "Tobacco Products", skus: ["Blue", "One"] },
  { name: "Hope", company: "JT International", is_client: false, category: "Tobacco Products", skus: ["Luxury", "Menthol"] }
];

// Combined brands array
export const brands: Brand[] = [...tbwaClientBrands, ...competitorBrands];

export const channels = ["Sari-Sari Store"];

// AI Recommendation IDs for tracking
const aiRecommendationIds = [
  "ai_rec_001", "ai_rec_002", "ai_rec_003", "ai_rec_004", "ai_rec_005",
  "ai_rec_006", "ai_rec_007", "ai_rec_008", "ai_rec_009", "ai_rec_010"
];

// Generate sample transactions based on realistic patterns
export const generateMockTransactions = (count: number = 1000): Transaction[] => {
  const transactions: Transaction[] = [];
  const genders = ["Male", "Female"];
  const ageBrackets = ["18-24", "25-34", "35-44", "45-54", "55+"];
  const incomeClasses = ["A", "B", "C1", "C2", "D", "E"];
  const paymentMethods = ["Cash", "GCash", "Utang/Lista"]; // Only these 3 payment methods
  const requestedAs = ["branded", "unbranded", "unsure"] as const;
  const requestTypes = ["verbal", "pointing", "indirect"] as const;

  for (let i = 0; i < count; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const city = region.major_cities[Math.floor(Math.random() * region.major_cities.length)];
    const barangay = region.barangays[Math.floor(Math.random() * region.barangays.length)];
    const locationId = `${region.code}-${city.replace(/\s+/g, '')}-${barangay.replace(/\s+/g, '')}`;
    const channel = "Sari-Sari Store"; // Only Sari-Sari Store channel
    
    // 60% TBWA clients, 40% competitors - matches your specification
    const isClientTransaction = Math.random() < 0.6;
    const availableBrands = isClientTransaction ? tbwaClientBrands : competitorBrands;
    
    // Generate realistic basket (1-4 items)
    const basketSize = Math.random() < 0.4 ? 1 : Math.random() < 0.7 ? 2 : Math.floor(Math.random() * 3) + 3;
    const basket: BasketItem[] = [];
    let total = 0;

    // Track if substitution occurred
    let substitutionFrom: string | undefined;
    let substitutionTo: string | undefined;
    const hasSubstitution = Math.random() < 0.15; // 15% chance of substitution

    for (let j = 0; j < basketSize; j++) {
      const brand = availableBrands[Math.floor(Math.random() * availableBrands.length)];
      const sku = brand.skus[Math.floor(Math.random() * brand.skus.length)];
      const category = brand.category;
      const units = Math.floor(Math.random() * 3) + 1;
      const basePrice = Math.floor(Math.random() * 200) + 20;
      const price = basePrice * units;
      
      // Handle substitution logic
      if (hasSubstitution && j === 0) {
        const allBrands = [...tbwaClientBrands, ...competitorBrands];
        const originalBrand = allBrands[Math.floor(Math.random() * allBrands.length)];
        substitutionFrom = originalBrand.name;
        substitutionTo = brand.name;
      }
      
      basket.push({
        sku: `${brand.name} ${sku}`,
        brand: brand.name,
        category,
        units,
        price
      });
      
      total += price;
    }

    // Generate random date within last 360 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 360));
    const time = `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    
    // Generate transaction duration (30 seconds to 10 minutes)
    const durationSeconds = Math.floor(Math.random() * 570) + 30;
    
    // Generate behavioral fields
    const requestedAsValue = requestedAs[Math.floor(Math.random() * requestedAs.length)];
    const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
    const storekeperSuggested = Math.random() < 0.3; // 30% chance of suggestion
    const acceptedSuggestion = storekeperSuggested ? Math.random() < 0.7 : false; // 70% acceptance rate
    const hasAiRecommendation = Math.random() < 0.2; // 20% chance of AI recommendation
    const aiRecommendationId = hasAiRecommendation ? 
      aiRecommendationIds[Math.floor(Math.random() * aiRecommendationIds.length)] : undefined;

    transactions.push({
      id: `T${(i + 1).toString().padStart(5, '0')}`,
      date: date.toISOString().split('T')[0],
      time,
      duration_seconds: durationSeconds,
      region: region.name,
      city,
      barangay,
      location_id: locationId,
      channel,
      basket,
      total,
      consumer_profile: {
        gender: genders[Math.floor(Math.random() * genders.length)],
        age_bracket: ageBrackets[Math.floor(Math.random() * ageBrackets.length)],
        inferred_income: incomeClasses[Math.floor(Math.random() * incomeClasses.length)],
        payment: paymentMethods[Math.floor(Math.random() * paymentMethods.length)] // Only Cash, GCash, Utang/Lista
      },
      substitution_from: substitutionFrom,
      substitution_to: substitutionTo,
      requested_as: requestedAsValue,
      request_type: requestType,
      storeowner_suggested: storekeperSuggested,
      accepted_suggestion: acceptedSuggestion,
      ai_recommendation_id: aiRecommendationId
    });
  }

  return transactions;
};

// Pre-generate sample data with 5000 transactions
export const mockTransactions = generateMockTransactions(5000);

// Helper functions for analytics
export const getRegionalData = () => {
  const regionalStats = regions.map(region => {
    const regionTransactions = mockTransactions.filter(t => t.region === region.name);
    const revenue = regionTransactions.reduce((sum, t) => sum + t.total, 0);
    const transactions = regionTransactions.length;
    const growth = (Math.random() * 20 - 5); // -5% to +15% growth
    
    return {
      region: region.name,
      revenue: `₱${(revenue / 1000000).toFixed(1)}M`,
      transactions: transactions.toLocaleString(),
      growth: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`,
      marketShare: `${(region.weight * 100).toFixed(1)}%`
    };
  });
  
  return regionalStats.sort((a, b) => parseFloat(b.revenue.replace(/[₱M]/g, '')) - parseFloat(a.revenue.replace(/[₱M]/g, '')));
};

export const getTopBrands = () => {
  return tbwaClientBrands.map(brand => ({
    name: brand.name,
    revenue: Math.floor(Math.random() * 5000000) + 1000000,
    transactions: Math.floor(Math.random() * 50000) + 10000,
    growth: Math.floor(Math.random() * 30) - 5
  }));
};

export const getCategoryMix = () => {
  const allCategories = [...new Set(brands.map(b => b.category))];
  return allCategories.map(category => ({
    category,
    count: Math.floor(Math.random() * 100) + 20,
    percentage: Math.floor(Math.random() * 25) + 5
  }));
};

// New analytics functions for behavioral insights
export const getSubstitutionPatterns = () => {
  const substitutions = mockTransactions
    .filter(t => t.substitution_from && t.substitution_to)
    .reduce((acc: Record<string, { to: string; count: number }[]>, t) => {
      const key = t.substitution_from!;
      if (!acc[key]) acc[key] = [];
      
      const existing = acc[key].find(s => s.to === t.substitution_to);
      if (existing) {
        existing.count++;
      } else {
        acc[key].push({ to: t.substitution_to!, count: 1 });
      }
      
      return acc;
    }, {});

  return Object.entries(substitutions).map(([from, patterns]) => ({
    from,
    patterns: patterns.sort((a, b) => b.count - a.count)
  }));
};

export const getRequestTypeAnalytics = () => {
  const requestStats = mockTransactions.reduce((acc, t) => {
    acc[t.requested_as] = (acc[t.requested_as] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(requestStats).map(([type, count]) => ({
    type,
    count,
    percentage: (count / mockTransactions.length) * 100
  }));
};

export const getStorekeeperInfluence = () => {
  const totalSuggestions = mockTransactions.filter(t => t.storeowner_suggested).length;
  const acceptedSuggestions = mockTransactions.filter(t => t.storeowner_suggested && t.accepted_suggestion).length;
  
  return {
    totalSuggestions,
    acceptedSuggestions,
    acceptanceRate: totalSuggestions > 0 ? (acceptedSuggestions / totalSuggestions) * 100 : 0
  };
};
