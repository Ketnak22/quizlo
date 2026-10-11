import { pl } from '@/app/i18n/pl';
import { ADMIN_TOKEN_HEADER } from '@/app/lib/config';

/** Posts an upload form and returns an error message, or null on success. */
export async function submitUpload(
  url: string,
  body: FormData,
  token: string,
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { [ADMIN_TOKEN_HEADER]: token },
      body,
    });
    if (res.ok) return null;

    const payload: { error?: string } = await res.json();
    return payload.error ?? pl.creator.uploadFailed;
  } catch (err) {
    console.error('Upload failed:', err);
    return pl.creator.uploadFailed;
  }
}
