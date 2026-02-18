import { BrainRegion, Position } from '../types';
import { getPointOnBezier } from '../utils/geometry';

interface Props {
  path: string[];
  currentSegment: number;
  progress: number;
  regions: BrainRegion[];
  canvasWidth: number;
  canvasHeight: number;
}

export default function SignalParticle({
  path,
  currentSegment,
  progress,
  regions,
  canvasWidth,
  canvasHeight,
}: Props) {
  if (path.length < 2 || currentSegment >= path.length - 1) return null;

  const sourceRegion = regions.find((r) => r.id === path[currentSegment]);
  const targetRegion = regions.find((r) => r.id === path[currentSegment + 1]);
  if (!sourceRegion || !targetRegion) return null;

  const sourcePos = {
    x: (sourceRegion.position.x / 100) * canvasWidth,
    y: (sourceRegion.position.y / 100) * canvasHeight,
  };
  const targetPos = {
    x: (targetRegion.position.x / 100) * canvasWidth,
    y: (targetRegion.position.y / 100) * canvasHeight,
  };

  const pos = getPointOnBezier(sourcePos, targetPos, progress);

  // Trail particles
  const trail: { pos: Position; opacity: number; size: number }[] = [];
  for (let i = 1; i <= 4; i++) {
    const t = Math.max(0, progress - i * 0.08);
    trail.push({
      pos: getPointOnBezier(sourcePos, targetPos, t),
      opacity: 1 - i * 0.2,
      size: 5 - i * 0.8,
    });
  }

  const color = sourceRegion.color;

  return (
    <g>
      {/* Trail */}
      {trail.map((t, i) => (
        <circle
          key={i}
          cx={t.pos.x}
          cy={t.pos.y}
          r={t.size}
          fill={color}
          opacity={t.opacity * 0.5}
        />
      ))}

      {/* Glow */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={16}
        fill={color}
        opacity={0.15}
        style={{ filter: 'blur(8px)' }}
      />

      {/* Main particle */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={6}
        fill="#ffffff"
        opacity={0.9}
        style={{ filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color})` }}
      />
      <circle
        cx={pos.x}
        cy={pos.y}
        r={3}
        fill={color}
        opacity={1}
      />
    </g>
  );
}
