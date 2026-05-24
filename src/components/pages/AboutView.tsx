import React from "react";
import { ViewState } from "../../types";
import { Users, Award, Library } from "lucide-react";
import ResponsiveImage from "../ResponsiveImage";
import FounderCard from "../FounderCard";
import { Helmet } from "react-helmet-async";

interface AboutViewProps {
  setView: (view: ViewState) => void;
}

const founders = [
  {
    name: "Aanchal Sen",
    title: "Chief Textiles Curator",
    description: "Aanchal maps traditional archival charts. She spends her weeks in Sarai Mohana auditing gold and silver Zari thread densities on vintage weavers handlooms.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
  },
  {
    name: "Priyadarshini Maurya",
    title: "Director of Weavers’ Trust",
    description: "Priyadarshini orchestrates cooperative payouts and craft preservation grants, ensuring local weaver families receive healthcare, educational funds, and direct clean electricity.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
  },
  {
    name: "Vasundhara Ahmed",
    title: "Design & Global Logistics",
    description: "Vasundhara couples Mughal heritage visual forms with minimalist silhouettes to serve modern global brides, managing direct climate-controlled storage caskets.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
  },
];

export default function AboutView({ setView }: AboutViewProps) {
  return (
    <>
      <Helmet>
        <title>About Art & Anchal – Luxury Handloom Sarees</title>
        <meta name="description" content="Learn the story behind Art & Anchal, the founders, and our commitment to fair‑trade handloom weaving in Varanasi." />
      </Helmet>
      <section id="about" aria-labelledby="about-heading" className="bg-[#FDFBF7] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Editorial Heading */}
          <div className="text-center space-y-3">
            <span className="text-[10px] tracking-[0.25em] uppercase text-brand-gold font-bold">The Sincere Founders</span>
            <h1 id="about-heading" className="serif-heading text-4xl sm:text-6xl text-brand-maroon font-serif font-light leading-tight">About Art&Anchal</h1>
            <div className="w-16 h-0.5 bg-brand-gold mx-auto my-4" />
            <p className="text-sm text-brand-gold-dark italic font-serif max-w-lg mx-auto leading-relaxed">&ldquo;Crafting pure Varanasi handloom memories while restoring sovereign living wages back to rural weavers.&rdquo;</p>
          </div>

          {/* Cinematic Dual Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6 relative aspect-3/4 border border-brand-gold/15 shadow-md bg-brand-sand overflow-hidden">
              <ResponsiveImage
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800"
                alt="Art&Anchal weaving family legacy"
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:col-span-6 space-y-6">
              <h2 className="serif-heading text-2.5xl sm:text-3.5xl text-brand-maroon font-serif">Our Genesis Story</h2>
              <p className="text-xs text-[#7E726B] leading-relaxed text-justify">
                Art&Anchal was born in 1994 near Pili Kothi, Varanasi. Confronted with the dramatic rise of industrial powerlooms and the downstream degradation of genuine gold zari purity, three close college friends from Varanasi weaving families—Aanchal Sen, Priyadarshini Maurya, and Vasundhara Ahmed—decided to establish a direct-to-consumer artisanal guild.
              </p>
              <p className="text-xs text-[#7E726B] leading-relaxed text-justify">
                By designing contemporary palettes for global luxury tastemakers while retaining 100% of classic wood‑loom structures, Art&Anchal created a stable cooperative. We bypass the centuries‑old wholesale middleman chains (\"Arhatiyas\") completely, returning 75% of order revenues directly to rural weavers’ bank accounts.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setView("artisan-stories");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-[#5B0E2D] hover:bg-[#420A20] text-brand-ivory text-xs tracking-widest uppercase px-6 py-4 transition duration-300 font-semibold cursor-pointer shadow-md"
                >
                  Meet Weaving Artisans
                </button>
              </div>
            </div>
          </div>

          {/* Three Founders Grid */}
          <div className="space-y-10 border-t border-brand-gold/15 pt-16">
            <div className="text-center space-y-2">
              <span className="text-[10px] tracking-[0.2em] font-sans uppercase text-brand-gold font-bold">The Visionaries</span>
              <h3 className="serif-heading text-2xl sm:text-3.5xl text-brand-maroon font-serif">Three Women Founders</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8" role="list">
              {founders.map((f) => (
                <FounderCard key={f.name} founder={f} />
              ))}
            </div>
          </div>

          {/* Pillars of Art&Anchal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-brand-gold/15 pt-16">
            <div className="flex items-start space-x-4" role="listitem">
              <Users className="w-6 h-6 text-brand-gold flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-serif text-base font-medium text-brand-maroon">Genuine Cooperative Payout</h4>
                <p className="text-xs text-brand-warm-gray font-light">
                  75% of every direct order value returns immediately back to rural Varanasi coordinates, helping artisans sustain manual weaving over factory cities.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4" role="listitem">
              <Award className="w-6 h-6 text-brand-gold flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-serif text-base font-medium text-brand-maroon">100% Pure Saree Zari Trust</h4>
                <p className="text-xs text-brand-warm-gray font-light">
                  We strictly reject plastic thread tested zaris. Every gold or silver thread catalog item carries chemical metallurgy purity analysis certification cards.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4" role="listitem">
              <Library className="w-6 h-6 text-brand-gold flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-serif text-base font-medium text-brand-maroon">Weaving Preservation Archives</h4>
                <p className="text-xs text-brand-warm-gray font-light">
                  We record, translate, and digitize geometric loom‑cards derived from historic Varanasi documents, archiving patterns representing centuries of Indian ethnic clothing history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
