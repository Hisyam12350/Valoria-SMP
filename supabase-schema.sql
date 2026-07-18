-- ============================================================
-- VALORIA SMP - Admin System Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: admin_users
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- ============================================================
-- TABLE: admin_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: login_attempts
-- (Rate limiting & blocking system)
-- ============================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address VARCHAR(50) NOT NULL,
  username_tried VARCHAR(255),
  success BOOLEAN DEFAULT false,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: blocked_ips
-- ============================================================
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address VARCHAR(50) UNIQUE NOT NULL,
  reason TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT false
);

-- ============================================================
-- TABLE: site_content
-- (Dynamic content for the website)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_key VARCHAR(100) UNIQUE NOT NULL,
  content_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: admin_activity_log
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_username VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(content_key);

-- ============================================================
-- ROW LEVEL SECURITY (disable for server-side access)
-- ============================================================
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- AUTO-UPDATE updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_content_updated_at ON site_content;
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED: Default site_content rows
-- ============================================================
INSERT INTO site_content (content_key, content_value, description) VALUES
('server_ip', '"play.valoriasmp.my.id"', 'IP Address server Minecraft'),
('bedrock_port', '"19230"', 'Port Bedrock Edition'),
('discord_link', '"https://discord.gg/TrVjrSSbr"', 'Link Discord server'),
('whatsapp_group', '"https://chat.whatsapp.com/GSsNLA6zHISEbcIiYej9l7?mode=gi_t"', 'Link grup WhatsApp'),
('vote_link', '"https://minecraft-mp.com/server/354242/vote/"', 'Link voting server'),
('server_logo', '"https://image2url.com/r2/default/images/1773117137406-9d62e3e7-6d56-4190-b725-f0ca7a59c0e6.jpg"', 'URL logo server'),
('background_image', '"https://image2url.com/r2/default/images/1773116356279-97b0e734-239c-455c-a448-95e2b7411271.png"', 'URL background website'),
('server_features', '[{"icon":"Shield","title":"Anti-Cheat","description":"Sistem anti-cheat terbaik untuk pengalaman bermain yang adil"},{"icon":"Zap","title":"Low Latency","description":"Server dengan ping rendah untuk gameplay yang smooth"},{"icon":"Sword","title":"PvP Arena","description":"Arena PvP khusus untuk bertarung dengan pemain lain"},{"icon":"Crown","title":"Rank System","description":"Sistem rank yang menarik dengan berbagai fitur eksklusif"},{"icon":"Gift","title":"Daily Rewards","description":"Hadiah harian untuk pemain aktif"},{"icon":"Gamepad2","title":"Cross-Play","description":"Support Java & Bedrock Edition"}]', 'Fitur-fitur server'),
('staff_members', '[{"name":"FatihMC","role":"Owner","roleColor":"text-red-400","skinHead":"https://image2url.com/r2/default/images/1773473862312-045253f3-5a18-49e4-aedf-200585761862.jpg"},{"name":"ZennMC","role":"Admin","roleColor":"text-orange-400","skinHead":"https://image2url.com/r2/default/images/1773300294354-e0b23ef2-f60f-4a91-9566-1b53af50e0eb.png"},{"name":"Lerzy","role":"Admin","roleColor":"text-orange-400","skinHead":"https://www.image2url.com/r2/default/images/1776690712432-8e50ed5c-3a95-445c-941f-b14d4711d1c7.jpg"},{"name":"Lyno","role":"Helper","roleColor":"text-green-400","skinHead":"https://image2url.com/r2/default/images/1775536611058-fb775821-3abd-4c94-8cd5-bcedf5da2b29.jpg"},{"name":"Ravex","role":"Helper","roleColor":"text-green-400","skinHead":"https://www.image2url.com/r2/default/images/1776576033580-8b1513e4-7fcc-4760-ba31-64af510fe3e3.jpg"},{"name":"WasingMC","role":"Creator","roleColor":"text-purple-400","skinHead":"https://image2url.com/r2/default/images/1773472707561-3cb16b2f-6eec-4a3c-a075-4102797191be.png"}]', 'Data staff server')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO site_content (content_key, content_value, description) VALUES
('server_rules', '["Dilarang menggunakan cheat, hack, atau mod ilegal lainnya","Dilarang melakukan griefing atau merusak bangunan pemain lain","Hormati semua pemain, dilarang toxic atau bullying","Dilarang spam, flood, atau advertise server lain","Dilarang exploit bug atau glitch dalam game","Gunakan bahasa yang sopan dalam chat","Dilarang menjual item/account dengan uang asli di luar sistem resmi","Laporkan pelanggaran ke staff dengan bukti yang jelas"]', 'Daftar peraturan server')
ON CONFLICT (content_key) DO NOTHING;

-- ============================================================
-- NOTE: Create your first superadmin via the setup endpoint
-- or run this after hashing your password:
-- INSERT INTO admin_users (username, email, password_hash, role)
-- VALUES ('superadmin', 'admin@valoriasmp.my.id', '<bcrypt_hash>', 'superadmin');
-- ============================================================

-- ============================================================
-- TAMBAHAN: Teams & Gallery (jalankan jika belum ada)
-- ============================================================
INSERT INTO site_content (content_key, content_value, description) VALUES
('teams', '[]'::jsonb, 'Data team/clan - kelola via admin dashboard'),
('gallery_photos', '[]'::jsonb, 'Foto galeri server - kelola via admin dashboard')
ON CONFLICT (content_key) DO NOTHING;

-- Tutorials content key
INSERT INTO site_content (content_key, content_value, description) VALUES
('tutorials', '[]'::jsonb, 'Data tutorial video - kelola via admin dashboard')
ON CONFLICT (content_key) DO NOTHING;

-- ============================================================
-- TABLE: players
-- ============================================================
CREATE TABLE IF NOT EXISTS public.players (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  username CHARACTER VARYING(100) NOT NULL,
  rank CHARACTER VARYING(50) NULL DEFAULT 'Member'::character varying,
  points INTEGER DEFAULT 0,
  money INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT players_pkey PRIMARY KEY (id),
  CONSTRAINT players_username_key UNIQUE (username)
) TABLESPACE pg_default;

-- ============================================================
-- TABLE: transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  uuid VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL REFERENCES players(username) ON DELETE CASCADE ON UPDATE CASCADE,
  product_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  midtrans_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: payment_logs (Riwayat Pembayaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL REFERENCES transactions(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
  uuid VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL REFERENCES players(username) ON DELETE CASCADE ON UPDATE CASCADE,
  category VARCHAR(50) NOT NULL,
  product_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  slug TEXT NOT NULL,
  rcon_response TEXT,
  rcon_success BOOLEAN DEFAULT false,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: riwayat (Tabel Riwayat Umum jika diperlukan terpisah)
-- ============================================================
CREATE TABLE IF NOT EXISTS riwayat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(100) NOT NULL REFERENCES players(username) ON DELETE CASCADE ON UPDATE CASCADE,
  order_id VARCHAR(100) NOT NULL REFERENCES transactions(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS for updated_at
-- ============================================================
DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INDEXES for new tables
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_username ON transactions(username);
CREATE INDEX IF NOT EXISTS idx_payment_logs_username ON payment_logs(username);
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_riwayat_username ON riwayat(username);
CREATE INDEX IF NOT EXISTS idx_riwayat_order_id ON riwayat(order_id);

-- Disable Row Level Security for server-side access
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE riwayat DISABLE ROW LEVEL SECURITY;

