import MapCreator from './MapCreator';

// ADMIN_TOKEN is read per request, so it can change without a rebuild.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <MapCreator uploadsEnabled={Boolean(process.env.ADMIN_TOKEN)} />;
}
