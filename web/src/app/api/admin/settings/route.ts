import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cvvscyggwthlcdrebjys.supabase.co'
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_U_m710t_BwuFrCcdzF6h1w_PlvJrrxv'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Optional local tmp file fallback
const TMP_FILE = path.join(process.cwd(), 'src', 'data', 'admin_settings.json')

function getLocalFallback(): string | null {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_FILE, 'utf-8'))
      return data.pin || null
    }
  } catch {}
  return null
}

function saveLocalFallback(pin: string) {
  try {
    const dir = path.dirname(TMP_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(TMP_FILE, JSON.stringify({ pin, updated_at: new Date().toISOString() }, null, 2))
  } catch {}
}

export async function GET() {
  try {
    // 1. Try fetching from Supabase profiles (admin role)
    const { data: admins, error } = await supabaseAdmin
      .from('profiles')
      .select('phone, username')
      .eq('role', 'admin')

    if (!error && admins && admins.length > 0) {
      for (const admin of admins) {
        if (admin.phone) {
          const clean = admin.phone.replace(/^PIN:/i, '').trim()
          if (clean.length >= 4) {
            return NextResponse.json({
              pin: clean,
              source: 'supabase',
              updated_at: new Date().toISOString(),
            })
          }
        }
      }
    }

    // 2. Try local fallback
    const local = getLocalFallback()
    if (local) {
      return NextResponse.json({ pin: local, source: 'local' })
    }

    // 3. Default fallback
    return NextResponse.json({ pin: '2026', source: 'default' })
  } catch (err: any) {
    console.error('Error fetching admin pin:', err)
    const local = getLocalFallback()
    return NextResponse.json({ pin: local || '2026', error: err.message })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { newPin, newPassword, adminEmail } = body

    let pinUpdated = false
    let passwordUpdated = false
    let currentPin = '2026'

    // 1. Update Admin PIN
    if (newPin && typeof newPin === 'string') {
      const cleanPin = newPin.trim()
      if (cleanPin.length < 4) {
        return NextResponse.json(
          { error: 'La clave o PIN debe tener al menos 4 caracteres o dígitos' },
          { status: 400 }
        )
      }

      currentPin = cleanPin
      saveLocalFallback(cleanPin)

      // Update in Supabase across admin profiles
      const { error: dbError } = await supabaseAdmin
        .from('profiles')
        .update({ phone: `PIN:${cleanPin}` })
        .eq('role', 'admin')

      if (dbError) {
        console.warn('Could not update all admin profiles:', dbError)
      } else {
        pinUpdated = true
      }
    }

    // 2. Update Supabase Auth Password if requested
    if (newPassword && typeof newPassword === 'string') {
      const cleanPassword = newPassword.trim()
      if (cleanPassword.length < 6) {
        return NextResponse.json(
          { error: 'La contraseña de la cuenta debe tener al menos 6 caracteres' },
          { status: 400 }
        )
      }

      // Find admin user(s) to update password
      const targetEmails = adminEmail
        ? [adminEmail]
        : [
            'deyvi@guccigames.app',
            'deivy2003ortiz19martinez12@gmail.com',
            'ortizdeivy821@gmail.com',
          ]

      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
      if (usersData?.users) {
        for (const user of usersData.users) {
          if (targetEmails.includes(user.email || '')) {
            const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
              password: cleanPassword,
            })
            if (!authErr) {
              passwordUpdated = true
            } else {
              console.warn(`Error updating auth password for ${user.email}:`, authErr)
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      pin: currentPin,
      pinUpdated,
      passwordUpdated,
      message: 'Configuración actualizada exitosamente en la base de datos.',
    })
  } catch (err: any) {
    console.error('Error saving admin settings:', err)
    return NextResponse.json(
      { error: err.message || 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
