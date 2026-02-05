import React, { useState, useEffect, useRef } from 'react';

/**
 * OptimizedImage - Auto-compress images via CDN proxy with lazy loading
 * 
 * Features:
 * - Routes external images through weserv.nl for compression
 * - Auto converts to WebP format (90% smaller!)
 * - Lazy loading with IntersectionObserver
 * - Blur placeholder while loading
 * - Error fallback to original URL
 * - Responsive with proper aspect ratio
 * 
 * @example
 * <OptimizedImage 
 *   src="https://i.ibb.co/abc/image.jpg"
 *   width={800}
 *   quality={80}
 *   alt="Description"
 * />
 */

// Build optimized URL using weserv.nl proxy
export const buildOptimizedUrl = (originalUrl, options = {}) => {
  const { width = 'auto', height = 'auto', quality = 80 } = options;

  // Skip optimization for:
  // 1. Already optimized URLs
  // 2. Local paths
  // 3. Data URLs
  // 4. SVGs (already optimized)
  if (
    !originalUrl ||
    originalUrl.includes('weserv.nl') ||
    originalUrl.includes('imagekit.io') ||
    originalUrl.startsWith('/') ||
    originalUrl.startsWith('data:') ||
    originalUrl.endsWith('.svg')
  ) {
    return originalUrl;
  }

  try {
    // Encode the original URL
    const encodedUrl = encodeURIComponent(originalUrl);

    // Build weserv.nl proxy URL
    // API docs: https://images.weserv.nl/docs/
    const params = new URLSearchParams({
      url: originalUrl, // Don't encode twice - weserv handles it
      w: width === 'auto' ? '' : width,
      h: height === 'auto' ? '' : height,
      q: quality,
      output: 'webp',
      default: '1', // Return 404 image if original fails
      we: '1' // Without enlargement
    });

    // Remove empty params
    [...params.keys()].forEach(key => {
      if (!params.get(key)) params.delete(key);
    });

    return `https://images.weserv.nl/?${params.toString()}`;
  } catch (error) {
    console.warn('Failed to build optimized URL, using original:', error);
    return originalUrl;
  }
};

const OptimizedImage = ({
  src,
  alt = '',
  width = 'auto',
  height = 'auto',
  quality = 80,
  lazy = true,
  blur = true,
  className = '',
  style = {},
  onLoad = () => {},
  onError = () => {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const imgRef = useRef(null);

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    if (!lazy || !imgRef.current || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (observer) observer.disconnect();
    };
  }, [lazy, isInView]);

  // Update src when props change or lazy loading triggers
  useEffect(() => {
    if (!src) {
      setCurrentSrc('');
      return;
    }

    if (isInView) {
      const optimizedUrl = buildOptimizedUrl(src, { width, height, quality });
      setCurrentSrc(optimizedUrl);
    }
  }, [src, isInView, width, height, quality]);

  // Handle image load
  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad(e);
  };

  // Handle image error - fallback to original URL
  const handleError = (e) => {
    console.warn('Optimized image failed to load, trying original URL:', currentSrc);
    
    // If we're already using the original URL, mark as error
    if (currentSrc === src) {
      setHasError(true);
      onError(e);
      return;
    }

    // Try original URL as fallback
    setCurrentSrc(src);
    setHasError(false);
  };

  // Blur placeholder SVG (tiny, loads instantly)
  const blurDataUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Cfilter id="b"%3E%3CfeGaussianBlur stdDeviation="20"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" fill="%23334155" filter="url(%23b)"/%3E%3C/svg%3E';

  // Determine which src to display
  const displaySrc = isInView ? currentSrc : (blur ? blurDataUrl : '');

  return (
    <img
      ref={imgRef}
      src={displaySrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      className={`
        transition-opacity duration-300
        ${isLoaded ? 'opacity-100' : 'opacity-70'}
        ${blur && !isLoaded && isInView ? 'blur-sm' : ''}
        ${hasError ? 'opacity-50' : ''}
        ${className}
      `.trim()}
      style={{
        ...style,
        ...(width !== 'auto' && { maxWidth: `${width}px` }),
        ...(height !== 'auto' && { maxHeight: `${height}px` })
      }}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      {...props}
    />
  );
};

export default OptimizedImage;
