/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ViewState, DbOrder, DbProfile, Saree } from "../../types";
import { supabase, isMock } from "../../lib/supabase";
import { Heart, CreditCard, User, Package, Bell, MapPin, Instagram, Phone, LogOut, ArrowRight, Settings, CheckCircle, Truck } from "lucide-react";

interface UserProfileViewProps {
  userSession: { id?: string; name: string; email: string; is_admin?: boolean; phone?: string } | null;
  setView: (view: ViewState) => void;
  setUserSession: (session: any) => void;
  wishlist?: Saree[];
  toggleFavorite?: (saree: Saree) => void;
  setQuickViewSaree?: (saree: Saree) => void;
  setSelectedSareeId?: (id: string | null) => void;
  sessionReady?: boolean; // from App.tsx — true once Supabase has confirmed auth state
}

type TabType = "profile" | "orders" | "updates" | "wishlist" | "payment";

// Minimal invoice data structure for future invoice display feature
interface InvoiceData {
  orderId: string;
  date: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export default function UserProfileView({ 
  userSession, 
  setView, 
  setUserSession,
  wishlist = [],
  toggleFavorite,
  setQuickViewSaree,
  setSelectedSareeId,
  sessionReady = true,
}: UserProfileViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [profile, setProfile] = useState<Partial<DbProfile>>({
    name: userSession?.name || "",
    email: userSession?.email || "",
    phone: userSession?.phone || "",
    saved_addresses: [],
  });

  const [newAddress, setNewAddress] = useState({ address: "", city: "", zip: "" });

  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [debugStep, setDebugStep] = useState<string>("init");

  useEffect(() => {
    // Wait for checkSession() to complete — it calls getSession() which
    // guarantees Supabase has loaded the JWT from localStorage before
    // fetchOrders() runs its own RLS-authenticated query.
    if (!sessionReady) return;

    if (!userSession) {
      setView("login-register");
      return;
    }
    fetchProfileData();
    fetchOrders();
  }, [userSession?.id, activeTab, sessionReady]);

  const fetchProfileData = async () => {
    try {
      if (!userSession?.id) return;

      setDebugStep("fetching profile data");
      let query = supabase.from("profiles").select("*").eq("auth_user_id", userSession.id);
      const { data, error } = await query.maybeSingle();
      if (data) {
        setProfile({
          id: data.id,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          // whatsapp/instagram columns don't exist yet in live DB — read safely
          whatsapp: (data as any).whatsapp || "",
          instagram: (data as any).instagram || "",
          saved_addresses: data.saved_addresses || [],
        });
      }
    } catch (err) {
      console.warn("Could not fetch profile details", err);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setDebugStep("started");
    try {
      if (!userSession?.id) {
        setOrdersLoading(false);
        setDebugStep("failed no userSession");
        return;
      }

      setDebugStep("building orders query");
      // We do not need to query the profiles table manually or apply .eq() filters.
      // The PostgreSQL RLS policy on the orders table automatically restricts 
      // the SELECT to orders matching auth.uid() or the user's email.
      let query = supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      setDebugStep("querying orders");
      const { data, error } = await query;
      
      setDebugStep("processing orders data");
      if (error) console.warn("fetchOrders error:", error.message);
      if (data) setOrders(data);
    } catch (err) {
      console.warn("Could not fetch orders", err);
      setDebugStep(`error: ${err}`);
    } finally {
      setOrdersLoading(false);
      setDebugStep(prev => prev + " -> done");
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    try {
      if (profile.id) {
        await supabase
          .from("profiles")
          .update({
            name: profile.name,
            phone: profile.phone,
            // Only update columns that exist in the live DB
            saved_addresses: profile.saved_addresses,
          })
          .eq("id", profile.id);
      } else {
        // Fallback update by email for mock
        await supabase
          .from("profiles")
          .update({
            name: profile.name,
            phone: profile.phone,
            whatsapp: profile.whatsapp,
            instagram: profile.instagram,
            saved_addresses: profile.saved_addresses,
          })
          .eq("email", profile.email);
      }

      // Update local session
      // Preserve the email string if one existed so orders still match
      const updatedSession = { 
        ...userSession, 
        name: profile.name!, 
        phone: profile.phone!, 
        email: profile.email || userSession?.email || "" 
      };
      setUserSession(updatedSession);
      localStorage.setItem("art_anchal_user", JSON.stringify(updatedSession));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.address || !newAddress.city || !newAddress.zip) return;
    
    const addressWithId = {
      ...newAddress,
      id: crypto.randomUUID(),
    };

    const updatedAddresses = [...(profile.saved_addresses || []), addressWithId];
    setProfile({ ...profile, saved_addresses: updatedAddresses });
    setNewAddress({ address: "", city: "", zip: "" });
    
    // Auto-save the new address directly to DB
    if (profile.id) {
      await supabase.from("profiles").update({ saved_addresses: updatedAddresses }).eq("id", profile.id);
    } else if (profile.email) {
      await supabase.from("profiles").update({ saved_addresses: updatedAddresses }).eq("email", profile.email);
    }
  };

  const handleZipChange = async (val: string) => {
    setNewAddress({...newAddress, zip: val});
    if (val.length === 6 && /^\d+$/.test(val)) {
      try {
        const res = await fetch(`https://api.zippopotam.us/IN/${val}`);
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
          setNewAddress(prev => ({
            ...prev,
            city: `${place["place name"]}, ${place.state}`
          }));
        }
      } catch (err) {
        console.warn("Failed to fetch pincode details", err);
      }
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    const updatedAddresses = (profile.saved_addresses || []).filter(a => a.id !== addressId);
    setProfile({ ...profile, saved_addresses: updatedAddresses });
    
    // Auto-save
    if (profile.id) {
      await supabase.from("profiles").update({ saved_addresses: updatedAddresses }).eq("id", profile.id);
    } else if (profile.email) {
      await supabase.from("profiles").update({ saved_addresses: updatedAddresses }).eq("email", profile.email);
    }
  };

  const handleLogout = async () => {
    try {
      if (!isMock) {
        await supabase.auth.signOut();
      }
      setUserSession(null);
      localStorage.removeItem("art_anchal_user");
      setView("home");
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (!userSession) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-20 font-sans selection:bg-brand-gold selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 border-b border-brand-gold/20 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="serif-heading text-4xl sm:text-5xl font-light text-brand-maroon tracking-wide">
              Welcome, <span className="font-serif italic text-brand-gold">{userSession.name.split(" ")[0]}</span>
            </h1>
            <p className="text-xs text-brand-warm-gray tracking-widest uppercase mt-4 font-bold">
              Guild Member Dashboard
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-maroon border border-brand-maroon px-6 py-3 hover:bg-brand-maroon hover:text-white transition-all w-max"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-1/4 flex-shrink-0">
            <nav className="flex lg:flex-col overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 space-x-2 lg:space-x-0 lg:space-y-2 pb-4 lg:pb-0 sticky top-16 lg:top-32 bg-[#FDFBF7] z-20">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start gap-2.5 lg:gap-4 px-4 lg:px-6 py-3.5 lg:py-4 text-[10px] lg:text-xs uppercase tracking-widest font-bold transition-all ${
                  activeTab === "profile" 
                    ? "bg-brand-maroon text-white shadow-md lg:shadow-lg" 
                    : "text-brand-warm-gray bg-brand-sand/30 lg:bg-transparent hover:bg-brand-sand hover:text-brand-maroon"
                }`}
              >
                <Settings className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === "profile" ? "text-brand-gold" : ""}`} /> <span className="whitespace-nowrap">Profile Settings</span>
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start gap-2.5 lg:gap-4 px-4 lg:px-6 py-3.5 lg:py-4 text-[10px] lg:text-xs uppercase tracking-widest font-bold transition-all ${
                  activeTab === "orders" 
                    ? "bg-brand-maroon text-white shadow-md lg:shadow-lg" 
                    : "text-brand-warm-gray bg-brand-sand/30 lg:bg-transparent hover:bg-brand-sand hover:text-brand-maroon"
                }`}
              >
                <Package className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === "orders" ? "text-brand-gold" : ""}`} /> <span className="whitespace-nowrap">Order History</span>
              </button>
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start gap-2.5 lg:gap-4 px-4 lg:px-6 py-3.5 lg:py-4 text-[10px] lg:text-xs uppercase tracking-widest font-bold transition-all ${
                  activeTab === "wishlist" 
                    ? "bg-brand-maroon text-white shadow-md lg:shadow-lg" 
                    : "text-brand-warm-gray bg-brand-sand/30 lg:bg-transparent hover:bg-brand-sand hover:text-brand-maroon"
                }`}
              >
                <Heart className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === "wishlist" ? "text-brand-gold" : ""}`} /> <span className="whitespace-nowrap">Wishlist</span>
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start gap-2.5 lg:gap-4 px-4 lg:px-6 py-3.5 lg:py-4 text-[10px] lg:text-xs uppercase tracking-widest font-bold transition-all ${
                  activeTab === "payment" 
                    ? "bg-brand-maroon text-white shadow-md lg:shadow-lg" 
                    : "text-brand-warm-gray bg-brand-sand/30 lg:bg-transparent hover:bg-brand-sand hover:text-brand-maroon"
                }`}
              >
                <CreditCard className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === "payment" ? "text-brand-gold" : ""}`} /> <span className="whitespace-nowrap">Payment Methods</span>
              </button>
              <button
                onClick={() => setActiveTab("updates")}
                className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start gap-2.5 lg:gap-4 px-4 lg:px-6 py-3.5 lg:py-4 text-[10px] lg:text-xs uppercase tracking-widest font-bold transition-all ${
                  activeTab === "updates" 
                    ? "bg-brand-maroon text-white shadow-md lg:shadow-lg" 
                    : "text-brand-warm-gray bg-brand-sand/30 lg:bg-transparent hover:bg-brand-sand hover:text-brand-maroon"
                }`}
              >
                <Bell className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === "updates" ? "text-brand-gold" : ""}`} /> <span className="whitespace-nowrap">Dispatch Updates</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-h-[500px]">
            
            {/* ── PROFILE SETTINGS TAB ───────────────────────────────── */}
            {activeTab === "profile" && (
              <div className="animate-fade-in space-y-8">
                <div className="bg-white border border-brand-gold/20 p-8 sm:p-12 shadow-sm">
                  <h2 className="font-serif text-3xl text-brand-maroon mb-2">Personal Details</h2>
                  <p className="text-xs text-brand-warm-gray mb-8">Update your contact preferences for virtual viewings and order coordination.</p>
                  
                  <form onSubmit={handleProfileSave} className="space-y-6 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-maroon block">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                          <input
                            type="text"
                            value={profile.name || ""}
                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                            className="w-full bg-brand-sand/30 border border-brand-gold/30 pl-12 pr-4 py-3 focus:outline-none focus:border-brand-maroon text-brand-maroon text-sm font-medium"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-maroon block">Email Address</label>
                        <input
                          type="email"
                          value={profile.email || ""}
                          disabled
                          className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-gray-500 text-sm font-medium cursor-not-allowed"
                        />
                        <p className="text-[9px] text-brand-warm-gray uppercase">Contact support to change email</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-maroon block">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                          <input
                            type="tel"
                            value={profile.phone || ""}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="w-full bg-brand-sand/30 border border-brand-gold/30 pl-12 pr-4 py-3 focus:outline-none focus:border-brand-maroon text-brand-maroon text-sm font-medium"
                            placeholder="+91 "
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-maroon block">WhatsApp Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                          <input
                            type="tel"
                            value={profile.whatsapp || ""}
                            onChange={(e) => setProfile({...profile, whatsapp: e.target.value})}
                            className="w-full bg-emerald-50 border border-emerald-200 pl-12 pr-4 py-3 focus:outline-none focus:border-emerald-600 text-emerald-900 text-sm font-medium placeholder-emerald-300"
                            placeholder="For dispatch videos"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-maroon block">Instagram Handle</label>
                      <div className="relative">
                        <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-600" />
                        <input
                          type="text"
                          value={profile.instagram || ""}
                          onChange={(e) => setProfile({...profile, instagram: e.target.value})}
                          className="w-full bg-pink-50 border border-pink-200 pl-12 pr-4 py-3 focus:outline-none focus:border-pink-600 text-pink-900 text-sm font-medium placeholder-pink-300"
                          placeholder="@username"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-brand-gold/20 flex items-center gap-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-maroon text-white text-xs uppercase tracking-widest font-bold px-10 py-4 hover:bg-brand-gold transition-colors disabled:opacity-50"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                      {saveSuccess && (
                        <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider animate-fade-in">
                          ✓ Profile Updated
                        </span>
                      )}
                    </div>
                  </form>
                </div>

                <div className="bg-white border border-brand-gold/20 p-8 sm:p-12 shadow-sm mt-8">
                  <h2 className="font-serif text-3xl text-brand-maroon mb-2">Address Book</h2>
                  <p className="text-xs text-brand-warm-gray mb-8">Save delivery addresses for faster bespoke checkout.</p>
                  
                  <div className="space-y-6">
                    {/* Existing Addresses */}
                    {profile.saved_addresses && profile.saved_addresses.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {profile.saved_addresses.map(addr => (
                          <div key={addr.id} className="border border-brand-gold/20 p-4 relative group">
                            <button 
                              onClick={() => handleRemoveAddress(addr.id)}
                              className="absolute top-2 right-2 text-brand-warm-gray hover:text-[#B64545] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove Address"
                            >
                              <span className="text-[10px] uppercase font-bold tracking-widest">Remove</span>
                            </button>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                              <div className="text-sm text-brand-maroon space-y-1">
                                <p className="font-medium">{addr.address}</p>
                                <p className="text-xs">{addr.city}, {addr.zip}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-brand-warm-gray mb-6">No saved addresses found.</div>
                    )}

                    {/* Add New Address Form */}
                    <form onSubmit={handleAddAddress} className="border-t border-brand-gold/15 pt-6">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-maroon mb-4">Add New Address</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                        <div className="sm:col-span-6 space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-brand-maroon block">Street Address</label>
                          <input 
                            type="text" 
                            required
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                            className="w-full bg-brand-ivory border border-brand-gold/30 px-3 py-2 text-xs text-brand-maroon" 
                            placeholder="Apartment, Street..."
                          />
                        </div>
                        <div className="sm:col-span-3 space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-brand-maroon block">City</label>
                          <input 
                            type="text" 
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            className="w-full bg-brand-ivory border border-brand-gold/30 px-3 py-2 text-xs text-brand-maroon" 
                            placeholder="Varanasi"
                          />
                        </div>
                        <div className="sm:col-span-3 space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-brand-maroon block">Zip Code</label>
                          <input 
                            type="text" 
                            required
                            value={newAddress.zip}
                            onChange={(e) => handleZipChange(e.target.value)}
                            className="w-full bg-brand-ivory border border-brand-gold/30 px-3 py-2 text-xs text-brand-maroon" 
                            placeholder="221001"
                          />
                        </div>
                        <div className="sm:col-span-12 mt-2">
                          <button type="submit" className="text-[10px] uppercase font-bold tracking-widest bg-brand-sand border border-brand-gold/50 text-brand-maroon px-4 py-2 hover:bg-brand-gold/20 transition-colors">
                            Add Address
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ── ORDER HISTORY TAB ──────────────────────────────────── */}
            {activeTab === "orders" && (
              <div className="animate-fade-in space-y-6">
                <h2 className="font-serif text-3xl text-brand-maroon mb-2">Heritage Archives</h2>
                <p className="text-xs text-brand-warm-gray mb-8">Your complete history of drapes secured from the artisan guild.</p>
                {/* Heritage Archives Header */}
                
                {ordersLoading ? (
                  // Skeleton pulse while session is being restored on refresh
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="bg-white border border-brand-gold/20 flex overflow-hidden animate-pulse">
                        <div className="w-48 bg-brand-sand/60 h-32 flex-shrink-0" />
                        <div className="p-8 flex-1 space-y-3">
                          <div className="h-3 bg-brand-sand/80 rounded w-1/4" />
                          <div className="h-5 bg-brand-sand/60 rounded w-1/2" />
                          <div className="h-3 bg-brand-sand/40 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-brand-sand/30 border border-brand-gold/20 p-12 text-center">
                    <Package className="w-12 h-12 text-brand-gold/50 mx-auto mb-4" />
                    <h3 className="font-serif text-xl text-brand-maroon mb-2">No Acquisitions Yet</h3>
                    <p className="text-sm text-brand-warm-gray mb-6">Explore the collections to find your perfect masterweave.</p>
                    <button
                      onClick={() => { setView("shop"); window.scrollTo(0,0); }}
                      className="bg-brand-gold text-brand-maroon text-xs uppercase tracking-widest font-bold px-8 py-3 hover:bg-white transition-colors"
                    >
                      Visit Catalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white border border-brand-gold/20 flex flex-col sm:flex-row overflow-hidden group">
                        <div className="sm:w-48 bg-brand-sand flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-brand-gold/15">
                           <span className="font-serif text-4xl text-brand-gold/30">A&A</span>
                        </div>
                        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                            <div>
                              <p className="text-[10px] uppercase font-bold tracking-widest text-brand-warm-gray mb-1">
                                Order #{order.id.split("-")[0]}
                              </p>
                              <h3 className="font-serif text-xl text-brand-maroon">
                                {new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                              </h3>
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 border ${
                              order.status === "completed" || order.status === "shipped" || order.status === "delivered" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-brand-gold/10 text-brand-maroon border-brand-gold/30"
                            }`}>
                              {order.status.replace(/_/g, " ")}
                            </span>
                          </div>

                          {/* Order Tracking Visual Timeline */}
                          <div className="relative mb-8 pb-4">
                            <div className="absolute top-4 left-4 right-4 h-0.5 bg-brand-sand"></div>
                            
                            {/* Dynamically calculate progress bar based on status */}
                            <div 
                              className="absolute top-4 left-4 h-0.5 bg-emerald-600 transition-all duration-1000 ease-in-out" 
                              style={{ 
                                width: ['completed', 'delivered'].includes(order.status) ? '100%' 
                                  : order.status === 'shipped' ? '66%' 
                                  : order.status === 'processing' ? '33%' 
                                  : '0%' 
                              }}
                            ></div>

                            <div className="relative flex justify-between">
                              <div className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                                  true ? 'bg-emerald-600 text-white' : 'bg-brand-sand text-brand-warm-gray'
                                }`}>
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] uppercase tracking-widest font-bold text-brand-maroon">Placed</span>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                                  ['processing', 'shipped', 'delivered', 'completed'].includes(order.status) ? 'bg-emerald-600 text-white' : 'bg-brand-ivory border border-brand-gold/30 text-brand-warm-gray'
                                }`}>
                                  <Package className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] uppercase tracking-widest font-bold text-brand-maroon">Processing</span>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                                  ['shipped', 'delivered', 'completed'].includes(order.status) ? 'bg-emerald-600 text-white' : 'bg-brand-ivory border border-brand-gold/30 text-brand-warm-gray'
                                }`}>
                                  <Truck className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] uppercase tracking-widest font-bold text-brand-maroon">Shipped</span>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                                  ['delivered', 'completed'].includes(order.status) ? 'bg-emerald-600 text-white' : 'bg-brand-ivory border border-brand-gold/30 text-brand-warm-gray'
                                }`}>
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] uppercase tracking-widest font-bold text-brand-maroon">Delivered</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Show payment status badge */}
                          <div className="flex items-center gap-2 mb-4">
                            <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm ${
                              order.is_paid 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {order.is_paid ? '✓ Paid' : 'Payment Pending'}
                            </span>
                            <span className="text-[9px] text-brand-warm-gray uppercase tracking-widest">
                              via {order.payment_mode}
                            </span>
                          </div>

                          {order.notes && (
                            <div className="bg-brand-sand/30 border border-brand-gold/20 p-3 mb-4 rounded-sm">
                              <p className="text-xs text-brand-warm-gray">{order.notes}</p>
                            </div>
                          )}

                          <div className="flex justify-between items-end border-t border-brand-gold/10 pt-4 mt-2">
                            <div>
                              <p className="text-xs text-brand-warm-gray">Total Amount</p>
                              <p className="font-mono text-brand-maroon font-bold text-lg">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(order.total ?? 0)}
                              </p>
                            </div>
                            <button 
                              onClick={() => {
                                setActiveInvoice({ orderId: order.id, date: order.created_at, total: order.total, items: [] });
                                window.alert(`Invoice: ${order.invoice_number || order.id.split('-')[0].toUpperCase()} — ₹${order.total}`);
                              }}
                              className="text-[10px] uppercase font-bold tracking-widest text-brand-gold hover:text-brand-maroon flex items-center gap-1 transition-colors"
                            >
                              View Invoice <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── UPDATES TAB ───────────────────────────────────────── */}
            {activeTab === "updates" && (
              <div className="animate-fade-in space-y-6">
                <h2 className="font-serif text-3xl text-brand-maroon mb-2">Dispatch Center</h2>
                <p className="text-xs text-brand-warm-gray mb-8">Live notifications from the Varanasi weavers regarding your bespoke pieces.</p>
                
                <div className="relative border-l border-brand-gold/30 ml-4 space-y-12 pb-8">
                  
                  <div className="relative pl-8">
                    <div className="absolute -left-2.5 top-0 w-5 h-5 bg-[#FDFBF7] border-2 border-brand-gold rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-brand-maroon rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-brand-gold mb-1">Today</p>
                    <h4 className="font-serif text-lg text-brand-maroon">No active shipments in transit.</h4>
                    <p className="text-xs text-brand-warm-gray mt-2 leading-relaxed">Once your saree departs the loom, you will receive tracking links and packaging videos directly here and on WhatsApp.</p>
                  </div>

                  <div className="relative pl-8 opacity-60">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-brand-gold/20 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-brand-gold rounded-full"></div>
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-brand-gold mb-1">Welcome</p>
                    <h4 className="font-serif text-lg text-brand-maroon">Account Authenticated</h4>
                    <p className="text-xs text-brand-warm-gray mt-2 leading-relaxed">Welcome to the Art&Anchal Heritage Guild. You now have priority access to reserve pieces from upcoming seasonal collections.</p>
                  </div>

                </div>
              </div>
            )}

            {/* ── WISHLIST TAB ───────────────────────────────────────── */}
            {activeTab === "wishlist" && (
              <div className="animate-fade-in space-y-6">
                <h2 className="font-serif text-3xl text-brand-maroon mb-2">My Guild Wishlist</h2>
                <p className="text-xs text-brand-warm-gray mb-8">Your curated selections of timeless heirlooms.</p>

                {wishlist.length === 0 ? (
                  <div className="bg-brand-sand/30 border border-brand-gold/20 p-12 text-center">
                    <Heart className="w-12 h-12 text-brand-gold/50 mx-auto mb-4" />
                    <h3 className="font-serif text-xl text-brand-maroon mb-2">Your wishlist is empty</h3>
                    <p className="text-sm text-brand-warm-gray mb-6">Browse the catalog to find your perfect masterweave.</p>
                    <button
                      onClick={() => { setView("shop"); window.scrollTo(0,0); }}
                      className="bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest font-bold px-8 py-3 hover:bg-brand-gold transition-colors"
                    >
                      Explore Showroom
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((saree) => (
                      <div key={saree.id} className="group relative bg-[#FDFBF7] border border-brand-gold/15 flex flex-col justify-between">
                        <div className="relative aspect-[3/4] overflow-hidden bg-brand-sand">
                          <img
                            src={saree.images[0]}
                            alt={saree.name}
                            onClick={() => {
                              if (setSelectedSareeId) setSelectedSareeId(saree.id);
                              setView("product-detail");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500 cursor-pointer"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={() => toggleFavorite && toggleFavorite(saree)}
                            className="absolute top-2.5 right-2.5 p-2 bg-brand-ivory hover:bg-brand-sand border border-brand-gold/20 text-[#B64545] rounded-full transition cursor-pointer shadow-sm"
                            title="Remove from wishlist"
                          >
                            <Heart className="w-3.5 h-3.5 fill-[#B64545] stroke-[#B64545]" />
                          </button>
                        </div>
                        <div className="p-4 bg-[#FDFBF7]">
                          <span className="text-[9px] text-brand-gold tracking-wider uppercase block font-sans mb-1">{saree.category}</span>
                          <h3
                            onClick={() => {
                              if (setSelectedSareeId) setSelectedSareeId(saree.id);
                              setView("product-detail");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="font-serif text-sm font-semibold text-brand-maroon hover:text-brand-gold cursor-pointer line-clamp-1 transition duration-200"
                          >
                            {saree.name}
                          </h3>
                          <p className="text-xs font-mono font-bold text-brand-maroon pt-2">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(saree.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PAYMENT METHODS TAB ────────────────────────────────── */}
            {activeTab === "payment" && (
              <div className="animate-fade-in space-y-6">
                <h2 className="font-serif text-3xl text-brand-maroon mb-2">Payment Methods</h2>
                <p className="text-xs text-brand-warm-gray mb-8">Manage your saved cards for secure, one-click checkout.</p>
                
                <div className="bg-white border border-brand-gold/20 p-8 sm:p-12 shadow-sm">
                  <div className="text-center space-y-6 max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 mx-auto flex items-center justify-center text-emerald-600 border border-emerald-100">
                      <CreditCard className="w-8 h-8 stroke-[1.2]" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-brand-maroon mb-2">Secured by Razorpay</h3>
                      <p className="text-xs text-brand-warm-gray leading-relaxed">
                        To ensure maximum security and PCI compliance, your cards are securely saved directly within the Razorpay Vault when you checkout.
                      </p>
                    </div>
                    <div className="bg-[#FAF7F2] p-4 border border-brand-gold/20 text-left space-y-2">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-brand-maroon">How it works</p>
                      <p className="text-xs text-brand-warm-gray">When you make a purchase, simply check the "Save this card" box inside the Razorpay payment window. Your cards will automatically appear on your next visit.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
