import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cvvscyggwthlcdrebjys.supabase.co'
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_U_m710t_BwuFrCcdzF6h1w_PlvJrrxv'
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo de imagen' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.endsWith('.webp') ? '.webp' : path.extname(file.name) || '.webp'
    const filename = `prod-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`

    // ── 1. Try Supabase Storage first (public URL, works on web + mobile) ──
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filename, buffer, {
          contentType: file.type || 'image/webp',
          upsert: false,
        })

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path)

        if (urlData?.publicUrl) {
          // Also save locally as backup
          try {
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
            fs.writeFileSync(path.join(uploadsDir, filename), buffer)
          } catch (_) { /* ignore local backup failure */ }

          return NextResponse.json({
            url: urlData.publicUrl,
            success: true,
            size: buffer.length,
            storage: 'supabase',
          })
        }
      }
      console.warn('Supabase storage upload error:', error?.message)
    } catch (supabaseErr) {
      console.warn('Supabase storage unavailable, falling back to local:', supabaseErr)
    }

    // ── 2. Fallback: save locally (only works when web & mobile on same LAN) ──
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
    const filePath = path.join(uploadsDir, filename)
    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/uploads/${filename}`
    return NextResponse.json({ url: publicUrl, success: true, size: buffer.length, storage: 'local' })
  } catch (err: any) {
    console.error('Error al guardar imagen en servidor:', err)
    return NextResponse.json({ error: err.message || 'Error al guardar imagen' }, { status: 500 })
  }
}
