// ============================================================
// GUCCI GAMES - Cliente Supabase compartido (Web + Mobile)
// Configura tus variables de entorno antes de usar
// ============================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ---- TIPOS DE BASE DE DATOS ----
export type UserRole = 'admin' | 'client'
export type ProductCategory = 'general' | 'mju' | 'retro'

export interface Profile {
  id: string
  username: string
  phone: string | null
  role: UserRole
  gucci_points: number
  created_at: string
}

export interface Product {
  id: string
  title: string
  description: string | null
  price: number
  category: ProductCategory
  platform: string
  image_url: string
  points_reward: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface PointTransaction {
  id: string
  user_id: string
  points_change: number
  reason: string
  created_by: string | null
  created_at: string
}

// ---- HELPERS ----
export const ADMIN_WHATSAPP = '+1234567890'  // Reemplaza con el número real

export function buildWhatsAppLink(
  product: Product,
  username: string
): string {
  const message = encodeURIComponent(
    `Hola Gucci Games! Mi usuario es ${username}. ` +
    `Quiero comprar el producto: ${product.title} (${product.platform}) ` +
    `- Precio: Bs. ${product.price}. ` +
    `Puntos acumulables: ${product.points_reward} pts.`
  )
  return `https://wa.me/${ADMIN_WHATSAPP.replace(/\D/g, '')}?text=${message}`
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  general: 'General',
  mju: 'MJU',
  retro: 'Retro',
}

export const CATEGORY_COLORS: Record<ProductCategory, string> = {
  general: '#FACC15',
  mju: '#EAB308',
  retro: '#38BDF8',
}
