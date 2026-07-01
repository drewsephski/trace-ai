import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Download, ExternalLink, Github, MonitorDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FooterSection } from '@/components/landing/footer-section';
import { Navigation } from '@/components/landing/navigation';
import { desktopDownloadGroups, githubRepo, releasePage, releaseVersion } from '@/lib/landing-content';

export const metadata: Metadata = {
  title: 'Download Trace - Desktop builds',
  description: 'Download Trace desktop installers for macOS, Windows, and Linux from the latest GitHub release.',
};

export default function DownloadPage() {
  return (
    <main className='relative min-h-screen overflow-x-hidden noise-overlay'>
      <Navigation />

      <section className='relative pt-36 pb-20 lg:pt-44 lg:pb-28 border-b border-foreground/10'>
        <div className='max-w-[1200px] mx-auto px-6 lg:px-12'>
          <Button asChild variant='ghost' className='mb-10 -ml-3 text-muted-foreground hover:text-foreground'>
            <Link href='/'>
              <ArrowLeft className='w-4 h-4' />
              Back to overview
            </Link>
          </Button>

          <div className='grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-end'>
            <div>
              <span className='inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6'>
                <span className='w-8 h-px bg-foreground/30' />
                Trace v{releaseVersion}
              </span>
              <h1 className='font-display text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.92] mb-8'>
                Download Trace
                <span className='block text-muted-foreground'>for desktop.</span>
              </h1>
              <p className='text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl'>
                Pick the installer that matches your operating system and CPU architecture. Core Trace usage is
                local-first and does not require an account.
              </p>
            </div>

            <div className='border border-foreground/10 p-6 lg:p-8 bg-background/60 backdrop-blur-sm'>
              <div className='flex items-center gap-3 mb-4'>
                <MonitorDown className='w-5 h-5' />
                <h2 className='font-display text-2xl'>Release assets</h2>
              </div>
              <p className='text-sm text-muted-foreground leading-relaxed mb-6'>
                Downloads are served from GitHub Releases. Use the release page for checksums, previous versions, and
                full release notes.
              </p>
              <div className='flex flex-col sm:flex-row lg:flex-col gap-3'>
                <Button asChild className='bg-foreground text-background hover:bg-foreground/90 rounded-full'>
                  <a href={releasePage}>
                    Release notes
                    <ExternalLink className='w-4 h-4' />
                  </a>
                </Button>
                <Button asChild variant='outline' className='rounded-full border-foreground/20 hover:bg-foreground/5'>
                  <a href={githubRepo}>
                    <Github className='w-4 h-4' />
                    Source code
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='py-20 lg:py-28'>
        <div className='max-w-[1200px] mx-auto px-6 lg:px-12'>
          <div className='grid gap-6 lg:gap-8'>
            {desktopDownloadGroups.map((group) => (
              <section key={group.platform} className='border border-foreground/10 bg-background'>
                <div className='grid lg:grid-cols-[320px_1fr]'>
                  <div className='p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-foreground/10'>
                    <span className='font-mono text-xs uppercase tracking-widest text-muted-foreground'>Desktop</span>
                    <h2 className='font-display text-4xl mt-3 mb-4'>{group.platform}</h2>
                    <p className='text-sm text-muted-foreground leading-relaxed'>{group.summary}</p>
                  </div>

                  <div className='grid md:grid-cols-2 gap-px bg-foreground/10'>
                    {group.options.map((option) => (
                      <article key={option.href} className='bg-background p-6 lg:p-8 flex flex-col min-h-[240px]'>
                        <div className='flex items-start justify-between gap-4 mb-8'>
                          <div>
                            <h3 className='font-display text-3xl mb-2'>{option.name}</h3>
                            <p className='text-sm text-muted-foreground leading-relaxed'>{option.detail}</p>
                          </div>
                          <span className='font-mono text-xs uppercase tracking-widest border border-foreground/15 px-2 py-1 text-muted-foreground'>
                            {option.format}
                          </span>
                        </div>

                        <dl className='grid grid-cols-2 gap-4 text-sm mb-8'>
                          <div>
                            <dt className='font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1'>
                              Arch
                            </dt>
                            <dd>{option.arch}</dd>
                          </div>
                          <div>
                            <dt className='font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1'>
                              Version
                            </dt>
                            <dd>v{releaseVersion}</dd>
                          </div>
                        </dl>

                        <Button
                          asChild
                          className='mt-auto bg-foreground text-background hover:bg-foreground/90 rounded-full'
                        >
                          <a href={option.href} aria-label={`Download Trace ${option.name} ${option.format}`}>
                            <Download className='w-4 h-4' />
                            Download {option.name}
                          </a>
                        </Button>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
