/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Heart, ShoppingBag, Eye, Award, RefreshCw, Box } from "lucide-react";
import { Saree, ViewState } from "../types";

interface QuickViewModalProps {
  saree: Saree | null;
  onClose: () => void;
  addToCart: (saree: Saree, quantity: number) => void;
  toggleFavorite: (saree: Saree) => void;
  wishlist: Saree[];
  setView: (view: ViewState) => void;
  setSelectedSareeId: (id: string | null) => void;
}

export default function QuickViewModal({
  saree: rawSaree,
  onClose,
  addToCart,
  toggleFavorite,
  wishlist,
  setView,
  setSelectedSareeId,
}: QuickViewModalProps) {
  if (!rawSaree) return null;

  const saree = {
    ...rawSaree,
    images: (rawSaree.images || ((rawSaree as any).image_url ? [(rawSaree as any).image_url] : [])).filter(Boolean),
    price: rawSaree.price ?? 0,
    originalPrice: rawSaree.originalPrice ?? (rawSaree as any).original_price ?? null,
    name: rawSaree.name ?? "",
    category: rawSaree.category ?? "",
    description: rawSaree.description ?? "",
    weavingTechnique: rawSaree.weavingTechnique ?? (rawSaree as any).weaving_technique ?? "",
    zariType: rawSaree.zariType ?? (rawSaree as any).zari_type ?? "",
    material: rawSaree.material ?? "",
    rating: rawSaree.rating ?? 5,
    reviewsCount: rawSaree.reviewsCount ?? (rawSaree as any).review_count ?? 0,
    weaverName: rawSaree.weaverName ?? (rawSaree as any).weaver_name ?? null,
    weaverVillage: rawSaree.weaverVillage ?? (rawSaree as any).weaver_village ?? null,
    weaverStorySnippet: rawSaree.weaverStorySnippet ?? (rawSaree as any).weaver_story_snippet ?? "",
    specifications: rawSaree.specifications ?? {
      length: (rawSaree as any).spec_length ?? "5.5 Meters",
      width: (rawSaree as any).spec_width ?? "45 Inches",
      blousePiece: (rawSaree as any).spec_blouse ?? "80 cm unstitched",
      washCare: (rawSaree as any).spec_wash_care ?? "Dry clean only",
      origin: (rawSaree as any).spec_origin ?? "Varanasi, Uttar Pradesh, India",
    },
  };

  const isFavorited = wishlist.some((item) => item.id === saree.id);

  const priceFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(saree.price);

  const originalPriceFormatted = saree.originalPrice
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(saree.originalPrice)
    : null;

  const handleViewFullDetail = () => {
    setSelectedSareeId(saree.id);
    setView("product-detail");
    onClose();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToBag = () => {
    addToCart(saree, 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="quick-view-modal-backdrop">
      {/* Absolute dark screen wrapper */}
      <div
        className="fixed inset-0 bg-[#1C050E]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Frame wrapper */}
      <div className="relative bg-brand-ivory w-full max-w-4xl shadow-2xl overflow-hidden rounded-none border border-brand-gold/20 flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh] z-10 animate-fade-in animate-duration-300">
        
        {/* Left column: Visual Slider Showcase */}
        <div className="md:w-1/2 relative bg-brand-sand/50 max-h-[300px] md:max-h-none overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-brand-gold/15">
          <img
            src={saree.images[0]}
            alt={saree.name}
            className="w-full h-full object-cover max-h-[300px] md:max-h-full aspect-2/3 hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          
          {/* Discount badge */}
          {saree.originalPrice && (
            <span className="absolute top-4 left-4 bg-brand-maroon text-brand-ivory text-[9px] tracking-widest uppercase px-3 py-1 font-semibold shadow-md">
              Heritage Offer
            </span>
          )}

          {/* Core weavers mark */}
          <div className="absolute bottom-4 left-4 bg-[#1C050E]/80 backdrop-blur-md border border-brand-gold/30 px-3 py-1.5 flex items-center space-x-1.5 text-brand-ivory">
            <Award className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[9px] font-sans uppercase tracking-[0.1em]">Handloom Certified</span>
          </div>
        </div>

        {/* Right column: Form details buy box */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          {/* Close button wrapper */}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={onClose}
              className="p-1.5 bg-brand-ivory hover:bg-brand-sand border border-brand-gold/10 hover:border-brand-gold text-brand-maroon rounded-full transition cursor-pointer"
              id="quickview-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            {/* Tagline category */}
            <div className="flex items-center space-x-2 text-[10px] text-brand-gold font-sans font-medium uppercase tracking-[0.15em] mb-2">
              <span>{saree.category}</span>
              <span>•</span>
              <span>{saree.weavingTechnique}</span>
            </div>

            {/* Title */}
            <h2 className="serif-heading text-2xl text-brand-maroon font-serif leading-tight mb-2">
              {saree.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="text-xl font-mono font-bold text-brand-maroon">{priceFormatted}</span>
              {originalPriceFormatted && (
                <span className="text-xs font-mono text-brand-warm-gray line-through">
                  {originalPriceFormatted}
                </span>
              )}
            </div>

            {/* Short review summary */}
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-brand-gold/10">
              <div className="flex text-brand-gold tracking-tighter">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-xs ${i < Math.floor(saree.rating) ? "text-brand-gold" : "text-brand-gold/30"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-brand-warm-gray">({saree.reviewsCount} verified clients review)</span>
            </div>

            {/* Artisan story snippet */}
            {saree.weaverName && (
              <div className="bg-brand-sand/40 border border-brand-gold/10 p-4 mb-5 space-y-1">
                <span className="text-[9px] text-brand-gold-dark font-sans tracking-widest uppercase block font-medium">Weaver Spotlight</span>
                <p className="font-serif text-[13px] text-brand-maroon font-semibold italic">
                  &ldquo;{saree.weaverName}{saree.weaverVillage ? ` of ${saree.weaverVillage.split(",")[0]}` : ""}&rdquo;
                </p>
                <p className="text-[11px] text-brand-warm-gray italic">
                  {saree.weaverStorySnippet}
                </p>
              </div>
            )}

            {/* Saree short specification overview */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[11px] text-brand-warm-gray mb-6">
              <div className="flex items-center space-x-2">
                <Box className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <span><strong className="text-brand-maroon/80">Length:</strong> {saree.specifications.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <span><strong className="text-brand-maroon/80">Blouse:</strong> {saree.specifications.blousePiece}</span>
              </div>
              <div className="col-span-2">
                <p className="leading-relaxed">
                  <strong className="text-brand-maroon/80">Zari specification:</strong> Woven in premium {saree.zariType} using traditional {saree.material}.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleAddToBag}
                className="flex-1 bg-brand-maroon hover:bg-brand-maroon/90 text-[#FDFBF7] text-xs font-sans tracking-widest uppercase py-4 transition duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                id="quickview-add-cart-btn"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>

              <button
                onClick={() => toggleFavorite(saree)}
                className="p-3.5 border border-brand-gold/35 hover:border-brand-maroon hover:bg-brand-sand text-brand-maroon transition cursor-pointer"
                title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                id="quickview-wishlist-btn"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-brand-maroon stroke-brand-maroon" : ""}`} />
              </button>
            </div>

            <button
              onClick={handleViewFullDetail}
              className="w-full border border-brand-gold/50 hover:border-brand-maroon text-brand-maroon text-xs font-sans tracking-widest uppercase py-3 transition duration-300 flex items-center justify-center space-x-1.5 cursor-pointer bg-transparent"
              id="quickview-full-details-btn"
            >
              <Eye className="w-4 h-4 text-brand-gold" />
              <span>Explore Complete Story & Details</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
