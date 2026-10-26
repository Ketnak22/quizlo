'use client';

import DOMPurify from 'dompurify';
import { useRouter } from 'next/navigation';
import { type MouseEvent, useEffect, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';

import { pl } from '@/app/i18n/pl';
import { MAX_INPUT_LENGTH, MAX_SVG_FILE_SIZE_KB } from '@/app/lib/config';
import { mapContentSchema, nameSchema } from '@/app/lib/schemas';
import { ensureViewBox } from '@/app/lib/svgViewBox';
import AdminAccess from '../AdminAccess';
import styles from '../creator.module.css';
import { submitUpload } from '../submitUpload';
import { DEMO_MAPS } from './demoMaps';

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
const HOVER_FILL = '#ffe5b4';
const SELECTED_FILL = 'var(--color-primary)';

export default function MapCreator({ uploadsEnabled }: { uploadsEnabled: boolean }) {
  const router = useRouter();

  const previewRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [svg, setSvg] = useState<LoadedSvg | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mapName, setMapName] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const loadSvg = (original: string) => {
    const sanitized = ensureViewBox(DOMPurify.sanitize(original, { USE_PROFILES: { svg: true } }));
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

  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      setError(pl.mapCreator.invalidFile(MAX_SVG_FILE_SIZE_KB));
      return;
    }

    loadSvg(await file.text());
  };

  const handleDemoMapSelect = async (file: string) => {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`Unexpected status ${res.status}`);
      loadSvg(await res.text());
    } catch (err) {
      console.error('Failed to load demo map:', err);
      setError(pl.mapCreator.demoMapLoadFailed);
    }
  };

  const handleChangeMap = () => {
    setSvg(null);
    setRegions([]);
    setHoveredIndex(null);
    setSelectedIndex(null);
    setError(null);
  };

  // The preview is rendered once as raw HTML, so the highlight is applied directly to its paths.
  useEffect(() => {
    previewRef.current?.querySelectorAll<SVGPathElement>(REGION_SELECTOR).forEach((path, index) => {
      const region = regions[index];
      if (!region) return;

      if (selectedIndex === index) path.style.fill = SELECTED_FILL;
      else if (hoveredIndex === index) path.style.fill = HOVER_FILL;
      else path.style.fill = region.originalFill;
      path.style.opacity = region.isExcluded ? '0.3' : '';
    });
  }, [hoveredIndex, selectedIndex, regions]);

  const getRegionIndex = (target: EventTarget) => {
    const paths = previewRef.current?.querySelectorAll(REGION_SELECTOR) ?? [];
    return Array.from(paths).indexOf(target as Element);
  };

  const handlePreviewHover = (e: MouseEvent<HTMLDivElement>) => {
    const index = getRegionIndex(e.target);
    setHoveredIndex(index === -1 ? null : index);
  };

  const handlePreviewClick = (e: MouseEvent<HTMLDivElement>) => {
    const index = getRegionIndex(e.target);
    if (index === -1) return;

    setSelectedIndex(index);
    inputRefs.current[index]?.focus();
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
    <div className={styles.mapCreator}>
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

      {!svg && !uploadsEnabled && (
        <div className={styles.demoMaps}>
          <p>{pl.mapCreator.demoMapsTitle}</p>
          <div className={styles.demoMapList}>
            {DEMO_MAPS.map((map) => (
              <button
                key={map.file}
                type="button"
                className="btn btnSecondary"
                onClick={() => handleDemoMapSelect(map.file)}
              >
                {map.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {svg && (
        <button type="button" className="btn btnSecondary" onClick={handleChangeMap}>
          {pl.mapCreator.changeMap}
        </button>
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
            <button
              type="button"
              className={`${areAllExcluded ? styles.restoreButton : styles.removeButton} ${styles.toggleAll}`}
              onClick={toggleAllRegions}
            >
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
                    onFocus={() => setSelectedIndex(index)}
                  />
                  <button
                    type="button"
                    className={region.isExcluded ? styles.restoreButton : styles.removeButton}
                    aria-label={
                      region.isExcluded ? pl.mapCreator.includeRegion : pl.mapCreator.excludeRegion
                    }
                    onClick={() =>
                      updateRegion(index, { isExcluded: !region.isExcluded, customName: '' })
                    }
                  >
                    {region.isExcluded ? '↺' : 'X'}
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.mapSubmitRow}>
              <input
                type="text"
                aria-label={pl.mapCreator.nameLabel}
                placeholder={pl.mapCreator.namePlaceholder}
                value={mapName}
                maxLength={MAX_INPUT_LENGTH}
                onChange={(e) => setMapName(e.target.value)}
              />
              <button
                type="button"
                className="btn btnSecondary"
                disabled={!uploadsEnabled || token === '' || isSending}
                onClick={handleUpload}
              >
                {isSending ? pl.creator.sending : pl.creator.send}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
