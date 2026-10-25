import { Handle, Position } from '@xyflow/react';
import { Monitor, Router, Server, ArrowLeftRight } from 'lucide-react';
import type { DeviceType, DeviceStatus } from '../types/network';

interface DeviceNodeData {
  label: string;
  deviceType: DeviceType;
  status: DeviceStatus;
  isSource: boolean;
  isDestination: boolean;
  isOnPath: boolean;
  isActive: boolean;
}

const ICONS: Record<DeviceType, React.ComponentType<{ size?: number; color?: string }>> = {
  pc: Monitor,
  router: Router,
  switch: ArrowLeftRight,
  server: Server,
};

const TYPE_COLORS: Record<DeviceType, string> = {
  pc: '#3b82f6',
  router: '#8b5cf6',
  switch: '#06b6d4',
  server: '#10b981',
};

const TYPE_LABELS: Record<DeviceType, string> = {
  pc: 'PC',
  router: 'Router',
  switch: 'Switch',
  server: 'Server',
};

export default function DeviceNode({ data }: { data: DeviceNodeData }) {
  const { label, deviceType, status, isSource, isDestination, isOnPath, isActive } = data;
  const Icon = ICONS[deviceType];
  const color = TYPE_COLORS[deviceType];

  const isOffline = status === 'offline';

  let borderColor = '#334155';
  if (isOffline) borderColor = '#ef4444';
  else if (isActive) borderColor = '#38bdf8';
  else if (isSource) borderColor = '#22c55e';
  else if (isDestination) borderColor = '#f59e0b';
  else if (isOnPath) borderColor = color;

  const bgOpacity = isOffline ? 0.4 : 1;

  return (
    <div
      style={{
        opacity: bgOpacity,
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        minWidth: '90px',
        padding: '10px 12px',
        boxShadow: isActive
          ? '0 0 24px rgba(56, 189, 248, 0.75), 0 4px 12px rgba(0,0,0,0.5)'
          : isOnPath
          ? `0 0 16px ${borderColor}66, 0 4px 12px rgba(0,0,0,0.5)`
          : '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#475569', width: 8, height: 8, border: '1px solid #64748b' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#475569', width: 8, height: 8, border: '1px solid #64748b' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: '#475569', width: 8, height: 8, border: '1px solid #64748b' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: '#475569', width: 8, height: 8, border: '1px solid #64748b' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: `${color}22`,
            border: `1px solid ${color}44`,
          }}
        >
          <Icon size={20} color={color} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>
            {label}
          </div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: 2 }}>
            {TYPE_LABELS[deviceType]}
          </div>
        </div>

        {(isSource || isDestination || isOffline) && (
          <div
            style={{
              fontSize: '9px',
              padding: '1px 6px',
              borderRadius: '4px',
              background: isOffline ? '#ef444422' : isSource ? '#22c55e22' : '#f59e0b22',
              color: isOffline ? '#ef4444' : isSource ? '#22c55e' : '#f59e0b',
              border: `1px solid ${isOffline ? '#ef4444' : isSource ? '#22c55e' : '#f59e0b'}44`,
              fontWeight: 600,
            }}
          >
            {isOffline ? 'OFFLINE' : isSource ? 'SRC' : 'DST'}
          </div>
        )}

        {isActive && !isOffline && (
          <div
            style={{
              position: 'absolute',
              top: -11,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '1px 8px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              color: '#ffffff',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.9)',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span>📦</span>
            <span>PACKET</span>
          </div>
        )}

        {isActive && !isOffline && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#38bdf822',
              border: '1px solid #38bdf888',
              borderRadius: 4,
              padding: '1px 6px',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 8px #38bdf8',
              }}
            />
            <span style={{ fontSize: 8, color: '#38bdf8', fontWeight: 800 }}>ACTIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
