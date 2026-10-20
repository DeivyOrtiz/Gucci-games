'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, User, Phone, MapPin, Sparkles, ShieldCheck } from 'lucide-react'
import type { Product } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'

interface QuickCheckoutModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

const BOLIVIAN_CITIES = [
  'Santa Cruz de la Sierra',
  'La Paz',
  'Cochabamba',
  'Tarija',
  'Sucre (Chuquisaca)',
  'Oruro',
  'Potosí',
  'Trinidad (Beni)',
  'Cobija (Pando)',
]

export function QuickCheckoutModal({ product, isOpen, onClose }: QuickCheckoutModalProps) {
  const { profile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('Santa Cruz de la Sierra')
  const [includeAddon, setIncludeAddon] = useState(false)
  const [addonPrice] = useState(25) // Bs 25 for Gamer Grip Pro
  const [errorMsg, setErrorMsg] = useState('')

  // Pre-fill profile info when opened
  useEffect(() => {
    if (isOpen) {
      if (profile) {
        setFullName(profile.username || '')
        setPhone(profile.phone || '')
      }
      setErrorMsg('')
    }
  }, [isOpen, profile])

  if (!isOpen || !product) return null

  const subtotal = product.price
  const total = subtotal + (includeAddon ? addonPrice : 0)

  const formatBs = (val: number) => {
    return val.toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      setErrorMsg('Por favor ingresa tu Nombre y Apellido.')
      return
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor ingresa tu número de Teléfono / WhatsApp.')
      return
    }
    if (!address.trim()) {
      setErrorMsg('Por favor ingresa tu dirección de entrega.')
      return
    }

    const whatsAppNumber = (
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '59177617306'
    ).replace(/\D/g, '')

    const addonText = includeAddon ? ' - Grip Silicona Pro Joysticks' : ''
    const totalText = `Bs${formatBs(total)}`

    // Exact message format requested
    const messageLines = [
      `🧾 Nombre: ${fullName.trim()} -`,
      `📦 Producto(s): ${product.title} (${product.platform})${addonText}`,
      `📍 Ciudad: ${city}`,
      `🏠 Dirección: ${address.trim()}`,
      `📱 Teléfono: ${phone.trim()}`,
      `💵 Total: ${totalText}`,
      ``,
      `Por favor confirme sus datos para realizar el pedido y proceder con el envío.`,
    ]

    const encoded = encodeURIComponent(messageLines.join('\n'))
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsAppNumber}&text=${encoded}`

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#141419] text-zinc-900 dark:text-white rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#111116]">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <span className="font-black text-sm text-zinc-900 dark:text-white">
              Confirmar Pedido · Gucci Games
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Product Header Card */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            {/* Thumbnail with Quantity Badge 1 */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🎮</div>
              )}
              <span className="absolute -top-1 -right-1 bg-zinc-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm">
                1
              </span>
            </div>

            {/* Title & Platform */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-2">
                {product.title}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">
                Plataforma: <span className="text-zinc-700 dark:text-zinc-300">{product.platform}</span>
              </p>
            </div>

            {/* Price on right */}
            <div className="text-right flex-shrink-0">
              <span className="font-black text-base sm:text-lg text-zinc-900 dark:text-white">
                Bs{formatBs(product.price)}
              </span>
            </div>
          </div>

          {/* Subtotal & Total Breakdown */}
          <div className="space-y-1.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 font-medium">
              <span>Subtotal</span>
              <span>Bs{formatBs(subtotal)}</span>
            </div>
            {includeAddon && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>+ Grip Silicona Pro Joysticks</span>
                <span>Bs{formatBs(addonPrice)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-zinc-900 dark:text-white font-black text-base pt-1">
              <span>Total</span>
              <span className="text-lg">Bs{formatBs(total)}</span>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-0.5">
              📋 Confirma tus datos abajo para realizar el pedido y coordinar el envío.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-black text-zinc-800 dark:text-zinc-200 mb-1.5">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-xl border border-zinc-300 dark:border-zinc-700 overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 bg-white dark:bg-[#1c1c24]">
                <div className="bg-zinc-100 dark:bg-zinc-800 px-3.5 flex items-center justify-center border-r border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nombre y Apellido"
                  required
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-transparent outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Telefono / WhatsApp */}
            <div>
              <label className="block text-xs font-black text-zinc-800 dark:text-zinc-200 mb-1.5">
                Telefono/Whatsapp <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-xl border border-zinc-300 dark:border-zinc-700 overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 bg-white dark:bg-[#1c1c24]">
                <div className="bg-zinc-100 dark:bg-zinc-800 px-3.5 flex items-center justify-center border-r border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+591 7XXXXXXX"
                  required
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-transparent outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs font-black text-zinc-800 dark:text-zinc-200 mb-1.5">
                Dirección (Incluir N°, MZ, Calle, Dpto) <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-xl border border-zinc-300 dark:border-zinc-700 overflow-hidden focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 bg-white dark:bg-[#1c1c24]">
                <div className="bg-zinc-100 dark:bg-zinc-800 px-3.5 flex items-center justify-center border-r border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="incluido calle y numero de casa"
                  required
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-transparent outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Departamento / Ciudad */}
            <div>
              <label className="block text-xs font-black text-zinc-800 dark:text-zinc-200 mb-1.5">
                Departamento <span className="text-red-500">*</span>
              </label>
              <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 overflow-hidden bg-white dark:bg-[#1c1c24] focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-transparent outline-none text-zinc-900 dark:text-white cursor-pointer"
                >
                  {BOLIVIAN_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-[#141419] text-zinc-900 dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upsell Checkbox Box (exact green dashed border style) */}
            <div
              onClick={() => setIncludeAddon(!includeAddon)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all select-none ${
                includeAddon
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30'
                  : 'border-emerald-400/60 dark:border-emerald-600/50 bg-emerald-50/30 dark:bg-emerald-950/10 hover:border-emerald-500'
              }`}
            >
              <input
                type="checkbox"
                checked={includeAddon}
                onChange={() => {}}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
              />
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-emerald-500/30 flex items-center justify-center text-lg flex-shrink-0">
                🎮
              </div>
              <div className="flex-1 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200">
                <span>🔥 Añade </span>
                <strong className="font-black text-zinc-900 dark:text-white">Grip Silicona Pro Joysticks</strong>
                <span> por solo </span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                  Bs{formatBs(addonPrice)}
                </strong>
              </div>
            </div>

            {/* Red Submit Button (exact design from image) */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl font-black text-sm sm:text-base text-white bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.98] transition-all shadow-lg hover:shadow-red-500/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Completa tu compra – Bs{formatBs(total)}</span>
            </button>

            {/* Guarantees Note */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Compra 100% segura · Confirmación directa por WhatsApp oficial</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
