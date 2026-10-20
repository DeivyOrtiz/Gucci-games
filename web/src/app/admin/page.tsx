'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Product, Profile } from '@/lib/types'
import { PLATFORMS } from '@/lib/types'
import {
  Plus, Pencil, Trash2, Users, Zap, X, Search,
  Shield, ChevronLeft, Package, Upload, Check, Minus,
  DollarSign, Eye, EyeOff, ImageIcon,
  Gamepad2, RefreshCw, ChevronDown,
  Lock, KeyRound, Sparkles, User,
  Settings, Delete, LogIn, Key,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { optimizeProductImage, type ImageOptimizationResult } from '@/lib/imageOptimizer'
import { parseStockFromDescription, formatStockInDescription } from '@/lib/stockUtils'

type AdminTab = 'products' | 'clients' | 'settings'
type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'> & { stock?: number }

const emptyForm: ProductFormData = {
  title: '',
  description: '',
  price: 0,
  category: 'general',
  platform: 'PS5',
  image_url: '',
  points_reward: 10,
  is_available: true,
  stock: 5,
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div
      className="relative bg-white dark:bg-[#111118] border border-zinc-200 dark:border-transparent rounded-2xl p-5 overflow-hidden group hover:border-opacity-60 transition-all shadow-xs"
      style={{ borderColor: `${color}30` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 0% 0%, ${color}08 0%, transparent 70%)` }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        <span
          className="text-xs font-black px-2 py-0.5 rounded-lg"
          style={{ backgroundColor: `${color}15`, color }}
        >
          LIVE
        </span>
      </div>
      <p className="text-2xl font-black text-zinc-950 dark:text-white mb-0.5">{value}</p>
      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</p>
      {sub && <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Image Dropzone ──────────────────────────────────────────────────────────
function ImageDropzone({
  preview,
  onFile,
  isOptimizing,
}: {
  preview: string
  onFile: (f: File) => void
  isOptimizing?: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) onFile(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isOptimizing && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-amber-400 dark:border-[#FACC15] bg-amber-400/5 dark:bg-[#FACC15]/5 scale-[1.01]'
          : 'border-zinc-300 dark:border-[#27272A] hover:border-amber-500/60 dark:hover:border-[#FACC15]/60 bg-zinc-50 dark:bg-[#0D0D13]'
      }`}
    >
      {isOptimizing ? (
        <div className="h-44 flex flex-col items-center justify-center gap-3 text-amber-600 dark:text-[#FACC15] bg-amber-500/5 px-4 text-center">
          <div className="w-9 h-9 border-3 border-amber-500 dark:border-[#FACC15] border-t-transparent rounded-full animate-spin" />
          <div>
            <span className="text-sm font-black block">Optimizando y reduciendo peso...</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Convirtiendo automáticamente a formato WebP ultra liviano para el servidor
            </span>
          </div>
        </div>
      ) : preview ? (
        <div className="relative group">
          <img src={preview} alt="preview" className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white text-center">
              <ImageIcon size={24} className="mx-auto mb-1 text-amber-400 dark:text-[#FACC15]" />
              <span className="text-xs font-bold block">Hacer clic para cambiar imagen</span>
              <span className="text-[10px] text-zinc-300">Se comprimirá automáticamente</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-44 flex flex-col items-center justify-center gap-2 text-zinc-500 px-4 text-center">
          <Upload size={28} className={dragging ? 'text-amber-500 dark:text-[#FACC15]' : ''} />
          <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            {dragging ? 'Suelta la imagen aquí' : 'Arrastra o haz clic para subir imagen'}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 justify-center">
            <Zap size={13} className="fill-current" />
            Auto-optimización WebP: reduce el 80% - 95% del peso para no saturar el servidor
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { profile, loading, signIn, signOut } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState<AdminTab>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Profile[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchProducts, setSearchProducts] = useState('')
  const [searchClients, setSearchClients] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Local admin authorization state for instant or PIN access
  const [isLocallyAuthorized, setIsLocallyAuthorized] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'pin' | 'account'>('pin')
  const [showPassword, setShowPassword] = useState(false)
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLockedOut, setIsLockedOut] = useState(false)

  // Product form
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [compressionStats, setCompressionStats] = useState<ImageOptimizationResult | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Points modal
  const [pointsModal, setPointsModal] = useState<{ client: Profile; mode: 'add' | 'sub' } | null>(null)
  const [pointsAmount, setPointsAmount] = useState(0)
  const [pointsReason, setPointsReason] = useState('')
  const [pointsSubmitting, setPointsSubmitting] = useState(false)

  // Settings state (PIN configuration)
  const [activePin, setActivePin] = useState('2026')
  const [newPinInput, setNewPinInput] = useState('')
  const [confirmPinInput, setConfirmPinInput] = useState('')
  const [settingsMsg, setSettingsMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [isSavingPin, setIsSavingPin] = useState(false)
  const [showCurrentPin, setShowCurrentPin] = useState(false)

  // Account Password configuration
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [showAccountPassword, setShowAccountPassword] = useState(false)

  // Load configured PIN
  useEffect(() => {
    const loadPin = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.pin) {
            setActivePin(data.pin)
            if (typeof window !== 'undefined') {
              localStorage.setItem('gucci_admin_pin', data.pin)
            }
            return
          }
        }
      } catch {
        // Fallback
      }
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('gucci_admin_pin')
        if (local) setActivePin(local)
      }
    }
    loadPin()
  }, [])

  useEffect(() => {
    // Check saved session in localStorage
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('gucci_admin_session')
      if (savedAuth === 'true') {
        setIsLocallyAuthorized(true)
      }
      // Clear any previous lockout
      sessionStorage.removeItem('gucci_admin_failed_attempts')
    }
  }, [router])

  const isAdmin = (profile?.role === 'admin') || isLocallyAuthorized

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        if (data.products) {
          setProducts(data.products)
          setLoadingData(false)
          return
        }
      }
    } catch (e) {
      console.warn('API error, falling back to Supabase:', e)
    }
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data as Product[])
    setLoadingData(false)
  }, [])

  const fetchClients = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setClients(data as Profile[])
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchProducts()
      fetchClients()
    }
  }, [isAdmin, fetchProducts, fetchClients])

  const registerFailedAttempt = () => {
    setAuthError('Clave incorrecta. Inténtalo nuevamente.')
    setIsLoggingIn(false)
  }

  const verifyPinDirect = (codeToVerify?: string) => {
    const code = (codeToVerify !== undefined ? codeToVerify : pinCode).trim().toLowerCase()
    if (!code) return

    const savedPin = typeof window !== 'undefined' ? localStorage.getItem('gucci_admin_pin') : null
    // The current active PIN is the ONLY authorized pin (falls back to '2026' ONLY if never set)
    const validCurrentPin = (activePin || savedPin || '2026').trim().toLowerCase()

    if (code === validCurrentPin) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('gucci_admin_failed_attempts')
        localStorage.setItem('gucci_admin_session', 'true')
      }
      setIsLocallyAuthorized(true)
      setIsLoggingIn(false)
      setPinCode('')
      setAuthError(null)
    } else {
      setPinCode('')
      registerFailedAttempt()
    }
  }

  const handlePressDigit = (digit: string) => {
    if (pinCode.length < 8) {
      const next = pinCode + digit
      setPinCode(next)
      setAuthError(null)
      if (next.length === 4) {
        verifyPinDirect(next)
      }
    }
  }

  const handleDeleteDigit = () => {
    if (pinCode.length > 0) {
      setPinCode((prev) => prev.slice(0, -1))
      setAuthError(null)
    }
  }

  // Physical keyboard listener for circular PIN keypad
  useEffect(() => {
    if (isAdmin || isLockedOut) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (loginMethod !== 'pin') return
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        handlePressDigit(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleDeleteDigit()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        verifyPinDirect()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAdmin, isLockedOut, loginMethod, pinCode, activePin, failedAttempts])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setIsLoggingIn(true)

    if (loginMethod === 'pin') {
      verifyPinDirect()
      return
    }

    // Option 2: Supabase Credentials or PIN in password field
    if (loginIdentifier && loginPassword) {
      const savedPin = typeof window !== 'undefined' ? localStorage.getItem('gucci_admin_pin') : null
      const validCurrentPin = (activePin || savedPin || '2026').trim().toLowerCase()

      // If user typed the current active admin PIN in the password field, accept access
      if (loginPassword.trim().toLowerCase() === validCurrentPin) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('gucci_admin_failed_attempts')
          localStorage.setItem('gucci_admin_session', 'true')
        }
        setIsLocallyAuthorized(true)
        setIsLoggingIn(false)
        setAuthError(null)
        return
      }

      const { error } = await signIn(loginIdentifier.trim(), loginPassword)
      if (error) {
        registerFailedAttempt()
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('gucci_admin_failed_attempts')
          localStorage.setItem('gucci_admin_session', 'true')
        }
        setIsLocallyAuthorized(true)
      }
    } else {
      setAuthError('Por favor introduce tu usuario y contraseña.')
    }
    setIsLoggingIn(false)
  }

  const handleSaveNewPin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsMsg(null)

    if (newPinInput.trim().length < 4) {
      setSettingsMsg({ text: 'La clave debe tener al menos 4 dígitos o caracteres.', type: 'error' })
      return
    }

    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setSettingsMsg({ text: 'Las claves no coinciden. Por favor verifícalas.', type: 'error' })
      return
    }

    setIsSavingPin(true)
    const cleanPin = newPinInput.trim()

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin: cleanPin }),
      })

      if (res.ok) {
        setActivePin(cleanPin)
        if (typeof window !== 'undefined') {
          localStorage.setItem('gucci_admin_pin', cleanPin)
        }
        setSettingsMsg({
          text: `¡Clave actualizada exitosamente a "${cleanPin}"! Se guardó en la nube y ahora es la única clave activa.`,
          type: 'success',
        })
        setNewPinInput('')
        setConfirmPinInput('')
      } else {
        const data = await res.json()
        setSettingsMsg({ text: data.error || 'Error al guardar la clave.', type: 'error' })
      }
    } catch {
      setActivePin(cleanPin)
      if (typeof window !== 'undefined') {
        localStorage.setItem('gucci_admin_pin', cleanPin)
      }
      setSettingsMsg({
        text: `¡Clave guardada localmente! Nueva clave activa: "${cleanPin}".`,
        type: 'success',
      })
      setNewPinInput('')
      setConfirmPinInput('')
    } finally {
      setIsSavingPin(false)
    }
  }

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (newPasswordInput.trim().length < 6) {
      setPasswordMsg({ text: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' })
      return
    }

    if (newPasswordInput.trim() !== confirmPasswordInput.trim()) {
      setPasswordMsg({ text: 'Las contraseñas no coinciden. Por favor verifícalas.', type: 'error' })
      return
    }

    setIsSavingPassword(true)
    const cleanPassword = newPasswordInput.trim()

    try {
      if (profile) {
        await supabase.auth.updateUser({ password: cleanPassword })
      }

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: cleanPassword,
          adminEmail: profile?.email || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setPasswordMsg({
          text: '¡Contraseña de administrador actualizada con éxito en la base de datos! Ahora puedes entrar con tu nueva contraseña.',
          type: 'success',
        })
        setNewPasswordInput('')
        setConfirmPasswordInput('')
      } else {
        setPasswordMsg({ text: data.error || 'Error al actualizar la contraseña.', type: 'error' })
      }
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Error al actualizar la contraseña.', type: 'error' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('gucci_admin_session')
    setIsLocallyAuthorized(false)
    if (profile) signOut()
  }

  async function uploadImage(file: File): Promise<string | null> {
    // 1. Try local server upload (saved to public/uploads/ as lightweight WebP)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/products/upload', {
        method: 'POST',
        body: fd,
      })
      if (res.ok) {
        const data = await res.json()
        if (data.url) return data.url
      }
    } catch (err) {
      console.warn('Local upload failed, trying fallbacks:', err)
    }

    // 2. Try Supabase storage fallback
    try {
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filename, file, { contentType: 'image/webp', upsert: false })
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path)
        if (urlData?.publicUrl) return urlData.publicUrl
      }
    } catch (e) {
      console.warn('Supabase storage fallback failed:', e)
    }

    // 3. Ultra-safe fallback: Data URL (only ~60-80 KB since image is already compressed WebP)
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }

  const handleImageFile = async (file: File) => {
    try {
      setIsOptimizing(true)
      // Smart optimization: max 900px, quality 0.78 WebP (~60-120 KB, crystal sharp, ultra fast)
      const result = await optimizeProductImage(file, { maxWidth: 900, maxHeight: 1200, quality: 0.78 })
      setImageFile(result.file)
      setImagePreview(result.previewUrl)
      setCompressionStats(result)
      setFormData((f) => ({ ...f, image_url: '' }))
    } catch (err) {
      console.error('Error optimizando imagen:', err)
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setCompressionStats(null)
    } finally {
      setIsOptimizing(false)
    }
  }

  const openAdd = () => {
    setEditingProduct(null)
    setFormData(emptyForm)
    setImageFile(null)
    setImagePreview('')
    setCompressionStats(null)
    setIsOptimizing(false)
    setIsModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    const { stock, cleanDescription } = parseStockFromDescription(product.description)
    setFormData({
      title: product.title,
      description: cleanDescription,
      price: product.price,
      category: product.category,
      platform: product.platform,
      image_url: product.image_url,
      points_reward: product.points_reward,
      is_available: product.is_available,
      stock: stock,
    })
    setImagePreview(product.image_url)
    setImageFile(null)
    setCompressionStats(null)
    setIsOptimizing(false)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    let imageUrl = formData.image_url

    if (imageFile) {
      const uploaded = await uploadImage(imageFile)
      if (!uploaded) {
        alert('Error al procesar la imagen.')
        setSubmitting(false)
        return
      }
      imageUrl = uploaded
    }

    const currentStock = formData.stock !== undefined ? Number(formData.stock) : 5
    const cleanDesc = formData.description ?? ''
    const formattedDescription = formatStockInDescription(cleanDesc, currentStock)

    const payload = {
      title: formData.title,
      description: formattedDescription,
      category: formData.category,
      platform: formData.platform,
      is_available: currentStock > 0 ? formData.is_available : false,
      image_url: imageUrl || '/images/categories/video-games.jpg',
      price: Number(formData.price),
      points_reward: Number(formData.points_reward) || 10,
    }

    try {
      if (editingProduct) {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        })
        if (!res.ok) throw new Error('Error al actualizar')
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Error al crear producto')
      }

      setIsModalOpen(false)
      await fetchProducts()
      setSubmitting(false)
      setSuccessMsg(editingProduct ? '¡Producto actualizado con éxito!' : '¡Producto publicado con éxito en la tienda!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      console.error('Error saving product:', err)
      alert('Hubo un error al guardar el producto. Por favor intenta nuevamente.')
      setSubmitting(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto del catálogo?')) return
    try {
      // Optimistic update: remove immediately so the user sees instant feedback
      setProducts((prev) => prev.filter((p) => p.id !== id))

      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('No se pudo eliminar en el servidor')
      }
      setSuccessMsg('Producto eliminado del catálogo.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e) {
      console.warn('API delete fallback to Supabase:', e)
      await supabase.from('products').delete().eq('id', id)
      fetchProducts()
    }
  }

  const toggleAvailability = async (product: Product) => {
    const nextStock = !product.is_available
    // Optimistic update: toggle switch instantly
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_available: nextStock } : p))
    )
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, is_available: nextStock }),
      })
      if (!res.ok) throw new Error('Error al actualizar disponibilidad')
    } catch (e) {
      console.warn('API update fallback to Supabase:', e)
      await supabase.from('products').update({ is_available: nextStock }).eq('id', product.id)
      fetchProducts()
    }
  }

  const handlePointsSubmit = async () => {
    if (!pointsModal || !pointsAmount || !pointsReason.trim()) return
    setPointsSubmitting(true)
    const change = pointsModal.mode === 'add' ? pointsAmount : -pointsAmount
    const newPoints = Math.max(0, pointsModal.client.gucci_points + change)
    await supabase.from('point_transactions').insert({
      user_id: pointsModal.client.id,
      points_change: change,
      reason: pointsReason,
      created_by: profile!.id,
    })
    await supabase.from('profiles').update({ gucci_points: newPoints }).eq('id', pointsModal.client.id)
    setPointsModal(null)
    setPointsAmount(0)
    setPointsReason('')
    setPointsSubmitting(false)
    fetchClients()
  }

  const filteredProducts = products.filter((p) => {
    const matchSearch = (p.title || '').toLowerCase().includes(searchProducts.toLowerCase())
    const matchCat = filterCategory === 'all' || p.category === filterCategory
    return matchSearch && matchCat
  })

  const filteredClients = clients.filter((c) =>
    c.username.toLowerCase().includes(searchClients.toLowerCase()) ||
    (c.phone ?? '').includes(searchClients)
  )

  const totalRevenue = products.reduce((s, p) => s + p.price, 0)
  const availableCount = products.filter((p) => p.is_available).length
  const clientCount = clients.filter((c) => c.role === 'client').length
  const totalPoints = clients.reduce((s, c) => s + c.gucci_points, 0)

  if (loading && !isLocallyAuthorized) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm font-semibold">Cargando panel...</p>
        </div>
      </div>
    )
  }


  // If not authorized as admin, display the Circular PIN Keypad matching the user reference
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07070A] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-sm flex flex-col items-center">
          
          {/* Header Title matching reference */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ingrese su contraseña
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Panel de Administración Gucci Games
            </p>
          </div>

          {/* Dots Indicator (4 circles) */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pinCode.length > index
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? 'bg-[#FACC15] border-2 border-[#FACC15] shadow-[0_0_12px_rgba(250,204,21,0.8)] scale-110'
                      : 'border-2 border-amber-400/40 bg-transparent'
                  }`}
                />
              )
            })}
          </div>

          {/* Error message / Attempts notice */}
          <div className="min-h-[28px] flex items-center justify-center mb-4 px-4 text-center">
            {authError && (
              <span className="text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-3 py-1 rounded-full animate-shake">
                {authError}
              </span>
            )}
          </div>

          {/* Circular Keypad (3x3 numbers + 0 + delete) */}
          <div className="grid grid-cols-3 gap-5 sm:gap-6 mb-8 w-full max-w-[280px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePressDigit(digit)}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border border-amber-400/30 bg-white/[0.04] hover:bg-amber-400/20 hover:border-amber-400 active:scale-95 text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-black/50"
              >
                {digit}
              </button>
            ))}

            {/* Empty space */}
            <div className="w-18 h-18 sm:w-20 sm:h-20" />

            {/* 0 button */}
            <button
              type="button"
              onClick={() => handlePressDigit('0')}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border border-amber-400/30 bg-white/[0.04] hover:bg-amber-400/20 hover:border-amber-400 active:scale-95 text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-black/50"
            >
              0
            </button>

            {/* Backspace button */}
            <button
              type="button"
              onClick={handleDeleteDigit}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border border-amber-400/30 bg-white/[0.04] hover:bg-amber-400/20 hover:border-amber-400 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-black/50"
              title="Borrar dígito"
            >
              <Delete size={26} className="text-white" />
            </button>
          </div>

          {/* Bottom Enter Pill Button matching reference */}
          <div className="w-full flex justify-center mb-6">
            <button
              type="button"
              onClick={() => verifyPinDirect()}
              disabled={isLoggingIn || pinCode.length === 0}
              className={`flex items-center justify-center gap-2 px-9 py-3 rounded-full font-black text-sm transition-all duration-200 cursor-pointer shadow-lg ${
                pinCode.length > 0
                  ? 'bg-[#FACC15] hover:bg-[#EAB308] text-black shadow-amber-400/30 hover:scale-105 active:scale-95'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
            >
              <LogIn size={18} className={pinCode.length > 0 ? 'text-black' : 'text-zinc-500'} />
              <span>Entrar</span>
            </button>
          </div>

          {/* Discreet account login toggle and Back to store link */}
          <div className="flex flex-col items-center gap-2 pt-2 border-t border-zinc-800/80 w-full text-center">
            {loginMethod === 'pin' ? (
              <button
                type="button"
                onClick={() => setLoginMethod('account')}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                Ingresar con correo o contraseña de usuario
              </button>
            ) : (
              <form onSubmit={handleAdminLogin} className="w-full space-y-3 mt-3">
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="usuario@dominio.com"
                  className="w-full bg-[#111118] border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Contraseña..."
                  className="w-full bg-[#111118] border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#FACC15] text-black font-black py-2 rounded-xl text-xs hover:bg-[#EAB308]"
                  >
                    Ingresar
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('pin')}
                    className="px-3 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700"
                  >
                    Volver al teclado
                  </button>
                </div>
              </form>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#FACC15] transition-colors mt-2"
            >
              <ChevronLeft size={14} />
              <span>Volver a la tienda</span>
            </Link>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#09090B] text-zinc-900 dark:text-white transition-colors duration-200">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/96 dark:bg-[#09090B]/96 backdrop-blur-2xl border-b border-zinc-200 dark:border-[#1E1E26] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3 sm:gap-4">
          <Link href="/" className="w-8 h-8 bg-zinc-100 dark:bg-[#18181B] hover:bg-zinc-200 dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all" title="Ir a la Tienda">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500/15 dark:bg-[#FACC15]/15 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-amber-600 dark:text-[#FACC15]" />
            </div>
            <div>
              <p className="text-sm font-black text-zinc-950 dark:text-white leading-none">Panel Admin</p>
              <p className="text-[10px] text-zinc-500 leading-none mt-0.5">Gucci Games Control Center</p>
            </div>
          </div>
          <div className="flex-1" />
          {successMsg && (
            <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-xl">
              <Check size={13} />
              {successMsg}
            </div>
          )}
          <ThemeToggle id="admin-theme-toggle" />
          <button
            onClick={() => { fetchProducts(); fetchClients() }}
            className="w-8 h-8 bg-zinc-100 dark:bg-[#18181B] hover:bg-zinc-200 dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-[#FACC15] transition-all cursor-pointer"
            title="Actualizar"
          >
            <RefreshCw size={14} />
          </button>
          <div className="flex items-center gap-2 bg-amber-500/10 dark:bg-[#FACC15]/10 border border-amber-500/20 dark:border-[#FACC15]/20 px-3 py-1.5 rounded-xl">
            <div className="w-6 h-6 bg-amber-400 dark:bg-[#FACC15] text-black font-black text-xs rounded-md flex items-center justify-center">
              {profile?.username ? profile.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-[#FACC15]">{profile?.username || 'Admin'}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleAdminLogout}
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-[#2B2B38] hover:border-red-500/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            title="Cerrar sesión del panel"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<Package size={18} />} label="Productos en catalogo" value={products.length} sub={`${availableCount} disponibles`} color="#FACC15" />
          <StatCard icon={<DollarSign size={18} />} label="Valor total catalogo" value={`Bs. ${totalRevenue.toLocaleString('es-BO', { minimumFractionDigits: 0 })}`} sub="Suma de precios" color="#34D399" />
          <StatCard icon={<Users size={18} />} label="Clientes registrados" value={clientCount} sub="Miembros activos" color="#38BDF8" />
          <StatCard icon={<Zap size={18} />} label="Puntos Gucci emitidos" value={totalPoints.toLocaleString()} sub="Total en circulacion" color="#A78BFA" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-zinc-100 dark:bg-[#111118] border border-zinc-200 dark:border-[#1E1E26] p-1 rounded-2xl w-fit">
          {([
            { id: 'products' as AdminTab, icon: <Package size={15} />, label: `Inventario (${products.length})` },
            { id: 'clients' as AdminTab, icon: <Users size={15} />, label: `Clientes (${clientCount})` },
            { id: 'settings' as AdminTab, icon: <Settings size={15} />, label: 'Ajustes' },
          ] as const).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                tab === id
                  ? 'bg-amber-400 dark:bg-[#FACC15] text-black shadow-xs dark:shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="flex items-center gap-3 flex-1 w-full">
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="search"
                    value={searchProducts}
                    onChange={(e) => setSearchProducts(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full bg-white dark:bg-[#111118] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white dark:bg-[#111118] border border-zinc-200 dark:border-[#1E1E26] text-zinc-800 dark:text-zinc-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors cursor-pointer appearance-none pr-8"
                  >
                    <option value="all">Todas</option>
                    <option value="general">General</option>
                    <option value="mju">MJU Usados</option>
                    <option value="retro">Retro Japan</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                </div>
              </div>
              <button
                id="add-product-btn"
                onClick={openAdd}
                className="flex items-center gap-2 bg-[#FACC15] hover:bg-[#EAB308] text-black font-black px-5 py-2.5 rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.25)] text-sm cursor-pointer flex-shrink-0"
              >
                <Plus size={16} />
                Nuevo Producto
              </button>
            </div>

            <p className="text-xs text-zinc-500 mb-4">
              <span className="text-zinc-300 font-bold">{filteredProducts.length}</span> de {products.length} productos
            </p>

            {loadingData ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-[#111118] border border-[#1E1E26] rounded-2xl">
                <Gamepad2 size={40} className="mx-auto text-zinc-600 mb-3" />
                <p className="text-zinc-400 font-semibold">Sin productos</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredProducts.map((product) => {
                  const catColor = product.category === 'mju' ? '#FACC15' : product.category === 'retro' ? '#38BDF8' : '#A1A1AA'
                  const catLabel = product.category === 'mju' ? 'MJU' : product.category === 'retro' ? 'Retro' : 'General'
                  return (
                    <div key={product.id} className="flex items-center gap-4 bg-white dark:bg-[#111118] border border-zinc-200 dark:border-[#1E1E26] hover:border-amber-400 dark:hover:border-[#2E2E3C] rounded-2xl p-4 transition-all group shadow-xs">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-[#0D0D13] flex-shrink-0 border border-zinc-200 dark:border-[#1E1E26]">
                        {product.image_url ? (
                           <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-zinc-950 dark:text-white text-sm truncate">{product.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[11px] text-zinc-500">{product.platform}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${catColor}18`, color: catColor }}>{catLabel}</span>
                          {(() => {
                            const { stock } = parseStockFromDescription(product.description)
                            if (stock <= 0) {
                              return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">Agotado (0 uds.)</span>
                            }
                            if (stock <= 2) {
                              return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">¡Últimas {stock} uds!</span>
                            }
                            return <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{stock} en stock</span>
                          })()}
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${product.is_available ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            {product.is_available ? 'Visible' : 'Oculto'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="text-lg font-black text-zinc-950 dark:text-white">Bs. {product.price.toFixed(0)}</p>
                        <div className="flex items-center justify-end gap-1 text-amber-600 dark:text-[#FACC15]">
                          <Zap size={11} fill="currentColor" />
                          <span className="text-xs font-black">{product.points_reward} pts</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => toggleAvailability(product)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${product.is_available ? 'bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-zinc-200 dark:bg-zinc-700/40 hover:bg-zinc-300 dark:hover:bg-zinc-700/70 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`} title={product.is_available ? 'Ocultar' : 'Mostrar'}>
                          {product.is_available ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => openEdit(product)} className="w-8 h-8 bg-zinc-100 dark:bg-[#1E1E2A] hover:bg-zinc-200 dark:hover:bg-[#2A2A3A] rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all cursor-pointer">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 transition-all cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* CLIENTS TAB */}
        {tab === 'clients' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input type="search" value={searchClients} onChange={(e) => setSearchClients(e.target.value)} placeholder="Buscar cliente..." className="w-full bg-white dark:bg-[#111118] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors" />
              </div>
            </div>
            <div className="grid gap-3">
              {filteredClients.filter((c) => c.role === 'client').map((client) => (
                <div key={client.id} className="flex items-center gap-4 bg-white dark:bg-[#111118] border border-zinc-200 dark:border-[#1E1E26] hover:border-amber-400 dark:hover:border-[#2E2E3C] rounded-2xl p-4 transition-all shadow-xs">
                  <div className="w-11 h-11 bg-amber-500/10 dark:bg-[#FACC15]/10 border border-amber-500/20 dark:border-[#FACC15]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="font-black text-amber-700 dark:text-[#FACC15]">{client.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-zinc-950 dark:text-white text-sm">{client.username}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{client.phone ?? 'Sin telefono'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-[#FACC15]/10 border border-amber-500/15 dark:border-[#FACC15]/15 px-3 py-2 rounded-xl flex-shrink-0">
                    <Zap size={12} className="text-amber-600 dark:text-[#FACC15]" fill="currentColor" />
                    <span className="font-black text-amber-700 dark:text-[#FACC15] text-sm">{client.gucci_points.toLocaleString()}</span>
                    <span className="text-[10px] text-amber-700/60 dark:text-[#FACC15]/60 font-bold">pts</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => { setPointsModal({ client, mode: 'add' }); setPointsAmount(0); setPointsReason('') }} className="w-8 h-8 bg-green-500/10 hover:bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 transition-all cursor-pointer" title="Sumar puntos">
                      <Plus size={14} />
                    </button>
                    <button onClick={() => { setPointsModal({ client, mode: 'sub' }); setPointsAmount(0); setPointsReason('') }} className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-all cursor-pointer" title="Restar puntos">
                      <Minus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB ("Ajustes" for changing PIN / Password) */}
        {tab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111118] border border-zinc-200 dark:border-[#1E1E26] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-100 dark:border-[#1E1E26]">
                <div className="w-12 h-12 bg-amber-500/15 dark:bg-[#FACC15]/15 border border-amber-500/30 dark:border-[#FACC15]/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-[#FACC15]">
                  <KeyRound size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-950 dark:text-white">Seguridad y Clave de Acceso</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Modifica el PIN o contraseña secreta para el acceso de Administrador en la web y la app
                  </p>
                </div>
              </div>

              {/* Status banner */}
              <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-[#FACC15]">Clave Actual de Administrador</p>
                  <p className="text-base font-black text-zinc-900 dark:text-white mt-0.5 font-mono tracking-widest">
                    {showCurrentPin ? activePin : '••••'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="text-xs font-bold text-amber-700 dark:text-[#FACC15] hover:underline cursor-pointer flex items-center gap-1.5 bg-amber-400/15 px-3 py-1.5 rounded-lg border border-amber-400/20"
                >
                  {showCurrentPin ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showCurrentPin ? 'Ocultar' : 'Ver Clave'}</span>
                </button>
              </div>

              {settingsMsg && (
                <div
                  className={`mb-5 p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    settingsMsg.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-300'
                  }`}
                >
                  {settingsMsg.type === 'success' ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-red-500" />}
                  <span>{settingsMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveNewPin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Nueva Clave / PIN (ej. 2026 o código de 4 dígitos)
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Escribe la nueva clave..."
                    className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors font-mono"
                  />
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Esta clave servirá para entrar por el teclado circular en la web y al tocar dos veces el logo en la app móvil.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Confirmar Nueva Clave
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="Repite la nueva clave..."
                    className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPin || !newPinInput}
                    className="w-full bg-[#FACC15] hover:bg-[#EAB308] disabled:opacity-50 text-black font-black py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_20px_rgba(250,204,21,0.25)] text-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSavingPin ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Guardar y Aplicar Nueva Clave</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Card 2: Cambiar Contraseña de Cuenta Administrador */}
            <div className="bg-white dark:bg-[#111118] border border-zinc-200 dark:border-[#1E1E26] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-100 dark:border-[#1E1E26]">
                <div className="w-12 h-12 bg-sky-500/15 dark:bg-[#38BDF8]/15 border border-sky-500/30 dark:border-[#38BDF8]/30 rounded-xl flex items-center justify-center text-sky-600 dark:text-[#38BDF8]">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-950 dark:text-white">Contraseña de Cuenta Administrador</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Modifica la contraseña de acceso para tu cuenta con usuario/correo (ej. deyvi@guccigames.app)
                  </p>
                </div>
              </div>

              {passwordMsg && (
                <div
                  className={`mb-5 p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-300'
                  }`}
                >
                  {passwordMsg.type === 'success' ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-red-500" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveNewPassword} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Nueva Contraseña de Cuenta (mínimo 6 caracteres)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAccountPassword(!showAccountPassword)}
                      className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                    >
                      {showAccountPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showAccountPassword ? 'Ocultar' : 'Mostrar'}</span>
                    </button>
                  </div>
                  <input
                    type={showAccountPassword ? 'text' : 'password'}
                    minLength={6}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Escribe la nueva contraseña..."
                    className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type={showAccountPassword ? 'text' : 'password'}
                    minLength={6}
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Repite la nueva contraseña..."
                    className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPassword || !newPasswordInput}
                    className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md text-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSavingPassword ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Actualizar Contraseña de Cuenta</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full sm:max-w-xl bg-white dark:bg-[#111118] border border-zinc-200 dark:border-[#27272A] rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* handle for mobile */}
            <div className="w-10 h-1 bg-zinc-300 dark:bg-[#27272A] rounded-full mx-auto mt-3 sm:hidden" />
            <div className="sticky top-0 bg-white/96 dark:bg-[#111118]/96 backdrop-blur-lg border-b border-zinc-200 dark:border-[#1E1E26] px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/15 dark:bg-[#FACC15]/15 rounded-lg flex items-center justify-center">
                  {editingProduct ? <Pencil size={15} className="text-amber-600 dark:text-[#FACC15]" /> : <Plus size={15} className="text-amber-600 dark:text-[#FACC15]" />}
                </div>
                <h3 className="text-base font-black text-zinc-950 dark:text-white">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-zinc-100 dark:bg-[#1E1E2A] hover:bg-zinc-200 dark:hover:bg-[#27272A] rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Imagen del Producto *
                  </label>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Zap size={11} className="fill-current" />
                    Auto-compresión ligera WebP
                  </span>
                </div>

                <ImageDropzone
                  preview={imagePreview}
                  onFile={handleImageFile}
                  isOptimizing={isOptimizing}
                />

                {/* Live Compression Results Badge */}
                {compressionStats && (
                  <div className="mt-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-500/30 dark:border-emerald-500/40 rounded-xl animate-in fade-in transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                        <Zap size={14} className="fill-current text-emerald-600 dark:text-emerald-400" />
                        Imagen Optimizada para el Servidor
                      </span>
                      <span className="text-[11px] font-black bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                        -{compressionStats.savedPercent}% de peso reducido
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white dark:bg-[#14141C] p-2 rounded-lg border border-emerald-500/20 shadow-xs">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Original</p>
                        <p className="font-bold text-zinc-500 dark:text-zinc-400 line-through mt-0.5">
                          {compressionStats.originalSizeStr}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-[#14141C] p-2 rounded-lg border border-emerald-500/30 shadow-xs">
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider">
                          Optimizado
                        </p>
                        <p className="font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                          {compressionStats.compressedSizeStr}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-[#14141C] p-2 rounded-lg border border-emerald-500/20 shadow-xs">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Formato</p>
                        <p className="font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">
                          WebP {compressionStats.width}px
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2 font-medium flex items-center gap-1.5">
                      <Check size={13} className="stroke-[3]" />
                      Listo para guardar: carga instantánea para clientes y consumo mínimo en el servidor.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-[#1E1E26]" />
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-600 font-bold">o pega una URL</span>
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-[#1E1E26]" />
                </div>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData((f) => ({ ...f, image_url: e.target.value }))
                    if (e.target.value) {
                      setImagePreview(e.target.value)
                      setImageFile(null)
                      setCompressionStats(null)
                    } else {
                      setImagePreview('')
                    }
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Titulo *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))} placeholder="Ej: The Legend of Zelda" className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Descripcion</label>
                <textarea rows={2} value={formData.description ?? ''} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="Estado, condicion, contenido incluido..." className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors resize-none" />
              </div>

              {/* Platform & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Plataforma *</label>
                  <div className="relative">
                    <select value={formData.platform} onChange={(e) => setFormData(f => ({ ...f, platform: e.target.value }))} className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors appearance-none cursor-pointer pr-8">
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Categoria *</label>
                  <div className="relative">
                    <select value={formData.category} onChange={(e) => setFormData(f => ({ ...f, category: e.target.value as any }))} className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors appearance-none cursor-pointer pr-8">
                      <option value="general">General</option>
                      <option value="mju">MJU - Usados</option>
                      <option value="retro">Retro Japan</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Price, Points & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Precio (Bs.) *</label>
                  <input type="number" required min="0" step="0.01" value={formData.price || ''} onChange={(e) => setFormData(f => ({ ...f, price: Number(e.target.value) }))} placeholder="0" className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Puntos Gucci</label>
                  <input type="number" min="0" value={formData.points_reward || ''} onChange={(e) => setFormData(f => ({ ...f, points_reward: Number(e.target.value) }))} placeholder="10" className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Stock (uds.) *</label>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      (formData.stock ?? 5) === 0 ? 'bg-red-500/20 text-red-500' : (formData.stock ?? 5) <= 2 ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {(formData.stock ?? 5) === 0 ? 'Agotado' : (formData.stock ?? 5) <= 2 ? 'Poco stock' : 'OK'}
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.stock ?? 5}
                    onChange={(e) => {
                      const val = Math.max(0, parseInt(e.target.value, 10) || 0)
                      setFormData(f => ({
                        ...f,
                        stock: val,
                        is_available: val === 0 ? false : f.is_available,
                      }))
                    }}
                    placeholder="5"
                    className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors font-black text-amber-600 dark:text-[#FACC15]"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] rounded-xl">
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Disponible para venta</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{formData.is_available ? 'Visible en el catalogo' : 'Oculto para clientes'}</p>
                </div>
                <button type="button" onClick={() => setFormData(f => ({ ...f, is_available: !f.is_available }))} className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${formData.is_available ? 'bg-amber-400 dark:bg-[#FACC15]' : 'bg-zinc-300 dark:bg-[#27272A]'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${formData.is_available ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Preview */}
              {formData.title && (
                <div className="p-4 bg-amber-500/5 dark:bg-[#FACC15]/5 border border-amber-500/20 dark:border-[#FACC15]/20 rounded-xl">
                  <p className="text-xs font-black text-amber-700 dark:text-[#FACC15] mb-2 uppercase tracking-wider">Vista previa</p>
                  <div className="flex items-center gap-3">
                    {(imagePreview || formData.image_url) && (
                      <img src={imagePreview || formData.image_url} className="w-10 h-10 rounded-lg object-cover border border-amber-500/20 dark:border-[#FACC15]/20" alt="" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">{formData.title}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{formData.platform} — Bs. {Number(formData.price).toFixed(0)} — {formData.points_reward} pts</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={submitting} className="w-full bg-amber-400 dark:bg-[#FACC15] hover:bg-amber-500 dark:hover:bg-[#EAB308] disabled:opacity-50 text-black font-black py-3.5 rounded-xl transition-all hover:scale-[1.01] shadow-md dark:shadow-[0_0_20px_rgba(250,204,21,0.25)] text-sm cursor-pointer flex items-center justify-center gap-2">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />Guardando...</>
                ) : (
                  <><Check size={16} />{editingProduct ? 'Guardar Cambios' : 'Publicar Producto'}</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POINTS MODAL */}
      {pointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPointsModal(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#111118] border border-zinc-200 dark:border-[#27272A] rounded-2xl shadow-2xl overflow-hidden">
            <div className={`h-1.5 w-full ${pointsModal.mode === 'add' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-zinc-950 dark:text-white text-lg">
                  {pointsModal.mode === 'add' ? 'Sumar Puntos' : 'Restar Puntos'}
                </h3>
                <button onClick={() => setPointsModal(null)} className="w-7 h-7 bg-zinc-100 dark:bg-[#1E1E2A] hover:bg-zinc-200 dark:hover:bg-[#27272A] rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all cursor-pointer">
                  <X size={15} />
                </button>
              </div>
              <div className="flex items-center gap-3 mb-6 p-3 bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] rounded-xl">
                <div className="w-10 h-10 bg-amber-500/10 dark:bg-[#FACC15]/10 border border-amber-500/20 dark:border-[#FACC15]/20 rounded-xl flex items-center justify-center">
                  <span className="font-black text-amber-700 dark:text-[#FACC15]">{pointsModal.client.username.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-black text-zinc-950 dark:text-white text-sm">{pointsModal.client.username}</p>
                  <p className="text-xs text-zinc-500">Saldo: <span className="text-amber-700 dark:text-[#FACC15] font-black">{pointsModal.client.gucci_points} pts</span></p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Puntos</label>
                  <input type="number" min="1" value={pointsAmount || ''} onChange={(e) => setPointsAmount(Number(e.target.value))} placeholder="Ej: 50" className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Motivo</label>
                  <input type="text" value={pointsReason} onChange={(e) => setPointsReason(e.target.value)} placeholder="Ej: Compra de Zelda Switch" className="w-full bg-zinc-50 dark:bg-[#0D0D13] border border-zinc-200 dark:border-[#1E1E26] text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 text-sm placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 dark:focus:border-[#FACC15]/60 transition-colors" />
                </div>
                {pointsAmount > 0 && (
                  <div className={`p-3.5 rounded-xl text-sm font-bold flex items-center justify-between ${pointsModal.mode === 'add' ? 'bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400'}`}>
                    <span>Nuevo saldo:</span>
                    <span className="font-black text-base">{Math.max(0, pointsModal.client.gucci_points + (pointsModal.mode === 'add' ? pointsAmount : -pointsAmount)).toLocaleString()} pts</span>
                  </div>
                )}
                <button onClick={handlePointsSubmit} disabled={pointsSubmitting || !pointsAmount || !pointsReason.trim()} className={`w-full font-black py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer text-sm ${pointsModal.mode === 'add' ? 'bg-green-500 hover:bg-green-400 text-white' : 'bg-red-500 hover:bg-red-400 text-white'}`}>
                  {pointsSubmitting ? 'Aplicando...' : pointsModal.mode === 'add' ? `+ Sumar ${pointsAmount || 0} Puntos` : `- Restar ${pointsAmount || 0} Puntos`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
