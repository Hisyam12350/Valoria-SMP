'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageWrapper } from '@/components/page-wrapper';
import { STAFF_MEMBERS, DISCORD_LINK } from '@/lib/constants';
import { useSiteContent } from '@/lib/use-site-content';

type StaffMember = { name: string; role: string; roleColor: string; skinHead: string };

export default function StaffPage() {
  const { value: rawStaff } = useSiteContent<unknown>('staff_members', STAFF_MEMBERS);
  const { value: discordLink } = useSiteContent<string>('discord_link', DISCORD_LINK);

  // Pastikan selalu array yang valid
  const staffMembers: StaffMember[] = Array.isArray(rawStaff)
    ? rawStaff as StaffMember[]
    : STAFF_MEMBERS;

  const staffGroups = [
    { title: 'Owner',   color: 'text-red-400',    emoji: '👑', members: staffMembers.filter(s => s.role === 'Owner') },
    { title: 'Admin',   color: 'text-orange-400', emoji: '🛡️', members: staffMembers.filter(s => s.role === 'Admin') },
    { title: 'Helper',  color: 'text-green-400',  emoji: '💚', members: staffMembers.filter(s => s.role === 'Helper') },
    { title: 'Creator', color: 'text-purple-400', emoji: '🎨', members: staffMembers.filter(s => s.role === 'Creator') },
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.h2 className="text-3xl font-bold text-center mb-3 font-minecraft text-purple-400"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            👥 Staff Team
          </motion.h2>
          <p className="text-gray-400 text-center mb-8 text-sm">Tim yang mengelola dan menjaga server VALORIA SMP</p>
          <div className="space-y-8">
            {staffGroups.filter(g => g.members.length > 0).map((group, groupIndex) => (
              <motion.div key={group.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}>
                <h3 className={`text-lg font-bold mb-4 font-minecraft ${group.color}`}>{group.emoji} {group.title}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.members.map((member, index) => (
                    <motion.div key={member.name} initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}>
                      <Card className="glass border-0 overflow-hidden group">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {member.skinHead ? (
                              <img src={member.skinHead} alt={member.name}
                                className="w-12 h-12 rounded-lg transition-transform group-hover:scale-110 object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-xl">👤</div>
                            )}
                            <div>
                              <p className="font-bold text-white text-sm">{member.name}</p>
                              <p className={`text-xs font-medium ${member.roleColor || 'text-gray-400'}`}>{member.role}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div className="text-center mt-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
              <a href={typeof discordLink === 'string' ? discordLink : DISCORD_LINK}
                target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />Hubungi Staff via Discord
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
