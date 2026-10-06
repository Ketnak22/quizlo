import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore';

import type { GameRecord, GameSummary, GameType } from '@/app/types/game';

// Firestore auto-generated ids and the seed ids both fit this pattern. Anything else (for example
// a decoded "a/b") would make the SDK throw on an invalid document path.
const GAME_ID_PATTERN = /^[\w-]{1,128}$/;

// Initialized on first use, so importing this module during `next build` needs no credentials.
function getGames() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore().collection('quizzes');
}

export async function addGame(
  type: GameType,
  name: string,
  jsonData: string,
  svgData: string | null = null,
): Promise<string> {
  const docRef = await getGames().add({
    type,
    name,
    jsonData,
    svgData,
    createdAt: new Date(),
    viewCount: 0,
  });
  return docRef.id;
}

export async function getGameSummaries(): Promise<GameSummary[]> {
  const snapshot = await getGames().select('name').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, name: doc.get('name') }));
}

export async function getPopularGames(limit = 3): Promise<GameSummary[]> {
  const snapshot = await getGames().orderBy('viewCount', 'desc').limit(limit).select('name').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, name: doc.get('name') }));
}

export async function incrementGameViewCount(gameId: string): Promise<void> {
  await getGames()
    .doc(gameId)
    .update({ viewCount: FieldValue.increment(1) });
}

export async function getGameById(gameId: string): Promise<GameRecord | null> {
  if (!GAME_ID_PATTERN.test(gameId)) return null;

  const doc = await getGames().doc(gameId).get();
  if (!doc.exists) return null;

  return {
    type: doc.get('type'),
    name: doc.get('name'),
    jsonData: doc.get('jsonData'),
    svgData: doc.get('svgData') ?? null,
  };
}

export async function getGameTypeById(gameId: string): Promise<GameType | null> {
  if (!GAME_ID_PATTERN.test(gameId)) return null;

  const snapshot = await getGames()
    .where(FieldPath.documentId(), '==', gameId)
    .select('type')
    .limit(1)
    .get();
  return snapshot.empty ? null : snapshot.docs[0].get('type');
}
