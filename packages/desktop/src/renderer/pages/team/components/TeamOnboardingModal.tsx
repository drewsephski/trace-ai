import { ipcBridge } from '@/common';
import type { ITeamRunAck } from '@/common/types/team/teamTypes';
import AionModal from '@/renderer/components/base/AionModal';
import AionSteps from '@/renderer/components/base/AionSteps';
import { useConversationAssistants } from '@/renderer/pages/conversation/hooks/useConversationAssistants';
import { resolveLocaleKey } from '@/common/utils';
import { MANAGED_AGENTS_SWR_KEY, fetchManagedAgents } from '@/renderer/utils/model/agentTypes';
import type { ManagedAgent } from '@/renderer/utils/model/agentTypes';
import { Button, Empty, Input, Message, Radio, Spin, Tag, Tooltip } from '@arco-design/web-react';
import { Check, Play, Refresh, Robot, Setting } from '@icon-park/react';
import type { TFunction } from 'i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import {
  AssistantOptionLabel,
  assistantKey,
  assistantToOption,
  filterTeamSupportedAssistants,
} from './assistantSelectUtils';
import {
  chooseTeamOnboardingAssistantId,
  getTeamOnboardingBrowserStorage,
  readTeamOnboardingDefaultAssistantId,
  writeTeamOnboardingDefaultAssistantId,
} from '../utils/teamOnboardingPreference';

type Props = {
  visible: boolean;
  teamId: string;
  onClose: () => void;
  onTeamRunAck: (ack: ITeamRunAck) => void;
};

type RuntimeStatusView = {
  color: 'green' | 'orangered' | 'gray' | 'red';
  label: string;
};

const DEFAULT_TOUR_PROMPT =
  'Set up a reusable agent team for general software work. Use only user-configured runtimes; do not use Aion CLI or aionrs. Inspect the current team and available runtimes, then create these agents if missing: Frontend Engineer, Backend Engineer, QA Engineer, and Product Manager. Ping each agent once to confirm its role and readiness. If creation is blocked, say what is missing and how to finish setup in Trace. End with a short checklist of agents created and pinged.';

const runtimeStatusView = (agent: ManagedAgent, t: TFunction): RuntimeStatusView => {
  if (!agent.installed) {
    return {
      color: 'gray',
      label: t('team.onboarding.runtimeStatus.missing', { defaultValue: 'Not installed' }),
    };
  }
  if (agent.status === 'online') {
    return {
      color: 'green',
      label: t('team.onboarding.runtimeStatus.online', { defaultValue: 'Ready' }),
    };
  }
  if (agent.status === 'offline') {
    return {
      color: 'orangered',
      label: t('team.onboarding.runtimeStatus.offline', { defaultValue: 'Needs check' }),
    };
  }
  return {
    color: 'red',
    label: t('team.onboarding.runtimeStatus.unavailable', { defaultValue: 'Unavailable' }),
  };
};

const runtimeSourceLabel = (agent: ManagedAgent, t: TFunction): string => {
  switch (agent.agent_source) {
    case 'builtin':
      return t('team.onboarding.runtimeSource.builtin', { defaultValue: 'Builtin' });
    case 'custom':
      return t('team.onboarding.runtimeSource.custom', { defaultValue: 'Custom' });
    case 'extension':
      return t('team.onboarding.runtimeSource.extension', { defaultValue: 'Extension' });
    case 'internal':
      return t('team.onboarding.runtimeSource.internal', { defaultValue: 'Internal' });
    default:
      return t('team.onboarding.runtimeSource.unknown', { defaultValue: 'Runtime' });
  }
};

const formatRuntimeCommand = (agent: ManagedAgent): string => {
  const command = agent.command?.trim();
  const args = agent.args?.filter(Boolean).join(' ');
  return [command, args].filter(Boolean).join(' ') || agent.agent_source_info?.binary_name || agent.backend || agent.id;
};

const isUserConfiguredRuntime = (agent: ManagedAgent): boolean => {
  return agent.agent_type !== 'aionrs' && agent.backend !== 'aionrs' && agent.agent_source !== 'internal';
};

const selectedCardClass = (selected: boolean): string =>
  selected
    ? 'border-primary-6 bg-fill-1 shadow-[0_8px_20px_rgba(0,0,0,0.08)]'
    : 'border-border-2 bg-fill-1 hover:border-primary-3 hover:bg-fill-2';

const TeamOnboardingModal: React.FC<Props> = ({ visible, teamId, onClose, onTeamRunAck }) => {
  const { t, i18n } = useTranslation();
  const localeKey = resolveLocaleKey(i18n?.language ?? 'en-US');
  const { presetAssistants, isLoading: assistantsLoading } = useConversationAssistants();
  const {
    data: runtimeAgents,
    isLoading: runtimesLoading,
    isValidating: runtimesRefreshing,
    mutate: refreshRuntimes,
  } = useSWR<ManagedAgent[]>(visible ? MANAGED_AGENTS_SWR_KEY : null, fetchManagedAgents);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | undefined>(undefined);
  const [tourPrompt, setTourPrompt] = useState(() =>
    t('team.onboarding.run.defaultPrompt', { defaultValue: DEFAULT_TOUR_PROMPT })
  );
  const [runningTour, setRunningTour] = useState(false);

  const assistantOptions = useMemo(
    () => filterTeamSupportedAssistants(presetAssistants.map((assistant) => assistantToOption(assistant, localeKey))),
    [presetAssistants, localeKey]
  );
  const usableAssistantOptions = useMemo(
    () => assistantOptions.filter((assistant) => assistant.team_capable !== false),
    [assistantOptions]
  );
  const runtimeRows = useMemo(
    () =>
      (runtimeAgents ?? []).filter(isUserConfiguredRuntime).toSorted((left, right) => {
        if (left.installed !== right.installed) return left.installed ? -1 : 1;
        if (left.status !== right.status) return left.status === 'online' ? -1 : 1;
        return left.name.localeCompare(right.name);
      }),
    [runtimeAgents]
  );
  const installedRuntimeCount = runtimeRows.filter((agent) => agent.installed).length;

  useEffect(() => {
    if (!visible) return;
    setCurrentStep(0);
    setTourPrompt(t('team.onboarding.run.defaultPrompt', { defaultValue: DEFAULT_TOUR_PROMPT }));
  }, [t, visible]);

  useEffect(() => {
    if (!visible || assistantOptions.length === 0) return;
    const preferredAssistantId =
      selectedAssistantId ?? readTeamOnboardingDefaultAssistantId(getTeamOnboardingBrowserStorage());
    setSelectedAssistantId(chooseTeamOnboardingAssistantId(assistantOptions, preferredAssistantId));
  }, [assistantOptions, selectedAssistantId, visible]);

  const saveDefaultAssistant = useCallback(() => {
    writeTeamOnboardingDefaultAssistantId(getTeamOnboardingBrowserStorage(), selectedAssistantId);
    Message.success(t('team.onboarding.default.saved', { defaultValue: 'Default agent saved' }));
  }, [selectedAssistantId, t]);

  const handleRunTour = useCallback(async () => {
    const input = tourPrompt.trim();
    if (!input) {
      Message.warning(t('team.onboarding.run.promptRequired', { defaultValue: 'Enter a tour prompt first' }));
      return;
    }
    if (selectedAssistantId) {
      writeTeamOnboardingDefaultAssistantId(getTeamOnboardingBrowserStorage(), selectedAssistantId);
    }
    setRunningTour(true);
    try {
      const ack = await ipcBridge.team.sendMessage.invoke({ team_id: teamId, input, files: [] });
      onTeamRunAck(ack);
      Message.success(t('team.onboarding.run.started', { defaultValue: 'Tour prompt sent to the team' }));
      onClose();
    } catch (error) {
      console.error('Failed to run team onboarding tour:', error);
      Message.error(t('team.onboarding.run.failed', { defaultValue: 'Failed to start the team tour' }));
    } finally {
      setRunningTour(false);
    }
  }, [onClose, onTeamRunAck, selectedAssistantId, t, teamId, tourPrompt]);

  const renderRuntimeStep = () => (
    <div className='flex flex-col gap-14px'>
      <div className='flex items-start justify-between gap-16px'>
        <div className='min-w-0'>
          <div className='text-16px font-600 text-t-primary'>
            {t('team.onboarding.runtime.title', { defaultValue: 'Available agent runtimes' })}
          </div>
          <div className='mt-4px text-12px leading-18px text-t-secondary'>
            {t('team.onboarding.runtime.description', {
              count: installedRuntimeCount,
              defaultValue:
                '{{count}} installed runtime(s) were found on this computer. Trace will use these to power assistants and team runs.',
            })}
          </div>
        </div>
        <Tooltip content={t('common.refresh', { defaultValue: 'Refresh' })}>
          <Button
            size='small'
            icon={<Refresh size='14' className={runtimesRefreshing ? 'animate-spin' : ''} />}
            loading={runtimesRefreshing && !runtimesLoading}
            onClick={() => void refreshRuntimes()}
            aria-label={t('common.refresh', { defaultValue: 'Refresh' })}
          />
        </Tooltip>
      </div>
      {runtimesLoading ? (
        <div className='flex min-h-180px items-center justify-center'>
          <Spin loading />
        </div>
      ) : runtimeRows.length === 0 ? (
        <Empty description={t('team.onboarding.runtime.empty', { defaultValue: 'No agent runtimes detected yet' })} />
      ) : (
        <div className='grid grid-cols-1 gap-8px md:grid-cols-2'>
          {runtimeRows.map((agent) => {
            const status = runtimeStatusView(agent, t);
            return (
              <div
                key={agent.id}
                className='min-w-0 rounded-8px border border-border-2 bg-fill-1 px-12px py-10px transition-colors hover:border-primary-3 hover:bg-fill-2'
                data-testid={`team-onboarding-runtime-${agent.id}`}
              >
                <div className='flex items-start justify-between gap-10px'>
                  <div className='min-w-0'>
                    <div className='truncate text-13px font-600 text-t-primary'>{agent.name}</div>
                    <div className='mt-3px flex flex-wrap items-center gap-6px'>
                      <Tag size='small' color={status.color}>
                        {status.label}
                      </Tag>
                      <Tag size='small'>{runtimeSourceLabel(agent, t)}</Tag>
                      {agent.team_capable === false ? (
                        <Tag size='small' color='gray'>
                          {t('team.onboarding.runtime.teamUnavailable', { defaultValue: 'No team mode' })}
                        </Tag>
                      ) : null}
                    </div>
                  </div>
                  <div className='mt-1px flex h-26px w-26px shrink-0 items-center justify-center rounded-6px bg-fill-2 text-t-tertiary'>
                    <Setting size='16' />
                  </div>
                </div>
                <div className='mt-8px truncate text-11px text-t-tertiary' title={formatRuntimeCommand(agent)}>
                  {formatRuntimeCommand(agent)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderDefaultStep = () => (
    <div className='flex flex-col gap-14px'>
      <div>
        <div className='text-16px font-600 text-t-primary'>
          {t('team.onboarding.default.title', { defaultValue: 'Choose your default team agent' })}
        </div>
        <div className='mt-4px text-12px leading-18px text-t-secondary'>
          {t('team.onboarding.default.description', {
            defaultValue:
              'This default is used to preselect the team leader when you create a new team from this setup flow.',
          })}
        </div>
      </div>
      {assistantsLoading ? (
        <div className='flex min-h-160px items-center justify-center'>
          <Spin loading />
        </div>
      ) : usableAssistantOptions.length === 0 ? (
        <Empty
          description={t('team.create.noSupportedAgents', { defaultValue: 'No supported assistants available' })}
        />
      ) : (
        <Radio.Group value={selectedAssistantId} onChange={(value) => setSelectedAssistantId(String(value))}>
          <div className='grid grid-cols-1 gap-10px'>
            {usableAssistantOptions.map((assistant) => {
              const assistantId = assistantKey(assistant);
              const selected = selectedAssistantId === assistantId;
              return (
                <Radio
                  key={assistantId}
                  value={assistantId}
                  className='!m-0 block'
                  data-testid={`team-onboarding-default-${assistantId}`}
                >
                  {({ checked }) => (
                    <div
                      className={`flex min-w-0 items-center justify-between gap-12px rounded-8px border px-14px py-12px transition-all ${selectedCardClass(
                        checked || selected
                      )}`}
                    >
                      <div className='min-w-0 flex-1'>
                        <AssistantOptionLabel assistant={assistant} />
                        <div className='mt-5px flex flex-wrap items-center gap-6px'>
                          <Tag size='small'>{assistant.backend || assistant.id}</Tag>
                        </div>
                      </div>
                      <div
                        className={`flex h-28px w-28px shrink-0 items-center justify-center rounded-8px ${
                          checked || selected ? 'bg-primary-6 text-color-white' : 'bg-fill-2 text-t-tertiary'
                        }`}
                      >
                        {checked || selected ? <Check size='16' /> : <Robot size='16' />}
                      </div>
                    </div>
                  )}
                </Radio>
              );
            })}
          </div>
        </Radio.Group>
      )}
    </div>
  );

  const renderRunStep = () => (
    <div className='flex flex-col gap-14px'>
      <div>
        <div className='text-16px font-600 text-t-primary'>
          {t('team.onboarding.run.title', { defaultValue: 'Run the team tour' })}
        </div>
        <div className='mt-4px text-12px leading-18px text-t-secondary'>
          {t('team.onboarding.run.description', {
            defaultValue:
              'Send a real prompt to this team. The leader can coordinate teammates or custom agents so you can see how the workflow behaves.',
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
            {t('team.onboarding.run.currentTeamLabel', { defaultValue: 'Current team will run this prompt' })}
          </span>
        </div>
        <div className='mt-4px'>
          {t('team.onboarding.run.defaultNote', {
            defaultValue:
              'Your default agent choice is saved for new teams; this run uses the leader already configured on the current team.',
          })}
        </div>
      </div>
    </div>
  );

  return (
    <AionModal
      visible={visible}
      onCancel={onClose}
      style={{ width: 760 }}
      autoFocus={false}
      unmountOnExit
      title={t('team.onboarding.title', { defaultValue: 'Team setup tour' })}
      footer={
        <div className='flex items-center justify-between gap-12px'>
          <Button
            disabled={currentStep === 0 || runningTour}
            onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
          >
            {t('team.onboarding.previous', { defaultValue: 'Previous' })}
          </Button>
          <div className='flex items-center gap-8px'>
            <Button onClick={onClose} disabled={runningTour}>
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Button>
            {currentStep < 2 ? (
              <Button
                type='primary'
                disabled={currentStep === 1 && !selectedAssistantId}
                onClick={() => {
                  if (currentStep === 1) saveDefaultAssistant();
                  setCurrentStep((step) => Math.min(2, step + 1));
                }}
              >
                {currentStep === 1
                  ? t('team.onboarding.default.saveAndContinue', { defaultValue: 'Save and continue' })
                  : t('team.onboarding.next', { defaultValue: 'Next' })}
              </Button>
            ) : (
              <Button
                type='primary'
                icon={<Play size='14' />}
                loading={runningTour}
                onClick={() => void handleRunTour()}
                data-testid='team-onboarding-run-tour'
              >
                {t('team.onboarding.run.action', { defaultValue: 'Run tour prompt' })}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className='flex flex-col gap-16px px-2px py-4px'>
        <AionSteps current={currentStep} size='small' type='dot'>
          <AionSteps.Step title={t('team.onboarding.steps.runtimes', { defaultValue: 'Runtimes' })} />
          <AionSteps.Step title={t('team.onboarding.steps.defaultAgent', { defaultValue: 'Default agent' })} />
          <AionSteps.Step title={t('team.onboarding.steps.runTour', { defaultValue: 'Run tour' })} />
        </AionSteps>
        <div className='max-h-[min(60vh,520px)] min-h-320px overflow-y-auto pr-4px'>
          {currentStep === 0 && renderRuntimeStep()}
          {currentStep === 1 && renderDefaultStep()}
          {currentStep === 2 && renderRunStep()}
        </div>
      </div>
    </AionModal>
  );
};

export default TeamOnboardingModal;
