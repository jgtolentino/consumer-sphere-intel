import { writeFileSync } from "fs";

// --- FULL TBWA Client Brands & SKUs (Agency-Grade) ---
const clientBrands = [
  // Alaska Milk Corporation
  { brand: "Alaska Evaporated Milk", company: "Alaska Milk Corporation", category: "Dairy", skus: ["Original", "Full Cream", "Low Fat"] },
  { brand: "Alaska Condensed Milk", company: "Alaska Milk Corporation", category: "Dairy", skus: ["Original", "Sweetened"] },
  { brand: "Alaska Powdered Milk", company: "Alaska Milk Corporation", category: "Dairy", skus: ["Small Pack", "Family Pack"] },
  { brand: "Krem-Top (Coffee Creamer)", company: "Alaska Milk Corporation", category: "Dairy", skus: ["Regular", "Sugar-Free"] },
  { brand: "Alpine (Evaporated & Condensed Milk)", company: "Alaska Milk Corporation", category: "Dairy", skus: ["Evaporated", "Condensed"] },
  { brand: "Cow Bell (Powdered Milk)", company: "Alaska Milk Corporation", category: "Dairy", skus: ["Small Pack", "Large Pack"] },

  // Oishi (Liwayway Marketing Corporation)
  { brand: "Oishi Prawn Crackers", company: "Oishi", category: "Snacks", skus: ["Original", "Spicy"] },
  { brand: "Oishi Pillows", company: "Oishi", category: "Snacks", skus: ["Chocolate", "Milk"] },
  { brand: "Oishi Marty's", company: "Oishi", category: "Snacks", skus: ["Baconette Strips", "Vegetarian Chicharon"] },
  { brand: "Oishi Ridges", company: "Oishi", category: "Snacks", skus: ["Cheese", "Sour Cream"] },
  { brand: "Oishi Bread Pan", company: "Oishi", category: "Snacks", skus: ["Garlic", "Cheese"] },
  { brand: "Gourmet Picks", company: "Oishi", category: "Snacks", skus: ["Truffle", "Sour Cream"] },
  { brand: "Crispy Patata", company: "Oishi", category: "Snacks", skus: ["Classic", "Barbecue"] },
  { brand: "Smart C+ (Vitamin Drinks)", company: "Oishi", category: "Beverages", skus: ["Lemon", "Orange", "Pomelo"] },
  { brand: "Oaties", company: "Oishi", category: "Snacks", skus: ["Milk", "Chocolate"] },
  { brand: "Hi-Ho", company: "Oishi", category: "Snacks", skus: ["Original"] },
  { brand: "Rinbee", company: "Oishi", category: "Snacks", skus: ["Cheese", "Sweet Corn"] },
  { brand: "Deli Mex", company: "Oishi", category: "Snacks", skus: ["Sour Cream", "Barbecue"] },

  // Peerless Products Manufacturing Corporation
  { brand: "Champion", company: "Peerless", category: "Home Care", skus: ["Detergent", "Fabric Conditioner"] },
  { brand: "Calla", company: "Peerless", category: "Personal Care", skus: ["Shampoo", "Body Wash"] },
  { brand: "Hana", company: "Peerless", category: "Personal Care", skus: ["Shampoo", "Conditioner"] },
  { brand: "Cyclone", company: "Peerless", category: "Home Care", skus: ["Bleach"] },
  { brand: "Pride", company: "Peerless", category: "Home Care", skus: ["Dishwashing Liquid"] },
  { brand: "Care Plus", company: "Peerless", category: "Personal Care", skus: ["Alcohol", "Hand Sanitizer"] },

  // Del Monte Philippines
  { brand: "Del Monte Pineapple", company: "Del Monte", category: "Beverages", skus: ["Juice", "Chunks", "Slices"] },
  { brand: "Del Monte Tomato Sauce & Ketchup", company: "Del Monte", category: "Condiments", skus: ["Tomato Sauce", "Ketchup"] },
  { brand: "Del Monte Spaghetti Sauce", company: "Del Monte", category: "Condiments", skus: ["Italian Style", "Sweet Style"] },
  { brand: "Del Monte Fruit Cocktail", company: "Del Monte", category: "Canned Fruit", skus: ["Standard", "Fiesta"] },
  { brand: "Del Monte Pasta", company: "Del Monte", category: "Pasta", skus: ["Spaghetti", "Penne", "Elbow Macaroni"] },
  { brand: "S&W (Premium Fruit & Vegetable Products)", company: "Del Monte", category: "Premium Produce", skus: ["Pineapple", "Corn"] },
  { brand: "Today's (Budget-Friendly Product Line)", company: "Del Monte", category: "Budget", skus: ["Fruit Cocktail", "Pasta"] },
  { brand: "Fit 'n Right (Juice Drinks)", company: "Del Monte", category: "Beverages", skus: ["Apple", "Pineapple", "Grape"] },

  // Japan Tobacco International (JTI)
  { brand: "Winston", company: "JTI", category: "Tobacco", skus: ["Red", "Blue", "White"] },
  { brand: "Camel", company: "JTI", category: "Tobacco", skus: ["Blue", "Filters"] },
  { brand: "Mevius", company: "JTI", category: "Tobacco", skus: ["Mild Seven", "Lights"] },
  { brand: "LD", company: "JTI", category: "Tobacco", skus: ["Red", "Blue"] },
  { brand: "Mighty", company: "JTI", category: "Tobacco", skus: ["Pack"] },
  { brand: "Caster", company: "JTI", category: "Tobacco", skus: ["Mild", "Super Mild"] },
  { brand: "Glamour", company: "JTI", category: "Tobacco", skus: ["Super Slims"] },
];

// --- Major FMCG Competitor Brands (expand as needed) ---
const competitorBrands = [
  { brand: "Nestlé Bear Brand", company: "Nestlé", category: "Dairy", skus: ["Powdered Milk", "Sterilized", "Ready-to-Drink"] },
  { brand: "Nestlé Milo", company: "Nestlé", category: "Beverages", skus: ["Powder", "Ready-to-Drink"] },
  { brand: "Nescafé", company: "Nestlé", category: "Beverages", skus: ["Classic", "3in1", "Gold"] },
  { brand: "Nestea", company: "Nestlé", category: "Beverages", skus: ["Lemon", "Apple", "Calamansi"] },
  { brand: "Surf", company: "Unilever", category: "Home Care", skus: ["Powder Detergent", "Liquid Detergent"] },
  { brand: "Sunsilk", company: "Unilever", category: "Personal Care", skus: ["Shampoo", "Conditioner"] },
  { brand: "Close-Up", company: "Unilever", category: "Personal Care", skus: ["Red Hot", "Menthol Fresh"] },
  { brand: "Lipton", company: "Unilever", category: "Beverages", skus: ["Yellow Label", "Green Tea"] },
  { brand: "Tide", company: "P&G", category: "Home Care", skus: ["Bar", "Powder", "Liquid"] },
  { brand: "Downy", company: "P&G", category: "Home Care", skus: ["Sunrise Fresh", "Antibac"] },
  { brand: "Pantene", company: "P&G", category: "Personal Care", skus: ["Shampoo", "Conditioner"] },
  { brand: "Head & Shoulders", company: "P&G", category: "Personal Care", skus: ["Menthol", "Cool Blast"] },
  { brand: "Piattos", company: "Jack 'n Jill", category: "Snacks", skus: ["Cheese", "Sour Cream"] },
  { brand: "Chippy", company: "Jack 'n Jill", category: "Snacks", skus: ["BBQ", "Chili & Cheese"] },
  { brand: "Roller Coaster", company: "Jack 'n Jill", category: "Snacks", skus: ["Cheese", "Barbecue"] },
  { brand: "Chiz Curls", company: "Jack 'n Jill", category: "Snacks", skus: ["Cheese"] },
  { brand: "San Mig Light", company: "San Miguel", category: "Beverages", skus: ["Bottle", "Can"] },
  { brand: "Magnolia", company: "San Miguel", category: "Dairy", skus: ["Ice Cream", "Butter", "Cheese"] },
  { brand: "Purefoods", company: "San Miguel", category: "Food", skus: ["Tender Juicy", "Corned Beef"] },
  { brand: "Lactum", company: "Wyeth", category: "Dairy", skus: ["6+", "3+"] },
  { brand: "Lucky Me! Pancit Canton", company: "Monde Nissin", category: "Food", skus: ["Original", "Chilimansi", "Calamansi"] },
  { brand: "Lucky Me! Supreme", company: "Monde Nissin", category: "Food", skus: ["Batchoy", "Lomi"] },
];

// --- Philippine Regions: 17, population-weighted, key cities ---
const regions = [
  { code: "NCR", name: "National Capital Region", weight: 0.23, cities: ["Manila", "Quezon City", "Caloocan"] },
  { code: "I", name: "Ilocos Region", weight: 0.04, cities: ["Laoag", "Vigan"] },
  { code: "II", name: "Cagayan Valley", weight: 0.05, cities: ["Tuguegarao", "Cauayan"] },
  { code: "III", name: "Central Luzon", weight: 0.12, cities: ["Angeles", "Olongapo"] },
  { code: "IV-A", name: "CALABARZON", weight: 0.15, cities: ["Calamba", "Antipolo"] },
  { code: "IV-B", name: "MIMAROPA", weight: 0.03, cities: ["Puerto Princesa", "Calapan"] },
  { code: "V", name: "Bicol Region", weight: 0.06, cities: ["Legazpi", "Naga"] },
  { code: "VI", name: "Western Visayas", weight: 0.07, cities: ["Iloilo", "Bacolod"] },
  { code: "VII", name: "Central Visayas", weight: 0.06, cities: ["Cebu City", "Tagbilaran"] },
  { code: "VIII", name: "Eastern Visayas", weight: 0.03, cities: ["Tacloban", "Ormoc"] },
  { code: "IX", name: "Zamboanga Peninsula", weight: 0.03, cities: ["Zamboanga City", "Dipolog"] },
  { code: "X", name: "Northern Mindanao", weight: 0.03, cities: ["Cagayan de Oro", "Iligan"] },
  { code: "XI", name: "Davao Region", weight: 0.05, cities: ["Davao City", "Tagum"] },
  { code: "XII", name: "SOCCSKSARGEN", weight: 0.03, cities: ["General Santos", "Koronadal"] },
  { code: "XIII", name: "Caraga", weight: 0.02, cities: ["Butuan", "Surigao"] },
  { code: "BARMM", name: "Bangsamoro", weight: 0.02, cities: ["Cotabato City"] },
  { code: "CAR", name: "Cordillera", weight: 0.02, cities: ["Baguio"] },
];

// --- Random helpers ---
function weightedRandomRegion() {
  let r = Math.random();
  let acc = 0;
  for (const region of regions) {
    acc += region.weight;
    if (r <= acc) return region;
  }
  return regions[regions.length - 1];
}
function randomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDateInPastDays(days) {
  const now = new Date();
  const d = new Date(now.getTime() - Math.random() * days * 24 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
}
function randomTime() {
  const h = Math.floor(Math.random() * 24).toString().padStart(2, "0");
  const m = Math.floor(Math.random() * 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Main Transaction Generation ---
const NUM_TRANSACTIONS = 5000, DAYS = 360;
const transactions = [];
const ageBrackets = ["18-24", "25-34", "35-44", "45-54", "55+"];
const incomeClasses = ["A", "B", "C1", "C2", "D", "E"];
const payments = ["Cash", "GCash", "Utang/Lista"];

for (let i = 0; i < NUM_TRANSACTIONS; i++) {
  const region = weightedRandomRegion();
  const city = randomElement(region.cities);
  const barangay = `Barangay ${randomInt(1, 30)}`;
  const isClient = Math.random() < 0.6;
  const brandSet = isClient ? clientBrands : competitorBrands;
  const brandObj = brandSet[randomInt(0, brandSet.length - 1)];
  const sku = randomElement(brandObj.skus);

  // Basket
  const basket = [];
  const basketSize = randomInt(1, 4);
  for (let j = 0; j < basketSize; j++) {
    const pickSet = Math.random() < 0.6 ? clientBrands : competitorBrands;
    const pickBrand = pickSet[randomInt(0, pickSet.length - 1)];
    basket.push({
      company: pickBrand.company,
      brand: pickBrand.brand,
      sku: randomElement(pickBrand.skus),
      category: pickBrand.category,
      units: randomInt(1, 3),
      price: randomInt(20, 220),
    });
  }

  transactions.push({
    id: `T${(i + 1).toString().padStart(5, "0")}`,
    date: randomDateInPastDays(DAYS),
    time: randomTime(),
    region: region.name,
    city,
    barangay,
    channel: "Sari-Sari Store",
    basket,
    total: basket.reduce((sum, item) => sum + item.price, 0),
    consumer_profile: {
      gender: Math.random() < 0.5 ? "Male" : "Female",
      age_bracket: randomElement(ageBrackets),
      inferred_income: randomElement(incomeClasses),
      payment: randomElement(payments),
    },
  });
}

// --- Output to File (JSON or TS module) ---
writeFileSync("mockTransactions.json", JSON.stringify(transactions, null, 2));
console.log(`Generated ${transactions.length} transactions to mockTransactions.json`);