import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import { useState } from 'react';
import { POINTS_PER_CORRECT } from '@/lib/progressStorage';

const PARTICLE_COLORS = ['bg-sky-300', 'bg-violet-300', 'bg-teal-300', 'bg-white', 'bg-sky-400'];
const PARTICLE_COUNT = 18;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, id) => {
    const angle = (Math.PI * 2 * id) / PARTICLE_COUNT + Math.random() * 0.4;
    const distance = 110 + Math.random() * 90;
    return {
      id,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 4 + Math.round(Math.random() * 4),
      color: PARTICLE_COLORS[id % PARTICLE_COLORS.length],
      duration: 0.8 + Math.random() * 0.4,
    };
  });
}

export function CelebrationBurst() {
  const [particles] = useState(createParticles);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className={`absolute rounded-full ${particle.color} shadow-[0_0_10px_currentColor]`}
          style={{ width: particle.size, height: particle.size }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.3 }}
          animate={{ x: particle.x, y: particle.y, opacity: 0, scale: 1 }}
          transition={{ duration: particle.duration, ease: 'easeOut' }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 10 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.08, 1, 1], y: [10, 0, 0, -6] }}
        transition={{ duration: 1.8, times: [0, 0.2, 0.75, 1], ease: 'easeOut' }}
        className="flex flex-col items-center gap-2"
      >
        <span className="rounded-full border border-success/40 bg-canvas/80 px-5 py-2 text-lg font-semibold text-success shadow-[0_0_30px_-6px_rgba(110,231,183,0.8)] backdrop-blur-md">
          Чудово!
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-canvas/80 px-3 py-1 text-sm font-semibold text-violet-200 backdrop-blur-md">
          <Flame className="h-3.5 w-3.5 text-violet-300" />
          +{POINTS_PER_CORRECT} XP
        </span>
      </motion.div>
    </div>
  );
}
