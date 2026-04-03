'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from './Lightbox';

interface NewsGalleryProps {
  images: string[];
  title: string;
}

export default function NewsGallery({ images, title }: NewsGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="mb-10">
        <h2 className="font-mono text-[10px] text-gray-600 uppercase tracking-wider mb-4">
          Görsel Galerisi ({images.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className="relative aspect-video rounded overflow-hidden group cursor-pointer border border-[rgba(0,255,247,0.1)] hover:border-neon-cyan/40 transition-colors text-left"
              onClick={() => setLightboxIndex(idx)}
              aria-label={`${title} — görsel ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${title} — görsel ${idx + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.35)' }}
              >
                <svg width="32" height="32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
