// src/components/FounderCard.tsx
import React from "react";
import ResponsiveImage from "./ResponsiveImage";

interface Founder {
  name: string;
  title: string;
  description: string;
  image: string;
}

interface FounderCardProps {
  founder: Founder;
}

/**
 * Reusable card for a founder displayed on the About page.
 * Uses the ResponsiveImage component for optimized loading and adds
 * subtle fade‑in animation on scroll via the `data-fade` attribute.
 */
const FounderCard: React.FC<FounderCardProps> = ({ founder }) => {
  return (
    <article className="bg-[#FAF7F2] p-6 border border-brand-gold/15 text-center space-y-4" role="listitem" data-fade>
      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto bg-brand-sand border border-brand-gold/20">
        <ResponsiveImage
          src={founder.image}
          alt={founder.name + " Founder"}
          width={300}
          height={300}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div>
        <h4 className="font-serif text-sm font-semibold text-brand-maroon">{founder.name}</h4>
        <p className="text-[10px] text-brand-gold-dark uppercase tracking-widest font-sans font-semibold">
          {founder.title}
        </p>
      </div>
      <p className="text-[11px] text-brand-warm-gray leading-relaxed font-light">
        {founder.description}
      </p>
    </article>
  );
};

export default FounderCard;
