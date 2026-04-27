// FlowCast — Navigation (FinSet-inspired dark sidebar)

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '▦' },
  { id: 'transactions', label: 'Transactions', icon: '↕' },
  { id: 'recurring',    label: 'Recurring',    icon: '↻' },
  { id: 'scenarios',    label: 'Scenarios',    icon: '⑃' },
  { id: 'goals',        label: 'Goals',        icon: '◎' },
  { id: 'settings',     label: 'Settings',     icon: '⚙' },
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
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 11.5L5.5 7L8.5 9.5L11.5 4.5L14 6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.5 4.5H14V7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">FlowCast</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto pb-2">
        {NAV_ITEMS.map(item => {
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => nav(item.id)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left w-full"
              style={{
                backgroundColor: active ? '#6C5DD3' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span className="text-sm w-4 text-center leading-none shrink-0">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 flex flex-col gap-0.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="mt-3 mb-1 flex flex-col gap-0.5">
          {[{ icon: '?', label: 'Help' }, { icon: '→', label: 'Reset data', action: () => dispatch({ type: 'RESET' }) }].map(b => (
            <button key={b.label} onClick={b.action}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              <span className="text-sm w-4 text-center">{b.icon}</span>
              {b.label}
            </button>
          ))}
        </div>

        {/* User row + theme toggle */}
        <div className="flex items-center gap-2 px-3 py-2 mt-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)' }}>FC</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">FlowCast</p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{Money.format(startingBalanceCents)}</p>
          </div>
          <button
            onClick={cycleTheme}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'rgba(255,255,255,0.08)' }}>
      {NAV_ITEMS.slice(0, 5).map(item => (
        <button key={item.id} onClick={() => nav(item.id)}
          className="flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors"
          style={{ color: screen === item.id ? '#7B61FF' : 'rgba(255,255,255,0.35)' }}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span className="text-[10px]">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

Object.assign(window, { LeftRail, BottomTabs });
