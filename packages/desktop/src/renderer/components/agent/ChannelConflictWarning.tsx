/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Alert, Button, Link, Space, Typography } from '@arco-design/web-react';
import { IconExclamationCircle } from '@arco-design/web-react/icon';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph, Text } = Typography;

interface ChannelConflictWarningProps {
  platform: 'lark' | 'telegram';
  openclawConfigPath: string;
  onDisableOpenClaw?: () => void;
  onIgnore?: () => void;
}

/**
 * Warning component when OpenClaw channel conflicts with Trace Channels
 */
export const ChannelConflictWarning: React.FC<ChannelConflictWarningProps> = ({
  platform,
  openclawConfigPath,
  onDisableOpenClaw,
  onIgnore,
}) => {
  const { t } = useTranslation();
  const platformName = platform === 'lark' ? 'Lark/Feishu' : 'Telegram';
  const channelKey = platform === 'lark' ? 'feishu' : 'telegram';

  return (
    <Alert
      type='warning'
      icon={<IconExclamationCircle />}
      title={t('agent.channelConflict.title', { platform: platformName })}
      content={
        <Space direction='vertical' size='medium' style={{ width: '100%' }}>
          <Paragraph>
            <Text bold>{t('agent.channelConflict.handledByOpenClaw', { platform: platformName })}</Text>
          </Paragraph>

          <Paragraph>
            {t('agent.channelConflict.credentialsAlsoConfigured', { platform: platformName })}
            <ul>
              <li>
                <Text type='error'>{t('agent.channelConflict.switchingAgentsNoEffect')}</Text>
              </li>
              <li>
                <Text type='error'>{t('agent.channelConflict.messagesProcessedByOpenClaw')}</Text>
              </li>
              <li>
                <Text type='success'>{t('agent.channelConflict.messagesStillWork')}</Text>
              </li>
            </ul>
          </Paragraph>

          <Paragraph>
            <Text bold>{t('agent.channelConflict.useTraceChannels')}</Text>
          </Paragraph>

          <Paragraph>
            <Text type='secondary'>{t('agent.channelConflict.optionDisable', { platform: platformName })}</Text>
            <br />
            {t('agent.channelConflict.edit')}: <Text code>{openclawConfigPath}</Text>
            <br />
            {t('agent.channelConflict.set')}: <Text code>{`channels.${channelKey}.enabled = false`}</Text>
            <br />
            {t('agent.channelConflict.restart')}
          </Paragraph>

          <Paragraph>
            <Text type='secondary'>{t('agent.channelConflict.optionDifferentBot')}</Text>
            <br />
            {t('agent.channelConflict.createDifferentBot', { platform: platformName })}
          </Paragraph>

          <Paragraph>
            <Text type='secondary'>{t('agent.channelConflict.optionKeepUsingOpenClaw')}</Text>
            <br />
            {t('agent.channelConflict.disableChannel', { platform: platformName })}
          </Paragraph>

          <Space>
            {onDisableOpenClaw && (
              <Button type='primary' onClick={onDisableOpenClaw}>
                {t('agent.channelConflict.disableButton', { platform: platformName })}
              </Button>
            )}
            {onIgnore && (
              <Button type='text' onClick={onIgnore}>
                {t('agent.channelConflict.ignoreButton')}
              </Button>
            )}
          </Space>
        </Space>
      }
      closable={false}
      style={{ marginBottom: 16 }}
    />
  );
};

/**
 * Compact warning banner (for settings page)
 */
export const ChannelConflictBanner: React.FC<{ platform: 'lark' | 'telegram'; onLearnMore: () => void }> = ({
  platform,
  onLearnMore,
}) => {
  const { t } = useTranslation();
  const platformName = platform === 'lark' ? 'Lark/Feishu' : 'Telegram';

  return (
    <Alert
      type='warning'
      content={
        <Space>
          <Text>{t('agent.channelConflict.compact', { platform: platformName })}</Text>
          <Link onClick={onLearnMore}>{t('agent.channelConflict.learnMore')}</Link>
        </Space>
      }
      closable
      style={{ marginBottom: 12 }}
    />
  );
};
