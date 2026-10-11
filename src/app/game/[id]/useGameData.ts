import { useEffect, useState } from 'react';

import { pl } from '@/app/i18n/pl';
import type { GameRecord } from '@/app/types/game';

type GameDataState<T> =
  { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: T };

/** Fetches a game and converts it with `parse`, which must be a stable function reference. */
export function useGameData<T>(gameId: string, parse: (game: GameRecord) => T): GameDataState<T> {
  const [state, setState] = useState<GameDataState<T>>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/game/${encodeURIComponent(gameId)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!res.ok) {
          const message = res.status === 404 ? pl.game.notFound : pl.game.loadFailed;
          setState({ status: 'error', message });
          return;
        }

        const game: GameRecord = await res.json();
        setState({ status: 'ready', data: parse(game) });
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Failed to load game:', err);
        setState({ status: 'error', message: pl.game.loadFailed });
      }
    })();

    return () => controller.abort();
  }, [gameId, parse]);

  return state;
}
