import { ReactFlowProvider } from '@xyflow/react';
import { AppProvider, useApp } from './store/AppContext';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import NetworkCanvas from './components/NetworkCanvas';
import DeviceInspector from './components/DeviceInspector';
import SimulationPanel from './components/SimulationPanel';
import RoutingTableView from './components/RoutingTableView';
import AnalyticsView from './components/AnalyticsView';
import SavedTopologiesView from './components/SavedTopologiesView';
import HelpView from './components/HelpView';

function AppInner() {
  const { state } = useApp();
  const { activeView } = state;

  const isCanvas = activeView === 'canvas';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#080c14', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div
          style={{
            padding: '10px 20px',
            background: '#0a0f1a',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 800, letterSpacing: '-0.3px' }}>
            NetRoute Studio
          </span>
          <span style={{ color: '#334155', fontSize: 11 }}>|</span>
          <span style={{ color: '#475569', fontSize: 12 }}>
            Internet Routing Simulator
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#1e293b', color: '#475569' }}>
            v1.0.0
          </span>
        </div>

        {isCanvas && <Toolbar />}

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {activeView === 'canvas' && <NetworkCanvas />}
            {activeView === 'routing' && <RoutingTableView />}
            {activeView === 'analytics' && <AnalyticsView />}
            {activeView === 'saved' && <SavedTopologiesView />}
            {activeView === 'help' && <HelpView />}
          </div>

          {isCanvas && <DeviceInspector />}
        </div>

        {isCanvas && <SimulationPanel />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ReactFlowProvider>
        <AppInner />
      </ReactFlowProvider>
    </AppProvider>
  );
}
