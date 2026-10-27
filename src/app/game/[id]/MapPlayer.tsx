'use client';

import DOMPurify from 'dompurify';
import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';

import StatusMessage from '@/app/components/StatusMessage';
import { pl } from '@/app/i18n/pl';
import { type MapContent, mapContentSchema } from '@/app/lib/schemas';
import { ensureViewBox } from '@/app/lib/svgViewBox';
import type { GameRecord } from '@/app/types/game';
import styles from './game.module.css';
import GamePanel from './GamePanel';
import { useAnswerGame } from './useAnswerGame';
import { useGameData } from './useGameData';

interface MapGame {
  name: string;
  svg: string;
  regions: MapContent;
}

interface Tooltip {
  label: string;
  x: number;
  y: number;
}

function parseMap(game: GameRecord): MapGame {
  if (!game.svgData) throw new Error('Map game has no SVG data');
  return {
    name: game.name,
    svg: ensureViewBox(DOMPurify.sanitize(game.svgData, { USE_PROFILES: { svg: true } })),
    regions: mapContentSchema.parse(JSON.parse(game.jsonData)),
  };
}

export default function MapPlayer({ mapId }: { mapId: string }) {
  const map = useGameData(mapId, parseMap);

  if (map.status === 'loading') {
    return <StatusMessage variant="loading">{pl.game.loading}</StatusMessage>;
  }
  if (map.status === 'error') {
    return <StatusMessage variant="error">{map.message}</StatusMessage>;
  }
  return <MapBoard map={map.data} />;
}

function MapBoard({ map }: { map: MapGame }) {
  const regionIds = useMemo(() => Object.keys(map.regions), [map.regions]);
  const answers = useMemo(() => Object.values(map.regions), [map.regions]);
  const regionIndexes = useMemo(
    () => new Map(regionIds.map((id, index) => [id, index])),
    [regionIds],
  );

  const game = useAnswerGame(answers);
  const { guessed, isFinished } = game;

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  // React replaces the markup whenever this object changes, which would wipe the region colors.
  const svgHtml = useMemo(() => ({ __html: map.svg }), [map.svg]);

  // The SVG markup is rendered once as raw HTML, so region colors are applied directly to its paths.
  useEffect(() => {
    svgContainerRef.current?.querySelectorAll('path').forEach((path) => {
      const index = regionIndexes.get(path.id);
      if (index === undefined) return;

      if (guessed.has(index)) path.style.fill = 'var(--color-map-correct)';
      else if (isFinished) path.style.fill = 'var(--color-map-missed)';
    });
  }, [guessed, isFinished, regionIndexes]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const index = e.target instanceof SVGPathElement ? regionIndexes.get(e.target.id) : undefined;
    const isRevealed = index !== undefined && (isFinished || guessed.has(index));

    setTooltip(isRevealed ? { label: answers[index], x: e.clientX, y: e.clientY } : null);
  };

  return (
    <div className={styles.board}>
      <h1 className={styles.title}>{map.name}</h1>
      <GamePanel game={game} variant="map" />

      <div
        ref={svgContainerRef}
        className={`card ${styles.map}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        dangerouslySetInnerHTML={svgHtml}
      />

      {tooltip && (
        <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.label}
        </div>
      )}
    </div>
  );
}
