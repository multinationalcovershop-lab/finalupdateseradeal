import React, { useState, useEffect } from "react";
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  FileText,
  ShoppingBag,
  Sliders,
  LogOut,
  Image,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Truck
} from "lucide-react";
import { AppSettings, Product, Order, Page } from "../types";

interface AdminPanelProps {
  settings: AppSettings;
  products: Product[];
  orders: Order[];
  pages: Page[];
  onUpdateSettings: (newSettings: AppSettings) => Promise<void>;
  onAddProduct: (product: Omit<Product, "id">) => Promise<void>;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onAddPage: (page: Omit<Page, "id">) => Promise<void>;
  onDeletePage: (slug: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: "Pending" | "Shipped" | "Delivered") => Promise<void>;
  onLogout: () => void;
  adminToken: string;
}

export default function AdminPanel({
  settings,
  products,
  orders,
  pages,
  onUpdateSettings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddPage,
  onDeletePage,
  onUpdateOrderStatus,
  onLogout,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"products" | "pages" | "settings" | "orders" | "sliders">("products");

  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pTitle, setPTitle] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pSalePrice, setPSalePrice] = useState("");
  const [pStock, setPStock] = useState("");
  const [pCategories, setPCategories] = useState("");
  const [pImgUrl, setPImgUrl] = useState("");
  const [pIsFlash, setPIsFlash] = useState(false);

  // Settings / Logo Form State
  const [compName, setCompName] = useState(settings.companyName);
  const [lgUrl, setLgUrl] = useState(settings.logoUrl);
  const [lgText, setLgText] = useState(settings.logoText);
  const [phn, setPhn] = useState(settings.contactPhone);
  const [eml, setEml] = useState(settings.contactEmail);
  const [bNo, setBNo] = useState(settings.bkashNumber);
  const [nNo, setNNo] = useState(settings.nagadNumber);

  // Sync internal state with props dynamically when settings fetch is updated
  useEffect(() => {
    if (settings) {
      setCompName(settings.companyName || "");
      setLgUrl(settings.logoUrl || "");
      setLgText(settings.logoText || "");
      setPhn(settings.contactPhone || "");
      setEml(settings.contactEmail || "");
      setBNo(settings.bkashNumber || "");
      setNNo(settings.nagadNumber || "");
    }
  }, [settings]);

  // WordPress Page Form State
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageContent, setPageContent] = useState("");

  // Sliders Section State
  const [sliderTitle, setSliderTitle] = useState("");
  const [sliderSubtitle, setSliderSubtitle] = useState("");
  const [sliderImg, setSliderImg] = useState("");
  const [sliderLink, setSliderLink] = useState("");

  const [notification, setNotification] = useState("");

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoriesArray = pCategories.split(",").map((c) => c.trim()).filter(Boolean);
    const imagesArray = pImgUrl.split(",").map((i) => i.trim()).filter(Boolean);

    const productPayload = {
      title: pTitle,
      description: pDesc,
      price: Number(pPrice),
      salePrice: Number(pSalePrice) || Number(pPrice),
      stock: Number(pStock),
      categories: categoriesArray,
      images: imagesArray.length ? imagesArray : ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80"],
      isFlashSale: pIsFlash,
    };

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, productPayload);
        triggerNotification("Product compiled & updated successfully!");
      } else {
        await onAddProduct(productPayload);
        triggerNotification("Product inserted successfully!");
      }

      // Reset Product form
      setEditingProduct(null);
      setPTitle("");
      setPDesc("");
      setPPrice("");
      setPSalePrice("");
      setPStock("");
      setPCategories("");
      setPImgUrl("");
      setPIsFlash(false);
    } catch {
      triggerNotification("Error compiling product operation.");
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPTitle(prod.title);
    setPDesc(prod.description);
    setPPrice(prod.price.toString());
    setPSalePrice(prod.salePrice ? prod.salePrice.toString() : "");
    setPStock(prod.stock.toString());
    setPCategories(prod.categories.join(", "));
    setPImgUrl(prod.images.join(", "));
    setPIsFlash(!!prod.isFlashSale);
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const activeCategories = Array.from(new Set([
        ...settings.categories,
        ...products.flatMap(p => p.categories)
      ]));

      await onUpdateSettings({
        ...settings,
        companyName: compName,
        logoUrl: lgUrl,
        logoText: lgText,
        contactPhone: phn,
        contactEmail: eml,
        bkashNumber: bNo,
        nagadNumber: nNo,
        categories: activeCategories
      });
      triggerNotification("WordPress settings and branding synchronized instantly!");
    } catch {
      triggerNotification("Error updating site configuration parameters.");
    }
  };

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle || !pageSlug) return triggerNotification("Please fill in Title and Slug!");

    try {
      const linkSlug = pageSlug.toLowerCase().replace(/[^a-z0-9-_]/g, "-");
      await onAddPage({
        title: pageTitle,
        slug: linkSlug,
        content: pageContent,
      });

      // Automatically add/update header/footer links if needed
      const linkUrl = `/pages/${linkSlug}`;
      const alreadyListed = settings.headerLinks.some((l) => l.url === linkUrl);

      if (!alreadyListed) {
        const updatedHeaderLinks = [
          ...settings.headerLinks,
          { id: "h_" + Date.now().toString(36), text: pageTitle, url: linkUrl }
        ];
        await onUpdateSettings({
          ...settings,
          headerLinks: updatedHeaderLinks
        });
      }

      triggerNotification(`New custom page '${pageTitle}' published instantly!`);
      setPageTitle("");
      setPageSlug("");
      setPageContent("");
    } catch {
      triggerNotification("Failed to build dynamic page.");
    }
  };

  const handleSliderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sliderTitle || !sliderImg) return triggerNotification("Title and Image URL are required.");

    const newSlider = {
      id: "sl_" + Date.now().toString(36),
      title: sliderTitle,
      subtitle: sliderSubtitle,
      imageUrl: sliderImg,
      linkUrl: sliderLink || "/"
    };

    try {
      await onUpdateSettings({
        ...settings,
        sliders: [...settings.sliders, newSlider]
      });
      triggerNotification("Promotional Slide Banner attached!");
      setSliderTitle("");
      setSliderSubtitle("");
      setSliderImg("");
      setSliderLink("");
    } catch {
      triggerNotification("Error persisting slide banner.");
    }
  };

  const removeSlider = async (slideId: string) => {
    try {
      const filtered = settings.sliders.filter((s) => s.id !== slideId);
      await onUpdateSettings({
        ...settings,
        sliders: filtered
      });
      triggerNotification("Slide Banner removed.");
    } catch {
      triggerNotification("Failed to remove slider.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-gray-800">
      {/* Top Admin Panel Banner Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md">
            W
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Sera Deal Management Console</h1>
            <p className="text-xs text-slate-500">
              WordPress-like dynamic custom layout builder & secure database panel.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition"
          >
            <LogOut size={14} /> Close Admin (Logout)
          </button>
        </div>
      </div>

      {notification && (
        <div className="mb-6 bg-green-500 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2 shadow-md animate-bounce">
          <CheckCircle size={15} /> {notification}
        </div>
      )}

      {/* Main Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Tabs List Sidebar */}
        <aside className="lg:col-span-3 flex flex-col gap-1.5 bg-white/40 backdrop-blur-md p-3 rounded-3xl border border-white/40 shadow-sm">
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2">Controls</h3>
          
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-3 w-full text-left p-2.5 rounded-2xl text-xs font-bold transition ${
              activeTab === "products"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <ShoppingBag size={16} /> Products ({products.length})
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-3 w-full text-left p-2.5 rounded-2xl text-xs font-bold transition ${
              activeTab === "orders"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <Truck size={16} /> Order Management ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("pages")}
            className={`flex items-center gap-3 w-full text-left p-2.5 rounded-2xl text-xs font-bold transition ${
              activeTab === "pages"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <FileText size={16} /> Page Builder ({pages.length})
          </button>

          <button
            onClick={() => setActiveTab("sliders")}
            className={`flex items-center gap-3 w-full text-left p-2.5 rounded-2xl text-xs font-bold transition ${
              activeTab === "sliders"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <Sliders size={16} /> Promotional Sliders ({settings.sliders.length})
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3 w-full text-left p-2.5 rounded-2xl text-xs font-bold transition ${
              activeTab === "settings"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <Settings size={16} /> Branding & Settings
          </button>
        </aside>

        {/* Tab Display Area */}
        <div className="lg:col-span-9 bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-sm min-h-[500px]">
          
          {/* =================== TAB 1: PRODUCT LIST & CREATOR =================== */}
          {activeTab === "products" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                  <Plus size={18} className="text-orange-600" /> {editingProduct ? "Edit Product Details" : "Add New Store Product"}
                </h2>
                <p className="text-xs text-gray-500">Enter pricing, descriptions, and stock quantities to sync database.</p>
              </div>

              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wireless Noise Canceling Over-ear Headphones"
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Categories (Comma separated lists)</label>
                  <input
                    type="text"
                    placeholder="e.g. Electronics, Accessories"
                    value={pCategories}
                    onChange={(e) => setPCategories(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    placeholder="Include high quality features, measurements, specs..."
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Regular Price (৳) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sale Price (৳ - Discounted rate if applicable)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1200"
                    value={pSalePrice}
                    onChange={(e) => setPSalePrice(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">In-Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#F85606] mb-1">Flash Sale Promo status</label>
                  <div className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      id="isFlash"
                      checked={pIsFlash}
                      onChange={(e) => setPIsFlash(e.target.checked)}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="isFlash" className="text-xs text-gray-600 cursor-pointer">
                      Enable countdown flash sale visibility
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Image URLs list (Comma separated list for multi gallery images support)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. URL1, URL2 (Unsplash references or direct links)"
                    value={pImgUrl}
                    onChange={(e) => setPImgUrl(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setPTitle("");
                        setPDesc("");
                        setPPrice("");
                        setPSalePrice("");
                        setPStock("");
                        setPCategories("");
                        setPImgUrl("");
                        setPIsFlash(false);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2 px-4 rounded-xl"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#F85606] hover:bg-orange-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md transition"
                  >
                    {editingProduct ? "Compile & Update Product" : "Save and Deploy Product"}
                  </button>
                </div>
              </form>

              {/* Active Catalog List */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Active Shop Catalog ({products.length} Items)</h3>
                <div className="overflow-x-auto whitespace-nowrap">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                        <th className="p-3">Thumbnail</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <img
                              src={p.images[0]}
                              alt="thumb"
                              className="w-10 h-10 object-cover rounded-lg border bg-slate-100"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="p-3 font-semibold text-gray-800 truncate max-w-xs">{p.title}</td>
                          <td className="p-3">
                            <span className="bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              {p.categories[0]}
                            </span>
                          </td>
                          <td className="p-3 text-gray-900 font-bold">
                            ৳{p.salePrice ? p.salePrice.toLocaleString() : p.price.toLocaleString()}
                          </td>
                          <td className={`p-3 font-bold ${p.stock <= 5 ? "text-red-500" : "text-green-600"}`}>
                            {p.stock} units
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex gap-1.5">
                              <button
                                onClick={() => startEditProduct(p)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit Product"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => onDeleteProduct(p.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                title="Delete Product"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================== TAB 2: ORDER MANAGEMENT =================== */}
          {activeTab === "orders" && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="font-extrabold text-gray-900 text-base">Inbound Customer Orders</h2>
                <p className="text-xs text-gray-500">Track and dispatch customer orders securely inside Bangladesh.</p>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-semibold">
                  No orders placed yet. Take a look back later!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 gap-2">
                        <div>
                          <span className="text-[10px] bg-slate-100 text-slate-800 py-0.5 px-2 rounded-full font-bold">
                            #{ord.id}
                          </span>
                          <span className="text-xs text-gray-500 block mt-1">
                            Placed on: {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-600">Status:</span>
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              onUpdateOrderStatus(ord.id, e.target.value as any)
                            }
                            className={`text-xs font-extrabold p-1.5 rounded-lg border focus:outline-none ${
                              ord.status === "Pending"
                                ? "bg-amber-50 text-amber-600 border-amber-300"
                                : ord.status === "Shipped"
                                ? "bg-blue-50 text-blue-600 border-blue-300"
                                : "bg-green-50 text-green-600 border-green-300"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>

                      {/* Recipient Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Customer Delivery Details</h4>
                          <p><strong>Name:</strong> {ord.customerName}</p>
                          <p><strong>Phone:</strong> {ord.customerPhone}</p>
                          <p><strong>Email:</strong> {ord.customerEmail || "N/A"}</p>
                          <p><strong>Address:</strong> {ord.shippingAddress}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Payment & Tracking</h4>
                          <p><strong>Method:</strong> {ord.paymentMethod === "COD" ? "Cash on Delivery" : ord.paymentMethod}</p>
                          {ord.paymentMethod !== "COD" && (
                            <>
                              <p><strong>Source Number:</strong> {ord.paymentNumber}</p>
                              <p><strong>Transaction ID:</strong> {ord.transactionId}</p>
                            </>
                          )}
                          <p className="mt-2 text-sm font-extrabold text-orange-600">
                            Total amount Paid/Owed: ৳{ord.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Itemized List */}
                      <div className="bg-gray-50 p-3 rounded-2xl border">
                        <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">Ordered Items</h4>
                        <div className="flex flex-col gap-2">
                          {ord.items.map((it) => (
                            <div key={it.id} className="flex justify-between items-center text-xs">
                              <span className="text-gray-700 font-medium">
                                {it.title} <strong className="text-orange-600">x{it.quantity}</strong>
                              </span>
                              <span className="font-bold text-gray-900">৳{(it.price * it.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =================== TAB 3: DYNAMIC PAGES (WORDPRESS-LIKE BUILDER) =================== */}
          {activeTab === "pages" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="font-extrabold text-gray-900 text-base">Dynamic WordPress Page Creator</h2>
                <p className="text-xs text-gray-500">Inject customized terms, about sections, guidelines, or static text campaigns.</p>
              </div>

              <form onSubmit={handlePageSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Page Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Return and Refund Guidelines"
                      value={pageTitle}
                      onChange={(e) => {
                        setPageTitle(e.target.value);
                        setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                      }}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Page Slug (Unique URL Path) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. refund-rules"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Page Content (HTML supported for dynamic headers/images)</label>
                  <textarea
                    rows={8}
                    required
                    placeholder="<h2>Write beautiful formatted terms context here...</h2><p>This is standard markup language.</p>"
                    value={pageContent}
                    onChange={(e) => setPageContent(e.target.value)}
                    className="w-full font-mono text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-950 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md transition"
                  >
                    Publish Page instantly
                  </button>
                </div>
              </form>

              {/* Published Custom Pages Grid */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Live Dynamic Pages ({pages.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pages.map((p) => (
                    <div
                      key={p.slug}
                      className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold text-gray-800 text-xs">{p.title}</h4>
                        <span className="text-[10px] font-mono text-gray-400 hover:underline block cursor-pointer">
                          /pages/{p.slug}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (p.isSystem) {
                            return triggerNotification("Cannot delete vital system templates.");
                          }
                          onDeletePage(p.slug);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded transition"
                        title="Delete custom page"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================== TAB 4: SLIDERS & MARKETING CAMPAIGN =================== */}
          {activeTab === "sliders" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="font-extrabold text-gray-900 text-base">Home promotional sliders builder</h2>
                <p className="text-xs text-gray-500">Inject carousel imagery with elegant titles and custom action targets.</p>
              </div>

              <form onSubmit={handleSliderSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Slide Title Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exclusive Gadget Festival"
                    value={sliderTitle}
                    onChange={(e) => setSliderTitle(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Slide Subtitle Promo text</label>
                  <input
                    type="text"
                    placeholder="e.g. Up to 40% Off on Smartphone collections"
                    value={sliderSubtitle}
                    onChange={(e) => setSliderSubtitle(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Banner Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://images.unsplash.com/..."
                    value={sliderImg}
                    onChange={(e) => setSliderImg(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Action Link Destination Path (Route)</label>
                  <input
                    type="text"
                    placeholder="e.g. /#Electronics (or category name)"
                    value={sliderLink}
                    onChange={(e) => setSliderLink(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-950 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md transition"
                  >
                    Save & Inject Slider Slot
                  </button>
                </div>
              </form>

              {/* Slider Inventory Panel */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Active Hero Sliders</h3>
                <div className="flex flex-col gap-3">
                  {settings.sliders.map((sl) => (
                    <div
                      key={sl.id}
                      className="bg-gray-50 border rounded-2xl p-3 flex gap-3 items-center justify-between"
                    >
                      <img
                        src={sl.imageUrl}
                        alt="slider thumb"
                        className="w-16 h-10 object-cover rounded-lg border bg-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-xs truncate">{sl.title}</h4>
                        <span className="text-[10px] text-gray-400 block truncate">{sl.subtitle}</span>
                      </div>
                      <button
                        onClick={() => removeSlider(sl.id)}
                        className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
                        title="Delete Slider"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================== TAB 5: META BRANDING SETTINGS =================== */}
          {activeTab === "settings" && (
            <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="font-extrabold text-gray-900 text-base">Branding & Layout Configuration</h2>
                <p className="text-xs text-gray-500">Configure store primary company title, active banners, assets and contact widgets instantly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Store title Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company Site Name *</label>
                  <input
                    type="text"
                    required
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Logo Headline Text</label>
                  <input
                    type="text"
                    required
                    value={lgText}
                    onChange={(e) => setLgText(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Site Logo URL (or empty for Default letter logo)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={lgUrl}
                    onChange={(e) => setLgUrl(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                {/* Helpline info */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Helpline Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phn}
                    onChange={(e) => setPhn(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Support Email Address *</label>
                  <input
                    type="email"
                    required
                    value={eml}
                    onChange={(e) => setEml(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                {/* Secure Payment details */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#D12053] mb-1">bKash Send Money No. *</label>
                    <input
                      type="text"
                      required
                      value={bNo}
                      onChange={(e) => setBNo(e.target.value)}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#F15A22] mb-1">Nagad Cash No. *</label>
                    <input
                      type="text"
                      required
                      value={nNo}
                      onChange={(e) => setNNo(e.target.value)}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-950 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md transition"
                >
                  Synchronize and Refresh Setup
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
