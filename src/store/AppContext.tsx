import { createContext, useContext, useReducer, useCallback, useRef, useEffect, type ReactNode } from 'react';
import type {
  NetworkTopology,
  NetworkDevice,
  NetworkLink,
  SimulationState,
  SimulationEvent,
  AlgorithmType,
  RouteResult,
} from '../types/network';
import { generateId } from '../utils/graph';
import { calculateRoute, simulatePacketEvents } from '../utils/simulation';
import { estimateLatency, computeMetrics } from '../utils/analytics';
import { EXAMPLE_TOPOLOGIES } from '../data/examples';

type AppView = 'canvas' | 'routing' | 'analytics' | 'saved' | 'help';

interface AppState {
  topology: NetworkTopology;
  simulation: SimulationState;
  selectedDeviceId: string | null;
  selectedLinkId: string | null;
  activeView: AppView;
  hopCounts: number[];
  latencies: number[];
}

type AppAction =
  | { type: 'ADD_DEVICE'; device: NetworkDevice }
  | { type: 'UPDATE_DEVICE'; id: string; changes: Partial<NetworkDevice> }
  | { type: 'DELETE_DEVICE'; id: string }
  | { type: 'ADD_LINK'; link: NetworkLink }
  | { type: 'UPDATE_LINK'; id: string; changes: Partial<NetworkLink> }
  | { type: 'DELETE_LINK'; id: string }
  | { type: 'SET_TOPOLOGY'; topology: NetworkTopology }
  | { type: 'SELECT_DEVICE'; id: string | null }
  | { type: 'SELECT_LINK'; id: string | null }
  | { type: 'SET_VIEW'; view: AppView }
  | { type: 'SET_SOURCE'; id: string | null }
  | { type: 'SET_DESTINATION'; id: string | null }
  | { type: 'SET_ALGORITHM'; algorithm: AlgorithmType }
  | { type: 'SET_ROUTE'; route: RouteResult | null; events: SimulationEvent[] }
  | { type: 'START_SIMULATION' }
  | { type: 'PAUSE_SIMULATION' }
  | { type: 'RESUME_SIMULATION' }
  | { type: 'RESET_SIMULATION' }
  | { type: 'ADVANCE_PACKET' }
  | { type: 'COMPLETE_SIMULATION'; delivered: boolean; hopCount: number; latency: number }
  | { type: 'ADD_EVENT'; event: SimulationEvent }
  | { type: 'UPDATE_DEVICE_POSITION'; id: string; position: { x: number; y: number } };

const defaultMetrics = {
  packetsSent: 0,
  packetsDelivered: 0,
  packetsDropped: 0,
  deliveryRate: 0,
  avgLatency: 0,
  avgHopCount: 0,
  totalSimulations: 0,
};

const defaultTopology = EXAMPLE_TOPOLOGIES[0]?.topology ?? { devices: [], links: [] };

const initialState: AppState = {
  topology: defaultTopology,
  simulation: {
    status: 'idle',
    sourceId: 'pc1',
    destinationId: 'srv1',
    algorithm: 'dijkstra',
    currentRoute: null,
    activePacketNodeIndex: 0,
    events: [],
    metrics: defaultMetrics,
  },
  selectedDeviceId: null,
  selectedLinkId: null,
  activeView: 'canvas',
  hopCounts: [],
  latencies: [],
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_DEVICE':
      return {
        ...state,
        topology: {
          ...state.topology,
          devices: [...state.topology.devices, action.device],
        },
      };

    case 'UPDATE_DEVICE':
      return {
        ...state,
        topology: {
          ...state.topology,
          devices: state.topology.devices.map(d =>
            d.id === action.id ? { ...d, ...action.changes } : d
          ),
        },
      };

    case 'DELETE_DEVICE': {
      const devices = state.topology.devices.filter(d => d.id !== action.id);
      const links = state.topology.links.filter(
        l => l.source !== action.id && l.target !== action.id
      );
      return {
        ...state,
        topology: { devices, links },
        selectedDeviceId: state.selectedDeviceId === action.id ? null : state.selectedDeviceId,
        simulation: {
          ...state.simulation,
          sourceId: state.simulation.sourceId === action.id ? null : state.simulation.sourceId,
          destinationId:
            state.simulation.destinationId === action.id
              ? null
              : state.simulation.destinationId,
        },
      };
    }

    case 'ADD_LINK':
      return {
        ...state,
        topology: {
          ...state.topology,
          links: [...state.topology.links, action.link],
        },
      };

    case 'UPDATE_LINK':
      return {
        ...state,
        topology: {
          ...state.topology,
          links: state.topology.links.map(l =>
            l.id === action.id ? { ...l, ...action.changes } : l
          ),
        },
      };

    case 'DELETE_LINK':
      return {
        ...state,
        topology: {
          ...state.topology,
          links: state.topology.links.filter(l => l.id !== action.id),
        },
        selectedLinkId: state.selectedLinkId === action.id ? null : state.selectedLinkId,
      };

    case 'SET_TOPOLOGY':
      return {
        ...state,
        topology: action.topology,
        selectedDeviceId: null,
        selectedLinkId: null,
        simulation: { ...initialState.simulation, events: [], metrics: defaultMetrics },
        hopCounts: [],
        latencies: [],
      };

    case 'SELECT_DEVICE':
      return { ...state, selectedDeviceId: action.id, selectedLinkId: null };

    case 'SELECT_LINK':
      return { ...state, selectedLinkId: action.id, selectedDeviceId: null };

    case 'SET_VIEW':
      return { ...state, activeView: action.view };

    case 'SET_SOURCE':
      return { ...state, simulation: { ...state.simulation, sourceId: action.id, currentRoute: null } };

    case 'SET_DESTINATION':
      return { ...state, simulation: { ...state.simulation, destinationId: action.id, currentRoute: null } };

    case 'SET_ALGORITHM':
      return { ...state, simulation: { ...state.simulation, algorithm: action.algorithm, currentRoute: null } };

    case 'SET_ROUTE':
      return {
        ...state,
        simulation: {
          ...state.simulation,
          currentRoute: action.route,
          events: [...state.simulation.events, ...action.events],
          activePacketNodeIndex: 0,
        },
      };

    case 'START_SIMULATION':
      return {
        ...state,
        simulation: {
          ...state.simulation,
          status: 'running',
          activePacketNodeIndex: 0,
        },
      };

    case 'PAUSE_SIMULATION':
      return { ...state, simulation: { ...state.simulation, status: 'paused' } };

    case 'RESUME_SIMULATION':
      return { ...state, simulation: { ...state.simulation, status: 'running' } };

    case 'RESET_SIMULATION':
      return {
        ...state,
        simulation: {
          ...state.simulation,
          status: 'idle',
          currentRoute: null,
          activePacketNodeIndex: 0,
        },
      };

    case 'ADVANCE_PACKET':
      return {
        ...state,
        simulation: {
          ...state.simulation,
          activePacketNodeIndex: state.simulation.activePacketNodeIndex + 1,
        },
      };

    case 'COMPLETE_SIMULATION': {
      const newHopCounts = [...state.hopCounts, action.hopCount];
      const newLatencies = [...state.latencies, action.latency];
      const sent = state.simulation.metrics.packetsSent + 1;
      const delivered = state.simulation.metrics.packetsDelivered + (action.delivered ? 1 : 0);
      const dropped = state.simulation.metrics.packetsDropped + (action.delivered ? 0 : 1);
      const metrics = computeMetrics(sent, delivered, dropped, newHopCounts, newLatencies);
      return {
        ...state,
        hopCounts: newHopCounts,
        latencies: newLatencies,
        simulation: {
          ...state.simulation,
          status: 'completed',
          metrics,
        },
      };
    }

    case 'ADD_EVENT':
      return {
        ...state,
        simulation: {
          ...state.simulation,
          events: [...state.simulation.events, action.event],
        },
      };

    case 'UPDATE_DEVICE_POSITION':
      return {
        ...state,
        topology: {
          ...state.topology,
          devices: state.topology.devices.map(d =>
            d.id === action.id ? { ...d, position: action.position } : d
          ),
        },
      };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  addDevice: (type: import('../types/network').DeviceType, position: { x: number; y: number }) => void;
  updateDevice: (id: string, changes: Partial<NetworkDevice>) => void;
  deleteDevice: (id: string) => void;
  addLink: (source: string, target: string) => void;
  updateLink: (id: string, changes: Partial<NetworkLink>) => void;
  deleteLink: (id: string) => void;
  setTopology: (topology: NetworkTopology) => void;
  selectDevice: (id: string | null) => void;
  selectLink: (id: string | null) => void;
  setView: (view: AppView) => void;
  setSource: (id: string | null) => void;
  setDestination: (id: string | null) => void;
  setAlgorithm: (algorithm: AlgorithmType) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  updateDevicePosition: (id: string, position: { x: number; y: number }) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let deviceCounter = defaultTopology.devices.length;

const TYPE_LABELS: Record<import('../types/network').DeviceType, string> = {
  pc: 'PC',
  router: 'R',
  switch: 'SW',
  server: 'SRV',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  const runStepRef = useRef<() => void>(() => {});

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  const addDevice = useCallback(
    (type: import('../types/network').DeviceType, position: { x: number; y: number }) => {
      deviceCounter++;
      const device: NetworkDevice = {
        id: generateId('dev'),
        type,
        label: `${TYPE_LABELS[type]}${deviceCounter}`,
        status: 'online',
        position,
      };
      dispatch({ type: 'ADD_DEVICE', device });
    },
    []
  );

  const updateDevice = useCallback((id: string, changes: Partial<NetworkDevice>) => {
    dispatch({ type: 'UPDATE_DEVICE', id, changes });
  }, []);

  const deleteDevice = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DEVICE', id });
  }, []);

  const addLink = useCallback((source: string, target: string) => {
    const s = stateRef.current;
    const existing = s.topology.links.find(
      l =>
        (l.source === source && l.target === target) ||
        (l.source === target && l.target === source)
    );
    if (existing) return;

    const link: NetworkLink = {
      id: generateId('lnk'),
      source,
      target,
      cost: 1,
      bandwidth: 100,
      delay: 10,
      enabled: true,
    };
    dispatch({ type: 'ADD_LINK', link });
  }, []);

  const updateLink = useCallback((id: string, changes: Partial<NetworkLink>) => {
    dispatch({ type: 'UPDATE_LINK', id, changes });
  }, []);

  const deleteLink = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LINK', id });
  }, []);

  const setTopology = useCallback((topology: NetworkTopology) => {
    dispatch({ type: 'SET_TOPOLOGY', topology });
  }, []);

  const selectDevice = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_DEVICE', id });
  }, []);

  const selectLink = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_LINK', id });
  }, []);

  const setView = useCallback((view: AppView) => {
    dispatch({ type: 'SET_VIEW', view });
  }, []);

  const setSource = useCallback((id: string | null) => {
    dispatch({ type: 'SET_SOURCE', id });
  }, []);

  const setDestination = useCallback((id: string | null) => {
    dispatch({ type: 'SET_DESTINATION', id });
  }, []);

  const setAlgorithm = useCallback((algorithm: AlgorithmType) => {
    dispatch({ type: 'SET_ALGORITHM', algorithm });
  }, []);

  const updateDevicePosition = useCallback((id: string, position: { x: number; y: number }) => {
    dispatch({ type: 'UPDATE_DEVICE_POSITION', id, position });
  }, []);

  const runAnimationStep = useCallback(() => {
    const s = stateRef.current;
    if (s.simulation.status !== 'running') return;
    if (!s.simulation.currentRoute?.reachable) return;

    const path = s.simulation.currentRoute.path;
    const idx = s.simulation.activePacketNodeIndex;

    if (idx >= path.length - 1) {
      const hops = path.length - 1;
      const latency = estimateLatency(s.topology, path);
      dispatch({ type: 'COMPLETE_SIMULATION', delivered: true, hopCount: hops, latency });
      return;
    }

    dispatch({ type: 'ADVANCE_PACKET' });
    animTimerRef.current = setTimeout(() => runStepRef.current(), 700);
  }, []);

  useEffect(() => {
    runStepRef.current = runAnimationStep;
  }, [runAnimationStep]);

  const startSimulation = useCallback(() => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);

    const s = stateRef.current;
    if (!s.simulation.sourceId || !s.simulation.destinationId) return;

    const { route, events } = calculateRoute(
      s.topology,
      s.simulation.sourceId,
      s.simulation.destinationId,
      s.simulation.algorithm
    );

    dispatch({ type: 'SET_ROUTE', route, events });

    if (!route.reachable) {
      const hops = 0;
      const latency = 0;
      dispatch({ type: 'COMPLETE_SIMULATION', delivered: false, hopCount: hops, latency });
      return;
    }

    const packetEvents = simulatePacketEvents(s.topology, route);
    for (const evt of packetEvents) {
      dispatch({ type: 'ADD_EVENT', event: evt });
    }

    dispatch({ type: 'START_SIMULATION' });
    animTimerRef.current = setTimeout(() => runStepRef.current(), 700);
  }, []);

  const pauseSimulation = useCallback(() => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    dispatch({ type: 'PAUSE_SIMULATION' });
  }, []);

  const resumeSimulation = useCallback(() => {
    dispatch({ type: 'RESUME_SIMULATION' });
    animTimerRef.current = setTimeout(() => runStepRef.current(), 700);
  }, []);

  const resetSimulation = useCallback(() => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    dispatch({ type: 'RESET_SIMULATION' });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        addDevice,
        updateDevice,
        deleteDevice,
        addLink,
        updateLink,
        deleteLink,
        setTopology,
        selectDevice,
        selectLink,
        setView,
        setSource,
        setDestination,
        setAlgorithm,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        resetSimulation,
        updateDevicePosition,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
