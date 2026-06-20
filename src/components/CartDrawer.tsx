import React, { useState } from "react";
import { X, Trash2, ArrowRight, CreditCard, ShoppingBag, ShieldCheck } from "lucide-react";
import { Product, AppSettings } from "../types";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  settings: AppSettings;
  onCheckout: (shippingDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
    paymentMethod: "COD" | "bKash" | "Nagad";
    paymentNumber: string;
    transactionId: string;
  }) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  settings,
  onCheckout,
}: CartDrawerProps) {
  const [step, setStep] = useState<"cart" | "shipping">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "bKash" | "Nagad">("COD");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [formError, setFormError] = useState("");

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );

  const deliveryCharge = subtotal > 0 ? 120 : 0; // standard delivery flat in BD
  const grandTotal = subtotal + deliveryCharge;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) return setFormError("গ্রাহকের নাম আবশ্যক।");
    if (!phone.trim()) return setFormError("সঠিক মোবাইল নাম্বার আবশ্যক।");
    if (phone.trim().length < 11) return setFormError("মোবাইল নাম্বার কমপক্ষে ১১ ডিজিট হতে হবে।");
    if (!address.trim()) return setFormError("সম্পূর্ণ ডেলিভারি ঠিকানা আবশ্যক।");

    if (paymentMethod !== "COD") {
      if (!paymentNumber.trim() || !transactionId.trim()) {
        return setFormError("পেমেন্ট মোবাইল নম্বর এবং ট্রানজেকশন আইডি প্রদান করুন।");
      }
    }

    onCheckout({
      name,
      phone,
      email,
      address,
      paymentMethod,
      paymentNumber,
      transactionId,
    });

    // Reset workflow states
    setStep("cart");
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setPaymentNumber("");
    setTransactionId("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-lg border-l border-white/20 h-full flex flex-col shadow-2xl relative animate-slide-right">
        {/* Cart Drawer Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-orange-600" size={20} />
            <h2 className="font-extrabold text-gray-900 text-base">
              {step === "cart" ? "আপনার শপিং কার্ট" : "ডেলিভারি তথ্য ও পেমেন্ট"}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-gray-100 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* View Transition Controls */}
        {step === "cart" ? (
          /* =================== STEP 1: CART DISPLAY =================== */
          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="relative mb-4">
                  <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <ShoppingBag size={28} />
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">কার্টটি খালি আছে</h3>
                <p className="text-xs text-gray-500 max-w-[240px] mb-6">
                  আপনার কাঙ্খিত পণ্যগুলো খুঁজুন এবং কার্টে যোগ করুন।
                </p>
                <button
                  onClick={onClose}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2 px-6 rounded-lg transition"
                >
                  কেনাকাটা করুন
                </button>
              </div>
            ) : (
              <div className="flex-col flex gap-4">
                {cartItems.map((item) => {
                  const productPrice = item.product.salePrice || item.product.price;
                  return (
                    <div
                      key={item.product.id}
                      className="flex gap-3 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:border-orange-200 transition"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-xl border"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                            {item.product.categories[0]}
                          </span>
                          <h4 className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-1">
                            {item.product.title}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-orange-600">
                            ৳{productPrice.toLocaleString()} {item.quantity > 1 && `x ${item.quantity}`}
                          </span>
                          
                          {/* Increment Decrement Container */}
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 font-extrabold"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-xs font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 font-extrabold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-500 self-start p-1 hover:bg-red-50 rounded"
                        title="Remove product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* =================== STEP 2: SHIIPING & PAYMENTS =================== */
          <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 py-1.5 px-3 rounded-lg block font-semibold">
                ডেলিভারি সম্পন্ন হতে ৩-৫ দিন সময় নিতে বিজ্ঞানসম্মতভাবে ডিজাইন করা হয়েছে।
              </span>

              {formError && (
                <div className="text-xs bg-red-50 border border-red-100 text-red-600 py-1.5 px-3 rounded-lg font-bold">
                  ⚠️ {formError}
                </div>
              )}

              {/* Recipient Details */}
              <div className="flex flex-col gap-3">
                <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">
                  Contact Information
                </h3>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    গ্রাহকের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. মোঃ হুজাইফা রহমান"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ইমেইল (ঐচ্ছিক)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    সম্পূর্ণ ডেলিভারি ঠিকানা *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. বাসা নং ৪, রোড ১০, সেক্টর ৬, উত্তরা, ঢাকা"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">
                  Payment Method
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                      paymentMethod === "COD"
                        ? "border-orange-500 bg-orange-50/50 text-orange-600 font-bold"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span className="text-[10px] block font-semibold mb-0.5">COD</span>
                    <span className="text-[9px] block text-gray-400">ক্যাশ অন ডেলিভারি</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bKash")}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                      paymentMethod === "bKash"
                        ? "border-[#D12053] bg-pink-50/50 text-[#D12053] font-bold"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span className="text-[10px] block font-semibold mb-0.5 text-center">bKash</span>
                    <span className="text-[9px] block text-gray-400">বিকাশ পেমেন্ট</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Nagad")}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                      paymentMethod === "Nagad"
                        ? "border-[#F15A22] bg-orange-50 text-[#F15A22] font-bold"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span className="text-[10px] block font-semibold mb-0.5">Nagad</span>
                    <span className="text-[9px] block text-gray-400">নগদ পেমেন্ট</span>
                  </button>
                </div>

                {/* Conditional Payment Verification Prompts */}
                {paymentMethod !== "COD" && (
                  <div className="bg-pink-50/30 border border-gray-200 rounded-xl p-3 text-xs flex flex-col gap-2">
                    <p className="text-gray-700">
                      অনুগ্রহ করে নিম্নোক্ত {paymentMethod} নম্বরে মোট ৳{grandTotal.toLocaleString()} সেন্ড মানি করুন:
                    </p>
                    <div className="bg-white/80 p-2 rounded border border-orange-100 text-center font-bold text-gray-800 text-sm select-all">
                      {paymentMethod === "bKash" ? settings.bkashNumber : settings.nagadNumber}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">যে নম্বর থেকে পাঠিয়েছেন</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 01712XXXXXX"
                          value={paymentNumber}
                          onChange={(e) => setPaymentNumber(e.target.value)}
                          className="w-full text-[11px] p-2 bg-white border border-gray-200 rounded focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">ট্রানজেকশন আইডি (Txnid)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. K9X4BDS82"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="w-full text-[11px] p-2 bg-white border border-gray-200 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-[#F85606] hover:bg-orange-700 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} /> অর্ডার কনফার্ম করুন (৳{grandTotal.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="w-full text-center text-xs text-gray-500 underline mt-3 hover:text-orange-600 block"
              >
                কার্টে ফিরে যান
              </button>
            </div>
          </form>
        )}

        {/* Pricing Subtotal Bottom Drawer Card */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 relative z-10">
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>পণ্যের উপ-মোট:</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ডেলিভারি চার্জ:</span>
                <span>৳{deliveryCharge.toLocaleString()}</span>
              </div>
              <hr className="my-1 border-gray-200" />
              <div className="flex justify-between font-extrabold text-gray-900 text-sm">
                <span>মোট বিল:</span>
                <span className="text-orange-600">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {step === "cart" && (
              <button
                onClick={() => setStep("shipping")}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg hover:shadow-orange-200 transition-all duration-200 flex items-center justify-center gap-2"
              >
                পরবর্তী ধাপে যান <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
