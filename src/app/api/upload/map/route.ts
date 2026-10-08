import { NextRequest, NextResponse } from 'next/server';

import { pl } from '@/app/i18n/pl';
import { MAX_JSON_FILE_SIZE_KB, MAX_SVG_FILE_SIZE_KB } from '@/app/lib/config';
import { addGame } from '@/app/lib/firebase';
import { mapContentSchema, nameSchema } from '@/app/lib/schemas';
import { hasAllPathIds, sanitizeSvg } from '@/app/lib/svg';
import { rejectUpload } from '@/app/lib/uploadGuard';

const MAX_SVG_BYTES = MAX_SVG_FILE_SIZE_KB * 1024;
const MAX_JSON_BYTES = MAX_JSON_FILE_SIZE_KB * 1024;
const MULTIPART_OVERHEAD_BYTES = 16 * 1024;

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const rejection = rejectUpload(req, MAX_SVG_BYTES + MAX_JSON_BYTES + MULTIPART_OVERHEAD_BYTES);
  if (rejection) return rejection;

  try {
    const formData = await req.formData().catch(() => null);
    if (!formData) return badRequest(pl.api.invalidForm);

    const svgFile = formData.get('svg');
    const jsonFile = formData.get('json');
    const name = formData.get('name');

    if (!(svgFile instanceof File)) return badRequest(pl.api.svgRequired);
    if (!(jsonFile instanceof File)) return badRequest(pl.api.jsonRequired);
    if (typeof name !== 'string') return badRequest(pl.api.nameRequired);

    if (svgFile.size > MAX_SVG_BYTES) return badRequest(pl.api.svgTooLarge(MAX_SVG_FILE_SIZE_KB));
    if (jsonFile.size > MAX_JSON_BYTES) {
      return badRequest(pl.api.jsonTooLarge(MAX_JSON_FILE_SIZE_KB));
    }
    if (svgFile.type !== 'image/svg+xml') return badRequest(pl.api.svgInvalid);

    const validatedName = nameSchema.safeParse(name);
    if (!validatedName.success) return badRequest(validatedName.error.issues[0].message);

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(await jsonFile.text());
    } catch {
      return badRequest(pl.api.jsonInvalid);
    }

    const regions = mapContentSchema.safeParse(parsedJson);
    if (!regions.success) return badRequest(regions.error.issues[0].message);

    const sanitizedSvg = sanitizeSvg(await svgFile.text());
    if (!sanitizedSvg) return badRequest(pl.api.svgInvalid);
    if (!hasAllPathIds(sanitizedSvg, Object.keys(regions.data))) {
      return badRequest(pl.api.svgMissingRegions);
    }

    await addGame('map', validatedName.data, JSON.stringify(regions.data), sanitizedSvg);

    return NextResponse.json({ status: 'ok' }, { status: 201 });
  } catch (err) {
    console.error('POST /api/upload/map failed:', err);
    return NextResponse.json({ error: pl.api.serverError }, { status: 500 });
  }
}
