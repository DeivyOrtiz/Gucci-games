'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from './ProductCard'
import type { Product } from '@/lib/types'

interface ProductSliderProps {
  title: string
  subtitle?: string
  products: Product[]
  accentColor?: string
  onAuthRequired?: () => void
  onBuy?: (product: Product) => void
}

export function ProductSlider({
  title,
  subtitle,
  products,
  accentColor = '#FACC15',
  onAuthRequired,
  onBuy,
}: ProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = direction === 'left' ? -320 : 320
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          {title && (
            <h2 className="text-xl md:text-2xl font-black text-zinc-950 dark:text-white flex items-center">
              {title}
              <span
                className="inline-block w-2.5 h-2.5 rounded-full ml-2 animate-pulse shadow-sm"
                style={{ backgroundColor: accentColor }}
              />
            </h2>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
        {/* Nav Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-[#181822] border border-zinc-200 dark:border-[#2E2E3C] shadow-xs flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-amber-500 dark:hover:border-[#FACC15] transition-all cursor-pointer"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-[#181822] border border-zinc-200 dark:border-[#2E2E3C] shadow-xs flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-amber-500 dark:hover:border-[#FACC15] transition-all cursor-pointer"
            aria-label="Siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-48 sm:w-56 snap-start"
          >
            <ProductCard
              product={product}
              onAuthRequired={onAuthRequired}
              onBuy={onBuy}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
