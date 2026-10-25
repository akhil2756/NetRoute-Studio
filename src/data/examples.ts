import type { NetworkTopology } from '../types/network';

export const EXAMPLE_TOPOLOGIES: { name: string; topology: NetworkTopology }[] = [
  {
    name: 'Simple Rerouting Demo',
    topology: {
      devices: [
        { id: 'pc1', type: 'pc', label: 'PC1', status: 'online', position: { x: 80, y: 250 } },
        { id: 'r1', type: 'router', label: 'R1', status: 'online', position: { x: 280, y: 250 } },
        { id: 'r2', type: 'router', label: 'R2', status: 'online', position: { x: 480, y: 250 } },
        { id: 'r3', type: 'router', label: 'R3', status: 'online', position: { x: 380, y: 120 } },
        { id: 'srv1', type: 'server', label: 'Server1', status: 'online', position: { x: 680, y: 250 } },
      ],
      links: [
        { id: 'l1', source: 'pc1', target: 'r1', cost: 1, bandwidth: 100, delay: 5, enabled: true },
        { id: 'l2', source: 'r1', target: 'r2', cost: 2, bandwidth: 100, delay: 10, enabled: true },
        { id: 'l3', source: 'r1', target: 'r3', cost: 3, bandwidth: 50, delay: 15, enabled: true },
        { id: 'l4', source: 'r3', target: 'r2', cost: 3, bandwidth: 50, delay: 15, enabled: true },
        { id: 'l5', source: 'r2', target: 'srv1', cost: 1, bandwidth: 100, delay: 5, enabled: true },
      ],
    },
  },
  {
    name: 'Ring Network',
    topology: {
      devices: [
        { id: 'r1', type: 'router', label: 'R1', status: 'online', position: { x: 380, y: 80 } },
        { id: 'r2', type: 'router', label: 'R2', status: 'online', position: { x: 600, y: 220 } },
        { id: 'r3', type: 'router', label: 'R3', status: 'online', position: { x: 520, y: 400 } },
        { id: 'r4', type: 'router', label: 'R4', status: 'online', position: { x: 240, y: 400 } },
        { id: 'r5', type: 'router', label: 'R5', status: 'online', position: { x: 160, y: 220 } },
        { id: 'pc1', type: 'pc', label: 'PC1', status: 'online', position: { x: 80, y: 80 } },
        { id: 'srv1', type: 'server', label: 'Server1', status: 'online', position: { x: 680, y: 80 } },
      ],
      links: [
        { id: 'l1', source: 'r1', target: 'r2', cost: 2, bandwidth: 100, delay: 8, enabled: true },
        { id: 'l2', source: 'r2', target: 'r3', cost: 2, bandwidth: 100, delay: 8, enabled: true },
        { id: 'l3', source: 'r3', target: 'r4', cost: 2, bandwidth: 100, delay: 8, enabled: true },
        { id: 'l4', source: 'r4', target: 'r5', cost: 2, bandwidth: 100, delay: 8, enabled: true },
        { id: 'l5', source: 'r5', target: 'r1', cost: 2, bandwidth: 100, delay: 8, enabled: true },
        { id: 'l6', source: 'pc1', target: 'r5', cost: 1, bandwidth: 100, delay: 5, enabled: true },
        { id: 'l7', source: 'r1', target: 'srv1', cost: 1, bandwidth: 100, delay: 5, enabled: true },
      ],
    },
  },
  {
    name: 'Star Topology',
    topology: {
      devices: [
        { id: 'sw1', type: 'switch', label: 'SW1', status: 'online', position: { x: 380, y: 250 } },
        { id: 'pc1', type: 'pc', label: 'PC1', status: 'online', position: { x: 160, y: 100 } },
        { id: 'pc2', type: 'pc', label: 'PC2', status: 'online', position: { x: 600, y: 100 } },
        { id: 'pc3', type: 'pc', label: 'PC3', status: 'online', position: { x: 160, y: 400 } },
        { id: 'srv1', type: 'server', label: 'Server1', status: 'online', position: { x: 600, y: 400 } },
        { id: 'r1', type: 'router', label: 'R1', status: 'online', position: { x: 380, y: 80 } },
      ],
      links: [
        { id: 'l1', source: 'pc1', target: 'sw1', cost: 1, bandwidth: 100, delay: 2, enabled: true },
        { id: 'l2', source: 'pc2', target: 'sw1', cost: 1, bandwidth: 100, delay: 2, enabled: true },
        { id: 'l3', source: 'pc3', target: 'sw1', cost: 1, bandwidth: 100, delay: 2, enabled: true },
        { id: 'l4', source: 'srv1', target: 'sw1', cost: 1, bandwidth: 100, delay: 2, enabled: true },
        { id: 'l5', source: 'r1', target: 'sw1', cost: 1, bandwidth: 100, delay: 2, enabled: true },
      ],
    },
  },
];
