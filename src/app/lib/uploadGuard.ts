import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { pl } from '@/app/i18n/pl';
import { isValidAdminToken } from './adminToken';
import { ADMIN_TOKEN_HEADER } from './config';
import { createRateLimiter } from './rateLimit';

const checkRateLimit = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

/** Returns the error response for a request that must not reach the upload logic, otherwise null. */
export function rejectUpload(req: NextRequest, maxBodyBytes: number): NextResponse | null {
  const rateLimit = checkRateLimit(getClientIp(req));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: pl.api.rateLimited },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
    );
  }

  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ error: pl.api.uploadsDisabled }, { status: 403 });
  }
  if (!isValidAdminToken(req.headers.get(ADMIN_TOKEN_HEADER), adminToken)) {
    return NextResponse.json({ error: pl.api.unauthorized }, { status: 401 });
  }

  if (Number(req.headers.get('content-length') ?? 0) > maxBodyBytes) {
    return NextResponse.json({ error: pl.api.payloadTooLarge }, { status: 413 });
  }

  return null;
}
