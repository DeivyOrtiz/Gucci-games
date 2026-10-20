'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  X,
  ChevronRight,
  ArrowLeft,
  Store,
  MapPin,
  Gamepad2,
  Tv,
  Headphones,
  Download,
  Repeat,
  Sparkles,
  Zap,
  User,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'

interface SubCategoryItem {
  label: string
  category?: 'general' | 'mju' | 'retro' | 'all'
  platform?: string
  badge?: string
}

interface DrawerCategory {
  id: string
  label: string
  categoryFilter?: 'general' | 'mju' | 'retro' | 'all'
  badge?: string
  badgeBg?: string
  badgeColor?: string
  image?: string
  icon?: React.ReactNode
  subItems: SubCategoryItem[]
}

const DRAWER_CATEGORIES: DrawerCategory[] = [
  {
    id: 'mju',
    label: 'MJU – Mi Juego Usado',
    categoryFilter: 'mju',
    badge: 'NUEVO',
    badgeBg: '#FACC15',
    badgeColor: '#000000',
    image: '/images/logo-mju.png',
    subItems: [
      { label: 'PlayStation 5 Usadas', category: 'mju', platform: 'PS5', badge: 'Garantía' },
      { label: 'PlayStation 4 Usadas', category: 'mju', platform: 'PS4' },
      { label: 'Nintendo Switch Usadas', category: 'mju', platform: 'Nintendo Switch', badge: 'Top Ventas' },
      { label: 'Xbox Series Usadas', category: 'mju', platform: 'Xbox Series X' },
      { label: 'Juegos PS5 Pre-Owned', category: 'mju', platform: 'PS5' },
      { label: 'Juegos PS4 Pre-Owned', category: 'mju', platform: 'PS4' },
      { label: 'Juegos Switch Pre-Owned', category: 'mju', platform: 'Nintendo Switch' },
      { label: 'Ver Todo en MJU', category: 'mju' },
    ],
  },
  {
    id: 'retro-scz',
    label: 'Retro Games Japón SCZ',
    categoryFilter: 'retro',
    image: '/images/logo-retro.png',
    subItems: [
      { label: 'Super Famicom / SNES Japón', category: 'retro', platform: 'SNES', badge: 'Japón' },
      { label: 'Nintendo 64 Japón', category: 'retro', platform: 'Nintendo 64' },
      { label: 'Game Boy & Color & Advance', category: 'retro', platform: 'Game Boy', badge: 'Colección' },
      { label: 'SEGA Mega Drive / Saturn', category: 'retro', platform: 'SEGA Genesis' },
      { label: 'PlayStation 1 & 2 Japón', category: 'retro', platform: 'Otros' },
      { label: 'Cartuchos CIB en Caja', category: 'retro', badge: 'Coleccionista' },
      { label: 'Ver Todo Retro Japón', category: 'retro' },
    ],
  },
  {
    id: 'videojuegos',
    label: 'Videojuegos',
    categoryFilter: 'general',
    icon: <Gamepad2 size={18} className="text-zinc-600 dark:text-zinc-300" />,
    subItems: [
      { label: 'PlayStation 5 (PS5)', category: 'general', platform: 'PS5' },
      { label: 'Nintendo Switch', category: 'general', platform: 'Nintendo Switch' },
      { label: 'PlayStation 4 (PS4)', category: 'general', platform: 'PS4' },
      { label: 'Xbox Series X/S', category: 'general', platform: 'Xbox Series X' },
      { label: 'Preventas & Reservas', category: 'general', badge: 'Próximo' },
      { label: 'Ver Todos los Videojuegos', category: 'general' },
    ],
  },
  {
    id: 'consolas',
    label: 'Consolas & Hardware',
    categoryFilter: 'general',
    icon: <Tv size={18} className="text-zinc-600 dark:text-zinc-300" />,
    subItems: [
      { label: 'PlayStation 5 Slim Standard', category: 'general', platform: 'PS5' },
      { label: 'PlayStation 5 Slim Digital', category: 'general', platform: 'PS5' },
      { label: 'PlayStation 5 Pro', category: 'general', platform: 'PS5', badge: 'Nuevo' },
      { label: 'Nintendo Switch OLED', category: 'general', platform: 'Nintendo Switch' },
      { label: 'Nintendo Switch Lite', category: 'general', platform: 'Nintendo Switch' },
      { label: 'Xbox Series X 1TB', category: 'general', platform: 'Xbox Series X' },
      { label: 'Xbox Series S 512GB', category: 'general', platform: 'Xbox Series X' },
      { label: 'Ver Todas las Consolas', category: 'general' },
    ],
  },
  {
    id: 'accesorios',
    label: 'Accesorios & Mandos',
    categoryFilter: 'general',
    icon: <Headphones size={18} className="text-zinc-600 dark:text-zinc-300" />,
    subItems: [
      { label: 'Mandos DualSense PS5', category: 'general', platform: 'PS5' },
      { label: 'Mandos Xbox Wireless', category: 'general', platform: 'Xbox Series X' },
      { label: 'Joy-Con Nintendo Switch', category: 'general', platform: 'Nintendo Switch' },
      { label: 'Headsets Gamer Pulse 3D', category: 'general' },
      { label: 'Cables & Adaptadores Retro', category: 'retro' },
      { label: 'Ver Todos los Accesorios', category: 'general' },
    ],
  },
  {
    id: 'digital',
    label: 'Digital & Tarjetas Prepago',
    categoryFilter: 'general',
    icon: <Download size={18} className="text-zinc-600 dark:text-zinc-300" />,
    subItems: [
      { label: 'PlayStation Store Gift Cards', category: 'general', platform: 'PS5' },
      { label: 'Nintendo eShop Cards', category: 'general', platform: 'Nintendo Switch' },
      { label: 'Xbox Game Pass Ultimate', category: 'general', platform: 'Xbox Series X' },
      { label: 'Suscripciones Online', category: 'general' },
    ],
  },
  {
    id: 'tradein',
    label: 'Trade-In / Vender mi Juego',
    categoryFilter: 'mju',
    icon: <Repeat size={18} className="text-zinc-600 dark:text-zinc-300" />,
    badge: 'CASH / PUNTOS',
    badgeBg: '#10B981',
    badgeColor: '#FFFFFF',
    subItems: [
      { label: 'Cotizar Juegos Usados (MJU)', category: 'mju' },
      { label: 'Cotizar Consolas Usadas', category: 'mju' },
      { label: 'Canjear por Puntos Gucci', category: 'mju' },
      { label: 'Condiciones y Testeo Oficial', category: 'mju' },
    ],
  },
  {
    id: 'retro-classic',
    label: 'Retro Nostalgia SCZ',
    categoryFilter: 'retro',
    icon: <Sparkles size={18} className="text-zinc-600 dark:text-zinc-300" />,
    subItems: [
      { label: 'PlayStation 2 Clásica', category: 'retro', platform: 'Otros' },
      { label: 'Super Nintendo (SNES)', category: 'retro', platform: 'SNES' },
      { label: 'Nintendo 64', category: 'retro', platform: 'Nintendo 64' },
      { label: 'Game Boy', category: 'retro', platform: 'Game Boy' },
      { label: 'SEGA Genesis', category: 'retro', platform: 'SEGA Genesis' },
      { label: 'Ver Todo Clásicos', category: 'retro' },
    ],
  },
]

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (category?: 'general' | 'mju' | 'retro' | 'all', platform?: string) => void
  onOpenAuth: () => void
}

export function MobileDrawer({ isOpen, onClose, onSelect, onOpenAuth }: MobileDrawerProps) {
  const { profile, signOut } = useAuth()
  const [activeCategory, setActiveCategory] = useState<DrawerCategory | null>(null)

  // Reset to panel 1 whenever drawer closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setActiveCategory(null), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCategoryClick = (cat: DrawerCategory) => {
    setActiveCategory(cat)
  }

  const handleBack = () => {
    setActiveCategory(null)
  }

  const handleItemSelect = (item: SubCategoryItem, fallbackCat?: 'general' | 'mju' | 'retro' | 'all') => {
    onSelect(item.category ?? fallbackCat, item.platform)
    onClose()
  }

  const whatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '59177617306'

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dark backdrop curtain */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sliding Drawer Container */}
      <div className="relative w-[360px] max-w-[88vw] h-full bg-white dark:bg-[#121215] text-zinc-900 dark:text-white shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-left duration-300 border-r border-zinc-200 dark:border-[#222228] transition-colors duration-200">
        {/* Top Header Row with Title 'Menu' and Circular '✕' */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-zinc-100 dark:border-transparent">
          <h2 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">Menu</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-[#202026] text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X size={17} />
          </button>
        </div>

        {/* Sliding 2-Panel View Track */}
        <div className="flex-1 relative overflow-hidden">
          <div
            className="w-[200%] h-full flex transition-transform duration-300 ease-out"
            style={{
              transform: activeCategory ? 'translateX(-50%)' : 'translateX(0%)',
            }}
          >
            {/* PANEL 1 */}
            <div className="w-1/2 h-full flex flex-col overflow-y-auto px-4 py-2 space-y-3 pb-32 hide-scrollbar">
              {/* Theme Toggle option */}
              <div className="pt-1">
                <ThemeToggle variant="expanded" id="drawer-theme-toggle" />
              </div>

              {/* Store Official Box Card */}
              <div className="bg-zinc-100 dark:bg-[#1A1A22] border border-zinc-200 dark:border-[#2A2A35] rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-[#262632] flex items-center justify-center text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                    <Store size={19} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                      Gucci Games SCZ - TIENDA OFICIAL
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Puntos Gucci: {profile ? profile.gucci_points.toLocaleString() : '500'} pts
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Abierto</span>
                </div>
              </div>

              {/* Seguimiento de Pedido Row */}
              <a
                href={`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent('Hola Gucci Games! Quisiera consultar el seguimiento de mi pedido.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#1A1A22] transition-colors text-sm font-semibold cursor-pointer"
              >
                <MapPin size={18} className="text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
                <span>Seguimiento de Pedido</span>
              </a>

              {/* Section Header: Comprar por Categoría */}
              <div className="pt-2">
                <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white px-1">
                  Comprar por Categoría
                </h3>

                {/* Highlight Red/Gold Offers */}
                <div className="px-1 py-1 text-sm font-black tracking-tight">
                  <span className="text-red-600 dark:text-red-500">Ofertas de Temporada</span>
                  <span className="text-zinc-400 dark:text-zinc-500 mx-1.5">/</span>
                  <span className="text-amber-600 dark:text-amber-400">Puntos Dobles</span>
                </div>
              </div>

              {/* Categorías List */}
              <div className="space-y-0.5 pt-1">
                {DRAWER_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className="w-full flex items-center justify-between px-2.5 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#1A1A22] transition-colors text-left text-sm font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {cat.image ? (
                        <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-white/20">
                          <Image
                            src={cat.image}
                            alt={cat.label}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                          {cat.icon}
                        </div>
                      )}

                      <span className="truncate group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                        {cat.label}
                      </span>

                      {cat.badge && (
                        <span
                          className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 shadow-xs"
                          style={{
                            backgroundColor: cat.badgeBg ?? '#FACC15',
                            color: cat.badgeColor ?? '#000000',
                          }}
                        >
                          {cat.badge}
                        </span>
                      )}
                    </div>

                    <ChevronRight size={17} className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>

              {/* TikTok Official Channels in Mobile Drawer */}
              <div className="pt-4 border-t border-zinc-200 dark:border-[#22222B]">
                <p className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2 px-1 flex items-center gap-1.5">
                  <span>📱 Síguenos en TikTok</span>
                </p>
                <div className="space-y-1.5">
                  <a
                    href="https://www.tiktok.com/@guccigamesbo?_r=1&_t=ZS-9AMXkn1hru5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-[#16161E] hover:bg-zinc-200 dark:hover:bg-[#1E1E28] text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>@guccigamesbo (Tienda)</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">Ver ›</span>
                  </a>
                  <a
                    href="https://www.tiktok.com/@retrogamesjaponscz?_r=1&_t=ZS-9AMXl7XfEuM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-[#16161E] hover:bg-zinc-200 dark:hover:bg-[#1E1E28] text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                      <span>@retrogamesjaponscz (Retro)</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">Ver ›</span>
                  </a>
                  <a
                    href="https://www.tiktok.com/@mijuegousado?_r=1&_t=ZS-9AMXmfdk7Ec"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-[#16161E] hover:bg-zinc-200 dark:hover:bg-[#1E1E28] text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>@mijuegousado (MJU)</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">Ver ›</span>
                  </a>
                </div>
              </div>
            </div>

            {/* PANEL 2: SUBCATEGORÍAS & CONSOLAS DESLIZADAS */}
            <div className="w-1/2 h-full flex flex-col overflow-y-auto px-4 py-2 space-y-3 pb-32 hide-scrollbar">
              {activeCategory && (
                <>
                  {/* Back button */}
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-100 dark:bg-[#1C1C24] text-xs font-bold text-amber-600 dark:text-[#FACC15] hover:bg-zinc-200 dark:hover:bg-[#252530] transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    <span>Volver a Menú</span>
                  </button>

                  {/* Header of Active Category */}
                  <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-[#181822] border border-zinc-200 dark:border-[#2B2B38]">
                    <div className="flex items-center gap-2.5">
                      {activeCategory.image ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-white/20">
                          <Image
                            src={activeCategory.image}
                            alt={activeCategory.label}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center">
                          {activeCategory.icon}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-black text-zinc-950 dark:text-white">{activeCategory.label}</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Selecciona tu consola o sección</p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-items list */}
                  <div className="space-y-1">
                    {activeCategory.subItems.map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleItemSelect(sub, activeCategory.categoryFilter)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#16161D] border border-zinc-200 dark:border-[#22222C] hover:border-amber-400 dark:hover:border-zinc-500 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer"
                      >
                        <span className="truncate">{sub.label}</span>
                        {sub.badge && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/15 dark:bg-[#FACC15]/20 text-amber-700 dark:text-[#FACC15] border border-amber-500/30 dark:border-[#FACC15]/30">
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-zinc-50 dark:bg-[#121215] border-t border-zinc-200 dark:border-[#222228] z-20 transition-colors duration-200">
          {profile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-500 dark:bg-zinc-800 border border-amber-600/30 dark:border-zinc-700 flex items-center justify-center text-sm font-bold text-black dark:text-white flex-shrink-0">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{profile.username}</p>
                  <p className="text-[11px] text-amber-600 dark:text-[#FACC15] font-black">{profile.gucci_points.toLocaleString()} pts</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {profile.role === 'admin' && (
                  <a href="/admin" className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-amber-600 dark:text-[#FACC15] text-xs font-bold">
                    <Shield size={14} />
                  </a>
                )}
                <button
                  onClick={() => {
                    signOut()
                    onClose()
                  }}
                  className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                >
                  Salir
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => {
                  onClose()
                  onOpenAuth()
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#1A1A22] transition-colors text-left cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-[#1F1F28] border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-sm font-black text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors flex-shrink-0">
                  <User size={16} />
                </div>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                  Iniciar Sesión / Registrarse
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
