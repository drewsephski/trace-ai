export const releaseVersion = '2.1.27';
export const githubRepo = 'https://github.com/drewsephski/trace-ai';
export const releaseBase = `${githubRepo}/releases/download/v${releaseVersion}`;
export const releasePage = `${githubRepo}/releases`;

export const agents = [
  { name: 'Claude Code', status: 'connected' as const },
  { name: 'Codex', status: 'connected' as const },
  { name: 'OpenCode', status: 'connected' as const },
  { name: 'Gemini', status: 'connected' as const },
  { name: 'Custom ACP', status: 'idle' as const },
];

export type BentoSize = 'lg' | 'sm';

export const features: Array<{
  glyph: import('./Glyph').GlyphName;
  title: string;
  body: string;
  size: BentoSize;
  meta?: string;
}> = [
  {
    glyph: 'agent-console',
    title: 'Universal ACP client',
    body: 'Connect Claude Code, Codex, OpenCode, Gemini, and any agent that speaks the Agent Client Protocol from one workspace.',
    size: 'lg',
    meta: '4 agents connected',
  },
  {
    glyph: 'folder-stack',
    title: 'Local-first workspace',
    body: 'Sessions, context, and files live on your machine by default. Nothing leaves unless you decide it should.',
    size: 'sm',
  },
  {
    glyph: 'approval-stamp',
    title: 'Approval workflow',
    body: 'Review every file edit and shell command before it runs. Approve once, allow for the session, or deny.',
    size: 'sm',
  },
  {
    glyph: 'workflow-clock',
    title: 'MCP tools and skills',
    body: 'Extend any agent with shared tools and reusable skills, scoped per workspace.',
    size: 'sm',
  },
  {
    glyph: 'team-nodes',
    title: 'Multi-channel messaging',
    body: 'Route agent output to Slack, email, or a local queue so review happens where your team already works.',
    size: 'sm',
  },
  {
    glyph: 'repeat-task',
    title: 'Scheduled automation',
    body: 'Run recurring checks, audits, or maintenance passes on a schedule, with the same approval rules applied every time.',
    size: 'lg',
    meta: 'Runs while you sleep',
  },
];

export const steps = [
  {
    n: '01',
    title: 'Connect your agents',
    body: 'Point Trace at the agent runtimes you already use. No new accounts, no migration.',
  },
  {
    n: '02',
    title: 'Start a session',
    body: 'Open a folder or attach files, then describe the outcome you want in plain language.',
  },
  {
    n: '03',
    title: 'Review approvals',
    body: 'Every edit, command, or tool call surfaces before it touches your machine. You decide what proceeds.',
  },
  {
    n: '04',
    title: 'Keep a traceable workspace',
    body: 'Sessions, context, and outcomes stay logged and searchable, so any change can be traced back to its source.',
  },
];

export const principles = [
  {
    glyph: 'shield-check' as const,
    title: 'Local by default',
    body: 'Your code, context, and conversations stay on your machine unless you explicitly choose otherwise.',
  },
  {
    glyph: 'approval-stamp' as const,
    title: 'Explicit approval',
    body: 'Agents propose. You dispose. Nothing touches a file, a shell, or a network call without your sign-off.',
  },
  {
    glyph: 'project-board' as const,
    title: 'Portable agent workflows',
    body: 'Skills, tools, and sessions are not locked to one vendor. Swap the underlying agent without losing your setup.',
  },
];

export const downloads = [
  { name: 'macOS', machine: 'Apple Silicon', extension: '.dmg', file: `Trace-${releaseVersion}-mac-arm64.dmg`, accent: 'green' as const },
  { name: 'macOS', machine: 'Intel', extension: '.dmg', file: `Trace-${releaseVersion}-mac-x64.dmg`, accent: 'cyan' as const },
  { name: 'Windows', machine: 'x64', extension: '.exe', file: `Trace-${releaseVersion}-win-x64.exe`, accent: 'amber' as const },
  { name: 'Linux', machine: 'x64', extension: '.AppImage', file: `Trace-${releaseVersion}-linux-x64.AppImage`, accent: 'green' as const },
];
