'use client';
import { useSiteContent } from '@/lib/use-site-content';

import { motion, AnimatePresence } from 'framer-motion';
import { Images, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { PageWrapper } from '@/components/page-wrapper';

// =============================================
// GALERI SERVER — Tambahkan foto di sini
// Format: { url: 'https://...', caption: 'Keterangan foto' }
// =============================================
// Fallback static photos (dipakai jika Supabase kosong)
const STATIC_GALLERY = [
  {
    url: 'https://i.postimg.cc/Gt9NFrF2/IMG-20260415-WA0025.jpg',
    caption: 'Foto Team Vorthalion familia',
  },
   { 
    url: 'https://i.postimg.cc/zDWQHbG3/IMG-20260418-WA0418.jpg',
    caption: '',
  },
   { 
    url: 'https://i.postimg.cc/MZRLfMpv/IMG-20260418-WA0422.jpg',
    caption: '',
  },
   { 
    url: 'https://i.postimg.cc/sfSLGQgx/IMG-20260418-WA0423.jpg',
    caption: '',
  },
   { 
    url: 'https://i.postimg.cc/mkQpvqnG/IMG-20260418-WA0424.jpg',
    caption: '',
  },
   { 
    url: 'https://i.postimg.cc/zDWQHbGH/IMG-20260418-WA0425.jpg',
    caption: '',
  },
   { 
    url: 'https://i.postimg.cc/qBnF6hvs/IMG-20260418-WA0426.jpg',
    caption: '',
  },
   { 
    url: 'https://i.postimg.cc/RCfYJ6ZT/IMG-20260418-WA0428.jpg',
    caption: '',
  },
   { 
    url: 'https://i.postimg.cc/FFc6kdHp/IMG-20260418-WA0430.jpg',
    caption: '',
  },
   { 
    url: 'https://i.postimg.cc/pV8S5hL6/IMG-20260418-WA0431.jpg',
    caption: '',
  },
   { 
    url: 'https://i.postimg.cc/Qx3yQ8Fk/IMG-20260418-WA0432.jpg',
    caption: '',
  },
  {
    url: 'https://i.postimg.cc/P5rhQR08/1775888153852-9675dfb5-391d-4414-b3b4-834ab5a8544c.png',
    caption: 'Foto base kastil s2',
  },
  {
    url: 'https://i.postimg.cc/L8rC8qtQ/1775888226257-ef389be1-f934-40b3-8afa-8c8d40884ad9.jpg',
    caption: 'Foto Setelah bansos di s1',
  },
  {
    url: 'https://image2url.com/r2/default/images/1775912209413-08870576-7d11-4d40-92e1-d754ea26a7b9.jpg',
    caption: '',
  },
  { 
    url: 'https://image2url.com/r2/default/images/1775927169042-948e5b9e-0459-4192-96b5-ef19e848cd70.jpg',
    caption: '',
  },
  { 
    url: 'https://image2url.com/r2/default/images/1775927406633-aae06b62-23e5-4267-88ea-314ee787e713.jpg',
    caption: '',
  },
  { 
    url: 'https://image2url.com/r2/default/images/1775927446045-23fe8735-6eaa-471b-953e-e79c19e818b1.jpg',
    caption: '',
  },
  { 
    url: 'https://i.postimg.cc/DZxPSJQz/IMG_20260411_WA0211.jpg',
    caption: '',
  },
  { 
    url: 'https://i.postimg.cc/76Kn5G1J/IMG_20260411_WA0213.jpg',
    caption: '',
  },
   { 
    url: 'https://i.postimg.cc/vZ7qQmKH/IMG-20260412-WA0000.jpg',
    caption: 'Tunangan Baru 🤭',
  },
];

type GalleryPhoto = { url: string; caption: string };

export default function GalleryPage() {
  const { value: rawPhotos } = useSiteContent<unknown>('gallery_photos', STATIC_GALLERY);
  const photos: GalleryPhoto[] = Array.isArray(rawPhotos) && rawPhotos.length > 0
    ? rawPhotos as GalleryPhoto[]
    : STATIC_GALLERY;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
  };

  const goNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % photos.length);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen px-4 py-20">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-5">
              <Images className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-gray-300 tracking-widest uppercase font-medium">Server Gallery</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-minecraft text-white mb-4">
              <span className="text-cyan-400">Galeri</span>{' '}
              <span className="text-white">Server</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Koleksi foto dan momen seru dari VALORIA SMP — klik foto untuk memperbesar
            </p>
          </motion.div>

          {/* Grid Galeri */}
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-xl border border-white/10"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay saat hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                  <ZoomIn className="w-7 h-7 text-white" />
                  {photo.caption && (
                    <p className="text-white text-xs font-medium text-center px-3 leading-tight">
                      {photo.caption}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Jumlah foto */}
          <motion.p
            className="text-center text-gray-500 text-xs mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {photos.length} foto tersedia
          </motion.p>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            {/* Tombol Tutup */}
            <button
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={closeLightbox}
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Tombol Prev */}
            <button
              className="absolute left-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            {/* Foto utama */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[lightboxIndex].url}
                alt={photos[lightboxIndex].caption}
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
              {photos[lightboxIndex].caption && (
                <p className="text-center text-gray-300 text-sm mt-3">
                  {photos[lightboxIndex].caption}
                </p>
              )}
              <p className="text-center text-gray-500 text-xs mt-1">
                {lightboxIndex + 1} / {photos.length}
              </p>
            </motion.div>

            {/* Tombol Next */}
            <button
              className="absolute right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
