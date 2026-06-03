/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ViewState, DbOrder, DbProfile, Saree } from "../../types";
import { supabase, isMock } from "../../lib/supabase";
import { 
  Heart, CreditCard, User, Package, Bell, MapPin, Instagram, Phone, 
  LogOut, ArrowRight, Settings, CheckCircle, Truck, Tag, Award, 
  ShoppingBag, Sparkles, ChevronRight, X, Calendar, Share2, Printer
} from "lucide-react";

interface UserProfileViewProps {
  userSession: { id?: string; name: string; email: string; is_admin?: boolean; phone?: string } | null;
  setView: (view: ViewState) => void;
  setUserSession: (session: any) => void;
  wishlist?: Saree[];
  toggleFavorite?: (saree: Saree) => void;
  setQuickViewSaree?: (saree: Saree) => void;
  setSelectedSareeId?: (id: string | null) => void;
  sessionReady?: boolean;
}

type TabType = "profile" | "orders" | "wishlist" | "coupons" | "payment" | "updates";

interface Coupon {
  code: string;
  discount: string;
  description: string;
  minSpend?: string;
  expiry: string;
  type: "flat" | "percentage" | "weaver_match";
}

const ACTIVE_COUPONS: Coupon[] = [
  { code: "WELCOMETOTHEGUILD", discount: "₹1,500 OFF", description: "Bespoke welcome reward for registered guild members.", expiry: "Dec 31, 2026", type: "flat" },
  { code: "VARANASI10", discount: "10% OFF", description: "Exclusive privilege discount for orders above ₹30,000.", minSpend: "₹30,000", expiry: "Ongoing", type: "percentage" },
  { code: "ARTISAN5", discount: "5% MATCH", description: "5% of purchase matched by guild to support local weavers.", expiry: "Permanent", type: "weaver_match" }
];

export default function UserProfileView({ 
  userSession, 
  setView, 
  setUserSession,
  wishlist = [],
  toggleFavorite,
  setSelectedSareeId,
  sessionReady = true,
}: UserProfileViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<Partial<DbProfile>>({
    name: userSession?.name || "",
    email: userSession?.email || "",
    phone: userSession?.phone || "",
    saved_addresses: [],
  });

  const [newAddress, setNewAddress] = useState({ address: "", city: "", zip: "" });
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Scroll to top when activeTab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  useEffect(() => {
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
      const { data } = await supabase.from("profiles").select("*").eq("auth_user_id", userSession.id).maybeSingle();
      if (data) {
        setProfile({
          id: data.id,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
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
    try {
      if (!userSession?.id) return;
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      if (error) console.warn("fetchOrders error:", error.message);
      if (data) setOrders(data);
    } catch (err) {
      console.warn("Could not fetch orders", err);
    } finally {
      setOrdersLoading(false);
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
            whatsapp: profile.whatsapp || null,
            instagram: profile.instagram || null,
            saved_addresses: profile.saved_addresses,
          })
          .eq("id", profile.id);
      } else {
        await supabase
          .from("profiles")
          .update({
            name: profile.name,
            phone: profile.phone,
            whatsapp: profile.whatsapp || null,
            instagram: profile.instagram || null,
            saved_addresses: profile.saved_addresses,
          })
          .eq("email", profile.email);
      }

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
        const data = await res.json();
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

  // Compute metrics
  const totalSpent = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalOrders = orders.length;

  // Determine Loyalty Guild Tier
  let guildTier = "Guild Companion";
  let tierIcon = Sparkles;
  let tierColor = "text-brand-warm-gray";
  let tierBg = "bg-brand-sand/30";
  if (totalSpent >= 100000) {
    guildTier = "Imperial Patron 👑";
    tierIcon = Award;
    tierColor = "text-amber-600";
    tierBg = "bg-amber-500/10 border-amber-500/20";
  } else if (totalSpent >= 50000) {
    guildTier = "Zari Connoisseur ✦";
    tierIcon = Sparkles;
    tierColor = "text-brand-gold-dark";
    tierBg = "bg-brand-gold/10 border-brand-gold/20";
  } else if (totalSpent >= 15000) {
    guildTier = "Silk Initiate ⚜";
    tierIcon = User;
    tierColor = "text-brand-maroon";
    tierBg = "bg-brand-maroon/5 border-brand-maroon/10";
  }

  const statusStepIndex = (status: string): number => {
    if (['delivered', 'completed'].includes(status)) return 3;
    if (status === 'shipped') return 2;
    if (status === 'processing') return 1;
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 lg:py-14 font-sans selection:bg-brand-gold selection:text-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="border-b border-brand-gold/20 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl font-light text-brand-maroon tracking-wide">
              Greetings, <span className="italic text-brand-gold">{userSession.name.split(" ")[0]}</span>
            </h1>
            <p className="text-[10px] text-brand-warm-gray tracking-widest uppercase mt-1 font-bold">
              Artisan Guild Member Dashboard
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-maroon border border-brand-maroon/40 px-4 py-2 hover:bg-brand-maroon hover:text-white transition-all w-max rounded-sm"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {/* --- KPI SUMMARY METRICS ROW --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Acquisitions Value", value: `₹${totalSpent.toLocaleString("en-IN")}`, desc: "Total custom commissions", icon: ShoppingBag, color: "text-brand-maroon" },
            { label: "Orders Placed", value: totalOrders, desc: "Guild reservations", icon: Package, color: "text-brand-gold-dark" },
            { label: "Guild Tier", value: guildTier, desc: "Loyalty recognition", icon: tierIcon, color: tierColor, cardBg: tierBg },
            { label: "Active Benefits", value: ACTIVE_COUPONS.length, desc: "Coupons & Matches ready", icon: Tag, color: "text-emerald-700" }
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className={`bg-white border border-brand-gold/15 p-5 rounded-lg shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300 ${kpi.cardBg || ""}`}>
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-brand-warm-gray font-bold">{kpi.label}</p>
                  <p className={`font-serif text-xl sm:text-2xl font-bold mt-1.5 ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-[9px] text-brand-warm-gray mt-1 font-sans">{kpi.desc}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-sand/40 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Layout Body */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-56 shrink-0 bg-white border border-brand-gold/15 p-4 rounded-lg shadow-sm space-y-1">
            {[
              { id: "profile", label: "Profile Settings", icon: Settings },
              { id: "orders", label: "Acquisitions", icon: Package },
              { id: "wishlist", label: "Curated Wishlist", icon: Heart },
              { id: "coupons", label: "Coupons & Rewards", icon: Tag },
              { id: "payment", label: "Bespoke Payment", icon: CreditCard },
              { id: "updates", label: "Dispatch Feed", icon: Bell }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all rounded-md ${
                    activeTab === tab.id 
                      ? "bg-brand-maroon text-white shadow" 
                      : "text-brand-warm-gray hover:bg-brand-sand/50 hover:text-brand-maroon"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? "text-brand-gold" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Dashboard Content */}
          <main className="flex-1 w-full min-h-[500px]">
            
            {/* ── PROFILE SETTINGS ── */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white border border-brand-gold/15 p-6 rounded-lg shadow-sm space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl text-brand-maroon font-light">Guild Profile Settings</h2>
                    <p className="text-xs text-brand-warm-gray mt-0.5">Manage your contact information and loom coordination preferences.</p>
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-brand-maroon">Full Name *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                          <input type="text" required value={profile.name || ""} onChange={e => setProfile({...profile, name: e.target.value})}
                            className="w-full bg-brand-sand/10 border border-brand-gold/20 pl-10 pr-3 py-2.5 text-xs text-brand-maroon focus:outline-none focus:border-brand-maroon" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-brand-maroon">Email Address (Binds Login)</label>
                        <input type="email" value={profile.email || ""} disabled
                          className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 text-xs text-gray-500 cursor-not-allowed" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-brand-maroon">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gold" />
                          <input type="tel" value={profile.phone || ""} onChange={e => setProfile({...profile, phone: e.target.value})}
                            className="w-full bg-brand-sand/10 border border-brand-gold/20 pl-10 pr-3 py-2.5 text-xs text-brand-maroon focus:outline-none focus:border-brand-maroon" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-brand-maroon">WhatsApp (For dispatch videos)</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                          <input type="tel" placeholder="Dispatch coordination phone" value={profile.whatsapp || ""} onChange={e => setProfile({...profile, whatsapp: e.target.value})}
                            className="w-full bg-brand-sand/10 border border-brand-gold/20 pl-10 pr-3 py-2.5 text-xs text-brand-maroon focus:outline-none focus:border-brand-maroon" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 sm:max-w-[50%]">
                      <label className="text-[10px] uppercase font-bold text-brand-maroon">Instagram Handle</label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-600" />
                        <input type="text" placeholder="@username" value={profile.instagram || ""} onChange={e => setProfile({...profile, instagram: e.target.value})}
                          className="w-full bg-brand-sand/10 border border-brand-gold/20 pl-10 pr-3 py-2.5 text-xs text-brand-maroon focus:outline-none focus:border-brand-maroon" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-brand-gold/15 flex items-center gap-4">
                      <button type="submit" disabled={loading}
                        className="bg-brand-maroon text-white text-[10px] uppercase tracking-widest font-bold px-8 py-3 hover:bg-brand-gold transition-colors disabled:opacity-50">
                        {loading ? "Saving Changes..." : "Save Settings"}
                      </button>
                      {saveSuccess && <span className="text-emerald-600 text-xs font-bold uppercase">✓ Saved successfully</span>}
                    </div>
                  </form>
                </div>

                {/* Address Book */}
                <div className="bg-white border border-brand-gold/15 p-6 rounded-lg shadow-sm space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl text-brand-maroon font-light">Saved Delivery Destinations</h2>
                    <p className="text-xs text-brand-warm-gray mt-0.5">Manage your dispatch coordinates for swift custom weavers checkouts.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.saved_addresses && profile.saved_addresses.length > 0 ? (
                      profile.saved_addresses.map(addr => (
                        <div key={addr.id} className="border border-brand-gold/15 p-4 rounded-lg bg-[#FAF7F2]/45 flex justify-between items-start group">
                          <div className="flex gap-3">
                            <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                            <div className="text-xs text-brand-maroon space-y-1">
                              <p className="font-bold">{addr.address}</p>
                              <p className="font-mono text-[10px] text-brand-warm-gray">{addr.city} - {addr.zip}</p>
                            </div>
                          </div>
                          <button onClick={() => handleRemoveAddress(addr.id)}
                            className="text-[9px] uppercase font-bold text-red-700 hover:text-red-900 opacity-0 group-hover:opacity-100 transition-opacity">
                            Delete
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-brand-warm-gray italic">No saved dispatch addresses yet.</p>
                    )}
                  </div>

                  {/* Add address Form */}
                  <form onSubmit={handleAddAddress} className="border-t border-brand-gold/15 pt-6 space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-maroon">Add Dispatch Address</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-[9px] uppercase font-bold text-brand-warm-gray">Street Address *</label>
                        <input type="text" required value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})}
                          className="w-full bg-white border border-brand-gold/20 p-2.5 text-xs text-brand-maroon focus:outline-none" />
                      </div>
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[9px] uppercase font-bold text-brand-warm-gray">City / State *</label>
                        <input type="text" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                          className="w-full bg-white border border-brand-gold/20 p-2.5 text-xs text-brand-maroon focus:outline-none" />
                      </div>
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[9px] uppercase font-bold text-brand-warm-gray">Pincode *</label>
                        <input type="text" required maxLength={6} value={newAddress.zip} onChange={e => handleZipChange(e.target.value)}
                          className="w-full bg-white border border-brand-gold/20 p-2.5 text-xs text-brand-maroon focus:outline-none font-mono" />
                      </div>
                    </div>
                    <button type="submit" className="bg-brand-sand border border-brand-gold/40 text-brand-maroon uppercase font-bold tracking-widest text-[9px] px-4 py-2.5 rounded hover:bg-brand-gold/25 transition">
                      Add Address
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ── ACQUISITIONS (ORDERS) ── */}
            {activeTab === "orders" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-serif text-2xl text-brand-maroon font-light">Heritage Acquisitions</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">Track your pending looms and complete history of acquired heirlooms.</p>
                </div>

                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1,2].map(i => <div key={i} className="bg-white border border-brand-gold/15 p-6 h-28 rounded-lg animate-pulse" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-brand-gold/15 p-10 text-center rounded-lg">
                    <Package className="w-12 h-12 text-brand-gold/40 mx-auto mb-3" />
                    <h3 className="font-serif text-lg text-brand-maroon font-bold">No Acquisitions Found</h3>
                    <p className="text-xs text-brand-warm-gray mb-4">No reservations have been placed under this account yet.</p>
                    <button onClick={() => { setView("shop"); window.scrollTo(0,0); }}
                      className="bg-brand-maroon text-brand-ivory text-[10px] uppercase tracking-widest font-bold px-6 py-3 hover:bg-brand-gold transition shadow">
                      Explore Showroom
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const isExpanded = expandedOrderId === order.id;
                      const stepIdx = statusStepIndex(order.status);
                      return (
                        <div key={order.id} className="bg-white border border-brand-gold/15 rounded-lg overflow-hidden shadow-sm hover:shadow transition-all duration-300">
                          {/* Card Header */}
                          <div className="p-5 flex flex-wrap justify-between items-center bg-[#FAF7F2]/45 border-b border-brand-gold/10 gap-3 cursor-pointer"
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                            <div>
                              <p className="text-[9px] uppercase tracking-widest font-mono text-brand-warm-gray font-bold">Acquisition #{order.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-xs text-brand-maroon font-semibold mt-1">
                                {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-[9px] uppercase font-bold px-2.5 py-1 border rounded ${
                                ['completed', 'delivered'].includes(order.status) 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {order.status.replace(/_/g, " ")}
                              </span>
                              <span className="font-mono text-sm font-bold text-brand-maroon">
                                ₹{Number(order.total || 0).toLocaleString("en-IN")}
                              </span>
                              <span className="text-[10px] text-brand-gold font-bold">{isExpanded ? "Collapse ▲" : "Details ▼"}</span>
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="p-5 border-t border-brand-gold/10 space-y-6 bg-white animate-fade-in">
                              
                              {/* Stepper tracking */}
                              <div className="relative max-w-lg mx-auto py-2">
                                <div className="absolute top-5 left-4 right-4 h-0.5 bg-brand-sand"></div>
                                <div className="absolute top-5 left-4 h-0.5 bg-emerald-600 transition-all duration-500" style={{ width: `${stepIdx * 33.3}%` }}></div>
                                <div className="relative flex justify-between z-10">
                                  {[
                                    { label: "Placed", icon: CheckCircle, step: 0 },
                                    { label: "Processing", icon: Package, step: 1 },
                                    { label: "Shipped", icon: Truck, step: 2 },
                                    { label: "Delivered", icon: MapPin, step: 3 }
                                  ].map((node, idx) => {
                                    const NodeIcon = node.icon;
                                    const isActive = stepIdx >= node.step;
                                    return (
                                      <div key={idx} className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                          isActive ? "bg-emerald-600 text-white" : "bg-brand-sand/60 text-brand-warm-gray border border-brand-gold/20"
                                        }`}>
                                          <NodeIcon className="w-4 h-4" />
                                        </div>
                                        <span className={`text-[8px] uppercase tracking-wider font-bold mt-1.5 ${isActive ? "text-emerald-800" : "text-brand-warm-gray"}`}>
                                          {node.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Order items */}
                              <div className="border-t border-brand-gold/10 pt-4 space-y-3">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-brand-warm-gray">Commissioned Items</p>
                                {order.items && order.items.length > 0 ? (
                                  order.items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center border border-brand-gold/10 p-3 rounded bg-[#FAF7F2]/20 text-xs">
                                      <div>
                                        <p className="font-serif font-bold text-brand-maroon">{item.product_name}</p>
                                        <p className="text-[10px] text-brand-warm-gray mt-0.5">₹{Number(item.unit_price).toLocaleString("en-IN")} × {item.quantity}</p>
                                      </div>
                                      <span className="font-mono font-bold text-brand-maroon">
                                        ₹{Number(item.subtotal || item.unit_price * item.quantity).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex justify-between items-center border border-brand-gold/10 p-3 rounded bg-[#FAF7F2]/20 text-xs">
                                    <span>Acquisition Package</span>
                                    <span className="font-mono font-bold text-brand-maroon">₹{Number(order.total).toLocaleString("en-IN")}</span>
                                  </div>
                                )}
                              </div>

                              {/* Summary calculations */}
                              <div className="border-t border-brand-gold/10 pt-4 flex flex-col items-end space-y-1.5 text-xs text-brand-maroon">
                                <div className="w-52 flex justify-between">
                                  <span>Subtotal:</span>
                                  <span className="font-mono">₹{Number(order.subtotal || order.total).toLocaleString("en-IN")}</span>
                                </div>
                                {Number(order.discount) > 0 && (
                                  <div className="w-52 flex justify-between text-emerald-700">
                                    <span>Discount:</span>
                                    <span className="font-mono">-₹{Number(order.discount).toLocaleString("en-IN")}</span>
                                  </div>
                                )}
                                <div className="w-52 flex justify-between border-t border-brand-gold/20 pt-2 font-bold text-sm">
                                  <span>Grand Total:</span>
                                  <span className="font-mono">₹{Number(order.total).toLocaleString("en-IN")}</span>
                                </div>
                              </div>

                              {/* Additional coordinates */}
                              <div className="border-t border-brand-gold/10 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1.5">
                                  <p className="text-[10px] uppercase font-bold tracking-widest text-brand-warm-gray">Dispatch Address</p>
                                  <p className="text-brand-maroon font-medium">
                                    {order.shipping_address?.address || "Room preview / Showroom handover"}
                                  </p>
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-[10px] uppercase font-bold tracking-widest text-brand-warm-gray">Delivery Specs</p>
                                  <p className="text-brand-maroon">
                                    Method: <span className="font-bold uppercase">{order.payment_mode}</span>
                                  </p>
                                  {order.tracking_number && (
                                    <p className="text-brand-maroon">
                                      Carrier: <span className="font-bold">{order.shipping_carrier || "SpeedPost"}</span> • AWB: <span className="font-mono font-bold bg-brand-sand/30 px-1 py-0.5 rounded">{order.tracking_number}</span>
                                    </p>
                                  )}
                                </div>
                              </div>

                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ── WISHLIST TAB ── */}
            {activeTab === "wishlist" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-serif text-2xl text-brand-maroon font-light">Bespoke Wishlist</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">Curate and save your preferred handloom masterpieces for future reservations.</p>
                </div>

                {wishlist.length === 0 ? (
                  <div className="bg-white border border-brand-gold/15 p-10 text-center rounded-lg">
                    <Heart className="w-12 h-12 text-[#B64545]/40 mx-auto mb-3" />
                    <h3 className="font-serif text-lg text-brand-maroon font-bold">Wishlist is Empty</h3>
                    <p className="text-xs text-brand-warm-gray mb-4">Mark sarees as favorites while browsing the showroom to view them here.</p>
                    <button onClick={() => { setView("shop"); window.scrollTo(0,0); }}
                      className="bg-brand-maroon text-brand-ivory text-[10px] uppercase tracking-widest font-bold px-6 py-3 hover:bg-brand-gold transition shadow">
                      Browse Showroom
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map(saree => (
                      <div key={saree.id} className="bg-white border border-brand-gold/15 rounded-lg overflow-hidden shadow-sm hover:shadow transition-all group flex flex-col justify-between">
                        <div className="relative aspect-[3/4] bg-brand-sand/10 overflow-hidden">
                          <img src={saree.images[0]} alt={saree.name} referrerPolicy="no-referrer"
                            onClick={() => { if (setSelectedSareeId) setSelectedSareeId(saree.id); setView("product-detail"); }}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer" />
                          <button onClick={() => toggleFavorite && toggleFavorite(saree)}
                            className="absolute top-3 right-3 p-1.5 bg-[#FAF7F2] border border-brand-gold/20 text-[#B64545] rounded-full hover:bg-brand-sand transition shadow-sm">
                            <Heart className="w-3.5 h-3.5 fill-[#B64545]" />
                          </button>
                        </div>
                        <div className="p-4 space-y-1 bg-white">
                          <span className="text-[8px] uppercase tracking-wider text-brand-gold font-bold block">{saree.category}</span>
                          <h3 onClick={() => { if (setSelectedSareeId) setSelectedSareeId(saree.id); setView("product-detail"); }}
                            className="font-serif text-xs sm:text-sm text-brand-maroon font-bold hover:text-brand-gold cursor-pointer transition truncate">
                            {saree.name}
                          </h3>
                          <p className="font-mono text-xs font-bold text-brand-maroon pt-1">
                            ₹{Number(saree.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── COUPONS & REWARDS ── */}
            {activeTab === "coupons" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-serif text-2xl text-brand-maroon font-light">Guild Benefits & Coupons</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">Apply coupon codes during payment for weaver matches and privilege savings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ACTIVE_COUPONS.map((coupon, idx) => (
                    <div key={idx} className="bg-white border border-brand-gold/15 p-5 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden group">
                      {/* Ribbon banner background */}
                      <div className="absolute right-0 top-0 w-24 h-24 bg-brand-gold/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
                      
                      <div className="space-y-2 relative z-10">
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                            coupon.type === 'weaver_match' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-brand-maroon/5 text-brand-maroon border border-brand-maroon/10'
                          }`}>
                            {coupon.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-brand-warm-gray font-semibold font-mono">Expires: {coupon.expiry}</span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-brand-maroon">{coupon.discount}</h3>
                        <p className="text-xs text-brand-warm-gray leading-relaxed">{coupon.description}</p>
                        {coupon.minSpend && (
                          <p className="text-[9px] text-brand-gold-dark uppercase font-bold">Min Spend: {coupon.minSpend}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-brand-gold/10 flex items-center justify-between relative z-10">
                        <span className="font-mono text-xs font-bold bg-[#FAF7F2] border border-brand-gold/30 px-3 py-1 text-brand-maroon uppercase tracking-wider rounded select-all cursor-pointer" title="Click to copy code">
                          {coupon.code}
                        </span>
                        <button onClick={() => { navigator.clipboard.writeText(coupon.code); alert(`Code "${coupon.code}" copied to clipboard!`); }}
                          className="text-[9px] uppercase font-bold text-brand-gold hover:text-brand-maroon transition">
                          Copy Code
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#FAF7F2]/65 border border-brand-gold/15 p-6 rounded-lg space-y-3">
                  <h4 className="font-serif text-sm font-bold text-brand-maroon flex items-center gap-2">
                    <Award className="w-4 h-4 text-brand-gold" /> Guild Patron Progress
                  </h4>
                  <p className="text-xs text-brand-warm-gray leading-relaxed">
                    Accumulate purchase value on saree commissions to advance your tier and unlock priority catalog bookings, private weaver dispatch video calls, and larger loyalty discounts.
                  </p>
                  <div className="pt-2">
                    <div className="w-full h-2 bg-brand-sand/50 rounded overflow-hidden">
                      <div className="h-full bg-brand-gold transition-all" style={{ width: `${Math.min((totalSpent / 50000) * 100, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-brand-warm-gray uppercase mt-1.5 font-bold">
                      <span>Companion Tier</span>
                      <span>Next: Zari Connoisseur (₹50k)</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ── BESPOKE PAYMENT ── */}
            {activeTab === "payment" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-serif text-2xl text-brand-maroon font-light">Payment Preferences</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">Secure, vaulted transactions powered by Razorpay checkout networks.</p>
                </div>

                <div className="bg-white border border-brand-gold/15 p-6 rounded-lg shadow-sm space-y-6">
                  <div className="text-center space-y-4 max-w-md mx-auto py-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 mx-auto flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                      <CreditCard className="w-6 h-6 stroke-[1.2]" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-brand-maroon">Vaulted Security</h3>
                      <p className="text-xs text-brand-warm-gray mt-1 leading-relaxed">
                        To remain fully PCI-DSS compliant, card data is not stored locally on Art&Anchal servers. Your cards are securely vaulted in the Razorpay Network.
                      </p>
                    </div>

                    <div className="bg-[#FAF7F2] p-4 border border-brand-gold/20 text-left space-y-2 rounded-lg">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-brand-maroon">Quick Checkouts</p>
                      <p className="text-xs text-brand-warm-gray leading-relaxed">
                        During your next purchase checkout, simply check the **"Save Card securely"** option inside the Razorpay pop-up. It will automatically authorize quick one-click bookings on subsequent orders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── DISPATCH FEED (UPDATES) ── */}
            {activeTab === "updates" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="font-serif text-2xl text-brand-maroon font-light">Dispatch Feed & Loom Alerts</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">Real-time alerts directly from the Varanasi weavers regarding packaging and dispatch.</p>
                </div>

                <div className="relative border-l border-brand-gold/30 pl-5 ml-3 space-y-6 pb-6">
                  <div className="relative">
                    <div className="absolute -left-7 top-1 w-3.5 h-3.5 bg-[#FDFBF7] border-2 border-brand-gold rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-brand-maroon rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-[8px] uppercase tracking-widest font-mono text-brand-gold font-bold">Loom Status update</span>
                    <h4 className="font-serif text-base text-brand-maroon mt-1">Loom queues are running normally.</h4>
                    <p className="text-xs text-brand-warm-gray mt-1 leading-relaxed">
                      Custom weaving timelines are averaging 7-14 days. Once your commissioned saree exits the final wash and quality review, tracking numbers will appear instantly under your acquisitions history.
                    </p>
                  </div>

                  <div className="relative opacity-60">
                    <div className="absolute -left-7 top-1 w-3.5 h-3.5 bg-[#FDFBF7] border-2 border-brand-gold/30 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-brand-gold rounded-full"></div>
                    </div>
                    <span className="text-[8px] uppercase tracking-widest font-mono text-brand-gold font-bold">Registration Alert</span>
                    <h4 className="font-serif text-base text-brand-maroon mt-1">Guild Membership Authenticated</h4>
                    <p className="text-xs text-brand-warm-gray mt-1 leading-relaxed">
                      Welcome to Art&Anchal. You have been granted Initiate level access to seasonal launches and physical boutique drape previews.
                    </p>
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
