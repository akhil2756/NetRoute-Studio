import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import DeviceNode from '../nodes/DeviceNode';

const nodeTypes = { device: DeviceNode };

export default function NetworkCanvas() {
  const { state, addLink, selectDevice, selectLink, updateDevicePosition } = useApp();
  const { topology, simulation, selectedDeviceId, selectedLinkId } = state;

  const currentPath = useMemo(() => simulation.currentRoute?.path ?? [], [simulation.currentRoute]);
  const activeNodeId = (simulation.status === 'running' || simulation.status === 'paused')
    ? (currentPath[simulation.activePacketNodeIndex] ?? null)
    : null;

  const activeEdgeId = useMemo(() => {
    if (simulation.status !== 'running' && simulation.status !== 'paused') return null;
    const idx = simulation.activePacketNodeIndex;
    if (idx <= 0 || idx >= currentPath.length) return null;
    const from = currentPath[idx - 1];
    const to = currentPath[idx];
    const link = topology.links.find(
      l => (l.source === from && l.target === to) || (l.source === to && l.target === from)
    );
    return link?.id ?? null;
  }, [simulation.status, simulation.activePacketNodeIndex, currentPath, topology.links]);

  const nodes: Node[] = useMemo(() => {
    return topology.devices.map(device => ({
      id: device.id,
      type: 'device',
      position: device.position,
      data: {
        label: device.label,
        deviceType: device.type,
        status: device.status,
        isSource: simulation.sourceId === device.id,
        isDestination: simulation.destinationId === device.id,
        isOnPath: currentPath.includes(device.id),
        isActive: activeNodeId === device.id,
      },
      selected: selectedDeviceId === device.id,
    }));
  }, [topology.devices, simulation.sourceId, simulation.destinationId, currentPath, activeNodeId, selectedDeviceId]);

  const edges: Edge[] = useMemo(() => {
    return topology.links.map(link => {
      const isOnPath =
        currentPath.length > 1 &&
        currentPath.some((nodeId, idx) => {
          if (idx === 0) return false;
          const prev = currentPath[idx - 1];
          return (
            (link.source === prev && link.target === nodeId) ||
            (link.source === nodeId && link.target === prev)
          );
        });

      const isTraversing = link.id === activeEdgeId;
      const isDisabled = !link.enabled;

      const strokeColor = isDisabled
        ? '#ef444466'
        : isTraversing
        ? '#38bdf8'
        : isOnPath
        ? '#6366f1'
        : '#334155';

      return {
        id: link.id,
        source: link.source,
        target: link.target,
        selected: selectedLinkId === link.id,
        animated: isTraversing || (isOnPath && simulation.status === 'running'),
        style: {
          stroke: strokeColor,
          strokeWidth: isTraversing ? 4 : isOnPath ? 3 : 2,
          strokeDasharray: isDisabled ? '5,5' : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 12,
          height: 12,
        },
        label: `cost:${link.cost}`,
        labelStyle: {
          fill: isTraversing ? '#38bdf8' : isOnPath ? '#c7d2fe' : '#64748b',
          fontSize: 10,
          fontWeight: isTraversing || isOnPath ? 700 : 500,
        },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85 },
      };
    });
  }, [topology.links, currentPath, simulation.status, selectedLinkId, activeEdgeId]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach(change => {
      if (change.type === 'position' && change.position && !change.dragging) {
        updateDevicePosition(change.id, change.position);
      }
    });
  }, [updateDevicePosition]);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target && connection.source !== connection.target) {
      addLink(connection.source, connection.target);
    }
  }, [addLink]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectDevice(node.id);
  }, [selectDevice]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    selectLink(edge.id);
  }, [selectLink]);

  const onPaneClick = useCallback(() => {
    selectDevice(null);
    selectLink(null);
  }, [selectDevice, selectLink]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#080c14' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        fitView
        deleteKeyCode="Delete"
        style={{ background: '#080c14' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e293b"
        />
        <Controls
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
          }}
        />
        <MiniMap
          style={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 8,
          }}
          nodeColor="#3b82f6"
          maskColor="rgba(0,0,0,0.7)"
        />
      </ReactFlow>

      {simulation.currentRoute && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 15,
            background: 'rgba(10, 15, 26, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #1e293b',
            borderRadius: 10,
            padding: '7px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {simulation.algorithm === 'dijkstra' ? 'Dijkstra' : 'Distance Vector'}
            </span>
            {simulation.currentRoute.reachable ? (
              <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 700 }}>
                {simulation.currentRoute.path
                  .map(id => topology.devices.find(d => d.id === id)?.label ?? id)
                  .join(' → ')}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 700 }}>
                Unreachable
              </span>
            )}
          </div>

          {simulation.currentRoute.reachable && (
            <>
              <div style={{ width: 1, height: 16, background: '#1e293b' }} />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Cost: <strong style={{ color: '#f1f5f9' }}>{simulation.currentRoute.totalCost}</strong> | Hops:{' '}
                <strong style={{ color: '#f1f5f9' }}>{simulation.currentRoute.path.length - 1}</strong>
              </span>
            </>
          )}

          {(simulation.status === 'running' || simulation.status === 'paused') && (
            <>
              <div style={{ width: 1, height: 16, background: '#1e293b' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: simulation.status === 'running' ? '#22c55e' : '#f59e0b',
                    boxShadow: `0 0 8px ${simulation.status === 'running' ? '#22c55e' : '#f59e0b'}`,
                  }}
                />
                <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>
                  {simulation.status === 'running'
                    ? `Hop ${simulation.activePacketNodeIndex}/${simulation.currentRoute.path.length - 1}`
                    : 'Paused'}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {topology.devices.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌐</div>
          <div style={{ color: '#475569', fontSize: 16, fontWeight: 500 }}>
            Empty network canvas
          </div>
          <div style={{ color: '#334155', fontSize: 13, marginTop: 6 }}>
            Add devices from the toolbar or load an example topology
          </div>
        </div>
      )}
    </div>
  );
}
