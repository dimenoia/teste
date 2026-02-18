import { BiasRule, Connection, Stimulus, SimulationResult } from '../types';
import { findPath, pathsMatch } from './signalPath';

function checkRule(rule: BiasRule, path: string[], _connections: Connection[]): boolean {
  // Check pathStartsWith
  if (rule.pathStartsWith) {
    for (let i = 0; i < rule.pathStartsWith.length; i++) {
      if (path[i] !== rule.pathStartsWith[i]) return false;
    }
  }

  // Check pathEndsWith
  if (rule.pathEndsWith) {
    const start = path.length - rule.pathEndsWith.length;
    for (let i = 0; i < rule.pathEndsWith.length; i++) {
      if (path[start + i] !== rule.pathEndsWith[i]) return false;
    }
  }

  // Check pathIncludes
  if (rule.pathIncludes) {
    for (const id of rule.pathIncludes) {
      if (!path.includes(id)) return false;
    }
  }

  // Check pathExcludes
  if (rule.pathExcludes) {
    for (const id of rule.pathExcludes) {
      if (path.includes(id)) return false;
    }
  }

  // Check directConnection
  if (rule.directConnection) {
    const [src, tgt] = rule.directConnection;
    const srcIdx = path.indexOf(src);
    const tgtIdx = path.indexOf(tgt);
    if (srcIdx === -1 || tgtIdx === -1) return false;
    if (tgtIdx !== srcIdx + 1) return false;
  }

  return true;
}

export function evaluateCircuit(
  stimulus: Stimulus,
  connections: Connection[]
): SimulationResult {
  const path = findPath(connections, stimulus.entryPoint, 'output');

  if (!path) {
    return {
      type: 'incomplete',
      path: [],
      message: 'Sinal perdido — circuito incompleto! O sinal não encontrou caminho até a saída comportamental.',
    };
  }

  // Check if path matches correct path
  if (pathsMatch(path, stimulus.correctPath)) {
    return {
      type: 'success',
      path,
      correctPath: stimulus.correctPath,
      message: 'Circuito Saudável! O sinal percorreu o caminho neural ideal.',
    };
  }

  // Check bias rules (sorted by priority descending)
  const sortedRules = [...stimulus.biasRules].sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    if (checkRule(rule, path, connections)) {
      return {
        type: 'bias',
        path,
        bias: rule.bias,
        correctPath: stimulus.correctPath,
      };
    }
  }

  // Generic bias if no specific rule matched
  return {
    type: 'bias',
    path,
    bias: {
      name: 'Circuito Subótimo',
      emoji: '⚠️',
      description: 'Processamento neural com distorções não classificadas. O sinal chegou ao destino, mas por um caminho que não otimiza a decisão.',
      missing: `O caminho ideal seria: ${stimulus.correctPath.join(' → ')}. Seu circuito desviou do processamento neural saudável.`,
      realExample: 'Decisões corporativas que "funcionam" mas são subótimas acontecem todos os dias — o resultado parece ok, mas o processo estava enviesado.',
    },
    correctPath: stimulus.correctPath,
  };
}
