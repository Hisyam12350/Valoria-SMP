// src/lib/rcon.ts
import { Rcon } from "rcon-client";

const RCON_HOST = process.env.MINECRAFT_RCON_HOST ?? "localhost";
const RCON_PORT = parseInt(process.env.MINECRAFT_RCON_PORT ?? "25575");
const RCON_PASSWORD = process.env.MINECRAFT_RCON_PASSWORD!;

/**
 * Kirim satu command ke Minecraft server via RCON
 */
export async function sendRconCommand(command: string): Promise<string> {
  const rcon = new Rcon({
    host: RCON_HOST,
    port: RCON_PORT,
    password: RCON_PASSWORD,
    timeout: 5000,
  });

  try {
    await rcon.connect();
    const response = await rcon.send(command);
    console.log(`[RCON] Command: ${command} | Response: ${response}`);
    return response;
  } finally {
    await rcon.end();
  }
}

/**
 * Beri points ke player via PlayerPoints
 * Command: /playerpoints give <username> <amount>
 */
export async function givePoints(username: string, amount: number): Promise<string> {
  return sendRconCommand(`playerpoints give ${username} ${amount}`);
}

/**
 * Beri in-game money ke player via EssentialsX
 * Command: /eco give <username> <amount>
 */
export async function giveMoney(username: string, amount: number): Promise<string> {
  return sendRconCommand(`eco give ${username} ${amount}`);
}

/**
 * Beri rank ke player via LuckPerms
 * Command: /lp user <username> parent set <rank>
 */
export async function giveRank(username: string, rank: string): Promise<string> {
  return sendRconCommand(`lp user ${username} parent set ${rank}`);
}

/**
 * Beri skill XP ke player via AureliumSkills
 * Command: /skills xp add <username> <skill> <amount>
 * 
 * Skill yang tersedia di AureliumSkills:
 * farming, foraging, mining, fishing, excavation,
 * archery, defense, fighting, endurance, agility,
 * alchemy, enchanting, sorcery, healing, forging
 */
export async function giveSkillXp(
  username: string,
  skill: string,
  amount: number
): Promise<string> {
  return sendRconCommand(`skills xp add ${username} ${skill} ${amount}`);
}

/**
 * Beri skill level ke player via AureliumSkills
 * Command: /skills level add <username> <skill> <amount>
 */
export async function giveSkillLevel(
  username: string,
  skill: string,
  amount: number
): Promise<string> {
  return sendRconCommand(`skills level add ${username} ${skill} ${amount}`);
}

/**
 * Parse jumlah dari string format "2.500" → 2500
 */
export function parseFormattedNumber(value: string): number {
  return parseInt(value.replace(/\./g, "").replace(/,/g, ""), 10);
}