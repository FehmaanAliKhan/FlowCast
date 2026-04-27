// FlowCast — Welcome / first-run screen

function WelcomeShell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#0f0a2e 0%,#1a1040 35%,#0d0d1a 70%,#060412 100%)' }}>
      {/* Background orbs */}
      <div className="absolute pointer-events-none" style={{ top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(123,97,255,0.15) 0%,transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(91,79,233,0.12) 0%,transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute pointer-events-none" style={{ top: '50%', left: '60%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(20,184,166,0.08) 0%,transparent 70%)', filter: 'blur(30px)' }} />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}

function WelcomeStep({ step, total, title, sub, children }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="h-1 rounded-full flex-1 transition-all duration-300"
            style={{ backgroundColor: i < step ? '#7B61FF' : 'rgba(255,255,255,0.1)' }} />
        ))}
        <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{step}/{total}</span>
      </div>
      <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>{sub}</p>
      {children}
    </div>
  );
}

function Welcome() {
  const { dispatch, toast } = useStore();
  const [step, setStep] = useState('choose');
  const [manualData, setManualData] = useState({ balance: '', paycheck: '', rent: '' });

  function seedData() {
    dispatch({ type: 'SEED_DATA' });
    toast('Sample data loaded — welcome to FlowCast!', 'success');
  }

  function finishManual() {
    const bal  = Money.toCents(parseFloat(manualData.balance)  || 0);
    const pay  = Money.toCents(parseFloat(manualData.paycheck) || 0);
    const rent = Money.toCents(parseFloat(manualData.rent)     || 0);
    dispatch({ type: 'MANUAL_SETUP' });
    if (bal)  dispatch({ type: 'UPDATE_SETTINGS', patch: { startingBalanceCents: bal } });
    if (pay)  dispatch({ type: 'ADD_RULE', rule: { id: newId('rule'), label: 'Paycheck', amountCents: pay,           cadence: 'biweekly', anchorDate: Dates.today(),              endDate: null, category: 'income',   active: true } });
    if (rent) dispatch({ type: 'ADD_RULE', rule: { id: newId('rule'), label: 'Rent',     amountCents: -Math.abs(rent), cadence: 'monthly',  anchorDate: Dates.addDays(Dates.today(), 5), endDate: null, category: 'housing', active: true } });
    toast('All set — your baseline is live.', 'success');
  }

  function importFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        dispatch({ type: 'IMPORT_DATA', data });
        toast('Data imported successfully.', 'success');
      } catch {
        toast('Invalid JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  // ── Manual setup steps ──────────────────────────────────────────────────────

  if (step === 'manual_1') return (
    <WelcomeShell>
      <WelcomeStep step={1} total={3} title="What's your current balance?" sub="Your checking + savings combined.">
        <DarkInput value={manualData.balance} onChange={v => setManualData(d => ({ ...d, balance: v }))} prefix="$" type="number" placeholder="5,000" autoFocus />
        <div className="flex gap-3 mt-6">
          <DarkGhostButton onClick={() => setStep('choose')}>Back</DarkGhostButton>
          <DarkPrimaryButton onClick={() => setStep('manual_2')} fullWidth>Continue →</DarkPrimaryButton>
        </div>
      </WelcomeStep>
    </WelcomeShell>
  );

  if (step === 'manual_2') return (
    <WelcomeShell>
      <WelcomeStep step={2} total={3} title="How much is your paycheck?" sub="Per deposit — we'll schedule it bi-weekly.">
        <DarkInput value={manualData.paycheck} onChange={v => setManualData(d => ({ ...d, paycheck: v }))} prefix="$" type="number" placeholder="2,800" autoFocus />
        <div className="flex gap-3 mt-6">
          <DarkGhostButton onClick={() => setStep('manual_1')}>Back</DarkGhostButton>
          <DarkPrimaryButton onClick={() => setStep('manual_3')} fullWidth>Continue →</DarkPrimaryButton>
        </div>
      </WelcomeStep>
    </WelcomeShell>
  );

  if (step === 'manual_3') return (
    <WelcomeShell>
      <WelcomeStep step={3} total={3} title="What's your monthly rent?" sub="Leave blank if it doesn't apply.">
        <DarkInput value={manualData.rent} onChange={v => setManualData(d => ({ ...d, rent: v }))} prefix="$" type="number" placeholder="1,500" autoFocus />
        <div className="flex gap-3 mt-6">
          <DarkGhostButton onClick={() => setStep('manual_2')}>Back</DarkGhostButton>
          <DarkPrimaryButton onClick={finishManual} fullWidth>Start forecasting →</DarkPrimaryButton>
        </div>
      </WelcomeStep>
    </WelcomeShell>
  );

  // ── Landing page ─────────────────────────────────────────────────────────────

  return (
    <WelcomeShell>
      <div className="w-full max-w-2xl mx-auto">

        {/* Logo badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(123,97,255,0.12)', border: '1px solid rgba(123,97,255,0.25)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)' }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M2 13L6 8L9.5 11L13 6L16 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 6H16V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">FlowCast</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: 'rgba(123,97,255,0.3)', color: '#C4B5FD' }}>Beta</span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Know where your money<br />
            <span style={{ background: 'linear-gradient(90deg,#7B61FF,#A78BFA,#38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              is headed.
            </span>
          </h1>
          <p className="text-base sm:text-lg max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Project your cash flow months ahead, run what-if scenarios, and set savings goals — all in your browser.
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { icon: '📊', text: 'Cash flow forecasts' },
            { icon: '⎇', text: 'Scenario planning' },
            { icon: '◎', text: 'Savings goals' },
            { icon: '🎲', text: 'Monte Carlo analysis' },
            { icon: '🔒', text: 'Runs 100% in-browser' },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}>
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">

          {/* Sample data — primary */}
          <button onClick={seedData}
            className="col-span-1 sm:col-span-1 flex flex-col items-start gap-3 p-5 rounded-2xl text-left transition-all duration-150 sm:col-span-1"
            style={{ background: 'linear-gradient(135deg,rgba(123,97,255,0.25),rgba(91,79,233,0.15))', border: '1px solid rgba(123,97,255,0.4)', boxShadow: '0 0 0 0 rgba(123,97,255,0)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(123,97,255,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: 'rgba(123,97,255,0.25)' }}>⚡</div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Try sample data</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Pre-loaded with transactions, recurring rules, and scenarios to explore immediately.
              </p>
            </div>
            <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#A78BFA' }}>
              Load instantly <span>→</span>
            </div>
          </button>

          {/* Manual setup */}
          <button onClick={() => setStep('manual_1')}
            className="flex flex-col items-start gap-3 p-5 rounded-2xl text-left transition-all duration-150"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'none'; }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>✏️</div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Set up manually</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                3 quick questions — balance, paycheck, rent. Ready in under a minute.
              </p>
            </div>
            <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
              3 steps <span>→</span>
            </div>
          </button>

          {/* Import JSON */}
          <label className="flex flex-col items-start gap-3 p-5 rounded-2xl text-left transition-all duration-150 cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'none'; }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>📂</div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Import data</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Restore a previous FlowCast JSON export.
              </p>
            </div>
            <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Upload file <span>→</span>
            </div>
            <input type="file" accept=".json" className="hidden" onChange={importFile} />
          </label>
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          🔒 Everything runs in your browser. No sign-up, no servers, no tracking.
        </p>
      </div>
    </WelcomeShell>
  );
}

// ─── Dark-themed input for welcome steps ──────────────────────────────────────

function DarkInput({ value, onChange, prefix, type, placeholder, autoFocus }) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-4 text-sm font-semibold pointer-events-none" style={{ color: 'rgba(255,255,255,0.35)' }}>{prefix}</span>
      )}
      <input
        type={type || 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-xl py-3 text-sm font-medium text-white outline-none transition-all"
        style={{
          backgroundColor: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          paddingLeft: prefix ? '2.25rem' : '1rem',
          paddingRight: '1rem',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(123,97,255,0.6)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
      />
    </div>
  );
}

function DarkPrimaryButton({ onClick, children, fullWidth }) {
  return (
    <button onClick={onClick}
      className={`px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 ${fullWidth ? 'flex-1' : ''}`}
      style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      {children}
    </button>
  );
}

function DarkGhostButton({ onClick, children }) {
  return (
    <button onClick={onClick}
      className="px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}>
      {children}
    </button>
  );
}

Object.assign(window, { Welcome });
