import { ipcBridge } from '@/common';
import type { TTeam } from '@/common/types/team/teamTypes';
import { Button, Spin } from '@arco-design/web-react';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import TeamPage from './TeamPage';

type TeamRouteStateProps = {
  onRetry: () => void;
  onBackHome: () => void;
};

const normalizeTeamForRender = (team: TTeam): TTeam => ({
  ...team,
  assistants: Array.isArray(team.assistants) ? team.assistants : [],
});

const TeamRouteState: React.FC<TeamRouteStateProps> = ({ onRetry, onBackHome }) => {
  const { t } = useTranslation();

  return (
    <div className='flex size-full min-h-0 items-center justify-center bg-1 px-24px' role='alert'>
      <div className='flex max-w-520px flex-col items-center gap-12px text-center'>
        <div className='text-18px font-600 text-t-primary'>{t('common.routeError.title')}</div>
        <div className='text-13px leading-20px text-t-secondary'>{t('common.routeError.description')}</div>
        <div className='mt-8px flex items-center gap-8px'>
          <Button onClick={onRetry}>{t('common.retry')}</Button>
          <Button type='primary' onClick={onBackHome}>
            {t('common.routeError.backHome')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const TeamIndex: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: team,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<TTeam | null>(id ? `team/${id}` : null, () => ipcBridge.team.get.invoke({ id: id! }));
  const handleRetry = useCallback(() => {
    void mutate();
  }, [mutate]);
  const handleBackHome = useCallback(() => {
    navigate('/guid', { replace: true });
  }, [navigate]);
  const normalizedTeam = useMemo(() => (team ? normalizeTeamForRender(team) : null), [team]);

  if (isLoading || (!normalizedTeam && isValidating)) {
    return (
      <div className='flex size-full min-h-0 items-center justify-center bg-1'>
        <Spin loading />
      </div>
    );
  }

  if (error || !normalizedTeam) {
    return <TeamRouteState onRetry={handleRetry} onBackHome={handleBackHome} />;
  }

  return <TeamPage key={normalizedTeam.id} team={normalizedTeam} />;
};

export default TeamIndex;
