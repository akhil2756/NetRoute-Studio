import { BookOpen, Zap, Network, Activity, Save, Route } from 'lucide-react';

export default function HelpView() {
  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%', boxSizing: 'border-box', maxWidth: 760 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
          </div>
          <h2 style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 800, margin: 0 }}>NetRoute Studio</h2>
        </div>
        <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.7 }}>
          An interactive browser-based Internet routing simulator for learning how packets travel through networks and how routing decisions are made. This is a software simulation — no real packets are transmitted.
        </p>
      </div>

      <Section icon={<Network size={16} color="#6366f1" />} title="Building a Network Topology">
        <ul style={listStyle}>
          <li>Click <strong>PC</strong>, <strong>Router</strong>, <strong>Switch</strong>, or <strong>Server</strong> in the top toolbar to add devices to the canvas.</li>
          <li>Drag devices to reposition them on the canvas.</li>
          <li>Connect two devices by dragging from one device's handle (small circle on the edge) to another device.</li>
          <li>Click a device to select it, then use the right-side inspector to rename it, change its IP, or set it as a source/destination.</li>
          <li>Click a link (edge) to select it, then edit cost, bandwidth, delay, or enable/disable it in the inspector.</li>
          <li>Press <kbd style={kbdStyle}>Delete</kbd> after selecting a device or link, or use the toolbar buttons, to remove it.</li>
        </ul>
      </Section>

      <Section icon={<Route size={16} color="#8b5cf6" />} title="Routing Algorithms">
        <ul style={listStyle}>
          <li><strong>Dijkstra's SPF:</strong> Finds the minimum-cost path from source to destination. Uses non-negative link costs. Disabled links and offline routers are excluded.</li>
          <li><strong>Distance Vector:</strong> An educational simplified distance-vector algorithm. Routers learn routes by exchanging distance information with neighbours. Iterates until convergence (max 16 metric = unreachable). This is a simplified educational model, not a complete RIP implementation.</li>
          <li>Select the algorithm from the bottom panel before running a simulation.</li>
        </ul>
      </Section>

      <Section icon={<Zap size={16} color="#22c55e" />} title="Running a Simulation">
        <ol style={listStyle}>
          <li>Select a <strong style={{ color: '#22c55e' }}>source device</strong> using the inspector or right-click → Set as Source.</li>
          <li>Select a <strong style={{ color: '#f59e0b' }}>destination device</strong> using the inspector.</li>
          <li>Choose an algorithm (Dijkstra or Distance Vector) in the bottom panel.</li>
          <li>Click <strong>Run</strong>. The simulator calculates a route and animates a packet along the path.</li>
          <li>Use <strong>Pause</strong> / <strong>Resume</strong> to control the animation.</li>
          <li>Use <strong>Reset</strong> to clear the animation and start over.</li>
          <li>Run multiple simulations to accumulate metrics.</li>
        </ol>
      </Section>

      <Section icon={<Activity size={16} color="#f59e0b" />} title="Simulating Failures and Rerouting">
        <ul style={listStyle}>
          <li>Select a <strong>link</strong> and click <strong>Disable</strong> in the toolbar or inspector to fail that link.</li>
          <li>Select a <strong>router/device</strong> and click <strong>Offline</strong> to take it out of service.</li>
          <li>Re-run the simulation — the algorithm will find an alternative path if one exists.</li>
          <li>Try the <strong>Simple Rerouting Demo</strong> example: load it from the Saved view, then disable the R1↔R2 link and re-simulate to see traffic reroute through R3.</li>
          <li>If no alternative path exists, the packet is dropped and the event log records "Unreachable".</li>
        </ul>
      </Section>

      <Section icon={<Save size={16} color="#06b6d4" />} title="Saving and Loading Topologies">
        <ul style={listStyle}>
          <li>Go to the <strong>Saved</strong> view (folder icon in sidebar) to save, load, rename, delete topologies, or load example networks.</li>
          <li>Topologies are saved to browser localStorage and persist across page refreshes.</li>
          <li>Use <strong>Export JSON</strong> to download a topology file.</li>
          <li>Use <strong>Import JSON</strong> to load a previously exported file. Invalid files show detailed error messages and will not overwrite your current topology.</li>
        </ul>
      </Section>

      <Section icon={<BookOpen size={16} color="#a78bfa" />} title="Viewing Routing Tables and Analytics">
        <ul style={listStyle}>
          <li><strong>Routing Tables view:</strong> Shows distance-vector routing tables computed from the current topology. If a source is selected, also shows Dijkstra routes from that source to all devices.</li>
          <li><strong>Analytics view:</strong> Shows packet delivery metrics (sent, delivered, dropped, delivery rate, average latency, average hop count) and a live event log. All values are simulated estimates.</li>
        </ul>
      </Section>

      <div style={{ marginTop: 24, padding: 14, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10 }}>
        <div style={{ color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Tips</div>
        <ul style={{ ...listStyle, margin: 0 }}>
          <li>The canvas minimap (bottom-right) helps navigate large topologies.</li>
          <li>Use the canvas zoom controls or scroll to zoom in and out.</li>
          <li>Link cost affects which path Dijkstra and distance-vector algorithms prefer — lower cost = preferred path.</li>
          <li>Delay affects the simulated latency shown in analytics.</li>
        </ul>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {icon}
        <h3 style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 700, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

const listStyle: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: 13,
  lineHeight: 1.8,
  paddingLeft: 20,
  margin: 0,
};

const kbdStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 4,
  padding: '1px 5px',
  fontSize: 11,
  color: '#94a3b8',
  fontFamily: 'monospace',
};
