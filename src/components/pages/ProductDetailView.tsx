/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, MouseEvent, CSSProperties, useEffect, useRef } from "react";
import { ViewState, Saree } from "../../types";
import {
  Heart, ShoppingBag, Award, ZoomIn, ArrowLeft,
  ChevronLeft, ChevronRight, CheckCircle2, Star,
  Package, Truck, RotateCcw, X, Share2, Info
} from "lucide-react";

interface ProductDetailViewProps {
  sareeId: string | null;
  setView: (view: ViewState) => void;
  addToCart: (saree: Saree, quantity: number) => void;
  toggleFavorite: (saree: Saree) => void;
  wishlist: Saree[];
  setSelectedSareeId: (id: string | null) => void;
  setQuickViewSaree: (saree: Saree) => void;
  setSelectedCategory: (category: string | null) => void;
  sarees: Saree[];
}

const IMAGE_LABELS = ["Main Details", "Artisan Weave", "Graceful Drape"];

export default function ProductDetailView({
  sareeId,
  setView,
  addToCart,
  toggleFavorite,
  wishlist,
  setSelectedSareeId,
  setQuickViewSaree,
  sarees,
}: ProductDetailViewProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<"fabric" | "weave" | "wash">("fabric");
  const [customBlouse, setCustomBlouse] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<CSSProperties>({ display: "none" });
  const [addedPulse, setAddedPulse] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Show sticky bar when main CTA scrolls out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle ESC key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLightbox(false);
      if (e.key === "ArrowLeft" && showLightbox) goPrev();
      if (e.key === "ArrowRight" && showLightbox) goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLightbox]);

  const rawSaree = useMemo(() => sarees.find((s) => s.id === sareeId) || sarees[0], [sareeId, sarees]);

  const saree = useMemo(() => {
    const r = rawSaree as any;
    return {
      ...r,
      images: (r.images || (r.image_url ? [r.image_url] : [])).filter(Boolean),
      price: r.price ?? 0,
      originalPrice: r.originalPrice ?? r.original_price ?? null,
      name: r.name ?? "",
      category: r.category ?? "",
      description: r.description ?? "",
      weavingTechnique: r.weavingTechnique ?? r.weaving_technique ?? "",
      zariType: r.zariType ?? r.zari_type ?? "",
      drapeRecommendation: r.drapeRecommendation ?? r.drape_recommendation ?? "",
      material: r.material ?? "",
      rating: r.rating ?? 5,
      reviewsCount: r.reviewsCount ?? r.review_count ?? 0,
      weaverName: r.weaverName ?? r.weaver_name ?? null,
      weaverVillage: r.weaverVillage ?? r.weaver_village ?? null,
      weaverStorySnippet: r.weaverStorySnippet ?? r.weaver_story_snippet ?? "",
      specifications: r.specifications ?? {
        length: r.spec_length ?? "5.5 Meters",
        width: r.spec_width ?? "45 Inches",
        blousePiece: r.spec_blouse ?? "80 cm unstitched",
        washCare: r.spec_wash_care ?? "Dry clean only",
        origin: r.spec_origin ?? "Varanasi, Uttar Pradesh, India",
      },
    };
  }, [rawSaree]);

  const images: string[] = saree.images;
  const isFaved = wishlist.some((item) => item.id === saree.id);
  const discount = saree.originalPrice
    ? Math.round((1 - saree.price / saree.originalPrice) * 100)
    : null;

  const priceFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(saree.price);

  const originalPriceFormatted = saree.originalPrice
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(saree.originalPrice)
    : null;

  const relatedProducts = useMemo(() =>
    sarees.filter((item) => item.category === saree.category && item.id !== saree.id).slice(0, 3),
    [saree, sarees]
  );

  const handleRelatedClick = (id: string) => {
    setSelectedSareeId(id);
    setActiveImageIdx(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleZoomMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${images[activeImageIdx] || images[0]})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: "220%",
    });
  };

  const handleZoomLeave = () => setZoomStyle({ display: "none" });
  const goPrev = () => setActiveImageIdx(i => (i - 1 + images.length) % images.length);
  const goNext = () => setActiveImageIdx(i => (i + 1) % images.length);

  const handleAddToBag = () => {
    addToCart(saree, quantity);
    setAddedPulse(true);
    setTimeout(() => setAddedPulse(false), 1200);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: saree.name,
        text: saree.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen font-sans antialiased text-[#3E3E3E]" id="product-detail-view-container">

      {/* ── Sticky Add-to-Bag Bar ─────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          showStickyBar ? "translate-y-0 opacity-100 shadow-xl" : "-translate-y-full opacity-0"
        } bg-[#FDFBF7]/95 backdrop-blur-md border-b border-brand-gold/15`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {images[0] && (
              <img src={images[0]} alt={`${saree.name} thumbnail`} className="w-10 h-13 object-cover rounded border border-brand-gold/20 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-maroon truncate tracking-wide uppercase font-serif">{saree.name}</p>
              <p className="text-xs font-mono text-brand-gold font-bold">{priceFormatted}</p>
            </div>
          </div>
          <button
            onClick={handleAddToBag}
            className="bg-brand-maroon hover:bg-[#3E061E] active:scale-95 text-brand-ivory text-[10px] tracking-widest uppercase font-bold py-2.5 px-6 transition-all duration-300 flex-shrink-0 flex items-center gap-2 shadow-lg shadow-brand-maroon/10"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Bag
          </button>
        </div>
      </div>

      {/* ── Breadcrumb & Action Row ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex items-center justify-between">
        <button
          onClick={() => setView("shop")}
          className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-widest font-semibold text-brand-warm-gray hover:text-brand-maroon transition group"
          id="detail-back-to-shop-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-brand-gold transition group-hover:-translate-x-0.5" />
          Back to Collection
          <span className="text-brand-gold/40 mx-1">/</span>
          <span className="text-brand-gold-dark capitalize">{saree.category}</span>
        </button>

        <button
          onClick={handleShare}
          className="p-2 text-brand-warm-gray hover:text-brand-maroon transition rounded-full hover:bg-brand-sand/50"
          title="Share product"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── Main Product Grid ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

          {/* LEFT: Image Gallery (Span 5) ───────────────────────────────────────── */}
          <div className="lg:col-span-5 max-w-md mx-auto lg:max-w-none w-full space-y-4">
            
            {/* Main Interactive Display Box */}
            <div
              onClick={() => setShowLightbox(true)}
              className="relative w-full aspect-[3/4] overflow-hidden bg-brand-sand cursor-zoom-in group shadow-sm border border-brand-gold/10 hover:shadow-md transition-shadow duration-300"
              onMouseMove={handleZoomMove}
              onMouseLeave={handleZoomLeave}
            >
              <img
                key={images[activeImageIdx]}
                src={images[activeImageIdx] || images[0]}
                alt={`${saree.name} view`}
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
                fetchPriority="high"
              />

              {/* Zoom lens overlay (only visible on mousemove) */}
              <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 hidden md:block" style={zoomStyle} />

              {/* Sophisticated gradient overlay for editorial feel */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/25 via-black/5 to-transparent pointer-events-none" />

              {/* Navigation overlays */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); goPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white active:scale-95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md z-10"
                  >
                    <ChevronLeft className="w-5 h-5 text-brand-maroon" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); goNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white active:scale-95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md z-10"
                  >
                    <ChevronRight className="w-5 h-5 text-brand-maroon" />
                  </button>
                </>
              )}

              {/* Badges / Labels */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {images.length > 1 && (
                  <span className="bg-brand-maroon/90 backdrop-blur-sm text-brand-ivory text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 shadow-sm rounded-sm">
                    {IMAGE_LABELS[activeImageIdx] ?? `${activeImageIdx + 1} / ${images.length}`}
                  </span>
                )}
                {discount && (
                  <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 shadow-sm rounded-sm self-start">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* View High-res Hint */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ZoomIn className="w-3.5 h-3.5 text-brand-gold" />
                <span>Tap to Expand</span>
              </div>
            </div>

            {/* Micro-indicator Dots (Only for mobile where thumb strips wrap) */}
            {images.length > 1 && (
              <div className="flex md:hidden justify-center items-center gap-2 py-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === activeImageIdx ? "w-6 h-1.5 bg-brand-maroon" : "w-1.5 h-1.5 bg-brand-gold/30 hover:bg-brand-gold"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Aesthetic Horizontal Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin hide-scrollbar snap-x snap-mandatory">
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIdx(index)}
                    className={`relative flex-shrink-0 w-24 sm:w-28 aspect-[3/4] overflow-hidden rounded-md transition-all duration-300 snap-start border-2 ${
                      activeImageIdx === index
                        ? "border-brand-maroon scale-[0.98] shadow-sm"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    id={`thumb-btn-${index}`}
                  >
                    <img
                      src={imgUrl}
                      alt={IMAGE_LABELS[index] ?? `View ${index + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[8px] font-bold uppercase tracking-wider text-white">
                      {IMAGE_LABELS[index] ? IMAGE_LABELS[index].split(" ")[0] : index + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Context (Span 7) ──────────────────────────────── */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-6 pt-2 lg:pt-0">

            {/* Category, Origin & technique tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] tracking-[0.2em] font-extrabold uppercase text-brand-maroon bg-brand-maroon/5 border border-brand-maroon/10 px-2.5 py-1">
                {saree.category}
              </span>
              {saree.weavingTechnique && (
                <span className="text-[9px] tracking-[0.15em] font-bold uppercase text-brand-gold bg-brand-sand/50 border border-brand-gold/20 px-2.5 py-1">
                  {saree.weavingTechnique}
                </span>
              )}
              {saree.specifications.origin && (
                <span className="text-[9px] tracking-[0.1em] font-medium text-brand-warm-gray flex items-center gap-1">
                  <Info className="w-3 h-3 text-brand-gold" />
                  {saree.specifications.origin.split(",")[0]}
                </span>
              )}
            </div>

            {/* Title & Reviews */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl text-brand-maroon leading-tight font-medium tracking-tight">
                {saree.name}
              </h1>
              
              <div className="flex items-center gap-2.5 pt-1">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(saree.rating) ? "fill-brand-gold text-brand-gold" : "text-brand-gold/20"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-brand-warm-gray font-medium">
                  {saree.rating?.toFixed(1)} · <span className="underline decoration-brand-gold/40 hover:text-brand-maroon cursor-pointer transition">{saree.reviewsCount} reviews</span>
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-4 bg-brand-sand/20 border-y border-brand-gold/15 flex items-baseline justify-between flex-wrap gap-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-mono font-bold text-brand-maroon tracking-tight">
                  {priceFormatted}
                </span>
                {originalPriceFormatted && (
                  <span className="text-base font-mono text-brand-warm-gray/50 line-through">
                    {originalPriceFormatted}
                  </span>
                )}
              </div>
              {discount && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Short narrative description */}
            <p className="text-sm text-brand-warm-gray leading-relaxed font-light">
              {saree.description}
            </p>

            {/* Editorial Heritage Recommendation Box */}
            {saree.drapeRecommendation && (
              <div className="flex gap-3 bg-[#FCFAF5] border-l-2 border-brand-gold p-4 shadow-sm rounded-r-md">
                <Award className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-brand-gold-dark leading-relaxed italic">
                  <span className="not-italic font-bold text-brand-maroon uppercase tracking-wider block mb-0.5 text-[9px]">Heritage Drape Instruction</span>
                  {saree.drapeRecommendation}
                </div>
              </div>
            )}

            {/* Custom Blouse Stitching Panel */}
            <div
              onClick={() => setCustomBlouse(!customBlouse)}
              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                customBlouse
                  ? "border-brand-maroon bg-brand-maroon/5 shadow-sm"
                  : "border-brand-gold/15 hover:border-brand-gold/40 hover:bg-brand-sand/10"
              }`}
            >
              <div className="space-y-0.5">
                <span className="block text-xs font-bold text-brand-maroon uppercase tracking-wider">
                  Tailored Blouse Stitching
                </span>
                <span className="block text-[10px] text-brand-warm-gray">
                  Custom handcrafting by our Banaras heritage atelier (+ ₹1,800)
                </span>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0 ${
                customBlouse ? "bg-brand-maroon" : "bg-brand-gold/20"
              }`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ease-out ${
                  customBlouse ? "left-5.5" : "left-0.5"
                }`} />
              </div>
            </div>

            {/* CTA action cluster */}
            <div ref={ctaRef} className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Micro-counter Stepper */}
                <div className="flex items-center border border-brand-gold/30 rounded-md bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-12 flex items-center justify-center text-brand-maroon hover:bg-brand-sand transition font-semibold text-lg"
                    id="qty-decrease-btn"
                  >−</button>
                  <span className="w-10 h-12 flex items-center justify-center text-sm font-bold text-brand-maroon border-x border-brand-gold/10 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-12 flex items-center justify-center text-brand-maroon hover:bg-brand-sand transition font-semibold text-lg"
                    id="qty-increase-btn"
                  >+</button>
                </div>

                {/* Core Add to Bag Action Button */}
                <button
                  onClick={handleAddToBag}
                  className={`flex-1 h-12 flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest transition-all duration-300 rounded-md ${
                    addedPulse
                      ? "bg-emerald-600 text-white scale-[0.98]"
                      : "bg-brand-maroon hover:bg-[#4E0C26] text-brand-ivory hover:shadow-lg hover:shadow-brand-maroon/15 active:scale-98"
                  }`}
                  id="add-to-bag-cta-btn"
                >
                  {addedPulse ? (
                    <><CheckCircle2 className="w-4 h-4" /> Added to Bag</>
                  ) : (
                    <><ShoppingBag className="w-4 h-4" /> Add to Bag</>
                  )}
                </button>

                {/* Wishlist Icon */}
                <button
                  onClick={() => toggleFavorite(saree)}
                  className={`w-12 h-12 flex items-center justify-center border rounded-md transition-all duration-300 active:scale-95 ${
                    isFaved
                      ? "border-brand-maroon bg-brand-maroon/5 text-brand-maroon"
                      : "border-brand-gold/30 hover:border-brand-maroon hover:text-brand-maroon bg-transparent"
                  }`}
                  title={isFaved ? "Remove from wishlist" : "Add to wishlist"}
                  id="wishlist-toggle-heart-btn"
                >
                  <Heart className={`w-4 h-4 ${isFaved ? "fill-brand-maroon" : ""}`} />
                </button>
              </div>
            </div>

            {/* Core Trust / Quality Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Package, label: "Pure Handloom", sub: "Silk Mark certified" },
                { icon: Truck, label: "Global Delivery", sub: "Free shipping PAN-India" },
                { icon: RotateCcw, label: "Secure Care", sub: "7-day return policy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 p-3 bg-brand-sand/20 rounded-md border border-brand-gold/5 shadow-xs">
                  <Icon className="w-4 h-4 text-brand-gold" />
                  <span className="text-[9px] font-bold text-brand-maroon uppercase tracking-wider mt-1">{label}</span>
                  <span className="text-[8px] text-brand-warm-gray">{sub}</span>
                </div>
              ))}
            </div>

            {/* Spec Tabs Card */}
            <div className="border border-brand-gold/15 overflow-hidden rounded-lg bg-white shadow-xs">
              <div className="flex border-b border-brand-gold/15">
                {(["fabric", "weave", "wash"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`flex-1 py-3 text-[9px] uppercase tracking-wider font-bold cursor-pointer transition-colors duration-300 ${
                      selectedTab === tab
                        ? "bg-brand-maroon text-brand-ivory"
                        : "text-brand-warm-gray hover:text-brand-maroon hover:bg-brand-sand/20"
                    }`}
                    id={`tab-btn-${tab}`}
                  >
                    {tab === "fabric" ? "Specifications" : tab === "weave" ? "Weaving Art" : "Care & Dry"}
                  </button>
                ))}
              </div>
              <div className="p-5 text-xs text-brand-warm-gray leading-relaxed min-h-28 flex flex-col justify-center">
                {selectedTab === "fabric" && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {[
                      { label: "Saree Length", value: saree.specifications.length },
                      { label: "Width", value: saree.specifications.width },
                      { label: "Blouse Piece", value: saree.specifications.blousePiece },
                      { label: "Zari Type", value: saree.zariType || "Genuine Zari" },
                    ].map(({ label, value }) => (
                      <div key={label} className="space-y-0.5">
                        <span className="block text-[8px] uppercase tracking-widest font-extrabold text-brand-gold">{label}</span>
                        <span className="block text-[11px] text-brand-maroon font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedTab === "weave" && (
                  <p className="text-[11px] leading-relaxed">
                    Exquisite handloom piece woven with <strong className="text-brand-maroon">{saree.weavingTechnique || "Kadhwa"}</strong> technique using pure mulberry silk. Decorated with luxury <strong className="text-brand-maroon">{saree.zariType || "Gold-tested Zari"}</strong> motifs, reflecting authentic heritage craftsmanship of Banaras weavers.
                  </p>
                )}
                {selectedTab === "wash" && (
                  <p className="text-[11px] leading-relaxed">
                    {saree.specifications.washCare || "Professional dry clean only"}. Wrap carefully in pure muslin or soft white cotton fabric to safeguard the delicate metal zari threads. Store in a cool, moisture-free drawer away from direct air exposure.
                  </p>
                )}
              </div>
            </div>

            {/* Weaver Story Profile (Glass card styled) */}
            {saree.weaverName && (
              <div className="rounded-lg overflow-hidden border border-brand-gold/15 glass-card shadow-sm">
                <div className="bg-brand-maroon px-4 py-2.5 flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-gold" />
                  <span className="text-[9px] uppercase font-bold text-brand-ivory tracking-widest">Master Weaver Heritage</span>
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-semibold text-brand-maroon">{saree.weaverName}</h4>
                    {saree.weaverVillage && (
                      <span className="text-[8px] uppercase tracking-widest text-brand-gold font-bold bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/20">
                        {saree.weaverVillage}
                      </span>
                    )}
                  </div>
                  {saree.weaverStorySnippet && (
                    <p className="text-[11px] text-brand-warm-gray italic leading-relaxed border-l border-brand-gold/50 pl-3">
                      &ldquo;{saree.weaverStorySnippet}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Related / Recommendation Section ─────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-brand-gold/15">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] font-extrabold text-brand-gold mb-1">Curated Pairs</p>
                <h3 className="font-serif text-2xl text-brand-maroon font-light">Heritage Recommendations</h3>
              </div>
              <button
                onClick={() => setView("shop")}
                className="text-[10px] uppercase tracking-widest font-bold text-brand-maroon hover:text-brand-gold transition flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {relatedProducts.map((rel) => {
                const r = rel as any;
                const relImages = (r.images || (r.image_url ? [r.image_url] : [])).filter(Boolean);
                const pricing = new Intl.NumberFormat("en-IN", {
                  style: "currency", currency: "INR", maximumFractionDigits: 0,
                }).format(rel.price);

                return (
                  <div
                    key={rel.id}
                    className="group cursor-pointer space-y-3"
                    onClick={() => handleRelatedClick(rel.id)}
                  >
                    {/* Related Image frame */}
                    <div className="aspect-[3/4] overflow-hidden bg-brand-sand relative shadow-xs group-hover:shadow-md transition-shadow duration-300">
                      <img
                        src={relImages[0] || ""}
                        alt={rel.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                      {/* Action trigger overlay */}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={e => { e.stopPropagation(); setQuickViewSaree(rel); }}
                          className="bg-white hover:bg-brand-maroon hover:text-white text-brand-maroon text-[9px] uppercase tracking-widest font-bold px-4 py-2 shadow-lg translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                    {/* Information cluster */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold block">{rel.category}</span>
                      <h4 className="text-sm font-serif text-brand-maroon group-hover:text-brand-gold transition-colors line-clamp-1">{rel.name}</h4>
                      <p className="text-xs font-mono font-semibold text-brand-maroon/80">{pricing}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── High-Resolution Lightbox Modal Overlay ─────────────────────────────────────── */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-[#1C050E]/95 backdrop-blur-md flex flex-col justify-center items-center p-4 select-none animate-fade-in">
          {/* Top Actions Row */}
          <div className="absolute top-4 right-4 left-4 flex justify-between items-center z-10">
            <span className="text-brand-gold text-[10px] uppercase tracking-widest font-mono">
              {IMAGE_LABELS[activeImageIdx] || "Artisan Details"} · {activeImageIdx + 1} of {images.length}
            </span>
            <button
              onClick={() => setShowLightbox(false)}
              className="p-2 bg-black/30 hover:bg-black/60 rounded-full text-brand-ivory hover:text-brand-gold transition-all duration-200"
              title="Close Gallery (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Slide Carousel container */}
          <div className="relative max-w-3xl w-full max-h-[80vh] flex justify-center items-center">
            {images.length > 1 && (
              <button
                onClick={goPrev}
                className="absolute left-2 sm:-left-16 p-3 bg-black/20 hover:bg-black/50 hover:scale-110 active:scale-95 rounded-full text-white transition z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={images[activeImageIdx] || images[0]}
              alt={`${saree.name} detailed view`}
              className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded"
              referrerPolicy="no-referrer"
            />

            {images.length > 1 && (
              <button
                onClick={goNext}
                className="absolute right-2 sm:-right-16 p-3 bg-black/20 hover:bg-black/50 hover:scale-110 active:scale-95 rounded-full text-white transition z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Interactive Thumb Strip inside Lightbox */}
          {images.length > 1 && (
            <div className="absolute bottom-6 flex gap-2 max-w-full overflow-x-auto px-4">
              {images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIdx(index)}
                  className={`w-12 h-16 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImageIdx === index ? "border-brand-gold scale-105" : "border-transparent opacity-50"
                  }`}
                >
                  <img src={imgUrl} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
