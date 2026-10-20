import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'admin_settings.json')

function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8')
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('Error reading admin settings:', err)
  }
  return { pin: '2026', updated_at: new Date().toISOString() }
}

function saveSettings(settings: any) {
  try {
    const dir = path.dirname(SETTINGS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Error saving admin settings:', err)
    return false
  }
}

export async function GET() {
  const settings = getSettings()
  return NextResponse.json({
    pin: settings.pin || '2026',
    updated_at: settings.updated_at,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { newPin } = body

    if (!newPin || typeof newPin !== 'string' || newPin.trim().length < 4) {
      return NextResponse.json({ error: 'La clave debe tener al menos 4 caracteres o dígitos' }, { status: 400 })
    }

    const current = getSettings()
    const updated = {
      ...current,
      pin: newPin.trim(),
      updated_at: new Date().toISOString(),
    }

    saveSettings(updated)
    return NextResponse.json({ success: true, pin: updated.pin })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar configuración' }, { status: 500 })
  }
}
