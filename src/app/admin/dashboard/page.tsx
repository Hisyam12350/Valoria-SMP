'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LogOut, Settings, Users, FileText, Server,
  ChevronRight, Save, Plus, Trash2, Edit3, Check, X,
  AlertTriangle, Loader2, RefreshCw, Eye, EyeOff, Crown,
  Activity, Lock, Link, BarChart2, Star, Play, Youtube, Bell,
  Trophy,
  Image
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin';
}

type Section =
  | 'overview'
  | 'server-info'
  | 'staff'
  | 'features'
  | 'social'
  | 'rules'
  | 'team'
  | 'gallery'
  | 'tutorial'
  | 'achievements'
  | 'ranks'
  | 'store-settings'
  | 'manage-admins'
  | 'activity';

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Verify session on load
  useEffect(() => {
    fetch('/api/admin/verify-session', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.valid) {
          setAdmin(d.admin);
        } else {
          window.location.href = '/admin/login';
        }
      })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a1a' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-gray-400 text-sm">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  const navItems: { id: Section; label: string; icon: React.ComponentType<{ className?: string }>; superOnly?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'server-info', label: 'Info Server', icon: Server },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'features', label: 'Fitur Server', icon: Star },
    { id: 'social', label: 'Social & Links', icon: Link },
    { id: 'rules', label: 'Peraturan', icon: FileText },
    { id: 'team', label: 'Team/Clan', icon: Shield },
    { id: 'gallery', label: 'Galeri', icon: Image },
    { id: 'tutorial', label: 'Tutorial', icon: Play },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'ranks', label: 'Ranks', icon: Crown },
    { id: 'store-settings', label: 'Store Settings', icon: Settings },
    { id: 'manage-admins', label: 'Kelola Admin', icon: Crown, superOnly: true },
    { id: 'activity', label: 'Log Aktivitas', icon: Activity },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: '#080c18', fontFamily: 'Geist, system-ui, sans-serif' }}>
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col transition-all duration-300 flex-shrink-0"
        style={{
          width: sidebarOpen ? '240px' : '64px',
          background: 'rgba(10,14,26,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-minecraft)', fontSize: '0.7rem' }}>
              <span className="text-amber-400">VALORIA</span> ADMIN
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            if (item.superOnly && admin.role !== 'superadmin') return null;
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150"
                style={{
                  background: active ? 'rgba(16,185,129,0.15)' : 'transparent',
                  color: active ? '#10b981' : '#9ca3af',
                  border: active ? '1px solid rgba(16,185,129,0.25)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User & logout */}
        <div className="p-2 border-t border-white/5">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs text-gray-400 truncate">{admin.username}</p>
              <p className="text-xs text-emerald-400/70">{admin.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,14,26,0.7)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
            <h1 className="text-white font-semibold capitalize">
              {navItems.find(n => n.id === activeSection)?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              Lihat Website
            </a>
          </div>
        </header>

        {/* Global Toast Notifications */}
        <ToastProvider />

      {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'overview' && <OverviewSection admin={admin} />}
              {activeSection === 'server-info' && <ServerInfoSection admin={admin} />}
              {activeSection === 'staff' && <StaffSection admin={admin} />}
              {activeSection === 'features' && <FeaturesSection admin={admin} />}
              {activeSection === 'social' && <SocialSection admin={admin} />}
              {activeSection === 'rules' && <RulesSection admin={admin} />}
              {activeSection === 'manage-admins' && admin.role === 'superadmin' && (
                <ManageAdminsSection admin={admin} />
              )}
              {activeSection === 'activity' && <ActivitySection />}
              {activeSection === 'team' && <TeamSection admin={admin} />}
              {activeSection === 'gallery' && <GallerySection admin={admin} />}
              {activeSection === 'tutorial' && <TutorialSection admin={admin} />}
              {activeSection === 'achievements' && <AchievementsSection admin={admin} />}
              {activeSection === 'ranks' && <RanksSection admin={admin} />}
              {activeSection === 'store-settings' && <StoreSettingsSection admin={admin} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Card
// ─────────────────────────────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-5 ${className}`}
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

function SaveButton({ loading, onClick, label = 'Simpan Perubahan' }: { loading: boolean; onClick: () => void; label?: string }) {
  return (
    <motion.button onClick={onClick} disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: loading ? 'none' : '0 4px 15px rgba(16,185,129,0.3)' }}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {loading ? 'Menyimpan...' : label}
    </motion.button>
  );
}

// ── Global notification system ────────────────────────────────
type ToastItem = { id: number; message: string; type: 'success' | 'error' | 'info' };
let toastId = 0;
let globalAddToast: ((msg: string, type: ToastItem['type']) => void) | null = null;

export function notify(message: string, type: ToastItem['type'] = 'success') {
  globalAddToast?.(message, type);
}

function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    globalAddToast = (message, type) => {
      const id = ++toastId;
      setToasts(p => [...p, { id, message, type }]);
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
    };
    return () => { globalAddToast = null; };
  }, []);

  return (
    <div className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl"
            style={{
              background: t.type === 'success' ? 'rgba(16,185,129,0.2)' : t.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
              border: `1px solid ${t.type === 'success' ? 'rgba(16,185,129,0.4)' : t.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)'}`,
              color: t.type === 'success' ? '#34d399' : t.type === 'error' ? '#f87171' : '#60a5fa',
              backdropFilter: 'blur(12px)',
            }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: t.type === 'success' ? 'rgba(16,185,129,0.2)' : t.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)' }}>
              {t.type === 'success' ? <Check className="w-3.5 h-3.5" /> : t.type === 'error' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
            </div>
            <span>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Legacy Toast wrapper (untuk komponen yang pakai state lokal)
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return null; // Sudah di-handle oleh ToastProvider global
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview Section
// ─────────────────────────────────────────────────────────────────────────────
function OverviewSection({ admin }: { admin: AdminUser }) {
  const [stats, setStats] = useState({ admins: 0, contents: 0, blockedIps: 0 });

  useEffect(() => {
    // Fetch basic stats
    const fetchStats = async () => {
      try {
        const [adminsRes, contentRes] = await Promise.all([
          fetch('/api/admin/create-admin', { credentials: 'include' }),
          fetch('/api/admin/content', { credentials: 'include' }),
        ]);
        const adminsData = adminsRes.ok ? await adminsRes.json() : { admins: [] };
        const contentData = contentRes.ok ? await contentRes.json() : { data: [] };
        setStats({
          admins: adminsData.admins?.length ?? 0,
          contents: contentData.data?.length ?? 0,
          blockedIps: 0,
        });
      } catch {}
    };
    if (admin.role === 'superadmin') fetchStats();
  }, [admin.role]);

  const statCards = [
    { label: 'Total Admin', value: stats.admins, icon: Users, color: '#10b981' },
    { label: 'Konten Website', value: stats.contents, icon: FileText, color: '#3b82f6' },
    { label: 'IP Diblokir', value: stats.blockedIps, icon: Lock, color: '#f59e0b' },
  ];

  return (
    <div>
      <SectionHeader title={`Selamat datang, ${admin.username}! 👋`} subtitle="Panel administrasi VALORIA SMP" />
      
      {admin.role === 'superadmin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {statCards.map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">{s.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{s.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}20`, border: `1px solid ${s.color}30` }}>
                    <Icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <h3 className="text-white font-medium mb-4">Panduan Cepat</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <p>• Gunakan menu <span className="text-emerald-400">Info Server</span> untuk mengubah IP, port, dan link sosial</p>
          <p>• Gunakan menu <span className="text-emerald-400">Staff & Tim</span> untuk mengelola daftar staff</p>
          <p>• Gunakan menu <span className="text-emerald-400">Fitur Server</span> untuk mengedit kartu fitur di halaman utama</p>
          <p>• Gunakan menu <span className="text-emerald-400">Social & Links</span> untuk mengubah link Discord, WhatsApp, dll</p>
          {admin.role === 'superadmin' && (
            <p>• Gunakan menu <span className="text-amber-400">Kelola Admin</span> untuk membuat & mengelola akun admin</p>
          )}
        </div>
      </Card>

      <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-sm">
        <p className="font-medium mb-1">⚠️ Catatan Penting</p>
        <p className="text-xs text-amber-300/70">
          Setelah mengubah data di dashboard, website akan memuat konten terbaru dari Supabase secara otomatis.
          Pastikan koneksi database aktif.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Server Info Section
// ─────────────────────────────────────────────────────────────────────────────
function ServerInfoSection({ admin }: { admin: AdminUser }) {
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState({
    server_ip: '',
    bedrock_port: '',
    discord_link: '',
    whatsapp_group: '',
    vote_link: '',
    server_logo: '',
    background_image: '',
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetch('/api/admin/content', { credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach((row: { content_key: string; content_value: unknown }) => {
          if (typeof row.content_value === 'string') map[row.content_key] = row.content_value;
          else map[row.content_key] = JSON.stringify(row.content_value).replace(/^"|"$/g, '');
        });
        setFields(prev => ({ ...prev, ...map }));
      })
      .finally(() => setLoadingData(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(fields)) {
        await fetch('/api/admin/content', {
          credentials: 'include', method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        });
      }
      notify('Info server berhasil disimpan!', 'success');
    } catch {
      notify('Gagal menyimpan. Coba lagi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat data...</div>;

  const inputFields = [
    { key: 'server_ip', label: 'IP Server (Java)', placeholder: 'play.valoriasmp.my.id' },
    { key: 'bedrock_port', label: 'Port Bedrock', placeholder: '19230' },
    { key: 'discord_link', label: 'Link Discord', placeholder: 'https://discord.gg/...' },
    { key: 'whatsapp_group', label: 'Link Grup WhatsApp', placeholder: 'https://chat.whatsapp.com/...' },
    { key: 'vote_link', label: 'Link Vote', placeholder: 'https://minecraft-mp.com/...' },
    { key: 'server_logo', label: 'URL Logo Server', placeholder: 'https://...' },
    { key: 'background_image', label: 'URL Background Website', placeholder: 'https://...' },
  ];

  return (
    <div>
      <SectionHeader title="Info Server" subtitle="Kelola IP, port, dan konfigurasi dasar server" />
      <Card>
        <div className="space-y-4">
          {inputFields.map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">{f.label}</label>
              <input
                value={fields[f.key as keyof typeof fields] || ''}
                onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          ))}
          <div className="pt-2">
            <SaveButton loading={saving} onClick={save} />
          </div>
        </div>
      </Card>
      <AnimatePresence>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff Section
// ─────────────────────────────────────────────────────────────────────────────
type StaffMember = { name: string; role: string; roleColor: string; skinHead: string };

function StaffSection({ admin }: { admin: AdminUser }) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const roleColors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-pink-400'];
  const roles = ['Owner', 'Co-Owner', 'Admin', 'Moderator', 'Helper', 'Builder', 'Creator'];

  useEffect(() => {
    fetch('/api/admin/content?key=staff_members', { credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.content_value) {
          setStaff(Array.isArray(data.content_value) ? data.content_value : JSON.parse(data.content_value));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const addStaff = () => {
    const newStaff: StaffMember = { name: 'NamaBaru', role: 'Helper', roleColor: 'text-green-400', skinHead: '' };
    setStaff(prev => [...prev, newStaff]);
    setEditIdx(staff.length);
  };

  const removeStaff = (idx: number) => setStaff(prev => prev.filter((_, i) => i !== idx));

  const updateStaff = (idx: number, field: keyof StaffMember, value: string) => {
    setStaff(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        credentials: 'include', method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'staff_members', value: staff }),
      });
      if (!res.ok) throw new Error();
      notify('Data staff berhasil disimpan!', 'success');
      setEditIdx(null);
    } catch {
      notify('Gagal menyimpan data staff.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat data...</div>;

  return (
    <div>
      <SectionHeader title="Staff & Tim" subtitle="Kelola daftar staff yang tampil di website" />
      <div className="flex gap-3 mb-4">
        <button onClick={addStaff}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Plus className="w-4 h-4" /> Tambah Staff
        </button>
        <SaveButton loading={saving} onClick={save} />
      </div>

      <div className="space-y-3">
        {staff.map((member, idx) => (
          <Card key={idx}>
            <div className="flex items-start gap-4">
              {/* Skin preview */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {member.skinHead && (
                  <img src={member.skinHead} alt={member.name} className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {editIdx === idx ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">Nama</label>
                      <input value={member.name} onChange={e => updateStaff(idx, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none mt-1"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Role</label>
                      <select value={member.role} onChange={e => updateStaff(idx, 'role', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none mt-1"
                        style={{ background: 'rgba(20,25,40,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {roles.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Warna Role</label>
                      <select value={member.roleColor} onChange={e => updateStaff(idx, 'roleColor', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none mt-1"
                        style={{ background: 'rgba(20,25,40,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {roleColors.map(c => <option key={c} value={c}>{c.replace('text-', '')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">URL Foto Skin</label>
                      <input value={member.skinHead} onChange={e => updateStaff(idx, 'skinHead', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none mt-1"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className={`text-sm ${member.roleColor}`}>{member.role}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditIdx(editIdx === idx ? null : idx)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  {editIdx === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit3 className="w-4 h-4" />}
                </button>
                <button onClick={() => removeStaff(idx)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <AnimatePresence>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Features Section
// ─────────────────────────────────────────────────────────────────────────────
type Feature = { icon: string; title: string; description: string };

function FeaturesSection({ admin }: { admin: AdminUser }) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/content?key=server_features', { credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.content_value) setFeatures(Array.isArray(data.content_value) ? data.content_value : JSON.parse(data.content_value));
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (idx: number, field: keyof Feature, value: string) =>
    setFeatures(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f));

  const add = () => setFeatures(prev => [...prev, { icon: 'Star', title: 'Fitur Baru', description: 'Deskripsi fitur' }]);
  const remove = (idx: number) => setFeatures(prev => prev.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        credentials: 'include', method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'server_features', value: features }),
      });
      notify('Fitur server berhasil disimpan!', 'success');
    } catch {
      notify('Gagal menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat data...</div>;

  return (
    <div>
      <SectionHeader title="Fitur Server" subtitle="Kelola kartu fitur yang tampil di halaman utama" />
      <div className="flex gap-3 mb-4">
        <button onClick={add}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Plus className="w-4 h-4" /> Tambah Fitur
        </button>
        <SaveButton loading={saving} onClick={save} />
      </div>
      <div className="space-y-3">
        {features.map((f, idx) => (
          <Card key={idx}>
            <div className="grid grid-cols-3 gap-3 items-start">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Icon (nama Lucide)</label>
                <input value={f.icon} onChange={e => update(idx, 'icon', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Judul</label>
                <input value={f.title} onChange={e => update(idx, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-1">Deskripsi</label>
                  <input value={f.description} onChange={e => update(idx, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <button onClick={() => remove(idx)} className="mt-5 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <AnimatePresence>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Social Section
// ─────────────────────────────────────────────────────────────────────────────
function SocialSection({ admin }: { admin: AdminUser }) {
  const [fields, setFields] = useState({ discord_link: '', whatsapp_group: '', vote_link: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content', { credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach((row: { content_key: string; content_value: unknown }) => {
          if (['discord_link', 'whatsapp_group', 'vote_link'].includes(row.content_key)) {
            map[row.content_key] = typeof row.content_value === 'string'
              ? row.content_value
              : JSON.stringify(row.content_value).replace(/^"|"$/g, '');
          }
        });
        setFields(prev => ({ ...prev, ...map }));
      });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(fields)) {
        await fetch('/api/admin/content', {
          credentials: 'include', method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value }),
        });
      }
      notify('Link sosial berhasil disimpan!', 'success');
    } catch {
      notify('Gagal menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const items = [
    { key: 'discord_link', label: 'Link Discord', placeholder: 'https://discord.gg/...' },
    { key: 'whatsapp_group', label: 'Link Grup WhatsApp', placeholder: 'https://chat.whatsapp.com/...' },
    { key: 'vote_link', label: 'Link Vote Server', placeholder: 'https://minecraft-mp.com/...' },
  ];

  return (
    <div>
      <SectionHeader title="Social & Links" subtitle="Kelola link sosial media dan tautan penting" />
      <Card>
        <div className="space-y-4">
          {items.map(i => (
            <div key={i.key}>
              <label className="text-xs text-gray-400 block mb-1 uppercase tracking-wider">{i.label}</label>
              <input value={fields[i.key as keyof typeof fields] || ''} onChange={e => setFields(prev => ({ ...prev, [i.key]: e.target.value }))}
                placeholder={i.placeholder}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          ))}
          <SaveButton loading={saving} onClick={save} />
        </div>
      </Card>
      <AnimatePresence>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rules Section
// ─────────────────────────────────────────────────────────────────────────────
function RulesSection({ admin }: { admin: AdminUser }) {
  const [rules, setRules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/content?key=server_rules', { credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.content_value) setRules(Array.isArray(data.content_value) ? data.content_value : JSON.parse(data.content_value));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /></div>;

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        credentials: 'include', method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'server_rules', value: rules }),
      });
      notify('Peraturan berhasil disimpan!', 'success');
    } catch {
      notify('Gagal menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Peraturan Server" subtitle="Kelola daftar peraturan yang tampil di website" />
      <div className="flex gap-3 mb-4">
        <button onClick={() => setRules(prev => [...prev, 'Peraturan baru'])}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Plus className="w-4 h-4" /> Tambah Peraturan
        </button>
        <SaveButton loading={saving} onClick={save} />
      </div>
      <div className="space-y-2">
        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-gray-500 text-sm w-6 flex-shrink-0">{idx + 1}.</span>
            <input value={rule} onChange={e => setRules(prev => prev.map((r, i) => i === idx ? e.target.value : r))}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <button onClick={() => setRules(prev => prev.filter((_, i) => i !== idx))}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <AnimatePresence>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Manage Admins Section (superadmin only)
// ─────────────────────────────────────────────────────────────────────────────
function ManageAdminsSection({ admin }: { admin: AdminUser }) {
  const [admins, setAdmins] = useState<{ id: string; username: string; email: string; role: string; is_active: boolean; last_login: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'admin' });

  const fetchAdmins = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/create-admin', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setAdmins(d.admins ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const createAdmin = async () => {
    if (!form.username || !form.email || !form.password) {
      notify('Semua field wajib diisi.', 'error');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/create-admin', {
        credentials: 'include', method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify(`Admin ${form.username} berhasil dibuat! ✓`, 'success');
      setForm({ username: '', email: '', password: '', role: 'admin' });
      setShowForm(false);
      fetchAdmins();
    } catch (e: unknown) {
      notify((e as Error).message || 'Gagal membuat admin.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const deactivate = async (adminId: string, username: string) => {
    if (!confirm(`Nonaktifkan admin ${username}?`)) return;
    await fetch(`/api/admin/create-admin?id=${adminId}`, { method: 'DELETE' });
    notify(`Admin ${username} dinonaktifkan.`, 'success');
    fetchAdmins();
  };

  return (
    <div>
      <SectionHeader title="Kelola Admin" subtitle="Buat dan kelola akun admin lainnya" />

      <div className="flex gap-3 mb-5">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: showForm ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${showForm ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Batal' : 'Buat Admin Baru'}
        </button>
        <button onClick={fetchAdmins} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Create Admin Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5">
            <Card>
              <h3 className="text-white font-medium mb-4">Buat Akun Admin Baru</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Username</label>
                  <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Password (min. 8 karakter)</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 rounded-lg text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(20,25,40,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <SaveButton loading={creating} onClick={createAdmin} label="Buat Admin" />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin list */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {admins.map(a => (
            <Card key={a.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: a.role === 'superadmin' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)' }}>
                    {a.role === 'superadmin' ? <Crown className="w-4 h-4 text-amber-400" /> : <Shield className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{a.username}</p>
                    <p className="text-gray-400 text-xs">{a.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.is_active ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {a.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.role === 'superadmin' ? 'text-amber-400 bg-amber-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                    {a.role}
                  </span>
                  {a.id !== admin.id && a.is_active && (
                    <button onClick={() => deactivate(a.id, a.username)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <AnimatePresence>
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity Log Section
// ─────────────────────────────────────────────────────────────────────────────
function ActivitySection() {

  return (
    <div>
      <SectionHeader title="Log Aktivitas" subtitle="Riwayat aktivitas admin" />
      <Card>
        <p className="text-gray-400 text-sm">
          Log aktivitas admin tersimpan di tabel <code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">admin_activity_log</code> di Supabase.
          Lihat langsung di Supabase Dashboard → Table Editor untuk riwayat lengkap aktivitas admin.
        </p>
        <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm text-white"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          Buka Supabase Dashboard <ChevronRight className="w-4 h-4" />
        </a>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Team Section
// ─────────────────────────────────────────────────────────────────────────────
type Team = {
  id: string; name: string; tag: string; logo: string;
  activeMemberCount: number; ownerName: string; ownerWhatsapp: string;
  description: string; badge: string; badgeColor: string;
};

function TeamSection({ admin }: { admin: AdminUser }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/admin/content?key=teams', { credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.content_value) {
          setTeams(Array.isArray(data.content_value) ? data.content_value : []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const addTeam = () => {
    const t: Team = { id: `team_${Date.now()}`, name: 'Nama Team', tag: '[TAG]', logo: '', activeMemberCount: 0, ownerName: 'Owner', ownerWhatsapp: '62xxx', description: '', badge: 'OPEN', badgeColor: 'bg-green-500' };
    setTeams(p => [...p, t]);
    setEditIdx(teams.length);
  };

  const removeTeam = (idx: number) => setTeams(p => p.filter((_, i) => i !== idx));

  const updateTeam = (idx: number, field: keyof Team, value: string | number) =>
    setTeams(p => p.map((t, i) => i === idx ? { ...t, [field]: value } : t));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'teams', value: teams }),
      });
      if (!res.ok) throw new Error();
      notify('Data team berhasil disimpan!', 'success');
      setEditIdx(null);
    } catch {
      notify('Gagal menyimpan.', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</div>;

  return (
    <div>
      <SectionHeader title="Team / Clan" subtitle="Kelola daftar team yang tampil di halaman Team" />
      <div className="flex gap-3 mb-4">
        <button onClick={addTeam} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Plus className="w-4 h-4" /> Tambah Team
        </button>
        <SaveButton loading={saving} onClick={save} />
      </div>
      <div className="space-y-3">
        {teams.map((team, idx) => (
          <Card key={idx}>
            <div className="flex items-start gap-3">
              {team.logo && <img src={team.logo} alt={team.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              {!team.logo && <div className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                {editIdx === idx ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { field: 'name', label: 'Nama Team', placeholder: 'Aether Sovereigns' },
                      { field: 'tag', label: 'Tag', placeholder: '[AETHER]' },
                      { field: 'logo', label: 'URL Logo', placeholder: 'https://...' },
                      { field: 'ownerName', label: 'Nama Owner', placeholder: 'PlayerName' },
                      { field: 'ownerWhatsapp', label: 'WA Owner', placeholder: '6281xxx' },
                      { field: 'activeMemberCount', label: 'Jumlah Member', placeholder: '10' },
                    ].map(f => (
                      <div key={f.field}>
                        <label className="text-xs text-gray-400 block mb-1">{f.label}</label>
                        <input value={String((team as unknown as Record<string,unknown>)[f.field] || '')}
                          onChange={e => updateTeam(idx, f.field as keyof Team, f.field === 'activeMemberCount' ? Number(e.target.value) : e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <label className="text-xs text-gray-400 block mb-1">Deskripsi</label>
                      <textarea value={team.description} onChange={e => updateTeam(idx, 'description', e.target.value)} rows={2}
                        className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none resize-none"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Status Badge</label>
                      <select value={team.badge} onChange={e => { updateTeam(idx, 'badge', e.target.value); updateTeam(idx, 'badgeColor', e.target.value === 'OPEN' ? 'bg-green-500' : 'bg-red-500'); }}
                        className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                        style={{ background: 'rgba(20,25,40,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <option value="OPEN">OPEN</option>
                        <option value="PENUH">PENUH</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-medium text-sm">{team.name} <span className="text-gray-500 text-xs">{team.tag}</span></p>
                    <p className="text-gray-400 text-xs">Owner: {team.ownerName} · {team.activeMemberCount} member</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white mt-1 inline-block ${team.badgeColor}`}>{team.badge}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditIdx(editIdx === idx ? null : idx)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                  {editIdx === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit3 className="w-4 h-4" />}
                </button>
                <button onClick={() => removeTeam(idx)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Gallery Section
// ─────────────────────────────────────────────────────────────────────────────
type GalleryPhoto = { url: string; caption: string };

function GallerySection({ admin }: { admin: AdminUser }) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/content?key=gallery_photos', { credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.content_value) setPhotos(Array.isArray(data.content_value) ? data.content_value : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const addPhoto = () => setPhotos(p => [...p, { url: '', caption: '' }]);
  const removePhoto = (idx: number) => setPhotos(p => p.filter((_, i) => i !== idx));
  const updatePhoto = (idx: number, field: keyof GalleryPhoto, value: string) =>
    setPhotos(p => p.map((ph, i) => i === idx ? { ...ph, [field]: value } : ph));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'gallery_photos', value: photos }),
      });
      if (!res.ok) throw new Error();
      notify('Galeri berhasil disimpan!', 'success');
    } catch {
      notify('Gagal menyimpan.', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</div>;

  return (
    <div>
      <SectionHeader title="Galeri Foto" subtitle="Kelola foto-foto yang tampil di halaman Galeri" />
      <div className="flex gap-3 mb-4">
        <button onClick={addPhoto} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Plus className="w-4 h-4" /> Tambah Foto
        </button>
        <SaveButton loading={saving} onClick={save} />
      </div>

      {/* Preview grid */}
      {photos.filter(p => p.url).length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {photos.filter(p => p.url).slice(0, 6).map((p, i) => (
            <img key={i} src={p.url} alt={p.caption} className="w-full h-20 object-cover rounded-lg"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {photos.map((photo, idx) => (
          <Card key={idx}>
            <div className="flex items-center gap-3">
              {photo.url && (
                <img src={photo.url} alt={photo.caption} className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              {!photo.url && <div className="w-16 h-12 bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center"><Image className="w-4 h-4 text-gray-600" /></div>}
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">URL Foto</label>
                  <input value={photo.url} onChange={e => updatePhoto(idx, 'url', e.target.value)}
                    placeholder="https://i.postimg.cc/..."
                    className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Keterangan (opsional)</label>
                  <input value={photo.caption} onChange={e => updatePhoto(idx, 'caption', e.target.value)}
                    placeholder="Deskripsi foto..."
                    className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>
              <button onClick={() => removePhoto(idx)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
        {photos.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">
            Belum ada foto. Klik "Tambah Foto" untuk menambahkan.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tutorial Section
// ─────────────────────────────────────────────────────────────────────────────
type TutorialItem = {
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

const CATEGORY_OPTIONS = ['Pemula', 'Gameplay', 'Store', 'PvP', 'Tim'];
const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  Pemula: { color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  Gameplay: { color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
  Store: { color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
  PvP: { color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
  Tim: { color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
};
const DIFFICULTY_OPTIONS = [
  { label: 'Mudah', color: 'text-green-400' },
  { label: 'Sedang', color: 'text-yellow-400' },
  { label: 'Sulit', color: 'text-red-400' },
];

function TutorialSection({ admin }: { admin: AdminUser }) {
  const [tutorials, setTutorials] = useState<TutorialItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const DEFAULT_TUTORIAL: TutorialItem = {
    id: Date.now(),
    category: 'Pemula',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    title: 'Judul Tutorial Baru',
    description: 'Deskripsi tutorial...',
    duration: '5:00',
    difficulty: 'Mudah',
    difficultyColor: 'text-green-400',
    videoType: 'youtube',
    videoId: '',
    tips: [],
  };

  useEffect(() => {
    fetch('/api/admin/content?key=tutorials', { credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.content_value && Array.isArray(data.content_value)) {
          setTutorials(data.content_value);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const addTutorial = () => {
    const t = { ...DEFAULT_TUTORIAL, id: Date.now() };
    setTutorials(p => [...p, t]);
    setEditIdx(tutorials.length);
  };

  const removeTutorial = (idx: number) => setTutorials(p => p.filter((_, i) => i !== idx));

  const updateField = (idx: number, field: keyof TutorialItem, value: unknown) =>
    setTutorials(p => p.map((t, i) => {
      if (i !== idx) return t;
      const updated = { ...t, [field]: value };
      // Auto-update colors when category changes
      if (field === 'category' && CATEGORY_COLORS[value as string]) {
        updated.categoryColor = CATEGORY_COLORS[value as string].color;
        updated.categoryBg = CATEGORY_COLORS[value as string].bg;
      }
      // Auto-update difficulty color
      if (field === 'difficulty') {
        const diff = DIFFICULTY_OPTIONS.find(d => d.label === value);
        if (diff) updated.difficultyColor = diff.color;
      }
      return updated;
    }));

  const updateTip = (tutIdx: number, tipIdx: number, value: string) =>
    setTutorials(p => p.map((t, i) => i === tutIdx ? { ...t, tips: t.tips.map((tip, ti) => ti === tipIdx ? value : tip) } : t));

  const addTip = (tutIdx: number) =>
    setTutorials(p => p.map((t, i) => i === tutIdx ? { ...t, tips: [...t.tips, ''] } : t));

  const removeTip = (tutIdx: number, tipIdx: number) =>
    setTutorials(p => p.map((t, i) => i === tutIdx ? { ...t, tips: t.tips.filter((_, ti) => ti !== tipIdx) } : t));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'tutorials', value: tutorials }),
      });
      if (!res.ok) throw new Error();
      notify('Tutorial berhasil disimpan! ✓', 'success');
      setEditIdx(null);
    } catch {
      notify('Gagal menyimpan tutorial.', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</div>;

  return (
    <div>
      <SectionHeader title="Tutorial" subtitle="Kelola video tutorial yang tampil di halaman Tutorial" />
      <div className="flex gap-3 mb-5">
        <button onClick={addTutorial}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Plus className="w-4 h-4" /> Tambah Tutorial
        </button>
        <SaveButton loading={saving} onClick={save} />
      </div>

      <div className="space-y-3">
        {tutorials.map((tut, idx) => (
          <Card key={tut.id}>
            <div className="flex items-start gap-3">
              {/* Video preview */}
              <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-black/30 relative">
                {tut.videoType === 'youtube' && tut.videoId ? (
                  <img src={`https://img.youtube.com/vi/${tut.videoId}/mqdefault.jpg`} alt={tut.title}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {tut.videoType === 'youtube' ? <Youtube className="w-5 h-5 text-red-400" /> : <Play className="w-5 h-5 text-gray-400" />}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white/60" fill="rgba(255,255,255,0.4)" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                {editIdx === idx ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Judul</label>
                        <input value={tut.title} onChange={e => updateField(idx, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Durasi (contoh: 5:30)</label>
                        <input value={tut.duration} onChange={e => updateField(idx, 'duration', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Kategori</label>
                        <select value={tut.category} onChange={e => updateField(idx, 'category', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(20,25,40,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Tingkat Kesulitan</label>
                        <select value={tut.difficulty} onChange={e => updateField(idx, 'difficulty', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(20,25,40,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {DIFFICULTY_OPTIONS.map(d => <option key={d.label}>{d.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Tipe Video</label>
                        <select value={tut.videoType} onChange={e => updateField(idx, 'videoType', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(20,25,40,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">
                          {tut.videoType === 'youtube' ? 'YouTube Video ID' : 'TikTok Video ID'}
                        </label>
                        <input value={tut.videoId} onChange={e => updateField(idx, 'videoId', e.target.value)}
                          placeholder={tut.videoType === 'youtube' ? 'dQw4w9WgXcQ' : '1234567890123456789'}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Deskripsi</label>
                      <textarea value={tut.description} onChange={e => updateField(idx, 'description', e.target.value)} rows={2}
                        className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none resize-none"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-400">Tips (opsional)</label>
                        <button onClick={() => addTip(idx)} className="text-xs text-emerald-400 hover:text-emerald-300">+ Tambah Tip</button>
                      </div>
                      <div className="space-y-1">
                        {tut.tips.map((tip, tipIdx) => (
                          <div key={tipIdx} className="flex gap-2">
                            <input value={tip} onChange={e => updateTip(idx, tipIdx, e.target.value)}
                              placeholder={`Tip ${tipIdx + 1}`}
                              className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                            <button onClick={() => removeTip(idx, tipIdx)} className="p-1.5 text-gray-500 hover:text-red-400">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* YouTube ID helper */}
                    {tut.videoType === 'youtube' && (
                      <div className="p-2 rounded-lg text-xs text-gray-500" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        💡 Cara ambil YouTube ID: dari URL <span className="text-gray-400">youtube.com/watch?v=<span className="text-amber-400">dQw4w9WgXcQ</span></span>, bagian yang berwarna itu ID-nya
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${tut.categoryBg} ${tut.categoryColor}`}>{tut.category}</span>
                      <span className="text-xs text-gray-500">{tut.duration}</span>
                      <span className={`text-xs ${tut.difficultyColor}`}>{tut.difficulty}</span>
                    </div>
                    <p className="text-white text-sm font-medium">{tut.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {tut.videoType === 'youtube' ? '▶ YouTube' : '♪ TikTok'}
                      {tut.videoId ? ` · ID: ${tut.videoId}` : ' · Belum ada video ID'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditIdx(editIdx === idx ? null : idx)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  {editIdx === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit3 className="w-4 h-4" />}
                </button>
                <button onClick={() => removeTutorial(idx)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {tutorials.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            <Play className="w-10 h-10 mx-auto mb-3 opacity-20" />
            Belum ada tutorial. Klik "Tambah Tutorial" untuk menambahkan.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Achievements Section
// ─────────────────────────────────────────────────────────────────────────────
type Achievement = {
  id: number; title: string; date: string; place: string;
  event: string; photos: string[];
};

function AchievementsSection({ admin }: { admin: AdminUser }) {
  const [items, setItems] = useState<Achievement[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [newPhoto, setNewPhoto] = useState('');

  useEffect(() => {
    fetch('/api/admin/content?key=achievements', { credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.content_value && Array.isArray(data.content_value)) setItems(data.content_value);
      })
      .finally(() => setLoading(false));
  }, []);

  const addItem = () => {
    const a: Achievement = { id: Date.now(), title: 'Judul Achievement', date: new Date().toISOString().split('T')[0], place: '1st Place', event: 'Nama Event', photos: [] };
    setItems(p => [...p, a]);
    setEditIdx(items.length);
  };

  const removeItem = (idx: number) => setItems(p => p.filter((_, i) => i !== idx));

  const update = (idx: number, field: keyof Achievement, value: unknown) =>
    setItems(p => p.map((a, i) => i === idx ? { ...a, [field]: value } : a));

  const addPhoto = (idx: number, url: string) => {
    if (!url.trim()) return;
    setItems(p => p.map((a, i) => i === idx ? { ...a, photos: [...a.photos, url.trim()] } : a));
    setNewPhoto('');
  };

  const removePhoto = (idx: number, pIdx: number) =>
    setItems(p => p.map((a, i) => i === idx ? { ...a, photos: a.photos.filter((_, pi) => pi !== pIdx) } : a));

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'achievements', value: items }),
      });
      notify('Achievements berhasil disimpan! ✓', 'success');
      setEditIdx(null);
    } catch { notify('Gagal menyimpan.', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</div>;

  return (
    <div>
      <SectionHeader title="Achievements" subtitle="Kelola prestasi dan pencapaian server" />
      <div className="flex gap-3 mb-4">
        <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Plus className="w-4 h-4" /> Tambah Achievement
        </button>
        <SaveButton loading={saving} onClick={save} />
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <Card key={item.id}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: 'rgba(245,158,11,0.15)' }}>
                {item.place === '1st Place' ? '🥇' : item.place === '2nd Place' ? '🥈' : item.place === '3rd Place' ? '🥉' : '🏆'}
              </div>
              <div className="flex-1 min-w-0">
                {editIdx === idx ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { f: 'title', label: 'Judul' },
                        { f: 'event', label: 'Nama Event' },
                        { f: 'date', label: 'Tanggal (YYYY-MM-DD)' },
                      ].map(({ f, label }) => (
                        <div key={f}>
                          <label className="text-xs text-gray-400 block mb-1">{label}</label>
                          <input value={String((item as unknown as Record<string,unknown>)[f] || '')} onChange={e => update(idx, f as keyof Achievement, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Posisi</label>
                        <select value={item.place} onChange={e => update(idx, 'place', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(20,25,40,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {['1st Place','2nd Place','3rd Place','Participant','Winner'].map(p => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Foto ({item.photos.length} foto)</label>
                      <div className="flex gap-2 mb-2">
                        <input value={newPhoto} onChange={e => setNewPhoto(e.target.value)} placeholder="URL foto..."
                          className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <button onClick={() => addPhoto(idx, newPhoto)}
                          className="px-3 py-1.5 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/10"
                          style={{ border: '1px solid rgba(16,185,129,0.3)' }}>Tambah</button>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {item.photos.map((p, pi) => (
                          <div key={pi} className="relative group">
                            <img src={p} className="w-full h-14 object-cover rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                            <button onClick={() => removePhoto(idx, pi)}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    <p className="text-gray-400 text-xs">{item.event} · {item.date}</p>
                    <p className="text-amber-400 text-xs">{item.place} · {item.photos.length} foto</p>
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditIdx(editIdx === idx ? null : idx)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                  {editIdx === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit3 className="w-4 h-4" />}
                </button>
                <button onClick={() => removeItem(idx)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
            Belum ada achievement. Klik "Tambah Achievement" untuk menambahkan.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ranks Section
// ─────────────────────────────────────────────────────────────────────────────
type Rank = {
  name: string;
  originalPriceNum: number;
  discount: number;
  color: string;
  gradient: string;
  features: string[];
  bonus: { claimblock: string; claim: string; sethome: string; money: string };
  popular?: boolean;
  top?: boolean;
  ultimate?: boolean;
};

const RANK_COLORS = [
  { label: 'Abu-abu', color: 'text-gray-400', gradient: 'from-gray-500 to-gray-600' },
  { label: 'Biru', color: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' },
  { label: 'Ungu', color: 'text-purple-400', gradient: 'from-purple-500 to-purple-600' },
  { label: 'Cyan', color: 'text-cyan-400', gradient: 'from-cyan-500 to-cyan-600' },
  { label: 'Emas', color: 'text-yellow-400', gradient: 'from-yellow-500 to-amber-500' },
  { label: 'Merah', color: 'text-red-400', gradient: 'from-red-500 to-red-600' },
  { label: 'Hijau', color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
];

function RanksSection({ admin }: { admin: AdminUser }) {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [newFeature, setNewFeature] = useState('');

  const DEFAULT_RANK: Rank = {
    name: 'RANK BARU',
    originalPriceNum: 50000,
    discount: 0,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500',
    features: ['/feed', '/heal'],
    bonus: { claimblock: '10.000', claim: '5x', sethome: '5x', money: '$100.000' },
  };

  useEffect(() => {
    fetch('/api/admin/content?key=ranks', { credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.content_value && Array.isArray(data.content_value)) {
          setRanks(data.content_value);
        } else {
          // Load dari constants sebagai default
          fetch('/api/site-content?key=ranks')
            .then(r => r.json())
            .then(d => {
              if (Array.isArray(d.value)) setRanks(d.value);
            });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const addRank = () => {
    setRanks(p => [...p, { ...DEFAULT_RANK }]);
    setEditIdx(ranks.length);
  };

  const removeRank = (idx: number) => {
    setRanks(p => p.filter((_, i) => i !== idx));
    if (editIdx === idx) setEditIdx(null);
  };

  const update = (idx: number, field: keyof Rank, value: unknown) =>
    setRanks(p => p.map((r, i) => i === idx ? { ...r, [field]: value } : r));

  const updateBonus = (idx: number, field: keyof Rank['bonus'], value: string) =>
    setRanks(p => p.map((r, i) => i === idx ? { ...r, bonus: { ...r.bonus, [field]: value } } : r));

  const addFeature = (idx: number) => {
    if (!newFeature.trim()) return;
    setRanks(p => p.map((r, i) => i === idx ? { ...r, features: [...r.features, newFeature.trim()] } : r));
    setNewFeature('');
  };

  const removeFeature = (rankIdx: number, featIdx: number) =>
    setRanks(p => p.map((r, i) => i === rankIdx ? { ...r, features: r.features.filter((_, fi) => fi !== featIdx) } : r));

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ranks', value: ranks }),
      });
      notify('Ranks berhasil disimpan! ✓', 'success');
      setEditIdx(null);
    } catch { notify('Gagal menyimpan ranks.', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</div>;

  // Hitung harga setelah diskon
  const getPrice = (rank: Rank) => {
    if (rank.discount > 0) {
      return Math.round(rank.originalPriceNum * (1 - rank.discount / 100));
    }
    return rank.originalPriceNum;
  };

  return (
    <div>
      <SectionHeader title="Ranks" subtitle="Kelola daftar rank yang dijual di halaman Store" />
      <div className="flex gap-3 mb-5">
        <button onClick={addRank}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Plus className="w-4 h-4" /> Tambah Rank
        </button>
        <SaveButton loading={saving} onClick={save} />
      </div>

      <div className="space-y-3">
        {ranks.map((rank, idx) => (
          <Card key={idx}>
            <div className="flex items-start gap-3">
              {/* Badge preview */}
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 bg-gradient-to-r ${rank.gradient} text-white`}>
                {rank.name}
              </div>

              <div className="flex-1 min-w-0">
                {editIdx === idx ? (
                  <div className="space-y-3">
                    {/* Row 1: Nama, Harga, Diskon */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Nama Rank</label>
                        <input value={rank.name} onChange={e => update(idx, 'name', e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Harga (Rp)</label>
                        <input type="number" value={rank.originalPriceNum} onChange={e => update(idx, 'originalPriceNum', Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Diskon (%)</label>
                        <input type="number" min="0" max="100" value={rank.discount} onChange={e => update(idx, 'discount', Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      </div>
                    </div>

                    {/* Row 2: Warna */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Warna Rank</label>
                      <div className="flex flex-wrap gap-2">
                        {RANK_COLORS.map(rc => (
                          <button key={rc.color} onClick={() => { update(idx, 'color', rc.color); update(idx, 'gradient', rc.gradient); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${rc.gradient} text-white transition-all ${rank.color === rc.color ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}>
                            {rc.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Row 3: Badge flags */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Label Badge</label>
                      <div className="flex gap-3">
                        {[
                          { field: 'popular', label: '🔥 Popular', color: 'rgba(168,85,247,0.3)' },
                          { field: 'top', label: '⭐ Top', color: 'rgba(234,179,8,0.3)' },
                          { field: 'ultimate', label: '💎 Ultimate', color: 'rgba(6,182,212,0.3)' },
                        ].map(badge => (
                          <button key={badge.field} onClick={() => update(idx, badge.field as keyof Rank, !(rank as Record<string,unknown>)[badge.field])}
                            className="px-3 py-1 rounded-lg text-xs font-medium text-white transition-all"
                            style={{
                              background: (rank as Record<string,unknown>)[badge.field] ? badge.color : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${(rank as Record<string,unknown>)[badge.field] ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                            }}>
                            {badge.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Row 4: Bonus */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Bonus</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { f: 'claimblock', label: 'Claimblock' },
                          { f: 'claim', label: 'Claim (jumlah)' },
                          { f: 'sethome', label: 'Sethome' },
                          { f: 'money', label: 'Uang in-game' },
                        ].map(b => (
                          <div key={b.f}>
                            <label className="text-xs text-gray-500 block mb-0.5">{b.label}</label>
                            <input value={(rank.bonus as Record<string,string>)[b.f] || ''} onChange={e => updateBonus(idx, b.f as keyof Rank['bonus'], e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg text-xs text-white outline-none"
                              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Row 5: Features/Commands */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Commands/Fitur ({rank.features.length})</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {rank.features.map((feat, fi) => (
                          <span key={fi} className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs text-emerald-400"
                            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            {feat}
                            <button onClick={() => removeFeature(idx, fi)} className="hover:text-red-400 ml-0.5">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={newFeature} onChange={e => setNewFeature(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addFeature(idx); }}
                          placeholder="/command atau fitur baru..."
                          className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <button onClick={() => addFeature(idx)}
                          className="px-3 py-1.5 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/10"
                          style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
                          + Tambah
                        </button>
                      </div>
                    </div>

                    {/* Price preview */}
                    {rank.discount > 0 && (
                      <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <span className="text-gray-500 text-xs line-through">Rp {rank.originalPriceNum.toLocaleString('id')}</span>
                        <span className="text-emerald-400 text-sm font-bold">Rp {getPrice(rank).toLocaleString('id')}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">-{rank.discount}%</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm ${rank.color}`}>{rank.name}</span>
                      {rank.discount > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">-{rank.discount}%</span>}
                      {(rank as Record<string,unknown>).popular && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">Popular</span>}
                      {(rank as Record<string,unknown>).top && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Top</span>}
                      {(rank as Record<string,unknown>).ultimate && <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">Ultimate</span>}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {rank.discount > 0
                        ? <>Rp {getPrice(rank).toLocaleString('id')} <span className="line-through text-gray-600">Rp {rank.originalPriceNum.toLocaleString('id')}</span></>
                        : <>Rp {rank.originalPriceNum.toLocaleString('id')}</>}
                      {' · '}{rank.features.length} fitur
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditIdx(editIdx === idx ? null : idx)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  {editIdx === idx ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit3 className="w-4 h-4" />}
                </button>
                <button onClick={() => removeRank(idx)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {ranks.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            <Crown className="w-10 h-10 mx-auto mb-3 opacity-20" />
            Belum ada rank. Klik "Tambah Rank" untuk menambahkan.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Store Settings Section
// ─────────────────────────────────────────────────────────────────────────────
function StoreSettingsSection({ admin }: { admin: AdminUser }) {
  const [skills, setSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetch('/api/admin/content?key=store_skills', { credentials: 'include' })
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.content_value && Array.isArray(data.content_value)) {
          setSkills(data.content_value);
        } else {
          // Default skills
          setSkills(['Farming','Foraging','Mining','Fishing','Excavation','Archery','Defense','Fighting','Agility','Enchanting','Alchemy']);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'store_skills', value: skills }),
      });
      notify('Store settings disimpan! ✓', 'success');
    } catch { notify('Gagal menyimpan.', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</div>;

  return (
    <div>
      <SectionHeader title="Store Settings" subtitle="Kelola daftar skill yang tersedia di store" />
      <Card className="mb-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">Daftar Skill</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill, idx) => (
                <span key={idx} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-emerald-400"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {skill}
                  <button onClick={() => setSkills(p => p.filter((_, i) => i !== idx))} className="hover:text-red-400 text-base leading-none">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newSkill.trim()) { setSkills(p => [...p, newSkill.trim()]); setNewSkill(''); } }}
                placeholder="Tambah skill baru..."
                className="flex-1 px-4 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={() => { if (newSkill.trim()) { setSkills(p => [...p, newSkill.trim()]); setNewSkill(''); } }}
                className="px-4 py-2 rounded-lg text-sm text-emerald-400 hover:bg-emerald-500/10"
                style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
                Tambah
              </button>
            </div>
          </div>
          <SaveButton loading={saving} onClick={save} />
        </div>
      </Card>
    </div>
  );
}
