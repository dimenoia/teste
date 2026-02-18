import { Connection, BrainRegion } from '../types';
import { getBezierPath, getMidpoint, getArrowAngle } from '../utils/geometry';

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
  const mid = getMidpoint(sourcePos, targetPos);
  const angle = getArrowAngle(sourcePos, targetPos);

  const color = resultType === 'success'
    ? '#2ECC71'
    : resultType === 'bias'
    ? '#E74C3C'
    : isGhost
    ? '#2ECC7180'
    : isHovered && deleteMode
    ? '#E74C3C'
    : source.color;

  const opacity = isGhost ? 0.4 : isOnSignalPath ? 1 : 0.7;

  return (
    <g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={deleteMode ? 'cursor-pointer' : ''}
    >
      {/* Invisible wider path for easier hover/click */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
      />

      {/* Glow effect */}
      {(isOnSignalPath || isHovered) && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={6}
          opacity={0.3}
          strokeLinecap="round"
          style={{ filter: 'blur(4px)' }}
        />
      )}

      {/* Main path */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={isOnSignalPath ? 3 : 2}
        opacity={opacity}
        strokeLinecap="round"
        strokeDasharray={isGhost ? '8 4' : isOnSignalPath ? 'none' : '10 5'}
        style={{
          transition: 'all 0.3s ease',
          animation: !isGhost && !isOnSignalPath ? 'dash-flow 1s linear infinite' : undefined,
        }}
      />

      {/* Arrow at midpoint */}
      <polygon
        points="-5,-4 5,0 -5,4"
        fill={color}
        opacity={opacity}
        transform={`translate(${mid.x}, ${mid.y}) rotate(${angle})`}
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Tooltip on hover */}
      {isHovered && !isGhost && (
        <g>
          <rect
            x={mid.x - 60}
            y={mid.y - 28}
            width={120}
            height={20}
            rx={4}
            fill="#12121a"
            stroke={color}
            strokeWidth={0.5}
            opacity={0.9}
          />
          <text
            x={mid.x}
            y={mid.y - 16}
            textAnchor="middle"
            fill="#e8e8f0"
            fontSize={8}
            fontFamily="'DM Sans', sans-serif"
          >
            {source.shortName} → {target.shortName}
          </text>
        </g>
      )}
    </g>
  );
}
