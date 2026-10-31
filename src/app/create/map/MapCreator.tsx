'use client';

import DOMPurify from 'dompurify';
import { useRouter } from 'next/navigation';
import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
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
const EXCLUDED_FILL = '#fff';

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

  // React replaces the markup whenever this object changes, which would wipe the highlight.
  const previewHtml = useMemo(() => ({ __html: svg?.sanitized ?? '' }), [svg]);

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

      if (selectedIndex === index && !region.isExcluded) path.style.fill = SELECTED_FILL;
      else if (hoveredIndex === index) path.style.fill = HOVER_FILL;
      else if (region.isExcluded) path.style.fill = EXCLUDED_FILL;
      else path.style.fill = region.originalFill;
      path.classList.toggle(styles.excludedRegion, region.isExcluded);
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

  const toggleRegion = (index: number) => {
    setRegions((prev) =>
      prev.map((region, i) =>
        i === index ? { ...region, isExcluded: !region.isExcluded } : region,
      ),
    );
  };

  const handlePreviewClick = (e: MouseEvent<HTMLDivElement>) => {
    const index = getRegionIndex(e.target);
    if (index === -1) return;

    if (index === selectedIndex) {
      setSelectedIndex(null);
      return;
    }

    setSelectedIndex(index);
    inputRefs.current[index]?.scrollIntoView({ block: 'nearest' });
    inputRefs.current[index]?.focus();
  };

  const handlePreviewRightClick = (e: MouseEvent<HTMLDivElement>) => {
    const index = getRegionIndex(e.target);
    if (index === -1) return;

    e.preventDefault();
    toggleRegion(index);
    // Without this the hover color would hide the change until the cursor leaves the region.
    setHoveredIndex(null);
  };

  const updateRegion = (index: number, change: Partial<Region>) => {
    setRegions((prev) =>
      prev.map((region, i) => (i === index ? { ...region, ...change } : region)),
    );
  };

  const setAllExcluded = (isExcluded: boolean) => {
    setRegions((prev) => prev.map((region) => ({ ...region, isExcluded })));
  };

  const includedCount = regions.filter((region) => !region.isExcluded).length;

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
          <div className={styles.previewColumn}>
            <p className={styles.mapHint}>{pl.mapCreator.mapHint}</p>

            <div
              ref={previewRef}
              className={styles.preview}
              onMouseOver={handlePreviewHover}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={handlePreviewClick}
              onContextMenu={handlePreviewRightClick}
              dangerouslySetInnerHTML={previewHtml}
            />

            <ul className={styles.mapLegend}>
              <li>
                <span className={`${styles.swatch} ${styles.swatchIncluded}`} />
                {pl.mapCreator.legendIncluded}
              </li>
              <li>
                <span className={`${styles.swatch} ${styles.swatchExcluded}`} />
                {pl.mapCreator.legendExcluded}
              </li>
            </ul>
          </div>

          <div className={styles.mapPanel}>
            <div className={styles.regionsHeader}>
              <p className={styles.regionCount} aria-live="polite">
                {pl.mapCreator.includedCount(includedCount, regions.length)}
              </p>
              <div className={styles.regionsActions}>
                <button
                  type="button"
                  className={styles.restoreButton}
                  disabled={includedCount === regions.length}
                  onClick={() => setAllExcluded(false)}
                >
                  {pl.mapCreator.includeAll}
                </button>
                <button
                  type="button"
                  className={styles.removeButton}
                  disabled={includedCount === 0}
                  onClick={() => setAllExcluded(true)}
                >
                  {pl.mapCreator.excludeAll}
                </button>
              </div>
            </div>

            <p className={styles.regionsHint}>{pl.mapCreator.regionsHint}</p>

            <div className={styles.regionList}>
              {regions.map((region, index) => (
                <div
                  key={region.id}
                  className={`${styles.row} ${index === hoveredIndex || index === selectedIndex ? styles.rowActive : ''}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <input
                    type="checkbox"
                    className={styles.regionCheckbox}
                    aria-label={pl.mapCreator.regionIncludedLabel(region.customName || region.id)}
                    checked={!region.isExcluded}
                    onChange={() => toggleRegion(index)}
                  />
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
