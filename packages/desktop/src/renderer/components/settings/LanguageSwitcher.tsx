import AionSelect from '@/renderer/components/base/AionSelect';
import type { SelectHandle } from '@arco-design/web-react/es/Select/interface';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/renderer/services/i18n';
import { LAUNCH_SUPPORTED_LANGUAGES } from '@/common/config/i18n';

const LANGUAGE_LABELS: Record<string, string> = {
  'en-US': 'English',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
  'tr-TR': 'Türkçe',
  'ru-RU': 'Русский',
  'uk-UA': 'Українська',
  'pt-BR': 'Português (BR)',
  'de-DE': 'Deutsch',
};

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const selectRef = useRef<SelectHandle>(null);

  const handleLanguageChange = useCallback((value: string) => {
    // Blur before switching to avoid dropdown and language change fighting for layout
    selectRef.current?.blur?.();

    const applyLanguage = () => {
      changeLanguage(value).catch((error: Error) => {
        console.error('Failed to change language:', error);
      });
    };

    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      // Defer to the next frame so DOM animations finish.
      window.requestAnimationFrame(() => window.requestAnimationFrame(applyLanguage));
    } else {
      setTimeout(applyLanguage, 0);
    }
  }, []);

  return (
    <div className='flex items-center gap-8px'>
      <AionSelect ref={selectRef} className='w-160px' value={i18n.language} onChange={handleLanguageChange}>
        {LAUNCH_SUPPORTED_LANGUAGES.map((language) => (
          <AionSelect.Option key={language} value={language}>
            {LANGUAGE_LABELS[language] ?? language}
          </AionSelect.Option>
        ))}
      </AionSelect>
    </div>
  );
};

export default LanguageSwitcher;
