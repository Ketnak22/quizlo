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
  const games = db.collection('quizzes');
  const batch = db.batch();

  // Games are matched by name, so rerunning resets the sample games instead of duplicating them.
  // New ones get an auto-generated id, the same as games made in the app.
  const existing = new Map(
    (await games.select('name').get()).docs.map((doc) => [doc.get('name'), doc.ref]),
  );

  for (const game of seedGames) {
    const svgData = game.svg === null ? null : sanitizeSvg(game.svg);
    if (game.svg !== null && svgData === null) {
      throw new Error(`Seed game "${game.name}" has an invalid SVG.`);
    }

    batch.set(existing.get(game.name) ?? games.doc(), {
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
