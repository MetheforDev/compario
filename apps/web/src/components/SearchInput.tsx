'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchInputProps {
  initialValue?: string;
  size?: 'default' | 'sm';
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  initialValue = '',
  size = 'default',
  placeholder = 'Ürün veya haber ara...',
  autoFocus = false,
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const isSmall = size === 'sm';

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center">
        {/* Search icon */}
        <svg
          className={`absolute left-4 text-gray-600 pointer-events-none flex-shrink-0 ${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full bg-[#0c0c16] border border-[rgba(0,255,247,0.15)] rounded-lg font-mono text-gray-300 placeholder-gray-700
                      focus:outline-none focus:border-neon-cyan/50 focus:bg-[#0d0d1a] transition-all
                      ${isSmall ? 'pl-9 pr-20 py-2 text-xs' : 'pl-11 pr-28 py-3.5 text-sm'}`}
        />

        <button
          type="submit"
          disabled={value.trim().length < 2}
          className={`absolute right-2 font-mono uppercase tracking-wider transition-all
                      ${isSmall ? 'text-[10px] px-2.5 py-1' : 'text-xs px-4 py-2'}
                      bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded
                      hover:bg-neon-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          Ara
        </button>
      </div>
    </form>
  );
}
