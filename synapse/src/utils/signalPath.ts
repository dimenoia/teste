import { Connection } from '../types';

/**
 * BFS to find shortest path from entry to output through user connections.
 */
export function findPath(
  connections: Connection[],
  startId: string,
  endId: string = 'output'
): string[] | null {
  // Build adjacency list
  const adj = new Map<string, string[]>();
  for (const conn of connections) {
    if (!adj.has(conn.source)) adj.set(conn.source, []);
    adj.get(conn.source)!.push(conn.target);
  }

  // BFS
  const queue: string[][] = [[startId]];
  const visited = new Set<string>([startId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current === endId) return path;

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return null; // No path found
}

/**
 * Check if two paths are identical.
 */
export function pathsMatch(path1: string[], path2: string[]): boolean {
  if (path1.length !== path2.length) return false;
  return path1.every((id, i) => id === path2[i]);
}
