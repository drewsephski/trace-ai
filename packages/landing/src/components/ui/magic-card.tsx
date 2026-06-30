import type { ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/utils';

type MagicCardProps = {
  children: ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
};

export function MagicCard({
  children,
  className,
  gradientSize = 190,
  gradientColor = 'rgba(255, 255, 255, 0.055)',
  gradientOpacity = 0.72,
  gradientFrom = 'rgba(245, 245, 245, 0.72)',
  gradientTo = 'rgba(148, 163, 184, 0.24)',
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);
  const smoothMouseX = useSpring(mouseX, { stiffness: 70, damping: 22, mass: 0.9 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 70, damping: 22, mass: 0.9 });

  return (
    <motion.article
      className={cn('magic-card group', className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX.set(event.clientX - rect.left);
        mouseY.set(event.clientY - rect.top);
      }}
      onPointerLeave={() => {
        mouseX.set(-gradientSize);
        mouseY.set(-gradientSize);
      }}
      style={{
        background: useMotionTemplate`
          linear-gradient(var(--bg-1), var(--bg-1)) padding-box,
          radial-gradient(${gradientSize}px circle at ${smoothMouseX}px ${smoothMouseY}px,
            ${gradientFrom},
            ${gradientTo},
            var(--line-2) 100%
          ) border-box
        `,
      }}
    >
      <motion.div
        aria-hidden='true'
        className='magic-card-glow'
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${smoothMouseX}px ${smoothMouseY}px,
              ${gradientColor},
              transparent 100%
            )
          `,
          opacity: gradientOpacity,
        }}
      />
      <div className='magic-card-content'>{children}</div>
    </motion.article>
  );
}
