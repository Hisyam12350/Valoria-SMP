import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.mcsrvstat.us/2/play.valoriasmp.my.id', {
      next: { revalidate: 30 }, // Cache for 30 seconds
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch server status');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      online: data.online || false,
      players: {
        online: data.players?.online || 0,
        max: data.players?.max || 0,
      },
      version: data.version || 'Unknown',
      motd: data.motd?.clean?.join('\n') || '',
      hostname: data.hostname || 'play.valoriasmp.my.id',
      icon: data.icon || null,
    });
  } catch {
    return NextResponse.json({
      online: false,
      players: {
        online: 0,
        max: 0,
      },
      version: 'Unknown',
      motd: '',
      hostname: 'play.valoriasmp.my.id',
      icon: null,
    });
  }
}
