export const TEAM_ONBOARDING_DEFAULT_ASSISTANT_KEY = 'trace.teamOnboarding.defaultAssistantId';

export type TeamOnboardingAssistantCandidate = {
  id: string;
  enabled?: boolean;
  team_capable?: boolean;
  backend?: string;
  agent_source?: string;
};

type TeamOnboardingStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const canUseCandidate = (candidate: TeamOnboardingAssistantCandidate): boolean => {
  return (
    candidate.enabled !== false &&
    candidate.team_capable !== false &&
    candidate.backend !== 'aionrs' &&
    candidate.agent_source !== 'internal'
  );
};

export function chooseTeamOnboardingAssistantId(
  candidates: TeamOnboardingAssistantCandidate[],
  preferredId?: string | null
): string | undefined {
  const preferred = preferredId?.trim();
  if (preferred) {
    const match = candidates.find((candidate) => candidate.id === preferred && canUseCandidate(candidate));
    if (match) return match.id;
  }
  return candidates.find(canUseCandidate)?.id;
}

export function readTeamOnboardingDefaultAssistantId(storage: TeamOnboardingStorage | undefined): string | undefined {
  if (!storage) return undefined;
  try {
    return storage.getItem(TEAM_ONBOARDING_DEFAULT_ASSISTANT_KEY)?.trim() || undefined;
  } catch {
    return undefined;
  }
}

export function writeTeamOnboardingDefaultAssistantId(
  storage: TeamOnboardingStorage | undefined,
  assistantId: string | undefined
): void {
  if (!storage) return;
  try {
    const normalized = assistantId?.trim();
    if (normalized) {
      storage.setItem(TEAM_ONBOARDING_DEFAULT_ASSISTANT_KEY, normalized);
    } else {
      storage.removeItem(TEAM_ONBOARDING_DEFAULT_ASSISTANT_KEY);
    }
  } catch {
    // Browser storage can be unavailable in private or restricted contexts.
  }
}

export function getTeamOnboardingBrowserStorage(): Storage | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage;
}
