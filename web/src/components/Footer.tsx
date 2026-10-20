'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  Globe,
  Phone,
  Navigation,
  ChevronDown,
  MessageCircle,
  ExternalLink,
  Zap,
  Sparkles,
  CheckCircle2,
  Shield,
} from 'lucide-react'

// Official TikTok SVG Icon
function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  )
}

interface FooterProps {
  whatsAppNumber?: string
}

export function Footer({ whatsAppNumber = '59177617306' }: FooterProps) {
  const [showSchedule, setShowSchedule] = useState(false)

  const mapsUrl = 'https://www.google.com/maps/place/GUCCI+GAMES/@-17.7830809,-63.1835068,17z'
  const plusCodeUrl = 'https://www.google.com/maps/search/?api=1&query=6R89%2BQJ+Santa+Cruz+de+la+Sierra'

  const tikTokAccounts = [
    {
      id: 'guccigames',
      name: 'Gucci Games Oficial',
      handle: '@guccigamesbo',
      url: 'https://www.tiktok.com/@guccigamesbo?_r=1&_t=ZS-9AMXkn1hru5',
      badge: 'TIENDA OFICIAL',
      badgeColor: 'bg-amber-400 text-black',
      avatar: '/images/logo-gucci.png',
      description: 'Lanzamientos PS5, Nintendo Switch, unboxings, consolas y stock disponible.',
      accentColor: '#FACC15',
      glowClass: 'hover:shadow-[0_15px_35px_rgba(250,204,21,0.22)] hover:border-amber-400/80',
    },
    {
      id: 'retrogames',
      name: 'Retro Games Japón SCZ',
      handle: '@retrogamesjaponscz',
      url: 'https://www.tiktok.com/@retrogamesjaponscz?_r=1&_t=ZS-9AMXl7XfEuM',
      badge: 'JAPÓN IMPORT',
      badgeColor: 'bg-[#0284C7] text-white',
      avatar: '/images/logo-retro.png',
      description: 'Joyas clásicas japonesas, Super Famicom, Game Boy, SEGA e importaciones directas de Tokio.',
      accentColor: '#38BDF8',
      glowClass: 'hover:shadow-[0_15px_35px_rgba(56,189,248,0.22)] hover:border-sky-400/80',
    },
    {
      id: 'mju',
      name: 'MJU — Mi Juego Usado',
      handle: '@mijuegousado',
      url: 'https://www.tiktok.com/@mijuegousado?_r=1&_t=ZS-9AMXmfdk7Ec',
      badge: 'PRE-OWNED TESTEADO',
      badgeColor: 'bg-amber-500 text-black',
      avatar: '/images/logo-mju.png',
      description: 'Consolas y juegos seminuevos 100% testeados con garantía oficial Gucci Games.',
      accentColor: '#F59E0B',
      glowClass: 'hover:shadow-[0_15px_35px_rgba(245,158,11,0.22)] hover:border-amber-500/80',
    },
  ]

  const scheduleDays = [
    { day: 'Lunes', hours: '9:00 a.m. – 8:00 p.m.' },
    { day: 'Martes', hours: '9:00 a.m. – 8:00 p.m.' },
    { day: 'Miércoles', hours: '9:00 a.m. – 8:00 p.m.' },
    { day: 'Jueves', hours: '9:00 a.m. – 8:00 p.m.' },
    { day: 'Viernes', hours: '9:00 a.m. – 8:00 p.m.' },
    { day: 'Sábado', hours: '9:00 a.m. – 8:00 p.m.' },
    { day: 'Domingo', hours: '10:00 a.m. – 4:00 p.m. (Guardia)' },
  ]

  return (
    <footer className="border-t border-zinc-200 dark:border-[#252530] bg-white dark:bg-[#0A0A0D] mt-20 transition-colors duration-200">
      {/* Top Banner inside Footer: Brand summary & WhatsApp CTA */}
      <div className="border-b border-zinc-100 dark:border-[#1A1A22] bg-zinc-50/70 dark:bg-[#0D0D12]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-500 dark:border-[#FACC15] shadow-xs flex-shrink-0 bg-black">
              <Image
                src="/images/logo-gucci.png"
                alt="Gucci Games"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start leading-none">
                <span className="text-lg font-black text-zinc-950 dark:text-white tracking-tight uppercase">
                  Gucci
                </span>
                <span className="text-lg font-black text-amber-600 dark:text-[#FACC15] tracking-tight uppercase ml-1">
                  Games
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-1">
                Tienda Especializada en Videojuegos Físicos • MJU Usados con Garantía • Retro Japón SCZ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-[#FACC15] bg-amber-500/10 dark:bg-[#FACC15]/10 border border-amber-500/20 dark:border-[#FACC15]/20 px-3.5 py-2 rounded-xl">
              <Zap size={13} fill="currentColor" />
              <span>Gana Puntos Gucci con tus compras</span>
            </div>

            <a
              href={`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent('Hola Gucci Games! Quisiera consultar sobre los juegos disponibles en el local de Shopping Bolívar.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebc59] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Directo</span>
            </a>
          </div>
        </div>
      </div>

      {/* SECTION: TIKTOK CHANNELS SHOWCASE */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
              <TikTokIcon className="w-3.5 h-3.5" />
              <span>Comunidad TikTok Oficial</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-2 tracking-tight">
              Síguenos en TikTok
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl font-medium">
              Conoce nuestro stock en video, unboxings de coleccionista, preventas y ofertas diarias en nuestras 3 cuentas oficiales.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-[#14141A] px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-[#22222E]">
            <Sparkles size={13} className="text-amber-500" />
            <span>3 Cuentas Especializadas</span>
          </div>
        </div>

        {/* 3 TikTok Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tikTokAccounts.map((account) => (
            <a
              key={account.id}
              href={account.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex flex-col justify-between bg-zinc-50 dark:bg-[#111116] border border-zinc-200 dark:border-[#22222B] rounded-3xl p-6 transition-all duration-300 cursor-pointer shadow-xs hover:-translate-y-1.5 ${account.glowClass}`}
            >
              {/* Top Row: Avatar with TikTok pulse ring & verified badge */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="relative">
                    {/* Pulsing subtle TikTok chromatic ring */}
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#25F4EE] via-black to-[#FE2C55] opacity-30 group-hover:opacity-100 blur-[2px] transition-opacity duration-300" />
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-black bg-black flex-shrink-0 shadow-md">
                      <Image
                        src={account.avatar}
                        alt={account.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${account.badgeColor}`}>
                    {account.badge}
                  </span>
                </div>

                {/* Account Name & Handle */}
                <div className="mb-2">
                  <h4 className="text-base font-black text-zinc-950 dark:text-white flex items-center gap-1.5 group-hover:text-amber-600 dark:group-hover:text-[#FACC15] transition-colors">
                    <span>{account.name}</span>
                    <CheckCircle2 size={15} className="text-sky-500 fill-sky-500/20 flex-shrink-0" />
                  </h4>
                  <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {account.handle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 font-medium">
                  {account.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-zinc-200/80 dark:border-[#1E1E28] flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-black text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                  <TikTokIcon className="w-4 h-4 text-black dark:text-white group-hover:scale-110 transition-transform" />
                  <span>Seguir en TikTok</span>
                </span>
                <span className="w-8 h-8 rounded-xl bg-zinc-200/80 dark:bg-[#1A1A22] text-zinc-700 dark:text-zinc-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black flex items-center justify-center transition-all group-hover:translate-x-1 shadow-xs">
                  <ExternalLink size={13} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Main Store Information Area (Physical Store, Address, Schedule, Phone, Maps) */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-6">
          <span className="text-[11px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
            📍 Datos de la Tienda Física & Contacto
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white mt-2">
            Visítanos en Santa Cruz de la Sierra
          </h3>
        </div>

        {/* Structured Info Card */}
        <div className="bg-zinc-50 dark:bg-[#121217] border border-zinc-200 dark:border-[#22222C] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* ITEM 1: DIRECCIÓN COMPLETA */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 shadow-xs border border-teal-500/30">
                <MapPin size={20} className="stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Dirección del Local
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  +591 SHOPPING BOLIVAR LOCAL #131 1ER PISO, Santa Cruz de la Sierra
                </p>
                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-1">
                  Piso 1 · Shopping Bolívar
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 mt-2 transition-colors group"
                >
                  <span>Abrir ubicación en Maps</span>
                  <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* ITEM 2: HORARIO DE ATENCIÓN */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 shadow-xs border border-teal-500/30">
                <Clock size={20} className="stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Horario de Atención
                </p>
                <button
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="flex items-center gap-1.5 text-left text-sm font-bold transition-colors cursor-pointer group"
                >
                  <span className="text-rose-600 dark:text-rose-400 font-black">Cerrado</span>
                  <span className="text-zinc-400 dark:text-zinc-500">·</span>
                  <span className="text-zinc-900 dark:text-zinc-100">Abre a las 9 a.m.</span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform ${showSchedule ? 'rotate-180 text-teal-500' : ''}`}
                  />
                </button>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Lunes a Sábado: 9:00 a.m. a 8:00 p.m.
                </p>

                {/* Dropdown schedule panel */}
                {showSchedule && (
                  <div className="mt-3 p-3 bg-white dark:bg-[#181822] border border-zinc-200 dark:border-[#2A2A38] rounded-xl text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150 shadow-md">
                    {scheduleDays.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-700 dark:text-zinc-300 py-0.5">
                        <span className="font-semibold">{item.day}</span>
                        <span className="font-mono text-zinc-500 dark:text-zinc-400">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ITEM 3: TELÉFONO / WHATSAPP */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 shadow-xs border border-teal-500/30">
                <Phone size={20} className="stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Teléfono & WhatsApp
                </p>
                <a
                  href="tel:+59177617306"
                  className="text-base sm:text-lg font-black text-zinc-950 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors block"
                >
                  77617306
                </a>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Línea directa Santa Cruz (+591)
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href={`https://wa.me/${whatsAppNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <MessageCircle size={13} />
                    <span>Escribir por WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ITEM 4: TIKTOK OFICIAL */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center flex-shrink-0 shadow-xs border border-rose-500/30">
                <TikTokIcon className="w-5 h-5 fill-current" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  TikTok Oficial
                </p>
                <a
                  href={tikTokAccounts[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-zinc-900 dark:text-white hover:text-rose-500 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>@guccigamesbo</span>
                  <ExternalLink size={13} className="text-zinc-400" />
                </a>
                <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Nuestros Canales de TikTok:</span>
                  <a href={tikTokAccounts[0].url} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors font-medium">
                    • @guccigamesbo (Tienda)
                  </a>
                  <a href={tikTokAccounts[1].url} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors font-medium">
                    • @retrogamesjaponscz (Retro)
                  </a>
                  <a href={tikTokAccounts[2].url} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors font-medium">
                    • @mijuegousado (MJU)
                  </a>
                </div>
              </div>
            </div>

            {/* ITEM 5: PLUS CODE DE GOOGLE MAPS */}
            <div className="flex items-start gap-4 md:col-span-2 lg:col-span-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 shadow-xs border border-teal-500/30">
                <Navigation size={20} className="stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                  Código Plus (Google Maps)
                </p>
                <a
                  href={plusCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono font-bold text-zinc-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>6R89+QJ Santa Cruz de la Sierra</span>
                  <ExternalLink size={13} className="text-zinc-400" />
                </a>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Introduce este código en el buscador de Google Maps para llegar directo al Shopping Bolívar Local #131
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Guarantee Strip */}
      <div className="border-t border-zinc-200 dark:border-[#1F1F28] py-6 bg-zinc-100/60 dark:bg-[#07070A]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-3 font-medium text-center sm:text-left">
          <p>© 2026 Gucci Games. Todos los derechos reservados.</p>
          <p className="flex items-center gap-2">
            <span>Santa Cruz de la Sierra (SCZ)</span>
            <span>•</span>
            <span>Shopping Bolívar Local #131</span>
            <span>•</span>
            <span>Envíos garantizados</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
