import { describe, expect, it } from 'vitest';
import { resolveAuthOutcome } from '@/lib/auth-utils';

describe('resolveAuthOutcome', () => {
  it('marks signup as pending confirmation when a user is created but no session is available', () => {
    const outcome = resolveAuthOutcome({
      user: { id: 'user-1' } as any,
      session: null,
      error: null,
    });

    expect(outcome.success).toBe(false);
    expect(outcome.requiresEmailConfirmation).toBe(true);
  });

  it('marks signin/signup as successful when a session is available', () => {
    const outcome = resolveAuthOutcome({
      user: { id: 'user-1' } as any,
      session: { access_token: 'token' } as any,
      error: null,
    });

    expect(outcome.success).toBe(true);
    expect(outcome.requiresEmailConfirmation).toBe(false);
  });
});
