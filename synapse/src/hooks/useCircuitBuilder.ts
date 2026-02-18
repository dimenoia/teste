import { useState, useCallback } from 'react';
import { Connection } from '../types';
import { brainRegions } from '../data/brainRegions';

const MAX_CONNECTIONS_PER_NODE = 3;

export function useCircuitBuilder() {
  const [connections, setConnections] = useState<Connection[]>([]);

  const getOutgoingCount = useCallback(
    (regionId: string) => connections.filter((c) => c.source === regionId).length,
    [connections]
  );

  const getIncomingCount = useCallback(
    (regionId: string) => connections.filter((c) => c.target === regionId).length,
    [connections]
  );

  const canConnect = useCallback(
    (sourceId: string, targetId: string): boolean => {
      if (sourceId === targetId) return false;
      if (sourceId === 'output') return false;

      // Check if connection already exists
      if (connections.some((c) => c.source === sourceId && c.target === targetId)) return false;

      // Check max connections
      if (getOutgoingCount(sourceId) >= MAX_CONNECTIONS_PER_NODE) return false;
      if (getIncomingCount(targetId) >= MAX_CONNECTIONS_PER_NODE) return false;

      // Check if source region allows this connection
      const sourceRegion = brainRegions.find((r) => r.id === sourceId);
      if (sourceRegion && !sourceRegion.connections.includes(targetId)) return false;

      return true;
    },
    [connections, getOutgoingCount, getIncomingCount]
  );

  const addConnection = useCallback(
    (sourceId: string, targetId: string): boolean => {
      if (!canConnect(sourceId, targetId)) return false;

      const newConn: Connection = {
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
      };

      setConnections((prev) => [...prev, newConn]);
      return true;
    },
    [canConnect]
  );

  const removeConnection = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
  }, []);

  const clearAll = useCallback(() => {
    setConnections([]);
  }, []);

  return {
    connections,
    addConnection,
    removeConnection,
    clearAll,
    canConnect,
    getOutgoingCount,
    getIncomingCount,
  };
}
