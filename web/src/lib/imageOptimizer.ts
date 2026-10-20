// ============================================================
// GUCCI GAMES - Client-Side Image Optimizer
// Compresses & resizes images before uploading to Supabase Storage
// to keep server storage lightweight and loading times instant.
// ============================================================

export interface ImageOptimizationResult {
  file: File
  previewUrl: string
  originalSize: number
  compressedSize: number
  originalSizeStr: string
  compressedSizeStr: string
  savedBytes: number
  savedPercent: number
  width: number
  height: number
  format: 'webp' | 'jpeg'
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export async function optimizeProductImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
  } = {}
): Promise<ImageOptimizationResult> {
  const maxWidth = options.maxWidth ?? 900
  const maxHeight = options.maxHeight ?? 1200
  const quality = options.quality ?? 0.78

  return new Promise((resolve, reject) => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
      resolve({
        file,
        previewUrl: URL.createObjectURL(file),
        originalSize: file.size,
        compressedSize: file.size,
        originalSizeStr: formatBytes(file.size),
        compressedSizeStr: formatBytes(file.size),
        savedBytes: 0,
        savedPercent: 0,
        width: 0,
        height: 0,
        format: 'jpeg',
      })
      return
    }

    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'))

    reader.onload = (event) => {
      const img = new Image()

      img.onerror = () => reject(new Error('Error al cargar la imagen para optimización'))

      img.onload = () => {
        let width = img.naturalWidth || img.width
        let height = img.naturalHeight || img.height

        // Calculate proportional dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve({
            file,
            previewUrl: URL.createObjectURL(file),
            originalSize: file.size,
            compressedSize: file.size,
            originalSizeStr: formatBytes(file.size),
            compressedSizeStr: formatBytes(file.size),
            savedBytes: 0,
            savedPercent: 0,
            width,
            height,
            format: 'jpeg',
          })
          return
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        // Try WebP first (modern, 40-70% lighter than JPEG/PNG)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFileName = file.name.replace(/\.[^.]+$/, '') + '.webp'
              const optimizedFile = new File([blob], newFileName, {
                type: 'image/webp',
                lastModified: Date.now(),
              })

              const originalSize = file.size
              const compressedSize = optimizedFile.size
              const savedBytes = Math.max(0, originalSize - compressedSize)
              const savedPercent =
                originalSize > 0
                  ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
                  : 0

              resolve({
                file: optimizedFile,
                previewUrl: URL.createObjectURL(optimizedFile),
                originalSize,
                compressedSize,
                originalSizeStr: formatBytes(originalSize),
                compressedSizeStr: formatBytes(compressedSize),
                savedBytes,
                savedPercent,
                width,
                height,
                format: 'webp',
              })
            } else {
              // Fallback to JPEG
              canvas.toBlob(
                (jpegBlob) => {
                  const fallbackFile = jpegBlob
                    ? new File([jpegBlob], file.name.replace(/\.[^.]+$/, '') + '.jpg', {
                        type: 'image/jpeg',
                      })
                    : file

                  const originalSize = file.size
                  const compressedSize = fallbackFile.size
                  const savedBytes = Math.max(0, originalSize - compressedSize)
                  const savedPercent =
                    originalSize > 0
                      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
                      : 0

                  resolve({
                    file: fallbackFile,
                    previewUrl: URL.createObjectURL(fallbackFile),
                    originalSize,
                    compressedSize,
                    originalSizeStr: formatBytes(originalSize),
                    compressedSizeStr: formatBytes(compressedSize),
                    savedBytes,
                    savedPercent,
                    width,
                    height,
                    format: 'jpeg',
                  })
                },
                'image/jpeg',
                quality
              )
            }
          },
          'image/webp',
          quality
        )
      }

      img.src = event.target?.result as string
    }

    reader.readAsDataURL(file)
  })
}
