'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'expanded'
  className?: string
  id?: string
}

export function ThemeToggle({
  variant = 'icon',
  className = '',
  id = 'theme-toggle-btn',
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render skeleton to avoid hydration mismatch
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-zinc-200 dark:bg-[#181822] animate-pulse ${className}`}
        aria-hidden="true"
      />
    )
  }

  if (variant === 'expanded') {
    return (
      <button
        id={id}
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
          isDark
            ? 'bg-[#181822] hover:bg-[#20202C] border-[#2A2A38] text-zinc-200'
            : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
        } ${className}`}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform ${
              isDark
                ? 'bg-amber-400/10 text-[#FACC15]'
                : 'bg-indigo-500/10 text-indigo-600'
            }`}
          >
            {isDark ? <Sun size={18} className="animate-spin-slow" /> : <Moon size={18} />}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-tight">
              {isDark ? 'Fondo Oscuro' : 'Fondo Claro'}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Toca para cambiar a {isDark ? 'claro' : 'oscuro'}
            </p>
          </div>
        </div>

        {/* Pill switch representation */}
        <div
          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
            isDark ? 'bg-amber-400 justify-end' : 'bg-zinc-300 justify-start'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
        </div>
      </button>
    )
  }

  if (variant === 'pill') {
    return (
      <button
        id={id}
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
          isDark
            ? 'bg-[#181822] hover:bg-[#20202C] border-[#2A2A38] text-zinc-200 hover:text-[#FACC15]'
            : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800 hover:text-amber-600'
        } ${className}`}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={isDark ? 'Modo claro' : 'Modo oscuro'}
      >
        {isDark ? (
          <>
            <Sun size={14} className="text-[#FACC15]" />
            <span className="hidden sm:inline">Claro</span>
          </>
        ) : (
          <>
            <Moon size={14} className="text-indigo-600" />
            <span className="hidden sm:inline">Oscuro</span>
          </>
        )}
      </button>
    )
  }

  // Default: Icon variant (ideal for Header bar)
  return (
    <button
      id={id}
      onClick={toggleTheme}
      className={`relative w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer group ${
        isDark
          ? 'bg-[#181822] hover:bg-[#222230] border-[#2E2E3C] text-[#FACC15] hover:scale-105 shadow-[0_0_12px_rgba(250,204,21,0.15)]'
          : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800 hover:scale-105 shadow-sm hover:text-amber-600'
      } ${className}`}
      aria-label={isDark ? 'Cambiar a fondo claro' : 'Cambiar a fondo oscuro'}
      title={isDark ? 'Cambiar a fondo claro' : 'Cambiar a fondo oscuro'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon */}
        <Sun
          size={18}
          className={`absolute transition-all duration-500 transform ${
            isDark
              ? 'rotate-0 scale-100 opacity-100 text-[#FACC15]'
              : 'rotate-90 scale-0 opacity-0 text-amber-500'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          size={17}
          className={`absolute transition-all duration-500 transform ${
            isDark
              ? '-rotate-90 scale-0 opacity-0 text-zinc-400'
              : 'rotate-0 scale-100 opacity-100 text-zinc-800'
          }`}
        />
      </div>
    </button>
  )
}
