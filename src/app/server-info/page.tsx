'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Sword, Crown, Gift, Gamepad2, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/page-wrapper';
import { SERVER_FEATURES, SERVER_RULES } from '@/lib/constants';
import { useSiteContent } from '@/lib/use-site-content';

type Feature = { icon: string; title: string; description: string };

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield, Zap, Sword, Crown, Gift, Gamepad2,
};

export default function ServerInfoPage() {
  const { value: rawFeatures } = useSiteContent<unknown>('server_features', SERVER_FEATURES);
  const { value: rawRules } = useSiteContent<unknown>('server_rules', SERVER_RULES);
  const features: Feature[] = Array.isArray(rawFeatures) ? rawFeatures as Feature[] : SERVER_FEATURES;
  const rules: string[] = Array.isArray(rawRules) ? rawRules as string[] : SERVER_RULES;

  return (
    <PageWrapper>
      <div className="min-h-screen px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.h2 className="text-3xl font-bold text-center mb-3 font-minecraft text-amber-400"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            Server Information
          </motion.h2>
          <p className="text-gray-400 text-center mb-8 text-sm">Pelajari lebih lanjut tentang fitur dan aturan server kami</p>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Features */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass border-0 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20"><Zap className="w-5 h-5 text-emerald-400" /></div>
                    Fitur Utama Server
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {features.map((feature, index) => {
                    const IconComponent = iconComponents[feature.icon];
                    return (
                      <motion.div key={feature.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10">
                          {IconComponent && <IconComponent className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                          <p className="text-xs text-gray-400">{feature.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Rules */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass border-0 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 rounded-lg bg-red-500/20"><Shield className="w-5 h-5 text-red-400" /></div>
                    Rules / Peraturan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rules.map((rule, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.03 }}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <p className="text-gray-300 text-xs">{rule}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div className="mt-6 grid sm:grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="glass border-0 text-center p-4">
              <Gamepad2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm mb-0.5">Cross-Platform</h3>
              <p className="text-xs text-gray-400">Java & Bedrock Edition</p>
            </Card>
            <Card className="glass border-0 text-center p-4">
              <Smartphone className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm mb-0.5">Mobile Friendly</h3>
              <p className="text-xs text-gray-400">Optimized for all devices</p>
            </Card>
            <Card className="glass border-0 text-center p-4">
              <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm mb-0.5">24/7 Uptime</h3>
              <p className="text-xs text-gray-400">Server selalu online</p>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
