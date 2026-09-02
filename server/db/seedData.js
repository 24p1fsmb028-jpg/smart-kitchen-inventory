// Seed data with categories, items (with low, out, and in stock examples), and initial settings

export const initialCategories = [
  {
    id: "cat-produce",
    name: "Produce",
    icon: "Apple",
    color: "emerald",
    order_index: 0
  },
  {
    id: "cat-dairy",
    name: "Dairy & Refrigerated",
    icon: "Milk",
    color: "blue",
    order_index: 1
  },
  {
    id: "cat-meat",
    name: "Meat & Seafood",
    icon: "Beef",
    color: "rose",
    order_index: 2
  },
  {
    id: "cat-bakery",
    name: "Bakery & Grains",
    icon: "Wheat",
    color: "amber",
    order_index: 3
  },
  {
    id: "cat-canned",
    name: "Canned & Pantry",
    icon: "Package",
    color: "violet",
    order_index: 4
  },
  {
    id: "cat-beverages",
    name: "Beverages & Snacks",
    icon: "Coffee",
    color: "orange",
    order_index: 5
  }
];

export const initialItems = [
  // Produce
  {
    id: "item-prod-1",
    name: "Honeycrisp Apples",
    category_id: "cat-produce",
    unit: "kg",
    current_quantity: 2.5,
    weekly_usage: 1.5,
    low_stock_threshold: 1.0,
    status: "in_stock",
    icon: "Apple",
    notes: "Organic crisp apples for snacks and baking"
  },
  {
    id: "item-prod-2",
    name: "Baby Spinach",
    category_id: "cat-produce",
    unit: "packs",
    current_quantity: 0.5,
    weekly_usage: 2.0,
    low_stock_threshold: 1.0,
    status: "low",
    icon: "Salad",
    notes: "Half a pack left, need for salads"
  },
  {
    id: "item-prod-3",
    name: "Ripe Bananas",
    category_id: "cat-produce",
    unit: "pieces",
    current_quantity: 0,
    weekly_usage: 7.0,
    low_stock_threshold: 3.0,
    status: "out_of_stock",
    icon: "Banana",
    notes: "Completely finished yesterday"
  },
  {
    id: "item-prod-4",
    name: "Roma Tomatoes",
    category_id: "cat-produce",
    unit: "kg",
    current_quantity: 1.8,
    weekly_usage: 1.2,
    low_stock_threshold: 0.8,
    status: "in_stock",
    icon: "Citrus",
    notes: "Great for pasta sauces and fresh salsa"
  },
  {
    id: "item-prod-5",
    name: "Yellow Onions",
    category_id: "cat-produce",
    unit: "kg",
    current_quantity: 0.4,
    weekly_usage: 1.5,
    low_stock_threshold: 1.0,
    status: "low",
    icon: "Egg",
    notes: "Running low on cooking aromatics"
  },
  {
    id: "item-prod-6",
    name: "Garlic Bulbs",
    category_id: "cat-produce",
    unit: "pieces",
    current_quantity: 4,
    weekly_usage: 2.0,
    low_stock_threshold: 2.0,
    status: "in_stock",
    icon: "Sparkles",
    notes: "4 whole heads in dry pantry"
  },

  // Dairy & Refrigerated
  {
    id: "item-dairy-1",
    name: "Whole Organic Milk",
    category_id: "cat-dairy",
    unit: "litres",
    current_quantity: 0.6,
    weekly_usage: 3.0,
    low_stock_threshold: 1.0,
    status: "low",
    icon: "Milk",
    notes: "Only 600ml remaining"
  },
  {
    id: "item-dairy-2",
    name: "Greek Yogurt (Plain)",
    category_id: "cat-dairy",
    unit: "kg",
    current_quantity: 1.0,
    weekly_usage: 0.8,
    low_stock_threshold: 0.4,
    status: "in_stock",
    icon: "CupSoda",
    notes: "High protein breakfast staple"
  },
  {
    id: "item-dairy-3",
    name: "Large Farm Eggs",
    category_id: "cat-dairy",
    unit: "pieces",
    current_quantity: 0,
    weekly_usage: 12.0,
    low_stock_threshold: 4.0,
    status: "out_of_stock",
    icon: "Egg",
    notes: "Out of eggs! Urgent for breakfast"
  },
  {
    id: "item-dairy-4",
    name: "Unsalted Butter",
    category_id: "cat-dairy",
    unit: "packs",
    current_quantity: 2.0,
    weekly_usage: 0.5,
    low_stock_threshold: 1.0,
    status: "in_stock",
    icon: "Cookie",
    notes: "Grass-fed butter sticks"
  },
  {
    id: "item-dairy-5",
    name: "Sharp Cheddar Block",
    category_id: "cat-dairy",
    unit: "grams",
    current_quantity: 150,
    weekly_usage: 400,
    low_stock_threshold: 200,
    status: "low",
    icon: "Pizza",
    notes: "Only a small wedge left"
  },

  // Meat & Seafood
  {
    id: "item-meat-1",
    name: "Chicken Breasts",
    category_id: "cat-meat",
    unit: "kg",
    current_quantity: 2.2,
    weekly_usage: 1.8,
    low_stock_threshold: 1.0,
    status: "in_stock",
    icon: "Beef",
    notes: "In freezer zip-lock packs"
  },
  {
    id: "item-meat-2",
    name: "Atlantic Salmon Fillets",
    category_id: "cat-meat",
    unit: "pieces",
    current_quantity: 0,
    weekly_usage: 4.0,
    low_stock_threshold: 2.0,
    status: "out_of_stock",
    icon: "Fish",
    notes: "Need for Thursday dinner"
  },
  {
    id: "item-meat-3",
    name: "Lean Ground Beef (90/10)",
    category_id: "cat-meat",
    unit: "kg",
    current_quantity: 0.5,
    weekly_usage: 1.5,
    low_stock_threshold: 1.0,
    status: "low",
    icon: "Beef",
    notes: "Defrosting single small pack"
  },
  {
    id: "item-meat-4",
    name: "Organic Firm Tofu",
    category_id: "cat-meat",
    unit: "packs",
    current_quantity: 3,
    weekly_usage: 1.5,
    low_stock_threshold: 1.0,
    status: "in_stock",
    icon: "Layers",
    notes: "Plant-based protein backup"
  },

  // Bakery & Grains
  {
    id: "item-bakery-1",
    name: "Artisan Sourdough Loaf",
    category_id: "cat-bakery",
    unit: "loaves",
    current_quantity: 0.3,
    weekly_usage: 1.5,
    low_stock_threshold: 0.5,
    status: "low",
    icon: "Wheat",
    notes: "Last few slices in breadbox"
  },
  {
    id: "item-bakery-2",
    name: "Organic Brown Rice",
    category_id: "cat-bakery",
    unit: "kg",
    current_quantity: 4.0,
    weekly_usage: 1.0,
    low_stock_threshold: 1.5,
    status: "in_stock",
    icon: "Wheat",
    notes: "Large airtight container"
  },
  {
    id: "item-bakery-3",
    name: "Rolled Oats",
    category_id: "cat-bakery",
    unit: "kg",
    current_quantity: 1.8,
    weekly_usage: 0.8,
    low_stock_threshold: 0.6,
    status: "in_stock",
    icon: "Cookie",
    notes: "For morning oatmeal & baking"
  },
  {
    id: "item-bakery-4",
    name: "Penne Rigate Pasta",
    category_id: "cat-bakery",
    unit: "packs",
    current_quantity: 0,
    weekly_usage: 2.0,
    low_stock_threshold: 1.0,
    status: "out_of_stock",
    icon: "Utensils",
    notes: "Used up for last night's dinner"
  },

  // Canned & Pantry
  {
    id: "item-can-1",
    name: "Extra Virgin Olive Oil",
    category_id: "cat-canned",
    unit: "litres",
    current_quantity: 0.2,
    weekly_usage: 0.5,
    low_stock_threshold: 0.3,
    status: "low",
    icon: "Droplet",
    notes: "Nearly empty cooking oil bottle"
  },
  {
    id: "item-can-2",
    name: "Organic Chickpeas",
    category_id: "cat-canned",
    unit: "cans",
    current_quantity: 6,
    weekly_usage: 2.0,
    low_stock_threshold: 2.0,
    status: "in_stock",
    icon: "Package",
    notes: "Great for hummus and curries"
  },
  {
    id: "item-can-3",
    name: "Tomato Paste",
    category_id: "cat-canned",
    unit: "cans",
    current_quantity: 3,
    weekly_usage: 1.0,
    low_stock_threshold: 1.0,
    status: "in_stock",
    icon: "Package",
    notes: "Double concentrated paste tubes"
  },
  {
    id: "item-can-4",
    name: "Coconut Milk (Unsweetened)",
    category_id: "cat-canned",
    unit: "cans",
    current_quantity: 0,
    weekly_usage: 2.0,
    low_stock_threshold: 1.0,
    status: "out_of_stock",
    icon: "Package",
    notes: "Need for Thai curry recipe"
  },

  // Beverages & Snacks
  {
    id: "item-bev-1",
    name: "Medium Roast Whole Coffee Beans",
    category_id: "cat-beverages",
    unit: "kg",
    current_quantity: 0.2,
    weekly_usage: 0.5,
    low_stock_threshold: 0.3,
    status: "low",
    icon: "Coffee",
    notes: "Down to the bottom of the bag!"
  },
  {
    id: "item-bev-2",
    name: "Japanese Green Tea Bags",
    category_id: "cat-beverages",
    unit: "boxes",
    current_quantity: 2,
    weekly_usage: 0.5,
    low_stock_threshold: 1.0,
    status: "in_stock",
    icon: "Coffee",
    notes: "Sencha green tea 50ct"
  },
  {
    id: "item-bev-3",
    name: "Dark Chocolate 72%",
    category_id: "cat-beverages",
    unit: "bars",
    current_quantity: 1,
    weekly_usage: 2.0,
    low_stock_threshold: 1.0,
    status: "low",
    icon: "Cookie",
    notes: "Evening treat"
  },
  {
    id: "item-bev-4",
    name: "Sparkling Lime Water",
    category_id: "cat-beverages",
    unit: "cans",
    current_quantity: 12,
    weekly_usage: 6.0,
    low_stock_threshold: 4.0,
    status: "in_stock",
    icon: "CupSoda",
    notes: "Full 12-pack in pantry"
  }
];

export const initialAlerts = [
  {
    id: "alert-1",
    item_id: "item-prod-3",
    item_name: "Ripe Bananas",
    type: "out_of_stock",
    message: "Ripe Bananas is out of stock! Added to your shopping list.",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    read: false
  },
  {
    id: "alert-2",
    item_id: "item-dairy-3",
    item_name: "Large Farm Eggs",
    type: "out_of_stock",
    message: "Large Farm Eggs reached 0 pieces. Restock needed immediately.",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: false
  },
  {
    id: "alert-3",
    item_id: "item-meat-2",
    item_name: "Atlantic Salmon Fillets",
    type: "out_of_stock",
    message: "Atlantic Salmon Fillets is out of stock.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false
  },
  {
    id: "alert-4",
    item_id: "item-dairy-1",
    item_name: "Whole Organic Milk",
    type: "low_stock",
    message: "Whole Organic Milk is low (0.6 litres remaining). Est. 1.4 days left.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    read: true
  },
  {
    id: "alert-5",
    item_id: "item-bev-1",
    item_name: "Medium Roast Whole Coffee Beans",
    type: "low_stock",
    message: "Medium Roast Whole Coffee Beans is below 0.3 kg threshold.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    read: true
  },
  {
    id: "alert-6",
    item_id: "item-dairy-4",
    item_name: "Unsalted Butter",
    type: "restocked",
    message: "Unsalted Butter was restocked to 2.0 packs.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    read: true
  }
];

export const initialSettings = {
  id: "default_settings",
  profile: {
    name: "Alex Morgan",
    email: "alex@smartkitchen.io",
    household_size: 3,
    kitchen_name: "Main Family Kitchen"
  },
  notifications: {
    enabled: true,
    low_stock_alerts: true,
    out_of_stock_alerts: true,
    restock_alerts: true,
    email_summary: false,
    sound_enabled: true
  },
  checked_shopping_ids: ["item-meat-2"]
};

// SHA-256 hash of passwords (ski_salt_2024 suffix)
// admin123  -> pre-computed
// user123   -> pre-computed
const ADMIN_HASH = 'b7e3e5f5a6c84f7c4a2d22b5a1f9c4e0a8d1b6c3f7e2a4b9c0d5e8f1a2b3c4d5'; // placeholder, seeded correctly at runtime

// We store actual hashes here so seeding works without importing crypto in seedData
// These are SHA-256('admin123' + 'ski_salt_2024') and SHA-256('user123' + 'ski_salt_2024')
import crypto from 'crypto';
const hash = (p) => crypto.createHash('sha256').update(p + 'ski_salt_2024').digest('hex');

export const initialUsers = [
  {
    id: 'user-admin-001',
    name: 'Admin Owner',
    email: 'admin@smartkitchen.io',
    password_hash: hash('admin123'),
    role: 'admin',
    phone: '03270220077',
    kitchen_name: 'Admin Control Center',
    household_size: 1,
    status: 'active'
  },
  {
    id: 'user-demo-001',
    name: 'Demo Customer',
    email: 'customer@smartkitchen.io',
    password_hash: hash('user123'),
    role: 'customer',
    phone: '',
    kitchen_name: 'Demo Family Kitchen',
    household_size: 4,
    status: 'active'
  }
];

export const initialAccountRequests = [
  {
    id: 'req-sample-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password_hash: hash('sarah2024'),
    phone: '+1 555-0101',
    kitchen_name: 'Johnson Household',
    household_size: 5,
    notes: 'I manage a large family and want to track our grocery stock efficiently.',
    status: 'pending',
    submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'req-sample-002',
    name: 'Ahmed Al-Rashid',
    email: 'ahmed.rashid@example.com',
    password_hash: hash('ahmed2024'),
    phone: '+92 300 1234567',
    kitchen_name: 'Al-Rashid Kitchen',
    household_size: 6,
    notes: 'Running a family guesthouse and need proper inventory tracking for our kitchen.',
    status: 'pending',
    submitted_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

