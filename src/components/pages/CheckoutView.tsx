/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent, useEffect } from "react";
import { ViewState, CartItem } from "../../types";
import { CreditCard, ShieldCheck, CheckCircle, Truck, ShoppingBag, FileText, RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface CheckoutViewProps {
  cart: CartItem[];
  clearCart: () => void;
  setView: (view: ViewState) => void;
  userSession?: { id?: string; name: string; email: string; phone?: string } | null;
}

// Client-side UUID generator to align RLS insertions without needing .select()
const generateUUID = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function CheckoutView({ cart, clearCart, setView, userSession }: CheckoutViewProps) {
  const [form, setForm] = useState({
    name: userSession?.name || "",
    email: userSession?.email || "",
    phone: userSession?.phone || "",
    address: "",
    zip: "",
    city: "",
    bustSize: "",
    waistSize: "",
    shoulder: "",
    paymentMethod: "card"
  });

  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Auto-populate values from userSession when it updates (e.g. async auth load)
  useEffect(() => {
    if (userSession) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || userSession.name || "",
        email: prev.email || userSession.email || "",
        phone: prev.phone || userSession.phone || "",
      }));
    }
  }, [userSession]);

  const total = cart.reduce((sum, item) => sum + item.saree.price * item.quantity, 0);

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(total);

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Full name is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else {
      const cleanPhone = form.phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        errors.phone = "Please enter a valid 10-digit phone number";
      }
    }

    if (!form.address.trim()) errors.address = "Delivery address is required";
    if (!form.city.trim()) errors.city = "City is required";
    
    if (!form.zip.trim()) {
      errors.zip = "ZIP/Postal code is required";
    } else if (form.zip.trim().length < 5) {
      errors.zip = "Please enter a valid postal code";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setProcessing(true);
    setErrorMsg("");

    try {
      const orderId = generateUUID();
      const addressJson = {
        address: form.address,
        city: form.city,
        zip: form.zip,
        bust_size: form.bustSize || null,
        waist_size: form.waistSize || null,
        shoulder_width: form.shoulder || null,
      };

      // 1. Create order record with schema-correct fields
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          id: orderId,
          profile_id: userSession?.id || null,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone || null,
          shipping_address: addressJson,
          subtotal: total,
          discount: 0,
          tax: 0,
          total: total,
          status: "pending",
          payment_mode: form.paymentMethod as any,
          is_paid: true,
          is_offline: false,
          notes: null,
        });

      if (orderError) {
        setErrorMsg(`Failed to record order: ${orderError.message}`);
        setProcessing(false);
        return;
      }

      // 2. Create order items records, ensuring the required product_name is included
      const itemsToInsert = cart.map((item) => ({
        order_id: orderId,
        saree_id: item.saree.id,
        product_name: item.saree.name,
        unit_price: item.saree.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) {
        setErrorMsg(`Failed to save items in database ledger: ${itemsError.message}`);
        setProcessing(false);
        return;
      }

      setGeneratedOrderId(orderId.slice(0, 8).toUpperCase());
      setProcessing(false);
      setOrderSuccess(true);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred processing your checkout.");
      setProcessing(false);
    }
  };

  const handleReturnHome = () => {
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (orderSuccess) {
    return (
      <div className="bg-[#FDFBF7] min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans animate-fade-in" id="order-success-pane">
        <div className="max-w-xl w-full bg-[#FAF7F2] border border-brand-gold/30 p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#E7F3EC] border border-[#2E7D32]/25 mx-auto flex items-center justify-center text-[#2E7D32]">
            <CheckCircle className="w-8 h-8 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.2em] uppercase text-brand-gold font-bold">Secure Order Verified</span>
            <h2 className="serif-heading text-3xl text-brand-maroon font-serif leading-tight">Order Placed Successfully!</h2>
            <p className="text-xs text-brand-warm-gray leading-relaxed font-light">
              Your order is registered in our Varanasi cooperative guild database under ID: <strong className="font-mono text-brand-maroon">{generatedOrderId}</strong>
            </p>
          </div>

          <div className="bg-brand-ivory border border-brand-gold/15 p-5 text-left text-xs text-brand-warm-gray space-y-3">
            <h4 className="font-semibold text-brand-maroon uppercase text-[10px] tracking-wider flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-brand-gold" />
              What happens next?
            </h4>
            <p>1. Our tailoring division will coordinate blouse custom stitching guides via email within 12 business hours.</p>
            <p>2. You will receive real loom photographs/videos of our family finishing your saree’s pallu before final conservation packing.</p>
            <p>3. Dispatch inside climate-controlled signature cedar boxes starts within 3-5 working days with global tracking codes.</p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleReturnHome}
              className="bg-brand-maroon hover:bg-[#3E061E] text-brand-ivory text-xs tracking-widest uppercase py-4 px-10 transition duration-300 font-semibold cursor-pointer shadow-md"
              id="success-return-home-btn"
            >
              Continue Heritage Journey
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans" id="checkout-view-container">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-2 pb-8 border-b border-brand-gold/15">
          <span className="text-[10px] tracking-[0.25em] uppercase text-brand-gold font-bold">Secure Gateway</span>
          <h1 className="serif-heading text-3xl sm:text-4.5xl text-brand-maroon font-serif font-light">Curated Checkout</h1>
        </div>

        {/* Zero items check */}
        {cart.length === 0 ? (
          <div className="py-24 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-brand-sand mx-auto flex items-center justify-center text-brand-maroon/60">
              <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
            </div>
            <h3 className="serif-heading text-xl text-brand-maroon">No sarees currently in bag</h3>
            <button
              onClick={() => setView("shop")}
              className="bg-brand-maroon text-brand-ivory text-xs tracking-widest uppercase py-3.5 px-8 cursor-pointer font-semibold shadow-md"
              id="empty-checkout-explore-btn"
            >
              Return to Catalog
            </button>
          </div>
        ) : (
          /* Checkout Forms grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Block: Address, custom sizing, payment */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8 text-xs text-brand-maroon">
              
              {/* Shipping form */}
              <div className="bg-[#FAF7F2] border border-brand-gold/25 p-6 sm:p-8 space-y-4">
                <h3 className="serif-heading text-xl font-serif text-brand-maroon tracking-wide pb-2 border-b border-brand-gold/15">
                  Insured Delivery Coordinates
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="shipping-name" className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`w-full bg-brand-ivory border ${validationErrors.name ? 'border-[#B64545]' : 'border-brand-gold/30'} rounded-none px-4 py-3 placeholder-brand-warm-gray/50`}
                      id="shipping-name"
                    />
                    {validationErrors.name && (
                      <span className="text-[#B64545] text-[10px] block mt-0.5">{validationErrors.name}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="shipping-email" className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider block">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full bg-brand-ivory border ${validationErrors.email ? 'border-[#B64545]' : 'border-brand-gold/30'} rounded-none px-4 py-3 placeholder-brand-warm-gray/50`}
                      id="shipping-email"
                    />
                    {validationErrors.email && (
                      <span className="text-[#B64545] text-[10px] block mt-0.5">{validationErrors.email}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="shipping-phone" className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider block">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`w-full bg-brand-ivory border ${validationErrors.phone ? 'border-[#B64545]' : 'border-brand-gold/30'} rounded-none px-4 py-3 placeholder-brand-warm-gray/50`}
                      id="shipping-phone"
                    />
                    {validationErrors.phone && (
                      <span className="text-[#B64545] text-[10px] block mt-0.5">{validationErrors.phone}</span>
                    )}
                  </div>
                  <div className="space-y-1.5 font-sans">
                    <label htmlFor="shipping-city" className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider block">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={`w-full bg-brand-ivory border ${validationErrors.city ? 'border-[#B64545]' : 'border-brand-gold/30'} rounded-none px-4 py-3 placeholder-brand-warm-gray/50`}
                      id="shipping-city"
                    />
                    {validationErrors.city && (
                      <span className="text-[#B64545] text-[10px] block mt-0.5">{validationErrors.city}</span>
                    )}
                  </div>
                  <div className="space-y-1.5 font-sans">
                    <label htmlFor="shipping-zip" className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider block">Zip / Postal Code</label>
                    <input
                      type="text"
                      value={form.zip}
                      onChange={(e) => handleInputChange("zip", e.target.value)}
                      className={`w-full bg-brand-ivory border ${validationErrors.zip ? 'border-[#B64545]' : 'border-brand-gold/30'} rounded-none px-4 py-3 placeholder-brand-warm-gray/50`}
                      id="shipping-zip"
                    />
                    {validationErrors.zip && (
                      <span className="text-[#B64545] text-[10px] block mt-0.5">{validationErrors.zip}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="shipping-address" className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider block">Insured Delivery Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={`w-full bg-brand-ivory border ${validationErrors.address ? 'border-[#B64545]' : 'border-brand-gold/30'} rounded-none px-4 py-3 placeholder-brand-warm-gray/50`}
                    placeholder="Street Address, Apartment number, landmarks..."
                    id="shipping-address"
                  />
                  {validationErrors.address && (
                    <span className="text-[#B64545] text-[10px] block mt-0.5">{validationErrors.address}</span>
                  )}
                </div>
              </div>

              {/* Heavy gold sewing sizing parameters (Trigger ONLY if activated blouse stich) */}
              <div className="bg-[#FAF7F2] border border-brand-gold/25 p-6 sm:p-8 space-y-4">
                <h3 className="serif-heading text-xl font-serif text-brand-maroon tracking-wide pb-2 border-b border-brand-gold/15 flex items-center justify-between">
                  <span>Custom Blouse Stitching Charters</span>
                  <span className="text-[9px] uppercase tracking-widest font-mono text-brand-gold font-normal">Optional Sittings</span>
                </h3>
                <p className="text-[11px] text-brand-warm-gray leading-relaxed">
                  Provide estimated dimensions in inches below. Our tailoring studio near Varanasi coordinates directly before cutting the heavy raw silk brocade material.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="size-bust" className="text-[9px] text-brand-maroon/90 font-bold uppercase tracking-wider block">Bust Size (inches)</label>
                    <input
                      type="text"
                      placeholder="e.g. 34"
                      value={form.bustSize}
                      onChange={(e) => setForm({ ...form, bustSize: e.target.value })}
                      className="w-full bg-brand-ivory border border-brand-gold/30 rounded-none px-3 py-2 text-center text-xs"
                      id="size-bust"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="size-waist" className="text-[9px] text-brand-maroon/90 font-bold uppercase tracking-wider block">Waist Size (inches)</label>
                    <input
                      type="text"
                      placeholder="e.g. 28"
                      value={form.waistSize}
                      onChange={(e) => setForm({ ...form, waistSize: e.target.value })}
                      className="w-full bg-brand-ivory border border-brand-gold/30 rounded-none px-3 py-2 text-center text-xs"
                      id="size-waist"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="size-shoulder" className="text-[9px] text-brand-maroon/90 font-bold uppercase tracking-wider block">Shoulder Width (inches)</label>
                    <input
                      type="text"
                      placeholder="e.g. 14"
                      value={form.shoulder}
                      onChange={(e) => setForm({ ...form, shoulder: e.target.value })}
                      className="w-full bg-brand-ivory border border-brand-gold/30 rounded-none px-3 py-2 text-center text-xs"
                      id="size-shoulder"
                    />
                  </div>
                </div>
              </div>

              {/* Payment gateways selection */}
              <div className="bg-[#FAF7F2] border border-brand-gold/25 p-6 sm:p-8 space-y-4">
                <h3 className="serif-heading text-xl font-serif text-brand-maroon tracking-wide pb-2 border-b border-brand-gold/15">
                  Sovereign India Payment Protocol
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 border border-brand-gold/20 p-4 bg-brand-ivory cursor-pointer hover:bg-brand-sand/10">
                    <input
                      type="radio"
                      name="payMethod"
                      value="card"
                      checked={form.paymentMethod === "card"}
                      onChange={() => setForm({ ...form, paymentMethod: "card" })}
                      className="accent-brand-maroon cursor-pointer"
                    />
                    <div className="flex items-center space-x-2 text-xs">
                      <CreditCard className="w-4 h-4 text-brand-gold-dark" />
                      <span>Insured Credit / Debit Cards (International gateway)</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 border border-brand-gold/20 p-4 bg-brand-ivory cursor-pointer hover:bg-brand-sand/10">
                    <input
                      type="radio"
                      name="payMethod"
                      value="upi"
                      checked={form.paymentMethod === "upi"}
                      onChange={() => setForm({ ...form, paymentMethod: "upi" })}
                      className="accent-brand-maroon cursor-pointer"
                    />
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="bg-brand-gold/10 px-1.5 py-0.5 rounded-sm text-[9px] font-bold text-brand-gold-dark border border-brand-gold/20">UPI</div>
                      <span>UPI Direct Transfer (Indian gateways)</span>
                    </div>
                  </label>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-[#FBEBEB] border border-[#B64545]/25 p-4 rounded-none text-center">
                  <span className="text-[#B64545] block font-semibold">{errorMsg}</span>
                </div>
              )}

              {/* Button Place Order submission */}
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-brand-maroon hover:bg-[#3E061E] disabled:bg-brand-maroon/50 text-brand-ivory text-xs tracking-widest uppercase font-bold py-5 transition duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                id="place-order-submit-btn"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-gold" />
                    <span>Engaging Secure Varanasi Handloom Ledger...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Insured Order ({formattedTotal})</span>
                  </>
                )}
              </button>
            </form>


            {/* Right Block: Order Ledger & Saree List Summary */}
            <aside className="lg:col-span-5 bg-brand-sand/30 border border-brand-gold/25 p-6 space-y-6">
              <h3 className="serif-heading text-lg font-serif text-brand-maroon pb-2.5 border-b border-brand-gold/15 font-semibold">
                Bespoke Order Ledger
              </h3>

              {/* Item lists */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const itemPricing = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(item.saree.price * item.quantity);

                  return (
                    <div key={item.saree.id} className="flex gap-4 items-start pb-4 border-b border-brand-gold/10">
                      <div className="w-12 h-16 bg-brand-sand border border-brand-gold/15 overflow-hidden flex-shrink-0">
                        <img
                          src={item.saree.images[0]}
                          alt={item.saree.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-serif text-[13px] font-semibold text-brand-maroon truncate leading-tight">
                          {item.saree.name}
                        </h4>
                        <span className="text-[10px] text-brand-gold block mt-0.5">
                          Volume: {item.quantity} • {item.saree.weavingTechnique}
                        </span>
                        <span className="text-[10px] text-brand-maroon font-mono font-bold block mt-1">
                          Price: {itemPricing}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Aggregations */}
              <div className="space-y-3 pt-2 text-brand-maroon text-xs">
                <div className="flex justify-between">
                  <span>Saree Order Aggregate</span>
                  <span className="font-mono">{formattedTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Global Packing</span>
                  <span className="font-mono text-brand-gold uppercase tracking-[0.05em] font-bold">Complimentary</span>
                </div>
                <div className="flex justify-between border-t border-brand-maroon/10 pt-3.5 text-base font-serif font-bold">
                  <span>Secured Grand Total:</span>
                  <span className="font-mono text-brand-maroon">{formattedTotal}</span>
                </div>
              </div>

              <div className="bg-brand-ivory border border-brand-gold/15 p-4 space-y-3 text-[11px] text-brand-warm-gray leading-relaxed">
                <h4 className="font-semibold text-brand-maroon uppercase text-[9px] tracking-widest flex items-center gap-1.5 font-sans">
                  <FileText className="w-3.5 h-3.5 text-brand-gold" />
                  Weaver Direct Agreement
                </h4>
                <p>
                  Art&Anchal guarantees this order directly engages master registered weavers inside rural Varanasi borders. You will receive an official lab certificate containing precious metal purity analysis with the physical shipment.
                </p>
              </div>

            </aside>

          </div>
        )}

      </div>
    </div>
  );
}
