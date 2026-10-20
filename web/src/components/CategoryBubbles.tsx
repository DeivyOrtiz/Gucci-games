'use client'

import Image from 'next/image'

export interface BubbleItem {
  id: string
  label: string
  sublabel: string
  tagline: string
  image: string
  bgGradient: string
  borderColor: string
  glowColor: string
  textColor: string
  category: 'mju' | 'retro'
  badge: string
  badgeBg: string
  badgeText: string
}

interface CategoryBubblesProps {
  activeCategory: string
  activePlatform?: string
  onSelect: (category?: 'general' | 'mju' | 'retro' | 'all', platform?: string) => void
}

export function CategoryBubbles({ activeCategory, onSelect }: CategoryBubblesProps) {
  const bubbles: BubbleItem[] = [
    {
      id: 'mju',
      label: 'MJU — Mi Juego Usado',
      sublabel: 'Consolas & Juegos Pre-Owned',
      tagline: '100% testeados con garantía oficial Gucci Games',
      image: '/images/logo-mju.png',
      bgGradient: 'from-[#221C06] via-[#141103] to-[#0A0801]',
      borderColor: '#FACC15',
      glowColor: 'rgba(250, 204, 21, 0.55)',
      textColor: '#FACC15',
      category: 'mju',
      badge: 'TOP USADOS',
      badgeBg: '#FACC15',
      badgeText: '#000000',
    },
    {
      id: 'retro',
      label: 'Retro Games Japón SCZ',
      sublabel: 'Joyas Clásicas Importadas',
      tagline: 'Super Famicom, Game Boy, SEGA Japón',
      image: '/images/logo-retro.png',
      bgGradient: 'from-[#0A1A30] via-[#06101E] to-[#03080F]',
      borderColor: '#0284C7',
      glowColor: 'rgba(2, 132, 199, 0.55)',
      textColor: '#38BDF8',
      category: 'retro',
      badge: 'IMPORT SCZ',
      badgeBg: '#0284C7',
      badgeText: '#FFFFFF',
    },
  ]

  return (
    <section className="w-full py-10 bg-zinc-100/60 dark:bg-[#0A0A0D] border-b border-zinc-200/60 dark:border-transparent transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4">
        {/* Title area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-[#FACC15] bg-amber-500/10 dark:bg-[#FACC15]/10 border border-amber-500/30 dark:border-[#FACC15]/30 px-4 py-1 rounded-full mb-3 shadow-xs dark:shadow-[0_0_15px_rgba(250,204,21,0.2)]">
            ✨ Secciones Exclusivas
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
            Categorías Destacadas
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-md mx-auto font-medium">
            Toca cualquiera de los dos botones para filtrar el catálogo al instante
          </p>
        </div>

        {/* The 2 Big Hero Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 md:gap-24">
          {bubbles.map((bubble) => {
            const active = activeCategory === bubble.category

            return (
              <button
                key={bubble.id}
                id={`bubble-btn-${bubble.id}`}
                onClick={() => onSelect(bubble.category, 'all')}
                className="group flex flex-col items-center cursor-pointer focus:outline-none transition-all active:scale-95 w-full sm:w-auto max-w-[280px]"
              >
                {/* Large Circular Button with Outer Border */}
                <div
                  className={`relative w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full p-2 transition-all duration-300 ${
                    active
                      ? 'scale-108 ring-6 ring-amber-500 dark:ring-[#FACC15]'
                      : 'group-hover:scale-108 group-hover:-translate-y-2 ring-3 ring-zinc-300 dark:ring-[#25252E]'
                  }`}
                  style={{
                    boxShadow: active
                      ? `0 15px 45px ${bubble.glowColor}`
                      : '0 10px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* Top Badge */}
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 text-[11px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg border border-black/20 whitespace-nowrap"
                    style={{
                      backgroundColor: bubble.badgeBg,
                      color: bubble.badgeText,
                    }}
                  >
                    {bubble.badge}
                  </span>

                  {/* Inner Circle Image Container */}
                  <div
                    className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br ${bubble.bgGradient} relative shadow-inner`}
                    style={{
                      border: `4px solid ${bubble.borderColor}`,
                    }}
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={bubble.image}
                        alt={bubble.label}
                        fill
                        priority
                        className="object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Main Title */}
                <h3 className="mt-5 text-lg sm:text-xl font-black text-zinc-950 dark:text-white group-hover:text-amber-600 dark:group-hover:text-[#FACC15] transition-colors tracking-tight text-center">
                  {bubble.label}
                </h3>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 tracking-tight text-center mt-0.5">
                  {bubble.sublabel}
                </p>

                {/* Tagline */}
                <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium text-center mt-1">
                  {bubble.tagline}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
