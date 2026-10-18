'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { pl } from '@/app/i18n/pl';
import { MAX_INPUT_LENGTH } from '@/app/lib/config';
import { nameSchema, quizUploadSchema } from '@/app/lib/schemas';
import AdminAccess from '../AdminAccess';
import styles from '../creator.module.css';
import { submitUpload } from '../submitUpload';

type QuizFormType = 'quiz' | 'matchingQuiz';

interface QuizRow {
  key: string;
  answer: string;
}

const EMPTY_ROW: QuizRow = { key: '', answer: '' };

export default function QuizCreator({ uploadsEnabled }: { uploadsEnabled: boolean }) {
  const router = useRouter();

  const [question, setQuestion] = useState('');
  const [type, setType] = useState<QuizFormType>('quiz');
  const [headers, setHeaders] = useState<[string, string]>(['', '']);
  const [rows, setRows] = useState<QuizRow[]>([EMPTY_ROW]);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const isMatching = type === 'matchingQuiz';

  const updateRow = (index: number, change: Partial<QuizRow>) => {
    setRows((prev) => prev.map((row, idx) => (idx === index ? { ...row, ...change } : row)));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const quiz = quizUploadSchema.safeParse({
      type,
      question,
      answers: rows.map((row) => row.answer),
      ...(isMatching && { keys: rows.map((row) => row.key), headers }),
    });
    if (!quiz.success) {
      setError(quiz.error.issues[0].message);
      return;
    }

    const formData = new FormData();
    formData.append('quizData', JSON.stringify(quiz.data));
    formData.append('name', nameSchema.parse(quiz.data.question));

    setIsSending(true);
    const uploadError = await submitUpload('/api/upload/quiz', formData, token);
    setIsSending(false);
    setError(uploadError);

    if (!uploadError) router.push('/');
  };

  return (
    <form className={`card ${styles.creator}`} onSubmit={handleSubmit}>
      <h1 className={styles.title}>{pl.quizCreator.title}</h1>

      <AdminAccess uploadsEnabled={uploadsEnabled} token={token} onTokenChange={setToken} />

      <input
        type="text"
        className={styles.questionInput}
        aria-label={pl.quizCreator.questionLabel}
        placeholder={pl.quizCreator.questionPlaceholder}
        value={question}
        maxLength={MAX_INPUT_LENGTH}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <label className={styles.typeRow}>
        <span>{pl.quizCreator.typeLabel}:</span>
        <select value={type} onChange={(e) => setType(e.target.value as QuizFormType)}>
          <option value="quiz">{pl.quizCreator.typeQuiz}</option>
          <option value="matchingQuiz">{pl.quizCreator.typeMatching}</option>
        </select>
      </label>

      {isMatching && (
        <div className={styles.headerRow}>
          <input
            type="text"
            aria-label={pl.quizCreator.keyHeaderPlaceholder}
            placeholder={pl.quizCreator.keyHeaderPlaceholder}
            value={headers[0]}
            maxLength={MAX_INPUT_LENGTH}
            onChange={(e) => setHeaders([e.target.value, headers[1]])}
          />
          <input
            type="text"
            aria-label={pl.quizCreator.answerHeaderPlaceholder}
            placeholder={pl.quizCreator.answerHeaderPlaceholder}
            value={headers[1]}
            maxLength={MAX_INPUT_LENGTH}
            onChange={(e) => setHeaders([headers[0], e.target.value])}
          />
        </div>
      )}

      <div className={styles.rows}>
        {rows.map((row, index) => (
          <div key={index} className={styles.row}>
            {isMatching && (
              <input
                type="text"
                className={styles.keyInput}
                aria-label={pl.quizCreator.keyPlaceholder}
                placeholder={pl.quizCreator.keyPlaceholder}
                value={row.key}
                maxLength={MAX_INPUT_LENGTH}
                onChange={(e) => updateRow(index, { key: e.target.value })}
              />
            )}
            <input
              type="text"
              aria-label={pl.quizCreator.answerPlaceholder}
              placeholder={pl.quizCreator.answerPlaceholder}
              value={row.answer}
              maxLength={MAX_INPUT_LENGTH}
              onChange={(e) => updateRow(index, { answer: e.target.value })}
            />
            <button
              type="button"
              className={styles.removeButton}
              aria-label={pl.quizCreator.removeRow}
              disabled={rows.length === 1}
              onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== index))}
            >
              X
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.plusButton}
        aria-label={pl.quizCreator.addRow}
        onClick={() => setRows((prev) => [...prev, EMPTY_ROW])}
      >
        +
      </button>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn btnSecondary"
        disabled={!uploadsEnabled || token === '' || isSending}
      >
        {isSending ? pl.creator.sending : pl.creator.send}
      </button>
    </form>
  );
}
