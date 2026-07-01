export const releaseVersion = '2.1.30';
export const githubRepo = 'https://github.com/drewsephski/trace-ai';
export const drewGithubProfile = 'https://github.com/drewsephski';
export const releasePage = `${githubRepo}/releases`;
export const releaseBase = `${releasePage}/download/v${releaseVersion}`;
export const macDownloadHref = `${releaseBase}/Trace-${releaseVersion}-mac-arm64.dmg`;
export const downloadPageHref = '/download';

export const navLinks = [
  { name: 'Features', href: '/#features' },
  { name: 'Workflow', href: '/#how-it-works' },
  { name: 'Agents', href: '/#agents' },
  { name: 'Local-first', href: '/#local-first' },
  { name: 'Download', href: downloadPageHref },
] as const;

export const heroWords = ['run', 'review', 'extend', 'automate'] as const;

export const heroStats = [
  { value: 'Local-first', label: 'desktop runtime', detail: 'NO HOSTED SERVER REQUIRED' },
  { value: '8+', label: 'agent runtimes', detail: 'CLAUDE CODE, CODEX, GEMINI, MORE' },
  { value: 'MCP', label: 'shared tool layer', detail: 'CONNECT ONCE, REUSE EVERYWHERE' },
  { value: '3 OS', label: 'desktop builds', detail: 'MACOS / WINDOWS / LINUX' },
] as const;

export const featureItems = [
  {
    number: '01',
    title: 'Universal agent workspace',
    description:
      'Run Claude Code, Codex, OpenCode, Gemini, Qwen Code, Hermes Agent, Cursor Agent, and compatible ACP runtimes from one desktop interface.',
    visual: 'agents',
  },
  {
    number: '02',
    title: 'Local files and context',
    description:
      'Attach files, open project folders, preview generated work, and keep sessions tied to the real workspace on your machine.',
    visual: 'workspace',
  },
  {
    number: '03',
    title: 'Approval-gated actions',
    description:
      'Review file edits, shell commands, tool calls, and network-sensitive work before it runs. Approve, deny, or allow for the session.',
    visual: 'control',
  },
  {
    number: '04',
    title: 'Skills, MCP, and automation',
    description:
      'Reuse assistant skills, configure MCP servers, run scheduled tasks, and coordinate multi-agent team workflows without changing product surfaces.',
    visual: 'automation',
  },
] as const;

export const workflowSteps = [
  {
    number: 'I',
    title: 'Connect the agent runtimes you already use',
    description: 'Add provider keys or local endpoints, then pick the assistant or compatible agent for the job.',
    code: `agents:
  - Claude Code
  - Codex
  - OpenCode
  - Gemini
  - Custom ACP`,
  },
  {
    number: 'II',
    title: 'Give the session real project context',
    description:
      'Open a folder, attach files, and let Trace keep conversation history, tool output, and generated files in one visible workspace.',
    code: `workspace:
  root: ~/projects/app
  context:
    - src/
    - tests/
    - docs/
  approvals: required`,
  },
  {
    number: 'III',
    title: 'Approve work before it touches your machine',
    description:
      'Every meaningful edit or command is surfaced for review so the desktop app stays in control of agent work.',
    code: `approval:
  action: shell_command
  command: bun run test
  choices:
    - approve_once
    - allow_for_session
    - deny`,
  },
] as const;

export const localFirstLayers = [
  { name: 'Desktop app', role: 'Electron runtime for local sessions, files, tools, and approvals' },
  { name: 'Workspace files', role: 'Project context stays on disk unless you explicitly connect services' },
  { name: 'WebUI host', role: 'Optional local remote surface when you intentionally expose access' },
  { name: 'Channels', role: 'Slack, email, queues, and messaging integrations for review workflows' },
  { name: 'Releases', role: 'GitHub Releases publish installers and update metadata' },
  { name: 'Hosted companion', role: 'Optional landing, account, billing, and license surfaces' },
] as const;

export const capabilityMetrics = [
  { value: 8, suffix: '+', label: 'agent runtimes supported' },
  { value: 3, suffix: '', label: 'desktop operating systems' },
  { value: 4, suffix: '', label: 'approval paths for agent actions' },
  { value: 0, suffix: '', label: 'hosted servers required for core use' },
] as const;

export const integrationItems = [
  { name: 'Claude Code', category: 'Agent runtime' },
  { name: 'Codex', category: 'Agent runtime' },
  { name: 'OpenCode', category: 'Agent runtime' },
  { name: 'Gemini', category: 'Agent runtime' },
  { name: 'Qwen Code', category: 'Agent runtime' },
  { name: 'Hermes Agent', category: 'Agent runtime' },
  { name: 'Cursor Agent', category: 'Agent runtime' },
  { name: 'Custom ACP', category: 'Agent protocol' },
  { name: 'MCP servers', category: 'Shared tools' },
  { name: 'Skills', category: 'Reusable workflows' },
  { name: 'Team mode', category: 'Multi-agent coordination' },
  { name: 'Scheduled tasks', category: 'Automation' },
] as const;

export const controlFeatures = [
  {
    title: 'Local by default',
    description: 'Core sessions, workspace files, and app runtime stay on your machine.',
  },
  {
    title: 'Explicit approvals',
    description: 'Trace surfaces file edits, commands, and tool activity before agents proceed.',
  },
  {
    title: 'Portable tools',
    description: 'MCP servers and skills can be reused across supported agents instead of one vendor.',
  },
  {
    title: 'Intentional remote access',
    description: 'WebUI and messaging channels are opt-in surfaces for workflows that need them.',
  },
] as const;

export const controlPrinciples = [
  'Local-first',
  'Approval-gated',
  'Open source',
  'Cross-platform',
  'Agent-neutral',
] as const;

export const developerExamples = [
  {
    label: 'Install',
    code: `git clone ${githubRepo.replace('https://github.com/', 'git@github.com:')}.git
cd trace-ai
bun install`,
  },
  {
    label: 'Run',
    code: `bun run dev

# desktop app starts with Electron/Vite
# add provider keys in settings`,
  },
  {
    label: 'Verify',
    code: `bun run lint:fix
bun run format
bunx tsc --noEmit
bun run test`,
  },
] as const;

export const developerFeatures = [
  {
    title: 'Bun workspace',
    description: 'Desktop, WebUI host, CLI, scripts, and tests live in one repo.',
  },
  {
    title: 'Vitest coverage',
    description: 'Unit, integration, and e2e tests back desktop behavior.',
  },
  {
    title: 'Electron + React',
    description: 'A local desktop shell with typed renderer and process boundaries.',
  },
  {
    title: 'Open extension points',
    description: 'Skills, MCP, channels, and compatible agent runtimes stay pluggable.',
  },
] as const;

export const useCases = [
  {
    quote: 'Refactor a real repository with a coding agent while every file edit and shell command remains reviewable.',
    author: 'Codebase work',
    role: 'Local folders, attached files, generated previews',
    company: 'Workspace',
    metric: 'Project context stays visible',
  },
  {
    quote: 'Run several agent runtimes from the same desktop app instead of switching tools for every model or CLI.',
    author: 'Agent switching',
    role: 'Claude Code, Codex, OpenCode, Gemini, and ACP',
    company: 'Runtimes',
    metric: 'One interface for many agents',
  },
  {
    quote:
      'Schedule audits, maintenance passes, or recurring checks with the same approval rules as interactive sessions.',
    author: 'Automation',
    role: 'Recurring tasks and unattended workflows',
    company: 'Scheduler',
    metric: 'Repeatable work with controls',
  },
  {
    quote:
      'Route agent output to a local WebUI or messaging channel only when a workflow intentionally needs remote review.',
    author: 'Remote review',
    role: 'WebUI, channels, and queues',
    company: 'Optional access',
    metric: 'Desktop remains the source of control',
  },
] as const;

export const downloadOptions = [
  {
    name: 'Open source',
    description: 'Apache-2.0 desktop app with source, issues, discussions, and release history on GitHub.',
    price: 'Free',
    cadence: 'GitHub',
    features: ['Local-first core app', 'Source available', 'Community issue tracking', 'No account for core usage'],
    cta: 'View source',
    href: githubRepo,
    popular: false,
  },
  {
    name: 'Desktop release',
    description: 'Signed desktop builds for macOS, Windows, and Linux, distributed through GitHub Releases.',
    price: `v${releaseVersion}`,
    cadence: 'Release',
    features: [
      'macOS Apple Silicon and Intel',
      'Windows and Linux builds',
      'Installer/update metadata',
      'Release notes and assets',
    ],
    cta: 'Download Trace',
    href: downloadPageHref,
    popular: true,
  },
  {
    name: 'Hosted companion',
    description:
      'Optional web surface for landing pages, accounts, license checkout, or future hosted product features.',
    price: 'Optional',
    cadence: 'Web',
    features: [
      'Does not replace local core',
      'Useful for account features',
      'Can support license workflows',
      'Keeps remote access intentional',
    ],
    cta: 'See releases',
    href: releasePage,
    popular: false,
  },
] as const;

export const desktopDownloadGroups = [
  {
    platform: 'macOS',
    summary: 'DMG installers for Apple desktop machines.',
    options: [
      {
        name: 'Apple Silicon',
        detail: 'M1, M2, M3, M4, and newer Macs',
        arch: 'arm64',
        format: 'DMG',
        href: macDownloadHref,
      },
      {
        name: 'Intel Mac',
        detail: 'Older Intel-based Macs',
        arch: 'x64',
        format: 'DMG',
        href: `${releaseBase}/Trace-${releaseVersion}-mac-x64.dmg`,
      },
    ],
  },
  {
    platform: 'Windows',
    summary: 'NSIS installers for Windows desktops and workstations.',
    options: [
      {
        name: 'Windows x64',
        detail: 'Most Intel and AMD Windows PCs',
        arch: 'x64',
        format: 'EXE',
        href: `${releaseBase}/Trace-${releaseVersion}-win-x64.exe`,
      },
      {
        name: 'Windows ARM64',
        detail: 'ARM-based Windows devices',
        arch: 'arm64',
        format: 'EXE',
        href: `${releaseBase}/Trace-${releaseVersion}-win-arm64.exe`,
      },
    ],
  },
  {
    platform: 'Linux',
    summary: 'Debian packages for Linux desktops and servers.',
    options: [
      {
        name: 'Linux x64',
        detail: 'Debian, Ubuntu, and compatible x64 systems',
        arch: 'x64',
        format: 'DEB',
        href: `${releaseBase}/Trace-${releaseVersion}-linux-x64.deb`,
      },
      {
        name: 'Linux ARM64',
        detail: 'Debian, Ubuntu, and compatible ARM64 systems',
        arch: 'arm64',
        format: 'DEB',
        href: `${releaseBase}/Trace-${releaseVersion}-linux-arm64.deb`,
      },
    ],
  },
] as const;

export const footerLinks = {
  Product: [
    { name: 'Features', href: '/#features' },
    { name: 'Workflow', href: '/#how-it-works' },
    { name: 'Agents', href: '/#agents' },
    { name: 'Download', href: downloadPageHref },
  ],
  Developers: [
    { name: 'GitHub', href: githubRepo },
    { name: 'Releases', href: releasePage },
    { name: 'Development', href: `${githubRepo}#development` },
    { name: 'Issues', href: `${githubRepo}/issues` },
  ],
  Capabilities: [
    { name: 'MCP tools', href: '#agents' },
    { name: 'Skills', href: '#agents' },
    { name: 'Team mode', href: '#features' },
    { name: 'Scheduled automation', href: '#features' },
  ],
  Principles: [
    { name: 'Local-first', href: '#local-first' },
    { name: 'Approvals', href: '#security' },
    { name: 'Open source', href: githubRepo },
  ],
} as const;
