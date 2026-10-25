import type { NetworkTopology, RouteResult } from '../types/network';
import { buildAdjacencyMap } from '../utils/graph';

export function dijkstra(
  topology: NetworkTopology,
  sourceId: string,
  destinationId: string
): RouteResult {
  const adj = buildAdjacencyMap(topology);

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const device of topology.devices) {
    if (device.status === 'offline') continue;
    dist.set(device.id, Infinity);
    prev.set(device.id, null);
    unvisited.add(device.id);
  }

  if (!dist.has(sourceId)) {
    return { path: [], totalCost: Infinity, reachable: false, algorithm: 'dijkstra' };
  }

  dist.set(sourceId, 0);

  while (unvisited.size > 0) {
    let u: string | null = null;
    let minDist = Infinity;

    for (const nodeId of unvisited) {
      const d = dist.get(nodeId) ?? Infinity;
      if (d < minDist) {
        minDist = d;
        u = nodeId;
      }
    }

    if (u === null || minDist === Infinity) break;
    if (u === destinationId) break;

    unvisited.delete(u);

    const neighbors = adj.get(u) ?? [];
    for (const { neighborId, link } of neighbors) {
      if (!unvisited.has(neighborId)) continue;
      const alt = (dist.get(u) ?? Infinity) + link.cost;
      if (alt < (dist.get(neighborId) ?? Infinity)) {
        dist.set(neighborId, alt);
        prev.set(neighborId, u);
      }
    }
  }

  const destDist = dist.get(destinationId) ?? Infinity;
  if (destDist === Infinity || !dist.has(destinationId)) {
    return { path: [], totalCost: Infinity, reachable: false, algorithm: 'dijkstra' };
  }

  const path: string[] = [];
  let current: string | null = destinationId;
  while (current !== null) {
    path.unshift(current);
    current = prev.get(current) ?? null;
  }

  if (path[0] !== sourceId) {
    return { path: [], totalCost: Infinity, reachable: false, algorithm: 'dijkstra' };
  }

  return { path, totalCost: destDist, reachable: true, algorithm: 'dijkstra' };
}
