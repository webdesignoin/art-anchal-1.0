/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ViewState, Saree, Artisan } from "../../types";
import { ArrowRight, MapPin, Scissors, Award, Clock } from "lucide-react";
import ResponsiveImage from "../ResponsiveImage";
import { useEffect } from "react";

interface ArtisanStoriesViewProps {
  setView: (view: ViewState) => void;
  setSelectedSareeId: (id: string | null) => void;
  setSelectedCategory: (cat: string | null) => void;
  artisans: Artisan[];
  sarees: Saree[];
}

export default function ArtisanStoriesView({
  setView,
  setSelectedSareeId,
  setSelectedCategory,
  artisans,
  sarees,
}: ArtisanStoriesViewProps) {
  const handleExploreArtisanWork = (sareeId?: string, category?: string) => {
    if (sareeId) {
      setSelectedSareeId(sareeId);
      setView("product-detail");
    } else if (category) {
      setSelectedCategory(category);
      setView("shop");
    } else {
      setSelectedCategory(null);
      setView("shop");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // SEO: set page title dynamically
  useEffect(() => {
    document.title = 'Artisan Stories – Art & Anchal';
    return () => { document.title = 'Art & Anchal'; };
  }, []);

  return (
    <>
      <h1 className="sr-only">Artisan Stories – Art &amp; Anchal</h1>
      <div className="bg-[#FDFBF7] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans" id="artisan-stories-view">
        <div className="max-w-5xl mx-auto space-y-16">

          {/* Page Header */}
          <div className="text-center space-y-3">
            <span className="text-[10px] tracking-[0.25em] uppercase text-brand-gold font-bold">The Authentic Loom Masterminds</span>
            <h2 className="serif-heading text-3xl sm:text-5xl text-brand-maroon font-serif font-light leading-tight">Master Artisan Stories</h2>
            <div className="w-16 h-0.5 bg-brand-gold mx-auto my-4"></div>
            <p className="text-xs sm:text-sm text-brand-warm-gray leading-relaxed max-w-2xl mx-auto font-light">
              Every Banarasi saree is born from silent moments of loom coordination. Learn about the legacy handloom weavers preserving deep heritage in rural Varanasi cooperatives.
            </p>
          </div>

          {/* Master Artisans List */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-1 lg:gap-0 lg:space-y-24 pt-8">
            {artisans.map((artisan, index) => {
              const isLatest = index === 0;
              const featuredSaree = artisan.featuredSareeId
                ? sarees.find((s) => s.id === artisan.featuredSareeId)
                : null;

              return (
                <div
                  key={artisan.id}
                  className={`flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-12 items-start lg:border-b border-brand-gold/15 lg:pb-16 pb-4 last:border-0 ${index > 1 ? 'heavy-section-deferred' : ''}`}
                >
                  {/* Left col: Image avatar with specialty badge */}
                  <div className="w-full lg:col-span-4 space-y-2 lg:space-y-4">
                    <div className="relative aspect-square border border-brand-gold/20 overflow-hidden bg-brand-sand">
                      <ResponsiveImage
                        src={artisan.imageUrl}
                        alt={artisan.name}
                        className="w-full h-full object-cover transition duration-500"
                      />
                      {isLatest && (
                        <span className="absolute top-2 left-2 lg:top-3 lg:left-3 bg-[#5B0E2D] text-brand-ivory text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-md">
                          Spotlight
                        </span>
                      )}
                    </div>

                    <div className="hidden lg:block p-4 bg-brand-sand/30 border border-brand-gold/15 rounded-none text-center">
                      <h4 className="text-[10px] text-brand-gold-dark font-sans tracking-wider uppercase font-bold mb-1">Weaving Specialty</h4>
                      <p className="text-xs text-brand-maroon font-serif font-bold italic">{artisan.specialty}</p>
                    </div>
                  </div>

                  {/* Right col: Name, biography quote and showcase items */}
                  <div className="w-full lg:col-span-8 space-y-2 lg:space-y-6 text-brand-maroon flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="serif-heading text-lg sm:text-xl lg:text-3xl font-serif text-brand-maroon leading-tight">{artisan.name}</h3>
                      <p className="hidden lg:block text-xs text-brand-gold-dark uppercase tracking-widest font-sans font-semibold">
                        Age: {artisan.age} • Village: {artisan.village} • {artisan.experienceYears} Years Loom Training
                      </p>
                      <p className="lg:hidden text-[9px] text-brand-warm-gray uppercase tracking-wider font-sans font-semibold truncate">
                        {artisan.village}
                      </p>
                      <p className="lg:hidden text-[10px] text-brand-maroon font-serif italic line-clamp-2 mt-1">
                        {artisan.specialty}
                      </p>
                    </div>

                    <div className="hidden lg:block border-l-2 border-brand-gold pl-4 py-1 italic font-serif text-sm sm:text-base text-brand-gold-dark">
                      &ldquo;{artisan.quote}&rdquo;
                    </div>

                    <p className="hidden lg:block text-xs text-[#7E726B] leading-relaxed text-justify font-sans">
                      {artisan.story}
                    </p>

                    <div className="hidden lg:grid pt-4 border-t border-brand-gold/10 grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                      {featuredSaree ? (
                        <div className="bg-brand-sand/10 border border-brand-gold/15 p-4 flex gap-3 items-center">
                          <div className="w-14 h-18 bg-brand-sand flex-shrink-0 overflow-hidden">
                            <ResponsiveImage
                              src={featuredSaree.images[0]}
                              alt={featuredSaree.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-[8px] uppercase tracking-wider text-brand-gold font-sans block">
                              Crafted by {artisan.name.split(" ")[0]}
                            </span>
                            <h4 className="font-serif text-[11px] font-semibold text-brand-maroon truncate leading-tight">
                              {featuredSaree.name}
                            </h4>
                            <span className="text-[10px] text-brand-gold font-mono tracking-tight block mt-0.5">
                              {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 0,
                              }).format(featuredSaree.price)}
                            </span>
                            <button
                              onClick={() => handleExploreArtisanWork(featuredSaree.id)}
                              className="text-[9px] uppercase tracking-wider text-brand-maroon underline font-sans font-semibold mt-1 hover:text-brand-gold cursor-pointer"
                              id={`artisan-saree-link-${featuredSaree.id}`}
                            >
                              Explore Masterpiece Details
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-brand-warm-gray">No featured saree configured.</div>
                      )}

                      <button
                        onClick={() => handleExploreArtisanWork(undefined, featuredSaree?.category)}
                        className="border border-brand-gold hover:border-brand-maroon text-brand-maroon hover:bg-brand-sand text-xs tracking-widest uppercase font-semibold py-3.5 px-6 transition duration-300 font-sans text-center cursor-pointer"
                        id={`explore-coop-btn-desk-${artisan.id}`}
                      >
                        Browse Loom Master Catalogue
                      </button>
                    </div>

                    <div className="mt-auto lg:hidden pt-2">
                       <button
                          onClick={() => handleExploreArtisanWork(undefined, featuredSaree?.category)}
                          className="w-full border border-brand-gold/50 text-brand-maroon bg-brand-gold/10 text-[9px] tracking-widest uppercase font-bold py-2 px-2 text-center cursor-pointer"
                          id={`explore-coop-btn-mob-${artisan.id}`}
                        >
                          View Work
                        </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
