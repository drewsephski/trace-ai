import type { CSSProperties, ReactNode } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ---------------------------------------------------------------------------
// Design tokens
// One dark surface, one accent (Trace green), Product Hunt orange reserved
// for the CTA only. No gradients, no glow orbs, no multi-tone system.
// ---------------------------------------------------------------------------
const palette = {
  bg: '#0a0b0a',
  panel: '#141715',
  line: 'rgba(247, 245, 236, 0.12)',
  ink: '#f7f5ec',
  ash: '#b9bfb7',
  dim: '#7a847d',
  accent: '#6effa0',
  ph: '#ff6154',
} as const;

const font = '"Arial Narrow", "Avenir Next Condensed", "Helvetica Neue", Arial, sans-serif';
const bodyFont = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

const ease = Easing.bezier(0.16, 1, 0.3, 1);

// ---------------------------------------------------------------------------
// Assets — only real product artifacts. All gif/mp4 workflow galleries,
// synthetic dashboards and floating-chip constellations were removed.
// ---------------------------------------------------------------------------
const assets = {
  launch: 'assets/generated/product-hunt-launch.png',
  workspace: 'assets/screenshots/trace-readme-agents.png',
  agents: 'assets/screenshots/trace-readme-hero.png',
  localFirst: 'assets/screenshots/trace-readme-local-first.png',
  logo: 'assets/brand/trace-logo.png',
  wordmark: 'assets/brand/trace-wordmark.svg',
} as const;

// ---------------------------------------------------------------------------
// Scene timeline — 6 scenes, no overlapping transitions, no flash effects.
// Each scene fades itself in/out at its own edges.
// ---------------------------------------------------------------------------
type SceneKey = 'hook' | 'problem' | 'solution' | 'proof' | 'control' | 'cta';

type SceneWindow = { key: SceneKey; from: number; duration: number };

const scenes: Record<SceneKey, SceneWindow> = {
  hook: { key: 'hook', from: 0, duration: 150 },
  problem: { key: 'problem', from: 150, duration: 150 },
  solution: { key: 'solution', from: 300, duration: 210 },
  proof: { key: 'proof', from: 510, duration: 210 },
  control: { key: 'control', from: 720, duration: 210 },
  cta: { key: 'cta', from: 930, duration: 210 },
};

export const PRODUCT_HUNT_DURATION_IN_FRAMES = Math.max(
  ...Object.values(scenes).map((scene) => scene.from + scene.duration)
);

export const ProductHuntLaunch = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill style={styles.stage}>
      <Backdrop />

      <SceneSequence scene={scenes.hook}>
        <HookScene />
      </SceneSequence>
      <SceneSequence scene={scenes.problem}>
        <ProblemScene />
      </SceneSequence>
      <SceneSequence scene={scenes.solution}>
        <SolutionScene />
      </SceneSequence>
      <SceneSequence scene={scenes.proof}>
        <ProofScene />
      </SceneSequence>
      <SceneSequence scene={scenes.control}>
        <ControlScene />
      </SceneSequence>
      <SceneSequence scene={scenes.cta} isFinal>
        <CtaScene />
      </SceneSequence>

      <Wordmark frame={frame} />
      <ProgressBar progress={progress} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 1 — Hook
// ---------------------------------------------------------------------------
const HookScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = reveal(frame, 0.2 * fps, 0.7 * fps);
  const sub = reveal(frame, 0.65 * fps, 0.6 * fps);

  return (
    <SceneFrame fadeOutStart={4.4}>
      <div style={styles.centerColumn}>
        <div style={{ opacity: title, transform: `translateY(${(1 - title) * 30}px)` }}>
          <h1 style={styles.display}>Run coding agents from your own desktop.</h1>
        </div>
        <p style={{ ...styles.deck, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>
          Not a cloud tool. Your machine stays in control.
        </p>
      </div>
    </SceneFrame>
  );
};

// ---------------------------------------------------------------------------
// Scene 2 — Problem (typographic only, no icons/mockups)
// ---------------------------------------------------------------------------
const problemWords = ['Agents.', 'Tools.', 'Files.', 'Docs.', 'Approvals.'];

const ProblemScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineIn = reveal(frame, 2.6 * fps, 0.6 * fps);

  return (
    <SceneFrame fadeOutStart={4.4}>
      <div style={styles.centerColumn}>
        <div style={styles.wordRow}>
          {problemWords.map((word, index) => {
            const start = index * 0.24 * fps;
            const wordIn = reveal(frame, start, 0.4 * fps);
            return (
              <span
                key={word}
                style={{
                  ...styles.wordChip,
                  opacity: 0.35 + wordIn * 0.65,
                  transform: `translateY(${(1 - wordIn) * 16}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
        <p style={{ ...styles.deck, opacity: lineIn, transform: `translateY(${(1 - lineIn) * 16}px)` }}>
          Scattered across a dozen tabs and terminals.
        </p>
      </div>
    </SceneFrame>
  );
};

// ---------------------------------------------------------------------------
// Scene 3 — Solution (the real workspace, framed simply)
// ---------------------------------------------------------------------------
const SolutionScene = () => (
  <SceneFrame fadeOutStart={6.2}>
    <SplitLayout
      eyebrow='One workspace'
      title='Everything lives in one place.'
      body='Conversations, files, tools, and approvals — together, on your machine.'
    >
      <ScreenshotFrame src={assets.workspace} alt='Trace workspace' />
    </SplitLayout>
  </SceneFrame>
);

// ---------------------------------------------------------------------------
// Scene 4 — Proof (real agent-runtime picker + two hard numbers)
// ---------------------------------------------------------------------------
const ProofScene = () => (
  <SceneFrame fadeOutStart={6.2}>
    <SplitLayout
      eyebrow='Every agent runtime'
      title='Claude Code. Codex. Gemini. OpenCode. And more.'
      body='Switch runtimes without changing your workflow.'
    >
      <ScreenshotFrame src={assets.agents} alt='Agent runtime picker' />
    </SplitLayout>
    <StatRow
      stats={[
        ['8+', 'agent runtimes'],
        ['0', 'hosted servers required'],
      ]}
    />
  </SceneFrame>
);

// ---------------------------------------------------------------------------
// Scene 5 — Control (approval-gated actions, using the product's own language)
// ---------------------------------------------------------------------------
const controlPoints = [
  ['Local by default', 'Core sessions and file access never leave your machine.'],
  ['Explicit approvals', 'File edits, shell commands, and tool calls wait for your review.'],
  ['Intentional remote access', 'Web and mobile review is opt-in, never the default.'],
];

const ControlScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneFrame fadeOutStart={6.2}>
      <div style={styles.controlLayout}>
        <div style={styles.controlHeader}>
          <Eyebrow>Agents propose. You approve.</Eyebrow>
          <h2 style={styles.sectionTitle}>Every risky action, reviewed first.</h2>
        </div>
        <div style={styles.controlList}>
          {controlPoints.map(([title, body], index) => {
            const inFrame = reveal(frame, 0.3 * fps + index * 0.35 * fps, 0.5 * fps);
            return (
              <div
                key={title}
                style={{
                  ...styles.controlRow,
                  opacity: inFrame,
                  transform: `translateX(${(1 - inFrame) * 28}px)`,
                }}
              >
                <span style={styles.controlBadge}>Review</span>
                <div>
                  <div style={styles.controlTitle}>{title}</div>
                  <div style={styles.controlBody}>{body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SceneFrame>
  );
};

// ---------------------------------------------------------------------------
// Scene 6 — CTA (doubles as the Product Hunt thumbnail)
// ---------------------------------------------------------------------------
const CtaScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = 1 + spring({ frame, fps, config: { damping: 16, stiffness: 90, mass: 0.6 } }) * 0.03;
  const enter = reveal(frame, 0.15 * fps, 0.6 * fps);

  return (
    <SceneFrame fadeInEnd={0.4}>
      <Img src={staticFile(assets.launch)} alt='' style={styles.ctaBackdrop} />
      <AbsoluteFill style={styles.ctaScrim} />
      <div style={{ ...styles.ctaPanel, opacity: enter, transform: `translateY(${(1 - enter) * 24}px)` }}>
        <Img src={staticFile(assets.logo)} alt='Trace' style={styles.ctaLogo} />
        <h2 style={styles.ctaTitle}>Trace is live on Product Hunt.</h2>
        <p style={styles.ctaBody}>The local-first workspace for AI coding agents.</p>
        <div style={{ ...styles.phButton, transform: `scale(${pulse})` }}>
          <span style={styles.phMark}>▲</span>
          Upvote on Product Hunt
        </div>
      </div>
    </SceneFrame>
  );
};

// ---------------------------------------------------------------------------
// Shared structural components
// ---------------------------------------------------------------------------
const SceneSequence = ({
  scene,
  children,
  isFinal = false,
}: {
  scene: SceneWindow;
  children: ReactNode;
  isFinal?: boolean;
}) => (
  <Sequence from={scene.from} durationInFrames={scene.duration} premountFor={30} name={scene.key}>
    {children}
    {isFinal ? null : null}
  </Sequence>
);

const SceneFrame = ({
  children,
  fadeInEnd = 0.45,
  fadeOutStart,
}: {
  children: ReactNode;
  fadeInEnd?: number;
  fadeOutStart?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const fadeIn = reveal(frame, 0, fadeInEnd * fps);
  const fadeOut =
    fadeOutStart === undefined
      ? 1
      : interpolate(frame, [fadeOutStart * fps, durationInFrames], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.in(Easing.cubic),
        });

  return <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>{children}</AbsoluteFill>;
};

const SplitLayout = ({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
}) => {
  const frame = useCurrentFrame();
  const enter = reveal(frame, 6, 30);

  return (
    <div style={styles.splitLayout}>
      <div style={{ opacity: enter, transform: `translateY(${(1 - enter) * 24}px)` }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <p style={styles.sectionBody}>{body}</p>
      </div>
      <div style={{ opacity: enter, transform: `translateX(${(1 - enter) * 40}px)` }}>{children}</div>
    </div>
  );
};

const ScreenshotFrame = ({ src, alt }: { src: string; alt: string }) => (
  <div style={styles.screenshotShell}>
    <div style={styles.screenshotToolbar}>
      <span style={styles.dot} />
      <span style={styles.dot} />
      <span style={styles.dot} />
    </div>
    <Img src={staticFile(src)} alt={alt} style={styles.screenshotImage} />
  </div>
);

const StatRow = ({ stats }: { stats: [string, string][] }) => (
  <div style={styles.statRow}>
    {stats.map(([value, label]) => (
      <div key={label} style={styles.statItem}>
        <span style={styles.statValue}>{value}</span>
        <span style={styles.statLabel}>{label}</span>
      </div>
    ))}
  </div>
);

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div style={styles.eyebrow}>
    <span style={styles.eyebrowMark} />
    {children}
  </div>
);

const Backdrop = () => <AbsoluteFill style={{ backgroundColor: palette.bg }} />;

const Wordmark = ({ frame }: { frame: number }) => {
  const opacity = frame < scenes.cta.from ? 1 : 0;
  return (
    <div style={{ ...styles.wordmarkChrome, opacity }}>
      <Img src={staticFile(assets.logo)} alt='Trace' style={styles.chromeLogo} />
      <Img src={staticFile(assets.wordmark)} alt='Trace' style={styles.chromeWordmark} />
    </div>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => (
  <div style={styles.progressTrack}>
    <div style={{ ...styles.progressFill, width: `${progress * 100}%` }} />
  </div>
);

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
const reveal = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = {
  stage: {
    overflow: 'hidden',
    backgroundColor: palette.bg,
    color: palette.ink,
    fontFamily: bodyFont,
  },
  centerColumn: {
    position: 'absolute',
    left: 120,
    right: 120,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  display: {
    margin: 0,
    maxWidth: 1120,
    fontFamily: font,
    fontSize: 96,
    lineHeight: 0.96,
    fontWeight: 800,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  deck: {
    margin: '30px 0 0',
    maxWidth: 760,
    color: palette.ash,
    fontSize: 30,
    lineHeight: 1.3,
    fontWeight: 500,
  },
  wordRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 20,
    maxWidth: 1000,
  },
  wordChip: {
    fontFamily: font,
    fontSize: 76,
    lineHeight: 1,
    fontWeight: 800,
    textTransform: 'uppercase',
    color: palette.ink,
  },
  splitLayout: {
    position: 'absolute',
    inset: '150px 96px 100px',
    display: 'grid',
    gridTemplateColumns: '0.82fr 1.18fr',
    gap: 64,
    alignItems: 'center',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22,
    color: palette.accent,
    fontSize: 20,
    fontWeight: 750,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  eyebrowMark: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: palette.accent,
  },
  sectionTitle: {
    margin: 0,
    maxWidth: 620,
    fontFamily: font,
    fontSize: 62,
    lineHeight: 0.98,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  sectionBody: {
    margin: '24px 0 0',
    maxWidth: 520,
    color: palette.ash,
    fontSize: 24,
    lineHeight: 1.35,
    fontWeight: 500,
  },
  screenshotShell: {
    border: `1px solid ${palette.line}`,
    borderRadius: 16,
    background: palette.panel,
    overflow: 'hidden',
    boxShadow: '0 40px 120px rgba(0,0,0,0.5)',
  },
  screenshotToolbar: {
    display: 'flex',
    gap: 8,
    padding: '14px 16px',
    borderBottom: `1px solid ${palette.line}`,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: 'rgba(247,245,236,0.18)',
  },
  screenshotImage: {
    display: 'block',
    width: '100%',
    height: 560,
    objectFit: 'cover',
    objectPosition: 'top',
  },
  statRow: {
    position: 'absolute',
    left: 96,
    bottom: 72,
    display: 'flex',
    gap: 64,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statValue: {
    fontFamily: font,
    fontSize: 52,
    fontWeight: 800,
    color: palette.accent,
  },
  statLabel: {
    fontSize: 18,
    color: palette.dim,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  controlLayout: {
    position: 'absolute',
    inset: '150px 120px 120px',
  },
  controlHeader: {
    maxWidth: 900,
  },
  controlList: {
    display: 'grid',
    gap: 16,
    marginTop: 52,
    maxWidth: 980,
  },
  controlRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 22,
    padding: '24px 26px',
    border: `1px solid ${palette.line}`,
    borderRadius: 18,
    background: palette.panel,
  },
  controlBadge: {
    flexShrink: 0,
    padding: '8px 12px',
    borderRadius: 10,
    background: 'rgba(110, 255, 160, 0.14)',
    color: palette.accent,
    fontSize: 14,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  controlTitle: {
    fontSize: 26,
    fontWeight: 750,
    color: palette.ink,
  },
  controlBody: {
    marginTop: 6,
    fontSize: 18,
    color: palette.dim,
    fontWeight: 500,
    lineHeight: 1.3,
  },
  ctaBackdrop: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  ctaScrim: {
    background: 'linear-gradient(180deg, rgba(10,11,10,0.55), rgba(10,11,10,0.92) 65%)',
  },
  ctaPanel: {
    position: 'absolute',
    left: 120,
    bottom: 120,
    maxWidth: 1000,
  },
  ctaLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 30,
  },
  ctaTitle: {
    margin: 0,
    fontFamily: font,
    fontSize: 78,
    lineHeight: 0.98,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  ctaBody: {
    margin: '24px 0 0',
    fontSize: 28,
    color: palette.ash,
    fontWeight: 500,
  },
  phButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 14,
    marginTop: 40,
    padding: '20px 30px',
    borderRadius: 999,
    background: palette.ph,
    color: '#1a0805',
    fontSize: 26,
    fontWeight: 800,
  },
  phMark: {
    fontSize: 20,
  },
  wordmarkChrome: {
    position: 'absolute',
    left: 56,
    top: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  chromeLogo: {
    width: 40,
    height: 40,
    borderRadius: 11,
  },
  chromeWordmark: {
    width: 110,
    height: 'auto',
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 5,
    background: 'rgba(247,245,236,0.1)',
  },
  progressFill: {
    height: '100%',
    background: palette.accent,
  },
} satisfies Record<string, CSSProperties>;
