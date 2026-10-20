'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Search,
  User,
  Zap,
  ChevronDown,
  LogOut,
  Shield,
  Menu,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { MobileDrawer } from './MobileDrawer'
import { MegaMenu } from './MegaMenu'
import { NAV_CATEGORIES, type NavCategory } from './NavigationData'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  onSearch?: (query: string) => void
  onSelectCategory?: (category?: 'general' | 'mju' | 'retro' | 'all', platform?: string) => void
  activeCategory?: string
  activePlatform?: string
}

export function Header({
  onSearch,
  onSelectCategory,
  activeCategory = 'all',
}: HeaderProps) {
  const { profile, signOut } = useAuth()
  const router = useRouter()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const logoClicksRef = useRef(0)
  const logoTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Secret keyboard shortcut: Ctrl+Shift+A or Alt+A opens Admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
        (e.altKey && (e.key === 'A' || e.key === 'a'))
      ) {
        e.preventDefault()
        router.push('/admin')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  // Secret logo triple-click to open Admin
  const handleLogoClick = (e: React.MouseEvent) => {
    logoClicksRef.current += 1
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current)

    if (logoClicksRef.current >= 3) {
      e.preventDefault()
      logoClicksRef.current = 0
      router.push('/admin')
      return
    }

    logoTimerRef.current = setTimeout(() => {
      logoClicksRef.current = 0
    }, 1200)

    onSelectCategory?.('all')
  }
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Desktop Mega Menu Hover State
  const [hoveredCategory, setHoveredCategory] = useState<NavCategory | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (cat: NavCategory) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setHoveredCategory(cat)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
    }, 200)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const handleCategoryClick = (cat: NavCategory) => {
    onSelectCategory?.(cat.categoryFilter)
    setHoveredCategory(null)
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0D0D11]/95 backdrop-blur-2xl border-b border-zinc-200 dark:border-[#25252E] shadow-xs dark:shadow-xl transition-colors duration-200">
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Left: Hamburger Icon with "Menu" label underneath */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              id="gamestop-menu-trigger"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center p-1.5 text-amber-600 dark:text-[#FACC15] hover:text-zinc-950 dark:hover:text-white hover:scale-105 transition-all cursor-pointer group"
              aria-label="Abrir Menú"
              title="Abrir Menú"
            >
              <Menu size={24} className="stroke-[2.5] text-amber-600 dark:text-[#FACC15] group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              <span className="text-[10px] font-black tracking-tight leading-none mt-0.5 text-zinc-800 dark:text-white uppercase group-hover:text-amber-600 dark:group-hover:text-[#FACC15] transition-colors">
                Menu
              </span>
            </button>

            {/* Brand Logo (Triple-click secret admin entrance) */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-2 group flex-shrink-0"
              title="Gucci Games"
            >
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-amber-500/50 dark:border-[#FACC15] shadow-xs dark:shadow-[0_0_15px_rgba(250,204,21,0.3)] flex-shrink-0 bg-black">
                <Image
                  src="/images/logo-gucci.png"
                  alt="Gucci Games"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tighter uppercase font-sans">
                Gucci<span className="text-amber-600 dark:text-[#FACC15]">Games</span>
              </span>
            </Link>
          </div>

          {/* Center: Wide Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-3 sm:mx-6">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"
              />
              <input
                id="search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  onSearch?.(e.target.value)
                }}
                placeholder="Search games, consoles & more"
                className="w-full bg-zinc-100 dark:bg-[#181822] border border-zinc-200 dark:border-[#2D2D3A] rounded-xl text-zinc-900 dark:text-white pl-10 pr-4 py-2 text-sm placeholder-zinc-500 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-[#181822] focus:border-amber-500 dark:focus:border-[#FACC15] focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-[#FACC15]/20 transition-all"
              />
            </div>
          </form>

          {/* Right: Theme Toggle & User / Profile Area */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Theme Toggle Button (Light / Dark) */}
            <ThemeToggle id="header-theme-toggle" />

            {profile ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-zinc-100 dark:bg-[#1A1A24] hover:bg-zinc-200 dark:hover:bg-[#222230] border border-zinc-200 dark:border-[#2E2E3C] rounded-xl px-3 py-1.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 bg-amber-500 dark:bg-[#FACC15] text-black font-black text-xs rounded-lg flex items-center justify-center shadow-xs">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>

                  <span className="hidden md:block text-xs font-bold text-zinc-900 dark:text-white max-w-[100px] truncate">
                    {profile.username}
                  </span>

                  <div className="hidden sm:flex items-center gap-1 bg-amber-500/15 dark:bg-[#FACC15]/20 text-amber-700 dark:text-[#FACC15] text-[11px] font-black px-2 py-0.5 rounded-lg border border-amber-500/30 dark:border-[#FACC15]/30">
                    <Zap size={11} fill="currentColor" />
                    <span>{profile.gucci_points.toLocaleString()} pts</span>
                  </div>

                  <ChevronDown
                    size={14}
                    className={`text-zinc-500 dark:text-zinc-400 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#16161F] border border-zinc-200 dark:border-[#2B2B38] rounded-2xl shadow-xl dark:shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-3 border-b border-zinc-100 dark:border-[#252530] bg-zinc-50 dark:bg-[#101016]">
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Puntos Gucci</p>
                        <p className="text-xl font-black text-amber-600 dark:text-[#FACC15]">
                          {profile.gucci_points.toLocaleString()} pts
                        </p>
                      </div>

                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#20202A] transition-colors border-b border-zinc-100 dark:border-[#252530]"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Shield size={15} className="text-amber-600 dark:text-[#FACC15]" />
                        <span>Panel Administrador</span>
                      </Link>

                      <button
                        onClick={() => {
                          signOut()
                          setIsUserMenuOpen(false)
                        }}
                        className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-[#20202A] hover:text-red-600 dark:hover:text-red-400 transition-colors w-full cursor-pointer"
                      >
                        <LogOut size={15} />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                id="login-btn"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 bg-amber-400 dark:bg-[#FACC15] hover:bg-amber-500 dark:hover:bg-[#EAB308] text-black font-black text-xs sm:text-sm px-4 py-2 rounded-xl transition-all hover:scale-105 cursor-pointer shadow-sm dark:shadow-[0_0_15px_rgba(250,204,21,0.3)]"
              >
                <User size={15} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Desktop Category Navigation Bar */}
        <div
          className="hidden lg:block border-t border-zinc-200 dark:border-[#22222C] bg-zinc-50 dark:bg-[#0A0A0D] relative transition-colors duration-200"
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10">
            <div className="flex items-center gap-5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {/* MJU - Usados */}
              <button
                id="nav-btn-mju"
                onMouseEnter={() => handleMouseEnter(NAV_CATEGORIES[0])}
                onClick={() => handleCategoryClick(NAV_CATEGORIES[0])}
                className="flex items-center gap-1.5 text-amber-600 dark:text-[#FACC15] hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer py-2 font-black"
              >
                <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0 border border-amber-500 dark:border-[#FACC15]">
                  <Image src="/images/logo-mju.png" alt="MJU" fill className="object-cover" />
                </div>
                <span>MJU — Usados</span>
                <ChevronDown size={13} className="text-zinc-400 dark:text-zinc-500" />
              </button>

              {/* Retro Japón */}
              <button
                id="nav-btn-retro"
                onMouseEnter={() => handleMouseEnter(NAV_CATEGORIES[1])}
                onClick={() => handleCategoryClick(NAV_CATEGORIES[1])}
                className="flex items-center gap-1.5 text-sky-600 dark:text-[#38BDF8] hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer py-2 font-black"
              >
                <div className="relative w-4 h-4 rounded-full overflow-hidden flex-shrink-0 border border-sky-500 dark:border-[#38BDF8]">
                  <Image src="/images/logo-retro.png" alt="Retro" fill className="object-cover" />
                </div>
                <span>Retro Japón</span>
                <ChevronDown size={13} className="text-zinc-400 dark:text-zinc-500" />
              </button>

              {/* Videojuegos */}
              <button
                id="nav-btn-videojuegos"
                onMouseEnter={() => handleMouseEnter(NAV_CATEGORIES[2])}
                onClick={() => handleCategoryClick(NAV_CATEGORIES[2])}
                className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-[#FACC15] transition-colors cursor-pointer py-2"
              >
                <span>Videojuegos</span>
                <ChevronDown size={13} className="text-zinc-400 dark:text-zinc-500" />
              </button>

              {/* Consolas */}
              <button
                id="nav-btn-consolas"
                onMouseEnter={() => handleMouseEnter(NAV_CATEGORIES[3])}
                onClick={() => handleCategoryClick(NAV_CATEGORIES[3])}
                className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-[#FACC15] transition-colors cursor-pointer py-2"
              >
                <span>Consolas</span>
                <ChevronDown size={13} className="text-zinc-400 dark:text-zinc-500" />
              </button>

              {/* Accesorios */}
              <button
                id="nav-btn-accesorios"
                onMouseEnter={() => handleMouseEnter(NAV_CATEGORIES[4])}
                onClick={() => handleCategoryClick(NAV_CATEGORIES[4])}
                className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-[#FACC15] transition-colors cursor-pointer py-2"
              >
                <span>Accesorios</span>
                <ChevronDown size={13} className="text-zinc-400 dark:text-zinc-500" />
              </button>

              {/* Quick links */}
              <button
                onClick={() => onSelectCategory?.('general', 'PS5')}
                className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer py-2"
              >
                PlayStation
              </button>
              <button
                onClick={() => onSelectCategory?.('general', 'Nintendo Switch')}
                className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer py-2"
              >
                Nintendo Switch
              </button>
              <button
                onClick={() => onSelectCategory?.('general', 'Xbox Series X')}
                className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer py-2"
              >
                Xbox
              </button>
              <button
                onClick={() => onSelectCategory?.('mju')}
                className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer py-2"
              >
                Pre-Owned
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-black text-amber-600 dark:text-[#FACC15]">
              <Zap size={14} fill="currentColor" />
              <span>Gana Puntos Gucci x2</span>
            </div>
          </div>

          {/* Desktop Mega Menu Dropdown */}
          {hoveredCategory && (
            <MegaMenu
              category={hoveredCategory}
              onSelect={(cat, plat) => {
                onSelectCategory?.(cat, plat)
                setHoveredCategory(null)
              }}
              onClose={() => setHoveredCategory(null)}
            />
          )}
        </div>

        {/* Third Row: Red Promo Announcement Banner Strip */}
        <div className="bg-[#B91C1C] text-white py-1.5 px-4 text-center text-xs font-black tracking-wider uppercase shadow-xs">
          Pre-Order The Newest Games & Collectibles at Gucci Games SCZ.
        </div>
      </header>

      {/* Lateral Drawer Menu */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSelect={(cat, plat) => onSelectCategory?.(cat, plat)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
