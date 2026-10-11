'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { pl } from '@/app/i18n/pl';
import type { GameSummary } from '@/app/types/game';
import styles from './QuizSelector.module.css';

export default function QuizSelector({ quizzes }: { quizzes: GameSummary[] }) {
  const [selectedId, setSelectedId] = useState(quizzes[0]?.id ?? '');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedId) {
      router.push(`/game/${selectedId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <select
        aria-label={pl.home.selectLabel}
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        {quizzes.map((quiz) => (
          <option key={quiz.id} value={quiz.id}>
            {quiz.name}
          </option>
        ))}
      </select>
      <button type="submit" className="btn btnPrimary" disabled={!selectedId}>
        {pl.home.play}
      </button>
    </form>
  );
}
