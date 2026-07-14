export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.MINECRAFTMP_API_KEY;

    if (!apiKey) {
      console.warn("WARNING: MINECRAFTMP_API_KEY is not configured! Returning mock voters for preview.");
      const mockVoters = [
        { rank: 1, name: "FatihMC", votes: 45, skinHead: "https://mc-heads.net/avatar/FatihMC/64" },
        { rank: 2, name: "ZennMC", votes: 38, skinHead: "https://mc-heads.net/avatar/ZennMC/64" },
        { rank: 3, name: "Lerzy", votes: 32, skinHead: "https://mc-heads.net/avatar/Lerzy/64" },
        { rank: 4, name: "Lyno", votes: 27, skinHead: "https://mc-heads.net/avatar/Lyno/64" },
        { rank: 5, name: "Ravex", votes: 21, skinHead: "https://mc-heads.net/avatar/Ravex/64" },
        { rank: 6, name: "WasingMC", votes: 18, skinHead: "https://mc-heads.net/avatar/WasingMC/64" },
      ];
      return NextResponse.json({ voters: mockVoters, isMock: true });
    }

    // Fetch top voters from MinecraftMP (current month)
    const response = await fetch(
      `https://minecraft-mp.com/api/?object=servers&element=voters&key=${apiKey}&month=current&format=json`,
      { next: { revalidate: 180 } } // cache 3 menit (sesuai cache MinecraftMP)
    );

    if (!response.ok) {
      throw new Error(`MinecraftMP API error: ${response.status}`);
    }

    const data = await response.json();

    // MinecraftMP returns: { voters: [ { nickname, votes }, ... ] }
    // Sort by votes desc, ambil top 10
    const voters = (data.voters ?? [])
      .sort((a: { votes: number }, b: { votes: number }) => b.votes - a.votes)
      .slice(0, 10)
      .map((v: { nickname: string; votes: number }, i: number) => ({
        rank: i + 1,
        name: v.nickname,
        votes: v.votes,
        skinHead: `https://mc-heads.net/avatar/${encodeURIComponent(v.nickname)}/64`,
      }));

    return NextResponse.json({ voters });
  } catch (err) {
    console.error('Top voters fetch error:', err);
    return NextResponse.json({ voters: [] }, { status: 200 });
  }
}
