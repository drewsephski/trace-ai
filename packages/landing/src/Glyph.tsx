import {
  IconArrowDown,
  IconBrandGithub,
  IconCalendarClock,
  IconChecklist,
  IconDeviceDesktopCode,
  IconFolderCode,
  IconGitBranch,
  IconRepeat,
  IconShieldCheck,
  IconUsersGroup,
  type Icon,
} from '@tabler/icons-react';

const glyphs = {
  'agent-console': IconDeviceDesktopCode,
  'folder-stack': IconFolderCode,
  'approval-stamp': IconChecklist,
  'workflow-clock': IconCalendarClock,
  'team-nodes': IconUsersGroup,
  'repeat-task': IconRepeat,
  'shield-check': IconShieldCheck,
  'project-board': IconGitBranch,
  'arrow-down': IconArrowDown,
  github: IconBrandGithub,
} satisfies Record<string, Icon>;

export type GlyphName = keyof typeof glyphs;

type GlyphProps = {
  name: GlyphName;
};

export function Glyph({ name }: GlyphProps) {
  const IconComponent = glyphs[name];

  return <IconComponent className='glyph' stroke={1.8} aria-hidden='true' />;
}
