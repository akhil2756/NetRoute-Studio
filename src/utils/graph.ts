import type { NetworkTopology, NetworkLink, NetworkDevice } from '../types/network';

export function buildAdjacencyMap(topology: NetworkTopology): Map<string, { neighborId: string; link: NetworkLink }[]> {
  const adj = new Map<string, { neighborId: string; link: NetworkLink }[]>();

  for (const device of topology.devices) {
    adj.set(device.id, []);
  }

  for (const link of topology.links) {
    if (!link.enabled) continue;

    const src = topology.devices.find(d => d.id === link.source);
    const tgt = topology.devices.find(d => d.id === link.target);
    if (!src || !tgt) continue;
    if (src.status === 'offline' || tgt.status === 'offline') continue;

    adj.get(link.source)?.push({ neighborId: link.target, link });
    adj.get(link.target)?.push({ neighborId: link.source, link });
  }

  return adj;
}

export function getActiveDevices(topology: NetworkTopology): NetworkDevice[] {
  return topology.devices.filter(d => d.status === 'online');
}

export function getLinkById(topology: NetworkTopology, linkId: string): NetworkLink | undefined {
  return topology.links.find(l => l.id === linkId);
}

export function getDeviceById(topology: NetworkTopology, deviceId: string): NetworkDevice | undefined {
  return topology.devices.find(d => d.id === deviceId);
}

export function validateTopology(topology: NetworkTopology): string[] {
  const errors: string[] = [];
  const deviceIds = new Set(topology.devices.map(d => d.id));

  for (const link of topology.links) {
    if (!deviceIds.has(link.source)) {
      errors.push(`Link ${link.id} references unknown source device ${link.source}`);
    }
    if (!deviceIds.has(link.target)) {
      errors.push(`Link ${link.id} references unknown target device ${link.target}`);
    }
    if (link.cost < 0) {
      errors.push(`Link ${link.id} has negative cost ${link.cost}`);
    }
  }

  const labels = topology.devices.map(d => d.label);
  const labelSet = new Set(labels);
  if (labelSet.size !== labels.length) {
    errors.push('Duplicate device labels found');
  }

  return errors;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
