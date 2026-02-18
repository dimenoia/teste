import { useState, useCallback, useRef } from 'react';
import { Connection, Stimulus, SimulationState } from '../types';
import { evaluateCircuit } from '../utils/biasEngine';

const SEGMENT_DURATION = 800; // ms per segment

export function useSignalSimulation() {
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    currentPath: [],
    currentSegment: 0,
    progress: 0,
    result: null,
  });

  const [activeRegions, setActiveRegions] = useState<Set<string>>(new Set());
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const clearResult = useCallback(() => {
    setSimulation((prev) => ({ ...prev, result: null }));
  }, []);

  const fireSignal = useCallback(
    (stimulus: Stimulus, connections: Connection[]) => {
      // Evaluate the circuit first
      const result = evaluateCircuit(stimulus, connections);

      if (result.type === 'incomplete') {
        setSimulation({
          isRunning: false,
          currentPath: [],
          currentSegment: 0,
          progress: 0,
          result,
        });
        return;
      }

      const path = result.path;

      // Start animation
      setSimulation({
        isRunning: true,
        currentPath: path,
        currentSegment: 0,
        progress: 0,
        result: null,
      });
      setActiveRegions(new Set([path[0]]));

      startTimeRef.current = performance.now();

      const totalSegments = path.length - 1;

      const animate = (now: number) => {
        const elapsed = now - startTimeRef.current;
        const totalDuration = totalSegments * SEGMENT_DURATION;
        const overallProgress = Math.min(elapsed / totalDuration, 1);

        const currentSegmentFloat = overallProgress * totalSegments;
        const currentSegment = Math.min(
          Math.floor(currentSegmentFloat),
          totalSegments - 1
        );
        const segmentProgress = currentSegmentFloat - currentSegment;

        // Light up regions as signal passes
        const litRegions = new Set<string>();
        for (let i = 0; i <= currentSegment; i++) {
          litRegions.add(path[i]);
        }
        if (segmentProgress > 0.8 && currentSegment + 1 < path.length) {
          litRegions.add(path[currentSegment + 1]);
        }
        setActiveRegions(litRegions);

        setSimulation((prev) => ({
          ...prev,
          currentSegment,
          progress: segmentProgress,
        }));

        if (overallProgress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete — show result
          setActiveRegions(new Set(path));
          setSimulation({
            isRunning: false,
            currentPath: path,
            currentSegment: totalSegments - 1,
            progress: 1,
            result,
          });

          // Clear active regions after a delay
          setTimeout(() => {
            setActiveRegions(new Set());
          }, 2000);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    },
    []
  );

  const stopSimulation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setSimulation({
      isRunning: false,
      currentPath: [],
      currentSegment: 0,
      progress: 0,
      result: null,
    });
    setActiveRegions(new Set());
  }, []);

  return {
    simulation,
    activeRegions,
    fireSignal,
    stopSimulation,
    clearResult,
  };
}
