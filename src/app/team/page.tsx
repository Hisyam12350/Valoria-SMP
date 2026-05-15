"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Users,
  MessageCircle,
  Shield,
  PhoneCall,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/page-wrapper";
import { TEAMS, type TeamData } from "@/lib/constants";
import { useSiteContent } from "@/lib/use-site-content";
import { useState, useRef, useEffect } from "react";

export default function TeamPage() {
  const { value: rawTeams, loading } = useSiteContent<unknown>("teams", TEAMS);

  useEffect(() => {
    console.log("loading:", loading);
    console.log("rawTeams:", rawTeams);
  }, [loading, rawTeams]);

  const teams = (() => {
    const raw = Array.isArray(rawTeams) ? rawTeams : TEAMS;

    return (raw as TeamData[]).map((t, index) => {
      const badge = String(t.badge ?? "OPEN"); // ✅ parse dulu

      return {
        id: String(t.id ?? `team-${index}`),
        name: String(t.name ?? "Team"),
        tag: String(t.tag ?? ""),
        logo: String(t.logo ?? ""),
        activeMemberCount: Number(t.activeMemberCount ?? 0),
        ownerName: String(t.ownerName ?? "Owner"),
        ownerWhatsapp: String(t.ownerWhatsapp ?? ""),
        description: String(t.description ?? ""),
        badge, // ✅ pakai variabel
        badgeColor: badge === "PENUH" ? "bg-red-500" : "bg-green-500", // ✅ konsisten
        gradient: String(t.gradient ?? "from-emerald-400 to-teal-500"),
        accentColor: String(t.accentColor ?? "text-emerald-400"),
        glowColor: String(t.glowColor ?? "rgba(16,185,129,0.35)"),
      };
    });
  })();

  const handleContactOwner = (
    whatsapp: string,
    ownerName: string,
    teamName: string,
  ) => {
    const message = `Halo kak ${ownerName}, saya ingin Bergabung di team *${teamName}* apakah bisa?`;

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <PageWrapper>
      <div className="min-h-screen px-4 py-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{
              opacity: 0,
              y: -24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-5">
              <Shield className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-xs text-gray-300 tracking-widest uppercase font-medium">
                Tim VALORIA
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold font-minecraft text-white mb-4 leading-tight">
              <span className="text-pink-400">Team</span>{" "}
              <span className="text-white">Directory</span>
            </h1>

            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Semua tim yang terdaftar dan aktif di server VALORIA SMP
            </p>
          </motion.div>

          {/* Team Grid */}
          <div className="grid gap-6 md:gap-8">
            {teams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{
                  opacity: 0,
                  y: 32,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                }}
              >
                <TeamCard team={team} onContact={handleContactOwner} />
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {teams.length === 0 && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-500" />
              </div>

              <p className="text-gray-400">Belum ada tim yang terdaftar</p>
            </motion.div>
          )}

          {/* Join Team */}
          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
              duration: 0.5,
            }}
            className="mt-16 text-center"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <div className="glass rounded-2xl border border-white/10 px-8 py-10">
                <div className="h-1 w-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 absolute top-0 left-0 rounded-t-2xl" />

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                  <PhoneCall className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold font-minecraft text-white mb-2">
                  Mau Bikin <span className="text-green-400">Team Baru?</span>
                </h3>

                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  Hubungi admin kami langsung via WhatsApp
                </p>

                <Button
                  onClick={() => {
                    const url =
                      "https://wa.me/6285785944924?text=Min%20saya%20mau%20masukin%20team%20di%20website!!";

                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-8 py-3 h-12 rounded-xl"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Hubungi Admin
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}

type MappedTeam = {
  id: string;
  name: string;
  tag: string;
  logo: string;
  activeMemberCount: number;
  ownerName: string;
  ownerWhatsapp: string;
  description: string;
  badge: string;
  badgeColor: string;
  gradient: string;
  accentColor: string;
  glowColor: string;
};

function TeamCard({
  team,
  onContact,
}: {
  team: MappedTeam;
  onContact: (wa: string, owner: string, team: string) => void;
}) {
  const isFull = team.badge === "PENUH";

  const [showNotif, setShowNotif] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleContactClick = () => {
    if (isFull) {
      setShowNotif(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setShowNotif(false);
      }, 3000);

      return;
    }

    onContact(team.ownerWhatsapp, team.ownerName, team.name);
  };

  return (
    <div className="relative rounded-2xl overflow-visible">
      <AnimatePresence>
        {showNotif && (
          <motion.div
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -12,
            }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-red-500 text-white text-sm"
          >
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Team ini sudah penuh
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className={`h-1 w-full bg-gradient-to-r ${team.gradient}`} />

        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
                {team.logo ? (
                  <Image
                    src={team.logo}
                    alt={`${team.name} logo`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Users className="w-10 h-10 text-gray-500" />
                )}
              </div>

              <div
                className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${team.badgeColor}`}
              >
                {team.badge}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2
                className={`text-xl md:text-2xl font-bold ${team.accentColor}`}
              >
                {team.name}
              </h2>

              <p className="text-gray-400 text-sm mb-4">{team.description}</p>

              <Button
                onClick={handleContactClick}
                className={
                  isFull
                    ? "bg-gray-700 text-gray-300"
                    : `bg-gradient-to-r ${team.gradient}`
                }
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {isFull ? "Team Penuh" : "Hubungi Owner Team"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
