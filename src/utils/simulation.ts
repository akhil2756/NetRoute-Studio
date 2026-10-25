import type { NetworkTopology, SimulationEvent, RouteResult, AlgorithmType } from '../types/network';
import { dijkstra } from '../algorithms/dijkstra';
import { distanceVectorRoute } from '../algorithms/distanceVector';
import { estimateLatency } from './analytics';

let eventCounter = 0;

function createEvent(
  type: SimulationEvent['type'],
  message: string,
  deviceId?: string,
  linkId?: string
): SimulationEvent {
  return {
    id: `evt-${++eventCounter}-${Date.now()}`,
    timestamp: Date.now(),
    type,
    message,
    deviceId,
    linkId,
  };
}

export function calculateRoute(
  topology: NetworkTopology,
  sourceId: string,
  destinationId: string,
  algorithm: AlgorithmType
): { route: RouteResult; events: SimulationEvent[] } {
  const events: SimulationEvent[] = [];

  const sourceDevice = topology.devices.find(d => d.id === sourceId);
  const destDevice = topology.devices.find(d => d.id === destinationId);

  if (!sourceDevice || !destDevice) {
    events.push(createEvent('unreachable', 'Source or destination device not found.'));
    return { route: { path: [], totalCost: Infinity, reachable: false, algorithm }, events };
  }

  if (sourceDevice.status === 'offline') {
    events.push(createEvent('unreachable', `Source device ${sourceDevice.label} is offline.`, sourceId));
    return { route: { path: [], totalCost: Infinity, reachable: false, algorithm }, events };
  }

  if (destDevice.status === 'offline') {
    events.push(createEvent('unreachable', `Destination device ${destDevice.label} is offline.`, destinationId));
    return { route: { path: [], totalCost: Infinity, reachable: false, algorithm }, events };
  }

  events.push(
    createEvent(
      'route-calculated',
      `Calculating ${algorithm === 'dijkstra' ? "Dijkstra's" : 'Distance Vector'} route from ${sourceDevice.label} to ${destDevice.label}...`
    )
  );

  const route =
    algorithm === 'dijkstra'
      ? dijkstra(topology, sourceId, destinationId)
      : distanceVectorRoute(topology, sourceId, destinationId);

  if (!route.reachable) {
    events.push(
      createEvent(
        'unreachable',
        `No route found from ${sourceDevice.label} to ${destDevice.label}. Destination is unreachable.`
      )
    );
  } else {
    const pathLabels = route.path
      .map(id => topology.devices.find(d => d.id === id)?.label ?? id)
      .join(' → ');
    events.push(
      createEvent(
        'route-calculated',
        `Route found: ${pathLabels} | Cost: ${route.totalCost} | Hops: ${route.path.length - 1}`
      )
    );
  }

  return { route, events };
}

export function simulatePacketEvents(
  topology: NetworkTopology,
  route: RouteResult
): SimulationEvent[] {
  const events: SimulationEvent[] = [];

  if (!route.reachable || route.path.length === 0) {
    events.push(createEvent('packet-dropped', 'Packet dropped: no valid route.'));
    return events;
  }

  const latency = estimateLatency(topology, route.path);

  events.push(createEvent('packet-sent', `Packet sent from ${topology.devices.find(d => d.id === route.path[0])?.label}.`, route.path[0]));

  for (let i = 1; i < route.path.length - 1; i++) {
    const deviceLabel = topology.devices.find(d => d.id === route.path[i])?.label ?? route.path[i];
    events.push(createEvent('packet-forwarded', `Packet forwarded through ${deviceLabel}.`, route.path[i]));
  }

  const destLabel = topology.devices.find(d => d.id === route.path[route.path.length - 1])?.label;
  events.push(
    createEvent(
      'packet-delivered',
      `Packet delivered to ${destLabel}. Simulated latency: ${latency}ms.`,
      route.path[route.path.length - 1]
    )
  );

  return events;
}
