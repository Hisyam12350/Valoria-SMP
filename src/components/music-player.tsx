'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, ChevronUp, ChevronDown, List
} from 'lucide-react';


export const PLAYLIST: Track[] = [
  {
    id: 1,
    title: 'Epic Adventure',
    artist: 'Valoria SMP',
    url: 'https://www.image2url.com/r2/default/audio/1776688857902-c6a39bac-586a-43de-bd21-c71f4f13112d.mp3',
    coverColor: 'from-emerald-500 to-teal-600',
  },
   {
    id: 2,
    title: 'Night Sound',
    artist: 'Zenn Playlist🙂',
    url: 'https://instant-teal-evym9z5kcb.edgeone.app/ssstik.io_1777474179142.mp3',
    coverColor: 'from-emerald-500 to-teal-600',
  },
  
];

// =============================================

export interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  coverColor: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = PLAYLIST[currentIndex];

  // Inisialisasi audio
  useEffect(() => {
    const audio = new Audio();
    audio.src = currentTrack.url;
    audio.volume = volume;
    audio.loop = false;
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setCurrentIndex((prev) => (prev + 1) % PLAYLIST.length);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Ganti track
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const wasPlaying = isPlaying;
    audio.src = currentTrack.url;
    audio.load();
    if (wasPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentIndex]);

  // Autoplay setelah interaksi pertama user
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        setHasInteracted(true);
        setShowWelcome(false);
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      }
    };

    // Coba autoplay langsung
    setTimeout(() => {
      if (audioRef.current && !hasInteracted) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
            setShowWelcome(false);
          })
          .catch(() => {
            // Autoplay diblokir browser, tunggu interaksi
            document.addEventListener('click', handleFirstInteraction);
            document.addEventListener('keydown', handleFirstInteraction);
          });
      }
    }, 1000);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    setHasInteracted(true);
    setShowWelcome(false);
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      setIsMuted(v === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  const playNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const playPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const playTrack = (index: number) => {
    setCurrentIndex(index);
    setShowPlaylist(false);
    setHasInteracted(true);
    setShowWelcome(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 100);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Welcome Overlay - minta izin autoplay */}
      <AnimatePresence>
        {showWelcome && !hasInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-4 z-40 glass rounded-2xl p-4 border border-emerald-500/30 shadow-lg max-w-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">🎵 Musik Otomatis</p>
                <p className="text-gray-400 text-xs">Klik di mana saja untuk mulai musik!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
             style={{ width: isExpanded ? '300px' : '56px' }}>
          
          {/* Compact Mode (hanya icon) */}
          {!isExpanded && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(true)}
              className="w-14 h-14 flex items-center justify-center relative"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${currentTrack.coverColor} opacity-20`} />
              {isPlaying ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Music className="w-5 h-5 text-emerald-400" />
                </motion.div>
              ) : (
                <Music className="w-5 h-5 text-gray-400" />
              )}
              {/* Equalizer dots */}
              {isPlaying && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['4px', '8px', '4px'] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                      className="w-1 bg-emerald-400 rounded-full"
                      style={{ height: '4px' }}
                    />
                  ))}
                </div>
              )}
            </motion.button>
          )}

          {/* Expanded Mode */}
          {isExpanded && (
            <div className="p-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTrack.coverColor} flex items-center justify-center shrink-0`}>
                    {isPlaying ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                      >
                        <Music className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                    ) : (
                      <Music className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-white text-xs font-semibold truncate">{currentTrack.title}</p>
                    <p className="text-gray-400 text-[10px] truncate">{currentTrack.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className={`p-1 rounded transition-colors ${showPlaylist ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Playlist */}
              <AnimatePresence>
                {showPlaylist && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-3"
                  >
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {PLAYLIST.map((track, idx) => (
                        <button
                          key={track.id}
                          onClick={() => playTrack(idx)}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors ${
                            idx === currentIndex 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded bg-gradient-to-br ${track.coverColor} flex items-center justify-center shrink-0`}>
                            {idx === currentIndex && isPlaying ? (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                className="w-1.5 h-1.5 rounded-full bg-white"
                              />
                            ) : (
                              <Play className="w-2 h-2 text-white" fill="white" />
                            )}
                          </div>
                          <span className="text-[11px] truncate">{track.title}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress Bar */}
              <div className="mb-2">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 accent-emerald-400 cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(52, 211, 153) ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <button onClick={playPrev} className="text-gray-400 hover:text-white transition-colors">
                  <SkipBack className="w-4 h-4" />
                </button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
                >
                  {isPlaying 
                    ? <Pause className="w-4 h-4 text-white" fill="white" />
                    : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                  }
                </motion.button>

                <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors">
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-1">
                  <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                    {isMuted || volume === 0 
                      ? <VolumeX className="w-3.5 h-3.5" />
                      : <Volume2 className="w-3.5 h-3.5" />
                    }
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolume}
                    className="w-14 h-1 accent-emerald-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
