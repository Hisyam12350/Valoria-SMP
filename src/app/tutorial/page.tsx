'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, BookOpen, ChevronDown, ChevronUp, Youtube, ExternalLink, Clock, Star, Zap } from 'lucide-react';
import { PageWrapper } from '@/components/page-wrapper';
import { useSiteContent } from '@/lib/use-site-content';

type Tutorial = {
  id: number;
  category: string;
  categoryColor: string;
  categoryBg: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  difficultyColor: string;
  videoType: 'youtube' | 'tiktok';
  videoId: string;
  tips: string[];
};

const STATIC_TUTORIALS: Tutorial[] = [
  {
    id: 1,
    category: 'Pemula',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    title: 'Cara Join Server Valoria SMP',
    description: 'Tutorial lengkap cara bergabung ke server Valoria SMP untuk pemain Java & Bedrock Edition.',
    duration: '5:30',
    difficulty: 'Mudah',
    difficultyColor: 'text-green-400',
    videoType: 'youtube',
    videoId: '',
    tips: ['IP Java: play.valoriasmp.my.id', 'Port Bedrock: 19230', 'Support Minecraft 1.20+'],
  },
];

const CATEGORIES = ['Semua', 'Pemula', 'Gameplay', 'Store', 'PvP', 'Tim'];

function VideoModal({ tutorial, onClose }: { tutorial: Tutorial; onClose: () => void }) {
  const embedUrl = tutorial.videoType === 'youtube'
    ? `https://www.youtube.com/embed/${tutorial.videoId}?rel=0&modestbranding=1`
    : `https://www.tiktok.com/embed/v2/${tutorial.videoId}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl glass rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white truncate pr-4">{tutorial.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none shrink-0">×</button>
        </div>
        <div className={`relative bg-black ${tutorial.videoType === 'tiktok' ? 'aspect-[9/16] max-h-[70vh]' : 'aspect-video'}`}>
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={tutorial.title} />
        </div>
        {tutorial.tips.length > 0 && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {tutorial.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /><span>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function TutorialCard({ tutorial, index }: { tutorial: Tutorial; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
        className="glass rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300">
        <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer group" onClick={() => setShowModal(true)}>
          {tutorial.videoType === 'youtube' && tutorial.videoId ? (
            <img src={`https://img.youtube.com/vi/${tutorial.videoId}/maxresdefault.jpg`} alt={tutorial.title}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
              onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${tutorial.videoId}/hqdefault.jpg`; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="text-6xl">{tutorial.videoType === 'tiktok' ? '🎵' : '▶️'}</div>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
            <motion.div whileHover={{ scale: 1.15 }}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </motion.div>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />{tutorial.duration}
          </div>
          <div className="absolute top-2 left-2">
            {tutorial.videoType === 'youtube'
              ? <div className="px-2 py-0.5 rounded bg-red-600 text-white text-xs flex items-center gap-1"><Youtube className="w-3 h-3" />YouTube</div>
              : <div className="px-2 py-0.5 rounded bg-black text-white text-xs">TikTok</div>}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${tutorial.categoryBg} ${tutorial.categoryColor}`}>{tutorial.category}</span>
            <span className={`text-xs ${tutorial.difficultyColor} flex items-center gap-1`}><Star className="w-3 h-3" />{tutorial.difficulty}</span>
          </div>
          <h3 className="font-bold text-white text-sm mb-2 leading-snug">{tutorial.title}</h3>
          <AnimatePresence>
            {expanded && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="text-gray-400 text-xs mb-3 leading-relaxed overflow-hidden">{tutorial.description}</motion.p>
            )}
          </AnimatePresence>
          <div className="flex items-center justify-between mt-3">
            <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Tutup' : 'Lihat Detail'}
            </button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs hover:bg-emerald-500/30 transition-colors">
              <Play className="w-3 h-3" fill="currentColor" />Tonton
            </motion.button>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>{showModal && <VideoModal tutorial={tutorial} onClose={() => setShowModal(false)} />}</AnimatePresence>
    </>
  );
}

export default function TutorialPage() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const { value: rawTutorials } = useSiteContent<unknown>('tutorials', STATIC_TUTORIALS);
  const tutorials: Tutorial[] = Array.isArray(rawTutorials) && rawTutorials.length > 0
    ? rawTutorials as Tutorial[]
    : STATIC_TUTORIALS;
  const { value: discordLink } = useSiteContent<string>('discord_link', 'https://discord.gg/TrVjrSSbr');
  const { value: waGroup } = useSiteContent<string>('whatsapp_group', 'https://chat.whatsapp.com/GSsNLA6zHISEbcIiYej9l7');

  const filtered = activeCategory === 'Semua'
    ? tutorials
    : tutorials.filter(t => t.category === activeCategory);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-4">
            <BookOpen className="w-4 h-4" />Pusat Tutorial
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-minecraft mb-4">
            <span className="text-amber-400">TUTORIAL</span><br />
            <span className="text-white text-2xl sm:text-3xl">VALORIA SMP</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">Panduan lengkap bermain di Valoria SMP. Dari cara join server hingga tips PvP tingkat lanjut.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${activeCategory === cat ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}>
              {cat}
            </button>
          ))}
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tutorial, index) => <TutorialCard key={tutorial.id} tutorial={tutorial} index={index} />)}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>Belum ada tutorial untuk kategori ini.</p>
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-16 glass rounded-2xl p-6 border border-amber-500/20 text-center">
          <ExternalLink className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Ada pertanyaan lain?</h3>
          <p className="text-gray-400 text-sm mb-4">Bergabung di Discord atau WhatsApp kami. Admin dan komunitas siap membantu!</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href={discordLink} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm hover:bg-indigo-500/30 transition-colors">Discord</a>
            <a href={waGroup} target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/30 transition-colors">WhatsApp Group</a>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
