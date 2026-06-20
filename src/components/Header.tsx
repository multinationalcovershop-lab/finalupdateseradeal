import React from "react";
import { Search, ShoppingCart, ShieldAlert, Truck, Menu, Phone, Mail, X } from "lucide-react";
import { AppSettings } from "../types";

interface HeaderProps {
  settings: AppSettings;
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export default function Header({
  settings,
  cartCount,
  onOpenCart,
  onNavigate,
  currentRoute,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Safe destructuring of properties with robust fallback values to completely prevent any undefined/null type crashes
  const companyName = settings?.companyName || "Sera Deal BD";
  const contactPhone = settings?.contactPhone || "01305962300";
  const contactEmail = settings?.contactEmail || "info@seradealbd.com";
  const logoUrl = settings?.logoUrl || "";
  const categories = settings?.categories || [];
  const headerLinks = settings?.headerLinks || [];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md text-gray-800">
      {/* Top Notification Bar */}
      <div className="bg-orange-600 text-white text-xs py-1 px-4 hidden md:flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Phone size={12} /> Helpline: {contactPhone}
          </span>
          <span className="flex items-center gap-1">
            <Mail size={12} /> Email: {contactEmail}
          </span>
        </div>
        <div className="flex items-center gap-4 font-medium">
          <span>৳ Cash on Delivery / bKash / Nagad</span>
          <button 
            onClick={() => onNavigate("admin")} 
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[11px] transition"
          >
            <ShieldAlert size={11} /> Admin Panel
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="md:hidden text-gray-600 hover:text-orange-600 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          
          <div 
            onClick={() => {
              onNavigate("home");
              setSelectedCategory("");
            }}
            className="cursor-pointer flex items-center gap-2"
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={companyName} 
                className="h-10 max-w-[150px] object-contain rounded" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                S
              </div>
            )}
            <span className="font-extrabold text-xl md:text-2xl tracking-tight text-gray-900">
              <span className="text-orange-600">{(companyName || "").split(" ")[0]}</span>
              <span className="text-gray-800"> { (companyName || "").split(" ").slice(1).join(" ") }</span>
            </span>
          </div>
        </div>

        {/* Search Bar - Centers on Large Screens */}
        <div className="flex-1 max-w-xl relative hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="পণ্য খুঁজুন (Search products by title or description)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentRoute !== "home") onNavigate("home");
              }}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-4">
          {/* Tracking Button */}
          <button
            onClick={() => onNavigate("tracking")}
            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg transition ${
              currentRoute === "tracking"
                ? "bg-orange-100 text-orange-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-orange-600"
            }`}
          >
            <Truck size={18} className="text-orange-500" />
            <span className="hidden sm:inline">অর্ডার ট্র্যাকিং (Track Order)</span>
          </button>

          {/* Cart Icon Widget */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition focus:outline-none"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sub-header / Categories Nav Menu */}
      <div className="border-t border-gray-100 bg-gray-50 py-2 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs md:text-sm overflow-x-auto whitespace-nowrap scrollbar-none">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setSelectedCategory("");
                onNavigate("home");
              }}
              className={`font-semibold py-1 px-2 rounded-full transition ${
                selectedCategory === "" && currentRoute === "home"
                  ? "bg-orange-600 text-white"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  onNavigate("home");
                }}
                className={`font-medium py-1 px-3 rounded-full transition ${
                  selectedCategory === cat && currentRoute === "home"
                    ? "bg-orange-600 text-white"
                    : "text-gray-600 hover:text-orange-600 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 border-l pl-4 border-gray-200">
            {headerLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.url.startsWith("/pages/")) {
                    onNavigate(`page-${link.url.replace("/pages/", "")}`);
                  } else if (link.url === "/tracking") {
                    onNavigate("tracking");
                  } else {
                    onNavigate("home");
                  }
                }}
                className="text-gray-500 hover:text-orange-600 font-medium py-1"
              >
                {link.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar & Search (Responsive Drawer) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden flex justify-start animate-fade-in">
          <div className="w-72 bg-white h-full p-5 flex flex-col shadow-2xl relative animate-slide-right">
            <button 
              onClick={() => setMenuOpen(false)}
              className="absolute right-4 top-4 p-1 text-gray-500 hover:bg-orange-50 rounded"
            >
              <X size={20} />
            </button>

            <span className="font-extrabold text-lg text-orange-600 mb-6">Sera Deal BD</span>

            {/* Mobile Search */}
            <div className="relative mb-5">
              <input
                type="text"
                placeholder="পণ্য খুঁজুন..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentRoute !== "home") onNavigate("home");
                }}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <Search className="absolute right-2 top-2.5 text-gray-400" size={14} />
            </div>

            <div className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Categories</div>
            <div className="flex flex-col gap-1 mb-6">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  onNavigate("home");
                  setMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded text-xs ${
                  selectedCategory === "" && currentRoute === "home" ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    onNavigate("home");
                    setMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded text-xs ${
                    selectedCategory === cat && currentRoute === "home" ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Useful Links</div>
            <div className="flex flex-col gap-2">
              {headerLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.url.startsWith("/pages/")) {
                      onNavigate(`page-${link.url.replace("/pages/", "")}`);
                    } else if (link.url === "/tracking") {
                      onNavigate("tracking");
                    } else {
                      onNavigate("home");
                    }
                    setMenuOpen(false);
                  }}
                  className="text-left text-gray-600 hover:text-orange-600 text-xs py-1 px-3"
                >
                  {link.text}
                </button>
              ))}
              <div className="border-t border-gray-100 pt-3 mt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onNavigate("admin");
                    setMenuOpen(false);
                  }}
                  className="w-full bg-gray-100 ring-1 ring-gray-200 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-medium py-2 rounded text-xs text-center"
                >
                  Admin Panel Access
                </button>
                <div className="text-[10px] text-gray-400 text-center mt-4">
                  Helpline: {contactPhone}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
