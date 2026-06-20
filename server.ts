import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { AppSettings, Product, Order, Page } from "./src/types";

const app = express();
const PORT = 3000;

// Dynamic parser for uploads and API requests
app.use(express.json({ limit: "25mb" }));

// Security credentials
const ADMIN_USERNAME = "Hriidoo";
// Pre-calculated target hash for "Hriidoo1!"
const TARGET_ADMIN_HASH = "80fcecf086c2e2646279f6ebcf733e83b8b1dc32f3ecc6706e57920fdecd4bdf";

// For CJS / ESModule compatibility
const currentDir = (() => {
  try {
    if (typeof __dirname !== "undefined") return __dirname;
    if (typeof import.meta !== "undefined" && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch (e) {}
  return process.cwd();
})();

// Helpless database load/saves
function getDatabasePath() {
  const paths = [
    path.join(process.cwd(), "src", "db.json"),
    path.join(process.cwd(), "db.json"),
    path.join(currentDir, "src", "db.json"),
    path.join(currentDir, "..", "src", "db.json"),
    path.join(currentDir, "db.json"),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  // Fallback default
  return path.join(process.cwd(), "src", "db.json");
}

const DB_PATH = getDatabasePath();

function readDatabase() {
  try {
    const activePath = getDatabasePath();
    if (!fs.existsSync(activePath)) {
      // Emergency default base creation
      return { settings: {}, products: [], pages: [], orders: [] };
    }
    const data = fs.readFileSync(activePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file:", err);
    return { settings: {}, products: [], pages: [], orders: [] };
  }
}

function writeDatabase(data: any) {
  try {
    const activePath = getDatabasePath();
    fs.writeFileSync(activePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing database file:", err);
    return false;
  }
}

// =================== API ENDPOINTS ===================

// Admin login session
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();
  const cleanPasswordLower = cleanPassword.toLowerCase();

  // Generate SHA-256 hash or match plain text
  const suppliedHash = crypto.createHash("sha256").update(cleanPassword).digest("hex");

  if (
    (cleanUsername === "hriidoo" || cleanUsername === "admin") &&
    suppliedHash === TARGET_ADMIN_HASH
  ) {
    return res.json({ success: true, token: "sera-deal-admin-jwt-mocked-token-2026" });
  } else {
    return res.status(401).json({ error: "Invalid admin credentials code." });
  }
});

// GET everything (Unified fetch for state loading)
app.get("/api/db", (req, res) => {
  const db = readDatabase();
  res.json(db);
});

// Update site settings, branding, layout menus, categories, panels
app.post("/api/settings", (req, res) => {
  const headerToken = req.headers.authorization;
  if (!headerToken || headerToken !== "Bearer sera-deal-admin-jwt-mocked-token-2026") {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const db = readDatabase();
  db.settings = { ...db.settings, ...req.body };
  writeDatabase(db);
  res.json({ success: true, settings: db.settings });
});

// Product Manager Endpoints
app.post("/api/products", (req, res) => {
  const headerToken = req.headers.authorization;
  if (!headerToken || headerToken !== "Bearer sera-deal-admin-jwt-mocked-token-2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const db = readDatabase();
  const newProduct: Product = {
    id: "p_" + Date.now().toString(36),
    title: req.body.title || "Untitled Product",
    description: req.body.description || "",
    images: req.body.images && req.body.images.length ? req.body.images : ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80"],
    price: Number(req.body.price) || 0,
    salePrice: Number(req.body.salePrice) || Number(req.body.price) || 0,
    categories: req.body.categories || [],
    stock: Number(req.body.stock) || 0,
    isFlashSale: !!req.body.isFlashSale,
    discountRate: Math.max(0, Math.min(100, Math.round(((Number(req.body.price) - Number(req.body.salePrice)) / (Number(req.body.price) || 1)) * 100)))
  };

  db.products.push(newProduct);
  writeDatabase(db);
  res.json({ success: true, product: newProduct });
});

app.put("/api/products/:id", (req, res) => {
  const headerToken = req.headers.authorization;
  if (!headerToken || headerToken !== "Bearer sera-deal-admin-jwt-mocked-token-2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const db = readDatabase();
  const index = db.products.findIndex((p: any) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const existingProduct = db.products[index];
  const updatedPrice = Number(req.body.price) ?? existingProduct.price;
  const updatedSalePrice = Number(req.body.salePrice) ?? existingProduct.salePrice;

  db.products[index] = {
    ...existingProduct,
    ...req.body,
    price: updatedPrice,
    salePrice: updatedSalePrice,
    discountRate: Math.max(0, Math.min(100, Math.round(((updatedPrice - updatedSalePrice) / (updatedPrice || 1)) * 100)))
  };

  writeDatabase(db);
  res.json({ success: true, product: db.products[index] });
});

app.delete("/api/products/:id", (req, res) => {
  const headerToken = req.headers.authorization;
  if (!headerToken || headerToken !== "Bearer sera-deal-admin-jwt-mocked-token-2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const db = readDatabase();
  const origLength = db.products.length;
  db.products = db.products.filter((p: any) => p.id !== id);

  if (db.products.length === origLength) {
    return res.status(404).json({ error: "Product not found" });
  }

  writeDatabase(db);
  res.json({ success: true });
});

// Dynamic Page Manager Endpoints
app.post("/api/pages", (req, res) => {
  const headerToken = req.headers.authorization;
  if (!headerToken || headerToken !== "Bearer sera-deal-admin-jwt-mocked-token-2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const db = readDatabase();
  const { title, content, slug } = req.body;
  if (!title || !slug) {
    return res.status(400).json({ error: "Title and slug are required" });
  }

  // Validate slug formatting
  const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-");

  const existingIndex = db.pages.findIndex((p: any) => p.slug === formattedSlug);

  const pageData: Page = {
    id: formattedSlug,
    title,
    slug: formattedSlug,
    content: content || "",
    isSystem: existingIndex > -1 ? db.pages[existingIndex].isSystem : false
  };

  if (existingIndex > -1) {
    db.pages[existingIndex] = pageData;
  } else {
    db.pages.push(pageData);
  }

  writeDatabase(db);
  res.json({ success: true, page: pageData });
});

app.delete("/api/pages/:slug", (req, res) => {
  const headerToken = req.headers.authorization;
  if (!headerToken || headerToken !== "Bearer sera-deal-admin-jwt-mocked-token-2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { slug } = req.params;
  const db = readDatabase();

  const targetPage = db.pages.find((p: any) => p.slug === slug);
  if (targetPage?.isSystem) {
    return res.status(400).json({ error: "Cannot delete built-in system pages." });
  }

  db.pages = db.pages.filter((p: any) => p.slug !== slug);
  writeDatabase(db);
  res.json({ success: true });
});

// Core Order Placements
app.post("/api/orders", (req, res) => {
  const { customerName, customerEmail, customerPhone, shippingAddress, items, paymentMethod, paymentNumber, transactionId, totalAmount } = req.body;

  if (!customerName || !customerPhone || !shippingAddress || !items || !items.length) {
    return res.status(400).json({ error: "Incomplete shipping information to place order" });
  }

  const db = readDatabase();
  const trackingId = "SD-" + Math.floor(100000 + Math.random() * 900000).toString();

  const newOrder: Order = {
    id: trackingId,
    customerName,
    customerEmail: customerEmail || "",
    customerPhone,
    shippingAddress,
    items,
    status: "Pending",
    paymentMethod,
    paymentNumber,
    transactionId,
    totalAmount,
    createdAt: new Date().toISOString()
  };

  // Adjust product inventories based on orders
  items.forEach((item: any) => {
    const prod = db.products.find((p: any) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  db.orders.unshift(newOrder);
  writeDatabase(db);

  res.json({ success: true, orderId: trackingId, order: newOrder });
});

// Order Tracker Info
app.get("/api/orders/track/:id", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const order = db.orders.find((o: any) => o.id.toLowerCase() === id.trim().toLowerCase());

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json(order);
});

// Order status updates (Admin Panel controls)
app.patch("/api/orders/:id", (req, res) => {
  const headerToken = req.headers.authorization;
  if (!headerToken || headerToken !== "Bearer sera-deal-admin-jwt-mocked-token-2026") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { status } = req.body;
  
  if (!["Pending", "Shipped", "Delivered"].includes(status)) {
    return res.status(400).json({ error: "Invalid status state" });
  }

  const db = readDatabase();
  const index = db.orders.findIndex((o: any) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Order tracker not found" });
  }

  db.orders[index].status = status;
  writeDatabase(db);
  res.json({ success: true, order: db.orders[index] });
});

// =================== ASSET AND SPA WEB ROUTING ===================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dynamic asset builder and module refresh via custom dev-server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production delivery mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully online on port ${PORT}`);
  });
}

startServer();
