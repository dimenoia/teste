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

  // 6 trail particles for comet effect
  const trail: { pos: Position; opacity: number; size: number }[] = [];
  for (let i = 1; i <= 6; i++) {
    const t = Math.max(0, progress - i * 0.06);
    trail.push({
      pos: getPointOnBezier(sourcePos, targetPos, t),
      opacity: 1 - i * 0.15,
      size: 5 - i * 0.6,
    });
  }

  const color = sourceRegion.color;

  return (
    <g>
      {/* Trail */}
      {trail.map((t, i) => (
        <circle key={i} cx={t.pos.x} cy={t.pos.y} r={Math.max(t.size, 1)}
          fill={color} opacity={t.opacity * 0.4}
          style={{ filter: `blur(${i * 0.5}px)` }}
        />
      ))}

      {/* Large halo */}
      <circle cx={pos.x} cy={pos.y} r={22} fill={color} opacity={0.1} style={{ filter: 'blur(12px)' }} />

      {/* Medium glow */}
      <circle cx={pos.x} cy={pos.y} r={12} fill={color} opacity={0.2} style={{ filter: 'blur(6px)' }} />

      {/* Outer ring */}
      <circle cx={pos.x} cy={pos.y} r={8} fill="none" stroke={color} strokeWidth={1} opacity={0.4} />

      {/* White core */}
      <circle cx={pos.x} cy={pos.y} r={6} fill="#ffffff" opacity={0.95}
        style={{ filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}) drop-shadow(0 0 24px ${color})` }}
      />

      {/* Color center */}
      <circle cx={pos.x} cy={pos.y} r={3} fill={color} opacity={1} />
    </g>
  );
}
