import { useState } from 'react';
import { Save, Trash2, Edit3, Check, X, Download, Upload, FolderOpen } from 'lucide-react';
import { useApp } from '../store/AppContext';
import {
  loadSavedTopologies,
  saveTopology,
  deleteTopology,
  renameTopology,
  exportTopologyJSON,
  importTopologyJSON,
} from '../utils/persistence';
import { EXAMPLE_TOPOLOGIES } from '../data/examples';

export default function SavedTopologiesView() {
  const { state, setTopology } = useApp();
  const [saved, setSaved] = useState(() => loadSavedTopologies());
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleSave = () => {
    const name = saveName.trim() || 'My Topology';
    saveTopology(name, state.topology);
    setSaved(loadSavedTopologies());
    setSaveName('');
  };

  const handleDelete = (id: string) => {
    deleteTopology(id);
    setSaved(loadSavedTopologies());
  };

  const handleRename = (id: string) => {
    if (editName.trim()) renameTopology(id, editName.trim());
    setEditingId(null);
    setSaved(loadSavedTopologies());
  };

  const handleLoad = (topology: typeof state.topology) => {
    setTopology(topology);
  };

  const handleExport = () => {
    exportTopologyJSON(state.topology, saveName || 'topology');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const raw = ev.target?.result as string;
      const result = importTopologyJSON(raw);
      if (result.ok && result.topology) {
        setTopology(result.topology);
        setImportError(null);
      } else {
        setImportError(result.errors.join('\n'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
          Saved Topologies
        </h2>
        <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>
          Save, load, and manage your network topologies. Data is stored in browser localStorage.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          id="topology-name-input"
          value={saveName}
          onChange={e => setSaveName(e.target.value)}
          placeholder="Topology name..."
          style={{
            flex: 1,
            minWidth: 160,
            padding: '7px 12px',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            color: '#e2e8f0',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          id="save-topology-btn"
          onClick={handleSave}
          disabled={state.topology.devices.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 16px',
            borderRadius: 8,
            border: 'none',
            background: state.topology.devices.length > 0 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#1e293b',
            color: state.topology.devices.length > 0 ? 'white' : '#334155',
            fontSize: 13,
            fontWeight: 600,
            cursor: state.topology.devices.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          <Save size={14} />
          Save Current
        </button>
        <button
          id="export-topology-btn"
          onClick={handleExport}
          disabled={state.topology.devices.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            border: '1px solid #1e293b',
            background: 'transparent',
            color: '#64748b',
            fontSize: 13,
            fontWeight: 600,
            cursor: state.topology.devices.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          <Download size={14} />
          Export JSON
        </button>
        <label
          id="import-topology-label"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            border: '1px solid #1e293b',
            background: 'transparent',
            color: '#64748b',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Upload size={14} />
          Import JSON
          <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} id="import-topology-file-input" />
        </label>
      </div>

      {importError && (
        <div style={{
          background: '#ef444418',
          border: '1px solid #ef444444',
          borderRadius: 8,
          padding: '10px 14px',
          color: '#ef4444',
          fontSize: 12,
          marginBottom: 16,
          whiteSpace: 'pre-line',
        }}>
          Import failed: {importError}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Example Networks
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {EXAMPLE_TOPOLOGIES.map((ex, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 8,
              }}
            >
              <FolderOpen size={14} color="#6366f1" />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{ex.name}</div>
                <div style={{ color: '#475569', fontSize: 11 }}>
                  {ex.topology.devices.length} devices · {ex.topology.links.length} links
                </div>
              </div>
              <button
                id={`load-example-${i}-btn`}
                onClick={() => handleLoad(ex.topology)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  border: '1px solid #6366f144',
                  background: '#6366f118',
                  color: '#818cf8',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Load
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Saved Topologies ({saved.length})
        </div>

        {saved.length === 0 ? (
          <div style={{ color: '#334155', fontSize: 13, padding: '16px 0', textAlign: 'center' }}>
            No saved topologies. Save your current topology above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {saved.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                }}
              >
                <Save size={14} color="#8b5cf6" />
                <div style={{ flex: 1 }}>
                  {editingId === item.id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRename(item.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        style={{
                          padding: '3px 8px',
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: 5,
                          color: '#e2e8f0',
                          fontSize: 12,
                          outline: 'none',
                        }}
                      />
                      <button onClick={() => handleRename(item.id)} style={smallBtnStyle}><Check size={11} /></button>
                      <button onClick={() => setEditingId(null)} style={smallBtnStyle}><X size={11} /></button>
                    </div>
                  ) : (
                    <>
                      <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                      <div style={{ color: '#475569', fontSize: 11 }}>
                        {item.topology.devices.length} devices · {new Date(item.savedAt).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>
                {editingId !== item.id && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      id={`load-saved-${item.id}-btn`}
                      onClick={() => handleLoad(item.topology)}
                      style={{ ...smallBtnStyle, color: '#818cf8', borderColor: '#6366f144' }}
                    >
                      Load
                    </button>
                    <button
                      id={`rename-saved-${item.id}-btn`}
                      onClick={() => { setEditingId(item.id); setEditName(item.name); }}
                      style={smallBtnStyle}
                    >
                      <Edit3 size={11} />
                    </button>
                    <button
                      id={`delete-saved-${item.id}-btn`}
                      onClick={() => handleDelete(item.id)}
                      style={{ ...smallBtnStyle, color: '#ef4444', borderColor: '#ef444444' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const smallBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 8px',
  borderRadius: 6,
  border: '1px solid #1e293b',
  background: 'transparent',
  color: '#64748b',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
};
