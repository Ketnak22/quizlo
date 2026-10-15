import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { sanitizeSvg } from '../src/app/lib/svg';
import { seedGames } from './seed-data';

async function seed() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is not set. Copy .env.example to .env and fill it in.');
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

  const db = getFirestore();
  const batch = db.batch();

  // Fixed document ids make the script safe to rerun: it resets the sample games, never duplicates them.
  for (const game of seedGames) {
    const svgData = game.svg === null ? null : sanitizeSvg(game.svg);
    if (game.svg !== null && svgData === null) {
      throw new Error(`Seed game ${game.id} has an invalid SVG.`);
    }

    batch.set(db.collection('quizzes').doc(game.id), {
      type: game.type,
      name: game.name,
      jsonData: JSON.stringify(game.content),
      svgData,
      createdAt: new Date(),
      viewCount: 0,
    });
  }

  await batch.commit();
  console.log(`Seeded ${seedGames.length} games into project "${projectId}".`);
}

seed().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
