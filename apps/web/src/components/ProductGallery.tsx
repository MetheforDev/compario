'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from './Lightbox';

interface ProductGalleryProps {
  mainImage: string;
  images: string[];
  productName: string;
}

export default function ProductGallery({ mainImage, images, productName }: ProductGalleryProps) {
  const allImages = [mainImage, ...images.filter((img) => img !== mainImage)];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      {/* Main image */}
      <button
        type="button"
        className="relative w-full rounded-xl overflow-hidden group cursor-zoom-in"
        style={{ height: '420px' }}
        onClick={() => setLightboxIndex(selectedIndex)}
        aria-label="Görseli büyüt"
      >
        <Image
          src={allImages[selectedIndex]}
          alt={productName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(8,9,14,0.6) 0%, transparent 50%)' }}
        />
        {/* Zoom hint */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.25)' }}
        >
          <svg width="48" height="48" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
          </svg>
        </div>
      </button>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className="relative flex-shrink-0 rounded-lg overflow-hidden transition-all"
              style={{
                width: '72px',
                height: '56px',
                border: selectedIndex === idx
                  ? '2px solid rgba(196,154,60,0.8)'
                  : '2px solid rgba(255,255,255,0.08)',
                opacity: selectedIndex === idx ? 1 : 0.55,
              }}
              aria-label={`Görsel ${idx + 1}`}
            >
              <Image src={img} alt={`${productName} ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={allImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
