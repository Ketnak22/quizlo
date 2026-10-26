import { describe, expect, it } from 'vitest';

import { ensureViewBox } from './svgViewBox';

describe('ensureViewBox', () => {
  it('builds the viewBox from width and height', () => {
    expect(ensureViewBox('<svg width="497" height="463"><path/></svg>')).toBe(
      '<svg width="497" height="463" viewBox="0 0 497 463"><path/></svg>',
    );
  });

  it('accepts pixel units and single quotes', () => {
    expect(ensureViewBox("<svg width='680px' height='540px'/>")).toBe(
      "<svg width='680px' height='540px' viewBox=\"0 0 680 540\"/>",
    );
  });

  it('keeps an existing viewBox', () => {
    const svg = '<svg width="10" height="20" viewBox="5 5 1 1"></svg>';
    expect(ensureViewBox(svg)).toBe(svg);
  });

  it('leaves relative and missing sizes alone', () => {
    const relative = '<svg width="100%" height="100%"></svg>';
    expect(ensureViewBox(relative)).toBe(relative);
    expect(ensureViewBox('<svg></svg>')).toBe('<svg></svg>');
  });

  it('only changes the root element', () => {
    const svg = '<svg width="1" height="1" viewBox="0 0 1 1"><svg width="2" height="2"/></svg>';
    expect(ensureViewBox(svg)).toBe(svg);
  });
});
