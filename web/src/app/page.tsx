'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { HeroBanner } from '@/components/HeroBanner'
import { CategoryBubbles } from '@/components/CategoryBubbles'
import { ProductSlider } from '@/components/ProductSlider'
import { ProductCard } from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'
import type { Product, ProductCategory } from '@/lib/types'
import { Zap, MessageCircle, X, Sparkles, Filter } from 'lucide-react'
import { AuthModal } from '@/components/AuthModal'
import { QuickCheckoutModal } from '@/components/QuickCheckoutModal'
import { Footer } from '@/components/Footer'

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (platformFilter !== 'all') params.append('platform', platformFilter)
      if (searchQuery.trim()) params.append('search', searchQuery.trim())

      const res = await fetch(`/api/products?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.products) {
          setAllProducts(data.products)
          setLoading(false)
          return
        }
      }
    } catch (e) {
      console.warn('API fetch fallback to Supabase:', e)
    }

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false })

    if (searchQuery.trim()) {
      query = query.or(
        `title.ilike.%${searchQuery}%,platform.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      )
    }
    if (categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter)
    }
    if (platformFilter && platformFilter !== 'all') {
      query = query.ilike('platform', `%${platformFilter}%`)
    }

    const { data, error } = await query
    if (!error && data) {
      setAllProducts(data as Product[])
    }
    setLoading(false)
  }, [searchQuery, categoryFilter, platformFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('products-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProducts])

  const handleSelectNav = (
    category?: 'general' | 'mju' | 'retro' | 'all',
    platform?: string
  ) => {
    if (category !== undefined) {
      setCategoryFilter(category)
    }
    if (platform !== undefined) {
      setPlatformFilter(platform)
    } else {
      setPlatformFilter('all')
    }
  }

  const handleResetFilters = () => {
    setCategoryFilter('all')
    setPlatformFilter('all')
    setSearchQuery('')
  }

  const isFiltered =
    Boolean(searchQuery.trim()) ||
    categoryFilter !== 'all' ||
    (platformFilter !== 'all' && Boolean(platformFilter))

  const generalProducts = allProducts.filter((p) => p.category === 'general')
  const mjuProducts = allProducts.filter((p) => p.category === 'mju')
  const retroProducts = allProducts.filter((p) => p.category === 'retro')

  const whatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '521234567890'

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0D] text-zinc-900 dark:text-white selection:bg-[#FACC15] selection:text-black transition-colors duration-200">
      {/* Smart Mega Menu Header */}
      <Header
        onSearch={setSearchQuery}
        onSelectCategory={handleSelectNav}
        activeCategory={categoryFilter}
        activePlatform={platformFilter}
      />

      {/* Hero Section Banner with High Res Game Art */}
      {!isFiltered && (
        <HeroBanner
          onCategoryFilter={(cat) => handleSelectNav(cat, 'all')}
          onSearch={(query) => setSearchQuery(query)}
        />
      )}

      {/* The 2 Large Exclusive Hero Buttons (MJU & Retro) on Gucci Games Theme */}
      <CategoryBubbles
        activeCategory={categoryFilter}
        activePlatform={platformFilter}
        onSelect={handleSelectNav}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10 bg-[#F8F9FA] dark:bg-[#0A0A0D] transition-colors duration-200">
        {/* Active Filter Bar & Quick Category Buttons */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          {/* Category Tabs Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
            <button
              id="filter-all"
              onClick={() => handleSelectNav('all', 'all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                categoryFilter === 'all' && platformFilter === 'all'
                  ? 'bg-amber-400 dark:bg-[#FACC15] text-black shadow-md dark:shadow-[0_0_20px_rgba(250,204,21,0.5)]'
                  : 'bg-white dark:bg-[#15151D] border border-zinc-200 dark:border-[#272733] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-zinc-400 dark:hover:border-[#3E3E50]'
              }`}
            >
              Todos los Juegos
            </button>

            {/* MJU Highlight Button */}
            <button
              id="filter-mju"
              onClick={() => handleSelectNav('mju', 'all')}
              className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border ${
                categoryFilter === 'mju'
                  ? 'bg-amber-400 dark:bg-[#FACC15] text-black border-amber-500 dark:border-[#FACC15] shadow-md dark:shadow-[0_0_25px_rgba(250,204,21,0.6)] scale-105'
                  : 'bg-amber-50 dark:bg-[#18160B] border-amber-300/80 dark:border-[#FACC15]/40 text-amber-800 dark:text-[#FACC15] hover:bg-amber-100 dark:hover:bg-[#FACC15]/15'
              }`}
            >
              <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-amber-500 dark:border-[#FACC15]">
                <Image src="/images/logo-mju.png" alt="MJU" fill className="object-cover" />
              </div>
              <span>MJU — Usados</span>
            </button>

            {/* Retro Highlight Button */}
            <button
              id="filter-retro"
              onClick={() => handleSelectNav('retro', 'all')}
              className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer border ${
                categoryFilter === 'retro'
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-md dark:shadow-[0_0_25px_rgba(2,132,199,0.6)] scale-105'
                  : 'bg-sky-50 dark:bg-[#0B1524] border-sky-300/80 dark:border-[#38BDF8]/40 text-sky-800 dark:text-[#38BDF8] hover:bg-sky-100 dark:hover:bg-[#38BDF8]/15'
              }`}
            >
              <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-sky-500 dark:border-[#38BDF8]">
                <Image src="/images/logo-retro.png" alt="Retro" fill className="object-cover" />
              </div>
              <span>Retro Japón SCZ</span>
            </button>

            {/* General */}
            <button
              id="filter-general"
              onClick={() => handleSelectNav('general', 'all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                categoryFilter === 'general' && platformFilter === 'all'
                  ? 'bg-amber-400 dark:bg-[#FACC15] text-black shadow-md dark:shadow-[0_0_20px_rgba(250,204,21,0.5)]'
                  : 'bg-white dark:bg-[#15151D] border border-zinc-200 dark:border-[#272733] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-zinc-400 dark:hover:border-[#3E3E50]'
              }`}
            >
              🎮 Catálogo Nuevo
            </button>
          </div>

          {/* Active Filter Indicator Chips */}
          {isFiltered && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-bold">
                <Filter size={13} className="text-amber-600 dark:text-[#FACC15]" />
                Filtro activo:
              </span>

              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-amber-500/15 dark:bg-[#FACC15]/20 border border-amber-500/40 dark:border-[#FACC15]/40 text-amber-800 dark:text-[#FACC15] text-xs font-black px-3 py-1 rounded-lg">
                  {categoryFilter === 'mju'
                    ? 'MJU Usados'
                    : categoryFilter === 'retro'
                    ? 'Retro Japón'
                    : 'Catálogo General'}
                </span>
              )}

              {platformFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-sky-500/15 dark:bg-sky-500/20 border border-sky-400/40 text-sky-800 dark:text-sky-400 text-xs font-bold px-3 py-1 rounded-lg">
                  Consola: {platformFilter}
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold px-3 py-1 rounded-lg">
                  &quot;{searchQuery}&quot;
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-[#16161F] border border-zinc-200 dark:border-[#282836] px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <X size={12} />
                <span>Restablecer</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Section: Loading, Filtered Grid, or Sliders */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 bg-transparent">
            <div className="w-12 h-12 border-3 border-amber-500 dark:border-[#FACC15] border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">Cargando catálogo Gucci Games...</p>
          </div>
        ) : isFiltered ? (
          /* Filtered Results Grid */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#252530] pb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 dark:text-white">
                  {categoryFilter === 'mju'
                    ? '♻️ Juegos & Consolas MJU (Mi Juego Usado)'
                    : categoryFilter === 'retro'
                    ? '👾 Catálogo Retro Games Japón SCZ'
                    : 'Resultados del Catálogo'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                  {allProducts.length} producto{allProducts.length !== 1 ? 's' : ''} disponible
                  {allProducts.length !== 1 ? 's' : ''} para entrega
                </p>
              </div>

              {allProducts.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-[#FACC15] bg-amber-500/10 dark:bg-[#FACC15]/10 px-3 py-1.5 rounded-xl border border-amber-500/25 dark:border-[#FACC15]/25">
                  <Sparkles size={14} className="text-amber-600 dark:text-[#FACC15]" />
                  <span>Todos acumulan Puntos Gucci</span>
                </div>
              )}
            </div>

            {allProducts.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-[#121218] rounded-3xl border border-zinc-200 dark:border-[#252530] px-4 shadow-xs">
                <span className="text-6xl block mb-4">🕹️</span>
                <p className="text-xl font-black text-zinc-950 dark:text-white">No se encontraron productos</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 max-w-md mx-auto">
                  No hay juegos disponibles con los filtros seleccionados actualmente. Puedes
                  restablecer los filtros o consultar disponibilidad por WhatsApp.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-amber-400 dark:bg-[#FACC15] text-black font-black text-xs hover:bg-amber-500 dark:hover:bg-[#EAB308] transition-all cursor-pointer shadow-md"
                >
                  Ver Todo el Catálogo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {allProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAuthRequired={() => setIsAuthOpen(true)}
                    onBuy={(p) => setCheckoutProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default Sliders View */
          <div className="space-y-10">
            {/* MJU Slider */}
            <div className="relative bg-amber-50/50 dark:bg-[#131109] border border-amber-400/40 dark:border-[#FACC15]/30 rounded-3xl p-6 sm:p-8 shadow-xs dark:shadow-[0_0_30px_rgba(250,204,21,0.06)] transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-500 dark:border-[#FACC15] flex-shrink-0 shadow-xs">
                  <Image src="/images/logo-mju.png" alt="MJU" fill className="object-cover" />
                </div>
                <h3 className="text-xl font-black text-zinc-950 dark:text-white">MJU — Mi Juego Usado</h3>
                <span className="text-[10px] font-black uppercase bg-amber-400 dark:bg-[#FACC15] text-black px-2.5 py-0.5 rounded-full shadow-xs">
                  Pre-Owned Garantizado
                </span>
              </div>
              <ProductSlider
                title=""
                subtitle="Consolas y títulos pre-owned 100% testeados con garantía oficial"
                products={mjuProducts}
                accentColor="#FACC15"
                onAuthRequired={() => setIsAuthOpen(true)}
                onBuy={(p) => setCheckoutProduct(p)}
              />
            </div>

            {/* Retro Games Slider */}
            <div className="relative bg-sky-50/50 dark:bg-[#09111E] border border-sky-400/40 dark:border-[#0284C7]/30 rounded-3xl p-6 sm:p-8 shadow-xs dark:shadow-[0_0_30px_rgba(2,132,199,0.06)] transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-sky-500 dark:border-[#0284C7] flex-shrink-0 shadow-xs">
                  <Image src="/images/logo-retro.png" alt="Retro" fill className="object-cover" />
                </div>
                <h3 className="text-xl font-black text-zinc-950 dark:text-white">Retro Games Japón SCZ</h3>
                <span className="text-[10px] font-black uppercase bg-[#0284C7] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                  Importación Japón
                </span>
              </div>
              <ProductSlider
                title=""
                subtitle="Clásicos de colección de Super Famicom, Game Boy, SEGA y más directamente de Tokio"
                products={retroProducts}
                accentColor="#38BDF8"
                onAuthRequired={() => setIsAuthOpen(true)}
                onBuy={(p) => setCheckoutProduct(p)}
              />
            </div>

            {/* General Products Slider */}
            <div className="relative bg-white dark:bg-[#111116] border border-zinc-200 dark:border-[#252530] rounded-3xl p-6 sm:p-8 shadow-xs transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎮</span>
                <h3 className="text-xl font-black text-zinc-950 dark:text-white">Catálogo General & Novedades</h3>
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/15 px-2.5 py-0.5 rounded-full shadow-xs">
                  PS5 • Switch • Xbox
                </span>
              </div>
              <ProductSlider
                title=""
                subtitle="Los títulos más pedidos y entregas inmediatas"
                products={generalProducts}
                accentColor="#FACC15"
                onAuthRequired={() => setIsAuthOpen(true)}
                onBuy={(p) => setCheckoutProduct(p)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer with full store location, schedule, phone, facebook and plus code */}
      <Footer whatsAppNumber={whatsAppNumber} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Quick Checkout Modal */}
      <QuickCheckoutModal
        product={checkoutProduct}
        isOpen={Boolean(checkoutProduct)}
        onClose={() => setCheckoutProduct(null)}
      />
    </div>
  )
}
