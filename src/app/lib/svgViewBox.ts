/**
 * Adds a viewBox built from the width and height of an SVG that has none. Without it the drawing
 * ignores the CSS size of the element and stays unscaled in the top left corner.
 */
export function ensureViewBox(svg: string): string {
  return svg.replace(/<svg\b[^>]*>/i, (tag) => {
    if (/\sviewBox\s*=/i.test(tag)) return tag;

    const width = /\swidth\s*=\s*["']([\d.]+)(?:px)?["']/i.exec(tag)?.[1];
    const height = /\sheight\s*=\s*["']([\d.]+)(?:px)?["']/i.exec(tag)?.[1];
    if (!width || !height) return tag;

    return tag.replace(/\/?>$/, (end) => ` viewBox="0 0 ${width} ${height}"${end}`);
  });
}
