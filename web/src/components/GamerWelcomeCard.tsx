'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Download, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react'

interface GamerWelcomeCardProps {
  username: string
  email: string
  password: string
  onClose: () => void
  onLoginRedirect: () => void
}

export function GamerWelcomeCard({
  username,
  email,
  password,
  onClose,
  onLoginRedirect,
}: GamerWelcomeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showPassword, setShowPassword] = useState(true)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const drawCard = (revealPass: boolean) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = '/images/gamer-card-template.png'
    img.onload = () => {
      // 1. Draw base template (1024 x 765)
      ctx.clearRect(0, 0, 1024, 765)
      ctx.drawImage(img, 0, 0, 1024, 765)

      // 2. Text styling
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'

      // Field 1: NOMBRE
      ctx.fillStyle = '#F5A623'
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillText('NOMBRE:', 145, 345)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      // Limit text length if username is long
      const displayUsername = username.length > 25 ? username.slice(0, 24) + '...' : username
      ctx.fillText(displayUsername, 145, 380)

      // Field 2: GMAIL / CORREO
      ctx.fillStyle = '#F5A623'
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      const emailLabel = email.toLowerCase().includes('@gmail.com') ? 'GMAIL:' : 'CORREO:'
      ctx.fillText(emailLabel, 145, 436)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      const displayEmail = email.length > 30 ? email.slice(0, 29) + '...' : email
      ctx.fillText(displayEmail, 145, 471)

      // Field 3: CONTRASEÑA
      ctx.fillStyle = '#F5A623'
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillText('CONTRASEÑA:', 145, 528)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      const passText = revealPass ? password : '••••••••••••'
      ctx.fillText(passText, 145, 563)

      setIsReady(true)
    }
  }

  useEffect(() => {
    drawCard(showPassword)
  }, [showPassword, username, email, password])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `tarjeta-gucci-games-${username.toLowerCase().replace(/\s+/g, '_')}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsDownloaded(true)
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto py-2">
      {/* Title */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-amber-400 text-xs font-bold tracking-wider uppercase mb-2">
          <CheckCircle2 size={14} className="text-amber-400" />
          <span>¡Cuenta Creada con Éxito!</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          Tu Tarjeta de Jugador Oficial
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Guarda o descarga tu tarjeta como imagen para recordar siempre tus accesos
        </p>
      </div>

      {/* Interactive Card Canvas Preview */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-amber-500/30 shadow-[0_0_35px_rgba(245,166,35,0.22)] bg-black">
        <canvas
          ref={canvasRef}
          width={1024}
          height={765}
          className="w-full h-auto block"
        />

        {/* Floating Password Toggle inside preview */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute bottom-[30%] left-[53%] sm:left-[55%] -translate-x-full text-zinc-400 hover:text-amber-400 bg-black/60 hover:bg-black/80 border border-white/10 hover:border-amber-400/50 p-1.5 sm:p-2 rounded-lg backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-medium"
          title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
        >
          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          <span className="text-[10px] hidden sm:inline">
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row gap-3 mt-5">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!isReady}
          className="flex-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,166,35,0.4)] transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer text-sm sm:text-base"
        >
          <Download size={18} className="stroke-[2.5]" />
          <span>{isDownloaded ? '¡Descargada! (Volver a bajar)' : 'Descargar Tarjeta (PNG)'}</span>
        </button>

        <button
          type="button"
          onClick={onLoginRedirect}
          className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 hover:border-amber-400/50 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm sm:text-base hover:text-amber-400"
        >
          <span>Iniciar Sesión</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <p className="text-[11px] text-zinc-500 text-center mt-3">
        💡 Te recomendamos guardar esta imagen en tus fotos o galería para no olvidar tu contraseña.
      </p>
    </div>
  )
}
