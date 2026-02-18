import { useState, useCallback, useRef } from 'react';
import { Position } from '../types';

interface DragState {
  isDragging: boolean;
  sourceId: string | null;
  sourcePos: Position | null;
  currentPos: Position | null;
}

export function useDragConnection(
  canConnect: (source: string, target: string) => boolean,
  addConnection: (source: string, target: string) => boolean
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    sourceId: null,
    sourcePos: null,
    currentPos: null,
  });

  const svgRef = useRef<SVGSVGElement | null>(null);

  const getSVGPoint = useCallback(
    (clientX: number, clientY: number): Position | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      return { x: svgPt.x, y: svgPt.y };
    },
    []
  );

  const startDrag = useCallback(
    (regionId: string, position: Position, clientX: number, clientY: number) => {
      if (regionId === 'output') return;
      const svgPos = getSVGPoint(clientX, clientY);
      setDragState({
        isDragging: true,
        sourceId: regionId,
        sourcePos: position,
        currentPos: svgPos || position,
      });
    },
    [getSVGPoint]
  );

  const updateDrag = useCallback(
    (clientX: number, clientY: number) => {
      const svgPos = getSVGPoint(clientX, clientY);
      if (svgPos) {
        setDragState((prev) => ({
          ...prev,
          currentPos: svgPos,
        }));
      }
    },
    [getSVGPoint]
  );

  const endDrag = useCallback(
    (targetId: string | null) => {
      if (dragState.sourceId && targetId && dragState.sourceId !== targetId) {
        if (canConnect(dragState.sourceId, targetId)) {
          addConnection(dragState.sourceId, targetId);
        }
      }
      setDragState({
        isDragging: false,
        sourceId: null,
        sourcePos: null,
        currentPos: null,
      });
    },
    [dragState.sourceId, canConnect, addConnection]
  );

  const cancelDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      sourceId: null,
      sourcePos: null,
      currentPos: null,
    });
  }, []);

  return {
    dragState,
    svgRef,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
  };
}
