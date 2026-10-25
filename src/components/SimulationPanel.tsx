import { Play, Pause, RotateCcw, CheckCircle, XCircle, AlertTriangle, Cpu, Sigma } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { AlgorithmType } from '../types/network';

export default function SimulationPanel() {
  const { state, startSimulation, pauseSimulation, resumeSimulation, resetSimulation, setAlgorithm, setSource, setDestination } = useApp();
  const { simulation, topology } = state;

  const { status, sourceId, destinationId, algorithm, currentRoute, metrics } = simulation;

  const sourceDevice = topology.devices.find(d => d.id === sourceId);
  const destDevice = topology.devices.find(d => d.id === destinationId);

  const canStart = sourceId && destinationId && sourceId !== destinationId && status !== 'running';

  const ALGORITHMS: { id: AlgorithmType; label: string }[] = [
    { id: 'dijkstra', label: "Dijkstra's SPF" },
    { id: 'distance-vector', label: 'Distance Vector' },
  ];

  return (
    <div
      style={{
        background: '#0a0f1a',
        borderTop: '1px solid #1e293b',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        minHeight: 60,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Algorithm</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {ALGORITHMS.map(({ id, label }) => (
            <button
              key={id}
              id={`algo-${id}-btn`}
              onClick={() => setAlgorithm(id)}
              disabled={status === 'running'}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${algorithm === id ? '#6366f1' : '#1e293b'}`,
                background: algorithm === id ? '#6366f118' : 'transparent',
                color: algorithm === id ? '#818cf8' : '#475569',
                fontSize: 11,
                fontWeight: 600,
                cursor: status === 'running' ? 'not-allowed' : 'pointer',
                opacity: status === 'running' ? 0.6 : 1,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: 1, height: 24, background: '#1e293b' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Sigma size={13} color="#475569" />
        <span style={{ color: '#475569', fontSize: 11 }}>
          {sourceDevice ? (
            <span style={{ color: '#22c55e', fontWeight: 600 }}>{sourceDevice.label}</span>
          ) : (
            <span style={{ color: '#334155' }}>No source</span>
          )}
          {' → '}
          {destDevice ? (
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{destDevice.label}</span>
          ) : (
            <span style={{ color: '#334155' }}>No destination</span>
          )}
        </span>
        {(sourceId || destinationId) && (
          <button
            id="clear-endpoints-btn"
            onClick={() => { setSource(null); setDestination(null); }}
            style={{ fontSize: 10, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
          >
            ✕
          </button>
        )}
      </div>

      {currentRoute && (
        <>
          <div style={{ width: 1, height: 24, background: '#1e293b' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {currentRoute.reachable ? (
              <CheckCircle size={13} color="#22c55e" />
            ) : (
              <XCircle size={13} color="#ef4444" />
            )}
            <span style={{ fontSize: 11, color: currentRoute.reachable ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
              {currentRoute.reachable
                ? `Cost: ${currentRoute.totalCost} | Hops: ${currentRoute.path.length - 1}`
                : 'Unreachable'}
            </span>
          </div>
        </>
      )}

      {status === 'completed' && currentRoute?.reachable === false && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={13} color="#f59e0b" />
          <span style={{ fontSize: 11, color: '#f59e0b' }}>No path found</span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#334155', fontSize: 10 }}>
          <Cpu size={10} style={{ display: 'inline', marginRight: 3 }} />
          Sent:{' '}
          <span style={{ color: '#64748b' }}>{metrics.packetsSent}</span>
          {' · '}
          Delivered:{' '}
          <span style={{ color: '#22c55e' }}>{metrics.packetsDelivered}</span>
          {' · '}
          Dropped:{' '}
          <span style={{ color: '#ef4444' }}>{metrics.packetsDropped}</span>
          {' · '}
          Rate:{' '}
          <span style={{ color: '#f59e0b' }}>{metrics.deliveryRate.toFixed(0)}%</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {(status === 'idle' || status === 'completed' || status === 'failed') && (
          <button
            id="start-sim-btn"
            onClick={startSimulation}
            disabled={!canStart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              background: canStart ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1e293b',
              color: canStart ? 'white' : '#334155',
              fontSize: 12,
              fontWeight: 600,
              cursor: canStart ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            <Play size={13} />
            Run
          </button>
        )}

        {status === 'running' && (
          <button
            id="pause-sim-btn"
            onClick={pauseSimulation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 6,
              border: '1px solid #f59e0b44',
              background: '#f59e0b18',
              color: '#f59e0b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Pause size={13} />
            Pause
          </button>
        )}

        {status === 'paused' && (
          <button
            id="resume-sim-btn"
            onClick={resumeSimulation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 6,
              border: '1px solid #22c55e44',
              background: '#22c55e18',
              color: '#22c55e',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Play size={13} />
            Resume
          </button>
        )}

        <button
          id="reset-sim-btn"
          onClick={resetSimulation}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #1e293b',
            background: 'transparent',
            color: '#475569',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>
    </div>
  );
}
