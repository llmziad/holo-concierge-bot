'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';

interface GalleryProps {
  images: string[];
  title: string;
}

export function Gallery({ images, title }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const validImages = images.length > 0 ? images : [''];

  const prev = useCallback(() => setCurrentIndex((i) => (i === 0 ? validImages.length - 1 : i - 1)), [validImages.length]);
  const next = useCallback(() => setCurrentIndex((i) => (i === validImages.length - 1 ? 0 : i + 1)), [validImages.length]);

  // Scroll active thumbnail into view
  useEffect(() => {
    const strip = thumbStripRef.current;
    if (!strip) return;
    const thumb = strip.children[currentIndex] as HTMLElement | undefined;
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentIndex]);

  // Focus the fullscreen overlay on open so keyboard nav works immediately
  useEffect(() => {
    if (fullscreen) overlayRef.current?.focus();
  }, [fullscreen]);

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setFullscreen(false);
    } else if (e.key === 'ArrowLeft') {
      prev();
    } else if (e.key === 'ArrowRight') {
      next();
    }
  };

  // Touch swipe support
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
  };

  return (
    <>
      <div
        className="relative aspect-[16/9] sm:aspect-[2/1] rounded-xl overflow-hidden bg-muted group"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {validImages[currentIndex] ? (
          <Image
            src={validImages[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 70vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No images available
          </div>
        )}

        {/* Controls — always visible on mobile, hover on desktop */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-mono tabular">
          {currentIndex + 1} / {validImages.length}
        </div>

        {/* Fullscreen button — always visible on mobile */}
        <button
          onClick={() => setFullscreen(true)}
          aria-label="View gallery fullscreen"
          className="absolute bottom-3 right-3 w-10 h-10 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <Expand className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnail strip — scrollable */}
      {validImages.length > 1 && (
        <div
          ref={thumbStripRef}
          className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1"
        >
          {validImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === currentIndex}
              className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden transition-all ${
                i === currentIndex
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : 'opacity-50 hover:opacity-80'
              }`}
            >
              {img ? (
                <Image
                  src={img}
                  alt={`${title} - Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen modal */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} image gallery`}
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center outline-none"
            onClick={() => setFullscreen(false)}
            onKeyDown={handleOverlayKeyDown}
          >
            <button
              onClick={() => setFullscreen(false)}
              aria-label="Close fullscreen"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted flex items-center justify-center z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {validImages[currentIndex] && (
                <Image
                  src={validImages[currentIndex]}
                  alt={title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              )}

              {validImages.length > 1 && (
                <>
                  <button onClick={prev} aria-label="Previous image" className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center active:scale-95">
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button onClick={next} aria-label="Next image" className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center active:scale-95">
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              {/* Counter in fullscreen */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-muted text-sm font-mono tabular">
                {currentIndex + 1} / {validImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
