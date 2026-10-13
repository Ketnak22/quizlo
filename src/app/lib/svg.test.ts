import { describe, expect, it } from 'vitest';

import { hasAllPathIds, sanitizeSvg } from './svg';

const validSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path id="PL-MZ" d="M0 0h5v5z"/></svg>';

describe('sanitizeSvg', () => {
  it('keeps region paths and the viewBox', () => {
    const sanitized = sanitizeSvg(validSvg);
    expect(sanitized).toContain('id="PL-MZ"');
    expect(sanitized).toContain('viewBox="0 0 10 10"');
  });

  it('accepts files with an XML declaration and doctype', () => {
    const file = `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
      ${validSvg}`;
    expect(sanitizeSvg(file)).toContain('id="PL-MZ"');
  });

  it('removes scripts and event handlers', () => {
    const sanitized = sanitizeSvg(
      '<svg onload="alert(1)"><script>alert(2)</script><path id="a" onclick="alert(3)" d="M0 0"/></svg>',
    );
    expect(sanitized).not.toMatch(/alert|script|onload|onclick/);
    expect(sanitized).toContain('id="a"');
  });

  it('returns null when nothing usable is left', () => {
    expect(sanitizeSvg('')).toBeNull();
    expect(sanitizeSvg('just text')).toBeNull();
    expect(sanitizeSvg('<script>alert(1)</script>')).toBeNull();
  });
});

describe('hasAllPathIds', () => {
  it('checks that every region exists in the SVG', () => {
    expect(hasAllPathIds(validSvg, ['PL-MZ'])).toBe(true);
    expect(hasAllPathIds(validSvg, ['PL-MZ', 'PL-SL'])).toBe(false);
  });
});
