// db.js - Unified Cloud & LocalStorage Database Client Layer for Dhanalakshmi Food Products
(() => {

const DEFAULT_PRODUCTS = [
  {
    id: "prod_mixture",
    name: "Special Mixture",
    category: "Mixtures",
    description: "A crunchy and savory blend of sev, boondi, roasted peanuts, cashews, and traditional Andhra spices.",
    image: "assets/product_mixture.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: true
  },
  {
    id: "prod_dal_mixture",
    name: "Dal Mixture",
    category: "Mixtures",
    description: "Crispy fried lentils mixed with roasted spices, curry leaves, and a touch of chili.",
    image: "assets/product_dal_mixture.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: false
  },
  {
    id: "prod_chekodi",
    name: "Chekodi",
    category: "Chekodilu",
    description: "Classic golden-fried rings made of rice flour and sesame seeds, offering a perfect traditional crunch.",
    image: "assets/product_chekodi.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: true
  },
  {
    id: "prod_pappu_chekodi",
    name: "Pappu Chekodi",
    category: "Chekodilu",
    description: "Traditional crunchy ring snack enriched with chana dal (lentils) for an extra layer of texture and taste.",
    image: "assets/product_pappu_chekodi.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: false
  },
  {
    id: "prod_karapusa",
    name: "Arra Karapusa",
    category: "Karapusa",
    description: "Super fine, spicy gram flour sev seasoned with hand-ground red chilies and garlic.",
    image: "assets/product_arra_karapusa.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: false
  },
  {
    id: "prod_vammu_pusa",
    name: "Vammu Pusa",
    category: "Karapusa",
    description: "Traditional savory sev flavored with carom seeds (ajwain), gentle on the stomach and extremely flavorful.",
    image: "assets/product_vammu_pusa.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: true
  },
  {
    id: "prod_janthukulu",
    name: "Janthukulu",
    category: "Traditional Snacks",
    description: "Traditional spiral snack made of rice flour and black gram, flavored with cumin and sesame seeds.",
    image: "assets/product_janthukulu.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: true
  },
  {
    id: "prod_star_kommulu",
    name: "Star Kommulu",
    category: "Traditional Snacks",
    description: "Crispy star-shaped snack sticks seasoned with mild spices, perfect for tea time.",
    image: "assets/product_star_kommulu.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: false
  },
  {
    id: "prod_panchadhara_kommulu",
    name: "Panchadhara Kommulu",
    category: "Traditional Snacks",
    description: "Sweet, crispy snack sticks coated with sugar syrup. A traditional festive favorite.",
    image: "assets/product_panchadhara_kommulu.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: false
  },
  {
    id: "prod_bellam_gavvalu",
    name: "Bellam Gavvalu",
    category: "Gavvalu",
    description: "Shell-shaped sweet crisps made of wheat flour, fried to golden perfection and soaked in pure jaggery syrup.",
    image: "assets/product_bellam_gavvalu.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: true
  },
  {
    id: "prod_hot_gavvalu",
    name: "Hot Gavvalu",
    category: "Gavvalu",
    description: "Savory shell-shaped crisps spiced with red chili powder, garlic, and curry leaves.",
    image: "assets/product_hot_gavvalu.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: false
  },
  {
    id: "prod_chitti_appadalu",
    name: "Chitti Appadalu",
    category: "Appadalu",
    description: "Mini-sized, sun-dried lentil papads. Deep fry or roast for a crunchy companion to your meals.",
    image: "assets/product_chitti_appadalu.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: false
  },
  {
    id: "prod_pedda_appadalu",
    name: "Pedda Appadalu",
    category: "Appadalu",
    description: "Large, traditional papadums hand-rolled with premium quality black gram flour and spices.",
    image: "assets/product_pedda_appadalu.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: false
  },
  {
    id: "prod_diamond_chips",
    name: "Diamond Chips",
    category: "Others",
    description: "Sweet and crunchy diamond-cut flour pastries. Light, crispy, and mildly sweet.",
    image: "assets/product_diamond_chips.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: false
  },
  {
    id: "prod_little_hearts",
    name: "Little Hearts Biscuits",
    category: "Others",
    description: "Puff pastry biscuits baked in the shape of hearts, glazed with caramelized sugar.",
    image: "assets/product_little_hearts.jpg",
    prices: { "500g": 125, "1kg": 250 },
    inStock: true,
    isBestSeller: false
  }
];

const DEFAULT_SHIPPING_RATES = [
  { state: "Andhra Pradesh", rate: 60 },
  { state: "Telangana", rate: 60 },
  { state: "Tamil Nadu", rate: 80 },
  { state: "Karnataka", rate: 80 },
  { state: "Kerala", rate: 80 },
  { state: "Maharashtra", rate: 100 },
  { state: "Gujarat", rate: 120 },
  { state: "Delhi", rate: 120 },
  { state: "Uttar Pradesh", rate: 120 },
  { state: "West Bengal", rate: 120 },
  { state: "Rajasthan", rate: 120 },
  { state: "Madhya Pradesh", rate: 120 },
  { state: "Bihar", rate: 120 },
  { state: "Punjab", rate: 120 },
  { state: "Haryana", rate: 120 },
  { state: "Odisha", rate: 120 },
  { state: "Assam", rate: 140 },
  { state: "Jammu & Kashmir", rate: 140 },
  { state: "Goa", rate: 100 },
  { state: "Other States", rate: 120 }
];

const DEFAULT_SETTINGS = {
  businessName: "Dhanalakshmi Food Products",
  tagline: "Authentic Andhra Snacks Delivered Across India",
  description: "Serving authentic homemade sweets and traditional food products for over 10 years.",
  whatsappNumber: "+918919051435",
  upiId: "8919051435@axl",
  instagramUrl: "https://instagram.com/dhanalakshmifoods",
  emailAddress: "amarnadhkarella664@gmail.com",
  contactAddress: "Door No. 18/87, Nimmathota, Undrajavaram, West Godavari District, Andhra Pradesh - 534216"
};

// Shadow localStorage at the file level to safely handle browser privacy restrictions (e.g. Private Browsing Mode)
const localStorage = (() => {
  const mockStorage = {};
  return {
    getItem(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn(`localStorage.getItem failed for key: ${key}. Using in-memory fallback.`, e);
        return mockStorage[key] || null;
      }
    },
    setItem(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.warn(`localStorage.setItem failed for key: ${key}. Using in-memory fallback.`, e);
        mockStorage[key] = String(value);
      }
    },
    removeItem(key) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.warn(`localStorage.removeItem failed for key: ${key}. Using in-memory fallback.`, e);
        delete mockStorage[key];
      }
    },
    clear() {
      try {
        window.localStorage.clear();
      } catch (e) {
        for (const k in mockStorage) {
          delete mockStorage[k];
        }
      }
    }
  };
})();

class UnifiedDatabase {
  constructor() {
    this.apiUrl = window.location.origin;
    // Resolve absolute path when running locally over file:// protocol
    if (this.apiUrl.startsWith('file://')) {
      this.apiUrl = 'http://localhost:5000';
    }
    
    this.online = false;
    this.checkedOnline = false;
    this.adminToken = localStorage.getItem('dfp_admin_token') || '';
    this.initLocalStorageFallback();
  }

  // Detect serverless backend availability
  async checkConnection() {
    if (this.checkedOnline) return this.online;

    // First try: test the current origin
    try {
      const res = await fetch(`${this.apiUrl}/api/status`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (data && data.status === 'online') {
        this.online = true;
        this.checkedOnline = true;
        console.log(`Dhanalakshmi DB Mode: Cloud (Supabase) via ${this.apiUrl}`);
        return this.online;
      }
    } catch (e) {
      // Ignored, try local fallback below
    }

    // Second try: If current origin is local / file, check if local dev server on port 5000 is running
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.protocol === 'file:';

    if (isLocal && this.apiUrl !== 'http://localhost:5000') {
      try {
        const fallbackUrl = 'http://localhost:5000';
        const res = await fetch(`${fallbackUrl}/api/status`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (data && data.status === 'online') {
          this.apiUrl = fallbackUrl;
          this.online = true;
          this.checkedOnline = true;
          console.log(`Dhanalakshmi DB Mode: Cloud (Supabase) via local server ${this.apiUrl}`);
          return this.online;
        }
      } catch (e) {
        // Ignored
      }
    }

    this.online = false;
    this.checkedOnline = true;
    console.log(`Dhanalakshmi DB Mode: Fallback (LocalStorage)`);
    return this.online;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.adminToken) {
      headers['x-admin-password'] = this.adminToken;
    }
    return headers;
  }

  // --- LOCALSTORAGE FALLBACK INITIALIZER ---
  initLocalStorageFallback() {
    if (!localStorage.getItem("dfp_products")) {
      const seeded = DEFAULT_PRODUCTS.map(p => ({
        ...p,
        cost_price_500g: 80.00,
        cost_price_1kg: 160.00,
        stock_qty_500g: Math.floor(Math.random() * 50) + 10,
        stock_qty_1kg: Math.floor(Math.random() * 30) + 5
      }));
      localStorage.setItem("dfp_products", JSON.stringify(seeded));
    }
    if (!localStorage.getItem("dfp_shipping_rates")) {
      localStorage.setItem("dfp_shipping_rates", JSON.stringify(DEFAULT_SHIPPING_RATES));
    }
    if (!localStorage.getItem("dfp_settings")) {
      localStorage.setItem("dfp_settings", JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem("dfp_orders")) {
      localStorage.setItem("dfp_orders", JSON.stringify([]));
    }
    if (!localStorage.getItem("dfp_expenses")) {
      localStorage.setItem("dfp_expenses", JSON.stringify([]));
    }
  }

  // --- PRODUCTS ---
  async getProducts() {
    if (await this.checkConnection()) {
      try {
        const res = await fetch(`${this.apiUrl}/api/products`);
        if (!res.ok) throw new Error("Server responded with status " + res.status);
        const data = await res.json();
        if (Array.isArray(data)) return data;
        throw new Error("Invalid products response: expected array");
      } catch (e) {
        console.error("Failed to fetch products from cloud, returning fallback", e);
      }
    }
    return JSON.parse(localStorage.getItem("dfp_products")) || [];
  }

  async addProduct(product) {
    if (await this.checkConnection()) {
      const res = await fetch(`${this.apiUrl}/api/products`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(product)
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    
    // Fallback
    const products = JSON.parse(localStorage.getItem("dfp_products")) || [];
    product.id = "prod_" + Date.now();
    products.push(product);
    localStorage.setItem("dfp_products", JSON.stringify(products));
    window.dispatchEvent(new Event("storage"));
    return product;
  }

  async updateProduct(id, updatedFields) {
    if (await this.checkConnection()) {
      const payload = { id, ...updatedFields };
      const res = await fetch(`${this.apiUrl}/api/products`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    
    // Fallback
    const products = JSON.parse(localStorage.getItem("dfp_products")) || [];
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...updatedFields };
      localStorage.setItem("dfp_products", JSON.stringify(products));
      window.dispatchEvent(new Event("storage"));
      return products[idx];
    }
    return null;
  }

  async deleteProduct(id) {
    if (await this.checkConnection()) {
      const res = await fetch(`${this.apiUrl}/api/products`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    
    // Fallback
    let products = JSON.parse(localStorage.getItem("dfp_products")) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem("dfp_products", JSON.stringify(products));
    window.dispatchEvent(new Event("storage"));
  }

  // --- SHIPPING RATES ---
  async getShippingRates() {
    if (await this.checkConnection()) {
      try {
        const res = await fetch(`${this.apiUrl}/api/shipping`);
        if (!res.ok) throw new Error("Server responded with status " + res.status);
        const data = await res.json();
        if (Array.isArray(data)) return data;
        throw new Error("Invalid shipping rates response: expected array");
      } catch (e) {
        console.error("Failed to fetch shipping rates from cloud", e);
      }
    }
    return JSON.parse(localStorage.getItem("dfp_shipping_rates")) || [];
  }

  async updateShippingRate(stateName, newRate) {
    if (await this.checkConnection()) {
      const res = await fetch(`${this.apiUrl}/api/shipping`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ state: stateName, rate: newRate })
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    
    // Fallback
    const rates = JSON.parse(localStorage.getItem("dfp_shipping_rates")) || [];
    const rateItem = rates.find(r => r.state.toLowerCase() === stateName.toLowerCase());
    if (rateItem) {
      rateItem.rate = parseFloat(newRate);
    } else {
      rates.push({ state: stateName, rate: parseFloat(newRate) });
    }
    localStorage.setItem("dfp_shipping_rates", JSON.stringify(rates));
    window.dispatchEvent(new Event("storage"));
  }

  // --- ORDERS ---
  async getOrders() {
    if (await this.checkConnection()) {
      try {
        const res = await fetch(`${this.apiUrl}/api/orders`, {
          headers: this.getHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (Array.isArray(data)) return data;
        throw new Error("Invalid orders response: expected array");
      } catch (e) {
        console.error("Failed to fetch orders from cloud", e);
      }
    }
    return JSON.parse(localStorage.getItem("dfp_orders")) || [];
  }

  async addOrder(order) {
    if (await this.checkConnection()) {
      const res = await fetch(`${this.apiUrl}/api/orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(order)
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    
    // Fallback
    const orders = JSON.parse(localStorage.getItem("dfp_orders")) || [];
    order.id = "DFP-" + Math.floor(100000 + Math.random() * 900000);
    order.timestamp = new Date().toISOString();
    order.status = "New Order";
    order.paymentRef = order.paymentRef || `WA-${order.id}`;
    orders.unshift(order);
    localStorage.setItem("dfp_orders", JSON.stringify(orders));
    window.dispatchEvent(new Event("storage"));
    return order;
  }

  async updateOrderStatus(orderId, status) {
    if (await this.checkConnection()) {
      const res = await fetch(`${this.apiUrl}/api/orders`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ id: orderId, status })
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    
    // Fallback
    const orders = JSON.parse(localStorage.getItem("dfp_orders")) || [];
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      localStorage.setItem("dfp_orders", JSON.stringify(orders));
      window.dispatchEvent(new Event("storage"));
      return orders[idx];
    }
    return null;
  }

  async confirmOrderPayment(orderId, paymentRef, notes) {
    if (await this.checkConnection()) {
      const res = await fetch(`${this.apiUrl}/api/orders`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ id: orderId, status: 'Pending', paymentRef, notes })
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    
    // Fallback
    const orders = JSON.parse(localStorage.getItem("dfp_orders")) || [];
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = 'Pending';
      orders[idx].paymentRef = paymentRef;
      orders[idx].notes = notes;
      localStorage.setItem("dfp_orders", JSON.stringify(orders));
      window.dispatchEvent(new Event("storage"));
      return orders[idx];
    }
    return null;
  }

  // --- SETTINGS ---
  async getSettings() {
    if (await this.checkConnection()) {
      try {
        const res = await fetch(`${this.apiUrl}/api/settings`);
        return await res.json();
      } catch (e) {
        console.error("Failed to fetch settings from cloud", e);
      }
    }
    return JSON.parse(localStorage.getItem("dfp_settings")) || DEFAULT_SETTINGS;
  }

  async saveSettings(settings) {
    if (await this.checkConnection()) {
      const res = await fetch(`${this.apiUrl}/api/settings`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    
    // Fallback
    localStorage.setItem("dfp_settings", JSON.stringify(settings));
    window.dispatchEvent(new Event("storage"));
  }

  // --- AUTHENTICATION ---
  async login(password) {
    if (await this.checkConnection()) {
      try {
        const res = await fetch(`${this.apiUrl}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (data.success) {
          this.adminToken = data.token;
          localStorage.setItem('dfp_admin_token', data.token);
          return { success: true };
        }
        return { success: false, error: data.error };
      } catch (e) {
        return { success: false, error: "Network error trying to authenticate." };
      }
    }
    
    // Fallback Local Auth
    const settings = JSON.parse(localStorage.getItem("dfp_settings")) || DEFAULT_SETTINGS;
    const localPassword = settings.adminPassword || "admin";
    if (password === localPassword) {
      this.adminToken = password;
      localStorage.setItem('dfp_admin_token', password);
      return { success: true };
    }
    return { success: false, error: "Incorrect admin password." };
  }

  // --- EXPENSES ---
  async getExpenses() {
    if (await this.checkConnection()) {
      try {
        const res = await fetch(`${this.apiUrl}/api/expenses`, { headers: this.getHeaders() });
        if (!res.ok) throw new Error("Server status " + res.status);
        const data = await res.json();
        if (Array.isArray(data)) return data;
        throw new Error("Expected array response for expenses");
      } catch (e) {
        console.error("Failed to fetch expenses, returning fallback", e);
      }
    }
    return JSON.parse(localStorage.getItem("dfp_expenses")) || [];
  }

  async addExpense(expense) {
    if (await this.checkConnection()) {
      const res = await fetch(`${this.apiUrl}/api/expenses`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(expense)
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    const expenses = JSON.parse(localStorage.getItem("dfp_expenses")) || [];
    expense.id = "exp_" + Date.now();
    expense.created_at = new Date().toISOString();
    expense.expense_date = expense.expense_date || new Date().toISOString().split('T')[0];
    expenses.unshift(expense);
    localStorage.setItem("dfp_expenses", JSON.stringify(expenses));
    window.dispatchEvent(new Event("storage"));
    return expense;
  }

  async updateExpense(id, updatedFields) {
    if (await this.checkConnection()) {
      const res = await fetch(`${this.apiUrl}/api/expenses`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ id, ...updatedFields })
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    const expenses = JSON.parse(localStorage.getItem("dfp_expenses")) || [];
    const idx = expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
      expenses[idx] = { ...expenses[idx], ...updatedFields };
      localStorage.setItem("dfp_expenses", JSON.stringify(expenses));
      window.dispatchEvent(new Event("storage"));
      return expenses[idx];
    }
    return null;
  }

  async deleteExpense(id) {
    if (await this.checkConnection()) {
      const res = await fetch(`${this.apiUrl}/api/expenses`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    }
    let expenses = JSON.parse(localStorage.getItem("dfp_expenses")) || [];
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem("dfp_expenses", JSON.stringify(expenses));
    window.dispatchEvent(new Event("storage"));
    return { success: true };
  }

  // --- FINANCE SUMMARY ---
  async getFinanceSummary() {
    if (await this.checkConnection()) {
      try {
        const res = await fetch(`${this.apiUrl}/api/finance-summary`, { headers: this.getHeaders() });
        if (!res.ok) throw new Error("Server status " + res.status);
        return await res.json();
      } catch (e) {
        console.error("Failed to fetch finance summary, computing fallback", e);
      }
    }
    return this.compileLocalFinanceSummary();
  }

  compileLocalFinanceSummary() {
    const orders = JSON.parse(localStorage.getItem("dfp_orders")) || [];
    const expenses = JSON.parse(localStorage.getItem("dfp_expenses")) || [];
    const products = JSON.parse(localStorage.getItem("dfp_products")) || [];

    const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
    const currentMonthIST = todayIST.substring(0, 7); // YYYY-MM
    const currentYearIST = todayIST.substring(0, 4); // YYYY

    // Count paid orders (as confirmed payment or not Cancelled/New)
    const paidOrders = orders.filter(o => o.status !== 'New Order' && o.status !== 'Cancelled');

    let todayIncome = 0;
    let monthIncome = 0;
    let yearIncome = 0;

    paidOrders.forEach(o => {
      const orderDateIST = new Date(o.timestamp || o.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const orderAmount = parseFloat(o.total) || 0;

      if (orderDateIST === todayIST) todayIncome += orderAmount;
      if (orderDateIST.startsWith(currentMonthIST)) monthIncome += orderAmount;
      if (orderDateIST.startsWith(currentYearIST)) yearIncome += orderAmount;
    });

    let todayExpenses = 0;
    let monthExpenses = 0;
    let yearExpenses = 0;

    expenses.forEach(e => {
      const expDate = e.expense_date || todayIST;
      const expAmount = parseFloat(e.amount) || 0;

      if (expDate === todayIST) todayExpenses += expAmount;
      if (expDate.startsWith(currentMonthIST)) monthExpenses += expAmount;
      if (expDate.startsWith(currentYearIST)) yearExpenses += expAmount;
    });

    let stockVal = 0;
    let anyCostPrice = false;

    products.forEach(p => {
      const qty500 = parseInt(p.stock_qty_500g) || 0;
      const qty1k = parseInt(p.stock_qty_1kg) || 0;
      let cost500 = parseFloat(p.cost_price_500g) || 0;
      let cost1k = parseFloat(p.cost_price_1kg) || 0;

      if (cost500 > 0 || cost1k > 0) {
        anyCostPrice = true;
      } else {
        cost500 = parseFloat(p.prices?.["500g"] || p.price_500g || 0);
        cost1k = parseFloat(p.prices?.["1kg"] || p.price_1kg || 0);
      }

      stockVal += (qty500 * cost500) + (qty1k * cost1k);
    });

    // Monthly trends mapping (last 12 months)
    const monthlyData = {};
    paidOrders.forEach(o => {
      const m = new Date(o.timestamp || o.created_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).substring(0, 7) + "-01";
      if (!monthlyData[m]) monthlyData[m] = { income: 0, expenses: 0 };
      monthlyData[m].income += parseFloat(o.total) || 0;
    });

    expenses.forEach(e => {
      const m = (e.expense_date || todayIST).substring(0, 7) + "-01";
      if (!monthlyData[m]) monthlyData[m] = { income: 0, expenses: 0 };
      monthlyData[m].expenses += parseFloat(e.amount) || 0;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    if (sortedMonths.length === 0) {
      sortedMonths.push(currentMonthIST + "-01");
    }

    const trends = sortedMonths.map(m => {
      const inc = monthlyData[m]?.income || 0;
      const exp = monthlyData[m]?.expenses || 0;
      const dateObj = new Date(m);
      const label = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
      return {
        monthKey: m,
        label: label,
        income: inc,
        expenses: exp,
        profit: inc - exp
      };
    });

    return {
      today: { income: todayIncome, expenses: todayExpenses, profit: todayIncome - todayExpenses },
      thisMonth: { income: monthIncome, expenses: monthExpenses, profit: monthIncome - monthExpenses },
      thisYear: { income: yearIncome, expenses: yearExpenses, profit: yearIncome - yearExpenses },
      stockValue: { value: stockVal, isEstimate: !anyCostPrice },
      trends: trends
    };
  }

  logout() {
    this.adminToken = '';
    localStorage.removeItem('dfp_admin_token');
  }

  // --- RESET SYSTEM ---
  async resetToDefaults() {
    const seeded = DEFAULT_PRODUCTS.map(p => ({
      ...p,
      cost_price_500g: 80.00,
      cost_price_1kg: 160.00,
      stock_qty_500g: Math.floor(Math.random() * 50) + 10,
      stock_qty_1kg: Math.floor(Math.random() * 30) + 5
    }));
    localStorage.setItem("dfp_products", JSON.stringify(seeded));
    localStorage.setItem("dfp_shipping_rates", JSON.stringify(DEFAULT_SHIPPING_RATES));
    localStorage.setItem("dfp_settings", JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem("dfp_orders", JSON.stringify([]));
    localStorage.setItem("dfp_expenses", JSON.stringify([]));
    window.dispatchEvent(new Event("storage"));
  }
}

const DB = new UnifiedDatabase();
window.DB = DB;

// --- PAYMENT GATEWAY WRAPPER ---
const PaymentHandler = {
  // Initiates the payment process.
  // For UPI: Configures and displays UPI details/QR code.
  // For Razorpay: Would initialize and open the Razorpay SDK checkout overlay.
  async initiatePayment(orderData, settings) {
    const upiId = settings.upiId;
    const merchantName = encodeURIComponent(settings.businessName);
    const transactionNote = encodeURIComponent(`Order ${orderData.id}`);
    
    // Ensure amount is formatted exactly to two decimal places
    const formattedAmount = Number(orderData.total).toFixed(2);
    const upiUrl = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${formattedAmount}&tn=${transactionNote}&cu=INR`;
    
    // Update DOM elements on the checkout page
    const upiTargetId = document.getElementById('upi-target-id');
    const upiMobileLink = document.getElementById('upi-mobile-link');
    const upiQrImage = document.getElementById('upi-qr-image');
    const upiRefNoInput = document.getElementById('upi-ref-no');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    
    if (upiTargetId) upiTargetId.textContent = upiId;
    if (upiMobileLink) upiMobileLink.href = upiUrl;
    if (upiQrImage) {
      upiQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    }
    if (upiRefNoInput) upiRefNoInput.value = "";
    if (confirmPaymentBtn) {
      confirmPaymentBtn.setAttribute('data-temp-ref', orderData.id);
    }
    
    return {
      success: true,
      amount: formattedAmount,
      upiUrl: upiUrl
    };
  },

  // Confirms/Verifies payment.
  // For UPI: Submits the customer's manual UTR transaction reference to update status.
  // For Razorpay: Would verify the Razorpay response signature server-side.
  async confirmPayment(orderId, referenceNo, amount) {
    const notes = `Paid ₹${amount} via UPI Reference: ${referenceNo}`;
    return await DB.confirmOrderPayment(orderId, referenceNo, notes);
  }
};

window.PaymentHandler = PaymentHandler;
})();

