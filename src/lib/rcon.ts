// src/lib/rcon.ts
import { Rcon } from "rcon-client";

const RCON_HOST = process.env.MINECRAFT_RCON_HOST ?? "localhost";
const RCON_PORT = parseInt(process.env.MINECRAFT_RCON_PORT ?? "22556");
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
 * Parse jumlah points dari string format "2.500" → 2500
 */
export function parseFormattedNumber(value: string): number {
  return parseInt(value.replace(/\./g, "").replace(/,/g, ""), 10);
}