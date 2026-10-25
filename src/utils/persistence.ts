import type { NetworkTopology, SavedTopology } from '../types/network';
import { validateTopology } from './graph';

const STORAGE_KEY = 'netroute-topologies';

export function loadSavedTopologies(): SavedTopology[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedTopology[];
  } catch {
    return [];
  }
}

export function saveTopology(name: string, topology: NetworkTopology): SavedTopology {
  const existing = loadSavedTopologies();
  const entry: SavedTopology = {
    id: `topo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim() || 'Unnamed Topology',
    savedAt: Date.now(),
    topology,
  };
  existing.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return entry;
}

export function deleteTopology(id: string): void {
  const existing = loadSavedTopologies().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function renameTopology(id: string, newName: string): void {
  const existing = loadSavedTopologies().map(t =>
    t.id === id ? { ...t, name: newName.trim() || t.name } : t
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function exportTopologyJSON(topology: NetworkTopology, name: string): void {
  const data = JSON.stringify({ name, topology }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  ok: boolean;
  topology?: NetworkTopology;
  name?: string;
  errors: string[];
}

export function importTopologyJSON(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, errors: ['Invalid JSON: could not parse file.'] };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, errors: ['Invalid format: root must be an object.'] };
  }

  const obj = parsed as Record<string, unknown>;
  const topology = obj.topology as NetworkTopology | undefined;

  if (!topology || !Array.isArray(topology.devices) || !Array.isArray(topology.links)) {
    return { ok: false, errors: ['Invalid format: missing topology.devices or topology.links.'] };
  }

  const validationErrors = validateTopology(topology);
  if (validationErrors.length > 0) {
    return { ok: false, errors: validationErrors };
  }

  return {
    ok: true,
    topology,
    name: typeof obj.name === 'string' ? obj.name : 'Imported Topology',
    errors: [],
  };
}
