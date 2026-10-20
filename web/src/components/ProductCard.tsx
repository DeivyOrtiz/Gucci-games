'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Zap } from 'lucide-react'
import type { Product } from '@/lib/types'
import { buildWhatsAppLink, CATEGORY_LABELS } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { parseStockFromDescription } from '@/lib/stockUtils'

interface ProductCardProps {
  product: Product
  onAuthRequired?: () => void
  onBuy?: (product: Product) => void
}

export function ProductCard({ product, onAuthRequired, onBuy }: ProductCardProps) {
  const { profile } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleBuy = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (onBuy) {
      onBuy(product)
      return
    }
    const url = buildWhatsAppLink(product, profile?.username || 'Cliente')
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const categoryStyles = {
    general: {
      bg: 'bg-amber-500/15 dark:bg-[#FACC15]/15',
      text: 'text-amber-700 dark:text-[#FACC15]',
      border: 'border-amber-500/40 dark:border-[#FACC15]/40',
      glow: 'shadow-[0_10px_25px_rgba(245,158,11,0.2)] dark:shadow-[0_0_25px_rgba(250,204,21,0.2)]',
    },
    mju: {
      bg: 'bg-amber-500/20 dark:bg-[#FACC15]/20',
      text: 'text-amber-800 dark:text-[#FACC15]',
      border: 'border-amber-500/50 dark:border-[#FACC15]/50',
      glow: 'shadow-[0_10px_25px_rgba(245,158,11,0.25)] dark:shadow-[0_0_25px_rgba(250,204,21,0.25)]',
    },
    retro: {
      bg: 'bg-sky-500/15 dark:bg-[#0284C7]/20',
      text: 'text-sky-700 dark:text-[#38BDF8]',
      border: 'border-sky-500/50 dark:border-[#0284C7]/50',
      glow: 'shadow-[0_10px_25px_rgba(2,132,199,0.25)] dark:shadow-[0_0_25px_rgba(2,132,199,0.25)]',
    },
  }

  const style = categoryStyles[product.category]

  return (
    <div
      className={`group relative flex flex-col bg-white dark:bg-[#141419] border border-zinc-200 dark:border-[#25252E] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-amber-400 dark:hover:border-[#FACC15]/60 ${
        isHovered ? style.glow : ''
      }`}
      onClick={() => product.is_available && handleBuy()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-[#0A0A0D]">
        {!imgError && product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-100 dark:bg-[#0A0A0D]">
            <span className="text-4xl">🎮</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 text-center px-4 font-semibold">{product.title}</span>
          </div>
        )}

        {/* Category Badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${style.bg} ${style.text} ${style.border} shadow-xs backdrop-blur-md`}>
          {CATEGORY_LABELS[product.category]}
        </div>

        {/* Platform Badge */}
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-xs font-bold text-white border border-white/10 shadow-xs">
          {product.platform}
        </div>

        {/* Unavailable overlay */}
        {!product.is_available && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              No Disponible
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2.5 p-4 flex-1 bg-white dark:bg-[#141419] transition-colors">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-[#FACC15] transition-colors">
          {product.title}
        </h3>

        {/* Points Reward Tag */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-[#FACC15]/10 border border-amber-500/25 dark:border-[#FACC15]/25 rounded-lg px-2.5 py-1 w-fit">
          <Zap size={12} className="text-amber-600 dark:text-[#FACC15]" fill="currentColor" />
          <span className="text-amber-700 dark:text-[#FACC15] text-xs font-bold">
            +{product.points_reward} Puntos Gucci
          </span>
        </div>

        {/* Stock status indicator */}
        {(() => {
          const { stock } = parseStockFromDescription(product.description);
          return (
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {product.is_available && stock > 0 ? (
                stock <= 2 ? (
                  <span className="text-amber-500 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    ¡Solo quedan {stock}!
                  </span>
                ) : (
                  <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {stock} disponibles
                  </span>
                )
              ) : (
                <span className="text-red-500 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Agotado
                </span>
              )}
            </div>
          );
        })()}

        {/* Price + Button */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-100 dark:border-[#22222A]">
          <span className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
            Bs. {product.price.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
          <button
            id={`buy-btn-${product.id}`}
            onClick={handleBuy}
            disabled={!product.is_available}
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebc59] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          >
            <ShoppingCart size={13} />
            Comprar
          </button>
        </div>
      </div>
    </div>
  )
}
