import type { NetworkTopology, RoutingTable, RoutingEntry, RouteResult } from '../types/network';
import { buildAdjacencyMap, getDeviceById } from '../utils/graph';

export interface DVEntry {
  destination: string;
  metric: number;
  nextHop: string | null;
}

export type DVTable = Map<string, DVEntry>;

const MAX_METRIC = 16;
const MAX_ITERATIONS = 100;

export function computeDistanceVector(topology: NetworkTopology): Map<string, DVTable> {
  const adj = buildAdjacencyMap(topology);
  const tables = new Map<string, DVTable>();

  const activeDevices = topology.devices.filter(d => d.status === 'online');

  for (const device of activeDevices) {
    const table: DVTable = new Map();
    table.set(device.id, { destination: device.id, metric: 0, nextHop: device.id });
    tables.set(device.id, table);
  }

  let changed = true;
  let iterations = 0;

  while (changed && iterations < MAX_ITERATIONS) {
    changed = false;
    iterations++;

    for (const device of activeDevices) {
      const myTable = tables.get(device.id)!;
      const neighbors = adj.get(device.id) ?? [];

      for (const { neighborId, link } of neighbors) {
        const neighborTable = tables.get(neighborId);
        if (!neighborTable) continue;

        for (const [dest, entry] of neighborTable) {
          const newMetric = Math.min(link.cost + entry.metric, MAX_METRIC);
          const existing = myTable.get(dest);

          if (!existing || newMetric < existing.metric) {
            myTable.set(dest, { destination: dest, metric: newMetric, nextHop: neighborId });
            changed = true;
          }
        }
      }
    }
  }

  return tables;
}

export function buildRoutingTables(
  topology: NetworkTopology,
  dvTables: Map<string, DVTable>
): RoutingTable[] {
  const result: RoutingTable[] = [];

  for (const [routerId, dvTable] of dvTables) {
    const router = getDeviceById(topology, routerId);
    if (!router) continue;

    const entries: RoutingEntry[] = [];

    for (const [destId, entry] of dvTable) {
      if (destId === routerId) continue;
      const destDevice = getDeviceById(topology, destId);
      const nextHopDevice = entry.nextHop ? getDeviceById(topology, entry.nextHop) : null;

      entries.push({
        destination: destId,
        destinationLabel: destDevice?.label ?? destId,
        nextHop: entry.nextHop ?? '',
        nextHopLabel: nextHopDevice?.label ?? entry.nextHop ?? 'unreachable',
        metric: entry.metric,
        status: entry.metric >= MAX_METRIC ? 'unreachable' : 'active',
      });
    }

    entries.sort((a, b) => a.destinationLabel.localeCompare(b.destinationLabel));

    result.push({
      routerId,
      routerLabel: router.label,
      entries,
    });
  }

  return result;
}

export function distanceVectorRoute(
  topology: NetworkTopology,
  sourceId: string,
  destinationId: string
): RouteResult {
  const dvTables = computeDistanceVector(topology);
  const sourceTable = dvTables.get(sourceId);

  if (!sourceTable) {
    return { path: [], totalCost: Infinity, reachable: false, algorithm: 'distance-vector' };
  }

  const destEntry = sourceTable.get(destinationId);
  if (!destEntry || destEntry.metric >= MAX_METRIC) {
    return { path: [], totalCost: Infinity, reachable: false, algorithm: 'distance-vector' };
  }

  const path = traceDVPath(dvTables, sourceId, destinationId);
  return {
    path,
    totalCost: destEntry.metric,
    reachable: path.length > 0 && path[path.length - 1] === destinationId,
    algorithm: 'distance-vector',
  };
}

function traceDVPath(
  dvTables: Map<string, DVTable>,
  sourceId: string,
  destinationId: string
): string[] {
  const path: string[] = [sourceId];
  const visited = new Set<string>([sourceId]);
  let current = sourceId;

  while (current !== destinationId) {
    const table = dvTables.get(current);
    if (!table) break;

    const entry = table.get(destinationId);
    if (!entry || entry.nextHop === null || entry.nextHop === current) break;

    const nextHop = entry.nextHop;
    if (visited.has(nextHop)) break;

    path.push(nextHop);
    visited.add(nextHop);
    current = nextHop;
  }

  if (path[path.length - 1] !== destinationId) {
    return [];
  }

  return path;
}
