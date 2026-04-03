'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface LightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
        style={{ color: '#9ca3af' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#C49A3C')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
        aria-label="Kapat"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex((p) => (p > 0 ? p - 1 : images.length - 1)); }}
          className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
          style={{ color: '#9ca3af' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#C49A3C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
          aria-label="Önceki"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div
        className="relative w-full h-full mx-16 my-16"
        style={{ maxWidth: '1200px', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[currentIndex]}
          alt={`Görsel ${currentIndex + 1}`}
          fill
          className="object-contain"
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex((p) => (p < images.length - 1 ? p + 1 : 0)); }}
          className="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
          style={{ color: '#9ca3af' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#C49A3C')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
          aria-label="Sonraki"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs" style={{ color: 'rgba(196,154,60,0.6)' }}>
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
