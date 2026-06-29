import { useMemo, type CSSProperties } from 'react';
import './FallingLeaves.css';

/** Animal-crossing-ish greens, plus a couple of warm autumn tones for variety. */
const LEAF_COLORS = ['#4f9d69', '#67b97f', '#3f8a59', '#86c98f', '#e0a44b', '#cf8a3a'];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function LeafShape({ color }: { color: string }) {
  return (
    <svg className="leaf-shape" viewBox="0 0 32 34" aria-hidden="true">
      <path d="M16 1C25 7 29 19 16 33C3 19 7 7 16 1Z" fill={color} />
      <path d="M16 4V30" stroke="rgba(40, 60, 30, 0.22)" strokeWidth="1.1" strokeLinecap="round" />
      <path
        d="M16 12L11 9M16 12L21 9M16 19L10 16M16 19L22 16M16 25L12.5 23M16 25L19.5 23"
        stroke="rgba(40, 60, 30, 0.14)"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export interface FallingLeavesProps {
  /** Number of leaves to render. */
  count?: number;
}

export function FallingLeaves({ count = 14 }: FallingLeavesProps) {
  const leaves = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const fallDuration = rand(9, 18);
        const size = rand(14, 28);

        return {
          id: index,
          color: LEAF_COLORS[index % LEAF_COLORS.length],
          style: {
            left: `${rand(0, 100)}%`,
            width: `${size}px`,
            height: `${size}px`,
            opacity: rand(0.45, 0.8),
            // Negative delays spread the leaves out so they're mid-fall on load.
            '--fall-dur': `${fallDuration}s`,
            '--fall-delay': `${-rand(0, fallDuration)}s`,
            '--sway-dur': `${rand(2.6, 4.8)}s`,
            '--sway-delay': `${-rand(0, 4)}s`,
            '--sway': `${rand(14, 46)}px`,
            '--rot-from': `${rand(-40, 0)}deg`,
            '--rot-to': `${rand(180, 540)}deg`,
          } as CSSProperties,
        };
      }),
    [count],
  );

  return (
    <div className="falling-leaves" aria-hidden="true">
      {leaves.map((leaf) => (
        <span key={leaf.id} className="leaf-fall" style={leaf.style}>
          <span className="leaf-sway">
            <LeafShape color={leaf.color} />
          </span>
        </span>
      ))}
    </div>
  );
}
