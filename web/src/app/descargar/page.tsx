'use client'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AppDownloadSection } from '@/components/AppDownloadSection'

export default function DescargarPage() {
  const whatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '59177617306'

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0D] text-zinc-900 dark:text-white selection:bg-[#FACC15] selection:text-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-14">
        <AppDownloadSection />
      </main>
      <Footer whatsAppNumber={whatsAppNumber} />
    </div>
  )
}
