import { NextResponse } from 'next/server';

import { pl } from '@/app/i18n/pl';
import { getGameById } from '@/app/lib/firebase';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const game = await getGameById(id);
    if (!game) return NextResponse.json({ error: pl.api.notFound }, { status: 404 });
    return NextResponse.json(game);
  } catch (err) {
    console.error('GET /api/game/[id] failed:', err);
    return NextResponse.json({ error: pl.api.serverError }, { status: 500 });
  }
}
