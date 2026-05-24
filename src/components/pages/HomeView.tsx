/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ViewState, Saree, Collection } from "../../types";
import { CUSTOM_ASSETS } from "../../data/sarees";
import { ArrowRight, Gem, ShieldCheck, UserCheck, Play } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface HomeViewProps {
  setView: (view: ViewState) => void;
  setSelectedSareeId: (id: string | null) => void;
  setQuickViewSaree: (saree: Saree) => void;
  toggleFavorite: (saree: Saree) => void;
  wishlist: Saree[];
  addToCart: (saree: Saree, quantity: number) => void;
  setSelectedCategory: (category: string | null) => void;
  sarees: Saree[];
  collections: Collection[];
}

export default function HomeView({
  setView,
  setSelectedSareeId,
  setQuickViewSaree,
  setSelectedCategory,
  sarees,
  collections,
}: HomeViewProps) {
  const bestsellers = sarees.filter((s) => s.isBestseller).slice(0, 4);
  const featured = sarees.filter((s) => s.isFeatured).slice(0, 3);
  
  const handleSareeClick = (id: string) => {
    setSelectedSareeId(id);
    setView("product-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCollectionView = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setView("shop");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#FDFBF7] overflow-hidden" id="home-view-container">
      
      {/* ── 1. Cinematic Hero with Scroll Parallax ──────────────────────── */}
      <section className="relative h-screen bg-[#1C050E] flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0 w-full h-full opacity-60">
          <img
            src={CUSTOM_ASSETS.hero}
            alt="Authentic Banarasi handloom pure silk saree with gold Zari weaving"
            className="w-full h-[120%] object-cover object-center animate-parallax-slow"
            style={{ transform: "translateY(0)" }}
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C050E] via-[#1C050E]/40 to-[#1C050E]/20"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8 animate-fade-in mt-20">
          <span className="inline-block border border-brand-gold/30 text-brand-gold text-[9px] uppercase tracking-[0.3em] font-bold px-4 py-1.5 rounded-full backdrop-blur-md bg-[#1C050E]/50">
            The Sacred Weaves of Varanasi
          </span>
          <h1 className="serif-heading text-5xl sm:text-7xl lg:text-[6rem] font-light text-brand-ivory leading-[1.1] tracking-tight drop-shadow-2xl">
            Woven in <br />
            <span className="font-serif italic text-brand-gold">Whispers of Gold</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#C7B7AE] leading-relaxed max-w-xl mx-auto font-light">
            Experience handloom masterworks crafted over months by legacy weaving families. Real mulberry silk intertwined with genuine lab-certified gold zari.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setView("shop");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-brand-gold hover:bg-white text-brand-maroon text-[10px] tracking-widest uppercase px-10 py-5 font-bold transition-all duration-300 shadow-[0_0_40px_rgba(197,168,128,0.3)] flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              Explore the Weaves <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("collections")}
              className="group flex items-center gap-3 text-brand-ivory text-[10px] tracking-widest uppercase font-bold hover:text-brand-gold transition-colors"
            >
              <span className="w-12 h-12 rounded-full border border-brand-gold/30 flex items-center justify-center group-hover:border-brand-gold transition-colors">
                <Play className="w-3 h-3 fill-brand-ivory group-hover:fill-brand-gold transition-colors ml-0.5" />
              </span>
              View the Parampara
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce-slow">
          <span className="text-[8px] uppercase tracking-[0.3em] text-brand-gold/60 font-bold">Scroll to discover</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-brand-gold to-transparent"></div>
        </div>
      </section>

      {/* ── 2. Asymmetrical Bento Box Core Accents ──────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[280px]">
          
          {/* Big Story Card */}
          <div className="md:col-span-8 bg-brand-maroon text-brand-ivory p-10 sm:p-14 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none mix-blend-overlay">
              <img src={CUSTOM_ASSETS.hero} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="relative z-10 max-w-md space-y-6">
              <Gem className="w-8 h-8 text-brand-gold" />
              <h3 className="font-serif text-4xl leading-tight">Authentic Banarasi Karigari</h3>
              <p className="text-xs text-brand-gold/80 leading-relaxed max-w-sm">
                Crafted by master weavers using techniques passed down through generations. True handloom, true heritage.
              </p>
            </div>
          </div>

          {/* Small Feature 1 */}
          <div className="md:col-span-4 bg-brand-sand border border-brand-gold/15 p-10 flex flex-col justify-center space-y-4 hover:bg-brand-gold/10 transition-colors">
            <UserCheck className="w-6 h-6 text-brand-gold" />
            <h3 className="font-serif text-2xl text-brand-maroon">Empowering the Weaver</h3>
            <p className="text-[11px] text-brand-warm-gray leading-relaxed">
              Directly supporting the artisan families of Banaras, ensuring the survival of this sacred craft and fair compensation for their art.
            </p>
          </div>

          {/* Small Feature 2 */}
          <div className="md:col-span-5 bg-brand-ivory border border-brand-gold/15 p-10 flex flex-col justify-center space-y-4 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-brand-gold" />
            <h3 className="font-serif text-2xl text-brand-maroon">Heirloom Sandook</h3>
            <p className="text-[11px] text-brand-warm-gray leading-relaxed">
              Delivered safely anywhere in the world. Your saree arrives in a custom, protective case to preserve the intricate Zari for generations.
            </p>
          </div>

          {/* Video/Image Accent */}
          <div className="md:col-span-7 bg-[#1C050E] relative overflow-hidden group cursor-pointer" onClick={() => setView("about")}>
            <img src={CUSTOM_ASSETS.artisan} alt="Traditional Banarasi weaver working on a wooden handloom in Varanasi" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-brand-ivory/10 backdrop-blur-md border border-brand-gold/30 px-6 py-3 rounded-full flex items-center gap-3">
                <Play className="w-3 h-3 text-brand-gold fill-brand-gold" />
                <span className="text-[9px] uppercase tracking-widest text-brand-ivory font-bold">Watch The Process</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Scroll-Snapping Collections ──────────────────────────────── */}
      <section className="py-24 bg-brand-sand/30 border-y border-brand-gold/15 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex items-end justify-between">
          <div>
            <span className="text-[10px] tracking-[0.2em] font-sans uppercase text-brand-gold font-bold mb-2 block">Seasonal Chapters</span>
            <h2 className="serif-heading text-4xl sm:text-5xl text-brand-maroon font-serif">Curated Collections</h2>
          </div>
          <button
            onClick={() => setView("collections")}
            className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-maroon font-bold hover:text-brand-gold transition"
          >
            View All Chapters <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Horizontal Snap Scroll Container */}
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-12 px-4 sm:px-6 lg:px-8 gap-6 lg:gap-8 mx-auto max-w-7xl">
          {collections.map((col) => (
            <div
              key={col.id}
              className="snap-center sm:snap-start flex-none w-[85vw] sm:w-[400px] lg:w-[450px] relative group cursor-pointer"
              onClick={() => handleCollectionView(col.name)}
            >
              <div className="aspect-[4/5] overflow-hidden bg-[#1C050E]">
                <img
                  src={col.coverImage}
                  alt={col.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <span className="text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-2 border border-brand-gold/30 px-3 py-1 w-max backdrop-blur-sm">
                  {col.name}
                </span>
                <p className="text-brand-ivory text-sm font-serif italic mb-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  {col.tagline}
                </p>
                <div className="w-full h-[1px] bg-brand-gold/30 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-500"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. The Bestsellers Grid ────────────────────────────────────── */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-20">
          <span className="text-[10px] tracking-[0.2em] font-sans uppercase text-brand-gold font-bold">Client Favorites</span>
          <h2 className="serif-heading text-4xl sm:text-5xl text-brand-maroon font-serif font-light">Heritage Bestsellers</h2>
          <div className="w-12 h-0.5 bg-brand-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestsellers.map((saree) => {
            const displayImg = saree.images && saree.images.length > 0 ? saree.images[0] : (saree as any).image_url;
            return (
              <div key={saree.id} className="group cursor-pointer flex flex-col heavy-section-deferred" onClick={() => handleSareeClick(saree.id)}>
                <div className="relative aspect-[3/4] overflow-hidden bg-brand-sand mb-5">
                  <img
                    src={displayImg}
                    alt={saree.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  
                  {/* Quick View Button on Hover */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex justify-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setQuickViewSaree(saree); }}
                      className="bg-brand-ivory text-brand-maroon text-[9px] uppercase font-bold tracking-widest px-6 py-3 shadow-xl w-full hover:bg-brand-gold hover:text-brand-ivory transition-colors"
                    >
                      Quick View
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1.5 flex-1">
                  <span className="text-[9px] uppercase tracking-widest text-brand-gold font-bold block">
                    {saree.category}
                  </span>
                  <h3 className="font-serif text-lg text-brand-maroon leading-tight group-hover:text-brand-gold transition-colors">
                    {saree.name}
                  </h3>
                  <p className="font-mono text-sm font-bold text-brand-maroon pt-1">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(saree.price)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => { setView("shop"); window.scrollTo(0,0); }}
            className="inline-flex items-center gap-2 border-b-2 border-brand-maroon text-brand-maroon pb-1 text-xs uppercase tracking-widest font-bold hover:text-brand-gold hover:border-brand-gold transition-colors"
          >
            Discover All Designs <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
}
