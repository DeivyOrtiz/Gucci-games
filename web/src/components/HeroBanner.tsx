'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, MessageCircle, Sparkles } from 'lucide-react'

export interface BannerSlide {
  id: string
  title: string
  subtitle: string
  image: string
  searchQuery: string
  category: 'general' | 'mju' | 'retro'
  accentColor: string
  ctaText: string
  tags: string[]
  icon: string
}

const slides: BannerSlide[] = [
  {
    id: 'fc27',
    title: 'EA SPORTS FC 27',
    subtitle: 'El Club de Todos · PlayStation 5',
    image: '/images/banners/banner-fc27.png',
    searchQuery: 'FC',
    category: 'general',
    accentColor: '#38BDF8',
    ctaText: 'Jugar Ahora',
    tags: ['sports', 'football', 'multiplayer'],
    icon: '⚽',
  },
  {
    id: 'gtavi',
    title: 'Grand Theft Auto VI',
    subtitle: 'Vice City Next-Gen · PlayStation 5',
    image: '/images/banners/banner-gtavi.png',
    searchQuery: 'GTA',
    category: 'general',
    accentColor: '#EC4899',
    ctaText: 'Reservalo Ya',
    tags: ['open world', 'action', 'crime'],
    icon: '⭐',
  },
  {
    id: 'nba2k27',
    title: 'NBA 2K27',
    subtitle: 'Siente la Gloria en la Cancha · PlayStation 5',
    image: '/images/banners/banner-nba2k27.png',
    searchQuery: 'NBA',
    category: 'general',
    accentColor: '#F97316',
    ctaText: 'Comprar Ahora',
    tags: ['sports', 'basketball', 'simulation'],
    icon: '🏀',
  },
  {
    id: 'minecraft',
    title: 'Minecraft',
    subtitle: 'Construye y Sobrevive · PlayStation 5',
    image: '/images/banners/banner-minecraft.png',
    searchQuery: 'Minecraft',
    category: 'general',
    accentColor: '#10B981',
    ctaText: 'Descubrir Más',
    tags: ['sandbox', 'survival', 'crafting'],
    icon: '⛏️',
  },
]

interface HeroBannerProps {
  onCategoryFilter?: (category: 'general' | 'mju' | 'retro' | 'all') => void
  onSearch?: (query: string) => void
}

export function HeroBanner({ onCategoryFilter, onSearch }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const goToNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const goToPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  const goToSlide = (index: number) => {
    setCurrent(index)
  }

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return

    timerRef.current = setInterval(() => {
      goToNext()
    }, 5500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [goToNext, isPaused])

  const currentSlide = slides[current]
  const whatsAppNumber = '59177617306'

  const handleBannerClick = () => {
    if (onSearch) {
      onSearch(currentSlide.searchQuery)
    } else if (onCategoryFilter) {
      onCategoryFilter(currentSlide.category)
    }
  }

  return (
    <section
      className="w-full bg-[#F8F9FA] dark:bg-[#0A0A0D] py-3 sm:py-5 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
        {/* Banner Card Frame */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[2.35/1] min-h-[190px] sm:min-h-[290px] md:min-h-[380px] lg:min-h-[460px] max-h-[560px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl dark:shadow-[0_15px_40px_rgba(0,0,0,0.7)] border border-zinc-200/90 dark:border-zinc-800/90 bg-black select-none group">
          {/* Slides Stack with Cross-Dissolve */}
          {slides.map((slide, index) => {
            const isActive = index === current

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Ambient Blurred Glow Backdrop */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    priority={index === 0}
                    className="object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
                </div>

                {/* Main Crisp Banner Graphic (exact graphic uploaded by user) */}
                <div
                  onClick={handleBannerClick}
                  className="relative w-full h-full cursor-pointer flex items-center justify-center"
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={index < 2}
                    unoptimized
                    quality={100}
                    className="object-cover sm:object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                    sizes="(max-width: 768px) 100vw, 1280px"
                  />
                </div>
              </div>
            )
          })}

          {/* Quick Direct WhatsApp Order Pill (top-right floating) */}
          <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 flex items-center gap-2">
            <a
              href={`https://api.whatsapp.com/send/?phone=${whatsAppNumber}&text=${encodeURIComponent(
                `¡Hola Gucci Games! Quisiera consultar precio y disponibilidad de ${currentSlide.title} (PS5) 🎮`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-black/75 hover:bg-[#25D366] text-white hover:text-black border border-white/20 hover:border-transparent px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-black backdrop-blur-md transition-all shadow-lg active:scale-95"
            >
              <MessageCircle size={14} className="text-[#25D366] group-hover:text-black" />
              <span>Pedir por WhatsApp</span>
            </a>
          </div>

          {/* Navigation Arrows (Left & Right) */}
          <button
            onClick={goToPrev}
            aria-label="Banner anterior"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/25 flex items-center justify-center backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer shadow-lg"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={goToNext}
            aria-label="Banner siguiente"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/25 flex items-center justify-center backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer shadow-lg"
          >
            <ChevronRight size={22} />
          </button>


        </div>
      </div>
    </section>
  )
}
