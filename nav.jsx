// FlowCast — Navigation (dark sidebar with SVG icons)

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconTransactions() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 13V5M5 5L2.5 7.5M5 5L7.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 5v8m0 0l2.5-2.5M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconRecurring() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M15 9A6 6 0 1 1 9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 3h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconScenarios() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="3.5" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="14.5" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 5v3.5L3.5 13M9 8.5L14.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconGoals() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="9" r="1" fill="currentColor"/>
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.42 1.42M12.88 12.88l1.42 1.42M3.7 14.3l1.42-1.42M12.88 5.12l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    Icon: IconDashboard },
  { id: 'transactions', label: 'Transactions', Icon: IconTransactions },
  { id: 'recurring',    label: 'Recurring',    Icon: IconRecurring },
  { id: 'scenarios',    label: 'Scenarios',    Icon: IconScenarios },
  { id: 'goals',        label: 'Goals',        Icon: IconGoals },
  { id: 'settings',     label: 'Settings',     Icon: IconSettings },
];

function LeftRail() {
  const { state, dispatch } = useStore();
  const { screen } = state.ui;
  const { startingBalanceCents, theme } = state.settings;
  const nav = (id) => dispatch({ type: 'NAV', screen: id });

  function cycleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'UPDATE_SETTINGS', patch: { theme: next } });
    applyTheme(next);
  }

  return (
    <aside
      className="hidden md:flex flex-col w-[220px] shrink-0 h-screen sticky top-0 select-none"
      style={{ backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)', boxShadow: '0 4px 12px rgba(123,97,255,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 13L6 8L9.5 11L13 6L16 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 6H16V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight leading-none">FlowCast</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Personal Finance</p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>Menu</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto pb-2">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = screen === id;
          return (
            <button
              key={id}
              onClick={() => nav(id)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left w-full"
              style={{
                background: active ? 'linear-gradient(135deg,rgba(123,97,255,0.2),rgba(91,79,233,0.1))' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.4)',
                borderLeft: `2px solid ${active ? '#7B61FF' : 'transparent'}`,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span className="shrink-0" style={{ color: active ? '#7B61FF' : 'rgba(255,255,255,0.35)' }}>
                <Icon />
              </span>
              <span className="flex-1">{label}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#7B61FF' }} />}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 mb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Reset button */}
      <div className="px-3 pb-2">
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition-all"
          style={{ color: 'rgba(255,255,255,0.25)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.08)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M2 7.5A5.5 5.5 0 1 0 7.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M7.5 2H4V5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Reset all data
        </button>
      </div>

      {/* User card */}
      <div className="mx-3 mb-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)' }}>FC</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-none">FlowCast User</p>
            <p className="text-[10px] mt-0.5 font-mono truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {Money.format(startingBalanceCents)}
            </p>
          </div>
          <button
            onClick={cycleTheme}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 transition-all"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(123,97,255,0.3)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            title="Toggle theme"
          >◑</button>
        </div>
      </div>
    </aside>
  );
}

function BottomTabs() {
  const { state, dispatch } = useStore();
  const { screen } = state.ui;
  const nav = (id) => dispatch({ type: 'NAV', screen: id });
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex"
      style={{ backgroundColor: 'var(--sidebar-bg)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {NAV_ITEMS.slice(0, 5).map(({ id, label, Icon }) => (
        <button key={id} onClick={() => nav(id)}
          className="flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors"
          style={{ color: screen === id ? '#7B61FF' : 'rgba(255,255,255,0.3)' }}
        >
          <Icon />
          <span className="text-[10px] font-medium mt-0.5">{label}</span>
        </button>
      ))}
    </nav>
  );
}

Object.assign(window, { LeftRail, BottomTabs });
