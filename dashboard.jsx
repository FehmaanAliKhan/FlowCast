// FlowCast — Dashboard

const HORIZON_OPTIONS = [
  { value: '3M', label: '3M' }, { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' }, { value: '2Y', label: '2Y' },
];

// ─── Big KPI number ───────────────────────────────────────────────────────────

function BigMoney({ cents, positive, negative }) {
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const centsPart = String(abs % 100).padStart(2, '0');
  const isNeg = cents < 0;
  const color = positive ? '#10B981' : negative ? '#F87171' : 'var(--text-1)';
  return (
    <div className="flex items-baseline gap-0 font-mono" style={{ color }}>
      {isNeg && <span className="text-2xl font-bold mr-0.5">-</span>}
      <span className="text-[28px] font-bold leading-none tracking-tight">${dollars.toLocaleString()}</span>
      <span className="text-xl font-semibold leading-none opacity-40">.{centsPart}</span>
    </div>
  );
}

// ─── Delta badge ──────────────────────────────────────────────────────────────

function DeltaBadge({ value, suffix = '' }) {
  if (value == null) return null;
  const pos = value >= 0;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-lg"
      style={{ backgroundColor: pos ? 'rgba(16,185,129,0.12)' : 'rgba(248,113,113,0.12)', color: pos ? '#10B981' : '#F87171' }}>
      {pos ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%{suffix}
    </span>
  );
}

// ─── Dashboard header ─────────────────────────────────────────────────────────

function DashHeader() {
  const { state } = useStore();
  const { settings } = state;
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>Welcome back!</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>Here's your financial overview</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2C6.239 2 4 4.239 4 7v4l-1.5 2h13L14 11V7c0-2.761-2.239-5-5-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M7 15a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400"
            style={{ border: '2px solid var(--card-bg)' }} />
        </button>
        <div className="flex items-center gap-2.5 pl-2" style={{ borderLeft: '1px solid var(--border)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)' }}>FC</div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-1)' }}>FlowCast</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>{Dates.format(settings.asOfDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Balance hero card ────────────────────────────────────────────────────────

function BalanceHeroCard() {
  const { state } = useStore();
  const { settings, transactions, recurringRules } = state;
  const { startingBalanceCents, asOfDate } = settings;
  const thisMonth = Dates.monthKey(asOfDate);
  const stats = useMemo(
    () => StatsEngine.monthStats(transactions, recurringRules, thisMonth),
    [transactions, recurringRules, thisMonth]
  );
  const net = stats.income + stats.expenses;

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 mb-5"
      style={{ background: 'linear-gradient(135deg,#1a1040 0%,#2d1b69 40%,#1e1255 70%,#0f0a2e 100%)', minHeight: 180 }}>
      {/* Decorative blobs */}
      <div className="absolute pointer-events-none" style={{ top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(123,97,255,0.3) 0%,transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: -20, left: '30%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(91,79,233,0.2) 0%,transparent 70%)' }} />

      {/* Virtual card chip top-right */}
      <div className="absolute top-5 right-6 flex flex-col items-end gap-2">
        <div className="flex">
          <div className="w-7 h-7 rounded-full opacity-40" style={{ background: 'radial-gradient(circle,#F59E0B,#EF4444)' }} />
          <div className="w-7 h-7 rounded-full opacity-60 -ml-3" style={{ background: 'radial-gradient(circle,#EF4444,#DC2626)' }} />
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Virtual Card</p>
          <p className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>•••• •••• •••• 4291</p>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Balance</p>
        <div className="flex items-baseline gap-1 font-mono mb-5">
          <span className="text-4xl font-bold text-white">${Math.floor(Math.abs(startingBalanceCents) / 100).toLocaleString()}</span>
          <span className="text-2xl font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>.{String(Math.abs(startingBalanceCents) % 100).padStart(2, '0')}</span>
        </div>

        <div className="flex gap-6">
          {[
            { label: 'Income',   value: stats.income,             color: '#10B981', dir: '↑' },
            { label: 'Expenses', value: Math.abs(stats.expenses), color: '#F87171', dir: '↓' },
            { label: 'Net',      value: Math.abs(net),            color: net >= 0 ? '#10B981' : '#F87171', dir: net >= 0 ? '+' : '−' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.color}25` }}>
                  <span style={{ color: item.color, fontSize: 10, lineHeight: 1 }}>{item.dir}</span>
                </div>
                <span className="text-sm font-mono font-bold" style={{ color: item.color }}>{Money.formatK(item.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Quick actions ────────────────────────────────────────────────────────────

function QuickActions() {
  const { dispatch } = useStore();
  const actions = [
    { label: 'Add Transaction', symbol: '+',  color: '#7B61FF', bg: 'rgba(123,97,255,0.12)', screen: 'transactions' },
    { label: 'New Scenario',    symbol: '⎇',  color: '#10B981', bg: 'rgba(16,185,129,0.12)',  screen: 'scenarios' },
    { label: 'Set Goal',        symbol: '◎',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  screen: 'goals' },
    { label: 'Recurring',       symbol: '↻',  color: '#14B8A6', bg: 'rgba(20,184,166,0.12)', screen: 'recurring' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {actions.map(a => (
        <button key={a.label} onClick={() => dispatch({ type: 'NAV', screen: a.screen })}
          className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-150"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${a.color}22`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: a.bg, color: a.color }}>
            {a.symbol}
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── KPI strip ────────────────────────────────────────────────────────────────

function KPIStrip() {
  const { state } = useStore();
  const { settings, transactions, recurringRules } = state;
  const { startingBalanceCents, asOfDate } = settings;

  const thisMonth = Dates.monthKey(asOfDate);
  const lastMonth = Dates.monthKey(Dates.addMonths(thisMonth + '-01', -1));
  const thisStats = useMemo(() => StatsEngine.monthStats(transactions, recurringRules, thisMonth), [transactions, recurringRules, thisMonth]);
  const lastStats = useMemo(() => StatsEngine.monthStats(transactions, recurringRules, lastMonth), [transactions, recurringRules, lastMonth]);

  const incomeDelta = lastStats.income ? ((thisStats.income - lastStats.income) / Math.abs(lastStats.income)) * 100 : null;
  const expDelta    = lastStats.expenses ? ((thisStats.expenses - lastStats.expenses) / Math.abs(lastStats.expenses)) * 100 : null;
  const net = thisStats.income + thisStats.expenses;

  const runwayPoints = useMemo(() => ForecastEngine.run({
    startingBalanceCents,
    transactions: [],
    recurringRules: recurringRules.filter(r => r.amountCents < 0),
    startDate: asOfDate,
    endDate: Dates.addMonths(asOfDate, 24),
    downsampleResult: false,
  }), [startingBalanceCents, recurringRules, asOfDate]);
  const runway = RunwayEngine.compute(runwayPoints);

  const kpis = [
    {
      label: 'Income this month', accent: '#10B981',
      value: <BigMoney cents={thisStats.income} />,
      sub: incomeDelta !== null
        ? <span className="flex items-center gap-1.5"><DeltaBadge value={incomeDelta} /><span>vs last month</span></span>
        : <span>This month</span>,
    },
    {
      label: 'Expenses this month', accent: '#F87171',
      value: <BigMoney cents={Math.abs(thisStats.expenses)} negative />,
      sub: expDelta !== null
        ? <span className="flex items-center gap-1.5"><DeltaBadge value={-expDelta} /><span>vs last month</span></span>
        : <span>This month</span>,
    },
    {
      label: 'Net cash flow', accent: net >= 0 ? '#10B981' : '#F87171',
      value: <BigMoney cents={net} positive={net >= 0} negative={net < 0} />,
      sub: <span>Income − Expenses</span>,
    },
    {
      label: 'Cash runway', accent: runway !== null && runway < 60 ? '#F87171' : '#14B8A6',
      value: <div className="text-[28px] font-bold font-mono leading-none tracking-tight" style={{ color: 'var(--text-1)' }}>
        {runway === null ? '2yr+' : `${runway}d`}
      </div>,
      sub: <span style={{ color: runway !== null && runway < 60 ? '#F87171' : undefined }}>
        {runway === null ? 'Stays positive' : runway < 60 ? 'Low — add income!' : 'Until balance hits $0'}
      </span>,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map(k => (
        <Card key={k.label} className="p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>{k.label}</p>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: k.accent }} />
          </div>
          {k.value}
          <div className="text-xs" style={{ color: 'var(--text-3)' }}>{k.sub}</div>
        </Card>
      ))}
    </div>
  );
}

// ─── Money flow chart ─────────────────────────────────────────────────────────

function MoneyFlowChart() {
  const { state, dispatch } = useStore();
  const { settings, transactions, recurringRules, ui } = state;
  const { horizon } = ui;

  const months = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const mk = Dates.monthKey(Dates.addMonths(settings.asOfDate, -i));
      const s = StatsEngine.monthStats(transactions, recurringRules, mk);
      result.push({
        month: Dates.MONTHS[parseInt(mk.split('-')[1]) - 1],
        income: s.income,
        expense: Math.abs(s.expenses),
      });
    }
    return result;
  }, [settings.asOfDate, transactions, recurringRules]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Money Flow</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {[['#6C5DD3', 'Income'], ['#C4B5FD', 'Expense']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
                <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: c }} /> {l}
              </span>
            ))}
          </div>
          <SegmentedControl options={HORIZON_OPTIONS} value={horizon}
            onChange={h => dispatch({ type: 'SET_HORIZON', horizon: h })} />
        </div>
      </div>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={months} barGap={4} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => Money.formatK(v)} tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} width={48} />
            <Tooltip formatter={(v, k) => [Money.format(v), k === 'income' ? 'Income' : 'Expense']}
              contentStyle={{ fontSize: 12, borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', backgroundColor: 'var(--card-bg)', color: 'var(--text-1)' }} />
            <Bar dataKey="income"  fill="#6C5DD3" radius={[4,4,0,0]} maxBarSize={28} />
            <Bar dataKey="expense" fill="#C4B5FD" radius={[4,4,0,0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// ─── Upcoming bills widget ────────────────────────────────────────────────────

function UpcomingBills() {
  const { state } = useStore();
  const { recurringRules, settings } = state;
  const today = settings.asOfDate;
  const cutoff = Dates.addMonths(today, 1);

  const upcoming = useMemo(() => {
    const bills = [];
    recurringRules.filter(r => r.active && r.amountCents < 0).forEach(rule => {
      RecurringEngine.nextN(rule, 3).forEach(date => {
        if (date >= today && date <= cutoff) {
          bills.push({ rule, date, daysUntil: Dates.diffDays(today, date) });
        }
      });
    });
    return bills.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  }, [recurringRules, today, cutoff]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Upcoming Bills</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ backgroundColor: 'rgba(248,113,113,0.1)', color: '#F87171' }}>Next 30 days</span>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: 'var(--text-3)' }}>No bills in the next 30 days</p>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.map(({ rule, date, daysUntil }) => (
            <div key={`${rule.id}-${date}`} className="flex items-center gap-3">
              <CategoryIcon category={rule.category} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-1)' }}>{rule.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{Dates.format(date)}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="text-xs font-mono font-bold" style={{ color: '#F87171' }}>{Money.format(rule.amountCents)}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: daysUntil <= 3 ? 'rgba(248,113,113,0.15)' : 'rgba(123,97,255,0.1)', color: daysUntil <= 3 ? '#F87171' : '#7B61FF' }}>
                  {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Financial health score ───────────────────────────────────────────────────

function FinancialHealth() {
  const { state } = useStore();
  const { settings, transactions, recurringRules, goals } = state;
  const { startingBalanceCents, asOfDate } = settings;
  const thisMonth = Dates.monthKey(asOfDate);
  const stats = useMemo(() => StatsEngine.monthStats(transactions, recurringRules, thisMonth), [transactions, recurringRules, thisMonth]);

  const savingsRate = stats.income > 0 ? Math.max(0, Math.min(100, ((stats.income + stats.expenses) / stats.income) * 100)) : 0;

  const runwayPoints = useMemo(() => ForecastEngine.run({
    startingBalanceCents,
    transactions: [],
    recurringRules: recurringRules.filter(r => r.amountCents < 0),
    startDate: asOfDate,
    endDate: Dates.addMonths(asOfDate, 24),
    downsampleResult: false,
  }), [startingBalanceCents, recurringRules, asOfDate]);
  const runway = RunwayEngine.compute(runwayPoints);
  const runwayScore = runway === null ? 100 : Math.min(100, (runway / 365) * 100);
  const goalsScore = goals.length === 0 ? 0 : Math.min(100, 60 + goals.length * 20);

  const overallScore = Math.round(savingsRate * 0.4 + runwayScore * 0.4 + goalsScore * 0.2);
  const scoreColor = overallScore >= 70 ? '#10B981' : overallScore >= 40 ? '#F59E0B' : '#F87171';
  const scoreLabel = overallScore >= 70 ? 'Excellent' : overallScore >= 40 ? 'Fair' : 'Needs work';

  const sz = 100, cx = 50, cy = 50, r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (overallScore / 100) * circ;

  return (
    <Card className="p-5">
      <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-1)' }}>Financial Health</p>
      <div className="flex items-center gap-4">
        {/* Arc ring */}
        <div className="relative shrink-0" style={{ width: sz, height: sz }}>
          <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--chip-bg)" strokeWidth="10" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={scoreColor} strokeWidth="10"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold font-mono leading-none" style={{ color: scoreColor }}>{overallScore}</span>
            <span className="text-[9px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--text-3)' }}>{scoreLabel}</span>
          </div>
        </div>
        {/* Sub-metric bars */}
        <div className="flex flex-col gap-2.5 flex-1">
          {[
            { label: 'Savings rate', value: Math.round(savingsRate), color: '#10B981' },
            { label: 'Cash runway',  value: Math.round(runwayScore), color: '#7B61FF' },
            { label: 'Goals set',    value: Math.round(goalsScore),  color: '#F59E0B' },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between mb-1">
                <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{m.label}</span>
                <span className="text-[10px] font-bold font-mono" style={{ color: m.color }}>{m.value}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--chip-bg)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Budget donut ─────────────────────────────────────────────────────────────

function BudgetDonut() {
  const { state } = useStore();
  const { settings, transactions, recurringRules } = state;
  const thisMonth = Dates.monthKey(settings.asOfDate);
  const data = useMemo(() => StatsEngine.categoryBreakdown(transactions, recurringRules, thisMonth), [transactions, recurringRules, thisMonth]);
  const total = data.reduce((s, d) => s + d.cents, 0);

  return (
    <Card className="p-5">
      <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-1)' }}>Spending by Category</p>
      {data.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--text-3)' }}>No spending data</p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="cents" nameKey="cat" cx="50%" cy="50%" innerRadius={36} outerRadius={54} paddingAngle={2} animationDuration={400}>
                  {data.map(d => <Cell key={d.cat} fill={categoryColor(d.cat)} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] leading-none" style={{ color: 'var(--text-3)' }}>Total</p>
              <p className="text-xs font-bold leading-none mt-0.5" style={{ color: 'var(--text-1)' }}>{Money.formatK(total)}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            {data.slice(0, 6).map(d => (
              <div key={d.cat} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryColor(d.cat) }} />
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-3)' }}>{categoryLabel(d.cat)}</span>
                <span className="text-xs font-mono font-semibold shrink-0" style={{ color: 'var(--text-1)' }}>{Money.formatK(d.cents)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Forecast chart ───────────────────────────────────────────────────────────

function ForecastChart() {
  const { state, dispatch } = useStore();
  const { scenarios, ui } = state;
  const { horizon, showMonteCarlo, activeScenarioIds } = ui;
  const { forecasts, startDate, endDate } = useForecasts();

  const baselinePoints = forecasts['scenario_baseline']?.points || [];
  const mcBands = useMemo(() => {
    if (!showMonteCarlo || !baselinePoints.length) return [];
    return MonteCarloEngine.run({ points: baselinePoints, varianceFactor: 0.08, simCount: 200 });
  }, [showMonteCarlo, baselinePoints]);

  const chartData = useMemo(() => {
    const allDates = new Set();
    Object.values(forecasts).forEach(f => f.points.forEach(p => allDates.add(p.date)));
    const sorted = [...allDates].sort();
    const totalDays = Dates.diffDays(startDate, endDate);
    const step = Math.max(1, Math.floor(totalDays / 100));
    const sampled = sorted.filter((_, i) => i % step === 0 || i === sorted.length - 1);
    const mcMap = {};
    mcBands.forEach(b => { mcMap[b.date] = b; });
    return sampled.map(date => {
      const row = { date };
      Object.entries(forecasts).forEach(([sid, { points }]) => {
        const pt = points.find(p => p.date >= date) || points[points.length - 1];
        if (pt) row[sid] = pt.balance;
      });
      if (mcMap[date]) { row.p90 = mcMap[date].p90; row.p10 = mcMap[date].p10; }
      return row;
    });
  }, [forecasts, mcBands, startDate, endDate]);

  const activeScenarios = scenarios.filter(s => activeScenarioIds.includes(s.id));

  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl p-3 text-sm min-w-[160px]"
        style={{ backgroundColor: 'var(--card-bg)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid var(--border)' }}>
        <p className="text-xs mb-2" style={{ color: 'var(--text-3)' }}>{label ? Dates.format(label) : ''}</p>
        {payload.filter(p => p.dataKey !== 'p10' && p.dataKey !== 'p90').map(p => {
          const sc = scenarios.find(s => s.id === p.dataKey);
          if (!sc || p.value == null) return null;
          return (
            <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.color }} />
                <span className="text-xs" style={{ color: 'var(--text-2)' }}>{sc.name}</span>
              </div>
              <span className="font-mono text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{Money.format(p.value)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="p-5 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Cash Flow Forecast</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {scenarios.map(s => (
              <Chip key={s.id} label={s.name} color={s.color} active={activeScenarioIds.includes(s.id)}
                onClick={() => dispatch({ type: 'TOGGLE_SCENARIO_ACTIVE', id: s.id })} />
            ))}
          </div>
          <Toggle checked={showMonteCarlo} onChange={() => dispatch({ type: 'TOGGLE_MONTE_CARLO' })} label="Uncertainty" size="sm" />
          <SegmentedControl options={HORIZON_OPTIONS} value={horizon} onChange={h => dispatch({ type: 'SET_HORIZON', horizon: h })} />
        </div>
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={d => d ? Dates.formatShort(d) : ''} tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tickFormatter={v => Money.formatK(v)} tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={56} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
            <ReferenceLine y={0} stroke="#fca5a5" strokeDasharray="4 4" strokeWidth={1} />
            {showMonteCarlo && mcBands.length > 0 && <>
              <Area dataKey="p90" stroke="none" fill="#6C5DD3" fillOpacity={0.06} legendType="none" activeDot={false} isAnimationActive={false} />
              <Area dataKey="p10" stroke="none" fill="var(--app-bg)" fillOpacity={1} legendType="none" activeDot={false} isAnimationActive={false} />
            </>}
            {activeScenarios.map(s => (
              <Line key={s.id} dataKey={s.id} stroke={s.color} strokeWidth={s.isBaseline ? 2.5 : 2}
                dot={false} activeDot={{ r: 4, fill: s.color, stroke: 'white', strokeWidth: 2 }}
                strokeDasharray={s.isBaseline ? undefined : '6 3'} animationDuration={300} connectNulls />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// ─── Recent transactions ──────────────────────────────────────────────────────

function RecentTransactions() {
  const { state, dispatch } = useStore();
  const { transactions } = state;
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Recent Transactions</p>
        <button onClick={() => dispatch({ type: 'NAV', screen: 'transactions' })}
          className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
          style={{ color: VIOLET }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          See all →
        </button>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--text-3)' }}>No transactions yet</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {recent.map(tx => (
            <div key={tx.id}
              className="flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer transition-colors"
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => dispatch({ type: 'NAV', screen: 'transactions' })}>
              <CategoryIcon category={tx.category} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text-1)' }}>{tx.note || categoryLabel(tx.category)}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{Dates.formatShort(tx.date)} · {categoryLabel(tx.category)}</p>
              </div>
              <p className="text-xs font-mono font-semibold shrink-0"
                style={{ color: tx.amountCents > 0 ? '#10B981' : 'var(--text-1)' }}>
                {tx.amountCents > 0 ? '+' : ''}{Money.format(tx.amountCents)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Saving goals (mini) ──────────────────────────────────────────────────────

function SavingGoals() {
  const { state, dispatch } = useStore();
  const { goals, settings } = state;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Saving Goals</p>
        <button onClick={() => dispatch({ type: 'NAV', screen: 'goals' })}
          className="text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
          style={{ color: VIOLET }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          Manage →
        </button>
      </div>
      {goals.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm mb-2" style={{ color: 'var(--text-3)' }}>No goals yet</p>
          <button onClick={() => dispatch({ type: 'NAV', screen: 'goals' })}
            className="text-xs font-semibold" style={{ color: VIOLET }}>+ Add a goal</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map((g, i) => {
            const pct = Math.min(100, Math.round((settings.startingBalanceCents / g.targetAmountCents) * 100));
            const colors = [VIOLET, '#10B981', '#F59E0B', '#14B8A6'];
            const color = colors[i % colors.length];
            return (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{g.name}</p>
                  <p className="text-xs font-mono font-semibold" style={{ color }}>{pct}%</p>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'var(--chip-bg)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>Now: {Money.formatK(settings.startingBalanceCents)}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>Goal: {Money.formatK(g.targetAmountCents)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <DashHeader />
      <BalanceHeroCard />
      <QuickActions />
      <KPIStrip />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2"><MoneyFlowChart /></div>
        <div><UpcomingBills /></div>
      </div>

      <ForecastChart />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><RecentTransactions /></div>
        <div className="flex flex-col gap-4">
          <SavingGoals />
          <FinancialHealth />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
