import { supabaseAdmin } from './supabase';
import { NextRequest } from 'next/server';

export const SESSION_COOKIE = 'valoria_admin_session';
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 30;
export const SESSION_DURATION_HOURS = 8;

// ── Generate random token (Edge Runtime compatible) ────────────
async function generateToken(): Promise<string> {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Timing-safe string compare (Edge Runtime compatible) ───────
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  
  const aKey = await crypto.subtle.importKey('raw', aBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bKey = await crypto.subtle.importKey('raw', bBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  
  const testData = encoder.encode('compare');
  const [aSig, bSig] = await Promise.all([
    crypto.subtle.sign('HMAC', aKey, testData),
    crypto.subtle.sign('HMAC', bKey, testData),
  ]);
  
  const aArr = new Uint8Array(aSig);
  const bArr = new Uint8Array(bSig);
  let diff = 0;
  for (let i = 0; i < aArr.length; i++) diff |= aArr[i] ^ bArr[i];
  return diff === 0;
}

export { timingSafeEqual };

// ── Sanitize input ─────────────────────────────────────────────
function sanitize(input: string, maxLen = 100): string {
  return String(input).trim().slice(0, maxLen);
}

// ── Rate limiting ──────────────────────────────────────────────
export async function checkRateLimit(ip: string): Promise<{
  blocked: boolean;
  reason?: string;
  remainingAttempts?: number;
}> {
  const safeIp = sanitize(ip, 50);

  const { data: blocked } = await supabaseAdmin
    .from('blocked_ips')
    .select('*')
    .eq('ip_address', safeIp)
    .maybeSingle();

  if (blocked) {
    if (blocked.is_permanent) {
      return { blocked: true, reason: 'IP Anda telah diblokir secara permanen.' };
    }
    if (blocked.blocked_until && new Date(blocked.blocked_until) > new Date()) {
      const mins = Math.ceil(
        (new Date(blocked.blocked_until).getTime() - Date.now()) / 60000
      );
      return { blocked: true, reason: `IP Anda diblokir. Coba lagi dalam ${mins} menit.` };
    }
    await supabaseAdmin.from('blocked_ips').delete().eq('ip_address', safeIp);
  }

  const since = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', safeIp)
    .eq('success', false)
    .gte('attempted_at', since);

  const attempts = count ?? 0;

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    const blockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();
    await supabaseAdmin.from('blocked_ips').upsert(
      { ip_address: safeIp, reason: `${attempts}x gagal login`, blocked_until: blockedUntil, is_permanent: false },
      { onConflict: 'ip_address' }
    );
    return { blocked: true, reason: `Terlalu banyak percobaan. IP diblokir ${LOCKOUT_DURATION_MINUTES} menit.` };
  }

  return { blocked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS - attempts };
}

// ── Record login attempt ───────────────────────────────────────
export async function recordLoginAttempt(ip: string, username: string, success: boolean) {
  await supabaseAdmin.from('login_attempts').insert({
    ip_address: sanitize(ip, 50),
    username_tried: sanitize(username, 100),
    success,
  });
}

// ── Create session ─────────────────────────────────────────────
export async function createSession(adminId: string, ip: string, userAgent: string): Promise<string> {
  const token = await generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();

  // Hapus sesi lama
  await supabaseAdmin.from('admin_sessions').delete().eq('admin_id', adminId);

  await supabaseAdmin.from('admin_sessions').insert({
    admin_id: adminId,
    session_token: token,
    ip_address: sanitize(ip, 50),
    user_agent: sanitize(userAgent, 255),
    expires_at: expiresAt,
  });

  await supabaseAdmin.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', adminId);
  return token;
}

// ── Validate session ───────────────────────────────────────────
export async function validateSession(token: string): Promise<{
  valid: boolean;
  admin?: { id: string; username: string; email: string; role: string };
}> {
  if (!token || token.length !== 128) return { valid: false };
  if (!/^[a-f0-9]+$/.test(token)) return { valid: false };

  const { data: session } = await supabaseAdmin
    .from('admin_sessions')
    .select('*, admin_users(*)')
    .eq('session_token', token)
    .maybeSingle();

  if (!session) return { valid: false };

  if (new Date(session.expires_at) < new Date()) {
    await supabaseAdmin.from('admin_sessions').delete().eq('session_token', token);
    return { valid: false };
  }

  const admin = session.admin_users as {
    id: string; username: string; email: string; role: string; is_active: boolean;
  };

  if (!admin?.is_active) return { valid: false };

  return { valid: true, admin: { id: admin.id, username: admin.username, email: admin.email, role: admin.role } };
}

// ── Get admin dari request ─────────────────────────────────────
export async function getAdminFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const result = await validateSession(token);
  return result.valid ? result.admin : null;
}

// ── Log activity ───────────────────────────────────────────────
export async function logActivity(
  adminId: string, adminUsername: string, action: string,
  details?: Record<string, unknown>, ip?: string
) {
  await supabaseAdmin.from('admin_activity_log').insert({
    admin_id: adminId,
    admin_username: sanitize(adminUsername, 50),
    action: sanitize(action, 100),
    details,
    ip_address: ip ? sanitize(ip, 50) : null,
  });
}

// ── Get client IP ──────────────────────────────────────────────
export function getClientIP(req: NextRequest): string {
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.split(',')[0].trim();
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}
