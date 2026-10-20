// ============================================================
// GUCCI GAMES - Shared TypeScript Types
// ============================================================

export type UserRole = 'admin' | 'client'
export type ProductCategory = 'general' | 'mju' | 'retro'

export interface Profile {
  id: string
  username: string
  email?: string | null
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

// ---- CONSTANTS ----
export const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '59177617306'

export function buildWhatsAppLink(product: Product, username: string): string {
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

export const PLATFORMS = [
  'PS5', 'PS4', 'Xbox Series X', 'Xbox One',
  'Nintendo Switch', 'PC', 'SNES', 'SEGA Genesis',
  'Nintendo 64', 'Game Boy', 'Otros'
] as const
