// Server Configuration
export const SERVER_IP = 'play.valoriasmp.my.id';
export const BEDROCK_PORT = '19132';
// WHATSAPP_NUMBER removed — payment now handled by Midtrans
export const DISCORD_LINK = 'https://discord.gg/Z2cDERrc6Z';
// WHATSAPP_GROUP removed — payment now handled by Midtrans
export const VOTE_LINK = 'https://minecraft-mp.com/server/354242/vote/';

// Images
export const SERVER_LOGO = 'https://image2url.com/r2/default/images/1773117137406-9d62e3e7-6d56-4190-b725-f0ca7a59c0e6.jpg';
export const BACKGROUND_IMAGE = 'https://image2url.com/r2/default/images/1773116356279-97b0e734-239c-455c-a448-95e2b7411271.png';

// Navigation
export const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'server-info', label: 'Server Info', href: '/server-info' },
  { id: 'store', label: 'Store', href: '/store' },
  { id: 'profile', label: 'Profil', href: '/profile' },
  { id: 'achievements', label: 'Achievements', href: '/achievements' },
  { id: 'vote', label: 'Vote', href: '/vote' },
  { id: 'staff', label: 'Staff', href: '/staff' },
  { id: 'social', label: 'Galeri', href: '/social' },
  { id: 'team', label: 'Team', href: '/team' },
  { id: 'tutorial', label: 'Tutorial', href: '/tutorial' },
];

// Ranks Data
export const RANKS = [
  {
    slug: "street",
    name: 'STREET',
    originalPriceNum: 15000,
    discount: 0,
    color: 'text-gray-400',
    gradient: 'from-gray-500 to-gray-600',
    features: ['/feed', '/heal', '/anvil', '/workbench', '/repair','/pv1', '/enderchest'],
    bonus: { claimblock: '15.000', claim: '6x', sethome: '6x', money: '$150.000' },
  },
  {
    slug: "valiant",
    name: 'VALIANT',
    originalPriceNum: 35000,
    discount: 0,
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-blue-600',
    features: ['/feed', '/heal', '/anvil', '/workbench', '/repair','/pv2', '/enderchest', '/fly'],
    bonus: { claimblock: '35.000', claim: '9x', sethome: '9x', money: '$350.000' },
  },
  {
    slug: "astra",
    name: 'ASTRA',
    originalPriceNum: 65000,
    discount: 0,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-purple-600',
    features: ['/feed', '/heal', '/anvil', '/workbench', '/repair','/pv3','/gkits', '/enderchest', '/fly', '/nick'],
    bonus: { claimblock: '70.000', claim: '12x', sethome: '12x', money: '$600.000' },
  },
  {
    slug: "crystall",
    name: 'CRYSTALL',
    originalPriceNum: 120000,
    discount: 0,
    color: 'text-pink-400',
    gradient: 'from-pink-500 to-pink-600',
    features: ['/feed', '/heal', '/anvil', '/workbench', '/repair','/repairall','/pv4','/gkits', '/enderchest', '/fly', '/nick', '/timeset', '/weather'],
    bonus: { claimblock: '100.000', claim: '15x', sethome: '15x', money: '$1.000.000' },
    popular: true,
  },
  {
    slug: "ethereal",
    name: 'ETHEREAL',
    originalPriceNum: 150000,
    discount: 0,
    color: 'text-amber-400',
    gradient: 'from-amber-400 to-orange-500',
    features: ['/feed', '/heal', '/anvil', '/workbench', '/repair','/repairall','/pv5','/gkits', '/enderchest', '/fly', '/nick', '/timeset', '/weather', '/invsee'],
    bonus: { claimblock: '150.000', claim: '18x', sethome: '18x', money: '$1.500.000' },
    top: true,
  },
  {
    slug: "sovereign",
    name: 'SOVEREIGN',
    originalPriceNum: 300000,
    discount: 0,
    color: 'text-cyan-300',
    gradient: 'from-cyan-400 to-blue-500',
    features: ['/anvil', '/heal', '/feed', '/nick', '/repair all', '/skull', '/fly', '/tp', '/boostskil', '/speed','/rp wand', '/weather', '/invsee'],
    bonus: { claimblock: 'Unlimited', claim: 'Unlimited', sethome: '1000x', money: '$3.000.000' },
    ultimate: true,
  },
];

// ==========================================
// POINTS - Harga: Rp 5.000 / 1.500 Points
// ==========================================
export const POINTS_PRICE_PER_AMOUNT = 5000; // Rp 5.000
export const POINTS_PER_PURCHASE = 2500; // 1.500 Points per Rp 5.000

// ==========================================
// MONEY - Harga: Rp 4.000 / 80.000 Money
// Format: k (ribu), m (juta), b (miliar), t (triliun)
// Contoh: Rp 8.000 = 160.000 Money, Rp 12.000 = 240.000 Money
// ==========================================
export const MONEY_PRICE_PER_AMOUNT = 4000; // Rp 4.000 per pembelian
export const MONEY_PER_PURCHASE = 80000; // 80.000 Money per Rp 4.000

// ==========================================
// SKILLS - Daftar skill yang tersedia
// Harga: 1 Level = Rp 2.000
// ==========================================
export const AVAILABLE_SKILLS = [
  'Farming',
  'Foraging',
  'Mining',
  'Fishing',
  'Excavation',
  'Archery',
  'Defense',
  'Fighting',
  'Agility',
  'Enchanting',
  'Alchemy',
];

export const SKILL_PRICE_PER_LEVEL = 5000; // Rp 2.000 per level

// Staff Members - Using regular image URLs
export const STAFF_MEMBERS = [
  { 
    name: 'FatihMC', 
    role: 'Owner', 
    roleColor: 'text-red-400', 
    skinHead: 'https://image2url.com/r2/default/images/1773473862312-045253f3-5a18-49e4-aedf-200585761862.jpg' 
  },
  { 
    name: 'ZennMC', 
    role: 'Admin', 
    roleColor: 'text-orange-400', 
    skinHead: 'https://image2url.com/r2/default/images/1773300294354-e0b23ef2-f60f-4a91-9566-1b53af50e0eb.png'
  },
  { 
    name: 'Lerzy', 
    role: 'Admin', 
    roleColor: 'text-orange-400', 
    skinHead: 'https://www.image2url.com/r2/default/images/1776690712432-8e50ed5c-3a95-445c-941f-b14d4711d1c7.jpg' 
  },
  { 
    name: 'Lyno', 
    role: 'Helper', 
    roleColor: 'text-green-400', 
    skinHead: 'https://image2url.com/r2/default/images/1775536611058-fb775821-3abd-4c94-8cd5-bcedf5da2b29.jpg' 
  },
  { 
    name: 'Ravex', 
    role: 'Helper', 
    roleColor: 'text-green-400', 
    skinHead: 'https://www.image2url.com/r2/default/images/1776576033580-8b1513e4-7fcc-4760-ba31-64af510fe3e3.jpg' 
  },
  { 
    name: 'WasingMC', 
    role: 'Creator', 
    roleColor: 'text-purple-400', 
    skinHead: 'https://image2url.com/r2/default/images/1773472707561-3cb16b2f-6eec-4a3c-a075-4102797191be.png' 
  },
];

// Achievements - Using regular image URLs
export const ACHIEVEMENTS = [
  { 
    name: 'BiyannCraft', 
    event: 'Build Competition #1', 
    place: '1st Place',
    icon: '🏗️',
    skinHead: 'https://image2url.com/r2/default/images/1773299837560-4fcddb44-1d50-42a8-95d3-ee7038a4c044.jpg',
    description: 'Membangun Masjid yang megah dengan detail yang luar biasa',
    // Tambahkan URL foto dokumentasi lomba di sini (opsional)
    eventPhotos: [
      // Contoh: 'https://example.com/foto-lomba-1.jpg',
      // Contoh: 'https://example.com/foto-lomba-2.jpg',
    ],
  },
];

// Top Voters - Using regular image URLs
export const TOP_VOTERS = [
  { rank: 1, name: 'SkyLineosk', votes: 2, skinHead: 'https://image2url.com/r2/default/images/1773299837560-4fcddb44-1d50-42a8-95d3-ee7038a4c044.jpg' },
  { rank: 2, name: '.Vicky_wahyu', votes: 2, skinHead: 'https://image2url.com/r2/default/images/1773299837560-4fcddb44-1d50-42a8-95d3-ee7038a4c044.jpg' },
  { rank: 3, name: 'FathNooraa', votes: 1, skinHead: 'https://image2url.com/r2/default/images/1773299837560-4fcddb44-1d50-42a8-95d3-ee7038a4c044.jpg' },
  { rank: 4, name: '.ZennMC50', votes: 1, skinHead: 'https://image2url.com/r2/default/images/1773299837560-4fcddb44-1d50-42a8-95d3-ee7038a4c044.jpg' },
  { rank: 5, name: '.Herobrine35210', votes: 1, skinHead: 'https://image2url.com/r2/default/images/1773299837560-4fcddb44-1d50-42a8-95d3-ee7038a4c044.jpg' },
];

// Server Features
export const SERVER_FEATURES = [
  { icon: 'Shield', title: 'Anti-Cheat', description: 'Sistem anti-cheat terbaik untuk pengalaman bermain yang adil' },
  { icon: 'Zap', title: 'Low Latency', description: 'Server dengan ping rendah untuk gameplay yang smooth' },
  { icon: 'Sword', title: 'PvP Arena', description: 'Arena PvP khusus untuk bertarung dengan pemain lain' },
  { icon: 'Crown', title: 'Rank System', description: 'Sistem rank yang menarik dengan berbagai fitur eksklusif' },
  { icon: 'Gift', title: 'Daily Rewards', description: 'Hadiah harian untuk pemain aktif' },
  { icon: 'Gamepad2', title: 'Cross-Play', description: 'Support Java & Bedrock Edition' },
];

// Server Rules
export const SERVER_RULES = [
  'Dilarang menggunakan cheat, hack, atau mod ilegal lainnya',
  'Dilarang melakukan griefing atau merusak bangunan pemain lain',
  'Hormati semua pemain, dilarang toxic atau bullying',
  'Dilarang spam, flood, atau advertise server lain',
  'Dilarang exploit bug atau glitch dalam game',
  'Gunakan bahasa yang sopan dalam chat',
  'Dilarang menjual item/account dengan uang asli di luar sistem resmi',
  'Laporkan pelanggaran ke staff dengan bukti yang jelas',
];

// Social Links
export const SOCIAL_LINKS = [
  { 
    name: 'Discord', 
    url: DISCORD_LINK, 
    color: 'bg-indigo-500',
    description: 'Bergabung dengan komunitas kami',
    members: '500+ Members'
  },
  { 
    name: 'WhatsApp Group', 
    url: 'https://chat.whatsapp.com/CJEURtE7WiJDqUzuEtIQCV?s=sh&p=a&ilr=0', 
    color: 'bg-green-500',
    description: 'Chat langsung dengan pemain lain',
    members: '200+ Members'
  },
  { 
    name: 'TikTok', 
    url: 'https://www.tiktok.com/@valoriasmpx?_r=1&_t=ZS-94dpHZY7dg0', 
    color: 'bg-black',
    description: 'Follow untuk konten seru',
    members: '10K+ Followers'
  },
  { 
    name: 'YouTube', 
    url: 'https://youtube.com/@valoriasmp', 
    color: 'bg-red-500',
    description: 'Subscribe untuk video terbaru',
    members: '5K+ Subscribers'
  },
];

// Teams Data — tambahkan team baru di sini
// constants.ts
export type TeamData = {
  id: string;
  name: string;
  tag: string;
  logo: string;
  activeMemberCount: number;
  ownerName: string;
  ownerWhatsapp: string;
  description: string;
  badge: "OPEN" | "PENUH";
  gradient: string;
  accentColor: string;
  glowColor: string;
};

export const TEAMS: TeamData[] = [
  // tambah team di sini nanti
];