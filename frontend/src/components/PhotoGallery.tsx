import { useState } from 'react'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80'

interface PhotoGalleryProps {
  photos: string[] | null
  cafeName: string
}

export function PhotoGallery({ photos, cafeName }: PhotoGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const images = photos && photos.length > 0 ? photos : [PLACEHOLDER]

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setLightboxIdx(i)}
            className="relative aspect-square overflow-hidden rounded-xl bg-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <img
              src={src}
              alt={`${cafeName} photo ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-stone-300"
            onClick={() => setLightboxIdx(null)}
            aria-label="Close"
          >
            ×
          </button>
          <button
            className="absolute left-4 text-white text-4xl leading-none hover:text-stone-300"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i != null && i > 0 ? i - 1 : images.length - 1) }}
            aria-label="Previous"
          >
            ‹
          </button>
          <img
            src={images[lightboxIdx]}
            alt={`${cafeName} photo ${lightboxIdx + 1}`}
            className="max-h-[80vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 text-white text-4xl leading-none hover:text-stone-300"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i != null ? (i + 1) % images.length : 0) }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}
