import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { cert, initializeApp } from 'firebase-admin/app';
import {
  DocumentReference,
  type Firestore,
  GeoPoint,
  getFirestore,
  Timestamp,
} from 'firebase-admin/firestore';

const BACKUP_DIR = 'backups';

interface BackupDocument {
  id: string;
  data: Record<string, unknown>;
  collections: Record<string, BackupDocument[]>;
}

// Firestore-specific types are tagged, so the backup is lossless and can be restored later.
function serialize(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return { __type: 'timestamp', seconds: value.seconds, nanoseconds: value.nanoseconds };
  }
  if (value instanceof GeoPoint) {
    return { __type: 'geopoint', latitude: value.latitude, longitude: value.longitude };
  }
  if (value instanceof DocumentReference) return { __type: 'reference', path: value.path };
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return { __type: 'bytes', base64: Buffer.from(value).toString('base64') };
  }
  if (Array.isArray(value)) return value.map(serialize);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, serialize(v)]));
  }
  return value;
}

async function readCollection(
  collection: FirebaseFirestore.CollectionReference,
): Promise<BackupDocument[]> {
  // listDocuments also returns "missing" documents that only have subcollections.
  const refs = await collection.listDocuments();
  const documents: BackupDocument[] = [];

  for (const ref of refs) {
    const snapshot = await ref.get();
    const subcollections: Record<string, BackupDocument[]> = {};
    for (const sub of await ref.listCollections()) {
      subcollections[sub.id] = await readCollection(sub);
    }
    documents.push({
      id: ref.id,
      data: snapshot.exists ? (serialize(snapshot.data()) as Record<string, unknown>) : {},
      collections: subcollections,
    });
  }
  return documents;
}

async function backup(db: Firestore) {
  const collections: Record<string, BackupDocument[]> = {};
  for (const collection of await db.listCollections()) {
    collections[collection.id] = await readCollection(collection);
    console.log(`${collection.id}: ${collections[collection.id].length} documents`);
  }
  return collections;
}

async function main() {
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

  const collections = await backup(getFirestore());

  mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = join(BACKUP_DIR, `firestore-${stamp}.json`);
  writeFileSync(
    file,
    JSON.stringify({ projectId, createdAt: new Date().toISOString(), collections }, null, 2),
  );
  console.log(`Backup saved to ${file}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
