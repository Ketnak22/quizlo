import { createHash, timingSafeEqual } from 'node:crypto';

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/** Compares digests, so the check takes the same time regardless of where the tokens differ. */
export function isValidAdminToken(provided: string | null, expected: string): boolean {
  return provided !== null && timingSafeEqual(sha256(provided), sha256(expected));
}
