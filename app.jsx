// FlowCast — Root App component

function ShortcutHelp({ open, onClose }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts">
      <div className="flex flex-col gap-3">
        {[['N','New transaction'],['S','New scenario'],['/', 'Focus search'],['?','This help']].map(([k,l]) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-2)' }}>{l}</span>
            <kbd className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono text-slate-500">{k}</kbd>
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end"><Button variant="ghost" onClick={onClose}>Close</Button></div>
    </Modal>
  );
}

// ── Full-screen loading spinner shown while fetching data from the API ─────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: 'linear-gradient(135deg,#0f0a2e 0%,#1a1040 50%,#0d0d1a 100%)' }}>
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)' }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 13L6 8L9.5 11L13 6L16 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13 6H16V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {/* Spinning ring */}
      <svg width="32" height="32" viewBox="0 0 32 32" style={{ animation: 'spin 0.9s linear infinite' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(123,97,255,0.2)" strokeWidth="3" />
        <path d="M16 3 A13 13 0 0 1 29 16" fill="none" stroke="#7B61FF" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading your data…</p>
    </div>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "darkMode": false,
  "accentColor": "#6C5DD3"
}/*EDITMODE-END*/;

// ── Main authenticated App ─────────────────────────────────────────────────

function App({ onLogout }) {
  const { state, dispatch, toast, apiLoading } = useStore();
  const { ui, initialized, settings } = state;
  const [helpOpen, setHelpOpen] = React.useState(false);

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.style.setProperty('--violet', t.accentColor);
    window.VIOLET = t.accentColor;
  }, [t.accentColor]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', t.darkMode);
  }, [t.darkMode]);

  useEffect(() => { applyTheme(settings.theme); }, [settings.theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (settings.theme === 'system') applyTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.theme]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') dispatch({ type: 'NAV', screen: 'transactions' });
      else if (e.key === 's' || e.key === 'S') dispatch({ type: 'NAV', screen: 'scenarios' });
      else if (e.key === '?') setHelpOpen(h => !h);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  // Show spinner while the API fetch is in flight
  if (apiLoading) return <LoadingScreen />;

  // No data yet → show welcome / onboarding
  if (!initialized) return <Welcome />;

  const screens = {
    dashboard:    <Dashboard />,
    transactions: <Transactions />,
    recurring:    <Recurring />,
    scenarios:    <Scenarios />,
    goals:        <Goals />,
    settings:     <Settings onLogout={onLogout} />,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--app-bg)' }}>
      <LeftRail onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0" style={{ backgroundColor: 'var(--app-bg)' }}>
        {screens[ui.screen] || <Dashboard />}
      </main>
      <BottomTabs />
      <ToastContainer />
      <ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance" />
        <TweakToggle label="Dark mode"    value={t.darkMode}    onChange={v => setTweak('darkMode', v)} />
        <TweakColor  label="Accent color" value={t.accentColor} onChange={v => setTweak('accentColor', v)} />
      </TweaksPanel>
    </div>
  );
}

// ── AppRoot: handles auth gate before mounting StoreProvider ───────────────

function AppRoot() {
  const [authed, setAuthed] = useState(Api.isLoggedIn());

  // When the API emits a 401, drop back to the auth screen
  useEffect(() => {
    Api.onUnauthenticated(() => setAuthed(false));
  }, []);

  function handleLogout() {
    Api.logout();   // clears token; onUnauthenticated fires → setAuthed(false)
  }

  if (!authed) {
    return <AuthScreen onSuccess={() => setAuthed(true)} />;
  }

  return (
    React.createElement(StoreProvider, null,
      React.createElement(App, { onLogout: handleLogout })
    )
  );
}

// ── Mount ──────────────────────────────────────────────────────────────────

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(AppRoot, null));
