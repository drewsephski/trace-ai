'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { developerExamples, developerFeatures, githubRepo } from '@/lib/landing-content';

const codeAnimationStyles = `
  .dev-code-line {
    opacity: 0;
    transform: translateX(-8px);
    animation: devLineReveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  
  @keyframes devLineReveal {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .dev-code-char {
    opacity: 0;
    filter: blur(8px);
    animation: devCharReveal 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  
  @keyframes devCharReveal {
    to {
      opacity: 1;
      filter: blur(0);
    }
  }
`;

export function DevelopersSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(developerExamples[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id='developers' ref={sectionRef} className='relative overflow-hidden py-20 sm:py-24 lg:py-32'>
      <style dangerouslySetInnerHTML={{ __html: codeAnimationStyles }} />
      <div className='mx-auto w-full max-w-[1400px] min-w-0 px-4 sm:px-6 lg:px-12'>
        <div className='grid min-w-0 items-start gap-14 lg:grid-cols-2 lg:gap-24'>
          {/* Left: Content */}
          <div
            className={`min-w-0 max-w-full transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className='inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6'>
              <span className='w-8 h-px bg-foreground/30' />
              For contributors
            </span>
            <h2 className='mb-6 break-words font-display text-4xl tracking-tight sm:mb-8 lg:text-6xl'>
              Open source.
              <br />
              <span className='text-muted-foreground'>Built in the open.</span>
            </h2>
            <p className='mb-10 max-w-[62ch] break-words text-base leading-relaxed text-muted-foreground sm:mb-12 sm:text-xl'>
              Trace is a Bun workspace with Electron, React, Vitest, WebUI host packages, and release tooling in one
              repo. Clone it, run it locally, and inspect the same code that ships the desktop app.
            </p>

            {/* Features */}
            <div className='grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6'>
              {developerFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`min-w-0 max-w-full transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  <h3 className='mb-1 break-words font-medium [overflow-wrap:anywhere]'>{feature.title}</h3>
                  <p className='break-words text-sm text-muted-foreground [overflow-wrap:anywhere]'>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Code block */}
          <div
            className={`mx-auto w-full min-w-0 max-w-[34rem] transition-all delay-200 duration-700 lg:sticky lg:top-32 lg:max-w-full ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className='w-full min-w-0 max-w-full overflow-hidden border border-foreground/10'>
              {/* Tabs */}
              <div className='grid min-w-0 grid-cols-[repeat(3,minmax(0,1fr))_auto] items-center border-b border-foreground/10'>
                {developerExamples.map((example, idx) => (
                  <button
                    key={example.label}
                    type='button'
                    onClick={() => setActiveTab(idx)}
                    className={`relative min-w-0 px-2 py-3 text-center font-mono text-xs transition-colors sm:px-6 sm:py-4 sm:text-sm ${
                      activeTab === idx ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {example.label}
                    {activeTab === idx && <span className='absolute bottom-0 left-0 right-0 h-px bg-foreground' />}
                  </button>
                ))}
                <button
                  type='button'
                  onClick={handleCopy}
                  className='px-3 py-3 text-muted-foreground transition-colors hover:text-foreground sm:px-4 sm:py-4'
                  aria-label='Copy code'
                >
                  {copied ? <Check className='w-4 h-4 text-green-600' /> : <Copy className='w-4 h-4' />}
                </button>
              </div>

              {/* Code content */}
              <div className='min-h-[220px] min-w-0 bg-foreground/[0.01] p-4 font-mono text-[0.8rem] sm:p-8 sm:text-sm'>
                <pre className='m-0 max-w-full whitespace-pre-wrap break-words text-foreground/80 [overflow-wrap:anywhere]'>
                  {developerExamples[activeTab].code.split('\n').map((line, lineIndex) => (
                    <div
                      key={`${activeTab}-${lineIndex}`}
                      className='dev-code-line max-w-full break-words leading-relaxed [overflow-wrap:anywhere] sm:leading-loose'
                      style={{ animationDelay: `${lineIndex * 80}ms` }}
                    >
                      <span className='inline max-w-full break-words [overflow-wrap:anywhere]'>
                        {line.split('').map((char, charIndex) => (
                          <span
                            key={`${activeTab}-${lineIndex}-${charIndex}`}
                            className='dev-code-char [overflow-wrap:anywhere]'
                            style={{
                              animationDelay: `${lineIndex * 80 + charIndex * 15}ms`,
                            }}
                          >
                            {char}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            {/* Links */}
            <div className='mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm'>
              <a
                href={`${githubRepo}#development`}
                className='break-words text-foreground hover:underline underline-offset-4'
              >
                Development docs
              </a>
              <span className='text-foreground/20'>|</span>
              <a href={githubRepo} className='break-words text-muted-foreground hover:text-foreground'>
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
