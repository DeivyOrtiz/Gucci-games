export interface SubCategoryItem {
  label: string
  category?: 'general' | 'mju' | 'retro' | 'all'
  platform?: string
  badge?: string
  badgeColor?: string
}

export interface MegaMenuColumn {
  title: string
  items: SubCategoryItem[]
}

export interface NavCategory {
  id: string
  label: string
  shortLabel?: string
  categoryFilter?: 'general' | 'mju' | 'retro' | 'all'
  iconImage?: string
  iconEmoji?: string
  isFeatured?: boolean
  featuredType?: 'mju' | 'retro' | 'gold'
  description?: string
  columns: MegaMenuColumn[]
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'mju',
    label: 'MJU — Mi Juego Usado',
    shortLabel: 'MJU Usados',
    categoryFilter: 'mju',
    iconImage: '/images/logo-mju.png',
    iconEmoji: '♻️',
    isFeatured: true,
    featuredType: 'mju',
    description: 'Juegos y consolas pre-owned 100% testeados con garantía Gucci Games.',
    columns: [
      {
        title: 'Consolas MJU',
        items: [
          { label: 'PlayStation 5 Usadas', category: 'mju', platform: 'PS5', badge: 'Garantía' },
          { label: 'PlayStation 4 Usadas', category: 'mju', platform: 'PS4' },
          { label: 'Nintendo Switch Usadas', category: 'mju', platform: 'Nintendo Switch', badge: 'Top Ventas' },
          { label: 'Xbox Series Usadas', category: 'mju', platform: 'Xbox Series X' },
          { label: 'Ver Todas las Consolas MJU', category: 'mju' },
        ]
      },
      {
        title: 'Juegos Populares MJU',
        items: [
          { label: 'Juegos PS5 Pre-Owned', category: 'mju', platform: 'PS5' },
          { label: 'Juegos PS4 Pre-Owned', category: 'mju', platform: 'PS4' },
          { label: 'Juegos Switch Pre-Owned', category: 'mju', platform: 'Nintendo Switch' },
          { label: 'Juegos Xbox Pre-Owned', category: 'mju', platform: 'Xbox One' },
          { label: 'Catálogo Completo MJU', category: 'mju', badge: 'Ahorro' },
        ]
      },
      {
        title: 'Beneficios MJU',
        items: [
          { label: 'Garantía 100% Funcional', category: 'mju', badge: 'Certificado' },
          { label: 'Intercambio de Juegos', category: 'mju' },
          { label: 'Acumula Puntos Gucci x2', category: 'mju', badge: 'Puntos' },
          { label: 'Vende tus Juegos Usados', category: 'mju' },
        ]
      }
    ]
  },
  {
    id: 'retro',
    label: 'Retro Games Japón SCZ',
    shortLabel: 'Retro Japón',
    categoryFilter: 'retro',
    iconImage: '/images/logo-retro.png',
    iconEmoji: '👾',
    isFeatured: true,
    featuredType: 'retro',
    description: 'Clásicos y consolas legendarias importadas directo de Japón.',
    columns: [
      {
        title: 'Nintendo Retro',
        items: [
          { label: 'Super Famicom / SNES', category: 'retro', platform: 'SNES', badge: 'Japón' },
          { label: 'Nintendo 64', category: 'retro', platform: 'Nintendo 64' },
          { label: 'Game Boy & Color & Advance', category: 'retro', platform: 'Game Boy', badge: 'Colección' },
          { label: 'Nintendo GameCube', category: 'retro', platform: 'Otros' },
          { label: 'Famicom / NES Clásica', category: 'retro', platform: 'Otros' },
        ]
      },
      {
        title: 'PlayStation & SEGA Retro',
        items: [
          { label: 'PlayStation 1 (PS1 Japón)', category: 'retro', platform: 'Otros' },
          { label: 'PlayStation 2 (PS2 Japón)', category: 'retro', platform: 'Otros' },
          { label: 'SEGA Mega Drive / Genesis', category: 'retro', platform: 'SEGA Genesis' },
          { label: 'SEGA Saturn & Dreamcast', category: 'retro', platform: 'Otros' },
          { label: 'PSP & PS Vita Japón', category: 'retro', platform: 'Otros' },
        ]
      },
      {
        title: 'Coleccionismo Retro',
        items: [
          { label: 'Cartuchos CIB (Caja & Manual)', category: 'retro', badge: 'Colección' },
          { label: 'Controles y Accesorios Retro', category: 'retro' },
          { label: 'Consolas Modificadas & RGB', category: 'retro' },
          { label: 'Ver Todo Retro Japón', category: 'retro' },
        ]
      }
    ]
  },
  {
    id: 'videojuegos',
    label: 'Videojuegos',
    categoryFilter: 'general',
    iconEmoji: '🎮',
    description: 'Títulos nuevos y en preventa para las plataformas líderes.',
    columns: [
      {
        title: 'Por Plataforma',
        items: [
          { label: 'PlayStation 5 (PS5)', category: 'general', platform: 'PS5', badge: 'Hot' },
          { label: 'Nintendo Switch', category: 'general', platform: 'Nintendo Switch' },
          { label: 'PlayStation 4 (PS4)', category: 'general', platform: 'PS4' },
          { label: 'Xbox Series X/S', category: 'general', platform: 'Xbox Series X' },
          { label: 'Nintendo Switch 2 (Próximamente)', category: 'general', platform: 'Nintendo Switch', badge: 'Próx.' },
        ]
      },
      {
        title: 'Por Género',
        items: [
          { label: 'Acción y Aventura', category: 'general' },
          { label: 'RPG & Rol Japonés', category: 'general' },
          { label: 'Deportes y Carreras', category: 'general' },
          { label: 'Lucha y Competitivo', category: 'general' },
          { label: 'Terror y Supervivencia', category: 'general' },
        ]
      },
      {
        title: 'Destacados',
        items: [
          { label: 'Más Vendidos de la Semana', category: 'general', badge: 'Top 10' },
          { label: 'Novedades y Estrenos', category: 'general' },
          { label: 'Preventas y Reservas', category: 'general', badge: 'Reserva' },
          { label: 'Juegos con Entrega Inmediata', category: 'general' },
        ]
      }
    ]
  },
  {
    id: 'consolas',
    label: 'Consolas',
    categoryFilter: 'general',
    iconEmoji: '🕹️',
    description: 'Hardware original nuevo y garantizado para jugar al máximo.',
    columns: [
      {
        title: 'PlayStation',
        items: [
          { label: 'PlayStation 5 Slim Standard', category: 'general', platform: 'PS5' },
          { label: 'PlayStation 5 Slim Digital', category: 'general', platform: 'PS5' },
          { label: 'PlayStation 5 Pro', category: 'general', platform: 'PS5', badge: 'Nuevo' },
          { label: 'PlayStation Portal Remote Player', category: 'general', platform: 'PS5' },
        ]
      },
      {
        title: 'Nintendo',
        items: [
          { label: 'Nintendo Switch Modelo OLED', category: 'general', platform: 'Nintendo Switch', badge: 'Top' },
          { label: 'Nintendo Switch Standard', category: 'general', platform: 'Nintendo Switch' },
          { label: 'Nintendo Switch Lite', category: 'general', platform: 'Nintendo Switch' },
          { label: 'Ediciones Especiales Colección', category: 'general', platform: 'Nintendo Switch' },
        ]
      },
      {
        title: 'Xbox & Portátiles',
        items: [
          { label: 'Xbox Series X 1TB', category: 'general', platform: 'Xbox Series X' },
          { label: 'Xbox Series S 512GB/1TB', category: 'general', platform: 'Xbox Series X' },
          { label: 'Consolas Portátiles Retro', category: 'retro' },
          { label: 'Bundles y Packs con Juego', category: 'general', badge: 'Oferta' },
        ]
      }
    ]
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    categoryFilter: 'general',
    iconEmoji: '🎧',
    description: 'Mandos, audio, bases de carga y protección para tu equipo.',
    columns: [
      {
        title: 'Mandos y Controles',
        items: [
          { label: 'Mandos DualSense PS5', category: 'general', platform: 'PS5' },
          { label: 'Nintendo Switch Pro Controller & Joy-Con', category: 'general', platform: 'Nintendo Switch' },
          { label: 'Xbox Wireless Controller', category: 'general', platform: 'Xbox Series X' },
          { label: 'Controles Arcade & Fightsticks', category: 'retro' },
        ]
      },
      {
        title: 'Audio y Energía',
        items: [
          { label: 'Headsets Gamer Inalámbricos', category: 'general' },
          { label: 'Estaciones de Carga Doble', category: 'general' },
          { label: 'Cables HDMI 2.1 Ultra High Speed', category: 'general' },
          { label: 'Baterías y Packs Recargables', category: 'general' },
        ]
      },
      {
        title: 'Protección y Transporte',
        items: [
          { label: 'Estuches Rígidos Switch', category: 'general' },
          { label: 'Grips de Silicona y Thumb Grips', category: 'general' },
          { label: 'Protectores de Pantalla Vidrio Templado', category: 'general' },
          { label: 'Soportes de Pared y Mesa', category: 'general' },
        ]
      }
    ]
  }
]
