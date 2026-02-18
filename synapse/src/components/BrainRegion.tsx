import React from 'react';
import { BrainRegion as BrainRegionType } from '../types';

interface Props {
  region: BrainRegionType;
  isActive: boolean;
  isSelected: boolean;
  isEntryPoint: boolean;
  isHovered: boolean;
  resultType: 'success' | 'bias' | null;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  canvasWidth: number;
  canvasHeight: number;
}

export default function BrainRegionComponent({
  region,
  isActive,
  isSelected,
  isEntryPoint,
  isHovered,
  resultType,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave,
  onClick,
  canvasWidth,
  canvasHeight,
}: Props) {
  const cx = (region.position.x / 100) * canvasWidth;
  const cy = (region.position.y / 100) * canvasHeight;
  const rx = (region.size.width / 100) * canvasWidth * 0.5;
  const ry = (region.size.height / 100) * canvasHeight * 0.5;

  const isOutput = region.id === 'output';
  const glowColor = resultType === 'success' ? '#51CF66' : resultType === 'bias' ? '#FF6B6B' : region.color;

  // Unique animation delay per region
  const breatheDelay = (region.position.x * 0.1 + region.position.y * 0.05) % 4;

  // Output hexagon
  const hexPoints = isOutput
    ? Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hr = Math.max(rx, ry) * 1.1;
        return `${cx + hr * Math.cos(angle)},${cy + hr * Math.sin(angle)}`;
      }).join(' ')
    : '';

  const innerHexPoints = isOutput
    ? Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hr = Math.max(rx, ry) * 0.9;
        return `${cx + hr * Math.cos(angle)},${cy + hr * Math.sin(angle)}`;
      }).join(' ')
    : '';

  return (
    <g
      className="cursor-pointer"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <defs>
        <filter id={`glow-${region.id}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation={isActive || isHovered ? 10 : 5} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`grad-${region.id}`} cx="45%" cy="40%">
          <stop offset="0%" stopColor={glowColor} stopOpacity={isActive ? 0.25 : 0.12} />
          <stop offset="70%" stopColor={glowColor} stopOpacity={isActive ? 0.12 : 0.06} />
          <stop offset="100%" stopColor={glowColor} stopOpacity={0.02} />
        </radialGradient>
        <radialGradient id={`core-${region.id}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity={isActive ? 0.5 : 0.3} />
          <stop offset="100%" stopColor={glowColor} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* LAYER 1: Outer glow (breathing) */}
      {isOutput ? (
        <polygon points={hexPoints} fill={glowColor} opacity={0.06} style={{ filter: 'blur(15px)' }}>
          <animate attributeName="opacity" values="0.04;0.10;0.04" dur={`${3.5 + breatheDelay * 0.3}s`} begin={`${breatheDelay}s`} repeatCount="indefinite" />
        </polygon>
      ) : (
        <ellipse cx={cx} cy={cy} rx={rx * 1.6} ry={ry * 1.6} fill={glowColor} opacity={0.06} style={{ filter: 'blur(15px)' }}>
          <animate attributeName="opacity" values="0.04;0.10;0.04" dur={`${3.5 + breatheDelay * 0.3}s`} begin={`${breatheDelay}s`} repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Entry point pulse rings */}
      {isEntryPoint && (
        <>
          <ellipse cx={cx} cy={cy} rx={rx + 5} ry={ry + 5} fill="none" stroke={region.color} strokeWidth={2} opacity={0.6}>
            <animate attributeName="rx" values={`${rx + 5};${rx + 25};${rx + 5}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="ry" values={`${ry + 5};${ry + 25};${ry + 5}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={cx} cy={cy} rx={rx + 3} ry={ry + 3} fill="none" stroke={region.color} strokeWidth={1.5} opacity={0.3}>
            <animate attributeName="rx" values={`${rx + 3};${rx + 18};${rx + 3}`} dur="2s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="ry" values={`${ry + 3};${ry + 18};${ry + 3}`} dur="2s" begin="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" begin="0.5s" repeatCount="indefinite" />
          </ellipse>
        </>
      )}

      {/* LAYER 2: Main body */}
      {isOutput ? (
        <>
          <polygon points={hexPoints} fill="none" stroke={glowColor} strokeWidth={1} strokeDasharray="6 4" opacity={0.4}
            style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}>
            <animate attributeName="stroke-dashoffset" values="0;-24" dur="4s" repeatCount="indefinite" />
          </polygon>
          <polygon points={innerHexPoints} fill={`url(#grad-${region.id})`} stroke={glowColor}
            strokeWidth={isSelected ? 2.5 : isActive ? 2 : 1.5}
            opacity={isActive ? 1 : 0.9}
            filter={isActive || isHovered ? `url(#glow-${region.id})` : undefined}
            style={{ transition: 'all 0.3s ease' }}
          />
        </>
      ) : (
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
          fill={`url(#grad-${region.id})`}
          stroke={glowColor}
          strokeWidth={isSelected ? 2.5 : isActive ? 2 : isHovered ? 2 : 1.2}
          opacity={isActive ? 1 : isHovered ? 1 : 0.85}
          filter={isActive || isHovered || isSelected ? `url(#glow-${region.id})` : undefined}
          style={{
            transition: 'all 0.3s ease',
            filter: !(isActive || isHovered || isSelected) ? `drop-shadow(0 0 6px ${glowColor}40)` : undefined,
          }}
        />
      )}

      {/* LAYER 3: Bright core */}
      {isOutput ? (
        <circle cx={cx} cy={cy} r={Math.max(rx, ry) * 0.35} fill={`url(#core-${region.id})`} style={{ filter: 'blur(3px)' }} />
      ) : (
        <ellipse cx={cx} cy={cy} rx={rx * 0.35} ry={ry * 0.35} fill={`url(#core-${region.id})`} style={{ filter: 'blur(3px)' }}>
          <animate attributeName="opacity" values="0.7;1;0.7" dur={`${2.5 + breatheDelay * 0.2}s`} begin={`${breatheDelay * 0.5}s`} repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Flash ring when signal passes */}
      {isActive && resultType === null && (
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={region.color} strokeWidth={2.5}>
          <animate attributeName="rx" from={`${rx}`} to={`${rx + 30}`} dur="0.6s" fill="freeze" />
          <animate attributeName="ry" from={`${ry}`} to={`${ry + 30}`} dur="0.6s" fill="freeze" />
          <animate attributeName="opacity" from="0.8" to="0" dur="0.6s" fill="freeze" />
        </ellipse>
      )}

      {/* Label */}
      <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="central"
        fill={glowColor} fontSize={isOutput ? 10 : 11}
        fontFamily="'JetBrains Mono', monospace" fontWeight={600} letterSpacing="1px"
        style={{ pointerEvents: 'none', userSelect: 'none', textShadow: `0 0 8px ${glowColor}50` }}
        opacity={0.9}
      >
        {region.shortName}
      </text>

      {/* Sub-label on hover */}
      {(isHovered || isSelected) && !isOutput && (
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="central"
          fill={region.color} fontSize={7} fontFamily="'DM Sans', sans-serif"
          style={{ pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}
        >
          {region.name}
        </text>
      )}

      {isOutput && (
        <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="central"
          fill="#DEE2E6" fontSize={7} fontFamily="'JetBrains Mono', monospace" letterSpacing="2px"
          style={{ pointerEvents: 'none', userSelect: 'none', opacity: 0.4 }}
        >
          SAIDA
        </text>
      )}
    </g>
  );
}
