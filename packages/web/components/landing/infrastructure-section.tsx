'use client';

import { useEffect, useState, useRef } from 'react';
import { localFirstLayers } from '@/lib/landing-content';

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(true);
  const [activeLocation, setActiveLocation] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLocation((prev) => (prev + 1) % localFirstLayers.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id='local-first' ref={sectionRef} className='relative py-24 lg:py-32 overflow-hidden'>
      <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
        <div className='grid lg:grid-cols-2 gap-16 lg:gap-24 items-center'>
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <span className='inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6'>
              <span className='w-8 h-px bg-foreground/30' />
              Local-first architecture
            </span>
            <h2 className='text-4xl lg:text-6xl font-display tracking-tight mb-8'>
              Your machine by
              <br />
              default.
            </h2>
            <p className='text-xl text-muted-foreground leading-relaxed mb-12'>
              Trace is a desktop app first. Hosted web surfaces, channels, and billing can exist around it, but core
              agent work does not require sending every project through a remote control plane.
            </p>

            {/* Stats */}
            <div className='grid grid-cols-3 gap-8'>
              <div>
                <div className='text-4xl lg:text-5xl font-display mb-2'>0</div>
                <div className='text-sm text-muted-foreground'>Required hosted servers</div>
              </div>
              <div>
                <div className='text-4xl lg:text-5xl font-display mb-2'>1</div>
                <div className='text-sm text-muted-foreground'>Desktop control surface</div>
              </div>
              <div>
                <div className='text-4xl lg:text-5xl font-display mb-2'>Opt-in</div>
                <div className='text-sm text-muted-foreground'>Remote access</div>
              </div>
            </div>
          </div>

          {/* Right: Location list */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className='border border-foreground/10'>
              {/* Header */}
              <div className='px-6 py-4 border-b border-foreground/10 flex items-center justify-between'>
                <span className='text-sm font-mono text-muted-foreground'>Trace layers</span>
                <span className='flex items-center gap-2 text-xs font-mono text-green-600'>
                  <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                  Local runtime active
                </span>
              </div>

              {/* Locations */}
              <div>
                {localFirstLayers.map((layer, index) => (
                  <div
                    key={layer.name}
                    className={`px-6 py-5 border-b border-foreground/5 last:border-b-0 flex items-center justify-between transition-all duration-300 ${
                      activeLocation === index ? 'bg-foreground/[0.02]' : ''
                    }`}
                  >
                    <div className='flex items-center gap-4'>
                      <span
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                          activeLocation === index ? 'bg-foreground' : 'bg-foreground/20'
                        }`}
                      />
                      <div>
                        <div className='font-medium'>{layer.name}</div>
                        <div className='text-sm text-muted-foreground'>{layer.role}</div>
                      </div>
                    </div>
                    <span className='font-mono text-sm text-muted-foreground'>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
