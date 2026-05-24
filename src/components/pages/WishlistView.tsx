/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ViewState, Saree } from "../../types";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";

interface WishlistViewProps {
  wishlist: Saree[];
  toggleFavorite: (saree: Saree) => void;
  setQuickViewSaree: (saree: Saree) => void;
  setView: (view: ViewState) => void;
  setSelectedSareeId: (id: string | null) => void;
}

export default function WishlistView({
  wishlist,
  toggleFavorite,
  setQuickViewSaree,
  setView,
  setSelectedSareeId,
}: WishlistViewProps) {
  const handleSareeClick = (id: string) => {
    setSelectedSareeId(id);
    setView("product-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans" id="wishlist-view-container">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-2 pb-8 border-b border-brand-gold/15">
          <span className="text-[10px] tracking-[0.25em] uppercase text-brand-gold font-bold">Your Curated Selections</span>
          <h1 className="serif-heading text-3xl sm:text-5xl text-brand-maroon font-serif font-light">My Guild Wishlist</h1>
        </div>

        {wishlist.length === 0 ? (
          /* Empty wishlist feedback */
          <div className="py-24 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-brand-sand mx-auto flex items-center justify-center text-brand-maroon/50">
              <Heart className="w-8 h-8 stroke-[1.2]" />
            </div>
            <h3 className="serif-heading text-xl text-brand-maroon font-light">Your curated wishlist has no items</h3>
            <p className="text-xs text-brand-warm-gray leading-relaxed max-w-xs mx-auto">
              Each Art&Anchal Banarasi saree is a timeless heirloom. Browse the catalog and heart items to see them here.
            </p>
            <button
              onClick={() => {
                setView("shop");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-brand-maroon text-brand-ivory text-xs tracking-widest uppercase font-semibold py-3.5 px-8 cursor-pointer shadow-md"
              id="empty-wishlist-shop-btn"
            >
              Explore Saree Showroom
            </button>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlist.map((saree) => {
              const priceVal = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(saree.price);

              return (
                <div
                  key={saree.id}
                  className="group relative bg-[#FDFBF7] border border-brand-gold/15 flex flex-col justify-between"
                >
                  {/* Saree cover */}
                  <div className="relative aspect-3/4 overflow-hidden bg-brand-sand">
                    <img
                      src={saree.images[0]}
                      alt={saree.name}
                      onClick={() => handleSareeClick(saree.id)}
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-500 cursor-pointer"
                      referrerPolicy="no-referrer"
                    />

                    {/* Unlove action button */}
                    <button
                      onClick={() => toggleFavorite(saree)}
                      className="absolute top-2.5 right-2.5 p-2 bg-brand-ivory hover:bg-brand-sand border border-brand-gold/20 text-[#B64545] rounded-full transition cursor-pointer shadow-sm"
                      title="Remove from wishlist"
                      id={`unwishlist-btn-${saree.id}`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#B64545] stroke-[#B64545]" />
                    </button>

                    {/* Direct quicklook slider hook */}
                    <button
                      onClick={() => setQuickViewSaree(saree)}
                      className="absolute bottom-0 w-full bg-brand-maroon/95 text-brand-ivory text-[10px] tracking-widest uppercase py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium hover:bg-brand-maroon cursor-pointer"
                      id={`wishlist-quickview-${saree.id}`}
                    >
                      Quick Design View
                    </button>
                  </div>

                  {/* details text */}
                  <div className="p-4 bg-[#FDFBF7]">
                    <span className="text-[9px] text-brand-gold tracking-wider uppercase block font-sans mb-1">{saree.category}</span>
                    <h3
                      onClick={() => handleSareeClick(saree.id)}
                      className="font-serif text-sm font-semibold text-brand-maroon hover:text-brand-gold cursor-pointer line-clamp-1 transition duration-200"
                    >
                      {saree.name}
                    </h3>
                    <p className="text-[10px] text-brand-warm-gray mt-0.5 mb-2 font-sans select-none">
                      By {saree.weaverName}
                    </p>

                    <p className="text-xs font-mono font-bold text-brand-maroon border-t border-brand-gold/10 pt-2">{priceVal}</p>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
