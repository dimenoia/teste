import { useState, useCallback, useRef, useMemo } from 'react';
import { BrainRegion, Connection, Stimulus, ToolMode, SimulationResult } from '../types';
import { brainRegions } from '../data/brainRegions';
import BrainRegionComponent from './BrainRegion';
import SynapseConnection from './SynapseConnection';
import SignalParticle from './SignalParticle';

interface Props {
  connections: Connection[];
  toolMode: ToolMode;
  selectedStimulus: Stimulus | null;
  simulation: {
    isRunning: boolean;
    currentPath: string[];
    currentSegment: number;
    progress: number;
    result: SimulationResult | null;
  };
  activeRegions: Set<string>;
  ghostPath: string[] | null;
  onRegionClick: (region: BrainRegion) => void;
  onAddConnection: (source: string, target: string) => boolean;
  onRemoveConnection: (connectionId: string) => void;
  canConnect: (source: string, target: string) => boolean;
  selectedRegion: BrainRegion | null;
}

const CANVAS_W = 700;
const CANVAS_H = 500;

// Floating background particles
const BG_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  cx: Math.random() * CANVAS_W,
  cy: Math.random() * CANVAS_H,
  r: 0.8 + Math.random() * 1.2,
  dur: 30 + Math.random() * 30,
  dx: (Math.random() - 0.5) * 200,
  dy: (Math.random() - 0.5) * 200,
  delay: Math.random() * 20,
}));

export default function BrainCanvas({
  connections,
  toolMode,
  selectedStimulus,
  simulation,
  activeRegions,
  ghostPath,
  onRegionClick,
  onAddConnection,
  onRemoveConnection,
  canConnect,
  selectedRegion,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  const getSVGPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const svgPt = pt.matrixTransform(ctm.inverse());
      return { x: svgPt.x, y: svgPt.y };
    },
    []
  );

  const handleRegionMouseDown = useCallback(
    (regionId: string, e: React.MouseEvent) => {
      if (toolMode !== 'connect') return;
      if (regionId === 'output') return;
      e.preventDefault();
      const pos = getSVGPoint(e.clientX, e.clientY);
      setDragSource(regionId);
      setDragPos(pos);
    },
    [toolMode, getSVGPoint]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragSource) return;
      const pos = getSVGPoint(e.clientX, e.clientY);
      if (pos) setDragPos(pos);
    },
    [dragSource, getSVGPoint]
  );

  const handleRegionMouseUp = useCallback(
    (regionId: string) => {
      if (dragSource && dragSource !== regionId) {
        onAddConnection(dragSource, regionId);
      }
      setDragSource(null);
      setDragPos(null);
    },
    [dragSource, onAddConnection]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setDragSource(null);
    setDragPos(null);
  }, []);

  const handleConnectionClick = useCallback(
    (connectionId: string) => {
      if (toolMode === 'delete') {
        onRemoveConnection(connectionId);
      }
    },
    [toolMode, onRemoveConnection]
  );

  const resultType =
    simulation.result?.type === 'success'
      ? 'success'
      : simulation.result?.type === 'bias'
      ? 'bias'
      : null;

  const ghostConnections: Connection[] = useMemo(() => {
    if (!ghostPath) return [];
    const conns: Connection[] = [];
    for (let i = 0; i < ghostPath.length - 1; i++) {
      conns.push({
        id: `ghost-${ghostPath[i]}-${ghostPath[i + 1]}`,
        source: ghostPath[i],
        target: ghostPath[i + 1],
      });
    }
    return conns;
  }, [ghostPath]);

  const dragSourceRegion = dragSource
    ? brainRegions.find((r) => r.id === dragSource)
    : null;
  const dragSourcePos = dragSourceRegion
    ? {
        x: (dragSourceRegion.position.x / 100) * CANVAS_W,
        y: (dragSourceRegion.position.y / 100) * CANVAS_H,
      }
    : null;

  // Brain silhouette path
  const brainPath = `
    M 100,160
    C 90,120 95,80 130,50
    C 170,15 240,5 320,10
    C 400,15 460,35 510,70
    C 555,100 575,140 580,190
    C 585,240 575,300 555,340
    C 530,385 490,415 440,430
    C 390,445 340,448 290,440
    C 240,432 190,415 155,390
    C 120,365 100,330 92,290
    C 84,250 85,210 90,180
    C 92,168 95,164 100,160
    Z
  `;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      className="w-full h-full"
      style={{ maxHeight: 'calc(100vh - 140px)' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    >
      <defs>
        {/* Noise filter */}
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>

        {/* Background gradient */}
        <radialGradient id="bg-grad" cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#0d1117" />
          <stop offset="50%" stopColor="#080b10" />
          <stop offset="100%" stopColor="#050608" />
        </radialGradient>

        {/* Grid */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(100, 120, 255, 0.03)" strokeWidth="0.5" />
        </pattern>

        {/* Brain fill gradient */}
        <radialGradient id="brain-fill-grad" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="rgba(100, 120, 255, 0.03)" />
          <stop offset="100%" stopColor="rgba(100, 120, 255, 0)" />
        </radialGradient>

        {/* Glow filter for brain */}
        <filter id="brain-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Outer halo filter */}
        <filter id="brain-halo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>

      {/* Background */}
      <rect width={CANVAS_W} height={CANVAS_H} fill="url(#bg-grad)" />
      <rect width={CANVAS_W} height={CANVAS_H} fill="url(#grid)" />

      {/* Noise overlay */}
      <rect width={CANVAS_W} height={CANVAS_H} fill="#080b10" opacity="0.025" filter="url(#noise)" />

      {/* Floating particles */}
      {BG_PARTICLES.map((p) => (
        <circle key={p.id} cx={p.cx} cy={p.cy} r={p.r} fill="rgba(120, 140, 255, 0.15)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`0,0; ${p.dx},${p.dy}; 0,0`}
            dur={`${p.dur}s`}
            begin={`${p.delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;0.15;0.15;0"
            dur={`${p.dur}s`}
            begin={`${p.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* ===== BRAIN SILHOUETTE ===== */}
      {/* Layer 1: Outer halo (breathes) */}
      <path d={brainPath} fill="rgba(100, 120, 255, 0.04)" stroke="none" filter="url(#brain-halo)">
        <animate attributeName="opacity" values="0.03;0.07;0.03" dur="6s" repeatCount="indefinite" />
      </path>

      {/* Layer 2: Fill */}
      <path d={brainPath} fill="url(#brain-fill-grad)" stroke="none" />

      {/* Layer 3: Main outline with glow */}
      <path d={brainPath} fill="none" stroke="rgba(100, 120, 255, 0.18)" strokeWidth="1.5" filter="url(#brain-glow)" />

      {/* Brain inner folds */}
      <path d="M 320,15 C 315,80 310,150 320,220 C 330,290 315,360 320,435" fill="none" stroke="rgba(100, 120, 255, 0.08)" strokeWidth="1" />
      <path d="M 200,40 C 230,90 240,150 220,210 C 200,270 230,330 210,400" fill="none" stroke="rgba(100, 120, 255, 0.06)" strokeWidth="0.8" />
      <path d="M 430,35 C 450,100 440,170 460,240 C 480,310 450,380 440,430" fill="none" stroke="rgba(100, 120, 255, 0.06)" strokeWidth="0.8" />
      <path d="M 140,100 C 190,110 260,105 340,110 C 420,115 480,120 540,130" fill="none" stroke="rgba(100, 120, 255, 0.04)" strokeWidth="0.6" />
      <path d="M 130,280 C 200,290 280,285 360,290 C 440,295 500,305 550,310" fill="none" stroke="rgba(100, 120, 255, 0.04)" strokeWidth="0.6" />

      {/* Ghost connections */}
      {ghostConnections.map((conn) => (
        <SynapseConnection
          key={conn.id}
          connection={conn}
          regions={brainRegions}
          isOnSignalPath={false}
          resultType={null}
          isGhost={true}
          deleteMode={false}
          isHovered={false}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
          onClick={() => {}}
          canvasWidth={CANVAS_W}
          canvasHeight={CANVAS_H}
        />
      ))}

      {/* User connections */}
      {connections.map((conn) => {
        const isOnPath =
          simulation.currentPath.length > 0 &&
          simulation.currentPath.some(
            (_id, i) =>
              i < simulation.currentPath.length - 1 &&
              simulation.currentPath[i] === conn.source &&
              simulation.currentPath[i + 1] === conn.target
          );

        return (
          <SynapseConnection
            key={conn.id}
            connection={conn}
            regions={brainRegions}
            isOnSignalPath={isOnPath}
            resultType={isOnPath ? resultType : null}
            isGhost={false}
            deleteMode={toolMode === 'delete'}
            isHovered={hoveredConnection === conn.id}
            onMouseEnter={() => setHoveredConnection(conn.id)}
            onMouseLeave={() => setHoveredConnection(null)}
            onClick={() => handleConnectionClick(conn.id)}
            canvasWidth={CANVAS_W}
            canvasHeight={CANVAS_H}
          />
        );
      })}

      {/* Drag line */}
      {dragSource && dragPos && dragSourcePos && (
        <>
          <line
            x1={dragSourcePos.x} y1={dragSourcePos.y} x2={dragPos.x} y2={dragPos.y}
            stroke={dragSourceRegion?.color || '#5B9BD5'}
            strokeWidth={2} strokeDasharray="6 4" opacity={0.5}
            style={{ filter: `drop-shadow(0 0 6px ${dragSourceRegion?.color || '#5B9BD5'})` }}
          />
          <line
            x1={dragSourcePos.x} y1={dragSourcePos.y} x2={dragPos.x} y2={dragPos.y}
            stroke={dragSourceRegion?.color || '#5B9BD5'}
            strokeWidth={6} opacity={0.15} strokeLinecap="round"
            style={{ filter: 'blur(4px)' }}
          />
        </>
      )}

      {/* Brain regions */}
      {brainRegions.map((region) => (
        <BrainRegionComponent
          key={region.id}
          region={region}
          isActive={activeRegions.has(region.id)}
          isSelected={selectedRegion?.id === region.id}
          isEntryPoint={selectedStimulus?.entryPoint === region.id && !simulation.isRunning}
          isHovered={
            hoveredRegion === region.id ||
            (!!dragSource && dragSource !== region.id && canConnect(dragSource, region.id))
          }
          resultType={activeRegions.has(region.id) && simulation.result ? resultType : null}
          onMouseDown={(e) => handleRegionMouseDown(region.id, e)}
          onMouseUp={() => handleRegionMouseUp(region.id)}
          onMouseEnter={() => setHoveredRegion(region.id)}
          onMouseLeave={() => setHoveredRegion(null)}
          onClick={() => onRegionClick(region)}
          canvasWidth={CANVAS_W}
          canvasHeight={CANVAS_H}
        />
      ))}

      {/* Signal particle */}
      {simulation.isRunning && simulation.currentPath.length > 1 && (
        <SignalParticle
          path={simulation.currentPath}
          currentSegment={simulation.currentSegment}
          progress={simulation.progress}
          regions={brainRegions}
          canvasWidth={CANVAS_W}
          canvasHeight={CANVAS_H}
        />
      )}
    </svg>
  );
}
