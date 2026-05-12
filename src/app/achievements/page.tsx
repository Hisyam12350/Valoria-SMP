'use client';


import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Calendar, ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageWrapper } from '@/components/page-wrapper';
import { ACHIEVEMENTS } from '@/lib/constants';
import { useSiteContent } from '@/lib/use-site-content';

const placeColors: Record<string, string> = {
  '1st Place': 'bg-amber-500 text-black',
  '2nd Place': 'bg-gray-300 text-black',
  '3rd Place': 'bg-amber-700 text-white',
};

const placeGlow: Record<string, string> = {
  '1st Place': 'hover:shadow-amber-500/30',
  '2nd Place': 'hover:shadow-gray-300/20',
  '3rd Place': 'hover:shadow-amber-700/20',
};

// ── Lightbox (fullscreen slider) ──────────────────────────────────────────────
function Lightbox({
  photos,
  startIndex,
  onClose,
}: {
  photos: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-3 px-1" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          <Images className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-400 text-xs font-medium">Dokumentasi Lomba</span>
        </div>
        <div className="flex items-center gap-3">
          {photos.length > 1 && (
            <span className="text-white/50 text-xs">{current + 1} / {photos.length}</span>
          )}
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="relative w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={photos[current]}
            alt={`Foto dokumentasi ${current + 1}`}
            className="w-full max-h-[70vh] object-contain rounded-xl"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="flex gap-1.5 mt-4" onClick={(e) => e.stopPropagation()}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? 'bg-amber-400 w-4 h-1.5' : 'bg-white/30 w-1.5 h-1.5'
              }`}
            />
          ))}
        </div>
      )}

      {/* Swipe hint on mobile */}
      {photos.length > 1 && (
        <p className="text-white/25 text-[10px] mt-3 sm:hidden">Geser untuk melihat foto lainnya</p>
      )}
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AchievementsPage() {
  const { value: achievements } = useSiteContent<unknown>('achievements', ACHIEVEMENTS);
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);

  return (
    <PageWrapper>
      <div className="min-h-screen px-3 py-14 sm:px-6 sm:py-20">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 mb-3">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 text-xs font-medium">Hall of Fame</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-minecraft text-amber-400 mb-1.5">
              Achievements
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Selamat kepada para pemenang event!
            </p>
          </motion.div>

          {/* Achievement Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {ACHIEVEMENTS.map((achievement, index) => {
              const hasPhotos = achievement.eventPhotos && achievement.eventPhotos.length > 0;

              return (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className={`glass border border-white/5 overflow-hidden transition-shadow duration-300 hover:shadow-lg ${placeGlow[achievement.place] ?? ''}`}>

                    {/* Skin photo — full width, same as before */}
                    <div className="relative bg-gradient-to-b from-black/40 to-black/70 h-24 sm:h-28 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10" />
                      <img
                        src={achievement.skinHead}
                        alt={achievement.name}
                        className="h-20 sm:h-24 w-20 sm:w-24 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                        style={{ imageRendering: 'pixelated' }}
                      />

                      {/* Place badge top-left */}
                      <div className="absolute top-2 left-2 z-20">
                        <Badge className={`${placeColors[achievement.place] ?? 'bg-amber-500 text-black'} text-[10px] px-1.5 py-0 h-4`}>
                          <Star className="w-2 h-2 mr-0.5" />
                          {achievement.place}
                        </Badge>
                      </div>

                      {/* Event icon top-right */}
                      <div className="absolute top-1.5 right-2 z-20 text-base sm:text-lg leading-none">
                        {achievement.icon}
                      </div>

                      {/* 📸 Dokumentasi button — bottom-right, only if photos exist */}
                      {hasPhotos && (
                        <button
                          onClick={() => setLightbox({ photos: achievement.eventPhotos!, index: 0 })}
                          className="absolute bottom-2 right-2 z-20 flex items-center gap-1 bg-black/60 hover:bg-amber-500 text-white hover:text-black rounded-full px-2 py-0.5 transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-amber-500"
                        >
                          <Images className="w-2.5 h-2.5" />
                          <span className="text-[9px] font-medium leading-none">
                            {achievement.eventPhotos!.length} foto
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Card content */}
                    <CardContent className="p-2.5 sm:p-3">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate mb-0.5">
                        {achievement.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-emerald-400 mb-1 truncate">
                        {achievement.event}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {achievement.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8 sm:my-10">
            <div className="flex-1 h-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">Upcoming Events</span>
            </div>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { name: 'Build Battle', icon: '🏗️', desc: 'Adu kreativitas bangunan terbaik' },
                { name: 'PvP Tournament', icon: '⚔️', desc: 'Siapa yang terkuat di arena?' },
                { name: 'Treasure Hunt', icon: '🗺️', desc: 'Temukan harta karun tersembunyi' },
              ].map((event) => (
                <Card
                  key={event.name}
                  className="glass border border-white/5 text-center p-3 sm:p-4 hover:scale-[1.02] transition-transform"
                >
                  <div className="text-2xl sm:text-3xl mb-1.5">{event.icon}</div>
                  <h4 className="font-semibold text-white text-[10px] sm:text-xs mb-1 leading-tight">
                    {event.name}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 mb-2 hidden sm:block leading-relaxed">
                    {event.desc}
                  </p>
                  <Badge
                    variant="outline"
                    className="border-amber-500/50 text-amber-400 text-[9px] sm:text-xs px-1.5 py-0 h-4"
                  >
                    TBA
                  </Badge>
                </Card>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            photos={lightbox.photos}
            startIndex={lightbox.index}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
