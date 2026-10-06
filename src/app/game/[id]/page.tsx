import { notFound } from 'next/navigation';

import { getGameTypeById, incrementGameViewCount } from '@/app/lib/firebase';
import MapPlayer from './MapPlayer';
import QuizPlayer from './QuizPlayer';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const gameType = await getGameTypeById(id);
  if (!gameType) notFound();

  // A failed view count must not block the game itself.
  try {
    await incrementGameViewCount(id);
  } catch (err) {
    console.error('Error incrementing view count:', err);
  }

  return gameType === 'map' ? <MapPlayer mapId={id} /> : <QuizPlayer quizId={id} />;
}
