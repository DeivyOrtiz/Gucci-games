import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import type { Product } from '@/lib/types'

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'custom_products.json')
const deletedFilePath = path.join(process.cwd(), 'src', 'data', 'deleted_products.json')

function getCustomProducts(): Product[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf-8')
      return JSON.parse(content) || []
    }
  } catch (err) {
    console.error('Error reading custom_products.json:', err)
  }
  return []
}

function saveCustomProducts(products: Product[]): void {
  try {
    const dir = path.dirname(dataFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error saving custom_products.json:', err)
  }
}

function getDeletedProductIds(): Set<string> {
  try {
    if (fs.existsSync(deletedFilePath)) {
      const content = fs.readFileSync(deletedFilePath, 'utf-8')
      const arr = JSON.parse(content)
      return new Set(Array.isArray(arr) ? arr : [])
    }
  } catch (err) {
    console.error('Error reading deleted_products.json:', err)
  }
  return new Set()
}

function saveDeletedProductId(id: string): void {
  try {
    const deleted = getDeletedProductIds()
    deleted.add(id)
    const dir = path.dirname(deletedFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(deletedFilePath, JSON.stringify(Array.from(deleted), null, 2), 'utf-8')
  } catch (err) {
    console.error('Error saving deleted_products.json:', err)
  }
}

function unmarkDeletedProductId(id: string): void {
  try {
    const deleted = getDeletedProductIds()
    if (deleted.has(id)) {
      deleted.delete(id)
      fs.writeFileSync(deletedFilePath, JSON.stringify(Array.from(deleted), null, 2), 'utf-8')
    }
  } catch (err) {
    console.error('Error unmarking deleted_products.json:', err)
  }
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cvvscyggwthlcdrebjys.supabase.co'
  // Service role key bypasses RLS — required for server-side product writes
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_U_m710t_BwuFrCcdzF6h1w_PlvJrrxv'
  return createClient(url, key)
}

// GET: Unified product catalog (Supabase + Local Custom Products)
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')

    const deletedIds = getDeletedProductIds()

    // Fetch from Supabase
    let supabaseProducts: Product[] = []
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        supabaseProducts = (data as Product[]).filter((p) => !deletedIds.has(p.id))
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using local products:', err)
    }

    // Fetch custom products
    const customProducts = getCustomProducts().filter((p) => !deletedIds.has(p.id))

    // Merge: custom products take precedence or append
    const customIds = new Set(customProducts.map((p) => p.id))
    const merged = [
      ...customProducts,
      ...supabaseProducts.filter((p) => !customIds.has(p.id)),
    ]

    // Sort by created_at descending
    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Apply filters if provided
    let filtered = merged
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category)
    }
    if (platform && platform !== 'all') {
      filtered = filtered.filter((p) => p.platform?.toLowerCase().includes(platform.toLowerCase()))
    }
    if (search && search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.platform && p.platform.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
    }

    return NextResponse.json({ products: filtered, total: filtered.length })
  } catch (err: any) {
    console.error('Error fetching products API:', err)
    return NextResponse.json({ error: err.message, products: getCustomProducts() }, { status: 500 })
  }
}

// POST: Add new product (Persists locally and attempts Supabase)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // ── Validation: reject incomplete products ──────────────────────────────
    if (!body.title || !String(body.title).trim()) {
      return NextResponse.json({ error: 'El campo Título es obligatorio.' }, { status: 400 })
    }
    if (!body.price || Number(body.price) <= 0) {
      return NextResponse.json({ error: 'El Precio debe ser mayor a 0.' }, { status: 400 })
    }
    // ────────────────────────────────────────────────────────────────────────

    const now = new Date().toISOString()

    // Ensure ID is a valid UUID for Supabase compatibility
    const isValidUUID = body.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id)
    const productId = isValidUUID ? body.id : crypto.randomUUID()

    const newProduct: Product = {
      id: productId,
      title: body.title.trim(),
      description: body.description || null,
      price: Number(body.price),
      category: body.category || 'general',
      platform: body.platform || 'PS5',
      image_url: body.image_url || '/images/categories/video-games.jpg',
      points_reward: Number(body.points_reward) || 10,
      is_available: body.is_available !== false,
      created_at: now,
      updated_at: now,
    }

    // 1. Save to local JSON storage
    const currentProducts = getCustomProducts()
    currentProducts.unshift(newProduct)
    saveCustomProducts(currentProducts)

    // 2. Also attempt Supabase insert in background
    try {
      const supabase = getSupabaseClient()
      await supabase.from('products').insert([newProduct])
    } catch (e) {
      // Ignored if RLS blocks, product is already safe in custom_products.json
    }

    return NextResponse.json({ product: newProduct, success: true }, { status: 201 })
  } catch (err: any) {
    console.error('Error creating product API:', err)
    return NextResponse.json({ error: err.message || 'Error al crear producto' }, { status: 500 })
  }
}

// PUT: Update existing product
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const currentProducts = getCustomProducts()
    const index = currentProducts.findIndex((p) => p.id === id)

    let updatedProduct: Product
    if (index !== -1) {
      updatedProduct = {
        ...currentProducts[index],
        ...updates,
        price: Number(updates.price ?? currentProducts[index].price),
        points_reward: Number(updates.points_reward ?? currentProducts[index].points_reward),
        updated_at: new Date().toISOString(),
      }
      currentProducts[index] = updatedProduct
      saveCustomProducts(currentProducts)
    } else {
      // Not in custom products yet (was in Supabase), add to custom products with updates
      updatedProduct = {
        id,
        title: updates.title,
        description: updates.description || null,
        price: Number(updates.price),
        category: updates.category || 'general',
        platform: updates.platform || 'PS5',
        image_url: updates.image_url,
        points_reward: Number(updates.points_reward) || 10,
        is_available: updates.is_available !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      currentProducts.unshift(updatedProduct)
      saveCustomProducts(currentProducts)
    }

    // Also attempt Supabase update
    try {
      const supabase = getSupabaseClient()
      await supabase.from('products').update(updates).eq('id', id)
    } catch (e) {
      // Ignored if RLS blocks
    }

    return NextResponse.json({ product: updatedProduct, success: true })
  } catch (err: any) {
    console.error('Error updating product API:', err)
    return NextResponse.json({ error: err.message || 'Error al actualizar producto' }, { status: 500 })
  }
}

// DELETE: Delete product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Remove from local custom products
    const currentProducts = getCustomProducts()
    const filtered = currentProducts.filter((p) => p.id !== id)
    saveCustomProducts(filtered)

    // Mark as deleted in persistent blacklist
    saveDeletedProductId(id)

    // Also attempt Supabase delete
    try {
      const supabase = getSupabaseClient()
      await supabase.from('products').delete().eq('id', id)
    } catch (e) {
      console.warn('Supabase delete attempt:', e)
    }

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    console.error('Error deleting product API:', err)
    return NextResponse.json({ error: err.message || 'Error al eliminar producto' }, { status: 500 })
  }
}
