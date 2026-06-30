import { useThemeContext } from '@/renderer/hooks/context/ThemeContext';

export const useInputFocusRing = () => {
  const { theme } = useThemeContext();
  const isDarkTheme = theme === 'dark';

  return {
    activeBorderColor: isDarkTheme ? 'var(--bg-5)' : 'var(--bg-4)',
    inactiveBorderColor: isDarkTheme ? 'var(--border-base)' : 'var(--bg-4)',
    activeShadow: isDarkTheme
      ? '0 10px 28px color-mix(in srgb, var(--bg-base) 55%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-text-1) 10%, transparent)'
      : '0 10px 28px color-mix(in srgb, var(--bg-10) 10%, transparent), 0 0 0 1px color-mix(in srgb, var(--bg-4) 70%, transparent)',
  };
};
