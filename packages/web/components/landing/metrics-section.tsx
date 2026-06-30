'use client';

import { useEffect, useState, useRef } from 'react';
import { capabilityMetrics } from '@/lib/landing-content';

function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
  return (
    <div className='text-6xl lg:text-8xl font-display tracking-tight'>
      {prefix}
      {end.toLocaleString()}
      {suffix}
    </div>
  );
}

export function MetricsSection() {
  const [time, setTime] = useState('Starting');
  const [isVisible, setIsVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <section id='capabilities' ref={sectionRef} className='relative py-24 lg:py-32 border-y border-foreground/10'>
      <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-24'>
          <div>
            <span className='inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6'>
              <span className='w-8 h-px bg-foreground/30' />
              Capability snapshot
            </span>
            <h2
              className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Built for real
              <br />
              agent work.
            </h2>
          </div>
          <div className='flex items-center gap-4 font-mono text-sm text-muted-foreground'>
            <span className='flex items-center gap-2'>
              <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
              Live
            </span>
            <span className='text-foreground/30'>|</span>
            <span>{time}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10'>
          {capabilityMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`bg-background p-8 lg:p-12 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <AnimatedCounter end={typeof metric.value === 'number' ? metric.value : 0} suffix={metric.suffix} />
              <div className='mt-4 text-lg text-muted-foreground'>{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
