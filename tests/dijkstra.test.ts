import { describe, it, expect } from 'vitest';
import { dijkstra } from '../src/algorithms/dijkstra';
import type { NetworkTopology } from '../src/types/network';

const simpleTopology: NetworkTopology = {
  devices: [
    { id: 'a', type: 'pc', label: 'A', status: 'online', position: { x: 0, y: 0 } },
    { id: 'b', type: 'router', label: 'B', status: 'online', position: { x: 100, y: 0 } },
    { id: 'c', type: 'router', label: 'C', status: 'online', position: { x: 200, y: 0 } },
    { id: 'd', type: 'server', label: 'D', status: 'online', position: { x: 300, y: 0 } },
  ],
  links: [
    { id: 'l1', source: 'a', target: 'b', cost: 1, bandwidth: 100, delay: 5, enabled: true },
    { id: 'l2', source: 'b', target: 'c', cost: 2, bandwidth: 100, delay: 10, enabled: true },
    { id: 'l3', source: 'c', target: 'd', cost: 1, bandwidth: 100, delay: 5, enabled: true },
    { id: 'l4', source: 'b', target: 'd', cost: 10, bandwidth: 50, delay: 20, enabled: true },
  ],
};

describe('Dijkstra Algorithm', () => {
  it('finds shortest path from A to D', () => {
    const result = dijkstra(simpleTopology, 'a', 'd');
    expect(result.reachable).toBe(true);
    expect(result.path).toEqual(['a', 'b', 'c', 'd']);
    expect(result.totalCost).toBe(4);
  });

  it('returns self-path when source equals destination', () => {
    const result = dijkstra(simpleTopology, 'a', 'a');
    expect(result.reachable).toBe(true);
    expect(result.path).toEqual(['a']);
    expect(result.totalCost).toBe(0);
  });

  it('returns unreachable when destination is disconnected', () => {
    const isolated: NetworkTopology = {
      devices: [
        ...simpleTopology.devices,
        { id: 'isolated', type: 'server', label: 'ISO', status: 'online', position: { x: 400, y: 0 } },
      ],
      links: simpleTopology.links,
    };
    const result = dijkstra(isolated, 'a', 'isolated');
    expect(result.reachable).toBe(false);
    expect(result.path).toHaveLength(0);
  });

  it('avoids disabled links', () => {
    const withDisabled: NetworkTopology = {
      ...simpleTopology,
      links: simpleTopology.links.map(l =>
        l.id === 'l2' ? { ...l, enabled: false } : l
      ),
    };
    const result = dijkstra(withDisabled, 'a', 'd');
    expect(result.reachable).toBe(true);
    expect(result.path).toContain('a');
    expect(result.path).toContain('d');
    expect(result.path).not.toEqual(['a', 'b', 'c', 'd']);
  });

  it('avoids offline routers', () => {
    const withOffline: NetworkTopology = {
      ...simpleTopology,
      devices: simpleTopology.devices.map(d =>
        d.id === 'c' ? { ...d, status: 'offline' } : d
      ),
    };
    const result = dijkstra(withOffline, 'a', 'd');
    expect(result.reachable).toBe(true);
    expect(result.path).not.toContain('c');
  });

  it('returns unreachable when all paths are blocked', () => {
    const allDisabled: NetworkTopology = {
      ...simpleTopology,
      links: simpleTopology.links.map(l => ({ ...l, enabled: false })),
    };
    const result = dijkstra(allDisabled, 'a', 'd');
    expect(result.reachable).toBe(false);
  });

  it('picks lowest cost path when multiple routes exist', () => {
    const result = dijkstra(simpleTopology, 'b', 'd');
    expect(result.reachable).toBe(true);
    expect(result.totalCost).toBeLessThan(10);
    expect(result.path).toEqual(['b', 'c', 'd']);
  });

  it('returns unreachable for unknown source', () => {
    const result = dijkstra(simpleTopology, 'nonexistent', 'd');
    expect(result.reachable).toBe(false);
  });
});
