/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Art&Anchal Admin Dashboard
 * Features: Catalog CMS (with stock), CRM Leads, POS Billing (stock deduction), Orders
 */

import React, { useState, useEffect, FormEvent, useRef } from "react";
import { ViewState } from "../../types";
import { supabase, isMock } from "../../lib/supabase";
import {
  Plus, Edit, Trash2, Users, ShoppingBag, FileText, PhoneCall,
  TrendingUp, Printer, ArrowLeft, CheckCircle, RefreshCw, Lock,
  Sparkles, Package, AlertTriangle, X, Check, ChevronRight,
  LayoutDashboard, MessageSquare, Minus, Search, IndianRupee,
  ShieldCheck, Tag, Upload, Edit2, Archive, Phone, Download, UserPlus, Image as ImageIcon, CreditCard, HelpCircle, LogOut
} from "lucide-react";

import AdminHRTab from "./AdminHRTab";
import AdminFinanceTab from "./AdminFinanceTab";
import AdminVendorsTab from "./AdminVendorsTab";
import InvoiceDocument, { InvoiceData } from "../InvoiceDocument";

interface AdminConsoleViewProps {
  userSession: { id?: string; name: string; email: string; is_admin?: boolean } | null;
  setUserSession: (session: any) => void;
  setView: (view: ViewState) => void;
  refreshCatalog: (force?: boolean) => Promise<void>;
}

type TabType = "overview" | "catalog" | "crm" | "pos" | "orders" | "hr" | "finance" | "vendors";

const TAX_RATE = 0.05; // 5% GST for handloom sarees (CGST 2.5% + SGST 2.5%)

const emptyLead = { name: "", email: "", phone: "", interest: "", message: "", status: "new", source: "offline" };
const emptyProfile = { name: "", email: "", phone: "", source: "offline" };
const emptySaree = {
  name: "", price: 0, original_price: "", material: "", colors: "",
  zari_type: "Pure Gold Zari", weaving_technique: "Kadwa Handloom",
  collection_id: "", artisan_id: "", images: ["", "", ""], description: "",
  drape_recommendation: "", stock_quantity: 1,
  is_bestseller: false, is_featured: false, is_new: false,
  spec_length: "5.5 Meters", spec_width: "45 Inches",
  spec_blouse: "80 cm unstitched", spec_wash_care: "Dry clean only",
  spec_origin: "Varanasi, Uttar Pradesh, India",
};

export default function AdminConsoleView({ userSession, setUserSession, setView, refreshCatalog }: AdminConsoleViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [viewState, setViewState] = useState<"list" | "pos" | "history">("list");
  
  const interactionPanelRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const [dbSarees, setDbSarees] = useState<any[]>([]);
  const [dbArtisans, setDbArtisans] = useState<any[]>([]);
  const [dbCollections, setDbCollections] = useState<any[]>([]);
  const [dbLeads, setDbLeads] = useState<any[]>([]);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [dbProfiles, setDbProfiles] = useState<any[]>([]);

  // ERP States
  const [dbEmployees, setDbEmployees] = useState<any[]>([]);
  const [dbAttendance, setDbAttendance] = useState<any[]>([]);
  const [dbExpenses, setDbExpenses] = useState<any[]>([]);
  const [dbPurchases, setDbPurchases] = useState<any[]>([]);
  const [dbDues, setDbDues] = useState<any[]>([]);

  // CMS states
  const [editingSaree, setEditingSaree] = useState<any | null>(null);
  const [isSareeModalOpen, setIsSareeModalOpen] = useState(false);
  const [sareeForm, setSareeForm] = useState({ ...emptySaree });
  // Per-slot image upload state (3 slots)
  const [slotUploading, setSlotUploading] = useState([false, false, false]);
  const [slotProgress, setSlotProgress] = useState([0, 0, 0]);
  const [slotError, setSlotError] = useState(["", "", ""]);
  const [slotPreview, setSlotPreview] = useState(["", "", ""]);
  const [urlInputMode, setUrlInputMode] = useState(false);
  // Separate hidden file inputs per slot — avoids overflow-hidden clipping bug
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // CRM states
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [leadInteractions, setLeadInteractions] = useState<any[]>([]);
  const [newInteractionNote, setNewInteractionNote] = useState("");
  const [interactionChannel, setInteractionChannel] = useState("phone");
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({ ...emptyLead });
  const [leadSearch, setLeadSearch] = useState("");

  // POS states
  const [posSearch, setPosSearch] = useState("");
  const [posCustomerSearch, setPosCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ ...emptyProfile });
  const [posCart, setPosCart] = useState<Array<{ saree: any; quantity: number }>>([]);
  const [posDiscount, setPosDiscount] = useState(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState("cash");
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);
  const [posNotes, setPosNotes] = useState("");

  // Orders
  const [orderSearch, setOrderSearch] = useState("");
  const [statusModalOrder, setStatusModalOrder] = useState<any | null>(null);
  const [statusForm, setStatusForm] = useState({ status: "", tracking_number: "", shipping_carrier: "" });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  // ── Fetch all data ────────────────────────────────────────────────────────
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await supabase.auth.getSession(); // Guard against race condition on reload
      const [s, ar, col, ld, ord, prof] = await Promise.all([
        supabase.from("sarees").select("*").order("created_at", { ascending: false }),
        supabase.from("artisans").select("*").order("name"),
        supabase.from("collections").select("*").order("name"),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("name"),
      ]);
      if (s.data) setDbSarees(s.data);
      if (ar.data) setDbArtisans(ar.data);
      if (col.data) setDbCollections(col.data);
      if (ld.data) setDbLeads(ld.data);
      if (ord.data) setDbOrders(ord.data);
      if (prof.data) setDbProfiles(prof.data);

      try {
        const [emp, att, exp, pur, due] = await Promise.all([
          supabase.from("employees").select("*").order("name"),
          supabase.from("attendance").select("*, employee:employees(name)").order("date", { ascending: false }),
          supabase.from("expenses").select("*").order("date", { ascending: false }),
          supabase.from("purchases").select("*").order("date", { ascending: false }),
          supabase.from("dues").select("*").order("due_date", { ascending: false }),
        ]);
        if (emp.data) setDbEmployees(emp.data);
        if (att.data) setDbAttendance(att.data);
        if (exp.data) setDbExpenses(exp.data);
        if (pur.data) setDbPurchases(pur.data);
        if (due.data) setDbDues(due.data);
      } catch (erpErr) {
        console.warn("ERP tables might not exist yet", erpErr);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userSession?.is_admin) fetchAllData();
  }, [userSession, activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── KPI helpers ───────────────────────────────────────────────────────────
  const totalRevenue = dbOrders.reduce((s, o) => s + Number(o.total || 0), 0);
  const activeLeads = dbLeads.filter(l => l.status !== "won" && l.status !== "lost").length;
  const lowStockSarees = dbSarees.filter(s => (s.stock_quantity ?? 1) <= 2);
  const outOfStock = dbSarees.filter(s => (s.stock_quantity ?? 1) <= 0);

  // ── CRM ───────────────────────────────────────────────────────────────────
  const handleSelectLead = async (lead: any) => {
    setSelectedLead(lead);
    const { data } = await supabase
      .from("lead_interactions")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });
    setLeadInteractions(data || []);
    
    // Auto-scroll on mobile
    if (window.innerWidth < 1024 && interactionPanelRef.current) {
      setTimeout(() => interactionPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  };

  const handleAddInteraction = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newInteractionNote.trim()) return;
    const { error } = await supabase.from("lead_interactions").insert({
      lead_id: selectedLead.id,
      admin_id: userSession?.id || null,
      notes: newInteractionNote,
      channel: interactionChannel,
    });
    if (!error) {
      setNewInteractionNote("");
      handleSelectLead(selectedLead);
      showFeedback("Interaction logged.");
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    if (status === 'lost' && !confirm("Are you sure you want to mark this lead as Lost?")) return;
    await supabase.from("leads").update({ status }).eq("id", leadId);
    fetchAllData();
    if (selectedLead?.id === leadId) setSelectedLead((p: any) => ({ ...p, status }));
  };

  const handleAddOfflineLead = async (e: FormEvent) => {
    e.preventDefault();
    if (!leadForm.name) return;
    const { error } = await supabase.from("leads").insert({
      name: leadForm.name,
      email: leadForm.email || null,
      phone: leadForm.phone || null,
      interest: leadForm.interest || null,
      message: leadForm.message || null,
      status: "new",
      source: "showroom",
    });
    if (error) { alert(error.message); return; }
    setIsNewLeadModalOpen(false);
    setLeadForm({ ...emptyLead });
    fetchAllData();
    showFeedback("Offline lead created.");
  };

  // ── CMS ───────────────────────────────────────────────────────────────────
  const handleSaveSaree = async (e: FormEvent) => {
    e.preventDefault();
    if (!sareeForm.name || !sareeForm.price) return;
    const payload = {
      name: sareeForm.name,
      price: Number(sareeForm.price),
      original_price: sareeForm.original_price ? Number(sareeForm.original_price) : null,
      material: sareeForm.material || "Pure Silk",
      colors: sareeForm.colors ? [sareeForm.colors] : [],
      zari_type: sareeForm.zari_type,
      weaving_technique: sareeForm.weaving_technique,
      collection_id: sareeForm.collection_id || null,
      artisan_id: sareeForm.artisan_id || null,
      images: (() => {
        const urls = sareeForm.images.filter(Boolean);
        return urls.length > 0 ? urls : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"];
      })(),
      description: sareeForm.description,
      drape_recommendation: sareeForm.drape_recommendation || null,
      stock_quantity: Number(sareeForm.stock_quantity),
      is_bestseller: sareeForm.is_bestseller,
      is_featured: sareeForm.is_featured,
      is_new: sareeForm.is_new,
      is_active: true,
      spec_length: sareeForm.spec_length,
      spec_width: sareeForm.spec_width,
      spec_blouse: sareeForm.spec_blouse,
      spec_wash_care: sareeForm.spec_wash_care,
      spec_origin: sareeForm.spec_origin,
    };
    try {
      if (editingSaree) {
        const { error } = await supabase.from("sarees").update(payload).eq("id", editingSaree.id);
        if (error) throw error;
        showFeedback("Saree updated.");
      } else {
        const { error } = await supabase.from("sarees").insert(payload);
        if (error) throw error;
        showFeedback("New saree added to catalog.");
      }
      setIsSareeModalOpen(false);
      setEditingSaree(null);
      setSareeForm({ ...emptySaree });
      fetchAllData();
      await refreshCatalog(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteSaree = async (id: string) => {
    if (!confirm("Retire this saree from the catalog?")) return;
    await supabase.from("sarees").update({ is_active: false }).eq("id", id);
    showFeedback("Saree retired.");
    fetchAllData();
    await refreshCatalog(true);
  };

  const handleOpenEditSaree = (s: any) => {
    setEditingSaree(s);
    const existingImages: [string, string, string] = [
      s.images?.[0] || "",
      s.images?.[1] || "",
      s.images?.[2] || "",
    ];
    setSareeForm({
      name: s.name, price: s.price, original_price: s.original_price || "",
      material: s.material || "", colors: s.colors?.[0] || "",
      zari_type: s.zari_type || "Pure Gold Zari",
      weaving_technique: s.weaving_technique || "Kadwa Handloom",
      collection_id: s.collection_id || "", artisan_id: s.artisan_id || "",
      images: existingImages, description: s.description || "",
      drape_recommendation: s.drape_recommendation || "",
      stock_quantity: s.stock_quantity ?? 1,
      is_bestseller: s.is_bestseller || false,
      is_featured: s.is_featured || false,
      is_new: s.is_new || false,
      spec_length: s.spec_length || "5.5 Meters",
      spec_width: s.spec_width || "45 Inches",
      spec_blouse: s.spec_blouse || "80 cm unstitched",
      spec_wash_care: s.spec_wash_care || "Dry clean only",
      spec_origin: s.spec_origin || "Varanasi, Uttar Pradesh, India",
    });
    setSlotPreview([...existingImages]);
    setSlotError(["", "", ""]);
    setSlotUploading([false, false, false]);
    setSlotProgress([0, 0, 0]);
    setUrlInputMode(false);
    setIsSareeModalOpen(true);
  };

  // ── Image Compression (Canvas API — no extra library) ─────────────────────
  const compressImage = (file: File, maxPx = 1200, quality = 0.82): Promise<{ blob: Blob; originalKB: number; compressedKB: number }> =>
    new Promise((resolve, reject) => {
      const originalKB = Math.round(file.size / 1024);
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        // Calculate new dimensions keeping aspect ratio
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round((height / width) * maxPx); width = maxPx; }
          else { width = Math.round((width / height) * maxPx); height = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          blob => {
            if (!blob) { reject(new Error("Canvas compression failed")); return; }
            resolve({ blob, originalKB, compressedKB: Math.round(blob.size / 1024) });
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = url;
    });

  // ── Image Upload (per slot index 0|1|2) ──────────────────────────────────
  const handleImageUpload = async (file: File, slotIdx: number) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setSlotError(prev => { const n = [...prev]; n[slotIdx] = "Only JPG, PNG, WebP or GIF allowed."; return n; });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSlotError(prev => { const n = [...prev]; n[slotIdx] = "Image must be under 10 MB."; return n; });
      return;
    }

    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setSlotPreview(prev => { const n = [...prev]; n[slotIdx] = localPreview; return n; });
    setSlotError(prev => { const n = [...prev]; n[slotIdx] = ""; return n; });
    setSlotUploading(prev => { const n = [...prev]; n[slotIdx] = true; return n; });
    setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 10; return n; });

    try {
      // Compress
      setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 25; return n; });
      const { blob: compressedBlob } = await compressImage(file);

      setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 45; return n; });

      // Upload
      const filename = `sarees/${Date.now()}-slot${slotIdx}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("saree-images")
        .upload(filename, compressedBlob, { cacheControl: "31536000", upsert: false, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 85; return n; });

      // Get URL
      const { data: urlData } = supabase.storage.from("saree-images").getPublicUrl(filename);
      const publicUrl = urlData.publicUrl;

      // Update sareeForm.images[slotIdx]
      setSareeForm(prev => {
        const imgs = [...prev.images] as [string, string, string];
        imgs[slotIdx] = publicUrl;
        return { ...prev, images: imgs };
      });
      setSlotPreview(prev => { const n = [...prev]; n[slotIdx] = publicUrl; return n; });
      setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 100; return n; });
    } catch (err: any) {
      setSlotError(prev => { const n = [...prev]; n[slotIdx] = err.message || "Upload failed. Check bucket exists."; return n; });
      setSlotPreview(prev => { const n = [...prev]; n[slotIdx] = ""; return n; });
    } finally {
      setSlotUploading(prev => { const n = [...prev]; n[slotIdx] = false; return n; });
      setTimeout(() => setSlotProgress(prev => { const n = [...prev]; n[slotIdx] = 0; return n; }), 1500);
    }
  };

  // ── POS ───────────────────────────────────────────────────────────────────
  const posSubtotal = posCart.reduce((s, i) => s + i.saree.price * i.quantity, 0);
  const posDiscountAmt = Math.min(posDiscount, posSubtotal);
  const posAfterDiscount = posSubtotal - posDiscountAmt;
  const posTaxAmt = Math.round(posAfterDiscount * TAX_RATE);
  const posTotal = posAfterDiscount + posTaxAmt;

  const handlePOSAdd = (saree: any) => {
    const avail = saree.stock_quantity ?? 0;
    const inCart = posCart.find(i => i.saree.id === saree.id)?.quantity || 0;
    if (inCart >= avail) { alert(`Only ${avail} in stock.`); return; }
    setPosCart(prev => {
      const idx = prev.findIndex(i => i.saree.id === saree.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, { saree, quantity: 1 }];
    });
  };

  const handlePOSQty = (sareeId: string, delta: number) => {
    setPosCart(prev => prev.map(i => {
      if (i.saree.id !== sareeId) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return null as any;
      if (newQty > (i.saree.stock_quantity ?? 0)) return i;
      return { ...i, quantity: newQty };
    }).filter(Boolean));
  };

  const handleAddProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileForm.name) return;
    // Insert without .select() to avoid RETURNING+RLS issue for authenticated role
    const { error } = await supabase.from("profiles").insert({
      name: profileForm.name,
      email: profileForm.email || null,
      phone: profileForm.phone || null,
      source: "offline",
      is_admin: false,
    });
    if (error) { alert(`Error creating customer: ${error.message}`); return; }
    setIsNewProfileModalOpen(false);
    setProfileForm({ ...emptyProfile });
    // Refetch profiles, then auto-select the newly added one by matching name+phone
    const { data: refreshed } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (refreshed) {
      setDbProfiles(refreshed);
      const newProfile = refreshed.find((p: any) =>
        p.name === profileForm.name && (p.phone === profileForm.phone || p.email === profileForm.email)
      );
      if (newProfile) setSelectedProfileId(newProfile.id);
    }
    showFeedback("Customer profile registered.");
  };

  const handleViewInvoice = async (order: any) => {
    setLoading(true);
    try {
      const { data: items } = await supabase.from("order_items").select("*, saree:sarees(*)").eq("order_id", order.id);
      setActiveInvoice({
        invoice_number: freshOrder?.invoice_number || `INV-${Date.now()}`,
        created_at: freshOrder?.created_at,
        customer_name: profile.name,
        customer_phone: profile.phone || undefined,
        customer_email: profile.email || undefined,
        is_offline: true,
        items: posCart,
        subtotal: posSubtotal,
        discount: posDiscountAmt,
        tax: posTaxAmt,
        total: posTotal,
        payment_mode: posPaymentMethod,
        notes: posNotes || undefined,
      });

      // 6. Reset POS
      setPosCart([]);
      setSelectedProfileId("");
      setPosDiscount(0);
      setPosNotes("");
      fetchAllData();
      await refreshCatalog(true);
      showFeedback("Bill generated! Stock updated.");
    } catch (err: any) {
      alert(`POS Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (!isMock) await supabase.auth.signOut();
      setUserSession(null);
      localStorage.removeItem("art_anchal_user");
      setView("home");
    } catch (err) {
      console.warn("Logout failed", err);
    }
  };

  // ── Access guard ──────────────────────────────────────────────────────────
  if (!userSession?.is_admin) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-[#FAF7F2] border border-brand-gold/25 p-10 text-center space-y-5">
          <Lock className="w-10 h-10 text-brand-maroon mx-auto stroke-[1.2]" />
          <h2 className="font-serif text-2xl text-brand-maroon font-light">Restricted Area</h2>
          <p className="text-xs text-brand-warm-gray leading-relaxed">Administrator credentials required.</p>
          <button onClick={() => setView("login-register")}
            className="w-full bg-brand-maroon text-[#FDFBF7] text-xs uppercase tracking-widest py-3.5 font-bold">
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems: { id: TabType; label: string; icon: any; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "catalog", label: "Catalog & Stock", icon: ShoppingBag, badge: outOfStock.length || undefined },
    { id: "crm", label: "CRM Leads", icon: Users, badge: dbLeads.filter(l => l.status === "new").length || undefined },
    { id: "pos", label: "Generate Bill", icon: IndianRupee },
    { id: "orders", label: "Order History", icon: FileText },
    { id: "hr", label: "HR & Staffing", icon: UserPlus },
    { id: "finance", label: "Finance & Ledger", icon: TrendingUp },
    { id: "vendors", label: "Vendors & Suppliers", icon: Package },
  ];

  const filteredSarees = dbSarees.filter(s =>
    s.name?.toLowerCase().includes(posSearch.toLowerCase())
  );
  const filteredLeads = dbLeads.filter(l =>
    l.name?.toLowerCase().includes(leadSearch.toLowerCase()) ||
    l.phone?.includes(leadSearch) || l.email?.toLowerCase().includes(leadSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFBF7] font-sans text-brand-maroon" id="admin-console-view">

      {/* ── MOBILE TOP NAV BAR (visible on small screens only) ────────────── */}
      <div className="md:hidden bg-[#1C050E] text-[#F9F5F0] flex flex-col sticky top-0 z-[60] shadow-xl print:hidden">
        {/* Brand strip */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <span className="text-[8px] tracking-[0.25em] uppercase text-brand-gold font-bold">Art & Anchal</span>
            <p className="font-serif text-base font-light text-white">Admin Console</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAllData} disabled={loading} className="text-white/60 hover:text-white">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setView("home")} className="text-white/60 hover:text-white" title="Back to Store">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="text-white/60 hover:text-white" title="Log Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Horizontal scroll tab bar */}
        <div className="flex overflow-x-auto scrollbar-hide gap-0.5 px-2 py-2">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button key={id}
              onClick={() => { setActiveTab(id); setActiveInvoice(null); }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition ${
                activeTab === id
                  ? "bg-brand-gold/20 text-brand-gold"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {label}
              {badge ? <span className="bg-brand-gold text-[#1C050E] text-[8px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {/* ── SIDEBAR (desktop only) ────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-[#1C050E] text-[#F9F5F0] flex-col print:hidden sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="px-6 py-7 border-b border-white/10">
          <span className="text-[9px] tracking-[0.3em] uppercase text-brand-gold font-bold block">Art & Anchal</span>
          <h1 className="font-serif text-lg font-light mt-0.5 text-white">Admin Console</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ id, label, icon: Icon, badge }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => { setActiveTab(id); setActiveInvoice(null); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm transition-all ${
                  active ? "bg-brand-gold/20 text-brand-gold font-semibold" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}>
                <span className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-brand-gold" : ""}`} />
                  {label}
                </span>
                {badge ? (
                  <span className="bg-brand-gold text-[#1C050E] text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-5 border-t border-white/10 space-y-3">
          <button onClick={fetchAllData} disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-white/15 text-white/60 hover:text-white text-xs py-2.5 rounded-lg transition">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync Data
          </button>
          <button onClick={() => setView("home")}
            className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-white text-xs py-2 transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </button>
          <div className="flex items-center gap-2 pt-1">
            <div className="w-7 h-7 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[10px] text-white font-semibold truncate">{userSession.name}</p>
              <p className="text-[9px] text-white/40 truncate">{userSession.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-white/50 hover:text-white transition" title="Log Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">

        {/* Feedback toast */}
        {feedback && (
          <div className="fixed top-5 right-5 z-50 bg-[#1C050E] text-brand-ivory text-xs px-5 py-3.5 border border-brand-gold/30 flex items-center gap-2 shadow-2xl rounded-lg animate-fade-in print:hidden">
            <CheckCircle className="w-4 h-4 text-brand-gold flex-shrink-0" />
            {feedback}
          </div>
        )}

        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {activeInvoice ? (
            <InvoiceDocument invoice={activeInvoice} onBack={() => setActiveInvoice(null)} />
          ) : (
            <>

          {/* ══ OVERVIEW TAB ═══════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in print:hidden">
              <div>
                <h2 className="font-serif text-2xl text-brand-maroon font-light">Dashboard Overview</h2>
                <p className="text-xs text-brand-warm-gray mt-0.5">Art&Anchal Varanasi Boutique</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-700", bg: "bg-emerald-500/10 border-emerald-500/20" },
                  { label: "Total Orders", value: dbOrders.length, icon: ShoppingBag, color: "text-[#5B0E2D]", bg: "bg-[#5B0E2D]/10 border-[#5B0E2D]/20" },
                  { label: "Active Leads", value: activeLeads, icon: Users, color: "text-amber-700", bg: "bg-amber-500/10 border-amber-500/20" },
                  { label: "Low Stock Items", value: lowStockSarees.length, icon: AlertTriangle, color: "text-red-700", bg: "bg-red-500/10 border-red-500/20" },
                ].map((kpi) => (
                  <div key={kpi.label} className="glass-card p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] uppercase tracking-widest text-brand-warm-gray font-bold font-sans">{kpi.label}</p>
                      <div className={`w-8 h-8 rounded-full ${kpi.bg} border flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                      </div>
                    </div>
                    <p className={`font-serif text-2xl font-bold mt-2 ${kpi.color}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Low stock alerts */}
              {lowStockSarees.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4" /> Stock Alerts
                  </h3>
                  <div className="space-y-2">
                    {lowStockSarees.map(s => (
                      <div key={s.id} className="flex justify-between items-center text-xs text-red-700">
                        <span className="font-serif font-semibold">{s.name}</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          s.stock_quantity <= 0 ? "bg-red-200 text-red-900" : "bg-amber-100 text-amber-800"
                        }`}>
                          {s.stock_quantity <= 0 ? "OUT OF STOCK" : `${s.stock_quantity} left`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent orders */}
              <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-brand-gold/15">
                  <h3 className="font-serif text-lg text-brand-maroon font-semibold">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                  <div className="divide-y divide-brand-gold/10 min-w-[300px]">
                  {dbOrders.slice(0, 5).map(o => (
                    <div key={o.id} className="px-5 py-3.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-brand-maroon">{o.customer_name}</p>
                        <p className="text-brand-warm-gray font-mono">{o.invoice_number || o.id?.slice(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-brand-maroon">₹{Number(o.total || 0).toLocaleString("en-IN")}</p>
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          o.is_offline ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>{o.is_offline ? "Showroom" : "Online"}</span>
                      </div>
                    </div>
                  ))}
                  {dbOrders.length === 0 && (
                    <p className="px-5 py-8 text-center text-xs text-brand-warm-gray italic">No orders yet.</p>
                  )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ CATALOG TAB ════════════════════════════════════════════════ */}
          {activeTab === "catalog" && (
            <div className="space-y-5 animate-fade-in print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl text-brand-maroon font-light">Saree Catalog & Stock</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">{dbSarees.length} items in inventory</p>
                </div>
                <button onClick={() => { setEditingSaree(null); setSareeForm({ ...emptySaree }); setSlotPreview(["","",""]); setSlotError(["","",""]); setSlotUploading([false,false,false]); setSlotProgress([0,0,0]); setUrlInputMode(false); setIsSareeModalOpen(true); }}
                  className="bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest px-5 py-3 font-bold flex items-center gap-2 hover:bg-brand-maroon/90 transition">
                  <Plus className="w-4 h-4" /> Add Saree
                </button>
              </div>

              <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#1C050E] text-[#F9F5F0] text-[10px] uppercase tracking-wider">
                        <th className="px-4 py-3.5">Product</th>
                        <th className="px-4 py-3.5">Technique</th>
                        <th className="px-4 py-3.5">Price</th>
                        <th className="px-4 py-3.5 text-center">Stock</th>
                        <th className="px-4 py-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gold/10">
                      {dbSarees.map(s => {
                        const stock = s.stock_quantity ?? 0;
                        const stockColor = stock <= 0 ? "text-red-700 bg-red-50" : stock <= 2 ? "text-amber-700 bg-amber-50" : "text-emerald-700 bg-emerald-50";
                        return (
                          <tr key={s.id} className="hover:bg-brand-sand/10 transition">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-12 bg-brand-sand overflow-hidden border border-brand-gold/20 flex-shrink-0 rounded">
                                  <img src={s.images?.[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="font-serif font-semibold text-[13px] text-brand-maroon leading-tight">{s.name}</p>
                                  <div className="flex gap-1 mt-0.5">
                                    {s.is_bestseller && <span className="text-[8px] bg-brand-gold/20 text-brand-gold-dark px-1.5 py-0.5 rounded font-bold uppercase">Bestseller</span>}
                                    {s.is_featured && <span className="text-[8px] bg-brand-maroon/10 text-brand-maroon px-1.5 py-0.5 rounded font-bold uppercase">Featured</span>}
                                    {s.is_new && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">New</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-brand-warm-gray">{s.weaving_technique}</td>
                            <td className="px-4 py-3.5">
                              <p className="font-mono font-bold">₹{Number(s.price).toLocaleString("en-IN")}</p>
                              {s.original_price && <p className="text-[10px] text-brand-warm-gray line-through font-mono">₹{Number(s.original_price).toLocaleString("en-IN")}</p>}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${stockColor}`}>
                                {stock <= 0 ? "Out of Stock" : `${stock} pcs`}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-center gap-3">
                                <button onClick={() => handleOpenEditSaree(s)} className="text-brand-gold-dark hover:text-brand-maroon transition" title="Edit">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteSaree(s.id)} className="text-red-600 hover:text-red-800 transition" title="Remove">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* Mobile Card Grid */}
                  <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                    {dbSarees.map(s => {
                      const stock = s.stock_quantity ?? 0;
                      const stockColor = stock <= 0 ? "text-red-700 bg-red-50" : stock <= 2 ? "text-amber-700 bg-amber-50" : "text-emerald-700 bg-emerald-50";
                      return (
                        <div key={s.id} className="glass-card p-4 flex flex-col space-y-2">
                          <div className="flex items-center gap-3">
                            <img src={s.images?.[0]} alt="" className="w-12 h-12 object-cover rounded" />
                            <div>
                              <p className="font-serif font-semibold text-sm text-brand-maroon">{s.name}</p>
                              <p className="text-xs text-brand-warm-gray">{s.weaving_technique}</p>
                            </div>
                          </div>
                          <p className="font-mono font-bold">₹{Number(s.price).toLocaleString("en-IN")}</p>
                          <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${stockColor}`}>{stock <= 0 ? "Out of Stock" : `${stock} pcs`}</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleOpenEditSaree(s)} className="text-brand-gold-dark hover:text-brand-maroon transition" title="Edit"><Edit className="w-4 h-4"/></button>
                            <button onClick={() => handleDeleteSaree(s.id)} className="text-red-600 hover:text-red-800 transition" title="Remove"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {dbSarees.length === 0 && (
                    <div className="py-16 text-center text-xs text-brand-warm-gray italic">
                      No sarees in catalog. Add your first saree above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ CRM TAB ════════════════════════════════════════════════════ */}
          {activeTab === "crm" && (
            <div className="space-y-5 animate-fade-in print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl text-brand-maroon font-light">CRM — Client Leads</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">{dbLeads.length} total leads</p>
                </div>
                <button onClick={() => setIsNewLeadModalOpen(true)}
                  className="bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest px-5 py-3 font-bold flex items-center gap-2 hover:bg-brand-maroon/90 transition">
                  <Plus className="w-4 h-4" /> Add Offline Lead
                </button>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "New", status: "new", color: "bg-blue-50 border-blue-200 text-blue-700" },
                  { label: "Contacted", status: "contacted", color: "bg-amber-50 border-amber-200 text-amber-700" },
                  { label: "Qualified", status: "qualified", color: "bg-purple-50 border-purple-200 text-purple-700" },
                  { label: "Won", status: "won", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                ].map(st => (
                  <div key={st.status} className={`border rounded-lg p-4 text-center ${st.color}`}>
                    <p className="text-[10px] uppercase font-bold">{st.label}</p>
                    <p className="font-serif text-2xl font-bold">{dbLeads.filter(l => l.status === st.status).length}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Leads list */}
                <div className="lg:col-span-7 space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-warm-gray" />
                    <input type="text" value={leadSearch} onChange={e => setLeadSearch(e.target.value)}
                      placeholder="Search by name, phone or email..."
                      className="w-full bg-[#FAF7F2] border border-brand-gold/20 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-maroon" />
                  </div>

                  <div className="space-y-2 max-h-[540px] overflow-y-auto">
                    {filteredLeads.map(lead => {
                      const active = selectedLead?.id === lead.id;
                      return (
                        <div key={lead.id} onClick={() => handleSelectLead(lead)}
                          className={`border p-4 cursor-pointer transition rounded-lg ${
                            active ? "border-brand-maroon bg-brand-sand/15 shadow-sm" : "border-brand-gold/20 hover:border-brand-gold/50 bg-[#FAF7F2]"
                          }`}>
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-serif font-semibold text-brand-maroon">{lead.name}</h4>
                                <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                  lead.status === "new" ? "bg-blue-100 text-blue-800" :
                                  lead.status === "contacted" ? "bg-amber-100 text-amber-800" :
                                  lead.status === "qualified" ? "bg-purple-100 text-purple-800" :
                                  lead.status === "won" ? "bg-emerald-100 text-emerald-800" :
                                  "bg-gray-100 text-gray-700"
                                }`}>{lead.status}</span>
                                <span className="text-[8px] uppercase font-mono border border-brand-gold/30 text-brand-gold px-1.5 py-0.5">{lead.source}</span>
                              </div>
                              <p className="text-[10px] text-brand-warm-gray font-mono">{lead.phone} {lead.email && `• ${lead.email}`}</p>
                              {lead.interest && <p className="text-[10px] text-brand-maroon/70 italic">Interest: {lead.interest}</p>}
                              {lead.message && <p className="text-xs text-brand-maroon font-serif italic truncate max-w-xs">&ldquo;{lead.message}&rdquo;</p>}
                            </div>
                            <span className="text-[9px] text-brand-warm-gray font-mono flex-shrink-0 ml-2">
                              {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {filteredLeads.length === 0 && (
                      <p className="text-center text-xs text-brand-warm-gray italic py-12">No leads found.</p>
                    )}
                  </div>
                </div>

                {/* Interaction panel */}
                <div ref={interactionPanelRef} className="lg:col-span-5 space-y-4">
                  <h3 className="font-serif text-lg text-brand-maroon border-b border-brand-gold/15 pb-2">Interaction Log</h3>
                  {selectedLead ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-[#FAF7F2] border border-brand-gold/20 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-serif font-semibold text-brand-maroon">{selectedLead.name}</h4>
                            <p className="text-[10px] text-brand-warm-gray">{selectedLead.phone}</p>
                          </div>
                          <select value={selectedLead.status}
                            onChange={e => handleUpdateLeadStatus(selectedLead.id, e.target.value)}
                            className="bg-brand-ivory border border-brand-gold/25 text-brand-maroon text-xs px-2 py-1.5 focus:outline-none">
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="proposal">Proposal</option>
                            <option value="won">Won ✓</option>
                            <option value="lost">Lost</option>
                          </select>
                        </div>
                      </div>

                      <form onSubmit={handleAddInteraction} className="bg-[#FAF7F2] border border-brand-gold/20 p-4 rounded-lg space-y-3">
                        <h4 className="text-[10px] uppercase tracking-wider font-bold text-brand-maroon">Log Activity</h4>
                        <select value={interactionChannel} onChange={e => setInteractionChannel(e.target.value)}
                          className="w-full bg-brand-ivory border border-brand-gold/20 px-2.5 py-2 text-xs focus:outline-none">
                          <option value="phone">Phone Call</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="email">Email</option>
                          <option value="in_person_showroom">Showroom Visit</option>
                        </select>
                        <textarea rows={3} required value={newInteractionNote}
                          onChange={e => setNewInteractionNote(e.target.value)}
                          placeholder="Notes from this interaction..."
                          className="w-full bg-brand-ivory border border-brand-gold/20 px-2.5 py-2 text-xs focus:outline-none focus:border-brand-maroon resize-none" />
                        <button type="submit"
                          className="w-full bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest py-2.5 font-bold hover:bg-brand-maroon/90 transition">
                          Log Entry
                        </button>
                      </form>

                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {leadInteractions.map(inter => (
                          <div key={inter.id} className="border-l-2 border-brand-gold pl-3 py-1 space-y-0.5">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[9px] uppercase font-bold text-brand-gold">{inter.channel?.replace(/_/g, " ")}</span>
                              <span className="text-[9px] font-mono text-brand-warm-gray">
                                {new Date(inter.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-xs text-brand-maroon font-serif italic">&ldquo;{inter.notes}&rdquo;</p>
                          </div>
                        ))}
                        {leadInteractions.length === 0 && (
                          <p className="text-xs text-brand-warm-gray italic text-center py-4">No interactions logged yet.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-brand-gold/25 rounded-lg py-20 text-center text-xs text-brand-warm-gray">
                      Select a lead to view interaction history.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ POS TAB ════════════════════════════════════════════════════ */}
          {activeTab === "pos" && !activeInvoice && (
            <div className="space-y-5 animate-fade-in print:hidden">
              <div>
                <h2 className="font-serif text-2xl text-brand-maroon font-light">Generate Showroom Bill</h2>
                <p className="text-xs text-brand-warm-gray mt-0.5">POS billing with automatic stock deduction</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Customer + Products */}
                <div className="lg:col-span-7 space-y-5">

                  {/* Step 1: Customer */}
                  <div className="bg-[#FAF7F2] border border-brand-gold/20 rounded-lg p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-brand-gold/10 pb-3">
                      <h3 className="font-serif text-base text-brand-maroon font-semibold">
                        <span className="text-brand-gold mr-1.5">1.</span> Customer
                      </h3>
                      <button onClick={() => setIsNewProfileModalOpen(true)}
                        className="text-[10px] uppercase font-bold text-brand-gold hover:text-brand-maroon flex items-center gap-1 transition">
                        <Plus className="w-3 h-3" /> New Customer
                      </button>
                    </div>
                    <div className="relative">
                      {selectedProfileId ? (
                        (() => {
                          const p = dbProfiles.find(x => x.id === selectedProfileId);
                          return p ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs space-y-0.5 relative group">
                              <p className="font-bold text-emerald-800">{p.name}</p>
                              {p.phone && <p className="text-emerald-700 font-mono">{p.phone}</p>}
                              {p.email && <p className="text-emerald-700">{p.email}</p>}
                              <button onClick={() => { setSelectedProfileId(""); setPosCustomerSearch(""); }}
                                className="absolute top-3 right-3 text-emerald-600 hover:text-emerald-900 text-[10px] font-bold uppercase underline">
                                Change
                              </button>
                            </div>
                          ) : null;
                        })()
                      ) : (
                        <div ref={customerDropdownRef} className="space-y-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-warm-gray" />
                            <input
                              type="text"
                              value={posCustomerSearch}
                              onChange={e => { setPosCustomerSearch(e.target.value); setIsCustomerDropdownOpen(true); }}
                              onFocus={() => setIsCustomerDropdownOpen(true)}
                              placeholder="Search by name, phone or email..."
                              className="w-full bg-brand-ivory border border-brand-gold/20 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-maroon"
                            />
                          </div>
                          {isCustomerDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-brand-gold/20 shadow-xl max-h-48 overflow-y-auto">
                              {dbProfiles.filter(p => p.name?.toLowerCase().includes(posCustomerSearch.toLowerCase()) || p.phone?.includes(posCustomerSearch) || p.email?.toLowerCase().includes(posCustomerSearch.toLowerCase())).length > 0 ? (
                                dbProfiles.filter(p => p.name?.toLowerCase().includes(posCustomerSearch.toLowerCase()) || p.phone?.includes(posCustomerSearch) || p.email?.toLowerCase().includes(posCustomerSearch.toLowerCase())).map(p => (
                                  <button key={p.id} onClick={() => { setSelectedProfileId(p.id); setIsCustomerDropdownOpen(false); setPosCustomerSearch(""); }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-brand-sand/30 border-b border-brand-gold/5 transition flex flex-col">
                                    <span className="font-bold text-brand-maroon">{p.name}</span>
                                    <span className="text-[10px] text-brand-warm-gray font-mono">{p.phone ? `${p.phone}` : ""} {p.email ? `• ${p.email}` : ""}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="p-3 text-center text-xs text-brand-warm-gray italic">No matching customers</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Products */}
                  <div className="bg-[#FAF7F2] border border-brand-gold/20 rounded-lg p-5 space-y-4">
                    <h3 className="font-serif text-base text-brand-maroon font-semibold border-b border-brand-gold/10 pb-3">
                      <span className="text-brand-gold mr-1.5">2.</span> Select Sarees
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-warm-gray" />
                      <input type="text" value={posSearch} onChange={e => setPosSearch(e.target.value)}
                        placeholder="Search sarees..." className="w-full bg-brand-ivory border border-brand-gold/20 pl-9 pr-4 py-2 text-xs focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                      {filteredSarees.map(saree => {
                        const stock = saree.stock_quantity ?? 0;
                        const outOfStockItem = stock <= 0;
                        return (
                          <button key={saree.id} onClick={() => !outOfStockItem && handlePOSAdd(saree)}
                            disabled={outOfStockItem}
                            className={`border p-3 flex gap-3 items-start text-left transition rounded-lg ${
                              outOfStockItem
                                ? "border-red-200 bg-red-50/50 opacity-60 cursor-not-allowed"
                                : "border-brand-gold/15 hover:border-brand-maroon bg-brand-ivory cursor-pointer"
                            }`}>
                            <div className="w-8 h-11 bg-brand-sand overflow-hidden border border-brand-gold/20 flex-shrink-0 rounded">
                              <img src={saree.images?.[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <p className="font-serif font-semibold text-xs text-brand-maroon leading-tight truncate">{saree.name}</p>
                              <p className="text-[9px] text-brand-gold uppercase">{saree.weaving_technique}</p>
                              <p className="text-[10px] font-mono font-bold">₹{Number(saree.price).toLocaleString("en-IN")}</p>
                              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full inline-block ${
                                outOfStockItem ? "bg-red-100 text-red-700" :
                                stock <= 2 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {outOfStockItem ? "Out of Stock" : `${stock} in stock`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Notes */}
                  <div className="bg-[#FAF7F2] border border-brand-gold/20 rounded-lg p-5 space-y-2">
                    <h3 className="font-serif text-base text-brand-maroon font-semibold">
                      <span className="text-brand-gold mr-1.5">3.</span> Bill Notes (optional)
                    </h3>
                    <textarea rows={2} value={posNotes} onChange={e => setPosNotes(e.target.value)}
                      placeholder="E.g. custom blouse, delivery date, alterations..."
                      className="w-full bg-brand-ivory border border-brand-gold/20 px-3 py-2 text-xs focus:outline-none focus:border-brand-maroon resize-none" />
                  </div>
                </div>

                {/* Right: Cart + Checkout */}
                <div className="lg:col-span-5">
                  <div className="bg-[#FAF7F2] border border-brand-gold/20 rounded-lg p-5 space-y-5 sticky top-6">
                    <h3 className="font-serif text-base text-brand-maroon font-semibold border-b border-brand-gold/10 pb-3">
                      Billing Cart
                    </h3>

                    {posCart.length === 0 ? (
                      <p className="text-xs italic text-brand-warm-gray/60 py-8 text-center">Cart is empty. Click sarees to add.</p>
                    ) : (
                      <div className="space-y-4">
                        {/* Items */}
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {posCart.map(item => (
                            <div key={item.saree.id} className="flex gap-3 items-center">
                              <div className="flex-1 min-w-0">
                                <p className="font-serif font-semibold text-xs text-brand-maroon truncate">{item.saree.name}</p>
                                <p className="text-[10px] font-mono text-brand-warm-gray">₹{Number(item.saree.price).toLocaleString("en-IN")} each</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button onClick={() => handlePOSQty(item.saree.id, -1)}
                                  className="w-6 h-6 border border-brand-gold/30 flex items-center justify-center hover:bg-brand-maroon hover:text-white transition rounded">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center font-mono text-xs font-bold">{item.quantity}</span>
                                <button onClick={() => handlePOSQty(item.saree.id, 1)}
                                  className="w-6 h-6 border border-brand-gold/30 flex items-center justify-center hover:bg-brand-maroon hover:text-white transition rounded">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="font-mono font-bold text-xs w-20 text-right">₹{Number(item.saree.price * item.quantity).toLocaleString("en-IN")}</p>
                              <button onClick={() => setPosCart(c => c.filter(i => i.saree.id !== item.saree.id))}
                                className="text-red-500 hover:text-red-700 transition">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Discount */}
                        <div className="flex items-center gap-2 border-t border-brand-gold/10 pt-3">
                          <Tag className="w-3.5 h-3.5 text-brand-warm-gray flex-shrink-0" />
                          <span className="text-[10px] uppercase font-bold text-brand-warm-gray">Discount (₹)</span>
                          <input type="number" min={0} max={posSubtotal} value={posDiscount || ""}
                            onChange={e => setPosDiscount(Number(e.target.value))}
                            placeholder="0"
                            className="ml-auto w-24 bg-brand-ivory border border-brand-gold/20 px-2 py-1.5 text-xs font-mono text-right focus:outline-none" />
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 border-t border-brand-gold/10 pt-3 text-xs">
                          <div className="flex justify-between text-brand-warm-gray">
                            <span>Subtotal</span>
                            <span className="font-mono">₹{posSubtotal.toLocaleString("en-IN")}</span>
                          </div>
                          {posDiscountAmt > 0 && (
                            <div className="flex justify-between text-emerald-600">
                              <span>Discount</span>
                              <span className="font-mono">−₹{posDiscountAmt.toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-brand-warm-gray">
                            <span>GST (CGST 2.5% + SGST 2.5%)</span>
                            <span className="font-mono">₹{posTaxAmt.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between font-bold text-sm border-t border-brand-maroon/15 pt-2 text-brand-maroon">
                            <span>Grand Total</span>
                            <span className="font-mono">₹{posTotal.toLocaleString("en-IN")}</span>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-brand-maroon block">Payment Method</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: "cash", label: "Cash" },
                              { id: "upi", label: "UPI" },
                              { id: "card", label: "Card" },
                              { id: "bank_transfer", label: "Bank Transfer" },
                            ].map(pay => (
                              <button key={pay.id} type="button" onClick={() => setPosPaymentMethod(pay.id)}
                                className={`border p-2 text-xs text-center font-semibold transition rounded ${
                                  posPaymentMethod === pay.id
                                    ? "bg-brand-maroon text-brand-ivory border-brand-maroon"
                                    : "bg-brand-ivory text-brand-maroon border-brand-gold/20 hover:border-brand-maroon"
                                }`}>
                                {pay.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button onClick={handlePOSCheckout} disabled={loading}
                          className="w-full bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest font-bold py-4 flex items-center justify-center gap-2 hover:bg-brand-maroon/90 transition shadow-md disabled:opacity-50">
                          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                          Generate Bill — ₹{posTotal.toLocaleString("en-IN")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ ORDERS TAB ════════════════════════════════════════════════ */}
          {activeTab === "orders" && (
            <div className="space-y-5 animate-fade-in print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl text-brand-maroon font-light">Order History</h2>
                  <p className="text-xs text-brand-warm-gray mt-0.5">{dbOrders.length} total orders</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-warm-gray" />
                  <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                    placeholder="Search by name or invoice..."
                    className="bg-[#FAF7F2] border border-brand-gold/20 pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand-maroon" />
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden">
                
                {/* ── DESKTOP TABLE ── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#1C050E] text-[#F9F5F0] text-[10px] uppercase tracking-wider">
                        <th className="px-4 py-3.5">Invoice #</th>
                        <th className="px-4 py-3.5">Customer</th>
                        <th className="px-4 py-3.5">Date</th>
                        <th className="px-4 py-3.5">Channel</th>
                        <th className="px-4 py-3.5">Payment</th>
                        <th className="px-4 py-3.5 text-right">Total</th>
                        <th className="px-4 py-3.5 text-center">Status</th>
                        <th className="px-4 py-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gold/10">
                      {dbOrders
                        .filter(o =>
                          o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.invoice_number?.toLowerCase().includes(orderSearch.toLowerCase())
                        )
                        .map(o => (
                          <tr key={o.id} className="hover:bg-brand-sand/10 transition">
                            <td className="px-4 py-3.5 font-mono text-[10px] text-brand-gold font-bold">{o.invoice_number || o.id?.slice(0, 8)}</td>
                            <td className="px-4 py-3.5">
                              <p className="font-serif font-semibold">{o.customer_name}</p>
                              {o.customer_phone && <p className="text-[10px] text-brand-warm-gray font-mono">{o.customer_phone}</p>}
                            </td>
                            <td className="px-4 py-3.5 text-brand-warm-gray">
                              {new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                o.is_offline ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                              }`}>{o.is_offline ? "Showroom" : "Online"}</span>
                            </td>
                            <td className="px-4 py-3.5 font-mono uppercase text-[10px] text-brand-gold-dark">{o.payment_mode || "—"}</td>
                            <td className="px-4 py-3.5 font-mono font-bold text-right">₹{Number(o.total || 0).toLocaleString("en-IN")}</td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                o.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                                o.status === "pending" ? "bg-amber-100 text-amber-700" :
                                o.status === "cancelled" ? "bg-red-100 text-red-700" :
                                "bg-blue-100 text-blue-700"
                              }`}>{o.status}</span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <button 
                                onClick={() => {
                                  setStatusModalOrder(o);
                                  setStatusForm({ 
                                    status: o.status || "", 
                                    tracking_number: o.tracking_number || "", 
                                    shipping_carrier: o.shipping_carrier || "" 
                                  });
                                }}
                                className="text-[10px] uppercase font-bold tracking-widest text-brand-maroon hover:text-brand-gold transition"
                              >
                                Update
                              </button>
                              <button 
                                onClick={() => handleViewInvoice(o)}
                                className="text-[10px] uppercase font-bold tracking-widest text-brand-gold hover:text-brand-maroon transition ml-3"
                              >
                                View Bill
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* ── MOBILE STACKED CARDS ── */}
                <div className="md:hidden divide-y divide-brand-gold/10">
                  {dbOrders
                    .filter(o =>
                      o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      o.invoice_number?.toLowerCase().includes(orderSearch.toLowerCase())
                    )
                    .map(o => (
                      <div key={o.id} className="p-4 bg-white hover:bg-brand-sand/10 transition">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-mono text-[10px] text-brand-gold font-bold bg-[#1C050E] px-1.5 py-0.5 rounded">{o.invoice_number || o.id?.slice(0, 8)}</span>
                            <p className="font-serif font-bold text-base mt-1">{o.customer_name}</p>
                          </div>
                          <span className="font-mono font-bold text-sm text-brand-maroon">₹{Number(o.total || 0).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider mb-2">
                          <span className={`px-2 py-0.5 rounded-full ${
                            o.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                            o.status === "pending" ? "bg-amber-100 text-amber-700" :
                            o.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>{o.status}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            o.is_offline ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          }`}>{o.is_offline ? "Showroom" : "Online"}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-brand-warm-gray pt-2 border-t border-brand-gold/5">
                          <span>{new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          <div className="flex items-center gap-4">
                            <span className="font-mono uppercase">{o.payment_mode || "—"}</span>
                            <button 
                              onClick={() => {
                                setStatusModalOrder(o);
                                setStatusForm({ 
                                  status: o.status || "", 
                                  tracking_number: o.tracking_number || "", 
                                  shipping_carrier: o.shipping_carrier || "" 
                                });
                              }}
                              className="text-brand-maroon font-bold uppercase hover:text-brand-gold transition"
                            >
                              Update
                            </button>
                            <button 
                              onClick={() => handleViewInvoice(o)}
                              className="text-brand-gold font-bold uppercase hover:text-brand-maroon transition ml-1"
                            >
                              View Bill
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {dbOrders.length === 0 && (
                  <div className="py-16 text-center text-xs text-brand-warm-gray italic">No orders yet.</div>
                )}
              </div>
            </div>
          )}

          {/* ══ HR TAB ════════════════════════════════════════════════ */}
          {activeTab === "hr" && (
            <AdminHRTab 
              dbEmployees={dbEmployees} 
              dbAttendance={dbAttendance} 
              fetchAllData={fetchAllData} 
            />
          )}

          {/* ══ FINANCE TAB ════════════════════════════════════════════════ */}
          {activeTab === "finance" && (
            <AdminFinanceTab 
              dbExpenses={dbExpenses} 
              dbPurchases={dbPurchases} 
              dbDues={dbDues} 
              dbOrders={dbOrders} 
              fetchAllData={fetchAllData} 
            />
          )}

          {/* ══ VENDORS TAB ════════════════════════════════════════════════ */}
          {activeTab === "vendors" && (
            <AdminVendorsTab 
              dbPurchases={dbPurchases} 
              dbDues={dbDues} 
            />
          )}

          </>
          )}
        </div>
      </main>

      {/* ══ MODAL: ADD/EDIT SAREE ══════════════════════════════════════════ */}
      {isSareeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-maroon/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#FDFBF7] border border-brand-gold/25 rounded-lg p-6 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl text-brand-maroon">{editingSaree ? "Edit Saree" : "Add New Saree"}</h3>
              <button onClick={() => setIsSareeModalOpen(false)} className="text-brand-warm-gray hover:text-brand-maroon">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSaree} className="space-y-4 text-xs text-brand-maroon">
              {/* Name + Material */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Saree Name *</label>
                  <input type="text" required value={sareeForm.name} onChange={e => setSareeForm({ ...sareeForm, name: e.target.value })}
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Material *</label>
                  <input type="text" required value={sareeForm.material} onChange={e => setSareeForm({ ...sareeForm, material: e.target.value })}
                    placeholder="e.g. 100% Pure Katan Silk" list="material-list"
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" />
                  <datalist id="material-list">
                    {Array.from(new Set(dbSarees.map(s => s.material).filter(Boolean))).map((m: any) => <option key={m} value={m} />)}
                  </datalist>
                </div>
              </div>

              {/* Price + Original Price + Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Price (₹) *</label>
                  <input type="number" min="0" required value={sareeForm.price} onChange={e => setSareeForm({ ...sareeForm, price: Number(e.target.value) })}
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Original Price (₹)</label>
                  <input type="number" min="0" value={sareeForm.original_price} onChange={e => setSareeForm({ ...sareeForm, original_price: e.target.value })}
                    placeholder="Optional" className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block flex items-center gap-1">
                    <Package className="w-3 h-3" /> Stock Qty *
                  </label>
                  <input type="number" min={0} required value={sareeForm.stock_quantity} onChange={e => setSareeForm({ ...sareeForm, stock_quantity: Number(e.target.value) })}
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon font-mono" />
                </div>
              </div>

              {/* Zari + Technique + Collection */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Zari Type</label>
                  <input type="text" value={sareeForm.zari_type} onChange={e => setSareeForm({ ...sareeForm, zari_type: e.target.value })}
                    placeholder="e.g. Pure Gold Zari" list="zari-list"
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" />
                  <datalist id="zari-list">
                    {Array.from(new Set(dbSarees.map(s => s.zari_type).filter(Boolean))).map((z: any) => <option key={z} value={z} />)}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Technique</label>
                  <input type="text" value={sareeForm.weaving_technique} onChange={e => setSareeForm({ ...sareeForm, weaving_technique: e.target.value })}
                    placeholder="e.g. Kadwa Handloom" list="technique-list"
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" />
                  <datalist id="technique-list">
                    {Array.from(new Set(dbSarees.map(s => s.weaving_technique).filter(Boolean))).map((t: any) => <option key={t} value={t} />)}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Collection</label>
                  <select value={sareeForm.collection_id} onChange={e => setSareeForm({ ...sareeForm, collection_id: e.target.value })}
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none">
                    <option value="">— None —</option>
                    {dbCollections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Artisan + Color + Image */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Artisan</label>
                  <select value={sareeForm.artisan_id} onChange={e => setSareeForm({ ...sareeForm, artisan_id: e.target.value })}
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none">
                    <option value="">— None —</option>
                    {dbArtisans.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Color</label>
                  <input type="text" value={sareeForm.colors} onChange={e => setSareeForm({ ...sareeForm, colors: e.target.value })}
                    placeholder="e.g. Ivory Gold" list="color-list"
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" />
                  <datalist id="color-list">
                    {Array.from(new Set(dbSarees.flatMap(s => s.colors || []).filter(Boolean))).map((c: any) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="space-y-2 col-span-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold block">
                      Product Images <span className="text-brand-gold font-normal">(at least 1 required)</span>
                    </label>
                    <span className="text-[9px] text-brand-warm-gray">JPG · PNG · WebP · max 10MB each</span>
                  </div>

                  {/* Hidden file inputs — one per slot, triggered by ref */}
                  {[0, 1, 2].map(idx => (
                    <input
                      key={idx}
                      ref={fileInputRefs[idx]}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, idx);
                        e.target.value = "";
                      }}
                    />
                  ))}

                  {/* 3-slot grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {(["Main", "Detail", "Drape"] as const).map((label, idx) => (
                      <div key={idx} className="space-y-1">
                        <span className="text-[9px] uppercase font-bold text-brand-warm-gray block text-center">
                          {label} {idx === 0 && <span className="text-red-500">*</span>}
                        </span>

                        {/* Slot card — click triggers ref input */}
                        <div
                          className={`relative border-2 border-dashed rounded-lg transition group ${
                            slotUploading[idx]
                              ? "border-brand-gold/60 cursor-wait"
                              : "border-brand-gold/30 hover:border-brand-maroon cursor-pointer"
                          }`}
                          onClick={() => !slotUploading[idx] && fileInputRefs[idx].current?.click()}
                          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-brand-maroon'); }}
                          onDragLeave={e => { e.currentTarget.classList.remove('border-brand-maroon'); }}
                          onDrop={e => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-brand-maroon');
                            const file = e.dataTransfer.files?.[0];
                            if (file && !slotUploading[idx]) handleImageUpload(file, idx);
                          }}
                        >
                          {slotPreview[idx] ? (
                            /* Preview */
                            <div className="relative rounded-lg overflow-hidden">
                              <img
                                src={slotPreview[idx]}
                                alt={label}
                                className="w-full h-28 object-cover"
                              />
                              {/* Hover overlay */}
                              {!slotUploading[idx] && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 rounded-lg">
                                  <Upload className="w-4 h-4 text-white" />
                                  <span className="text-white text-[8px] font-bold uppercase">Replace</span>
                                </div>
                              )}
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setSareeForm(prev => {
                                    const imgs = [...prev.images] as [string, string, string];
                                    imgs[idx] = "";
                                    return { ...prev, images: imgs };
                                  });
                                  setSlotPreview(prev => { const n = [...prev]; n[idx] = ""; return n; });
                                  setSlotError(prev => { const n = [...prev]; n[idx] = ""; return n; });
                                  setSlotProgress(prev => { const n = [...prev]; n[idx] = 0; return n; });
                                }}
                                className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            /* Empty slot */
                            <div className="py-6 flex flex-col items-center gap-1.5 text-brand-warm-gray">
                              <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-brand-gold" />
                              </div>
                              <p className="text-[8px] text-center leading-tight">Click or drop<br/>image here</p>
                            </div>
                          )}

                          {/* Progress bar */}
                          {slotUploading[idx] && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1.5 flex items-center gap-1.5 rounded-b-lg">
                              <div className="flex-1 bg-white/20 rounded-full h-1 overflow-hidden">
                                <div
                                  className="h-full bg-brand-gold transition-all duration-300 rounded-full"
                                  style={{ width: `${slotProgress[idx]}%` }}
                                />
                              </div>
                              <span className="text-white text-[8px] font-mono">{slotProgress[idx]}%</span>
                            </div>
                          )}
                        </div>

                        {/* Per-slot messages */}
                        {slotError[idx] ? (
                          <p className="text-[9px] text-red-500 flex items-start gap-1 leading-tight">
                            <AlertTriangle className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                            {slotError[idx]}
                          </p>
                        ) : !slotUploading[idx] && slotProgress[idx] === 100 && slotPreview[idx] ? (
                          <p className="text-[9px] text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" /> Uploaded
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">Description *</label>
                <textarea rows={3} required value={sareeForm.description} onChange={e => setSareeForm({ ...sareeForm, description: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none resize-none" />
              </div>

              {/* Specs */}
              <div className="bg-[#FAF7F2] border border-brand-gold/15 p-4 rounded-lg space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-brand-maroon">Specifications</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "spec_length", label: "Length" },
                    { key: "spec_width", label: "Width" },
                    { key: "spec_blouse", label: "Blouse" },
                    { key: "spec_wash_care", label: "Wash Care" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-brand-warm-gray">{label}</label>
                      <input type="text" value={(sareeForm as any)[key]}
                        onChange={e => setSareeForm({ ...sareeForm, [key]: e.target.value })}
                        className="w-full bg-white border border-brand-gold/15 p-2 text-xs focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-6 py-2 border-y border-brand-gold/15">
                {[
                  { key: "is_bestseller", label: "Bestseller" },
                  { key: "is_featured", label: "Featured" },
                  { key: "is_new", label: "New Arrival" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={(sareeForm as any)[key]}
                      onChange={e => setSareeForm({ ...sareeForm, [key]: e.target.checked })}
                      className="accent-brand-maroon h-4 w-4 cursor-pointer" />
                    <span className="text-xs font-bold">{label}</span>
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsSareeModalOpen(false)}
                  className="text-brand-warm-gray uppercase tracking-wider text-[10px] font-bold px-4 py-2 hover:text-brand-maroon transition">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="bg-brand-maroon text-brand-ivory uppercase tracking-widest text-[10px] font-bold px-6 py-3 hover:bg-brand-maroon/90 transition shadow flex items-center gap-2 disabled:opacity-50">
                  {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
                  {editingSaree ? "Save Changes" : "Add to Catalog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL: ADD OFFLINE LEAD ════════════════════════════════════════ */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-maroon/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FDFBF7] border border-brand-gold/25 rounded-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl text-brand-maroon">Add Offline Lead</h3>
              <button onClick={() => setIsNewLeadModalOpen(false)} className="text-brand-warm-gray hover:text-brand-maroon">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOfflineLead} className="space-y-4 text-xs text-brand-maroon">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">Client Name *</label>
                <input type="text" required value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Phone</label>
                  <input type="tel" value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="+91..." className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block">Email</label>
                  <input type="email" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">Interest / Saree Type</label>
                <input type="text" value={leadForm.interest} onChange={e => setLeadForm({ ...leadForm, interest: e.target.value })}
                  placeholder="e.g. Bridal Katan Silk, Shikargah Collection..."
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">Notes</label>
                <textarea rows={3} value={leadForm.message} onChange={e => setLeadForm({ ...leadForm, message: e.target.value })}
                  placeholder="Occasion, budget, color preferences, timeline..."
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-brand-gold/15">
                <button type="button" onClick={() => setIsNewLeadModalOpen(false)}
                  className="text-brand-warm-gray uppercase text-[10px] font-bold px-4 py-2 hover:text-brand-maroon transition">
                  Cancel
                </button>
                <button type="submit"
                  className="bg-brand-maroon text-brand-ivory uppercase tracking-widest text-[10px] font-bold px-5 py-3 hover:bg-brand-maroon/90 transition shadow">
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL: ADD CUSTOMER (POS) ══════════════════════════════════════ */}
      {isNewProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-maroon/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FDFBF7] border border-brand-gold/25 rounded-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl text-brand-maroon">Register Customer</h3>
              <button onClick={() => setIsNewProfileModalOpen(false)} className="text-brand-warm-gray hover:text-brand-maroon">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProfile} className="space-y-4 text-xs text-brand-maroon">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">Full Name *</label>
                <input type="text" required value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">Phone</label>
                <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91..." className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block">Email</label>
                <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-brand-gold/15">
                <button type="button" onClick={() => setIsNewProfileModalOpen(false)}
                  className="text-brand-warm-gray uppercase text-[10px] font-bold px-4 py-2 hover:text-brand-maroon transition">
                  Cancel
                </button>
                <button type="submit"
                  className="bg-brand-maroon text-brand-ivory uppercase tracking-widest text-[10px] font-bold px-5 py-3 hover:bg-brand-maroon/90 transition shadow">
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UPDATE ORDER STATUS MODAL ── */}
      {statusModalOrder && (
        <div className="fixed inset-0 bg-brand-maroon/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] w-full max-w-md p-6 sm:p-8 shadow-2xl relative border border-brand-gold/20">
            <div className="flex justify-between items-center mb-6 border-b border-brand-gold/15 pb-4">
              <div>
                <h3 className="font-serif text-xl text-brand-maroon">Update Order</h3>
                <p className="text-[10px] text-brand-warm-gray font-mono font-bold uppercase tracking-widest mt-1">Invoice: {statusModalOrder.invoice_number || statusModalOrder.id?.slice(0,8)}</p>
              </div>
              <button onClick={() => setStatusModalOrder(null)} className="text-brand-warm-gray hover:text-brand-maroon">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4 text-xs text-brand-maroon">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block tracking-widest">Order Status *</label>
                <select 
                  required
                  value={statusForm.status} 
                  onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon appearance-none"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid (Unfulfilled)</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {(statusForm.status === 'shipped' || statusForm.status === 'delivered') && (
                <div className="space-y-4 pt-2 border-t border-brand-gold/10 mt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold block tracking-widest">Shipping Carrier</label>
                    <input 
                      type="text" 
                      placeholder="e.g. BlueDart, FedEx"
                      value={statusForm.shipping_carrier} 
                      onChange={e => setStatusForm({ ...statusForm, shipping_carrier: e.target.value })}
                      className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold block tracking-widest">Tracking Number</label>
                    <input 
                      type="text" 
                      placeholder="AWB / Tracking Number"
                      value={statusForm.tracking_number} 
                      onChange={e => setStatusForm({ ...statusForm, tracking_number: e.target.value })}
                      className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none font-mono" 
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setStatusModalOrder(null)}
                  className="text-brand-warm-gray uppercase text-[10px] font-bold px-4 py-2 hover:text-brand-maroon transition tracking-widest">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdatingStatus}
                  className="bg-brand-maroon text-brand-ivory uppercase tracking-widest text-[10px] font-bold px-5 py-3 hover:bg-brand-maroon/90 transition shadow disabled:opacity-50">
                  {isUpdatingStatus ? "Updating..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
