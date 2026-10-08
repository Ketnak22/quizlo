import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const domPurify = createDOMPurify(new JSDOM('').window);

/** Returns the sanitized SVG, or null when nothing usable is left after sanitizing. */
export function sanitizeSvg(svg: string): string | null {
  const sanitized = domPurify.sanitize(svg, { USE_PROFILES: { svg: true } }).trim();
  return /^<svg[\s>]/i.test(sanitized) ? sanitized : null;
}

export function hasAllPathIds(svg: string, pathIds: string[]): boolean {
  const { document } = new JSDOM(svg).window;
  const svgPathIds = new Set(Array.from(document.querySelectorAll('path'), (path) => path.id));
  return pathIds.every((id) => svgPathIds.has(id));
}
