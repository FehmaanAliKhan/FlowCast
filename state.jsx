// FlowCast — React state management (Context + useReducer + API + localStorage fallback)

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  schemaVersion: 1,
  initialized: false,
  settings: {
    theme: 'system',
    horizon: '6M',
    startingBalanceCents: 500000,
    asOfDate: Dates.today(),
  },
  transactions: [],
  recurringRules: [],
  scenarios: [{
    id: 'scenario_baseline',
    name: 'Baseline',
    color: '#1E3A8A',
    active: true,
    isBaseline: true,
    overrides: [],
  }],
  goals: [],
  ui: {
    screen: 'welcome',
    drawerOpen: false,
    drawerContent: null,
    toasts: [],
    horizon: '6M',
    showMonteCarlo: false,
    activeScenarioIds: ['scenario_baseline'],
  },
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'NAV':
      return { ...state, ui: { ...state.ui, screen: action.screen, drawerOpen: false } };

    case 'OPEN_DRAWER':
      return { ...state, ui: { ...state.ui, drawerOpen: true, drawerContent: action.content } };
    case 'CLOSE_DRAWER':
      return { ...state, ui: { ...state.ui, drawerOpen: false, drawerContent: null } };

    case 'TOAST_ADD':
      return { ...state, ui: { ...state.ui, toasts: [...state.ui.toasts, { id: newId('toast'), message: action.message, variant: action.variant || 'default' }] } };
    case 'TOAST_REMOVE':
      return { ...state, ui: { ...state.ui, toasts: state.ui.toasts.filter(t => t.id !== action.id) } };

    case 'SET_HORIZON':
      return { ...state, ui: { ...state.ui, horizon: action.horizon } };
    case 'TOGGLE_MONTE_CARLO':
      return { ...state, ui: { ...state.ui, showMonteCarlo: !state.ui.showMonteCarlo } };
    case 'TOGGLE_SCENARIO_ACTIVE': {
      const id = action.id;
      const current = state.ui.activeScenarioIds;
      const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
      return { ...state, ui: { ...state.ui, activeScenarioIds: next } };
    }

    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.tx] };
    case 'UPDATE_TRANSACTION':
      return { ...state, transactions: state.transactions.map(t => t.id === action.tx.id ? action.tx : t) };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.id) };

    case 'ADD_RULE':
      return { ...state, recurringRules: [...state.recurringRules, action.rule] };
    case 'UPDATE_RULE':
      return { ...state, recurringRules: state.recurringRules.map(r => r.id === action.rule.id ? action.rule : r) };
    case 'DELETE_RULE':
      return { ...state, recurringRules: state.recurringRules.filter(r => r.id !== action.id) };
    case 'TOGGLE_RULE':
      return { ...state, recurringRules: state.recurringRules.map(r => r.id === action.id ? { ...r, active: !r.active } : r) };

    case 'ADD_SCENARIO': {
      const s = action.scenario;
      return { ...state, scenarios: [...state.scenarios, s], ui: { ...state.ui, activeScenarioIds: [...state.ui.activeScenarioIds, s.id] } };
    }
    case 'UPDATE_SCENARIO':
      return { ...state, scenarios: state.scenarios.map(s => s.id === action.scenario.id ? action.scenario : s) };
    case 'DELETE_SCENARIO':
      return { ...state, scenarios: state.scenarios.filter(s => s.id !== action.id), ui: { ...state.ui, activeScenarioIds: state.ui.activeScenarioIds.filter(x => x !== action.id) } };
    case 'TOGGLE_SCENARIO':
      return { ...state, scenarios: state.scenarios.map(s => s.id === action.id ? { ...s, active: !s.active } : s) };

    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.goal] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.goal.id ? action.goal : g) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.id) };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case 'SEED_DATA': {
      const seed = generateSeedData();
      return { ...state, ...seed, initialized: true, ui: { ...state.ui, screen: 'dashboard', activeScenarioIds: seed.scenarios.filter(s => s.active).map(s => s.id) } };
    }
    case 'MANUAL_SETUP':
      return { ...state, initialized: true, ui: { ...state.ui, screen: 'dashboard' } };
    case 'IMPORT_DATA': {
      const d = action.data;
      return { ...state, ...d, initialized: true, ui: { ...state.ui, screen: 'dashboard', activeScenarioIds: (d.scenarios || []).filter(s => s.active).map(s => s.id) } };
    }

    // RESET is handled in wrappedDispatch (clears localStorage + API), then falls through here
    case 'RESET':
      return { ...INITIAL_STATE, ui: { ...INITIAL_STATE.ui } };

    case 'LOAD_PERSISTED': {
      const d = action.data;
      return { ...state, ...d, initialized: true, ui: { ...state.ui, screen: 'dashboard', activeScenarioIds: (d.scenarios || []).filter(s => s.active).map(s => s.id) } };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const StoreContext = createContext(null);

function StoreProvider({ children }) {
  const [state, rawDispatch]  = useReducer(reducer, INITIAL_STATE);
  const [apiLoading, setApiLoading] = useState(true);
  const saveTimerRef = useRef(null);

  // ── Wrapped dispatch: intercept RESET to clear storage + API ──────────────
  const dispatch = useCallback((action) => {
    if (action.type === 'RESET') {
      Storage.clear();
      if (Api.isLoggedIn()) {
        Api.clearData().catch(console.error);
      }
    }
    rawDispatch(action);
  }, [rawDispatch]);

  // ── On mount: load from API first, fall back to localStorage ─────────────
  useEffect(() => {
    async function init() {
      if (Api.isLoggedIn()) {
        try {
          const { data } = await Api.loadData();
          if (data && data.initialized) {
            rawDispatch({ type: 'LOAD_PERSISTED', data });
            setApiLoading(false);
            return;
          }
        } catch (err) {
          console.warn('[FlowCast] API load failed, using localStorage:', err.message);
        }
      }
      // Fall back to localStorage
      const saved = Storage.load();
      if (saved && saved.initialized) {
        rawDispatch({ type: 'LOAD_PERSISTED', data: saved });
      }
      setApiLoading(false);
    }
    init();
  }, []);

  // ── Persist on data changes: localStorage + debounced API ────────────────
  useEffect(() => {
    if (!state.initialized) return;
    const { ui, ...persist } = state;
    const payload = { ...persist, initialized: true };

    // Always write localStorage as cache
    Storage.save(payload);

    // Debounced API save (1 s after last change)
    if (Api.isLoggedIn()) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        Api.saveData(payload).catch(err =>
          console.error('[FlowCast] API save failed:', err.message)
        );
      }, 1000);
    }
  }, [state.transactions, state.recurringRules, state.scenarios, state.goals, state.settings, state.initialized]);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const toast = useCallback((message, variant = 'default') => {
    const id = newId('toast');
    rawDispatch({ type: 'TOAST_ADD', message, variant });
    setTimeout(() => rawDispatch({ type: 'TOAST_REMOVE', id }), 3200);
  }, []);

  return React.createElement(
    StoreContext.Provider,
    { value: { state, dispatch, toast, apiLoading } },
    children
  );
}

function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

// ─── Derived data: forecasts ───────────────────────────────────────────────

function useForecasts() {
  const { state } = useStore();
  const { settings, transactions, recurringRules, scenarios, ui } = state;
  const { horizon, activeScenarioIds } = ui;

  const startDate = settings.asOfDate;
  const endDate   = Dates.horizonEnd(startDate, horizon);
  const baseInputs = { startingBalanceCents: settings.startingBalanceCents, transactions, recurringRules };

  const forecasts = {};
  for (const scenario of scenarios) {
    if (!activeScenarioIds.includes(scenario.id)) continue;
    const inputs = scenario.isBaseline ? baseInputs : ScenariosEngine.apply(baseInputs, scenario);
    const points = ForecastEngine.run({ ...inputs, startDate, endDate });
    forecasts[scenario.id] = { scenario, points };
  }

  return { forecasts, startDate, endDate };
}

Object.assign(window, { StoreProvider, useStore, useForecasts, StoreContext });
