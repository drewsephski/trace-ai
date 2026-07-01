import { describe, expect, it } from 'vitest';
import enUSTeamLocale from '@/renderer/services/i18n/locales/en-US/team.json';
import zhCNTeamLocale from '@/renderer/services/i18n/locales/zh-CN/team.json';
import {
  chooseTeamOnboardingAssistantId,
  readTeamOnboardingDefaultAssistantId,
  writeTeamOnboardingDefaultAssistantId,
  TEAM_ONBOARDING_DEFAULT_ASSISTANT_KEY,
} from '@/renderer/pages/team/utils/teamOnboardingPreference';

describe('team runtime UI removal', () => {
  it('does not keep team runtime notice translations in the renderer locale', () => {
    expect('runtime' in zhCNTeamLocale).toBe(false);
  });
});

describe('team onboarding default preference', () => {
  it('uses a brief general team setup prompt for the onboarding tour', () => {
    const prompt = enUSTeamLocale.onboarding.run.defaultPrompt;

    expect(prompt).toContain('Set up a reusable agent team');
    expect(prompt).toContain('Use only user-configured runtimes');
    expect(prompt).toContain('do not use Aion CLI or aionrs');
    expect(prompt).toContain('create these agents if missing');
    expect(prompt).toContain('Frontend Engineer');
    expect(prompt).toContain('Backend Engineer');
    expect(prompt).toContain('QA Engineer');
    expect(prompt).toContain('Product Manager');
    expect(prompt).toContain('Ping each agent once');
    expect(prompt).not.toContain('settings modal');
    expect(prompt).not.toContain('tiny planning task');
  });

  it('uses the saved assistant when it is still available for team mode', () => {
    const selected = chooseTeamOnboardingAssistantId(
      [
        { id: 'codex', enabled: true, team_capable: true },
        { id: 'claude', enabled: true, team_capable: true },
      ],
      'claude'
    );

    expect(selected).toBe('claude');
  });

  it('falls back to the first usable assistant when the saved choice is unavailable', () => {
    const selected = chooseTeamOnboardingAssistantId(
      [
        { id: 'missing', enabled: false, team_capable: true },
        { id: 'aion', enabled: true, team_capable: true, backend: 'aionrs', agent_source: 'internal' },
        { id: 'codex', enabled: true, team_capable: true },
        { id: 'blocked', enabled: true, team_capable: false },
      ],
      'aion'
    );

    expect(selected).toBe('codex');
  });

  it('persists and clears the selected assistant id through storage', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };

    writeTeamOnboardingDefaultAssistantId(storage, ' codex ');
    expect(values.get(TEAM_ONBOARDING_DEFAULT_ASSISTANT_KEY)).toBe('codex');
    expect(readTeamOnboardingDefaultAssistantId(storage)).toBe('codex');

    writeTeamOnboardingDefaultAssistantId(storage, undefined);
    expect(readTeamOnboardingDefaultAssistantId(storage)).toBeUndefined();
  });
});
