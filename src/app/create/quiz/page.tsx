import QuizCreator from './QuizCreator';

// ADMIN_TOKEN is read per request, so it can change without a rebuild.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <QuizCreator uploadsEnabled={Boolean(process.env.ADMIN_TOKEN)} />;
}
