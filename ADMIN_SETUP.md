# 🛡️ VALORIA SMP — Admin Dashboard Setup Guide

---

## Langkah 1 — Install Packages

```bash
npm install @supabase/supabase-js @supabase/ssr bcryptjs
npm install -D @types/bcryptjs
```

---

## Langkah 2 — Jalankan SQL Schema di Supabase

1. Buka supabase.com → masuk ke project kamu
2. Klik **SQL Editor** di sidebar kiri
3. Copy-paste seluruh isi file `supabase-schema.sql`
4. Klik **Run**

---

## Langkah 3 — Ambil Service Role Key dari Supabase

> WAJIB agar dashboard admin bisa baca & tulis data.

1. Supabase Dashboard → Project Settings → API
2. Copy nilai **service_role** (bukan anon!)
3. Taruh di SUPABASE_SERVICE_ROLE_KEY di Vercel

---

## Langkah 4 — Environment Variables di Vercel

Vercel Dashboard → Project → Settings → Environment Variables

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://pqhktkgtobhmfnfmpxvn.supabase.co |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | sb_publishable_eJ9-5hOz17K2z7eUnfGRYA_jJUGS7VJ |
| SUPABASE_SERVICE_ROLE_KEY | (ambil dari Supabase → service_role) |
| NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY | 0x4AAAAAADBQccjz_Dzel_jp |
| CF_TURNSTILE_SECRET_KEY | 0x4AAAAAADBQcdTjHUD6F11Cy1pjtOqAVUw |
| ADMIN_SETUP_KEY | valoria-admin-setup-2025 |

---

## Langkah 5 — Buat Superadmin Pertama

```bash
curl -X POST https://valoriasmp.my.id/api/admin/setup \
  -H "Content-Type: application/json" \
  -H "x-setup-key: valoria-admin-setup-2025" \
  -d '{"username":"superadmin","email":"admin@valoriasmp.my.id","password":"PasswordKuat123!"}'
```

---

## Langkah 6 — Login

Buka: https://valoriasmp.my.id/admin/login
Atau klik tombol Admin di navbar website.

---

## Fitur Keamanan

- Rate limiting: max 5 gagal / 30 menit per IP
- Auto block IP setelah 5x gagal
- Cloudflare Turnstile CAPTCHA
- HTTP-only cookie session
- bcrypt password hashing
- Session expire 8 jam
- Middleware route protection
- noindex untuk halaman admin

---

## Troubleshooting

Login gagal? → Cek SUPABASE_SERVICE_ROLE_KEY di Vercel
CAPTCHA tidak muncul? → Daftarkan domain di Cloudflare Turnstile
IP terblokir? → Hapus di Supabase → Table Editor → blocked_ips
