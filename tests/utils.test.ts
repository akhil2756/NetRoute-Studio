import { describe, it, expect } from 'vitest';
import { validateTopology, buildAdjacencyMap } from '../src/utils/graph';
import { computeMetrics, estimateLatency, findBottleneckLink } from '../src/utils/analytics';
import { importTopologyJSON } from '../src/utils/persistence';
import type { NetworkTopology } from '../src/types/network';

const validTopology: NetworkTopology = {
  devices: [
    { id: 'd1', type: 'router', label: 'R1', status: 'online', position: { x: 0, y: 0 } },
    { id: 'd2', type: 'router', label: 'R2', status: 'online', position: { x: 100, y: 0 } },
  ],
  links: [
    { id: 'l1', source: 'd1', target: 'd2', cost: 1, bandwidth: 100, delay: 10, enabled: true },
  ],
};

describe('Topology Validation', () => {
  it('accepts valid topology', () => {
    const errors = validateTopology(validTopology);
    expect(errors).toHaveLength(0);
  });

  it('rejects link referencing unknown source device', () => {
    const bad: NetworkTopology = {
      ...validTopology,
      links: [{ id: 'l2', source: 'unknown', target: 'd2', cost: 1, bandwidth: 100, delay: 10, enabled: true }],
    };
    const errors = validateTopology(bad);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/unknown source/i);
  });

  it('rejects link with negative cost', () => {
    const bad: NetworkTopology = {
      ...validTopology,
      links: [{ ...validTopology.links[0], cost: -5 }],
    };
    const errors = validateTopology(bad);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/negative cost/i);
  });

  it('rejects duplicate device labels', () => {
    const bad: NetworkTopology = {
      devices: [
        { id: 'd1', type: 'router', label: 'R1', status: 'online', position: { x: 0, y: 0 } },
        { id: 'd2', type: 'router', label: 'R1', status: 'online', position: { x: 100, y: 0 } },
      ],
      links: [],
    };
    const errors = validateTopology(bad);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('Graph Utilities', () => {
  it('builds adjacency map correctly', () => {
    const adj = buildAdjacencyMap(validTopology);
    expect(adj.has('d1')).toBe(true);
    expect(adj.has('d2')).toBe(true);
    const d1Neighbors = adj.get('d1')!;
    expect(d1Neighbors).toHaveLength(1);
    expect(d1Neighbors[0].neighborId).toBe('d2');
  });

  it('excludes disabled links from adjacency map', () => {
    const withDisabled: NetworkTopology = {
      ...validTopology,
      links: [{ ...validTopology.links[0], enabled: false }],
    };
    const adj = buildAdjacencyMap(withDisabled);
    expect(adj.get('d1')).toHaveLength(0);
  });

  it('excludes offline devices from adjacency map', () => {
    const withOffline: NetworkTopology = {
      ...validTopology,
      devices: validTopology.devices.map(d => d.id === 'd2' ? { ...d, status: 'offline' } : d),
    };
    const adj = buildAdjacencyMap(withOffline);
    expect(adj.get('d1')).toHaveLength(0);
  });
});

describe('Analytics Calculations', () => {
  it('computes delivery rate correctly', () => {
    const metrics = computeMetrics(10, 8, 2, [3, 3, 3, 4], [20, 25, 20, 30]);
    expect(metrics.deliveryRate).toBeCloseTo(80, 1);
    expect(metrics.packetsSent).toBe(10);
    expect(metrics.packetsDelivered).toBe(8);
    expect(metrics.packetsDropped).toBe(2);
  });

  it('handles zero sent packets without division by zero', () => {
    const metrics = computeMetrics(0, 0, 0, [], []);
    expect(metrics.deliveryRate).toBe(0);
    expect(metrics.avgHopCount).toBe(0);
    expect(metrics.avgLatency).toBe(0);
  });

  it('calculates average hop count', () => {
    const metrics = computeMetrics(2, 2, 0, [2, 4], [10, 20]);
    expect(metrics.avgHopCount).toBe(3);
  });

  it('estimates latency from path delays', () => {
    const topo: NetworkTopology = {
      devices: [
        { id: 'a', type: 'pc', label: 'A', status: 'online', position: { x: 0, y: 0 } },
        { id: 'b', type: 'router', label: 'B', status: 'online', position: { x: 100, y: 0 } },
        { id: 'c', type: 'server', label: 'C', status: 'online', position: { x: 200, y: 0 } },
      ],
      links: [
        { id: 'l1', source: 'a', target: 'b', cost: 1, bandwidth: 100, delay: 15, enabled: true },
        { id: 'l2', source: 'b', target: 'c', cost: 1, bandwidth: 100, delay: 20, enabled: true },
      ],
    };
    const latency = estimateLatency(topo, ['a', 'b', 'c']);
    expect(latency).toBe(35);
  });

  it('finds bottleneck link (lowest bandwidth)', () => {
    const topo: NetworkTopology = {
      devices: [
        { id: 'a', type: 'pc', label: 'A', status: 'online', position: { x: 0, y: 0 } },
        { id: 'b', type: 'router', label: 'B', status: 'online', position: { x: 100, y: 0 } },
        { id: 'c', type: 'server', label: 'C', status: 'online', position: { x: 200, y: 0 } },
      ],
      links: [
        { id: 'l1', source: 'a', target: 'b', cost: 1, bandwidth: 100, delay: 10, enabled: true },
        { id: 'l2', source: 'b', target: 'c', cost: 1, bandwidth: 10, delay: 10, enabled: true },
      ],
    };
    const bottleneck = findBottleneckLink(topo, ['a', 'b', 'c']);
    expect(bottleneck).toBe('l2');
  });
});

describe('Import Validation', () => {
  it('accepts valid JSON topology', () => {
    const result = importTopologyJSON(JSON.stringify({ name: 'Test', topology: validTopology }));
    expect(result.ok).toBe(true);
    expect(result.topology).toBeDefined();
    expect(result.name).toBe('Test');
  });

  it('rejects invalid JSON', () => {
    const result = importTopologyJSON('not-json');
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects missing topology field', () => {
    const result = importTopologyJSON(JSON.stringify({ name: 'Bad' }));
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects topology with invalid links', () => {
    const bad = {
      name: 'Bad',
      topology: {
        devices: [{ id: 'd1', type: 'router', label: 'R1', status: 'online', position: { x: 0, y: 0 } }],
        links: [{ id: 'l1', source: 'missing', target: 'd1', cost: 1, bandwidth: 100, delay: 10, enabled: true }],
      },
    };
    const result = importTopologyJSON(JSON.stringify(bad));
    expect(result.ok).toBe(false);
  });
});

describe('Packet Delivery Simulation', () => {
  it('100% delivery rate with no failures', () => {
    const metrics = computeMetrics(5, 5, 0, [2, 2, 2, 2, 2], [10, 10, 10, 10, 10]);
    expect(metrics.deliveryRate).toBe(100);
  });

  it('0% delivery rate when all packets dropped', () => {
    const metrics = computeMetrics(3, 0, 3, [], []);
    expect(metrics.deliveryRate).toBe(0);
  });
});
