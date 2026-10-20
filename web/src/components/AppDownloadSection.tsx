'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export function AppDownloadSection() {
  const [copied, setCopied] = useState(false)
  const apkDownloadUrl = 'https://expo.dev/artifacts/eas/sPlps0yz5tptfEvDEWWPP1BVjHLck6yi8FDIHwmv1hE.apk'
  const expoBuildUrl = 'https://expo.dev/accounts/gabriells_sossa/projects/gucci-games/builds/178eb6b4-472a-43e3-8361-43ef7e8e4b96'

  const handleCopy = () => {
    navigator.clipboard.writeText(apkDownloadUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section id="descargar-app" className="relative my-12 sm:my-16 scroll-mt-24">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent rounded-3xl blur-2xl pointer-events-none" />

      <div className="relative bg-[#0E0E14] border border-[#272736] hover:border-[#FACC15]/40 rounded-3xl p-6 sm:p-10 shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Subtle Decorative Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#FACC15 1px, transparent 1px), radial-gradient(#FACC15 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* Ambient Corner Accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FACC15]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text & Features */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#FACC15]/15 border border-[#FACC15]/30 text-[#FACC15] px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-ping" />
              <span>App Oficial Gucci Games</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Instala Nuestra App <br />
                <span className="bg-gradient-to-r from-[#FEF08A] via-[#FACC15] to-[#EAB308] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(250,204,21,0.35)]">
                  En Tu Teléfono
                </span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
                Escanea el código QR con tu celular o pulsa el botón para descargar directamente el instalador oficial de Android con stock en tiempo real y catálogo gamer completo.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FACC15]/15 text-[#FACC15] flex items-center justify-center font-black flex-shrink-0">
                  ⚡
                </div>
                <div>
                  <p className="text-xs font-black text-white">Stock en Vivo</p>
                  <p className="text-[11px] text-zinc-400">Unidades exactas</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FACC15]/15 text-[#FACC15] flex items-center justify-center font-black flex-shrink-0">
                  🎮
                </div>
                <div>
                  <p className="text-xs font-black text-white">Todo el Catálogo</p>
                  <p className="text-[11px] text-zinc-400">PS5, Switch & Retro</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-[#FACC15]/15 text-[#FACC15] flex items-center justify-center font-black flex-shrink-0">
                  💎
                </div>
                <div>
                  <p className="text-xs font-black text-white">Puntos Gucci</p>
                  <p className="text-[11px] text-zinc-400">Canjes y premios</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href={apkDownloadUrl}
                download="GucciGames.apk"
                className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#FACC15] to-[#EAB308] hover:from-[#FEF08A] hover:to-[#FACC15] text-black font-black text-sm px-6 py-3.5 rounded-xl transition-all duration-200 shadow-[0_0_25px_rgba(250,204,21,0.35)] hover:scale-[1.02] cursor-pointer"
              >
                <Download size={18} className="stroke-[2.5]" />
                <span>Descargar APK Directo</span>
              </a>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs sm:text-sm px-4 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-400">¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-zinc-400" />
                    <span>Copiar Enlace de Descarga</span>
                  </>
                )}
              </button>
            </div>

            {/* 3 Steps Quick Guide */}
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs font-bold text-zinc-400 mb-2.5">
                Cómo instalar en Android en 3 pasos:
              </p>
              <div className="flex flex-col sm:flex-row gap-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FACC15]/20 text-[#FACC15] font-black flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Escanea o pulsa Descargar</span>
                </div>
                <div className="hidden sm:block text-zinc-600">→</div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FACC15]/20 text-[#FACC15] font-black flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Pulsa "Instalar"</span>
                </div>
                <div className="hidden sm:block text-zinc-600">→</div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FACC15]/20 text-[#FACC15] font-black flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>¡Disfruta Gucci Games!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: QR Card with Laser Scanning Effect */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative group">
              {/* Outer Glow Halo */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#FACC15] via-[#EAB308] to-[#CA8A04] rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />

              <div className="relative bg-[#14141E] border-2 border-[#FACC15]/50 rounded-2xl p-6 text-center shadow-2xl flex flex-col items-center">
                {/* Badge top */}
                <span className="inline-flex items-center gap-1.5 bg-[#FACC15] text-black text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3 shadow-md">
                  <Smartphone size={13} />
                  Escanea con tu cámara
                </span>

                <p className="text-xs text-zinc-400 font-medium mb-3">
                  Apunta tu celular Android hacia aquí
                </p>

                {/* QR Container with Laser Line */}
                <div className="relative bg-white p-3.5 rounded-xl shadow-[0_0_30px_rgba(250,204,21,0.3)] overflow-hidden w-[210px] h-[210px] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/apk_download_qr.png"
                    alt="Código QR para descargar Gucci Games APK"
                    className="w-full h-full object-contain"
                  />

                  {/* Scanning Laser Beam */}
                  <div
                    className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-[#FACC15] to-transparent shadow-[0_0_12px_#FACC15] pointer-events-none animate-scan"
                    style={{
                      animation: 'scanBeam 2.5s ease-in-out infinite',
                    }}
                  />
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-400">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>APK 100% Seguro y Verificado</span>
                </div>
              </div>
            </div>

            {/* iOS Hint Below QR */}
            <div className="mt-4 text-center">
              <p className="text-xs text-zinc-500">
                ¿Tienes iPhone?{' '}
                <a
                  href="https://guccigamesbo.com"
                  className="text-[#FACC15] hover:underline font-bold"
                >
                  Agrégalo a tu Pantalla de Inicio
                </a>{' '}
                o usa Expo Go.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanBeam {
          0%,
          100% {
            top: 12px;
            opacity: 0;
          }
          10%,
          90% {
            opacity: 1;
          }
          50% {
            top: 195px;
          }
        }
      `}</style>
    </section>
  )
}
