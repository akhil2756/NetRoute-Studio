import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../store/AppContext';

export default function AnalyticsView() {
  const { state } = useApp();
  const { simulation } = state;
  const { metrics, events } = simulation;

  const recentEvents = events.slice(-50).reverse();


  const metricsData = [
    { name: 'Delivery Rate', value: parseFloat(metrics.deliveryRate.toFixed(1)), unit: '%', color: '#6366f1' },
    { name: 'Avg Latency', value: parseFloat(metrics.avgLatency.toFixed(1)), unit: 'ms', color: '#f59e0b' },
    { name: 'Avg Hops', value: parseFloat(metrics.avgHopCount.toFixed(2)), unit: 'hops', color: '#8b5cf6' },
  ];

  const eventTypeColors: Record<string, string> = {
    'route-calculated': '#6366f1',
    'packet-sent': '#22c55e',
    'packet-forwarded': '#38bdf8',
    'packet-delivered': '#22c55e',
    'packet-dropped': '#ef4444',
    'link-failed': '#f59e0b',
    'router-failed': '#f59e0b',
    'reroute': '#a78bfa',
    'unreachable': '#ef4444',
    'info': '#64748b',
  };

  const historyData = (() => {
    const deliveredCount = metrics.packetsDelivered;
    const droppedCount = metrics.packetsDropped;
    if (metrics.packetsSent === 0) return [];
    return [
      { label: 'Sent', value: metrics.packetsSent },
      { label: 'Delivered', value: deliveredCount },
      { label: 'Dropped', value: droppedCount },
    ];
  })();

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
          Analytics
        </h2>
        <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>
          Simulated metrics — not real network measurements. Run simulations to populate data.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <MetricCard label="Packets Sent" value={metrics.packetsSent} unit="" color="#64748b" />
        <MetricCard label="Delivered" value={metrics.packetsDelivered} unit="" color="#22c55e" />
        <MetricCard label="Dropped" value={metrics.packetsDropped} unit="" color="#ef4444" />
        <MetricCard label="Delivery Rate" value={metrics.deliveryRate.toFixed(1)} unit="%" color="#6366f1" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <ChartCard title="Packet Outcomes">
          {metrics.packetsSent > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={historyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataPlaceholder />
          )}
        </ChartCard>

        <ChartCard title="Performance Metrics (simulated)">
          {metrics.packetsSent > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
              {metricsData.map(({ name, value, unit, color }) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{name}</span>
                    <span style={{ color, fontWeight: 700, fontSize: 12 }}>{value}{unit}</span>
                  </div>
                  <div style={{ height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: color,
                        borderRadius: 2,
                        width: name === 'Delivery Rate'
                          ? `${Math.min(value, 100)}%`
                          : `${Math.min((value / 20) * 100, 100)}%`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NoDataPlaceholder />
          )}
        </ChartCard>
      </div>

      <div>
        <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Event Log ({events.length} events)
        </div>

        {recentEvents.length === 0 ? (
          <div style={{ color: '#334155', fontSize: 13, padding: 16, textAlign: 'center' }}>
            No simulation events yet. Run a simulation to generate events.
          </div>
        ) : (
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 10,
              overflow: 'hidden',
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            {recentEvents.map(event => (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '7px 14px',
                  borderBottom: '1px solid #0f172a',
                  background: '#0a0f1a',
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: eventTypeColors[event.type] ?? '#64748b',
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
                <div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{event.message}</div>
                  <div style={{ color: '#334155', fontSize: 10, marginTop: 2 }}>
                    {new Date(event.timestamp).toLocaleTimeString()} ·{' '}
                    <span style={{ color: eventTypeColors[event.type] ?? '#64748b', fontWeight: 600 }}>
                      {event.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, color }: { label: string; value: number | string; unit: string; color: string }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      <div style={{ color, fontSize: 24, fontWeight: 800, marginTop: 4 }}>
        {value}<span style={{ fontSize: 13, marginLeft: 2, fontWeight: 400, color: '#475569' }}>{unit}</span>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
      <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function NoDataPlaceholder() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: '#334155', fontSize: 12 }}>
      Run a simulation to see data
    </div>
  );
}
