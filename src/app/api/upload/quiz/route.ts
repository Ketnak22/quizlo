import { NextRequest, NextResponse } from 'next/server';

import { pl } from '@/app/i18n/pl';
import { MAX_JSON_FILE_SIZE_KB } from '@/app/lib/config';
import { addGame } from '@/app/lib/firebase';
import { nameSchema, quizUploadSchema } from '@/app/lib/schemas';
import { rejectUpload } from '@/app/lib/uploadGuard';

const MAX_JSON_BYTES = MAX_JSON_FILE_SIZE_KB * 1024;
const MULTIPART_OVERHEAD_BYTES = 16 * 1024;

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const rejection = rejectUpload(req, MAX_JSON_BYTES + MULTIPART_OVERHEAD_BYTES);
  if (rejection) return rejection;

  try {
    const formData = await req.formData().catch(() => null);
    if (!formData) return badRequest(pl.api.invalidForm);

    const quizDataRaw = formData.get('quizData');
    const name = formData.get('name');

    if (typeof name !== 'string') return badRequest(pl.api.nameRequired);
    if (typeof quizDataRaw !== 'string') return badRequest(pl.api.quizDataRequired);

    if (new TextEncoder().encode(quizDataRaw).length > MAX_JSON_BYTES) {
      return badRequest(pl.api.jsonTooLarge(MAX_JSON_FILE_SIZE_KB));
    }

    const validatedName = nameSchema.safeParse(name);
    if (!validatedName.success) return badRequest(validatedName.error.issues[0].message);

    let parsedQuiz: unknown;
    try {
      parsedQuiz = JSON.parse(quizDataRaw);
    } catch {
      return badRequest(pl.api.jsonInvalid);
    }

    const quiz = quizUploadSchema.safeParse(parsedQuiz);
    if (!quiz.success) return badRequest(quiz.error.issues[0].message);

    const { type, ...content } = quiz.data;
    await addGame(type, validatedName.data, JSON.stringify(content));

    return NextResponse.json({ status: 'ok' }, { status: 201 });
  } catch (err) {
    console.error('POST /api/upload/quiz failed:', err);
    return NextResponse.json({ error: pl.api.serverError }, { status: 500 });
  }
}
