'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, Gamepad2, Shield } from 'lucide-react'
import { GamerWelcomeCard } from './GamerWelcomeCard'
import { useAuth } from '@/contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type Mode = 'login' | 'register'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signIn, signUp } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
      else onClose()
    } else {
      if (!username.trim()) {
        setError('El nombre de usuario es requerido')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, username)
      if (error) setError(error)
      else setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full ${
          success ? 'max-w-2xl' : 'max-w-md'
        } bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-300`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-black dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X size={20} />
        </button>

        {success ? (
          <GamerWelcomeCard
            username={username}
            email={email}
            password={password}
            onClose={onClose}
            onLoginRedirect={() => {
              setMode('login')
              setSuccess(false)
            }}
          />
        ) : (
          <>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-amber-400 dark:bg-[#FACC15] rounded-xl flex items-center justify-center shadow-xs">
                <Gamepad2 size={22} className="text-black" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Bienvenido a</p>
                <h2 className="text-xl font-black text-zinc-950 dark:text-white">Gucci Games</h2>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-zinc-100 dark:bg-[#09090B] rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode('login'); setError(null) }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'login'
                    ? 'bg-amber-400 dark:bg-[#FACC15] text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setMode('register'); setError(null) }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === 'register'
                    ? 'bg-amber-400 dark:bg-[#FACC15] text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Registrarse
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="tu_usuario_gamer"
                    className="w-full bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-[#27272A] text-zinc-900 dark:text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:bg-white dark:focus:bg-[#09090B] focus:border-amber-500 dark:focus:border-[#FACC15] transition-colors"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gamer@email.com"
                  className="w-full bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-[#27272A] text-zinc-900 dark:text-white rounded-xl px-4 py-3 text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:bg-white dark:focus:bg-[#09090B] focus:border-amber-500 dark:focus:border-[#FACC15] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 dark:bg-[#09090B] border border-zinc-200 dark:border-[#27272A] text-zinc-900 dark:text-white rounded-xl px-4 py-3 pr-12 text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:bg-white dark:focus:bg-[#09090B] focus:border-amber-500 dark:focus:border-[#FACC15] transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 dark:bg-[#FACC15] hover:bg-amber-500 dark:hover:bg-[#EAB308] disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 mt-2 cursor-pointer shadow-md"
              >
                {loading
                  ? 'Cargando...'
                  : mode === 'login'
                  ? 'Entrar al Juego'
                  : 'Crear Cuenta'}
              </button>

              <div className="pt-3 text-center border-t border-zinc-100 dark:border-zinc-800/80 mt-2">
                <a
                  href="/admin"
                  onClick={onClose}
                  className="text-xs text-zinc-400 hover:text-amber-500 dark:hover:text-[#FACC15] transition-colors inline-flex items-center gap-1.5 font-medium"
                >
                  <Shield size={12} className="text-amber-500" />
                  <span>Acceso de Administrador</span>
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
