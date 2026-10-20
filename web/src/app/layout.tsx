import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Gucci Games | Tienda de Videojuegos Físicos y Coleccionables',
  description: 'Compra videojuegos físicos, juegos usados (MJU) y retro games de Japón. Gana Puntos Gucci en cada compra. PS5, PS4, Switch, SNES, SEGA y más.',
  keywords: 'videojuegos, juegos usados, retro games, PS5, Nintendo Switch, coleccionables, Gucci Games',
  openGraph: {
    title: 'Gucci Games',
    description: 'Tu tienda de videojuegos físicos y coleccionables',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('gucci_theme');
                  var theme = stored || 'dark';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans bg-[#F8F9FA] dark:bg-[#0A0A0D] text-zinc-900 dark:text-white antialiased min-h-screen selection:bg-[#FACC15] selection:text-black transition-colors duration-200`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
