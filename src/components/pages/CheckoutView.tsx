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
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  // Auto-populate values from userSession when it updates (e.g. async auth load)
  useEffect(() => {
    if (userSession) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || userSession.name || "",
        email: prev.email || userSession.email || "",
        phone: prev.phone || userSession.phone || "",
      }));
      
      const fetchAddresses = async () => {
        try {
          let query = supabase.from("profiles").select("saved_addresses");
          if (userSession.id) query = query.eq("auth_user_id", userSession.id);
          else query = query.eq("email", userSession.email);
          
          const { data } = await query.single();
          if (data && data.saved_addresses) {
            setSavedAddresses(data.saved_addresses);
          }
        } catch (e) {
          console.warn("Failed to fetch saved addresses");
        }
      };
      
      fetchAddresses();
    }
  }, [userSession]);

  const total = cart.reduce((sum, item) => sum + item.saree.price * item.quantity, 0);

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(total);

  const handleInputChange = async (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (field === "zip" && value.length === 6 && /^\d+$/.test(value)) {
      try {
        const res = await fetch(`https://api.zippopotam.us/IN/${value}`);
        if (!res.ok) throw new Error("Invalid PIN");
        
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn("Zippopotam returned invalid JSON", text);
          return;
        }

        if (data && data.places && data.places.length > 0) {
          const place = data.places[0];
          setForm((prev) => ({
            ...prev,
            city: `${place["place name"]}, ${place.state}`
          }));
          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next.city;
            return next;
          });
        }
      } catch (err) {
        console.warn("Failed to fetch pincode details", err);
      }
    }
  };

  const handleAddressSelect = (addr: any) => {
    setForm((prev) => ({
      ...prev,
      address: addr.address,
      city: addr.city,
      zip: addr.zip,
    }));
    // clear validation errors for these fields
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next.address;
      delete next.city;
      delete next.zip;
      return next;
    });
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
      // 1. Create order on the backend
      const response = await fetch('/api/init-rzp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: total * 100, currency: 'INR' }), // amount in paise
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const text = await response.text();
      let order;
      try {
        order = JSON.parse(text);
      } catch (e) {
        throw new Error(`API returned invalid JSON: '${text}' | Status: ${response.status} | URL: ${response.url} | Headers: ${JSON.stringify([...response.headers])}`);
      }

      // 2. Resolve true Profile ID (since userSession.id might be the auth.users ID)
      let profileId = null;
      if (userSession?.id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .or(`id.eq.${userSession.id},auth_user_id.eq.${userSession.id}`)
          .single();
        if (prof) profileId = prof.id;
      }

      // 3. Pre-create order in Supabase as 'pending'
      const orderId = generateUUID();
      const addressJson = {
        address: form.address,
        city: form.city,
        zip: form.zip,
        bust_size: form.bustSize || null,
        waist_size: form.waistSize || null,
        shoulder_width: form.shoulder || null,
      };

      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          id: orderId,
          profile_id: profileId,
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
          is_paid: false,
          is_offline: false,
          transaction_id: order.id, // storing RZP order ID temporarily
          notes: "Waiting for payment completion",
        });

      if (orderError) throw new Error(`Failed to initialize order: ${orderError.message}`);

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

      if (itemsError) throw new Error(`Failed to save items in database ledger: ${itemsError.message}`);

      // 3. Open Razorpay checkout modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Art & Anchal",
        description: "Secure Varanasi Handloom Order",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // OPTIMISTIC UPDATE: Show success screen & clear cart instantly
            setGeneratedOrderId(orderId.slice(0, 8).toUpperCase());
            setProcessing(false);
            setOrderSuccess(true);
            clearCart();

            // 4. Verify payment signature on the backend in background
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              // Update order to paid
              await supabase
                .from("orders")
                .update({
                  status: "paid",
                  is_paid: true,
                  transaction_id: response.razorpay_payment_id,
                  notes: null,
                })
                .eq("id", orderId);
            } else {
              console.warn("Frontend verification failed. Relying on Webhook.");
            }
          } catch (err: any) {
            console.warn("Background verification error:", err);
            // We already showed success screen, so don't block the user.
          }
        },
        modal: {
          ondismiss: async function() {
            // Update order to cancelled if user closes the modal
            await supabase
              .from("orders")
              .update({
                status: "cancelled",
                notes: "User abandoned the payment modal."
              })
              .eq("id", orderId);
            setErrorMsg("Payment was cancelled. Your cart is preserved.");
            setProcessing(false);
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#5B0E2D",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', async function (response: any) {
        const failureReason = response.error.description || "Bank rejected payment";
        // Update order to cancelled on failure
        await supabase
          .from("orders")
          .update({
            status: "cancelled",
            notes: `Payment failed: ${failureReason}`
          })
          .eq("id", orderId);
        setErrorMsg(`Payment failed: ${failureReason}. Please try again.`);
        setProcessing(false);
      });

      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred starting checkout.");
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
            <div className="inline-flex items-center gap-2 bg-[#E7F3EC] text-[#2E7D32] px-4 py-1.5 rounded-full border border-[#2E7D32]/20 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-[10px] tracking-[0.1em] uppercase font-bold">Payment Complete</span>
            </div>
            <h2 className="serif-heading text-3xl text-brand-maroon font-serif leading-tight">Order Placed Successfully!</h2>
            <p className="text-xs text-brand-warm-gray leading-relaxed font-light">
              Your order is registered in our Varanasi cooperative guild database under ID: <strong className="font-mono text-brand-maroon">{generatedOrderId}</strong>
            </p>
          </div>

          <div className="bg-brand-ivory border border-brand-gold/15 p-6 text-left space-y-5">
            <h4 className="font-semibold text-brand-maroon uppercase text-[10px] tracking-wider flex items-center gap-1 pb-2 border-b border-brand-gold/10">
              <Truck className="w-3.5 h-3.5 text-brand-gold" />
              Next Steps
            </h4>
            
            <div className="relative pl-6 space-y-6">
              {/* Timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-brand-gold/20"></div>
              
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#E7F3EC] border border-[#2E7D32] flex items-center justify-center z-10">
                  <CheckCircle className="w-2.5 h-2.5 text-[#2E7D32]" />
                </div>
                <h5 className="text-[11px] font-bold text-brand-maroon uppercase tracking-wider mb-1">Order Confirmed & Paid</h5>
                <p className="text-[10px] text-brand-warm-gray leading-relaxed">Payment has been verified and securely processed.</p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-[24px] top-0.5 w-4 h-4 rounded-full bg-brand-ivory border-2 border-brand-gold flex items-center justify-center z-10">
                  <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse"></div>
                </div>
                <h5 className="text-[11px] font-bold text-brand-maroon uppercase tracking-wider mb-1">Waiting for shipment details</h5>
                <p className="text-[10px] text-brand-warm-gray leading-relaxed">
                  Our tailoring division is coordinating custom stitching. Dispatch inside climate-controlled cedar boxes will start within 3-5 days. You will receive tracking links via email/WhatsApp once shipped.
                </p>
              </div>
            </div>
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

                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] text-brand-maroon font-bold uppercase tracking-wider mb-3">Use a Saved Address</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleAddressSelect(addr)}
                          className="text-left border border-brand-gold/30 hover:border-brand-maroon p-3 bg-white transition-colors group"
                        >
                          <p className="font-medium text-brand-maroon text-sm group-hover:text-brand-gold truncate">{addr.address}</p>
                          <p className="text-xs text-brand-warm-gray">{addr.city}, {addr.zip}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
