// Comprehensive mock data based on TBWA client brands and Philippine market structure

export interface Region {
  code: string;
  name: string;
  weight: number;
  major_cities: string[];
  barangays: string[];
}

export interface Brand {
  name: string;
  is_client: boolean;
  categories: string[];
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

// TBWA Client Brands (60% of transactions) - updated categories
export const tbwaClientBrands: Brand[] = [
  {
    name: "Alaska Milk Corporation",
    is_client: true,
    categories: ["Groceries"],
    skus: ["Alaska Evaporated Milk", "Alaska Condensed Milk", "Alaska Powdered Milk", "Krem-Top Coffee Creamer", "Alpine Evaporated Milk", "Alpine Condensed Milk", "Cow Bell Powdered Milk"]
  },
  {
    name: "Oishi",
    is_client: true,
    categories: ["Groceries"],
    skus: ["Oishi Prawn Crackers", "Oishi Pillows", "Oishi Marty's", "Oishi Ridges", "Oishi Bread Pan", "Gourmet Picks", "Crispy Patata", "Smart C+ Vitamin Drinks", "Oaties", "Hi-Ho", "Rinbee", "Deli Mex"]
  },
  {
    name: "Champion",
    is_client: true,
    categories: ["Health & Beauty"],
    skus: ["Champion Detergent", "Champion Fabric Conditioner", "Calla Personal Care", "Hana Shampoo", "Hana Conditioner", "Cyclone Bleach", "Pride Dishwashing Liquid", "Care Plus Alcohol", "Care Plus Hand Sanitizer"]
  },
  {
    name: "Del Monte",
    is_client: true,
    categories: ["Groceries"],
    skus: ["Del Monte Pineapple Juice", "Del Monte Pineapple Chunks", "Del Monte Pineapple Slices", "Del Monte Tomato Sauce", "Del Monte Ketchup", "Del Monte Spaghetti Sauce", "Del Monte Fruit Cocktail", "Del Monte Pasta", "S&W Premium Fruit", "Today's Budget Line", "Fit 'n Right Juice Drinks"]
  },
  {
    name: "Winston",
    is_client: true,
    categories: ["Tobacco"],
    skus: ["Winston Red", "Winston Blue", "Camel", "Mevius", "LD", "Mighty", "Caster", "Glamour"]
  }
];

// Competitor Brands (40% of transactions) - updated categories
export const competitorBrands: Brand[] = [
  {
    name: "Nestlé",
    is_client: false,
    categories: ["Groceries"],
    skus: ["Bear Brand Milk", "Nestlé Condensed Milk", "Nescafé Coffee", "Maggi Noodles", "KitKat", "Milo"]
  },
  {
    name: "Unilever",
    is_client: false,
    categories: ["Health & Beauty"],
    skus: ["Surf Detergent", "Dove Soap", "Clear Shampoo", "Cream Silk", "Cif Cleaner", "Sunsilk"]
  },
  {
    name: "Procter & Gamble",
    is_client: false,
    categories: ["Health & Beauty"],
    skus: ["Head & Shoulders", "Pantene", "Tide Detergent", "Ariel", "Safeguard Soap", "Oral-B"]
  },
  {
    name: "Jack 'n Jill",
    is_client: false,
    categories: ["Groceries"],
    skus: ["Piattos", "Nova", "Chippy", "Roller Coaster", "Chiz Curls", "Cream-O"]
  },
  {
    name: "Universal Robina",
    is_client: false,
    categories: ["Groceries"],
    skus: ["Ricoa Chocolate", "C2 Green Tea", "Great Taste Coffee", "Payless Noodles", "SkyFlakes"]
  },
  {
    name: "Philip Morris",
    is_client: false,
    categories: ["Tobacco"],
    skus: ["Marlboro", "Parliament", "L&M", "Chesterfield"]
  },
  {
    name: "Colgate-Palmolive",
    is_client: false,
    categories: ["Health & Beauty"],
    skus: ["Colgate Toothpaste", "Palmolive Soap", "Mennen", "Softlan"]
  }
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
  const paymentMethods = ["Cash", "GCash", "Credit Card", "Debit Card"];
  const requestedAs = ["branded", "unbranded", "unsure"] as const;
  const requestTypes = ["verbal", "pointing", "indirect"] as const;

  for (let i = 0; i < count; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const city = region.major_cities[Math.floor(Math.random() * region.major_cities.length)];
    const barangay = region.barangays[Math.floor(Math.random() * region.barangays.length)];
    const locationId = `${region.code}-${city.replace(/\s+/g, '')}-${barangay.replace(/\s+/g, '')}`;
    const channel = "Sari-Sari Store";
    
    // 60% TBWA clients, 40% competitors
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
      const category = brand.categories[Math.floor(Math.random() * brand.categories.length)];
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
        sku,
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
        payment: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
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

// Pre-generate sample data
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
  const allCategories = [...new Set(brands.flatMap(b => b.categories))];
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
