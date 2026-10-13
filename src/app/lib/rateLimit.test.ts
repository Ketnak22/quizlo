import { describe, expect, it } from 'vitest';

import { createRateLimiter } from './rateLimit';

describe('createRateLimiter', () => {
  function setup() {
    const clock = { time: 0 };
    const check = createRateLimiter({ maxRequests: 2, windowMs: 10_000 }, () => clock.time);
    return { clock, check };
  }

  it('allows requests up to the limit, then blocks with a retry time', () => {
    const { clock, check } = setup();
    expect(check('ip').allowed).toBe(true);
    expect(check('ip').allowed).toBe(true);

    clock.time = 2_500;
    expect(check('ip')).toEqual({ allowed: false, retryAfterSeconds: 8 });
  });

  it('counts each key separately', () => {
    const { check } = setup();
    check('a');
    check('a');
    expect(check('a').allowed).toBe(false);
    expect(check('b').allowed).toBe(true);
  });

  it('starts a new window once the old one expires', () => {
    const { clock, check } = setup();
    check('ip');
    check('ip');

    clock.time = 10_000;
    expect(check('ip').allowed).toBe(true);
  });
});
