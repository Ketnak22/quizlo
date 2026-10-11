'use client';

import DOMPurify from 'dompurify';
import { useRouter } from 'next/navigation';
import { type MouseEvent, useEffect, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';

import { pl } from '@/app/i18n/pl';
import { MAX_INPUT_LENGTH, MAX_SVG_FILE_SIZE_KB } from '@/app/lib/config';
import { mapContentSchema, nameSchema } from '@/app/lib/schemas';
import AdminAccess from '../AdminAccess';
import styles from '../creator.module.css';
import { submitUpload } from '../submitUpload';

interface Region {
  id: string;
  originalFill: string;
  customName: string;
  isExcluded: boolean;
}

interface LoadedSvg {
  original: string;
  sanitized: string;
}

const REGION_SELECTOR = 'path[id]';
const HIGHLIGHT_FILL = '#ffe5b4';

export default function MapCreator({ uploadsEnabled }: { uploadsEnabled: boolean }) {
  const router = useRouter();

  const previewRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [svg, setSvg] = useState<LoadedSvg | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mapName, setMapName] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      setError(pl.mapCreator.invalidFile(MAX_SVG_FILE_SIZE_KB));
      return;
    }

    const original = await file.text();
    const sanitized = DOMPurify.sanitize(original, { USE_PROFILES: { svg: true } });
    const doc = new DOMParser().parseFromString(sanitized, 'text/html');
    const paths = Array.from(doc.querySelectorAll<SVGPathElement>(REGION_SELECTOR));

    if (paths.length === 0) {
      setError(pl.mapCreator.noRegions);
      return;
    }

    setError(null);
    setSvg({ original, sanitized });
    setRegions(
      paths.map((path) => ({
        id: path.id,
        originalFill: path.style.fill,
        customName: '',
        isExcluded: false,
      })),
    );
  };

  // The preview is rendered once as raw HTML, so the highlight is applied directly to its paths.
  useEffect(() => {
    previewRef.current?.querySelectorAll<SVGPathElement>(REGION_SELECTOR).forEach((path, index) => {
      const region = regions[index];
      if (!region) return;

      path.style.fill = hoveredIndex === index ? HIGHLIGHT_FILL : region.originalFill;
      path.style.opacity = region.isExcluded ? '0.3' : '';
    });
  }, [hoveredIndex, regions]);

  const getRegionIndex = (target: EventTarget) => {
    const paths = previewRef.current?.querySelectorAll(REGION_SELECTOR) ?? [];
    return Array.from(paths).indexOf(target as Element);
  };

  const handlePreviewHover = (e: MouseEvent<HTMLDivElement>) => {
    const index = getRegionIndex(e.target);
    setHoveredIndex(index === -1 ? null : index);
  };

  const handlePreviewClick = (e: MouseEvent<HTMLDivElement>) => {
    inputRefs.current[getRegionIndex(e.target)]?.focus();
  };

  const updateRegion = (index: number, change: Partial<Region>) => {
    setRegions((prev) =>
      prev.map((region, i) => (i === index ? { ...region, ...change } : region)),
    );
  };

  const areAllExcluded = regions.every((region) => region.isExcluded);

  const toggleAllRegions = () => {
    setRegions((prev) =>
      prev.map((region) => ({
        ...region,
        isExcluded: !areAllExcluded,
        customName: areAllExcluded ? region.customName : '',
      })),
    );
  };

  const handleUpload = async () => {
    if (!svg) return;

    const name = nameSchema.safeParse(mapName);
    if (!name.success) {
      setError(name.error.issues[0].message);
      return;
    }

    const content = mapContentSchema.safeParse(
      Object.fromEntries(
        regions
          .filter((region) => !region.isExcluded)
          .map((region) => [region.id, region.customName || region.id]),
      ),
    );
    if (!content.success) {
      setError(content.error.issues[0].message);
      return;
    }

    const formData = new FormData();
    formData.append('svg', new Blob([svg.original], { type: 'image/svg+xml' }), 'map.svg');
    formData.append(
      'json',
      new Blob([JSON.stringify(content.data)], { type: 'application/json' }),
      'data.json',
    );
    formData.append('name', name.data);

    setIsSending(true);
    const uploadError = await submitUpload('/api/upload/map', formData, token);
    setIsSending(false);
    setError(uploadError);

    if (!uploadError) router.push('/');
  };

  return (
    <div className={`card ${styles.creator} ${svg ? styles.creatorWide : ''}`}>
      <h1 className={styles.title}>{pl.mapCreator.title}</h1>

      <AdminAccess uploadsEnabled={uploadsEnabled} token={token} onTokenChange={setToken} />

      {!svg && (
        <Dropzone
          accept={{ 'image/svg+xml': ['.svg'] }}
          maxSize={MAX_SVG_FILE_SIZE_KB * 1024}
          multiple={false}
          onDrop={handleDrop}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className={styles.dropzone}>
              <input {...getInputProps()} />
              <p>{pl.mapCreator.dropzone}</p>
            </div>
          )}
        </Dropzone>
      )}

      {svg && (
        <div className={styles.mapLayout}>
          <div
            ref={previewRef}
            className={styles.preview}
            onMouseOver={handlePreviewHover}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={handlePreviewClick}
            dangerouslySetInnerHTML={{ __html: svg.sanitized }}
          />

          <div className={styles.mapPanel}>
            <button type="button" className="btn btnSecondary" onClick={toggleAllRegions}>
              {areAllExcluded ? pl.mapCreator.includeAll : pl.mapCreator.excludeAll}
            </button>

            <div className={styles.regionList}>
              {regions.map((region, index) => (
                <div
                  key={region.id}
                  className={styles.row}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <input
                    type="text"
                    aria-label={pl.mapCreator.regionLabel(region.id)}
                    placeholder={region.id}
                    value={region.customName}
                    maxLength={MAX_INPUT_LENGTH}
                    disabled={region.isExcluded}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    onChange={(e) => updateRegion(index, { customName: e.target.value })}
                    onFocus={() => setHoveredIndex(index)}
                  />
                  <button
                    type="button"
                    className={`btn ${region.isExcluded ? 'btnSecondary' : 'btnDanger'} ${styles.iconButton}`}
                    aria-label={
                      region.isExcluded ? pl.mapCreator.includeRegion : pl.mapCreator.excludeRegion
                    }
                    onClick={() =>
                      updateRegion(index, { isExcluded: !region.isExcluded, customName: '' })
                    }
                  >
                    {region.isExcluded ? '↺' : '✕'}
                  </button>
                </div>
              ))}
            </div>

            <label className={styles.field}>
              <span>{pl.mapCreator.nameLabel}</span>
              <input
                type="text"
                placeholder={pl.mapCreator.namePlaceholder}
                value={mapName}
                maxLength={MAX_INPUT_LENGTH}
                onChange={(e) => setMapName(e.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {svg && (
        <div className={styles.submitRow}>
          <button
            type="button"
            className="btn btnPrimary"
            disabled={!uploadsEnabled || token === '' || isSending}
            onClick={handleUpload}
          >
            {isSending ? pl.creator.sending : pl.creator.send}
          </button>
        </div>
      )}
    </div>
  );
}
