import { describe, it, expect } from 'vitest';
import { computeDistanceVector, distanceVectorRoute, buildRoutingTables } from '../src/algorithms/distanceVector';
import type { NetworkTopology } from '../src/types/network';

const topology: NetworkTopology = {
  devices: [
    { id: 'r1', type: 'router', label: 'R1', status: 'online', position: { x: 0, y: 0 } },
    { id: 'r2', type: 'router', label: 'R2', status: 'online', position: { x: 100, y: 0 } },
    { id: 'r3', type: 'router', label: 'R3', status: 'online', position: { x: 50, y: 100 } },
    { id: 'srv', type: 'server', label: 'SRV', status: 'online', position: { x: 200, y: 0 } },
  ],
  links: [
    { id: 'l1', source: 'r1', target: 'r2', cost: 2, bandwidth: 100, delay: 10, enabled: true },
    { id: 'l2', source: 'r1', target: 'r3', cost: 3, bandwidth: 100, delay: 15, enabled: true },
    { id: 'l3', source: 'r3', target: 'r2', cost: 3, bandwidth: 100, delay: 15, enabled: true },
    { id: 'l4', source: 'r2', target: 'srv', cost: 1, bandwidth: 100, delay: 5, enabled: true },
  ],
};

describe('Distance Vector Algorithm', () => {
  it('converges and finds route to destination', () => {
    const result = distanceVectorRoute(topology, 'r1', 'srv');
    expect(result.reachable).toBe(true);
    expect(result.path[0]).toBe('r1');
    expect(result.path[result.path.length - 1]).toBe('srv');
  });

  it('prefers lower cost path', () => {
    const result = distanceVectorRoute(topology, 'r1', 'srv');
    expect(result.totalCost).toBeLessThanOrEqual(5);
    expect(result.path).toEqual(['r1', 'r2', 'srv']);
  });

  it('returns unreachable when link is disabled blocking all paths', () => {
    const disconnected: NetworkTopology = {
      ...topology,
      links: topology.links.map(l => ({ ...l, enabled: false })),
    };
    const result = distanceVectorRoute(disconnected, 'r1', 'srv');
    expect(result.reachable).toBe(false);
  });

  it('avoids offline routers', () => {
    const withOffline: NetworkTopology = {
      ...topology,
      devices: topology.devices.map(d => d.id === 'r2' ? { ...d, status: 'offline' } : d),
    };
    const result = distanceVectorRoute(withOffline, 'r1', 'srv');
    expect(result.reachable).toBe(false);
  });

  it('builds routing tables for all routers', () => {
    const dvTables = computeDistanceVector(topology);
    const tables = buildRoutingTables(topology, dvTables);
    expect(tables.length).toBeGreaterThan(0);
    const r1Table = tables.find(t => t.routerId === 'r1');
    expect(r1Table).toBeDefined();
    expect(r1Table!.entries.length).toBeGreaterThan(0);
  });

  it('returns active status for reachable destinations', () => {
    const dvTables = computeDistanceVector(topology);
    const tables = buildRoutingTables(topology, dvTables);
    const r1Table = tables.find(t => t.routerId === 'r1');
    const srvEntry = r1Table?.entries.find(e => e.destination === 'srv');
    expect(srvEntry?.status).toBe('active');
  });

  it('route metric equals cost of best path', () => {
    const result = distanceVectorRoute(topology, 'r1', 'srv');
    expect(result.totalCost).toBe(3);
  });
});
