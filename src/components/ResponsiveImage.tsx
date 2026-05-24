// src/components/ResponsiveImage.tsx
import React, { useState } from "react";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * A lightweight responsive image component.
 * - Renders a <picture> with a WebP <source> ONLY for local asset URLs (not external CDN links)
 *   because external URLs don't have a matching .webp at the same path.
 * - Applies lazy loading by default, with opt-in eager/high-priority for LCP images.
 * - Forwards className and optional explicit dimensions to prevent CLS.
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  loading = "lazy",
  fetchPriority = "auto",
}) => {
  // Only generate WebP source for local relative paths.
  // External URLs (http/https) don't have a matching .webp at the same path.
  const isLocal = src && !src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("//");
  const webpSrc = isLocal ? src.replace(/\.(jpe?g|png)$/i, ".webp") : null;

  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`} style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}>
      {/* Skeleton Shimmer Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-brand-sand animate-shimmer" style={{ zIndex: 1 }}></div>
      )}

      <picture>
        {/* WebP source — only for local assets where the file exists */}
        {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
        {/* Fallback to original format (or direct image for external URLs) */}
        <img
          src={src}
          alt={alt}
          loading={loading}
          // @ts-ignore — fetchpriority is valid HTML5 but not yet in all TS DOM types
          fetchpriority={fetchPriority}
          width={width}
          height={height}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
        />
      </picture>
    </div>
  );
};

export default ResponsiveImage;
