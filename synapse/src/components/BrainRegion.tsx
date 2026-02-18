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
  const glowColor = resultType === 'success' ? '#2ECC71' : resultType === 'bias' ? '#E74C3C' : region.color;

  return (
    <g
      className="cursor-pointer"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{ transition: 'transform 0.2s ease-out' }}
    >
      {/* Pulse ring for entry point */}
      {isEntryPoint && (
        <>
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx + 8}
            ry={ry + 8}
            fill="none"
            stroke={region.color}
            strokeWidth={2}
            opacity={0.6}
          >
            <animate
              attributeName="rx"
              values={`${rx + 5};${rx + 20};${rx + 5}`}
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="ry"
              values={`${ry + 5};${ry + 20};${ry + 5}`}
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="2s"
              repeatCount="indefinite"
            />
          </ellipse>
        </>
      )}

      {/* Glow filter */}
      <defs>
        <filter id={`glow-${region.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur
            stdDeviation={isActive || isHovered ? 8 : 4}
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`grad-${region.id}`} cx="40%" cy="40%">
          <stop offset="0%" stopColor={glowColor} stopOpacity={0.4} />
          <stop offset="100%" stopColor={glowColor} stopOpacity={0.1} />
        </radialGradient>
      </defs>

      {/* Region shape */}
      {isOutput ? (
        // Diamond shape for output
        <polygon
          points={`${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`}
          fill={`url(#grad-${region.id})`}
          stroke={glowColor}
          strokeWidth={isSelected ? 3 : isActive ? 2.5 : 1.5}
          opacity={isActive ? 1 : 0.85}
          filter={isActive || isHovered ? `url(#glow-${region.id})` : undefined}
          style={{ transition: 'all 0.3s ease' }}
        />
      ) : (
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={`url(#grad-${region.id})`}
          stroke={glowColor}
          strokeWidth={isSelected ? 3 : isActive ? 2.5 : 1.5}
          opacity={isActive ? 1 : 0.85}
          filter={isActive || isHovered ? `url(#glow-${region.id})` : undefined}
          style={{ transition: 'all 0.3s ease' }}
        >
          {/* Breathing animation */}
          {!isActive && !isHovered && (
            <animate
              attributeName="opacity"
              values="0.7;0.9;0.7"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </ellipse>
      )}

      {/* Flash ring when signal passes */}
      {isActive && resultType === null && (
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={region.color}
          strokeWidth={3}
        >
          <animate
            attributeName="rx"
            from={`${rx}`}
            to={`${rx + 25}`}
            dur="0.5s"
            fill="freeze"
          />
          <animate
            attributeName="ry"
            from={`${ry}`}
            to={`${ry + 25}`}
            dur="0.5s"
            fill="freeze"
          />
          <animate
            attributeName="opacity"
            from="0.8"
            to="0"
            dur="0.5s"
            fill="freeze"
          />
        </ellipse>
      )}

      {/* Label */}
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#e8e8f0"
        fontSize={isOutput ? 11 : 10}
        fontFamily="'Sora', sans-serif"
        fontWeight={600}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {region.shortName}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#6b6b8a"
        fontSize={7}
        fontFamily="'DM Sans', sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {region.id === 'output' ? 'Saída' : ''}
      </text>
    </g>
  );
}
