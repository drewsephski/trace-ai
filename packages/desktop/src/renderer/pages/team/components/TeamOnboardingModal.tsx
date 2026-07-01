import { ipcBridge } from '@/common';
import type { ITeamRunAck } from '@/common/types/team/teamTypes';
import AionModal from '@/renderer/components/base/AionModal';
import { Button, Input, Message } from '@arco-design/web-react';
import { Play, Robot } from '@icon-park/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  visible: boolean;
  teamId: string;
  onClose: () => void;
  onTeamRunAck: (ack: ITeamRunAck) => void;
};

const DEFAULT_TOUR_PROMPT =
  'Set up this team using the connected runtimes available now. Add only missing role agents with a matching connected runtime: Frontend Engineer, Backend Engineer, QA Engineer, and Product Manager. Ping each agent you add. If a role cannot be added, list it under Skipped with the missing runtime.';

const TeamOnboardingModal: React.FC<Props> = ({ visible, teamId, onClose, onTeamRunAck }) => {
  const { t } = useTranslation();
  const [tourPrompt, setTourPrompt] = useState(() =>
    t('team.onboarding.run.defaultPrompt', { defaultValue: DEFAULT_TOUR_PROMPT })
  );
  const [runningTour, setRunningTour] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTourPrompt(t('team.onboarding.run.defaultPrompt', { defaultValue: DEFAULT_TOUR_PROMPT }));
  }, [t, visible]);

  const handleRunTour = useCallback(async () => {
    const input = tourPrompt.trim();
    if (!input) {
      Message.warning(t('team.onboarding.run.promptRequired', { defaultValue: 'Enter a setup prompt first' }));
      return;
    }
    setRunningTour(true);
    try {
      const ack = await ipcBridge.team.sendMessage.invoke({ team_id: teamId, input, files: [] });
      onTeamRunAck(ack);
      Message.success(t('team.onboarding.run.started', { defaultValue: 'Setup prompt sent to the team' }));
      onClose();
    } catch (error) {
      console.error('Failed to run team onboarding tour:', error);
      Message.error(t('team.onboarding.run.failed', { defaultValue: 'Failed to start team setup' }));
    } finally {
      setRunningTour(false);
    }
  }, [onClose, onTeamRunAck, t, teamId, tourPrompt]);

  const modalFooter = useMemo(
    () => (
      <div className='mt-12px flex items-center justify-end gap-8px'>
        <Button onClick={onClose} disabled={runningTour}>
          {t('common.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button
          type='primary'
          icon={<Play size='14' className='mr-6px' />}
          loading={runningTour}
          onClick={() => void handleRunTour()}
          data-testid='team-onboarding-run-tour'
        >
          {t('team.onboarding.run.action', { defaultValue: 'Run setup prompt' })}
        </Button>
      </div>
    ),
    [handleRunTour, onClose, runningTour, t]
  );

  return (
    <AionModal
      visible={visible}
      onCancel={onClose}
      style={{ width: 680 }}
      autoFocus={false}
      unmountOnExit
      title={t('team.onboarding.title', { defaultValue: 'Team setup' })}
      footer={modalFooter}
    >
      <div className='flex flex-col gap-14px'>
        <div>
          <div className='text-16px font-600 text-t-primary'>
            {t('team.onboarding.run.title', { defaultValue: 'Run team setup' })}
          </div>
          <div className='mt-4px text-12px leading-18px text-t-secondary'>
            {t('team.onboarding.run.description', {
              defaultValue:
                'Send a setup prompt to this team. The leader will coordinate only assistants that are backed by connected user runtimes.',
            })}
          </div>
        </div>
        <Input.TextArea
          value={tourPrompt}
          onChange={setTourPrompt}
          autoSize={{ minRows: 6, maxRows: 8 }}
          data-testid='team-onboarding-tour-prompt'
        />
        <div className='rounded-8px border border-border-2 bg-fill-1 px-12px py-10px text-12px leading-18px text-t-secondary'>
          <div className='flex items-center gap-8px font-600 text-t-primary'>
            <Robot size='16' />
            <span>
              {t('team.onboarding.run.currentTeamLabel', { defaultValue: 'Current team will run this setup prompt' })}
            </span>
          </div>
          <div className='mt-4px'>
            {t('team.onboarding.run.defaultNote', {
              defaultValue: 'This run uses the leader already configured on the current team.',
            })}
          </div>
        </div>
      </div>
    </AionModal>
  );
};

export default TeamOnboardingModal;
