/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, MouseEvent, CSSProperties, useEffect, useRef } from "react";
import { ViewState, Saree } from "../../types";
import {
  Heart, ShoppingBag, Award, ZoomIn, ArrowLeft,
  ChevronLeft, ChevronRight, CheckCircle2, Star,
  Package, Truck, RotateCcw, X, Share2, Compass,
  Sparkles, Check, ChevronDown, BookOpen
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

const STITCHING_OPTIONS = [
  { id: "unstitched", label: "Unstitched Fabric Only", price: 0, desc: "Standard 80cm matching blouse piece included" },
  { id: "classic", label: "Classic Round Neck", price: 1500, desc: "Stitched with cotton lining, classic half-sleeves" },
  { id: "sleeveless", label: "Modern Sleeveless", price: 1800, desc: "Contemporary sleeveless design, V-neck style" },
  { id: "elbow", label: "Signature Elbow Sleeves", price: 2200, desc: "Elegant elbow-length sleeves, designer back neck" }
];

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
  const [stitchingChoice, setStitchingChoice] = useState("unstitched");
  const [customMeasurements, setCustomMeasurements] = useState("");
  const [zoomStyle, setZoomStyle] = useState<CSSProperties>({ display: "none" });
  const [addedPulse, setAddedPulse] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  
  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<"specs" | "heritage" | "care" | null>("specs");

  const ctaRef = useRef<HTMLDivElement>(null);

  // Monitor sticky bar state
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

  // Calculate final price based on stitching selection
  const selectedStitchingPrice = STITCHING_OPTIONS.find(o => o.id === stitchingChoice)?.price ?? 0;
  const finalPrice = saree.price + selectedStitchingPrice;

  const priceFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(finalPrice);

  const basePriceFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(saree.price);

  const originalPriceFormatted = saree.originalPrice
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(saree.originalPrice + selectedStitchingPrice)
    : null;

  const relatedProducts = useMemo(() =>
    sarees.filter((item) => item.category === saree.category && item.id !== saree.id).slice(0, 3),
    [saree, sarees]
  );

  const handleRelatedClick = (id: string) => {
    setSelectedSareeId(id);
    setActiveImageIdx(0);
    setQuantity(1);
    setStitchingChoice("unstitched");
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
    const customizedSaree = {
      ...saree,
      price: finalPrice,
      customStitching: STITCHING_OPTIONS.find(o => o.id === stitchingChoice)?.label,
      measurements: customMeasurements || "Standard Size"
    };
    addToCart(customizedSaree, quantity);
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
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans antialiased text-[#2E2E2E]" id="product-detail-view-container">

      {/* ── Sticky Purchase Bar ────────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          showStickyBar ? "translate-y-0 opacity-100 shadow-lg" : "-translate-y-full opacity-0"
        } bg-[#FAF8F5]/90 backdrop-blur-lg border-b border-[#C5A880]/20`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {images[0] && (
              <img src={images[0]} alt="" className="w-9 h-12 object-cover rounded border border-[#C5A880]/15 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#5B0E2D] block uppercase font-serif tracking-wider truncate">{saree.name}</span>
              <span className="text-xs font-mono text-[#A4865E] font-bold">{priceFormatted}</span>
            </div>
          </div>
          <button
            onClick={handleAddToBag}
            className="bg-[#5B0E2D] hover:bg-[#3E061E] active:scale-95 text-[#FDFBF7] text-[10px] tracking-widest uppercase font-bold py-2 px-6 transition-all duration-300 flex-shrink-0 flex items-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Bag
          </button>
        </div>
      </div>

      {/* ── Top Navigation Row ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center justify-between">
        <button
          onClick={() => setView("shop")}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#7E726B] hover:text-[#5B0E2D] transition group"
          id="detail-back-to-shop-btn"
        >
          <ArrowLeft className="w-4 h-4 text-[#C5A880] transition group-hover:-translate-x-1" />
          Back to Atelier
        </button>

        <button
          onClick={handleShare}
          className="p-2 text-[#7E726B] hover:text-[#5B0E2D] transition rounded-full hover:bg-[#F5EFEB]"
          title="Share Saree"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── Main Editorial Structure ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* LEFT: Asymmetric Editorial Gallery (Span 4) ────────────────── */}
          <div className="lg:col-span-4 max-w-sm mx-auto lg:max-w-none w-full space-y-6">
            
            {/* Main Interactive Canvas */}
            <div
              onClick={() => setShowLightbox(true)}
              className="relative w-full aspect-[3/4] overflow-hidden bg-[#F5EFEB] cursor-zoom-in group rounded-md shadow-xs border border-[#C5A880]/10"
              onMouseMove={handleZoomMove}
              onMouseLeave={handleZoomLeave}
            >
              <img
                key={images[activeImageIdx]}
                src={images[activeImageIdx] || images[0]}
                alt={saree.name}
                className="w-full h-full object-cover transition-transform duration-[1.2s] cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-[1.03]"
                referrerPolicy="no-referrer"
              />

              {/* High-fidelity zoom lens (desktop only) */}
              <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 hidden md:block" style={zoomStyle} />

              {/* Sophisticated bottom overlay gradient */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/25 via-black/5 to-transparent pointer-events-none" />

              {/* Cinematic Prev/Next indicators */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); goPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FAF8F5]/90 hover:bg-[#FAF8F5] active:scale-95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm z-10"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#5B0E2D]" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); goNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FAF8F5]/90 hover:bg-[#FAF8F5] active:scale-95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm z-10"
                  >
                    <ChevronRight className="w-5 h-5 text-[#5B0E2D]" />
                  </button>
                </>
              )}

              {/* Status and discount tags */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <span className="bg-[#5B0E2D] text-[#FDFBF7] text-[8px] uppercase tracking-[0.25em] font-extrabold px-3 py-1.5 shadow-sm rounded-xs">
                  {saree.category} Handloom
                </span>
                {discount && (
                  <span className="bg-emerald-600 text-white text-[8px] uppercase tracking-[0.20em] font-bold px-3 py-1.5 shadow-sm rounded-xs self-start">
                    Heritage Saving {discount}%
                  </span>
                )}
              </div>

              {/* Visual click prompt */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/45 backdrop-blur-xs px-3 py-1.5 text-[8px] uppercase tracking-[0.2em] font-bold text-white rounded-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Compass className="w-3.5 h-3.5 text-[#C5A880] animate-spin-slow" />
                <span>Cinematic View</span>
              </div>
            </div>

            {/* Asymmetrical Masonry Grid of Alternates (Desktop only) */}
            {images.length > 1 && (
              <div className="hidden md:grid grid-cols-3 gap-4 pt-2">
                {images.map((imgUrl, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveImageIdx(index)}
                    className={`group/mosaic cursor-pointer relative aspect-[3/4] overflow-hidden rounded border transition-all duration-500 ${
                      activeImageIdx === index 
                        ? "border-[#5B0E2D] ring-1 ring-[#5B0E2D]/40" 
                        : "border-[#C5A880]/15 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/mosaic:scale-105" alt="" />
                    <div className="absolute inset-0 bg-black/5 opacity-40 group-hover/mosaic:opacity-0 transition-opacity" />
                    <span className="absolute bottom-2 left-2 text-[8px] uppercase font-bold tracking-widest text-[#FAF8F5] bg-[#5B0E2D]/70 px-1.5 py-0.5 backdrop-blur-xs">
                      {IMAGE_LABELS[index] ? IMAGE_LABELS[index].split(" ")[0] : index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Swiper Indicators for mobile view */}
            {images.length > 1 && (
              <div className="flex md:hidden justify-center items-center gap-2 pt-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === activeImageIdx ? "w-5 h-1 bg-[#5B0E2D]" : "w-1 h-1 bg-[#C5A880]/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Floating Narrative Content (Span 8) ────────────────── */}
          <div className="lg:col-span-8 lg:sticky lg:top-20 space-y-8">
            
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-extrabold">
                <span className="text-[#5B0E2D]">{saree.weavingTechnique || "Authentic Handloom"}</span>
                <span className="text-[#C5A880]/50">•</span>
                <span className="text-[#A4865E]">{saree.zariType || "Fine Zari Work"}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#5B0E2D] font-light leading-tight tracking-tight">
                {saree.name}
              </h1>

              {/* Minimal Ratings */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex text-[#C5A880]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(saree.rating) ? "fill-current" : "opacity-20"}`} />
                  ))}
                </div>
                <span className="text-[10px] text-[#7E726B] font-semibold tracking-wider uppercase">
                  {saree.rating?.toFixed(1)} ({saree.reviewsCount} verified reviews)
                </span>
              </div>
            </div>

            {/* Premium Pricing presentation */}
            <div className="py-5 border-y border-[#C5A880]/20 flex flex-wrap items-baseline justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#7E726B] block">Atelier Value</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-serif text-[#5B0E2D] font-medium tracking-tight">{priceFormatted}</span>
                  {originalPriceFormatted && (
                    <span className="text-sm font-mono text-[#7E726B]/50 line-through">{originalPriceFormatted}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[8px] uppercase tracking-widest font-bold text-[#A4865E] block">Artisan Guarantee</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-100 inline-block">
                  Direct from Varanasi
                </span>
              </div>
            </div>

            {/* Saree Biography */}
            <div className="space-y-3">
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#A4865E] block">Saree Biography</span>
              <p className="text-sm text-[#7E726B] leading-relaxed font-light font-serif text-lg italic">
                "{saree.description}"
              </p>
            </div>

            {/* Premium Stitching Customization Studio */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#A4865E] block">Tailoring Atelier</span>
                <span className="text-[9px] text-[#5B0E2D] font-bold uppercase underline cursor-pointer hover:text-[#C5A880] transition">Size Guide</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STITCHING_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setStitchingChoice(opt.id)}
                    className={`p-3.5 rounded border-2 cursor-pointer transition-all duration-300 relative flex flex-col justify-between min-h-[90px] ${
                      stitchingChoice === opt.id
                        ? "border-[#5B0E2D] bg-[#5B0E2D]/5 shadow-xs"
                        : "border-[#C5A880]/15 hover:border-[#C5A880]/40 bg-[#FAF8F5]/40"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#2E2E2E] block">{opt.label}</span>
                      <span className="text-[9px] text-[#7E726B] block leading-tight">{opt.desc}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 mt-auto">
                      <span className="text-[10px] font-mono font-bold text-[#5B0E2D]">
                        {opt.price === 0 ? "Complimentary" : `+ ₹${opt.price}`}
                      </span>
                      {stitchingChoice === opt.id && (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#5B0E2D] flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Measurements Input Box */}
              {stitchingChoice !== "unstitched" && (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-[10px] font-bold text-[#5B0E2D] uppercase tracking-wider block">Atelier Sizing Specs</label>
                  <input
                    type="text"
                    value={customMeasurements}
                    onChange={(e) => setCustomMeasurements(e.target.value)}
                    placeholder="Enter Bust size, Waist & Blouse length (e.g. 36, 30, 14 inches) or leave blank for Standard Medium"
                    className="w-full bg-[#FAF8F5] border border-[#C5A880]/30 rounded p-3 text-xs focus:border-[#5B0E2D] outline-none transition font-mono placeholder-[#7E726B]/50"
                  />
                </div>
              )}
            </div>

            {/* Stepper and Add to Bag Row */}
            <div ref={ctaRef} className="pt-4 space-y-4">
              <div className="flex items-center gap-4">
                
                {/* Custom Stepper */}
                <div className="flex items-center border border-[#C5A880]/35 rounded overflow-hidden bg-white shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-12 flex items-center justify-center text-[#5B0E2D] hover:bg-[#FAF8F5] transition font-bold"
                  >−</button>
                  <span className="w-10 h-12 flex items-center justify-center text-xs font-mono font-bold text-[#5B0E2D] border-x border-[#C5A880]/15">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-12 flex items-center justify-center text-[#5B0E2D] hover:bg-[#FAF8F5] transition font-bold"
                  >+</button>
                </div>

                {/* Add to Bag CTA */}
                <button
                  onClick={handleAddToBag}
                  className={`flex-1 h-12 flex items-center justify-center gap-2 font-bold text-[10px] tracking-widest uppercase rounded transition-all duration-300 ${
                    addedPulse
                      ? "bg-emerald-700 text-white scale-[0.98]"
                      : "bg-[#5B0E2D] hover:bg-[#3E061E] text-[#FDFBF7] shadow-md hover:shadow-lg hover:shadow-[#5B0E2D]/15 active:scale-98"
                  }`}
                >
                  {addedPulse ? (
                    <><CheckCircle2 className="w-4 h-4" /> Added to Bag</>
                  ) : (
                    <><ShoppingBag className="w-4 h-4" /> Add to Atelier Bag</>
                  )}
                </button>

                {/* Wishlist button */}
                <button
                  onClick={() => toggleFavorite(saree)}
                  className={`w-12 h-12 flex items-center justify-center border rounded transition-all duration-300 active:scale-95 ${
                    isFaved
                      ? "border-[#5B0E2D] bg-[#5B0E2D]/5 text-[#5B0E2D]"
                      : "border-[#C5A880]/35 text-[#7E726B] hover:border-[#5B0E2D] hover:text-[#5B0E2D]"
                  }`}
                  title="Save Saree"
                >
                  <Heart className={`w-4 h-4 ${isFaved ? "fill-[#5B0E2D]" : ""}`} />
                </button>
              </div>
            </div>

            {/* Spec / Heritage Accordions */}
            <div className="border-t border-[#C5A880]/20 pt-4 space-y-3">
              {[
                {
                  id: "specs",
                  title: "Technical Specifications",
                  content: (
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Saree Dimensions", value: `${saree.specifications.length} × ${saree.specifications.width}` },
                        { label: "Blouse Piece Included", value: saree.specifications.blousePiece },
                        { label: "Material Composition", value: saree.material || "Pure Silk" },
                        { label: "Origin of Weave", value: saree.specifications.origin }
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <span className="text-[8px] uppercase tracking-widest text-[#A4865E] block font-extrabold">{label}</span>
                          <span className="text-[11px] text-[#5B0E2D] font-medium font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  )
                },
                {
                  id: "heritage",
                  title: "Weaving Artistry & Zari",
                  content: (
                    <p className="text-[11px] leading-relaxed">
                      Handcrafted using the traditional <strong className="text-[#5B0E2D]">{saree.weavingTechnique || "Kadhwa"}</strong> technique. Characterized by intricate details, using certified <strong className="text-[#5B0E2D]">{saree.zariType || "Zari threads"}</strong>. Each authentic handloom saree takes master artisans between 15 to 45 days of meticulous work in Varanasi.
                    </p>
                  )
                },
                {
                  id: "care",
                  title: "Heritage Care & Preservation",
                  content: (
                    <p className="text-[11px] leading-relaxed">
                      {saree.specifications.washCare || "Professional dry clean only"}. Wrap in acid-free muslin cloth and store flat inside cotton fabric covers to prevent blackening of metallic zari work. Avoid direct exposure to perfume sprays and humidity.
                    </p>
                  )
                }
              ].map((acc) => (
                <div key={acc.id} className="border-b border-[#C5A880]/15 pb-3">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === acc.id ? null : (acc.id as any))}
                    className="w-full flex items-center justify-between py-2 text-left text-xs uppercase tracking-widest font-bold text-[#5B0E2D] hover:text-[#C5A880] transition"
                  >
                    <span>{acc.title}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${openAccordion === acc.id ? "rotate-180" : ""}`} />
                  </button>
                  {openAccordion === acc.id && (
                    <div className="pt-2 pb-1 animate-fade-in">
                      {acc.content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Master Weaver Narrative Integration */}
            {saree.weaverName && (
              <div className="p-6 rounded bg-[#F5EFEB]/50 border border-[#C5A880]/20 space-y-4">
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] font-extrabold text-[#C5A880]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>The Maker's Story</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-medium text-[#5B0E2D]">{saree.weaverName}</h4>
                  {saree.weaverVillage && (
                    <span className="text-[8px] uppercase tracking-wider text-[#A4865E] font-bold bg-[#A4865E]/10 px-2 py-0.5 rounded border border-[#A4865E]/20 inline-block">
                      Atelier {saree.weaverVillage}
                    </span>
                  )}
                </div>

                {saree.weaverStorySnippet && (
                  <p className="text-xs text-[#7E726B] italic leading-relaxed pl-4 border-l border-[#C5A880]/40">
                    &ldquo;{saree.weaverStorySnippet}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Related Collection ────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#C5A880]/20">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] font-extrabold text-[#A4865E] mb-1">Heritage Companions</p>
                <h3 className="font-serif text-2xl text-[#5B0E2D] font-light">Atelier curation</h3>
              </div>
              <button
                onClick={() => setView("shop")}
                className="text-[10px] uppercase tracking-widest font-bold text-[#5B0E2D] hover:text-[#C5A880] transition flex items-center gap-1"
              >
                Explore All <ChevronRight className="w-3.5 h-3.5" />
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
                    <div className="aspect-[3/4] overflow-hidden bg-[#F5EFEB] relative rounded-md border border-[#C5A880]/15">
                      <img
                        src={relImages[0] || ""}
                        alt={rel.name}
                        className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={e => { e.stopPropagation(); setQuickViewSaree(rel); }}
                          className="bg-white hover:bg-[#5B0E2D] hover:text-white text-[#5B0E2D] text-[9px] uppercase tracking-widest font-bold px-4 py-2 transition-all"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] uppercase tracking-widest text-[#C5A880] font-bold block">{rel.category}</span>
                      <h4 className="text-sm font-serif text-[#5B0E2D] group-hover:text-[#A4865E] transition-colors line-clamp-1">{rel.name}</h4>
                      <p className="text-xs font-mono font-bold text-[#5B0E2D]/85">{pricing}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── High-Resolution Cinematic Lightbox ─────────────────────────── */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-[#1C050E]/97 backdrop-blur-md flex flex-col justify-center items-center p-4 select-none animate-fade-in">
          
          {/* Header */}
          <div className="absolute top-4 right-4 left-4 flex justify-between items-center z-10">
            <span className="text-[#C5A880] text-[9px] uppercase tracking-widest font-mono">
              {IMAGE_LABELS[activeImageIdx] || "Atelier Saree Detail"} · {activeImageIdx + 1} / {images.length}
            </span>
            <button
              onClick={() => setShowLightbox(false)}
              className="p-2 bg-black/40 hover:bg-black/70 rounded-full text-white hover:text-[#C5A880] transition"
              title="Close Gallery (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Stage */}
          <div className="relative max-w-3xl w-full max-h-[80vh] flex justify-center items-center">
            {images.length > 1 && (
              <button
                onClick={goPrev}
                className="absolute left-2 sm:-left-16 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={images[activeImageIdx] || images[0]}
              alt={saree.name}
              className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded border border-[#C5A880]/15"
              referrerPolicy="no-referrer"
            />

            {images.length > 1 && (
              <button
                onClick={goNext}
                className="absolute right-2 sm:-right-16 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Thumbnail indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-6 flex gap-2 max-w-full overflow-x-auto px-4">
              {images.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIdx(index)}
                  className={`w-12 h-16 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImageIdx === index ? "border-[#C5A880] scale-105" : "border-transparent opacity-40"
                  }`}
                >
                  <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
