// Seed data with exactly 4 categories and 20 basic food products (5 per category)
// Users can add more categories and products themselves whenever they want.

export const initialCategories = [
  {
    id: "cat-produce",
    name: "Fresh Produce",
    icon: "Apple",
    color: "emerald",
    order_index: 0
  },
  {
    id: "cat-dairy",
    name: "Dairy & Breakfast",
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
    id: "cat-pantry",
    name: "Pantry Staples & Grains",
    icon: "Wheat",
    color: "amber",
    order_index: 3
  }
];

export const initialItems = [
  // 1. Fresh Produce (5 products)
  {
    id: "item-prod-1",
    name: "Yellow Onions",
    category_id: "cat-produce",
    unit: "kg",
    current_quantity: 0,
    weekly_usage: 2.0,
    low_stock_threshold: 1.5,
    status: "out_of_stock",
    icon: "Circle",
    notes: "Essential yellow cooking onions"
  },
  {
    id: "item-prod-2",
    name: "Fresh Tomatoes",
    category_id: "cat-produce",
    unit: "kg",
    current_quantity: 0.5,
    weekly_usage: 2.0,
    low_stock_threshold: 1.0,
    status: "low",
    icon: "Cherry",
    notes: "Ripe cooking tomatoes"
  },
  {
    id: "item-prod-3",
    name: "Potatoes",
    category_id: "cat-produce",
    unit: "kg",
    current_quantity: 4.0,
    weekly_usage: 2.0,
    low_stock_threshold: 1.5,
    status: "in_stock",
    icon: "Circle",
    notes: "All-purpose potatoes"
  },
  {
    id: "item-prod-4",
    name: "Fresh Garlic",
    category_id: "cat-produce",
    unit: "pieces",
    current_quantity: 0,
    weekly_usage: 2.0,
    low_stock_threshold: 2.0,
    status: "out_of_stock",
    icon: "Flower",
    notes: "Garlic bulbs"
  },
  {
    id: "item-prod-5",
    name: "Red Apples",
    category_id: "cat-produce",
    unit: "kg",
    current_quantity: 2.0,
    weekly_usage: 1.0,
    low_stock_threshold: 0.5,
    status: "in_stock",
    icon: "Apple",
    notes: "Crisp eating apples"
  },

  // 2. Dairy & Breakfast (5 products)
  {
    id: "item-dairy-1",
    name: "Fresh Whole Milk",
    category_id: "cat-dairy",
    unit: "liters",
    current_quantity: 0,
    weekly_usage: 4.0,
    low_stock_threshold: 2.0,
    status: "out_of_stock",
    icon: "Milk",
    notes: "Fresh whole milk"
  },
  {
    id: "item-dairy-2",
    name: "Farm Fresh Eggs",
    category_id: "cat-dairy",
    unit: "pieces",
    current_quantity: 4,
    weekly_usage: 12.0,
    low_stock_threshold: 6.0,
    status: "low",
    icon: "Egg",
    notes: "Brown eggs"
  },
  {
    id: "item-dairy-3",
    name: "Plain Yogurt",
    category_id: "cat-dairy",
    unit: "kg",
    current_quantity: 1.5,
    weekly_usage: 1.0,
    low_stock_threshold: 0.5,
    status: "in_stock",
    icon: "Utensils",
    notes: "Natural plain yogurt"
  },
  {
    id: "item-dairy-4",
    name: "Cheddar Cheese",
    category_id: "cat-dairy",
    unit: "packs",
    current_quantity: 2.0,
    weekly_usage: 0.5,
    low_stock_threshold: 1.0,
    status: "in_stock",
    icon: "Package",
    notes: "Sliced cheddar cheese"
  },
  {
    id: "item-dairy-5",
    name: "Black Tea",
    category_id: "cat-dairy",
    unit: "packs",
    current_quantity: 1.0,
    weekly_usage: 0.25,
    low_stock_threshold: 0.5,
    status: "in_stock",
    icon: "Coffee",
    notes: "Premium black tea blend"
  },

  // 3. Meat & Seafood (5 products)
  {
    id: "item-meat-1",
    name: "Chicken Breast",
    category_id: "cat-meat",
    unit: "kg",
    current_quantity: 0,
    weekly_usage: 2.0,
    low_stock_threshold: 1.0,
    status: "out_of_stock",
    icon: "Drumstick",
    notes: "Skinless boneless chicken breast"
  },
  {
    id: "item-meat-2",
    name: "Beef Mince",
    category_id: "cat-meat",
    unit: "kg",
    current_quantity: 0.5,
    weekly_usage: 1.5,
    low_stock_threshold: 1.0,
    status: "low",
    icon: "Beef",
    notes: "Fresh minced beef"
  },
  {
    id: "item-meat-3",
    name: "Salmon Fillets",
    category_id: "cat-meat",
    unit: "pieces",
    current_quantity: 4.0,
    weekly_usage: 2.0,
    low_stock_threshold: 2.0,
    status: "in_stock",
    icon: "Fish",
    notes: "Fresh salmon portions"
  },
  {
    id: "item-meat-4",
    name: "Boneless Mutton",
    category_id: "cat-meat",
    unit: "kg",
    current_quantity: 2.0,
    weekly_usage: 1.0,
    low_stock_threshold: 0.5,
    status: "in_stock",
    icon: "Beef",
    notes: "Tender boneless mutton"
  },
  {
    id: "item-meat-5",
    name: "Jumbo Prawns",
    category_id: "cat-meat",
    unit: "kg",
    current_quantity: 1.0,
    weekly_usage: 0.5,
    low_stock_threshold: 0.5,
    status: "in_stock",
    icon: "Fish",
    notes: "Cleaned jumbo prawns"
  },

  // 4. Pantry Staples & Grains (5 products)
  {
    id: "item-pantry-1",
    name: "Basmati Rice",
    category_id: "cat-pantry",
    unit: "kg",
    current_quantity: 0,
    weekly_usage: 2.5,
    low_stock_threshold: 2.0,
    status: "out_of_stock",
    icon: "Wheat",
    notes: "Premium aged long-grain basmati"
  },
  {
    id: "item-pantry-2",
    name: "Cooking Oil",
    category_id: "cat-pantry",
    unit: "liters",
    current_quantity: 0.5,
    weekly_usage: 1.0,
    low_stock_threshold: 1.0,
    status: "low",
    icon: "Droplets",
    notes: "Vegetable cooking oil"
  },
  {
    id: "item-pantry-3",
    name: "All-Purpose Flour",
    category_id: "cat-pantry",
    unit: "kg",
    current_quantity: 5.0,
    weekly_usage: 2.0,
    low_stock_threshold: 2.0,
    status: "in_stock",
    icon: "Wheat",
    notes: "White wheat flour"
  },
  {
    id: "item-pantry-4",
    name: "Iodised Table Salt",
    category_id: "cat-pantry",
    unit: "kg",
    current_quantity: 1.0,
    weekly_usage: 0.2,
    low_stock_threshold: 0.2,
    status: "in_stock",
    icon: "Sparkles",
    notes: "Refined table salt"
  },
  {
    id: "item-pantry-5",
    name: "White Sugar",
    category_id: "cat-pantry",
    unit: "kg",
    current_quantity: 2.5,
    weekly_usage: 0.8,
    low_stock_threshold: 1.0,
    status: "in_stock",
    icon: "Cookie",
    notes: "Granulated white sugar"
  }
];

export const initialAlerts = [
  {
    id: "alert-prod-1",
    item_id: "item-prod-1",
    item_name: "Yellow Onions",
    type: "out_of_stock",
    message: "Yellow Onions is completely out of stock!",
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: "alert-dairy-1",
    item_id: "item-dairy-1",
    item_name: "Fresh Whole Milk",
    type: "out_of_stock",
    message: "Fresh Whole Milk is out of stock!",
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: "alert-pantry-1",
    item_id: "item-pantry-1",
    item_name: "Basmati Rice",
    type: "out_of_stock",
    message: "Basmati Rice is out of stock!",
    timestamp: new Date().toISOString(),
    read: false
  }
];

export const initialSettings = {
  id: "default_settings",
  profile: {
    name: "Kitchen Chef",
    email: "chef@smartkitchen.app",
    household_size: 3
  },
  notifications: {
    enabled: true,
    low_stock_alerts: true,
    out_of_stock_alerts: true,
    restock_alerts: true
  },
  checked_shopping_ids: []
};

export const initialUsers = [
  {
    id: "user-admin-001",
    name: "Bilal Ahmad",
    email: "24p1fsmb028@concordia.edu.pk",
    password_hash: "ba5b8e90e722880c98f86f780824bfa1e028b05fc69837fb2f00d23f382a9332",
    password_plain: "bilal",
    role: "admin",
    phone: "03270220077",
    kitchen_name: "Master Control Kitchen",
    household_size: 4,
    status: "active",
    is_online: false,
    last_login: null,
    last_logout: null
  },
  {
    id: "user-cust-001",
    name: "Demo Customer",
    email: "customer@smartkitchen.io",
    password_hash: "28e7529ea4b470bf2f9ee8ff19ca71a938c6426f8d07019f39df78df804791a8",
    password_plain: "user123",
    role: "customer",
    phone: "03001234567",
    kitchen_name: "Demo Family Kitchen",
    household_size: 3,
    status: "active",
    is_online: false,
    last_login: null,
    last_logout: null
  }
];

export const initialAccountRequests = [];
