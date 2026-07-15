-- Add missing columns to existing discount_codes table (if they don't exist yet)
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Table: discount_usages (to track per-user usage)
CREATE TABLE IF NOT EXISTS discount_usages (
    id BIGSERIAL PRIMARY KEY,
    discount_id BIGINT NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(discount_id, username)
);

-- Table: players
CREATE TABLE IF NOT EXISTS players (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    rank VARCHAR(50) DEFAULT 'Member',
    points INTEGER DEFAULT 0,
    money INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at for discount_codes and players
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for discount_codes only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_discount_codes_updated_at') THEN
        CREATE TRIGGER update_discount_codes_updated_at
            BEFORE UPDATE ON discount_codes
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create trigger for players only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_players_updated_at') THEN
        CREATE TRIGGER update_players_updated_at
            BEFORE UPDATE ON players
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
