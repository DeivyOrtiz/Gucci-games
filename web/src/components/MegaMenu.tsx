'use client'

import Image from 'next/image'
import { ChevronRight, Sparkles, ArrowRight } from 'lucide-react'
import type { NavCategory, SubCategoryItem } from './NavigationData'

interface MegaMenuProps {
  category: NavCategory
  onSelect: (category?: 'general' | 'mju' | 'retro' | 'all', platform?: string) => void
  onClose: () => void
}

export function MegaMenu({ category, onSelect, onClose }: MegaMenuProps) {
  const isMJU = category.id === 'mju'
  const isRetro = category.id === 'retro'

  const handleItemClick = (item: SubCategoryItem) => {
    onSelect(item.category ?? category.categoryFilter, item.platform)
    onClose()
  }

  const handleViewAll = () => {
    onSelect(category.categoryFilter)
    onClose()
  }

  return (
    <div
      role="region"
      aria-label={`Menú de ${category.label}`}
      className="absolute left-0 right-0 top-full pt-2 z-50 pointer-events-auto"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div
          className={`relative overflow-hidden rounded-2xl border backdrop-blur-2xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all ${
            isMJU
              ? 'bg-white/98 dark:bg-[#121215]/98 border-amber-400/50 dark:border-[#FACC15]/40 shadow-amber-500/10 dark:shadow-[0_0_40px_rgba(250,204,21,0.15)]'
              : isRetro
              ? 'bg-white/98 dark:bg-[#10131A]/98 border-sky-400/50 dark:border-[#38BDF8]/40 shadow-sky-500/10 dark:shadow-[0_0_40px_rgba(56,189,248,0.15)]'
              : 'bg-white/98 dark:bg-[#121215]/98 border-zinc-200 dark:border-[#27272A]'
          }`}
        >
          {/* Subtle top ambient glow */}
          <div
            className="absolute top-0 inset-x-0 h-1"
            style={{
              background: isMJU
                ? 'linear-gradient(90deg, transparent, #FACC15, transparent)'
                : isRetro
                ? 'linear-gradient(90deg, transparent, #38BDF8, transparent)'
                : 'linear-gradient(90deg, transparent, #EAB308, transparent)',
            }}
          />

          {/* Header Strip inside Mega Menu */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-zinc-200/80 dark:border-[#27272A]/70 bg-zinc-50 dark:bg-black/30">
            <div className="flex items-center gap-3">
              {category.iconImage ? (
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-zinc-200 dark:border-white/20 flex-shrink-0 shadow-xs">
                  <Image
                    src={category.iconImage}
                    alt={category.label}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-[#27272A] flex items-center justify-center text-lg flex-shrink-0">
                  {category.iconEmoji ?? '🎮'}
                </div>
              )}
              <div>
                <h3 className="text-base font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                  {category.label}
                  {isMJU && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 dark:bg-[#FACC15] text-black px-2 py-0.5 rounded-full shadow-xs">
                      Pre-Owned Verificado
                    </span>
                  )}
                  {isRetro && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#0284C7] text-white px-2 py-0.5 rounded-full shadow-xs">
                      Japón Import
                    </span>
                  )}
                </h3>
                {category.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{category.description}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleViewAll}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                isMJU
                  ? 'bg-amber-400 dark:bg-[#FACC15] text-black hover:bg-amber-500 dark:hover:bg-[#EAB308]'
                  : isRetro
                  ? 'bg-[#0284C7] text-white hover:bg-[#0369A1]'
                  : 'bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/20'
              }`}
            >
              <span>Ver todo el catálogo</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Mega Menu Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {category.columns.map((column, colIdx) => (
              <div key={colIdx} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-[#27272A]/80">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isMJU ? 'bg-amber-500 dark:bg-[#FACC15]' : isRetro ? 'bg-sky-500 dark:bg-[#38BDF8]' : 'bg-zinc-400'
                    }`}
                  />
                  <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                    {column.title}
                  </h4>
                </div>

                <ul className="space-y-1">
                  {column.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <button
                        onClick={() => handleItemClick(item)}
                        className="group w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#202026] transition-all cursor-pointer"
                      >
                        <span className="group-hover:translate-x-1 transition-transform flex items-center gap-2">
                          <ChevronRight
                            size={12}
                            className={`opacity-40 group-hover:opacity-100 transition-opacity ${
                              isMJU ? 'text-amber-600 dark:text-[#FACC15]' : isRetro ? 'text-sky-600 dark:text-[#38BDF8]' : 'text-zinc-400'
                            }`}
                          />
                          <span className="font-medium">{item.label}</span>
                        </span>

                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                              item.badge === 'Garantía' || item.badge === 'Certificado'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-[#10B981] border border-emerald-500/30'
                                : item.badge === 'Japón' || item.badge === 'Colección'
                                ? 'bg-sky-500/15 text-sky-700 dark:text-[#38BDF8] border border-sky-500/30'
                                : item.badge === 'Hot' || item.badge === 'Nuevo'
                                ? 'bg-rose-500/15 text-rose-700 dark:text-[#F87171] border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-700 dark:text-[#FACC15] border border-amber-500/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Quick Footer banner inside mega menu */}
          <div className="px-6 py-3 bg-zinc-50 dark:bg-[#0A0A0D] border-t border-zinc-200 dark:border-[#27272A]/70 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-amber-600 dark:text-[#FACC15]" />
              <span>Gana Puntos Gucci con cada compra y canjéalos en tu próximo juego.</span>
            </div>
            <span className="hidden sm:inline font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
              Gucci Games Oficial
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
