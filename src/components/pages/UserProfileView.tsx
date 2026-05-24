/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ViewState, DbOrder, DbProfile } from "../../types";
import { supabase, isMock } from "../../lib/supabase";
import { User, Package, Bell, MapPin, Instagram, Phone, LogOut, ArrowRight, Settings } from "lucide-react";

interface UserProfileViewProps {
  userSession: { id?: string; name: string; email: string; is_admin?: boolean; phone?: string } | null;
  setView: (view: ViewState) => void;
  setUserSession: (session: any) => void;
}

type TabType = "profile" | "orders" | "updates";

export default function UserProfileView({ userSession, setView, setUserSession }: UserProfileViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [profile, setProfile] = useState<Partial<DbProfile>>({
    name: userSession?.name || "",
    email: userSession?.email || "",
    phone: userSession?.phone || "",
    whatsapp: "",
    instagram: "",
  });

  const [orders, setOrders] = useState<DbOrder[]>([]);

  useEffect(() => {
    if (!userSession) {
      setView("login-register");
      return;
    }
    fetchProfileData();
    fetchOrders();
  }, [userSession]);

  const fetchProfileData = async () => {
    if (!userSession?.id && !isMock) return;
    try {
      // For mock, we rely on email if ID isn't easily available, or fetch by ID
      let query = supabase.from("profiles").select("*");
      if (userSession?.id && !isMock) {
         query = query.eq("auth_user_id", userSession.id);
      } else {
         query = query.eq("email", userSession?.email);
      }

      const { data, error } = await query.single();
      if (data) {
        setProfile({
          id: data.id,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          instagram: data.instagram || "",
        });
      }
    } catch (err) {
      console.warn("Could not fetch profile details", err);
    }
  };

  const fetchOrders = async () => {
    try {
      // Find orders matching this profile's email (simple mock fallback)
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("shipping_email", userSession?.email)
        .order("created_at", { ascending: false });

      if (data) {
        setOrders(data);
      }
    } catch (err) {
      console.warn("Could not fetch orders", err);
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
            whatsapp: profile.whatsapp,
            instagram: profile.instagram,
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
          })
          .eq("email", profile.email);
      }

      // Update local session
      const updatedSession = { ...userSession, name: profile.name!, phone: profile.phone! };
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
          <aside className="lg:w-1/4 flex-shrink-0">
            <nav className="space-y-2 sticky top-32">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-4 px-6 py-4 text-left text-xs uppercase tracking-widest font-bold transition-all ${
                  activeTab === "profile" 
                    ? "bg-brand-maroon text-white shadow-lg" 
                    : "text-brand-warm-gray hover:bg-brand-sand hover:text-brand-maroon"
                }`}
              >
                <Settings className={`w-5 h-5 ${activeTab === "profile" ? "text-brand-gold" : ""}`} /> Profile Settings
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-4 px-6 py-4 text-left text-xs uppercase tracking-widest font-bold transition-all ${
                  activeTab === "orders" 
                    ? "bg-brand-maroon text-white shadow-lg" 
                    : "text-brand-warm-gray hover:bg-brand-sand hover:text-brand-maroon"
                }`}
              >
                <Package className={`w-5 h-5 ${activeTab === "orders" ? "text-brand-gold" : ""}`} /> Order History
              </button>
              <button
                onClick={() => setActiveTab("updates")}
                className={`w-full flex items-center gap-4 px-6 py-4 text-left text-xs uppercase tracking-widest font-bold transition-all ${
                  activeTab === "updates" 
                    ? "bg-brand-maroon text-white shadow-lg" 
                    : "text-brand-warm-gray hover:bg-brand-sand hover:text-brand-maroon"
                }`}
              >
                <Bell className={`w-5 h-5 ${activeTab === "updates" ? "text-brand-gold" : ""}`} /> Dispatch Updates
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
              </div>
            )}

            {/* ── ORDER HISTORY TAB ──────────────────────────────────── */}
            {activeTab === "orders" && (
              <div className="animate-fade-in space-y-6">
                <h2 className="font-serif text-3xl text-brand-maroon mb-2">Heritage Archives</h2>
                <p className="text-xs text-brand-warm-gray mb-8">Your complete history of drapes secured from the artisan guild.</p>
                
                {orders.length === 0 ? (
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
                          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                            <div>
                              <p className="text-[10px] uppercase font-bold tracking-widest text-brand-warm-gray mb-1">
                                Order #{order.id.split("-")[0]}
                              </p>
                              <h3 className="font-serif text-xl text-brand-maroon">
                                {new Date(order.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                              </h3>
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 border ${
                              order.order_status === "completed" || order.order_status === "shipped" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-brand-gold/10 text-brand-maroon border-brand-gold/30"
                            }`}>
                              {order.order_status.replace(/_/g, " ")}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-end border-t border-brand-gold/10 pt-4 mt-2">
                            <div>
                              <p className="text-xs text-brand-warm-gray">Total Amount</p>
                              <p className="font-mono text-brand-maroon font-bold text-lg">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(order.total_amount)}
                              </p>
                            </div>
                            <button className="text-[10px] uppercase font-bold tracking-widest text-brand-gold hover:text-brand-maroon flex items-center gap-1 transition-colors">
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

          </main>
        </div>
      </div>
    </div>
  );
}
