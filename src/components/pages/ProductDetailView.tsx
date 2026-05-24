/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, MouseEvent, CSSProperties, useEffect, useRef } from "react";
import { ViewState, Saree } from "../../types";
import {
  Heart, ShoppingBag, Award, ZoomIn, ArrowLeft,
  ChevronLeft, ChevronRight, CheckCircle2, Star,
  Package, Truck, RotateCcw,
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

const IMAGE_LABELS = ["Main", "Detail", "Drape"];

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
      backgroundSize: "240%",
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

  return (
    <div className="bg-[#FDFBF7] min-h-screen font-sans" id="product-detail-view-container">

      {/* ── Sticky Add-to-Bag Bar ─────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showStickyBar ? "translate-y-0 opacity-100 shadow-2xl" : "-translate-y-full opacity-0"
        } bg-[#FDFBF7]/95 backdrop-blur-md border-b border-brand-gold/20`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {images[0] && (
              <img src={images[0]} alt={`${saree.name} - Handwoven Banarasi Silk Saree thumbnail`} className="w-10 h-12 object-cover rounded border border-brand-gold/20 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-maroon truncate">{saree.name}</p>
              <p className="text-xs font-mono text-brand-gold font-bold">{priceFormatted}</p>
            </div>
          </div>
          <button
            onClick={handleAddToBag}
            className="bg-brand-maroon hover:bg-[#3E061E] text-brand-ivory text-xs tracking-widest uppercase font-bold py-2.5 px-6 transition-all duration-200 flex-shrink-0 flex items-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Bag
          </button>
        </div>
      </div>

      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <button
          onClick={() => setView("shop")}
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-brand-warm-gray hover:text-brand-maroon transition group"
          id="detail-back-to-shop-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-brand-gold transition group-hover:-translate-x-0.5" />
          Back to Collection
          <span className="text-brand-gold/40 mx-1">/</span>
          <span className="text-brand-gold-dark capitalize">{saree.category} Collection</span>
        </button>
      </div>

      {/* ── Main Product Grid ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 items-start">

          {/* LEFT: Image Gallery ───────────────────────────────────────── */}
          <div className="space-y-3">

            {/* Main Image */}
            <div
              className="relative w-full aspect-[3/4] overflow-hidden bg-brand-sand cursor-crosshair group"
              onMouseMove={handleZoomMove}
              onMouseLeave={handleZoomLeave}
            >
              <img
                key={images[activeImageIdx]}
                src={images[activeImageIdx] || images[0]}
                alt={`${saree.name} - Authentic ${saree.category} Banarasi Saree View`}
                className="w-full h-full object-cover transition-all duration-500"
                referrerPolicy="no-referrer"
                fetchPriority="high"
              />

              {/* Zoom overlay */}
              <div className="absolute inset-0 pointer-events-none" style={zoomStyle} />

              {/* Gradient overlays for depth */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />

              {/* Prev / Next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); goPrev(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10 hover:scale-110"
                  >
                    <ChevronLeft className="w-4 h-4 text-brand-maroon" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); goNext(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10 hover:scale-110"
                  >
                    <ChevronRight className="w-4 h-4 text-brand-maroon" />
                  </button>
                </>
              )}

              {/* Image label + counter */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                {images.length > 1 && (
                  <span className="bg-brand-maroon text-brand-ivory text-[9px] uppercase tracking-[0.15em] font-bold px-2.5 py-1">
                    {IMAGE_LABELS[activeImageIdx] ?? `${activeImageIdx + 1}/${images.length}`}
                  </span>
                )}
                {discount && (
                  <span className="bg-emerald-600 text-white text-[9px] uppercase tracking-wider font-bold px-2.5 py-1">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Dot navigation */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIdx(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === activeImageIdx ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Zoom hint */}
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow">
                <ZoomIn className="w-3.5 h-3.5 text-brand-maroon" />
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIdx(index)}
                    className={`relative aspect-[3/4] overflow-hidden transition-all duration-300 group/t ${
                      activeImageIdx === index
                        ? "ring-2 ring-brand-maroon ring-offset-1"
                        : "opacity-60 hover:opacity-100 hover:ring-1 hover:ring-brand-gold/50"
                    }`}
                    id={`thumb-btn-${index}`}
                  >
                    <img
                      src={imgUrl}
                      alt={IMAGE_LABELS[index] ?? `View ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/t:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className={`absolute bottom-0 inset-x-0 py-1 text-center text-[8px] font-bold uppercase tracking-wider transition-all ${
                      activeImageIdx === index ? "bg-brand-maroon text-white" : "bg-black/40 text-white/80"
                    }`}>
                      {IMAGE_LABELS[index] ?? index + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info — sticky ──────────────────────────────── */}
          <div className="lg:sticky lg:top-6 space-y-6 pt-6 lg:pt-0">

            {/* Category + Technique */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-brand-gold bg-brand-gold/10 px-3 py-1">
                {saree.category}
              </span>
              {saree.weavingTechnique && (
                <span className="text-[10px] tracking-[0.15em] font-bold uppercase text-brand-warm-gray">
                  {saree.weavingTechnique}
                </span>
              )}
            </div>

            {/* Product Name — Nike-style bold */}
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-brand-maroon leading-tight font-light tracking-tight">
                {saree.name}
              </h1>
              {/* Star rating row */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(saree.rating) ? "fill-brand-gold text-brand-gold" : "text-brand-gold/25"}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-brand-warm-gray font-medium">
                  {saree.rating?.toFixed(1)} · {saree.reviewsCount} reviews
                </span>
              </div>
            </div>

            {/* Price — large and clear */}
            <div className="flex items-baseline gap-3 py-4 border-y border-brand-gold/15">
              <span className="text-3xl font-mono font-bold text-brand-maroon tracking-tight">
                {priceFormatted}
              </span>
              {originalPriceFormatted && (
                <>
                  <span className="text-base font-mono text-brand-warm-gray/60 line-through">{originalPriceFormatted}</span>
                  {discount && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Save {discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-brand-warm-gray leading-relaxed">
              {saree.description}
            </p>

            {/* Drape note */}
            {saree.drapeRecommendation && (
              <div className="flex gap-3 bg-brand-gold/5 border-l-2 border-brand-gold p-4">
                <Award className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-brand-gold-dark leading-relaxed italic">
                  <span className="not-italic font-bold text-brand-maroon block mb-0.5">Heritage Drape Recommendation</span>
                  {saree.drapeRecommendation}
                </p>
              </div>
            )}

            {/* Custom Blouse Toggle */}
            <div
              onClick={() => setCustomBlouse(!customBlouse)}
              className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                customBlouse
                  ? "border-brand-maroon bg-brand-maroon/5"
                  : "border-brand-gold/20 hover:border-brand-gold/50 bg-transparent"
              }`}
            >
              <div>
                <span className="block text-xs font-bold text-brand-maroon uppercase tracking-wide">
                  Premium Blouse Stitching
                </span>
                <span className="block text-[10px] text-brand-warm-gray mt-0.5">
                  Custom-crafted by our Varanasi house tailor
                </span>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-all duration-200 flex-shrink-0 ${
                customBlouse ? "bg-brand-maroon" : "bg-gray-200"
              }`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                  customBlouse ? "left-5" : "left-0.5"
                }`} />
              </div>
            </div>

            {/* Quantity + Add to Bag */}
            <div ref={ctaRef} className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity stepper */}
                <div className="flex items-center border border-brand-gold/30 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-11 flex items-center justify-center text-brand-maroon hover:bg-brand-gold/10 transition font-bold text-lg"
                    id="qty-decrease-btn"
                  >−</button>
                  <span className="w-10 h-11 flex items-center justify-center text-sm font-bold text-brand-maroon border-x border-brand-gold/20 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-11 flex items-center justify-center text-brand-maroon hover:bg-brand-gold/10 transition font-bold text-lg"
                    id="qty-increase-btn"
                  >+</button>
                </div>

                {/* Add to Bag — Nike-style full width */}
                <button
                  onClick={handleAddToBag}
                  className={`flex-1 h-11 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                    addedPulse
                      ? "bg-emerald-600 text-white scale-[0.98]"
                      : "bg-brand-maroon hover:bg-[#3E061E] text-brand-ivory hover:scale-[1.02]"
                  } shadow-lg shadow-brand-maroon/20`}
                  id="add-to-bag-cta-btn"
                >
                  {addedPulse ? (
                    <><CheckCircle2 className="w-4 h-4" /> Added to Bag</>
                  ) : (
                    <><ShoppingBag className="w-4 h-4" /> Add to Bag</>
                  )}
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleFavorite(saree)}
                  className={`w-11 h-11 flex items-center justify-center border-2 transition-all duration-200 hover:scale-110 ${
                    isFaved
                      ? "border-brand-maroon bg-brand-maroon/5 text-brand-maroon"
                      : "border-brand-gold/30 text-brand-warm-gray hover:border-brand-maroon hover:text-brand-maroon"
                  }`}
                  title={isFaved ? "Remove from wishlist" : "Add to wishlist"}
                  id="wishlist-toggle-heart-btn"
                >
                  <Heart className={`w-4 h-4 ${isFaved ? "fill-brand-maroon" : ""}`} />
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { icon: Package, label: "Handwoven", sub: "Varanasi artisan" },
                { icon: Truck, label: "Free shipping", sub: "Orders above ₹5,000" },
                { icon: RotateCcw, label: "Easy returns", sub: "Within 7 days" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5 p-3 bg-brand-sand/30 rounded-lg">
                  <Icon className="w-4 h-4 text-brand-gold" />
                  <span className="text-[9px] font-bold text-brand-maroon uppercase tracking-wide">{label}</span>
                  <span className="text-[8px] text-brand-warm-gray">{sub}</span>
                </div>
              ))}
            </div>

            {/* Spec Tabs */}
            <div className="border border-brand-gold/15 overflow-hidden rounded-lg">
              <div className="flex bg-brand-sand/40">
                {(["fabric", "weave", "wash"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`flex-1 py-3 text-[10px] uppercase tracking-wider font-bold cursor-pointer transition-all duration-200 ${
                      selectedTab === tab
                        ? "bg-brand-maroon text-brand-ivory"
                        : "text-brand-warm-gray hover:text-brand-maroon hover:bg-brand-gold/5"
                    }`}
                    id={`tab-btn-${tab}`}
                  >
                    {tab === "fabric" ? "Specs" : tab === "weave" ? "Weave" : "Care"}
                  </button>
                ))}
              </div>
              <div className="p-4 text-xs text-brand-warm-gray leading-relaxed">
                {selectedTab === "fabric" && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Length", value: saree.specifications.length },
                      { label: "Width", value: saree.specifications.width },
                      { label: "Blouse", value: saree.specifications.blousePiece },
                      { label: "Origin", value: saree.specifications.origin },
                    ].map(({ label, value }) => (
                      <div key={label} className="space-y-0.5">
                        <span className="block text-[9px] uppercase tracking-wider font-bold text-brand-gold">{label}</span>
                        <span className="block text-[11px] text-brand-maroon font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedTab === "weave" && (
                  <p className="text-[11px] leading-relaxed">
                    Woven with <strong className="text-brand-maroon">{saree.weavingTechnique}</strong> technique using
                    pure mulberry hand-spun raw silk. Features luxury <strong className="text-brand-maroon">{saree.zariType}</strong> motifs
                    on authentic wooden shaft cards — each piece taking 2–6 weeks to complete.
                  </p>
                )}
                {selectedTab === "wash" && (
                  <p className="text-[11px] leading-relaxed">
                    {saree.specifications.washCare}. Store in cotton muslin cloth inside dark wooden drawers.
                    Avoid direct sunlight and strong fragrances to preserve zari lustre.
                  </p>
                )}
              </div>
            </div>

            {/* Weaver Profile */}
            {saree.weaverName && (
              <div className="rounded-lg overflow-hidden border border-brand-gold/15">
                <div className="bg-brand-maroon px-5 py-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-gold" />
                  <span className="text-[10px] uppercase font-bold text-brand-ivory tracking-widest">Master Weaver</span>
                </div>
                <div className="p-5 bg-brand-sand/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-semibold text-brand-maroon">{saree.weaverName}</h4>
                    {saree.weaverVillage && (
                      <span className="text-[9px] uppercase tracking-wider text-brand-gold font-bold bg-brand-gold/10 px-2 py-0.5 rounded-full">
                        {saree.weaverVillage}
                      </span>
                    )}
                  </div>
                  {saree.weaverStorySnippet && (
                    <p className="text-[11px] text-brand-warm-gray italic leading-relaxed border-l-2 border-brand-gold pl-3">
                      &ldquo;{saree.weaverStorySnippet}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ─────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-brand-gold/15">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-gold mb-1">You may also like</p>
                <h3 className="font-serif text-2xl text-brand-maroon font-light">Heritage Companion Pieces</h3>
              </div>
              <button
                onClick={() => setView("shop")}
                className="text-[10px] uppercase tracking-widest font-bold text-brand-maroon hover:text-brand-gold transition flex items-center gap-1"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => {
                const r = rel as any;
                const relImages = (r.images || (r.image_url ? [r.image_url] : [])).filter(Boolean);
                const pricing = new Intl.NumberFormat("en-IN", {
                  style: "currency", currency: "INR", maximumFractionDigits: 0,
                }).format(rel.price);

                return (
                  <div
                    key={rel.id}
                    className="group cursor-pointer"
                    onClick={() => handleRelatedClick(rel.id)}
                  >
                    {/* Image */}
                    <div className="aspect-[3/4] overflow-hidden bg-brand-sand mb-3 relative">
                      <img
                        src={relImages[0] || ""}
                        alt={rel.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {/* Quick view on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={e => { e.stopPropagation(); setQuickViewSaree(rel); }}
                          className="bg-white text-brand-maroon text-[9px] uppercase tracking-widest font-bold px-4 py-2 shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold block">{rel.category}</span>
                      <h4 className="text-sm font-serif text-brand-maroon group-hover:text-brand-gold transition-colors line-clamp-1">{rel.name}</h4>
                      <p className="text-xs font-mono font-bold text-brand-maroon">{pricing}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
