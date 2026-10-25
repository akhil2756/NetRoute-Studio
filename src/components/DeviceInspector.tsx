import { useState } from 'react';
import { Edit3, Check, X, Wifi, WifiOff, Sliders } from 'lucide-react';
import { useApp } from '../store/AppContext';

export default function DeviceInspector() {
  const { state, updateDevice, updateLink, setSource, setDestination } = useApp();
  const { selectedDeviceId, selectedLinkId, topology, simulation } = state;

  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');

  const device = topology.devices.find(d => d.id === selectedDeviceId);
  const link = topology.links.find(l => l.id === selectedLinkId);

  if (!device && !link) {
    return (
      <div
        style={{
          width: 240,
          background: '#0a0f1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          flexShrink: 0,
        }}
      >
        <Sliders size={32} color="#1e293b" style={{ marginBottom: 12 }} />
        <div style={{ color: '#334155', fontSize: 13, textAlign: 'center' }}>
          Select a device or link to inspect and edit its properties
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 240,
        background: '#0a0f1a',
        borderLeft: '1px solid #1e293b',
        padding: 16,
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
        {device ? 'Device Properties' : 'Link Properties'}
      </div>

      {device && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Label">
            {editingLabel ? (
              <div style={{ display: 'flex', gap: 4 }}>
                <input
                  id="device-label-input"
                  value={labelDraft}
                  onChange={e => setLabelDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      if (labelDraft.trim()) updateDevice(device.id, { label: labelDraft.trim() });
                      setEditingLabel(false);
                    }
                    if (e.key === 'Escape') setEditingLabel(false);
                  }}
                  autoFocus
                  style={inputStyle}
                />
                <button
                  onClick={() => {
                    if (labelDraft.trim()) updateDevice(device.id, { label: labelDraft.trim() });
                    setEditingLabel(false);
                  }}
                  style={iconBtnStyle}
                >
                  <Check size={12} />
                </button>
                <button onClick={() => setEditingLabel(false)} style={iconBtnStyle}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{device.label}</span>
                <button
                  id="edit-label-btn"
                  onClick={() => { setLabelDraft(device.label); setEditingLabel(true); }}
                  style={{ ...iconBtnStyle, color: '#475569' }}
                >
                  <Edit3 size={12} />
                </button>
              </div>
            )}
          </Field>

          <Field label="Type">
            <span style={{ color: '#94a3b8', fontSize: 13, textTransform: 'capitalize' }}>{device.type}</span>
          </Field>

          <Field label="Status">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {device.status === 'online'
                ? <Wifi size={13} color="#22c55e" />
                : <WifiOff size={13} color="#ef4444" />}
              <span style={{ color: device.status === 'online' ? '#22c55e' : '#ef4444', fontSize: 13, fontWeight: 600 }}>
                {device.status}
              </span>
            </div>
          </Field>

          <Field label="IP Address">
            <input
              id="device-ip-input"
              value={device.ip ?? ''}
              onChange={e => updateDevice(device.id, { ip: e.target.value })}
              placeholder="e.g. 192.168.1.1"
              style={inputStyle}
            />
          </Field>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Simulation Role
            </div>
            <button
              id="set-source-btn"
              onClick={() => setSource(simulation.sourceId === device.id ? null : device.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: `1px solid ${simulation.sourceId === device.id ? '#22c55e' : '#1e293b'}`,
                background: simulation.sourceId === device.id ? '#22c55e18' : 'transparent',
                color: simulation.sourceId === device.id ? '#22c55e' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {simulation.sourceId === device.id ? '✓ Source' : 'Set as Source'}
            </button>
            <button
              id="set-destination-btn"
              onClick={() => setDestination(simulation.destinationId === device.id ? null : device.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: `1px solid ${simulation.destinationId === device.id ? '#f59e0b' : '#1e293b'}`,
                background: simulation.destinationId === device.id ? '#f59e0b18' : 'transparent',
                color: simulation.destinationId === device.id ? '#f59e0b' : '#64748b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {simulation.destinationId === device.id ? '✓ Destination' : 'Set as Destination'}
            </button>
          </div>
        </div>
      )}

      {link && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Status">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {link.enabled
                ? <Wifi size={13} color="#22c55e" />
                : <WifiOff size={13} color="#ef4444" />}
              <span style={{ color: link.enabled ? '#22c55e' : '#ef4444', fontSize: 13, fontWeight: 600 }}>
                {link.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </Field>

          <Field label="Cost">
            <input
              id="link-cost-input"
              type="number"
              min={1}
              max={999}
              value={link.cost}
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                if (v > 0) updateLink(link.id, { cost: v });
              }}
              style={inputStyle}
            />
          </Field>

          <Field label="Bandwidth (Mbps)">
            <input
              id="link-bandwidth-input"
              type="number"
              min={1}
              value={link.bandwidth}
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                if (v > 0) updateLink(link.id, { bandwidth: v });
              }}
              style={inputStyle}
            />
          </Field>

          <Field label="Delay (ms)">
            <input
              id="link-delay-input"
              type="number"
              min={0}
              value={link.delay}
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                if (v >= 0) updateLink(link.id, { delay: v });
              }}
              style={inputStyle}
            />
          </Field>

          <div style={{ color: '#475569', fontSize: 11 }}>
            {topology.devices.find(d => d.id === link.source)?.label ?? link.source}
            {' ↔ '}
            {topology.devices.find(d => d.id === link.target)?.label ?? link.target}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: '#475569', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 6,
  color: '#e2e8f0',
  fontSize: 12,
  outline: 'none',
  boxSizing: 'border-box',
};

const iconBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: 4,
  border: '1px solid #334155',
  background: '#1e293b',
  color: '#94a3b8',
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
};
