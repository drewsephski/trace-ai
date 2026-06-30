# Internationalization (i18n)

Trace uses i18next and react-i18next for desktop UI localization.

## Source Of Truth

`packages/desktop/src/common/config/i18n-config.json` is the source of truth for:

- `referenceLanguage`: the locale used to generate typed keys.
- `fallbackLanguage`: the locale used when a requested language is unsupported.
- `supportedLanguages`: locales loaded by the desktop runtime.
- `launchSupportedLanguages`: locales presented as public-launch supported.
- `translationBacklogLanguages`: locale folders that may exist in the repo but are not launch-supported.

Current launch-supported locales:

- English (`en-US`)
- Japanese (`ja-JP`)
- Korean (`ko-KR`)
- Turkish (`tr-TR`)
- Russian (`ru-RU`)
- Ukrainian (`uk-UA`)
- Brazilian Portuguese (`pt-BR`)
- German (`de-DE`)

Known locale backlog:

- Simplified Chinese (`zh-CN`)
- Traditional Chinese (`zh-TW`)

The Chinese locale folders are retained as historical translation work, but they are intentionally excluded from
`supportedLanguages` and `launchSupportedLanguages`. Requests for `zh`, `zh-CN`, or `zh-TW` currently fall back to
`en-US` until those translations are brought back to parity and wired into the runtime imports.

## File Structure

```
packages/desktop/src/common/config/i18n-config.json
packages/desktop/src/common/config/i18n.ts
packages/desktop/src/renderer/services/i18n/
├── index.ts
├── i18n-keys.d.ts
└── locales/
    ├── en-US/
    │   ├── common.json
    │   ├── conversation.json
    │   └── ...
    └── ...
```

## Usage

### Components

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('common.description')}</p>
    </div>
  );
};
```

### Language Switching

```tsx
import { changeLanguage } from '@/renderer/services/i18n';

const switchToGerman = () => {
  void changeLanguage('de-DE');
};
```

## Adding Or Restoring A Locale

1. Read `packages/desktop/src/common/config/i18n-config.json`.
2. Add or restore every module listed in `modules` for the locale.
3. Add static imports in both renderer and main-process i18n entry points.
4. Add the locale to `supportedLanguages` only when it is ready to ship.
5. Add the locale to `launchSupportedLanguages` only when it is part of the public support commitment.
6. Remove it from `translationBacklogLanguages` when it is no longer a known gap.
7. Run `bun run i18n:types`, then `node scripts/check-i18n.js`.

## Key Naming

- Use camelCase for keys.
- Group related keys inside the feature module.
- Put reusable labels and actions in `common.json`.
- Do not add user-visible hardcoded strings in renderer code.

Example:

```json
{
  "send": "Send",
  "conversation": {
    "welcomeTitle": "What are you working on?"
  }
}
```
