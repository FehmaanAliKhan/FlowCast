// FlowCast — Root App component

function ShortcutHelp({ open, onClose }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts">
      <div className="flex flex-col gap-3">
        {[['N','New transaction'],['S','New scenario'],['/', 'Focus search'],['?','This help']].map(([k,l]) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">{l}</span>
            <kbd className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono text-slate-500">{k}</kbd>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end"><Button variant="ghost" onClick={onClose}>Close</Button></div>
    </Modal>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "darkMode": false,
  "accentColor": "#6C5DD3"
}/*EDITMODE-END*/;

function App() {
  const { state, dispatch, toast } = useStore();
  const { ui, initialized, settings } = state;
  const [helpOpen, setHelpOpen] = React.useState(false);

  // ── Tweaks ────────────────────────────────────────────────
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply accent color as CSS var
  useEffect(() => {
    document.documentElement.style.setProperty('--violet', t.accentColor);
    window.VIOLET = t.accentColor;
  }, [t.accentColor]);

  // Apply dark mode from tweaks panel
  useEffect(() => {
    document.documentElement.classList.toggle('dark', t.darkMode);
  }, [t.darkMode]);

  // Also respond to sidebar theme toggle
  useEffect(() => { applyTheme(settings.theme); }, [settings.theme]);

  // Listen for system dark mode changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (settings.theme === 'system') applyTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') {
        dispatch({ type: 'NAV', screen: 'transactions' });
      } else if (e.key === 's' || e.key === 'S') {
        dispatch({ type: 'NAV', screen: 'scenarios' });
      } else if (e.key === '?') {
        setHelpOpen(h => !h);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  if (!initialized) {
    return <Welcome />;
  }

  const screens = {
    dashboard:    <Dashboard />,
    transactions: <Transactions />,
    recurring:    <Recurring />,
    scenarios:    <Scenarios />,
    goals:        <Goals />,
    settings:     <Settings />,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--app-bg)' }}>
      <LeftRail />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0" style={{ backgroundColor: 'var(--app-bg)' }}>
        {screens[ui.screen] || <Dashboard />}
      </main>
      <BottomTabs />
      <ToastContainer />
      <ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance" />
        <TweakToggle label="Dark mode" value={t.darkMode} onChange={v => setTweak('darkMode', v)} />
        <TweakColor  label="Accent color" value={t.accentColor} onChange={v => setTweak('accentColor', v)} />
      </TweaksPanel>
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(StoreProvider, null, React.createElement(App, null))
);
