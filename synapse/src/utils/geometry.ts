import { Position } from '../types';

export function getBezierControlPoints(
  source: Position,
  target: Position
): { cp1: Position; cp2: Position } {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.min(dist * 0.4, 120);

  // Perpendicular offset for curve
  const nx = -dy / dist;
  const ny = dx / dist;

  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;

  const curvature = offset * 0.5;

  return {
    cp1: {
      x: midX + nx * curvature - dx * 0.1,
      y: midY + ny * curvature - dy * 0.1,
    },
    cp2: {
      x: midX + nx * curvature + dx * 0.1,
      y: midY + ny * curvature + dy * 0.1,
    },
  };
}

export function getBezierPath(source: Position, target: Position): string {
  const { cp1, cp2 } = getBezierControlPoints(source, target);
  return `M ${source.x} ${source.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${target.x} ${target.y}`;
}

export function getPointOnBezier(
  source: Position,
  target: Position,
  t: number
): Position {
  const { cp1, cp2 } = getBezierControlPoints(source, target);
  const u = 1 - t;
  return {
    x:
      u * u * u * source.x +
      3 * u * u * t * cp1.x +
      3 * u * t * t * cp2.x +
      t * t * t * target.x,
    y:
      u * u * u * source.y +
      3 * u * u * t * cp1.y +
      3 * u * t * t * cp2.y +
      t * t * t * target.y,
  };
}

export function getMidpoint(source: Position, target: Position): Position {
  return getPointOnBezier(source, target, 0.5);
}

export function getArrowAngle(source: Position, target: Position): number {
  const p1 = getPointOnBezier(source, target, 0.48);
  const p2 = getPointOnBezier(source, target, 0.52);
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
}

export function distance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function pointToLineDistance(
  point: Position,
  lineStart: Position,
  lineEnd: Position
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : -1;

  let xx, yy;
  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  return distance(point, { x: xx, y: yy });
}

export function isPointNearBezier(
  point: Position,
  source: Position,
  target: Position,
  threshold: number = 10
): boolean {
  // Sample points along bezier and check distance
  for (let t = 0; t <= 1; t += 0.05) {
    const p = getPointOnBezier(source, target, t);
    if (distance(point, p) < threshold) return true;
  }
  return false;
}
