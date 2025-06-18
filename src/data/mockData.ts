
// Comprehensive mock data based on TBWA client brands and Philippine market structure

export interface Region {
  code: string;
  name: string;
  weight: number;
  major_cities: string[];
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
  region: string;
  city: string;
  channel: string;
  basket: BasketItem[];
  total: number;
  consumer_profile: ConsumerProfile;
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

export const regions: Region[] = [
  { code: "NCR", name: "National Capital Region", weight: 0.23, major_cities: ["Quezon City", "Manila", "Caloocan", "Makati", "Taguig"] },
  { code: "I", name: "Ilocos Region", weight: 0.03, major_cities: ["Laoag", "Vigan"] },
  { code: "II", name: "Cagayan Valley", weight: 0.035, major_cities: ["Tuguegarao", "Cauayan"] },
  { code: "III", name: "Central Luzon", weight: 0.12, major_cities: ["San Fernando", "Angeles", "Balanga", "Cabanatuan"] },
  { code: "IV-A", name: "CALABARZON", weight: 0.16, major_cities: ["Calamba", "Antipolo", "Dasmariñas", "Lucena"] },
  { code: "IV-B", name: "MIMAROPA", weight: 0.03, major_cities: ["Puerto Princesa", "Calapan"] },
  { code: "V", name: "Bicol Region", weight: 0.04, major_cities: ["Legazpi", "Naga"] },
  { code: "VI", name: "Western Visayas", weight: 0.06, major_cities: ["Iloilo", "Bacolod"] },
  { code: "VII", name: "Central Visayas", weight: 0.07, major_cities: ["Cebu City", "Tagbilaran"] },
  { code: "VIII", name: "Eastern Visayas", weight: 0.03, major_cities: ["Tacloban", "Ormoc"] },
  { code: "IX", name: "Zamboanga Peninsula", weight: 0.025, major_cities: ["Zamboanga City", "Dipolog"] },
  { code: "X", name: "Northern Mindanao", weight: 0.035, major_cities: ["Cagayan de Oro", "Iligan"] },
  { code: "XI", name: "Davao Region", weight: 0.05, major_cities: ["Davao City", "Tagum"] },
  { code: "XII", name: "SOCCSKSARGEN", weight: 0.025, major_cities: ["General Santos", "Koronadal"] },
  { code: "XIII", name: "Caraga", weight: 0.015, major_cities: ["Butuan"] },
  { code: "CAR", name: "Cordillera Administrative Region", weight: 0.02, major_cities: ["Baguio", "Tabuk"] },
  { code: "BARMM", name: "Bangsamoro Autonomous Region", weight: 0.015, major_cities: ["Marawi", "Cotabato City"] }
];

// TBWA Client Brands (60% of transactions)
export const tbwaClientBrands: Brand[] = [
  {
    name: "Alaska Milk Corporation",
    is_client: true,
    categories: ["Dairy"],
    skus: ["Alaska Evaporated Milk", "Alaska Condensed Milk", "Alaska Powdered Milk", "Krem-Top Coffee Creamer", "Alpine Evaporated Milk", "Alpine Condensed Milk", "Cow Bell Powdered Milk"]
  },
  {
    name: "Oishi",
    is_client: true,
    categories: ["Snacks", "Beverages"],
    skus: ["Oishi Prawn Crackers", "Oishi Pillows", "Oishi Marty's", "Oishi Ridges", "Oishi Bread Pan", "Gourmet Picks", "Crispy Patata", "Smart C+ Vitamin Drinks", "Oaties", "Hi-Ho", "Rinbee", "Deli Mex"]
  },
  {
    name: "Champion",
    is_client: true,
    categories: ["Home Care", "Personal Care"],
    skus: ["Champion Detergent", "Champion Fabric Conditioner", "Calla Personal Care", "Hana Shampoo", "Hana Conditioner", "Cyclone Bleach", "Pride Dishwashing Liquid", "Care Plus Alcohol", "Care Plus Hand Sanitizer"]
  },
  {
    name: "Del Monte",
    is_client: true,
    categories: ["Food & Beverages"],
    skus: ["Del Monte Pineapple Juice", "Del Monte Pineapple Chunks", "Del Monte Pineapple Slices", "Del Monte Tomato Sauce", "Del Monte Ketchup", "Del Monte Spaghetti Sauce", "Del Monte Fruit Cocktail", "Del Monte Pasta", "S&W Premium Fruit", "Today's Budget Line", "Fit 'n Right Juice Drinks"]
  },
  {
    name: "Winston",
    is_client: true,
    categories: ["Tobacco"],
    skus: ["Winston Red", "Winston Blue", "Camel", "Mevius", "LD", "Mighty", "Caster", "Glamour"]
  }
];

// Competitor Brands (40% of transactions)
export const competitorBrands: Brand[] = [
  {
    name: "Nestlé",
    is_client: false,
    categories: ["Dairy", "Food & Beverages"],
    skus: ["Bear Brand Milk", "Nestlé Condensed Milk", "Nescafé Coffee", "Maggi Noodles", "KitKat", "Milo"]
  },
  {
    name: "Unilever",
    is_client: false,
    categories: ["Personal Care", "Home Care"],
    skus: ["Surf Detergent", "Dove Soap", "Clear Shampoo", "Cream Silk", "Cif Cleaner", "Sunsilk"]
  },
  {
    name: "Procter & Gamble",
    is_client: false,
    categories: ["Personal Care", "Home Care"],
    skus: ["Head & Shoulders", "Pantene", "Tide Detergent", "Ariel", "Safeguard Soap", "Oral-B"]
  },
  {
    name: "Jack 'n Jill",
    is_client: false,
    categories: ["Snacks"],
    skus: ["Piattos", "Nova", "Chippy", "Roller Coaster", "Chiz Curls", "Cream-O"]
  },
  {
    name: "Universal Robina",
    is_client: false,
    categories: ["Snacks", "Food & Beverages"],
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
    categories: ["Personal Care"],
    skus: ["Colgate Toothpaste", "Palmolive Soap", "Mennen", "Softlan"]
  }
];

// Combined brands array
export const brands: Brand[] = [...tbwaClientBrands, ...competitorBrands];

export const channels = ["Sari-Sari Store"];

// Generate sample transactions based on realistic patterns
export const generateMockTransactions = (count: number = 1000): Transaction[] => {
  const transactions: Transaction[] = [];
  const genders = ["Male", "Female"];
  const ageBrackets = ["18-24", "25-34", "35-44", "45-54", "55+"];
  const incomeClasses = ["A", "B", "C1", "C2", "D", "E"];
  const paymentMethods = ["Cash", "GCash", "Credit Card", "Debit Card"];

  for (let i = 0; i < count; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const city = region.major_cities[Math.floor(Math.random() * region.major_cities.length)];
    const channel = "Sari-Sari Store";
    
    // 60% TBWA clients, 40% competitors
    const isClientTransaction = Math.random() < 0.6;
    const availableBrands = isClientTransaction ? tbwaClientBrands : competitorBrands;
    
    // Generate realistic basket (1-4 items)
    const basketSize = Math.random() < 0.4 ? 1 : Math.random() < 0.7 ? 2 : Math.floor(Math.random() * 3) + 3;
    const basket: BasketItem[] = [];
    let total = 0;

    for (let j = 0; j < basketSize; j++) {
      const brand = availableBrands[Math.floor(Math.random() * availableBrands.length)];
      const sku = brand.skus[Math.floor(Math.random() * brand.skus.length)];
      const category = brand.categories[Math.floor(Math.random() * brand.categories.length)];
      const units = Math.floor(Math.random() * 3) + 1;
      const basePrice = Math.floor(Math.random() * 200) + 20;
      const price = basePrice * units;
      
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

    transactions.push({
      id: `T${(i + 1).toString().padStart(5, '0')}`,
      date: date.toISOString().split('T')[0],
      time,
      region: region.name,
      city,
      channel,
      basket,
      total,
      consumer_profile: {
        gender: genders[Math.floor(Math.random() * genders.length)],
        age_bracket: ageBrackets[Math.floor(Math.random() * ageBrackets.length)],
        inferred_income: incomeClasses[Math.floor(Math.random() * incomeClasses.length)],
        payment: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      }
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
