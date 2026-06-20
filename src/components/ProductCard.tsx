import React from "react";
import { ShoppingCart, Eye, Sparkles } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onViewDetail: (product: Product) => void;
  onAddToCart: (product: Product, qty?: number) => void;
}

export default function ProductCard({ product, onViewDetail, onAddToCart }: ProductCardProps) {
  const originalPrice = product.price;
  const currentPrice = product.salePrice || product.price;
  const hasDiscount = originalPrice > currentPrice;

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between h-full">
      <div onClick={() => onViewDetail(product)} className="flex-1">
        {/* Dynamic Image Container */}
        <div className="h-44 bg-slate-100 rounded-2xl mb-4 overflow-hidden relative group-hover:shadow-md transition duration-300">
          {hasDiscount && (
            <span className="absolute top-2.5 left-2.5 bg-orange-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-sm z-10 animate-pulse">
              -{product.discountRate || Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}%
            </span>
          )}
          {product.isFlashSale && (
            <span className="absolute top-2.5 right-2.5 bg-yellow-400 text-gray-900 font-extrabold text-[9px] px-2 py-1 rounded-full shadow-sm z-10 uppercase tracking-wider flex items-center gap-0.5">
              <Sparkles size={10} /> Flash
            </span>
          )}
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold italic bg-slate-200">
              Sera Deal BD
            </div>
          )}
        </div>

        {/* Product Meta */}
        <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-1 line-clamp-2 hover:text-orange-600 transition">
          {product.title}
        </h3>
        
        {/* Stock Status Indicator */}
        <div className="mb-2">
          {product.stock > 0 ? (
            <span className="text-[10px] bg-green-500/10 text-green-700 px-2 py-0.5 rounded-full font-semibold">
              স্টকে আছে ({product.stock} left)
            </span>
          ) : (
            <span className="text-[10px] bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full font-semibold">
              স্টক শেষ (Out of Stock)
            </span>
          )}
        </div>
      </div>

      {/* Pricing and Action Drawer */}
      <div className="mt-2 border-t border-white/40 pt-3 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-orange-600 font-extrabold text-base md:text-lg">
              ৳{currentPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-slate-400 text-xs line-through">
                ৳{originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Multi Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetail(product)}
            className="flex items-center justify-center gap-1.5 border border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-600 font-bold text-xs py-2 px-1 rounded-xl transition duration-200 focus:outline-none"
          >
            <Eye size={13} /> Views
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.stock <= 0}
            className={`flex items-center justify-center gap-1 bg-[#F85606] text-white hover:bg-orange-700 font-bold text-xs py-2 px-1 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ShoppingCart size={13} /> Buy
          </button>
        </div>
      </div>
    </div>
  );
}
