import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();
const mutateMock = vi.fn();
const useSWRMock = vi.fn();
const teamPageMock = vi.fn(() => <div data-testid='team-page' />);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ id: 'team-1' }),
}));

vi.mock('swr', () => ({
  __esModule: true,
  default: (...args: unknown[]) => useSWRMock(...args),
}));

vi.mock('@/common', () => ({
  ipcBridge: {
    team: {
      get: {
        invoke: vi.fn(),
      },
    },
  },
}));

vi.mock('@/renderer/pages/team/TeamPage', () => ({
  __esModule: true,
  default: (props: unknown) => teamPageMock(props),
}));

import TeamIndex from '@/renderer/pages/team';

describe('TeamIndex', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    mutateMock.mockReset();
    useSWRMock.mockReset();
    teamPageMock.mockClear();
  });

  it('shows a visible loading state while the team is loading', () => {
    const { container } = renderTeamIndex({ isLoading: true });

    expect(container.querySelector('.arco-spin')).toBeInTheDocument();
    expect(teamPageMock).not.toHaveBeenCalled();
  });

  it('renders a recoverable fallback when team data is missing', () => {
    renderTeamIndex({ data: null });

    expect(screen.getByRole('alert')).toHaveTextContent('common.routeError.title');
    expect(screen.getByRole('alert')).toHaveTextContent('common.routeError.description');
    expect(teamPageMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('common.retry'));
    expect(mutateMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('common.routeError.backHome'));
    expect(navigateMock).toHaveBeenCalledWith('/guid', { replace: true });
  });

  it('normalizes malformed assistant data before rendering the team page', () => {
    renderTeamIndex({
      data: {
        id: 'team-1',
        user_id: 'user-1',
        name: 'Team',
        workspace: '',
        workspace_mode: 'shared',
        leader_assistant_id: 'leader',
        assistants: undefined,
        created_at: 1,
        updated_at: 1,
      },
    });

    expect(screen.getByTestId('team-page')).toBeInTheDocument();
    expect(teamPageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        team: expect.objectContaining({
          assistants: [],
        }),
      })
    );
  });
});

function renderTeamIndex(result: Record<string, unknown>) {
  useSWRMock.mockReturnValue({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: mutateMock,
    ...result,
  });

  return render(<TeamIndex />);
}
