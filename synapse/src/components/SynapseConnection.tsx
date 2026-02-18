import { Connection, BrainRegion } from '../types';
import { getBezierPath, getMidpoint, getPointOnBezier } from '../utils/geometry';

interface Props {
  connection: Connection;
  regions: BrainRegion[];
  isOnSignalPath: boolean;
  resultType: 'success' | 'bias' | null;
  isGhost: boolean;
  deleteMode: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  canvasWidth: number;
  canvasHeight: number;
}

export default function SynapseConnection({
  connection,
  regions,
  isOnSignalPath,
  resultType,
  isGhost,
  deleteMode,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  canvasWidth,
  canvasHeight,
}: Props) {
  const source = regions.find((r) => r.id === connection.source);
  const target = regions.find((r) => r.id === connection.target);
  if (!source || !target) return null;

  const sourcePos = {
    x: (source.position.x / 100) * canvasWidth,
    y: (source.position.y / 100) * canvasHeight,
  };
  const targetPos = {
    x: (target.position.x / 100) * canvasWidth,
    y: (target.position.y / 100) * canvasHeight,
  };

  const pathD = getBezierPath(sourcePos, targetPos);
  const arrowPos = getPointOnBezier(sourcePos, targetPos, 0.65);
  const arrowP1 = getPointOnBezier(sourcePos, targetPos, 0.63);
  const arrowP2 = getPointOnBezier(sourcePos, targetPos, 0.67);
  const arrowAngle = Math.atan2(arrowP2.y - arrowP1.y, arrowP2.x - arrowP1.x) * (180 / Math.PI);
  const mid = getMidpoint(sourcePos, targetPos);

  const color = resultType === 'success'
    ? '#51CF66'
    : resultType === 'bias'
    ? '#FF6B6B'
    : isGhost
    ? '#51CF6680'
    : isHovered && deleteMode
    ? '#FF6B6B'
    : source.color;

  const targetColor = resultType ? color : isGhost ? color : target.color;
  const opacity = isGhost ? 0.35 : isOnSignalPath ? 1 : isHovered ? 0.9 : 0.55;
  const gradId = `conn-grad-${connection.id}`;

  return (
    <g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={deleteMode ? 'cursor-pointer' : ''}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={targetColor} />
        </linearGradient>
      </defs>

      {/* Hit area */}
      <path d={pathD} fill="none" stroke="transparent" strokeWidth={20} />

      {/* Glow */}
      {(isOnSignalPath || isHovered) && (
        <path d={pathD} fill="none" stroke={color} strokeWidth={8} opacity={0.2} strokeLinecap="round" style={{ filter: 'blur(6px)' }} />
      )}

      {/* Main path */}
      <path d={pathD} fill="none"
        stroke={isGhost ? color : `url(#${gradId})`}
        strokeWidth={isOnSignalPath ? 2.5 : 1.8}
        opacity={opacity}
        strokeLinecap="round"
        strokeDasharray={isGhost ? '8 4' : '4 12'}
        style={{
          transition: 'all 0.3s ease',
          animation: !isGhost ? 'dash-flow 2s linear infinite' : undefined,
          filter: `drop-shadow(0 0 4px ${color}50)`,
        }}
      />

      {/* Solid overlay on signal path */}
      {isOnSignalPath && (
        <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} opacity={0.9} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      )}

      {/* Arrow */}
      <polygon points="-5,-3.5 6,0 -5,3.5" fill={color}
        opacity={isGhost ? 0.3 : opacity * 0.8}
        transform={`translate(${arrowPos.x}, ${arrowPos.y}) rotate(${arrowAngle})`}
        style={{ transition: 'all 0.3s ease', filter: `drop-shadow(0 0 3px ${color}60)` }}
      />

      {/* Tooltip */}
      {isHovered && !isGhost && (
        <g>
          <rect x={mid.x - 65} y={mid.y - 30} width={130} height={22} rx={6}
            fill="#0d1117" stroke={color} strokeWidth={0.5} opacity={0.95}
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
          <text x={mid.x} y={mid.y - 17} textAnchor="middle" fill="#e8e8f0"
            fontSize={9} fontFamily="'JetBrains Mono', monospace" letterSpacing="0.5px"
          >
            {source.shortName} → {target.shortName}
          </text>
        </g>
      )}
    </g>
  );
}
