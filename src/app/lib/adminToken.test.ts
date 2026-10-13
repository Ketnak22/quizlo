import { describe, expect, it } from 'vitest';

import { isValidAdminToken } from './adminToken';

describe('isValidAdminToken', () => {
  it('accepts only the exact token', () => {
    expect(isValidAdminToken('secret', 'secret')).toBe(true);
    expect(isValidAdminToken('secret2', 'secret')).toBe(false);
    expect(isValidAdminToken('', 'secret')).toBe(false);
  });

  it('rejects a missing token', () => {
    expect(isValidAdminToken(null, 'secret')).toBe(false);
  });
});
