import mysql from "mysql2/promise";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local in the root directory
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("[Sync] ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const SYNC_INTERVAL_MS = 60 * 1000; // Run every 60 seconds

async function syncPlayers() {
  console.log(`\n[Sync] [${new Date().toISOString()}] Memulai sinkronisasi player...`);
  
  let mysqlConnection;
  try {
    // Connect to MariaDB/MySQL
    mysqlConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // 1. Ambil data player dan grup-grup mereka dari MariaDB
    const [mariaPlayersRaw]: any = await mysqlConnection.execute(
      `
      SELECT p.username, p.primary_group, perm.permission
      FROM luckperms_players p
      LEFT JOIN luckperms_user_permissions perm 
        ON p.uuid = perm.uuid AND perm.permission LIKE 'group.%'
      `
    );
    console.log(`[Sync] Ditemukan ${mariaPlayersRaw.length} baris pemetaan player-grup di MariaDB.`);

    if (mariaPlayersRaw.length === 0) {
      console.log("[Sync] MariaDB kosong. Sinkronisasi dibatalkan.");
      return;
    }

    // 2. Ambil data player dari Supabase
    const { data: supabasePlayers, error: sbError } = await supabase
      .from("players")
      .select("username, rank");

    if (sbError) {
      throw new Error(`Gagal mengambil data dari Supabase: ${sbError.message}`);
    }

    console.log(`[Sync] Ditemukan ${supabasePlayers.length} player di Supabase.`);

    // 3. Buat map player Supabase untuk pencarian cepat
    const supabaseMap = new Map<string, string>();
    for (const p of supabasePlayers) {
      supabaseMap.set(p.username.toLowerCase(), p.rank || "Member");
    }

    // Kelompokkan hasil MariaDB berdasarkan username untuk menentukan rank tertinggi
    const playerGroupsMap = new Map<string, { primaryGroup: string; groups: string[]; originalUsername: string }>();
    for (const row of mariaPlayersRaw) {
      if (!row.username) continue;
      const usernameLower = row.username.toLowerCase();
      
      let entry = playerGroupsMap.get(usernameLower);
      if (!entry) {
        entry = {
          primaryGroup: row.primary_group,
          groups: [],
          originalUsername: row.username
        };
        playerGroupsMap.set(usernameLower, entry);
      }
      if (row.permission) {
        entry.groups.push(row.permission);
      }
    }

    // 4. Cari perbedaan (player baru atau pangkat berubah)
    const playersToUpsert: Array<{ username: string; rank: string }> = [];
    const RANK_HIERARCHY = ['sovereign', 'ethereal', 'crystall', 'crystal', 'astra', 'valiant', 'street', 'default'];

    for (const [usernameLower, entry] of playerGroupsMap.entries()) {
      let resolvedRank = (entry.primaryGroup || 'default').toLowerCase();
      const userGroups = entry.groups.map(g => g.substring(6).toLowerCase());
      
      for (const rank of RANK_HIERARCHY) {
        if (userGroups.includes(rank) || (entry.primaryGroup && entry.primaryGroup.toLowerCase() === rank)) {
          resolvedRank = rank === 'crystal' ? 'crystall' : rank;
          break;
        }
      }

      const existingRank = supabaseMap.get(usernameLower);

      // Jika player tidak ada di Supabase, atau pangkatnya berubah
      if (!existingRank || existingRank !== resolvedRank) {
        playersToUpsert.push({
          username: entry.originalUsername,
          rank: resolvedRank,
        });
      }
    }

    console.log(`[Sync] Ditemukan ${playersToUpsert.length} player yang perlu disinkronkan.`);

    if (playersToUpsert.length === 0) {
      console.log("[Sync] Semua player sudah sinkron.");
      return;
    }

    // 5. Lakukan batch upsert (per 500 baris untuk efisiensi dan keamanan query)
    const chunkSize = 500;
    for (let i = 0; i < playersToUpsert.length; i += chunkSize) {
      const chunk = playersToUpsert.slice(i, i + chunkSize);
      
      const { error: upsertError } = await supabase
        .from("players")
        .upsert(chunk, { onConflict: "username" });

      if (upsertError) {
        console.error(`[Sync] Gagal mengunggah batch ke Supabase (indeks ${i}):`, upsertError.message);
      } else {
        console.log(`[Sync] Berhasil mengunggah ${chunk.length} player (batch ${Math.floor(i / chunkSize) + 1}).`);
      }
    }

    console.log("[Sync] Sinkronisasi selesai dengan sukses.");
  } catch (error: any) {
    console.error("[Sync] Terjadi error saat sinkronisasi:", error.message || error);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end().catch(() => {});
    }
  }
}

// Menjalankan scheduler loop
async function main() {
  console.log("[Sync] Menjalankan layanan sinkronisasi database...");
  
  // Jalankan sync pertama kali saat start
  await syncPlayers();

  // Jadwalkan berkala menggunakan setTimeout rekursif agar tidak tumpang tindih
  const scheduleNext = () => {
    setTimeout(async () => {
      await syncPlayers();
      scheduleNext();
    }, SYNC_INTERVAL_MS);
  };
  
  scheduleNext();
}

main();
