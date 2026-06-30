import {
  agents,
  downloads,
  features,
  githubRepo,
  principles,
  releaseBase,
  releasePage,
  releaseVersion,
  steps,
} from './content';
import { Glyph } from './Glyph';
import { MacbookScroll } from './components/ui/macbook-scroll';
import { MagicCard } from './components/ui/magic-card';

const assetBase = import.meta.env.BASE_URL;
const wordmarkSrc = `${assetBase}trace-wordmark.svg`;
const interfacePreviewSrc = `${assetBase}trace-hero-screen.svg`;

export function App() {
  return (
    <main className='trace-root dark'>
      {/* NAV */}
      <header className='nav'>
        <a className='nav-brand' href='/' aria-label='Trace home'>
          <img src={wordmarkSrc} alt='Trace' className='brand-wordmark' />
        </a>
        <nav className='nav-links' aria-label='Primary navigation'>
          <a href='#features'>Features</a>
          <a href='#how-it-works'>How it works</a>
          <a href='#local-first'>Principles</a>
          <a href={githubRepo}>GitHub</a>
        </nav>
        <a className='nav-cta' href={`${releaseBase}/Trace-${releaseVersion}-mac-arm64.dmg`}>
          Download
        </a>
      </header>

      {/* HERO */}
      <section className='hero' aria-labelledby='hero-title'>
        <div className='hero-copy'>
          <div className='hero-badge'>
            <span className='badge-dot' />v{releaseVersion} &mdash; local-first, now stable
          </div>
          <h1 id='hero-title'>
            Run every coding agent
            <br />
            from one local workspace.
          </h1>
          <p className='hero-sub'>
            Trace is a desktop command center for AI coding agents. Connect Claude Code, Codex, OpenCode, and Gemini,
            review every approval before it touches your machine, and keep sessions, context, and outcomes traceable.
          </p>
          <div className='hero-actions'>
            <a className='btn-primary' href={`${releaseBase}/Trace-${releaseVersion}-mac-arm64.dmg`}>
              Download for Mac <Glyph name='arrow-down' />
            </a>
            <a className='btn-ghost' href={githubRepo}>
              <Glyph name='github' /> View on GitHub
            </a>
          </div>
          <p className='hero-footnote'>No account &middot; Local-first &middot; macOS / Windows / Linux</p>
        </div>
      </section>

      <div className='product-preview'>
        <MacbookScroll src={interfacePreviewSrc} title={null} showGradient={false} />
      </div>

      {/* AGENT STRIP — the one row-of-cards section */}
      <section className='agent-strip' aria-label='Supported agent runtimes'>
        <span className='agent-strip-label'>Connects to</span>
        <div className='agent-strip-row'>
          {agents.map((a) => (
            <div className='agent-pill' key={a.name}>
              <span className={`agent-dot agent-dot-${a.status}`} aria-hidden='true' />
              {a.name}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES — bento grid */}
      <section className='section features-section' id='features' aria-labelledby='features-title'>
        <div className='section-head'>
          <span className='section-label'>capabilities</span>
          <h2 id='features-title' className='section-title'>
            One workspace. Every agent. Full control.
          </h2>
        </div>
        <div className='bento-grid'>
          {features.map((f) => (
            <article className={`bento-card bento-${f.size}`} key={f.title}>
              <div className='bento-icon'>
                <Glyph name={f.glyph} />
              </div>
              <h3 className='bento-title'>{f.title}</h3>
              <p className='bento-body'>{f.body}</p>
              {f.meta ? <span className='bento-meta'>{f.meta}</span> : null}
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS — vertical stepped timeline, not cards */}
      <section className='section how-section' id='how-it-works' aria-labelledby='how-title'>
        <div className='section-head'>
          <span className='section-label'>workflow</span>
          <h2 id='how-title' className='section-title'>
            From a folder to finished, traceable work.
          </h2>
        </div>
        <ol className='timeline'>
          {steps.map((s) => (
            <li className='timeline-row' key={s.n}>
              <div className='timeline-marker'>
                <span className='timeline-n'>{s.n}</span>
                <span className='timeline-line' aria-hidden='true' />
              </div>
              <MagicCard className='timeline-card'>
                <h3 className='timeline-title'>{s.title}</h3>
                <p className='timeline-body'>{s.body}</p>
              </MagicCard>
            </li>
          ))}
        </ol>
      </section>

      {/* PRINCIPLES — divided editorial list, not cards */}
      <section className='section principles-section' id='local-first' aria-labelledby='principles-title'>
        <div className='section-head'>
          <span className='section-label'>local-first</span>
          <h2 id='principles-title' className='section-title'>
            Powerful agent workflows. The desktop stays in charge.
          </h2>
        </div>
        <div className='principle-list'>
          {principles.map((p, i) => (
            <article className='principle-row' key={p.title}>
              <span className='principle-index'>{String(i + 1).padStart(2, '0')}</span>
              <div className='principle-icon'>
                <Glyph name={p.glyph} />
              </div>
              <h3 className='principle-title'>{p.title}</h3>
              <p className='principle-body'>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* DOWNLOAD — symmetric 2x2 grid */}
      <section className='section download-section' id='download' aria-labelledby='download-title'>
        <div className='section-head'>
          <span className='section-label'>download</span>
          <h2 id='download-title' className='section-title'>
            Get Trace running on your machine.
          </h2>
        </div>
        <div className='download-grid'>
          {downloads.map((d) => (
            <a className={`download-card dl-${d.accent}`} href={`${releaseBase}/${d.file}`} key={d.file}>
              <div className='dl-top'>
                <span className='dl-os'>{d.name}</span>
                <span className='dl-ext'>{d.extension}</span>
              </div>
              <strong className='dl-machine'>{d.machine}</strong>
              <span className='dl-arrow'>
                <Glyph name='arrow-down' />
              </span>
            </a>
          ))}
        </div>
        <a className='release-link' href={releasePage}>
          Checksums, ZIP builds, ARM64 Windows, and release notes &rarr;
        </a>
      </section>

      {/* FOOTER */}
      <footer className='footer'>
        <a className='footer-brand' href='/'>
          <img src={wordmarkSrc} alt='Trace' className='brand-wordmark' />
        </a>
        <p className='footer-tagline'>Local-first AI agent workspace.</p>
        <nav className='footer-nav' aria-label='Footer navigation'>
          <a href='#download'>Download</a>
          <a href={releasePage}>Changelog</a>
          <a href={githubRepo}>GitHub</a>
        </nav>
        <span className='footer-domain'>trace.builders</span>
      </footer>
    </main>
  );
}
