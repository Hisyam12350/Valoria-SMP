export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.MINECRAFTMP_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
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
