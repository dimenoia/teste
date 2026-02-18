import { useState, useCallback, useRef } from 'react';
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

  // Result type for visual feedback
  const resultType =
    simulation.result?.type === 'success'
      ? 'success'
      : simulation.result?.type === 'bias'
      ? 'bias'
      : null;

  // Ghost connections for correct path display
  const ghostConnections: Connection[] = [];
  if (ghostPath) {
    for (let i = 0; i < ghostPath.length - 1; i++) {
      ghostConnections.push({
        id: `ghost-${ghostPath[i]}-${ghostPath[i + 1]}`,
        source: ghostPath[i],
        target: ghostPath[i + 1],
      });
    }
  }

  // Drag line source position
  const dragSourceRegion = dragSource
    ? brainRegions.find((r) => r.id === dragSource)
    : null;
  const dragSourcePos = dragSourceRegion
    ? {
        x: (dragSourceRegion.position.x / 100) * CANVAS_W,
        y: (dragSourceRegion.position.y / 100) * CANVAS_H,
      }
    : null;

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
      {/* Background */}
      <rect width={CANVAS_W} height={CANVAS_H} fill="#0a0a0f" />

      {/* Subtle grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="0.5"
            opacity="0.3"
          />
        </pattern>
      </defs>
      <rect width={CANVAS_W} height={CANVAS_H} fill="url(#grid)" />

      {/* Brain silhouette */}
      <path
        d={`
          M 140,80
          C 120,60 100,50 120,35
          C 140,15 200,10 280,15
          C 360,20 420,30 460,55
          C 500,80 520,100 530,140
          C 540,180 530,240 510,280
          C 490,320 460,350 420,370
          C 380,390 340,395 300,390
          C 260,385 220,375 190,360
          C 160,345 140,320 130,290
          C 120,260 115,220 120,180
          C 125,140 130,110 140,80
          Z
        `}
        fill="none"
        stroke="#2a2a4a"
        strokeWidth="1.5"
        opacity="0.5"
      />
      {/* Brain inner details */}
      <path
        d={`
          M 300,20
          C 300,60 290,100 300,140
          C 310,180 320,220 310,260
          C 300,300 290,340 300,380
        `}
        fill="none"
        stroke="#1a1a2e"
        strokeWidth="1"
        opacity="0.4"
      />
      <path
        d={`
          M 200,50
          C 230,80 260,120 240,160
          C 220,200 250,250 230,300
        `}
        fill="none"
        stroke="#1a1a2e"
        strokeWidth="0.8"
        opacity="0.3"
      />
      <path
        d={`
          M 400,45
          C 420,90 410,140 430,190
          C 450,240 420,300 410,350
        `}
        fill="none"
        stroke="#1a1a2e"
        strokeWidth="0.8"
        opacity="0.3"
      />

      {/* Ghost connections (correct path) */}
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
        <line
          x1={dragSourcePos.x}
          y1={dragSourcePos.y}
          x2={dragPos.x}
          y2={dragPos.y}
          stroke={dragSourceRegion?.color || '#4A90D9'}
          strokeWidth={2}
          strokeDasharray="6 4"
          opacity={0.7}
        />
      )}

      {/* Brain regions */}
      {brainRegions.map((region) => (
        <BrainRegionComponent
          key={region.id}
          region={region}
          isActive={activeRegions.has(region.id)}
          isSelected={selectedRegion?.id === region.id}
          isEntryPoint={
            selectedStimulus?.entryPoint === region.id && !simulation.isRunning
          }
          isHovered={
            hoveredRegion === region.id ||
            (!!dragSource && dragSource !== region.id && canConnect(dragSource, region.id))
          }
          resultType={
            activeRegions.has(region.id) && simulation.result ? resultType : null
          }
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
