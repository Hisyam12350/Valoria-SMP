import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Primary API: mcstatus.io (sangat cepat & akurat tanpa problem DNS/cache)
    const primaryRes = await fetch('https://api.mcstatus.io/v2/status/java/play.valoriasmp.my.id', {
      next: { revalidate: 15 },
    });

    if (primaryRes.ok) {
      const data = await primaryRes.json();
      if (data.online) {
        return NextResponse.json({
          online: true,
          players: {
            online: data.players?.online || 0,
            max: data.players?.max || 0,
          },
          version: data.version?.name_clean || '1.20.x - 1.26.x',
          motd: data.motd?.clean || '',
          hostname: 'play.valoriasmp.my.id',
          icon: data.icon || null,
        });
      }
    }

    // Fallback API: mcsrvstat.us
    const fallbackRes = await fetch('https://api.mcsrvstat.us/2/play.valoriasmp.my.id', {
      next: { revalidate: 30 },
    });

    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      return NextResponse.json({
        online: data.online || false,
        players: {
          online: data.players?.online || 0,
          max: data.players?.max || 0,
        },
        version: data.version || '1.20.x - 1.26.x',
        motd: data.motd?.clean?.join('\n') || '',
        hostname: data.hostname || 'play.valoriasmp.my.id',
        icon: data.icon || null,
      });
    }

    throw new Error('Failed to fetch server status from status APIs');
  } catch {
    return NextResponse.json({
      online: false,
      players: { online: 0, max: 0 },
      version: 'Unknown',
      motd: '',
      hostname: 'play.valoriasmp.my.id',
      icon: null,
    });
  }
}
