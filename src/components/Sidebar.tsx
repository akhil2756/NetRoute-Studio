import {
  Network,
  Table2,
  BarChart3,
  FolderOpen,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useApp } from '../store/AppContext';

type ViewItem = {
  id: 'canvas' | 'routing' | 'analytics' | 'saved' | 'help';
  icon: React.ComponentType<{ size?: number }>;
  label: string;
};

const VIEWS: ViewItem[] = [
  { id: 'canvas', icon: Network, label: 'Canvas' },
  { id: 'routing', icon: Table2, label: 'Routing' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'saved', icon: FolderOpen, label: 'Saved' },
  { id: 'help', icon: HelpCircle, label: 'Help' },
];

export default function Sidebar() {
  const { state, setView } = useApp();
  const { activeView } = state;

  return (
    <div
      style={{
        width: 64,
        background: '#0a0f1a',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 12,
        gap: 4,
        flexShrink: 0,
      }}
    >
      <div style={{ marginBottom: 16, padding: '8px 0' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Zap size={20} color="white" />
        </div>
      </div>

      {VIEWS.map(({ id, icon: Icon, label }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            id={`nav-${id}`}
            onClick={() => setView(id)}
            title={label}
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              borderRadius: 10,
              border: 'none',
              background: isActive ? '#1e293b' : 'transparent',
              color: isActive ? '#6366f1' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontSize: 9,
              fontWeight: 600,
            }}
            onMouseEnter={e => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#1e293b88';
            }}
            onMouseLeave={e => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
