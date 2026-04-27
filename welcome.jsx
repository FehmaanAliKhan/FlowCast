// FlowCast — Welcome / first-run screen

function Welcome() {
  const { dispatch, toast } = useStore();
  const [step, setStep] = useState('choose'); // 'choose' | 'manual_1' | 'manual_2' | 'manual_3'
  const [manualData, setManualData] = useState({ balance: '', paycheck: '', rent: '' });

  function seedData() {
    dispatch({ type: 'SEED_DATA' });
    toast('Sample data loaded — welcome to FlowCast!', 'success');
  }

  function finishManual() {
    const bal = Money.toCents(parseFloat(manualData.balance) || 0);
    const pay = Money.toCents(parseFloat(manualData.paycheck) || 0);
    const rent = Money.toCents(parseFloat(manualData.rent) || 0);
    dispatch({ type: 'MANUAL_SETUP' });
    if (bal) dispatch({ type: 'UPDATE_SETTINGS', patch: { startingBalanceCents: bal } });
    if (pay) dispatch({ type: 'ADD_RULE', rule: { id: newId('rule'), label: 'Paycheck', amountCents: pay, cadence: 'biweekly', anchorDate: Dates.today(), endDate: null, category: 'income', active: true } });
    if (rent) dispatch({ type: 'ADD_RULE', rule: { id: newId('rule'), label: 'Rent', amountCents: -Math.abs(rent), cadence: 'monthly', anchorDate: Dates.addDays(Dates.today(), 5), endDate: null, category: 'housing', active: true } });
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

  if (step === 'manual_1') return (
    <WelcomeShell>
      <WelcomeStep step={1} total={3} title="What's your starting balance?" sub="Your current checking / savings balance.">
        <Input value={manualData.balance} onChange={v => setManualData(d => ({ ...d, balance: v }))} prefix="$" type="number" placeholder="5,000" autoFocus />
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={() => setStep('choose')}>Back</Button>
          <Button onClick={() => setStep('manual_2')} fullWidth>Continue</Button>
        </div>
      </WelcomeStep>
    </WelcomeShell>
  );

  if (step === 'manual_2') return (
    <WelcomeShell>
      <WelcomeStep step={2} total={3} title="How much is your paycheck?" sub="Per deposit (we'll schedule it bi-weekly).">
        <Input value={manualData.paycheck} onChange={v => setManualData(d => ({ ...d, paycheck: v }))} prefix="$" type="number" placeholder="2,800" autoFocus />
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={() => setStep('manual_1')}>Back</Button>
          <Button onClick={() => setStep('manual_3')} fullWidth>Continue</Button>
        </div>
      </WelcomeStep>
    </WelcomeShell>
  );

  if (step === 'manual_3') return (
    <WelcomeShell>
      <WelcomeStep step={3} total={3} title="What's your monthly rent?" sub="Leave blank if you don't have rent yet.">
        <Input value={manualData.rent} onChange={v => setManualData(d => ({ ...d, rent: v }))} prefix="$" type="number" placeholder="1,500" autoFocus />
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={() => setStep('manual_2')}>Back</Button>
          <Button onClick={finishManual} fullWidth>Start forecasting →</Button>
        </div>
      </WelcomeStep>
    </WelcomeShell>
  );

  return (
    <WelcomeShell>
      <div className="w-full max-w-lg mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)' }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 16 L7 10 L11 13 L15 6 L19 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 6 L19 6 L19 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">FlowCast</span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-3">See where you're headed.</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm mx-auto">
            Project your cash flow months ahead. Fork scenarios. Make better decisions.
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          <button
            onClick={seedData}
            className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 bg-white hover:shadow-md transition-all text-left"
            style={{ borderColor: VIOLET }}
          >
            <span className="text-2xl mt-0.5">⚡</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: VIOLET }}>Start with sample data</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pre-loaded with 3 months of transactions, recurring rules, and two scenarios to explore.</p>
            </div>
          </button>

          <button
            onClick={() => setStep('manual_1')}
            className="w-full flex items-start gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-left"
          >
            <span className="text-2xl mt-0.5">✏️</span>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Set up manually</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">3-step setup: balance, paycheck, rent. Takes about 60 seconds.</p>
            </div>
          </button>

          <label className="w-full flex items-start gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer">
            <span className="text-2xl mt-0.5">📂</span>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Import JSON</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Restore a previous FlowCast export.</p>
            </div>
            <input type="file" accept=".json" className="hidden" onChange={importFile} />
          </label>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          Everything stays in your browser. No accounts, no servers.
        </p>
      </div>
    </WelcomeShell>
  );
}

function WelcomeShell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--app-bg)' }}>
      {children}
    </div>
  );
}

function WelcomeStep({ step, total, title, sub, children }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <p className="text-xs text-slate-400 mb-6 font-medium">Step {step} of {total}</p>
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">{title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{sub}</p>
      {children}
    </div>
  );
}

Object.assign(window, { Welcome });
