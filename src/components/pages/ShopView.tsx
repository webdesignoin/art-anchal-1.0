/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { ViewState, Saree, FilterState } from "../../types";
import { Filter, SlidersHorizontal, Heart, Grid, List, RefreshCw, Star, ArrowRight } from "lucide-react";

interface ShopViewProps {
  setView: (view: ViewState) => void;
  setSelectedSareeId: (id: string | null) => void;
  setQuickViewSaree: (saree: Saree) => void;
  toggleFavorite: (saree: Saree) => void;
  wishlist: Saree[];
  initialSearchQuery: string;
  setInitialSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  sarees: Saree[];
}

const CATEGORIES = ["All", "Katan Silk", "Shikargah", "Tanchoi", "Organza / Kora", "Tissue"];
const ZARI_TYPES = ["All", "Pure Gold Zari", "Tested Zari", "Silver Zari", "Water Gold Zari"];
const WEAVING_TECHNIQUES = ["All", "Kadwa Handloom", "Fekua Handloom", "Tanchoi Weave", "Jamdani Handloom"];
const COLORS = ["All", "Ivory & Gold", "Deep Maroon", "Cobalt Blue & Gold", "Emerald Green", "Magenta Pink", "Metallic Gold"];

export default function ShopView({
  setView,
  setSelectedSareeId,
  setQuickViewSaree,
  toggleFavorite,
  wishlist,
  initialSearchQuery,
  setInitialSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sarees,
}: ShopViewProps) {
  // Filters state
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategory || "All");
  const [activeZari, setActiveZari] = useState<string>("All");
  const [activeWeave, setActiveWeave] = useState<string>("All");
  const [activeColor, setActiveColor] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(250000);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state if selectedCategory prop changes from external sources
  useEffect(() => {
    setActiveCategory(selectedCategory || "All");
  }, [selectedCategory]);

  const handleResetFilters = () => {
    setActiveCategory("All");
    setSelectedCategory("All");
    setActiveZari("All");
    setActiveWeave("All");
    setActiveColor("All");
    setMaxPrice(250000);
    setInitialSearchQuery("");
  };

  // Perform dynamic filtering and sorting locally
  const filteredSarees = useMemo(() => {
    return sarees.filter((saree) => {
      // Category filter
      if (activeCategory !== "All" && saree.category !== activeCategory) return false;
      // Zari filter
      if (activeZari !== "All" && saree.zariType !== activeZari) return false;
      // Weave technique filter
      if (activeWeave !== "All" && saree.weavingTechnique !== activeWeave) return false;
      // Color filter
      if (activeColor !== "All" && saree.color !== activeColor) return false;
      // Price filter
      if (saree.price > maxPrice) return false;

      // Text search query filter
      if (initialSearchQuery.trim()) {
        const query = initialSearchQuery.toLowerCase();
        const matchesName = saree.name.toLowerCase().includes(query);
        const matchesDesc = saree.description.toLowerCase().includes(query);
        const matchesWeaver = saree.weaverName?.toLowerCase().includes(query) || false;
        const matchesCategory = saree.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesWeaver && !matchesCategory) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      // Featured / default sorting
      return b.isBestseller ? 1 : -1;
    });
  }, [sarees, activeCategory, activeZari, activeWeave, activeColor, maxPrice, initialSearchQuery, sortBy]);

  const handleSareeClick = (id: string) => {
    setSelectedSareeId(id);
    setView("product-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans" id="shop-view-wrapper">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Editorial Page Header */}
        <div className="text-center space-y-3 pb-8 border-b border-brand-gold/15">
          <span className="text-[11px] font-sans tracking-[0.2em] uppercase text-brand-gold font-bold">The Banarasi Darbar</span>
          <h1 className="serif-heading text-3xl sm:text-5xl text-brand-maroon font-serif font-light">Our Handwoven Masterpieces</h1>
          <p className="text-xs text-brand-warm-gray max-w-lg mx-auto leading-relaxed">
            A curation of exquisite weaves, straight from the quiet, rhythmic looms of Banaras to your wardrobe. Discover elegance in every thread.
          </p>
        </div>

        {/* Search status summary if searchable */}
        {initialSearchQuery && (
          <div className="bg-brand-sand/50 border border-brand-gold/20 p-4 flex items-center justify-between text-xs text-brand-maroon">
            <span>
              Showing results for &ldquo;<strong>{initialSearchQuery}</strong>&rdquo;
            </span>
            <button
              onClick={() => setInitialSearchQuery("")}
              className="text-brand-gold-dark hover:text-brand-maroon underline cursor-pointer"
              id="clear-search-btn"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Layout: Sidebar Filters + Saree Grid */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Static Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8 animate-fade-in" id="desktop-sidebar-filters">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-brand-maroon/10 mb-5">
                <h3 className="serif-heading text-lg font-serif text-brand-maroon tracking-wide">Refine Collections</h3>
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] uppercase font-mono tracking-wider text-brand-gold hover:text-brand-maroon flex items-center space-x-1 cursor-pointer"
                  id="reset-filters-btn"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-semibold tracking-wider text-brand-maroon uppercase">Saree Category</h4>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setSelectedCategory(cat === "All" ? null : cat);
                      }}
                      className={`block text-xs font-light w-full text-left transition ${
                        activeCategory === cat
                          ? "text-brand-maroon font-semibold translate-x-1"
                          : "text-brand-warm-gray hover:text-brand-maroon"
                      }`}
                      id={`filter-cat-${cat}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zari Grade Filter */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-semibold tracking-wider text-brand-maroon uppercase">Zari Specification</h4>
                <div className="space-y-2">
                  {ZARI_TYPES.map((zari) => (
                    <button
                      key={zari}
                      onClick={() => setActiveZari(zari)}
                      className={`block text-xs font-light w-full text-left transition ${
                        activeZari === zari
                          ? "text-brand-maroon font-semibold translate-x-1"
                          : "text-brand-warm-gray hover:text-brand-maroon"
                      }`}
                      id={`filter-zari-${zari}`}
                    >
                      {zari}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weaving Style Filter */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-semibold tracking-wider text-brand-maroon uppercase">Weaving Style</h4>
                <div className="space-y-2">
                  {WEAVING_TECHNIQUES.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => setActiveWeave(tech)}
                      className={`block text-xs font-light w-full text-left transition ${
                        activeWeave === tech
                          ? "text-brand-maroon font-semibold translate-x-1"
                          : "text-brand-warm-gray hover:text-brand-maroon"
                      }`}
                      id={`filter-weave-${tech}`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette Filter */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-semibold tracking-wider text-brand-maroon uppercase">Color Palette</h4>
                <div className="space-y-2">
                  {COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setActiveColor(col)}
                      className={`block text-xs font-light w-full text-left transition ${
                        activeColor === col
                          ? "text-brand-maroon font-semibold translate-x-1"
                          : "text-brand-warm-gray hover:text-brand-maroon"
                      }`}
                      id={`filter-color-${col}`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider Filter */}
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xs font-semibold tracking-wider text-brand-maroon uppercase">Price Boundary</h4>
                  <span className="text-xs font-mono font-bold text-brand-maroon">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="40000"
                  max="250000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-maroon cursor-pointer"
                  id="price-range-slider"
                />
                <div className="flex justify-between text-[11px] text-brand-warm-gray">
                  <span>₹40,000</span>
                  <span>₹2.5 Lacs</span>
                </div>
              </div>

            </div>
          </aside>

          {/* Right Section: Catalog Controls & Grid */}
          <main className="flex-1 space-y-8">
            
            {/* Catalog Toolbar controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-brand-sand/30 border border-brand-gold/15 p-4 gap-4">
              <div className="flex items-center space-x-4 text-xs text-brand-warm-gray">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center space-x-1.5 border border-brand-gold/30 px-3 py-1.5 hover:text-brand-maroon cursor-pointer"
                  id="mobile-filters-trigger"
                >
                  <Filter className="w-4 h-4" />
                  <span>Drape Filters</span>
                </button>
                <span>Showing <strong>{filteredSarees.length}</strong> masterwork sarees</span>
              </div>

              {/* Sorting */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-brand-warm-gray">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-brand-ivory border border-brand-gold/20 text-brand-maroon py-1.5 px-3 focus:outline-none focus:border-brand-maroon text-xs cursor-pointer rounded-none"
                  id="sort-select-menu"
                >
                  <option value="featured">Featured Masterworks</option>
                  <option value="price-asc">Price: Heirloom to Royal</option>
                  <option value="price-desc">Price: Royal to Heirloom</option>
                  <option value="rating">Client Favorites</option>
                </select>
              </div>
            </div>

            {/* Zero results feedback */}
            {filteredSarees.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-brand-gold/30 space-y-4">
                <p className="font-serif text-lg text-brand-maroon">No matching heritage drapes discovered</p>
                <p className="text-xs text-brand-warm-gray max-w-sm mx-auto">
                  Adjust your filters or price boundaries, or search for a different weaving technique.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest px-6 py-3 cursor-pointer hover:bg-brand-maroon/90 font-sans shadow-md"
                  id="reset-saree-grid-btn"
                >
                  Reset Refinements
                </button>
              </div>
            ) : (
              /* Core Saree grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSarees.map((saree) => {
                  const pricing = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(saree.price);

                  const originalPricing = saree.originalPrice
                    ? new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(saree.originalPrice)
                    : null;
                  
                  const isFaved = wishlist.some((item) => item.id === saree.id);

                  return (
                    <div
                      key={saree.id}
                      className="group relative bg-[#FDFBF7] border border-brand-gold/15 flex flex-col justify-between hover:shadow-lg transition-transform"
                    >
                      {/* Interactive Visual cover wrap */}
                      <div className="relative aspect-3/4 overflow-hidden bg-brand-sand">
                        <img
                          src={saree.images[0]}
                          alt={`${saree.name} - Handwoven Pure Silk ${saree.category} Banarasi Saree`}
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-500 cursor-pointer"
                          onClick={() => handleSareeClick(saree.id)}
                          referrerPolicy="no-referrer"
                        />

                        {/* Top Ribbon badges */}
                        {saree.isNew && (
                          <span className="absolute top-2.5 left-2.5 bg-brand-gold text-brand-ivory text-[8px] font-bold tracking-wider uppercase px-2 py-0.5">
                            New Motif
                          </span>
                        )}

                        {/* Love Interaction Icon */}
                        <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 z-10">
                          <button
                            onClick={() => toggleFavorite(saree)}
                            className="p-2 bg-brand-ivory/90 border border-brand-gold/20 hover:border-brand-maroon hover:bg-brand-maroon hover:text-brand-ivory text-brand-maroon rounded-full transition duration-300 cursor-pointer shadow-xs"
                            title={isFaved ? "Remove from wishlist" : "Add to wishlist"}
                            id={`shop-wishlist-action-${saree.id}`}
                          >
                            <Heart className={`w-3.5 h-3.5 transition-colors ${isFaved ? "fill-brand-maroon stroke-brand-maroon" : ""}`} />
                          </button>
                        </div>

                        {/* Slide-Up Quick View trigger */}
                        <button
                          onClick={() => setQuickViewSaree(saree)}
                          className="absolute bottom-0 w-full bg-brand-maroon/90 text-brand-ivory text-[10px] tracking-widest uppercase py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-sans hover:bg-brand-maroon cursor-pointer"
                          id={`shop-quickview-btn-${saree.id}`}
                        >
                          Quick View
                        </button>
                      </div>

                      {/* Name tags */}
                      <div className="p-4 bg-[#FDFBF7]">
                        <div className="text-[9px] text-brand-gold tracking-[0.1em] uppercase font-sans mb-1 flex items-center justify-between">
                          <span>{saree.category}</span>
                          <span className="text-[10px] font-medium flex items-center gap-1 text-brand-maroon/80 font-serif">
                            <Star className="w-2.5 h-2.5 fill-brand-gold text-brand-gold" /> {saree.rating}
                          </span>
                        </div>

                        <h3
                          onClick={() => handleSareeClick(saree.id)}
                          className="font-serif text-sm font-medium text-brand-maroon hover:text-brand-gold cursor-pointer line-clamp-1 transition duration-200"
                        >
                          {saree.name}
                        </h3>

                        <p className="text-[10px] text-brand-warm-gray mt-0.5 font-sans mb-3 select-none">
                          {saree.weavingTechnique} • {saree.zariType}
                        </p>

                        <div className="flex items-baseline space-x-2 border-t border-brand-gold/10 pt-2.5">
                          <span className="text-xs font-mono font-bold text-brand-maroon">{pricing}</span>
                          {originalPricing && (
                            <span className="text-[10px] font-mono text-brand-warm-gray line-through">
                              {originalPricing}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Mobile Drawer filter sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden" id="mobile-filter-drawer">
          <div className="fixed inset-0 bg-[#1C050E]/40 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)}></div>
          <div className="relative w-full max-w-xs bg-brand-ivory h-full shadow-2xl flex flex-col justify-between py-6 px-6 z-10 animate-[slide-in-right_0.3s_ease-out]">
            <div className="overflow-y-auto pr-2 pb-6">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-brand-gold/15">
                <h3 className="serif-heading text-lg font-serif text-brand-maroon">Refine Sarees</h3>
                <button
                  onClick={handleResetFilters}
                  className="text-[9px] uppercase tracking-widest font-mono text-brand-warm-gray hover:text-brand-maroon"
                >
                  Reset
                </button>
              </div>

              {/* Saree Categories */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-semibold tracking-wider text-brand-maroon uppercase">Categories</h4>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setSelectedCategory(cat === "All" ? null : cat);
                      }}
                      className={`block text-xs font-light w-full text-left py-1 ${activeCategory === cat ? "text-brand-maroon font-bold" : "text-brand-warm-gray"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Saree Zaris */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-semibold tracking-wider text-brand-maroon uppercase">Zari Qualities</h4>
                <div className="space-y-2">
                  {ZARI_TYPES.map((zari) => (
                    <button
                      key={zari}
                      onClick={() => setActiveZari(zari)}
                      className={`block text-xs font-light w-full text-left py-1 ${activeZari === zari ? "text-brand-maroon font-bold" : "text-brand-warm-gray"}`}
                    >
                      {zari}
                    </button>
                  ))}
                </div>
              </div>

              {/* Saree Weaves */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-semibold tracking-wider text-brand-maroon uppercase">Weaving Techniques</h4>
                <div className="space-y-2">
                  {WEAVING_TECHNIQUES.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => setActiveWeave(tech)}
                      className={`block text-xs font-light w-full text-left py-1 ${activeWeave === tech ? "text-brand-maroon font-bold" : "text-brand-warm-gray"}`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold tracking-wider text-brand-maroon uppercase">Colors</h4>
                <div className="space-y-2">
                  {COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setActiveColor(col)}
                      className={`block text-xs font-light w-full text-left py-1 ${activeColor === col ? "text-brand-maroon font-bold" : "text-brand-warm-gray"}`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-[#5B0E2D] text-brand-ivory text-xs uppercase tracking-widest py-3.5"
            >
              Apply Refinements
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
