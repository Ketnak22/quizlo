import { z } from 'zod';

import { pl } from '@/app/i18n/pl';
import { MAX_INPUT_LENGTH } from './config';

const { validation } = pl;

function textField(emptyMessage: string, tooLongMessage: string) {
  return z.string().trim().min(1, emptyMessage).max(MAX_INPUT_LENGTH, tooLongMessage);
}

export const nameSchema = textField(
  validation.nameEmpty,
  validation.nameTooLong(MAX_INPUT_LENGTH),
);

export const quizContentSchema = z.object({
  question: textField(validation.questionEmpty, validation.questionTooLong(MAX_INPUT_LENGTH)),
  answers: z
    .array(textField(validation.answerEmpty, validation.answerTooLong(MAX_INPUT_LENGTH)))
    .min(1, validation.answersRequired),
  keys: z
    .array(textField(validation.keyEmpty, validation.keyTooLong(MAX_INPUT_LENGTH)))
    .optional(),
  headers: z
    .array(textField(validation.headerEmpty, validation.headerTooLong(MAX_INPUT_LENGTH)))
    .optional(),
});

export const quizUploadSchema = quizContentSchema
  .extend({ type: z.enum(['quiz', 'matchingQuiz'], validation.typeInvalid) })
  .refine((quiz) => quiz.type !== 'matchingQuiz' || quiz.keys?.length === quiz.answers.length, {
    message: validation.keysMismatch,
    path: ['keys'],
  })
  .refine((quiz) => quiz.type !== 'matchingQuiz' || quiz.headers?.length === 2, {
    message: validation.headersRequired,
    path: ['headers'],
  });

/** Maps SVG path ids to the region names players have to type. */
export const mapContentSchema = z
  .record(
    z.string().min(1, validation.regionIdEmpty),
    textField(validation.regionEmpty, validation.regionTooLong(MAX_INPUT_LENGTH)),
  )
  .refine((regions) => Object.keys(regions).length > 0, validation.regionsRequired);

export type QuizContent = z.infer<typeof quizContentSchema>;
export type MapContent = z.infer<typeof mapContentSchema>;
