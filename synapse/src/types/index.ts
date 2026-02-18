export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BrainRegion {
  id: string;
  name: string;
  shortName: string;
  description: string;
  role: string;
  color: string;
  position: Position;
  size: Size;
  connections: string[];
}

export interface Connection {
  id: string;
  source: string;
  target: string;
}

export interface BiasResult {
  name: string;
  emoji: string;
  description: string;
  missing: string;
  realExample: string;
}

export interface BiasRule {
  pathIncludes?: string[];
  pathExcludes?: string[];
  pathStartsWith?: string[];
  pathEndsWith?: string[];
  directConnection?: [string, string];
  bias: BiasResult;
  priority: number;
}

export interface Stimulus {
  id: string;
  name: string;
  emoji: string;
  description: string;
  entryPoint: string;
  correctPath: string[];
  biasRules: BiasRule[];
}

export type ToolMode = 'connect' | 'delete' | 'select';

export interface SimulationState {
  isRunning: boolean;
  currentPath: string[];
  currentSegment: number;
  progress: number; // 0-1 within current segment
  result: SimulationResult | null;
}

export interface SimulationResult {
  type: 'success' | 'bias' | 'incomplete';
  path: string[];
  bias?: BiasResult;
  correctPath?: string[];
  message?: string;
}

export interface TutorialStep {
  target: string;
  message: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}
