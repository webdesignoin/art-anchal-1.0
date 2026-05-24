/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ViewState, Collection } from "../../types";
import { ArrowRight, Compass, Library, Sparkles } from "lucide-react";

interface CollectionsViewProps {
  setView: (view: ViewState) => void;
  setSelectedCategory: (category: string | null) => void;
  collections: Collection[];
}

export default function CollectionsView({ setView, setSelectedCategory, collections }: CollectionsViewProps) {
  const handleCollectionSelect = (category: string) => {
    setSelectedCategory(category);
    setView("shop");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans" id="collections-view-wrapper">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Editorial Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] tracking-[0.25em] uppercase text-brand-gold font-bold">Virasat Collections</span>
          <h1 className="serif-heading text-3xl sm:text-5.5xl text-brand-maroon font-serif font-light leading-tight">The Gharana Editions</h1>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto my-4"></div>
          <p className="text-xs sm:text-sm text-brand-warm-gray leading-relaxed font-light">
            Exploring the distinct motifs and weaving families of Banaras. From the classic Katan to the royal Shikargah, preserving the golden epochs of Indian textiles.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="space-y-24 pt-8">
          {collections.map((col, index) => {
            const isEven = index % 2 === 0;
            const mappedCategory = col.slug === "katan-silk" ? "Katan Silk" : col.slug === "shikargah" ? "Shikargah" : "Tanchoi";

            return (
              <div
                key={col.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${isEven ? "" : "lg:flex-row-reverse"}`}
              >
                {/* Visual Image */}
                <div className={`lg:col-span-6 overflow-hidden border border-brand-gold/15 shadow-lg relative aspect-4/3 bg-brand-sand ${isEven ? "" : "lg:order-last"}`}>
                  <img
                    src={col.coverImage}
                    alt={col.name}
                    className="w-full h-full object-cover hover:scale-[1.02] transition duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-[#1C050E]/80 border border-brand-gold/30 px-3 py-1 text-[#F9F5F0] text-[9px] uppercase tracking-widest font-mono">
                    Volume {index + 1}
                  </div>
                </div>

                {/* Technical Prose */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center space-x-2 text-[10px] text-brand-gold font-sans font-bold uppercase tracking-widest">
                    <Compass className="w-4 h-4 text-brand-gold" />
                    <span>Varanasi Archive Series</span>
                  </div>

                  <h2 className="serif-heading text-3xl sm:text-4xl text-brand-maroon font-serif leading-tight">
                    {col.name}
                  </h2>

                  <p className="text-sm text-brand-gold-dark italic font-serif leading-relaxed">
                    &ldquo;{col.tagline}&rdquo;
                  </p>

                  <p className="text-xs text-brand-warm-gray leading-relaxed font-light font-sans text-justify">
                    {col.description}
                  </p>

                  <div className="bg-brand-sand/30 border border-brand-gold/20 p-5 space-y-3 font-sans">
                    <h4 className="text-[11px] uppercase tracking-wider text-brand-maroon font-bold flex items-center space-x-1.5">
                      <Library className="w-3.5 h-3.5 text-brand-gold-dark" />
                      <span>Archive Technical Sheet</span>
                    </h4>
                    <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10.5px] text-brand-warm-gray">
                      <li>• Warp: Pure Mulberry Silk</li>
                      <li>• Weft: Zari / Resham</li>
                      <li>• Technique: Kadwa / Satin jacquard</li>
                      <li>• Lab Purity Test: Certified</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleCollectionSelect(mappedCategory)}
                      className="bg-[#5B0E2D] hover:bg-[#420A20] text-brand-ivory text-xs tracking-widest uppercase font-sans py-4 px-8 transition duration-300 font-semibold shadow-md flex items-center space-x-2 cursor-pointer"
                      id={`lookbook-select-${col.id}`}
                    >
                      <span>Browse Masterworks</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
