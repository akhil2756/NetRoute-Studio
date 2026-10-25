import { useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { computeDistanceVector, buildRoutingTables } from '../algorithms/distanceVector';
import { dijkstra } from '../algorithms/dijkstra';

export default function RoutingTableView() {
  const { state } = useApp();
  const { topology, simulation } = state;

  const routingTables = useMemo(() => {
    if (topology.devices.length === 0) return [];
    const dvTables = computeDistanceVector(topology);
    return buildRoutingTables(topology, dvTables);
  }, [topology]);

  const dijkstraRoutes = useMemo(() => {
    if (!simulation.sourceId) return null;
    return topology.devices.map(d => ({
      device: d,
      result: dijkstra(topology, simulation.sourceId!, d.id),
    })).filter(r => r.device.id !== simulation.sourceId);
  }, [topology, simulation.sourceId]);

  if (topology.devices.length === 0) {
    return (
      <EmptyState message="Add devices to see routing tables" />
    );
  }

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
          Routing Tables
        </h2>
        <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>
          Distance-vector routing tables computed from current topology. Shows learned routes for all active devices.
        </p>
      </div>

      {simulation.sourceId && dijkstraRoutes && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Dijkstra Routes from {topology.devices.find(d => d.id === simulation.sourceId)?.label}
          </div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Destination</th>
                <th style={thStyle}>Total Cost</th>
                <th style={thStyle}>Hops</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {dijkstraRoutes.map(({ device, result }) => (
                <tr key={device.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={tdStyle}>{device.label}</td>
                  <td style={tdStyle}>{result.reachable ? result.totalCost : '∞'}</td>
                  <td style={tdStyle}>{result.reachable ? result.path.length - 1 : '-'}</td>
                  <td style={tdStyle}>
                    <span style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: result.reachable ? '#22c55e18' : '#ef444418',
                      color: result.reachable ? '#22c55e' : '#ef4444',
                      fontWeight: 600,
                    }}>
                      {result.reachable ? 'Reachable' : 'Unreachable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        Distance-Vector Tables (all routers)
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {routingTables.map(table => (
          <div key={table.routerId} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '8px 14px', background: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
              <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700 }}>{table.routerLabel}</span>
              <span style={{ color: '#475569', fontSize: 11, marginLeft: 'auto' }}>
                {table.entries.length} route{table.entries.length !== 1 ? 's' : ''}
              </span>
            </div>
            {table.entries.length === 0 ? (
              <div style={{ padding: 12, color: '#334155', fontSize: 12 }}>No routes learned.</div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Destination</th>
                    <th style={thStyle}>Next Hop</th>
                    <th style={thStyle}>Metric</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {table.entries.map(entry => (
                    <tr key={entry.destination} style={{ borderBottom: '1px solid #0f172a' }}>
                      <td style={tdStyle}>{entry.destinationLabel}</td>
                      <td style={tdStyle}>{entry.nextHopLabel}</td>
                      <td style={tdStyle}>{entry.metric}</td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: entry.status === 'active' ? '#22c55e18' : '#ef444418',
                          color: entry.status === 'active' ? '#22c55e' : '#ef4444',
                          fontWeight: 600,
                        }}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ color: '#334155', fontSize: 14, textAlign: 'center' }}>{message}</div>
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
};

const thStyle: React.CSSProperties = {
  padding: '6px 14px',
  textAlign: 'left',
  color: '#475569',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.8,
  background: '#0f172a',
  borderBottom: '1px solid #1e293b',
};

const tdStyle: React.CSSProperties = {
  padding: '7px 14px',
  color: '#94a3b8',
  background: '#0a0f1a',
};
