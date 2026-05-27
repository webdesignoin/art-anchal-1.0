import { useEffect, useRef } from "react";
import { ViewState, Collection } from "../../types";
import { ArrowRight, Compass, Library, Sparkles } from "lucide-react";

interface CollectionsViewProps {
  setView: (view: ViewState) => void;
  setSelectedCategory: (category: string | null) => void;
  collections: Collection[];
}

export default function CollectionsView({ setView, setSelectedCategory, collections }: CollectionsViewProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-24');
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const handleCollectionSelect = (category: string) => {
    setSelectedCategory(category);
    setView("shop");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#1C050E] min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden" id="collections-view-wrapper">
      <div className="max-w-7xl mx-auto space-y-32">
        
        {/* Editorial Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto animate-on-scroll opacity-0 translate-y-24 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <span className="inline-block py-2 px-5 border border-brand-gold/40 text-brand-gold text-[10px] font-bold uppercase tracking-[0.3em] rounded-full shadow-[0_0_15px_rgba(232,195,158,0.2)]">
            Virasat Collections
          </span>
          <h1 className="serif-heading text-4xl sm:text-6xl text-[#FDFBF7] font-serif font-light leading-tight">
            The <span className="text-brand-gold italic">Gharana</span> Editions
          </h1>
          <p className="text-sm sm:text-base text-brand-gold/70 leading-relaxed font-light max-w-xl mx-auto">
            Exploring the distinct motifs and weaving families of Banaras. From the classic Katan to the royal Shikargah, preserving the golden epochs of Indian textiles.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-1 lg:gap-0 lg:space-y-32">
          {collections.map((col, index) => {
            const isEven = index % 2 === 0;
            // Map the collection to the shop's filtering category. Defaults to "Katan Silk" for unmapped ones for the demo.
            const mappedCategory = col.slug === "royal-katan-heritage" ? "Katan Silk" : col.slug === "shikargah-chronicles" ? "Shikargah" : "Tanchoi";

            return (
              <div
                key={col.id}
                className={`group relative flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-16 items-center animate-on-scroll opacity-0 translate-y-24 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isEven ? "" : "lg:flex-row-reverse"} ${index > 0 ? "heavy-section-deferred" : ""}`}
              >
                {/* Visual Image */}
                <div className={`w-full lg:col-span-5 relative z-10 ${isEven ? "lg:col-start-2" : "lg:col-start-7 lg:order-last"}`}>
                  <div className="hidden lg:block absolute inset-0 bg-brand-gold/20 transform translate-x-4 translate-y-4 rounded-xl transition-transform duration-700 group-hover:translate-x-6 group-hover:translate-y-6 blur-md"></div>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-brand-gold/30 shadow-lg lg:shadow-2xl bg-[#2A0815]">
                    <img
                      src={col.coverImage}
                      alt={col.name}
                      className="w-full h-full object-cover lg:scale-105 transition-transform duration-1000 lg:group-hover:scale-100"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML += '<div class="absolute inset-0 flex flex-col items-center justify-center text-brand-gold/50 font-sans text-xs uppercase tracking-widest bg-[#2A0815]"><span>Image Placeholder</span><span class="mt-2 text-[10px]">' + col.coverImage.split('/').pop() + '</span></div>';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C050E]/90 lg:from-[#1C050E]/80 via-transparent to-transparent opacity-80 lg:opacity-60 transition-opacity duration-700 lg:group-hover:opacity-40"></div>
                    <div className="absolute top-2 left-2 lg:top-4 lg:left-4 bg-[#1C050E]/90 border border-brand-gold/50 px-2 lg:px-4 py-1 lg:py-1.5 text-brand-gold text-[8px] lg:text-[10px] uppercase tracking-widest font-mono rounded-sm backdrop-blur-sm shadow-lg">
                      Vol {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Technical Prose */}
                <div className={`w-full lg:col-span-6 relative z-20 flex-1 flex flex-col ${isEven ? "" : "lg:col-start-1"}`}>
                  <div className={`p-4 sm:p-6 lg:p-12 bg-[#FDFBF7]/5 lg:backdrop-blur-md border border-brand-gold/10 rounded-xl lg:rounded-2xl shadow-xl transition-all duration-700 lg:group-hover:bg-[#FDFBF7]/10 lg:group-hover:-translate-y-2 lg:group-hover:shadow-[0_20px_40px_rgba(232,195,158,0.1)] flex-1 flex flex-col justify-between lg:mt-0`}>
                    
                    <div>
                      <div className="hidden lg:flex items-center space-x-2 text-[10px] text-brand-gold font-sans font-bold uppercase tracking-widest mb-6">
                        <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
                        <span>Varanasi Archive Series</span>
                      </div>

                      <h2 className="serif-heading text-lg sm:text-2xl lg:text-5xl text-[#FDFBF7] font-serif leading-tight mb-2 lg:mb-4 lg:group-hover:text-brand-gold transition-colors duration-500 line-clamp-2 lg:line-clamp-none">
                        {col.name}
                      </h2>

                      <p className="hidden lg:block text-sm sm:text-base text-brand-gold italic font-serif leading-relaxed mb-6">
                        &ldquo;{col.tagline}&rdquo;
                      </p>

                      <p className="hidden lg:block text-sm text-brand-warm-gray/90 leading-relaxed font-light font-sans text-justify mb-8">
                        {col.description}
                      </p>

                      <div className="hidden lg:block bg-[#1C050E]/60 border border-brand-gold/20 p-5 rounded-lg space-y-3 font-sans mb-8 transition-colors duration-500 group-hover:border-brand-gold/40">
                        <h4 className="text-[11px] uppercase tracking-wider text-brand-gold font-bold flex items-center space-x-1.5">
                          <Library className="w-3.5 h-3.5" />
                          <span>Archive Technical Sheet</span>
                        </h4>
                        <ul className="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] text-brand-warm-gray/80">
                          <li className="flex items-center space-x-2"><span className="w-1 h-1 rounded-full bg-brand-gold"></span><span>Warp: Pure Mulberry</span></li>
                          <li className="flex items-center space-x-2"><span className="w-1 h-1 rounded-full bg-brand-gold"></span><span>Weft: Zari / Resham</span></li>
                          <li className="flex items-center space-x-2"><span className="w-1 h-1 rounded-full bg-brand-gold"></span><span>Heritage Craft</span></li>
                          <li className="flex items-center space-x-2"><span className="w-1 h-1 rounded-full bg-brand-gold"></span><span>Certified Purity</span></li>
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 mt-auto">
                      <button
                        onClick={() => handleCollectionSelect(mappedCategory)}
                        className="group/btn relative w-full lg:w-auto overflow-hidden bg-brand-gold lg:bg-brand-gold text-[#1C050E] text-[10px] lg:text-xs tracking-widest lg:tracking-[0.2em] uppercase font-sans py-3 lg:py-4 px-4 lg:px-8 font-bold flex items-center justify-center space-x-2 lg:space-x-3 rounded-sm transition-all duration-300 lg:hover:shadow-[0_0_20px_rgba(232,195,158,0.4)] cursor-pointer"
                        id={`lookbook-select-${col.id}`}
                      >
                        <span className="relative z-10">Explore</span>
                        <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 relative z-10 transform transition-transform lg:group-hover/btn:translate-x-1" />
                        <div className="hidden lg:block absolute inset-0 h-full w-full bg-white/20 transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-out"></div>
                      </button>
                    </div>

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
