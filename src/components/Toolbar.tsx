import { Monitor, Router, ArrowLeftRight, Server, Trash2, Power, WifiOff, FolderOpen, RotateCcw } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { EXAMPLE_TOPOLOGIES } from '../data/examples';
import type { DeviceType } from '../types/network';

const DEVICE_BUTTONS: { type: DeviceType; icon: React.ComponentType<{ size?: number }>; label: string; color: string }[] = [
  { type: 'pc', icon: Monitor, label: 'PC', color: '#3b82f6' },
  { type: 'router', icon: Router, label: 'Router', color: '#8b5cf6' },
  { type: 'switch', icon: ArrowLeftRight, label: 'Switch', color: '#06b6d4' },
  { type: 'server', icon: Server, label: 'Server', color: '#10b981' },
];

export default function Toolbar() {
  const { state, addDevice, deleteDevice, updateDevice, deleteLink, updateLink, setTopology, setSource, setDestination } = useApp();
  const { selectedDeviceId, selectedLinkId, topology } = state;

  const selectedDevice = topology.devices.find(d => d.id === selectedDeviceId);
  const selectedLink = topology.links.find(l => l.id === selectedLinkId);

  const handleAddDevice = (type: DeviceType) => {
    const count = topology.devices.length;
    const x = 160 + (count % 5) * 130;
    const y = 140 + Math.floor(count / 5) * 110;
    addDevice(type, { x, y });
  };

  const handleLoadPreset = (index: number) => {
    const preset = EXAMPLE_TOPOLOGIES[index];
    if (!preset) return;
    setTopology(preset.topology);
    if (index === 0) {
      setSource('pc1');
      setDestination('srv1');
    } else if (index === 1) {
      setSource('pc1');
      setDestination('srv1');
    } else if (index === 2) {
      setSource('pc1');
      setDestination('srv1');
    }
  };

  const handleClear = () => {
    setTopology({ devices: [], links: [] });
    setSource(null);
    setDestination(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginRight: 4 }}>
        Add Device
      </span>

      {DEVICE_BUTTONS.map(({ type, icon: Icon, label, color }) => (
        <button
          key={type}
          id={`add-${type}-btn`}
          onClick={() => handleAddDevice(type)}
          title={`Add ${label}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            background: `${color}18`,
            border: `1px solid ${color}44`,
            borderRadius: 6,
            color,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${color}30`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = `${color}18`;
          }}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}

      <div style={{ width: 1, height: 20, background: '#1e293b', margin: '0 4px' }} />

      <span style={{ color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginRight: 2 }}>
        Presets
      </span>

      <button
        id="preset-reroute-btn"
        onClick={() => handleLoadPreset(0)}
        title="Load Rerouting Demo Topology"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 10px',
          background: '#6366f118',
          border: '1px solid #6366f144',
          borderRadius: 6,
          color: '#818cf8',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <FolderOpen size={13} />
        Reroute Demo
      </button>

      <button
        id="preset-ring-btn"
        onClick={() => handleLoadPreset(1)}
        title="Load Ring Network Topology"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 10px',
          background: '#0ea5e918',
          border: '1px solid #0ea5e944',
          borderRadius: 6,
          color: '#38bdf8',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <FolderOpen size={13} />
        Ring
      </button>

      <button
        id="clear-canvas-btn"
        onClick={handleClear}
        title="Clear entire network topology"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 10px',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 6,
          color: '#64748b',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <RotateCcw size={13} />
        Clear
      </button>

      <div style={{ flex: 1 }} />

      {selectedDevice && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#64748b', fontSize: 11 }}>Selected: {selectedDevice.label}</span>
          <button
            id="toggle-device-status-btn"
            onClick={() =>
              updateDevice(selectedDevice.id, {
                status: selectedDevice.status === 'online' ? 'offline' : 'online',
              })
            }
            title={selectedDevice.status === 'online' ? 'Set Offline' : 'Set Online'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              background: selectedDevice.status === 'online' ? '#ef444418' : '#22c55e18',
              border: `1px solid ${selectedDevice.status === 'online' ? '#ef444444' : '#22c55e44'}`,
              borderRadius: 6,
              color: selectedDevice.status === 'online' ? '#ef4444' : '#22c55e',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {selectedDevice.status === 'online' ? <WifiOff size={12} /> : <Power size={12} />}
            {selectedDevice.status === 'online' ? 'Offline' : 'Online'}
          </button>
          <button
            id="delete-device-btn"
            onClick={() => deleteDevice(selectedDevice.id)}
            title="Delete Device"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              background: '#ef444418',
              border: '1px solid #ef444444',
              borderRadius: 6,
              color: '#ef4444',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )}

      {selectedLink && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#64748b', fontSize: 11 }}>
            Link: cost={selectedLink.cost}
          </span>
          <button
            id="toggle-link-btn"
            onClick={() => updateLink(selectedLink.id, { enabled: !selectedLink.enabled })}
            title={selectedLink.enabled ? 'Disable Link' : 'Enable Link'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              background: selectedLink.enabled ? '#ef444418' : '#22c55e18',
              border: `1px solid ${selectedLink.enabled ? '#ef444444' : '#22c55e44'}`,
              borderRadius: 6,
              color: selectedLink.enabled ? '#ef4444' : '#22c55e',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <WifiOff size={12} />
            {selectedLink.enabled ? 'Disable' : 'Enable'}
          </button>
          <button
            id="delete-link-btn"
            onClick={() => deleteLink(selectedLink.id)}
            title="Delete Link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              background: '#ef444418',
              border: '1px solid #ef444444',
              borderRadius: 6,
              color: '#ef4444',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
