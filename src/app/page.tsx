'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, MessageCircle, Share2, Gamepad2 as Gamepad2Icon, Shield, Zap, Sword, Crown, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/page-wrapper';
import { SERVER_IP, BEDROCK_PORT, DISCORD_LINK, SERVER_LOGO, SERVER_FEATURES } from '@/lib/constants';
import { useSiteContent } from '@/lib/use-site-content';

interface ServerStatus { online: boolean; players: { online: number; max: number }; version: string; hostname: string; }
interface Feature { icon: string; title: string; description: string; }

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield, Zap, Sword, Crown, Gift, Gamepad2: Gamepad2Icon,
};

export default function HomePage() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [copied, setCopied] = useState<'java' | 'bedrock' | null>(null);
  const [loading, setLoading] = useState(true);

  const { value: rawServerIp } = useSiteContent<unknown>('server_ip', SERVER_IP);
  const { value: rawBedrockPort } = useSiteContent<unknown>('bedrock_port', BEDROCK_PORT);
  const { value: rawDiscordLink } = useSiteContent<unknown>('discord_link', DISCORD_LINK);
  const { value: rawWaGroup } = useSiteContent<unknown>('whatsapp_group', '');
  const { value: rawServerLogo } = useSiteContent<unknown>('server_logo', SERVER_LOGO);
  const { value: rawFeatures } = useSiteContent<unknown>('server_features', SERVER_FEATURES);

  // Defensive parse - selalu pastikan tipe yang benar
  const serverIp = typeof rawServerIp === 'string' ? rawServerIp : SERVER_IP;
  const bedrockPort = typeof rawBedrockPort === 'string' ? rawBedrockPort : BEDROCK_PORT;
  const discordLink = typeof rawDiscordLink === 'string' ? rawDiscordLink : DISCORD_LINK;
  const waGroup = typeof rawWaGroup === 'string' ? rawWaGroup : WHATSAPP_GROUP;
  const serverLogo = typeof rawServerLogo === 'string' ? rawServerLogo : SERVER_LOGO;
  const features: Feature[] = Array.isArray(rawFeatures) ? rawFeatures as Feature[] : SERVER_FEATURES;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/server-status');
        setServerStatus(await res.json());
      } catch {}
      finally { setLoading(false); }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const copyIP = useCallback(async (type: 'java' | 'bedrock') => {
    try {
      const text = type === 'java' ? serverIp : `${serverIp}:${bedrockPort}`;
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({ title: 'IP Disalin!', description: `${type === 'java' ? 'Java' : 'Bedrock'} IP berhasil disalin` });
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }, [serverIp, bedrockPort]);

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div className="mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.8 }}>
            <img src={serverLogo} alt="VALORIA SMP Logo" className="w-20 h-20 mx-auto rounded-xl shadow-xl animate-float" />
          </motion.div>
          <motion.h1 className="text-3xl sm:text-5xl font-bold mb-2 font-minecraft" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="text-amber-400">VALORIA</span> <span className="text-white">SMP</span>
          </motion.h1>
          <motion.p className="text-base text-gray-400 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            🎮Valoria SMP – Komunitas Survival Minecraft Terbaik di Indonesia.
          </motion.p>
          <motion.div className="glass rounded-xl p-4 mb-6 max-w-sm mx-auto" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              {loading ? <><div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" /><span className="text-gray-400 text-sm">Memuat...</span></> :
                serverStatus?.online ? <><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /><span className="text-emerald-400 font-semibold text-sm">Server Online</span></> :
                <><div className="w-2 h-2 bg-red-500 rounded-full" /><span className="text-red-400 font-semibold text-sm">Server Offline</span></>}
            </div>
            <div className="bg-black/30 rounded-lg p-3 mb-2">
              <p className="text-gray-400 text-xs mb-1 flex items-center justify-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />Java Edition</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-base font-mono text-white">{serverIp}</code>
                <Button onClick={() => copyIP('java')} variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-emerald-500/20">
                  {copied === 'java' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </Button>
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 mb-3">
              <p className="text-gray-400 text-xs mb-1 flex items-center justify-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Bedrock Edition</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-sm font-mono text-white">{serverIp}</code>
                <span className="text-gray-500">:</span>
                <code className="text-sm font-mono text-blue-400">{bedrockPort}</code>
                <Button onClick={() => copyIP('bedrock')} variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-emerald-500/20">
                  {copied === 'bedrock' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center"><p className="text-xl font-bold text-emerald-400">{loading ? '...' : serverStatus?.players.online || 0}</p><p className="text-gray-400 text-xs">Online</p></div>
              <div className="w-px h-8 bg-gray-700" />
              <div className="text-center"><p className="text-xl font-bold text-gray-300">{loading ? '...' : serverStatus?.players.max || 0}</p><p className="text-gray-400 text-xs">Max</p></div>
            </div>
          </motion.div>
          <motion.div className="flex justify-center mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Button asChild size="default" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-5">
              <a href={`minecraft://?addExternalServer=VALORIA SMP|${serverIp}:${bedrockPort}`}><Gamepad2Icon className="w-4 h-4 mr-2" />Click untuk Play</a>
            </Button>
          </motion.div>
          <motion.div className="flex flex-col sm:flex-row gap-3 justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Button asChild size="default" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-5">
              <a href={discordLink} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4 mr-2" />Join Discord</a>
            </Button>
            <Button asChild variant="outline" size="default" className="border-gray-600 hover:bg-white/10 px-6 py-5">
              <a href={waGroup} target="_blank" rel="noopener noreferrer"><Share2 className="w-4 h-4 mr-2" />Join WhatsApp</a>
            </Button>
          </motion.div>
          <motion.div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-10 max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            {features.slice(0, 6).map((feature, index) => {
              const IconComponent = iconComponents[feature.icon];
              return (
                <motion.div key={feature.title ?? index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + index * 0.05 }} className="glass-light rounded-lg p-3 hover:scale-105 transition-transform cursor-pointer">
                  {IconComponent && <IconComponent className="w-5 h-5 text-emerald-400 mx-auto mb-1" />}
                  <p className="text-xs font-medium text-white">{feature.title}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
