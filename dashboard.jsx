// FlowCast — Dashboard (FinSet-inspired layout)

const { useMemo } = React;

const HORIZON_OPTIONS = [
  { value: '3M', label: '3M' }, { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' }, { value: '2Y', label: '2Y' },
];

// ─── Big KPI number (dollars big, cents muted) ────────────────────────────────

function BigMoney({ cents, positive, negative }) {
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const centsPart = String(abs % 100).padStart(2, '0');
  const isNeg = cents < 0;
  const color = positive ? '#10B981' : negative ? '#F87171' : 'var(--text-1)';

  return (
    <div className="flex items-baseline gap-0 font-mono" style={{ color }}>
      {isNeg && <span className="text-2xl font-bold mr-0.5">-</span>}
      <span className="text-[28px] font-bold leading-none tracking-tight">
        ${dollars.toLocaleString()}
      </span>
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
      style={{ backgroundColor: pos ? '#E8FAF2' : '#FEF2F2', color: pos ? '#10B981' : '#F87171' }}>
      {pos ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%{suffix}
    </span>
  );
}

// ─── Dashboard header ─────────────────────────────────────────────────────────

function DashHeader() {
  const { state, dispatch } = useStore();
  const { settings, ui } = state;

  return (
    <div className="flex items-start justify-between mb-6">
      {/* Left: greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Welcome back!</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>It is the best time to manage your finances</p>
      </div>
      {/* Right: search + bell + avatar */}
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-slate-100 text-slate-400">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2C6.239 2 4 4.239 4 7v4l-1.5 2h13L14 11V7c0-2.761-2.239-5-5-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M7 15a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 border-2 border-white" />
        </button>
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)' }}>FC</div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-700 leading-none">FlowCast</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{Dates.format(settings.asOfDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar() {
  const { state, dispatch } = useStore();
  const { horizon } = state.ui;
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="11" rx="2" stroke="#94a3b8" strokeWidth="1.3"/>
          <path d="M5 1v2M9 1v2M1 5h12" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        This month
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <span style={{ color: VIOLET }}>⊞</span> Manage widgets
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)' }}
          onClick={() => dispatch({ type: 'NAV', screen: 'transactions' })}>
          + Add transaction
        </button>
      </div>
    </div>
  );
}

// ─── KPI strip ────────────────────────────────────────────────────────────────

function KPIStrip() {
  const { state } = useStore();
  const { settings, transactions, recurringRules, goals } = state;
  const { startingBalanceCents, asOfDate } = settings;

  const thisMonth = Dates.monthKey(asOfDate);
  const lastMonth = Dates.monthKey(Dates.addMonths(thisMonth + '-01', -1));
  const thisStats = useMemo(() => StatsEngine.monthStats(transactions, recurringRules, thisMonth), [transactions, recurringRules, thisMonth]);
  const lastStats = useMemo(() => StatsEngine.monthStats(transactions, recurringRules, lastMonth), [transactions, recurringRules, lastMonth]);

  const incomeDelta = lastStats.income ? ((thisStats.income - lastStats.income) / Math.abs(lastStats.income)) * 100 : null;
  const expDelta    = lastStats.expenses ? ((thisStats.expenses - lastStats.expenses) / Math.abs(lastStats.expenses)) * 100 : null;

  // Runway
  const runwayPoints = useMemo(() => ForecastEngine.run({
    startingBalanceCents,
    transactions: [],
    recurringRules: recurringRules.filter(r => r.amountCents < 0),
    startDate: asOfDate,
    endDate: Dates.addMonths(asOfDate, 24),
    downsampleResult: false,
  }), [startingBalanceCents, recurringRules, asOfDate]);
  const runway = RunwayEngine.compute(runwayPoints);

  // Primary goal savings progress
  const primaryGoal = goals[0];

  const kpis = [
    {
      label: 'Total balance',
      value: <BigMoney cents={startingBalanceCents} />,
      delta: <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <span className="text-emerald-500 font-semibold">↑ 12.1%</span> vs last month
      </span>,
    },
    {
      label: 'Income',
      value: <BigMoney cents={thisStats.income} />,
      delta: <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        {incomeDelta !== null
          ? <><DeltaBadge value={incomeDelta} /> <span>vs last month</span></>
          : <span>This month</span>}
      </span>,
    },
    {
      label: 'Expense',
      value: <BigMoney cents={Math.abs(thisStats.expenses)} negative />,
      delta: <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        {expDelta !== null
          ? <><DeltaBadge value={-expDelta} /> <span>vs last month</span></>
          : <span>This month</span>}
      </span>,
    },
    {
      label: 'Runway',
      value: <div className="text-[28px] font-bold font-mono leading-none tracking-tight" style={{ color: 'var(--text-1)' }}>
        {runway === null ? '2yr+' : `${runway}d`}
      </div>,
      delta: <span className="text-xs" style={{ color: "var(--text-3)" }}>
        {runway === null ? 'Stays positive in window' : runway < 60 ? <span className="text-red-400 font-semibold">Low runway</span> : 'Until balance hits $0'}
      </span>,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map(k => (
        <Card key={k.label} className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--text-3)" }}>{k.label}</p>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--chip-bg)' }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1.5 9.5L9.5 1.5M9.5 1.5H4.5M9.5 1.5V6.5" stroke="#c4c9d9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {k.value}
          {k.delta}
        </Card>
      ))}
    </div>
  );
}

// ─── Money flow chart (grouped bar: income + expense by month) ────────────────

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
        <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>Money flow</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: '#6C5DD3' }} /> Income
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: '#C4B5FD' }} /> Expense
            </span>
          </div>
          <SegmentedControl
            options={HORIZON_OPTIONS}
            value={horizon}
            onChange={h => dispatch({ type: 'SET_HORIZON', horizon: h })}
          />
        </div>
      </div>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={months} barGap={4} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => Money.formatK(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
            <Tooltip formatter={(v, k) => [Money.format(v), k === 'income' ? 'Income' : 'Expense']}
              contentStyle={{ fontSize: 12, borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="income"  fill="#6C5DD3" radius={[4,4,0,0]} maxBarSize={28} />
            <Bar dataKey="expense" fill="#C4B5FD" radius={[4,4,0,0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
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
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>Budget</p>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--chip-bg)' }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1.5 9.5L9.5 1.5M9.5 1.5H4.5M9.5 1.5V6.5" stroke="#c4c9d9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-slate-400 py-4">No spending data</p>
      ) : (
        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="cents" nameKey="cat" cx="50%" cy="50%" innerRadius={36} outerRadius={54} paddingAngle={2} animationDuration={400}>
                  {data.map((d, i) => <Cell key={d.cat} fill={categoryColor(d.cat)} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] text-slate-400 leading-none">Total</p>
              <p className="text-xs font-bold text-slate-800 leading-none mt-0.5">{Money.formatK(total)}</p>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            {data.slice(0, 6).map(d => (
              <div key={d.cat} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryColor(d.cat) }} />
                <span className="text-xs text-slate-500 flex-1 truncate">{categoryLabel(d.cat)}</span>
                <span className="text-xs font-mono font-semibold text-slate-700 shrink-0">{Money.formatK(d.cents)}</span>
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
      <div className="bg-white rounded-xl p-3 text-sm min-w-[160px]" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <p className="text-xs text-slate-400 mb-2">{label ? Dates.format(label) : ''}</p>
        {payload.filter(p => p.dataKey !== 'p10' && p.dataKey !== 'p90').map(p => {
          const sc = scenarios.find(s => s.id === p.dataKey);
          if (!sc || p.value == null) return null;
          return (
            <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.color }} />
                <span className="text-slate-600 text-xs">{sc.name}</span>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-800">{Money.format(p.value)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="p-5 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>Forecast</p>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
            <XAxis dataKey="date" tickFormatter={d => d ? Dates.formatShort(d) : ''} tick={{ fontSize: 10, fill: '#c4c9d9' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tickFormatter={v => Money.formatK(v)} tick={{ fontSize: 10, fill: '#c4c9d9', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={56} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
            <ReferenceLine y={0} stroke="#fca5a5" strokeDasharray="4 4" strokeWidth={1} />
            {showMonteCarlo && mcBands.length > 0 && <>
              <Area dataKey="p90" stroke="none" fill="#6C5DD3" fillOpacity={0.06} legendType="none" activeDot={false} isAnimationActive={false} />
              <Area dataKey="p10" stroke="none" fill="#fff" fillOpacity={1} legendType="none" activeDot={false} isAnimationActive={false} />
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

// ─── Recent transactions (mini table) ────────────────────────────────────────

function RecentTransactions() {
  const { state, dispatch } = useStore();
  const { transactions } = state;
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>Recent transactions</p>
        <button onClick={() => dispatch({ type: 'NAV', screen: 'transactions' })}
          className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors hover:bg-slate-50"
          style={{ color: VIOLET }}>See all →</button>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">No transactions yet</p>
      ) : (
        <div>
          <div className="grid grid-cols-[80px_1fr_80px] gap-2 px-2 pb-2 border-b border-slate-100">
            {['DATE', 'NOTE', 'AMOUNT'].map(h => (
              <p key={h} className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{h}</p>
            ))}
          </div>
          <div className="flex flex-col">
            {recent.map(tx => (
              <div key={tx.id} className="grid grid-cols-[80px_1fr_80px] gap-2 items-center px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => dispatch({ type: 'NAV', screen: 'transactions' })}>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>{Dates.formatShort(tx.date)}</p>
                <div className="flex items-center gap-2 min-w-0">
                  <CategoryDot category={tx.category} size={7} />
                  <p className="text-xs text-slate-700 truncate">{tx.note || categoryLabel(tx.category)}</p>
                </div>
                <p className={`text-xs font-mono font-semibold text-right ${tx.amountCents > 0 ? 'text-emerald-500' : 'text-slate-700'}`}>
                  {tx.amountCents > 0 ? '+' : ''}{Money.format(tx.amountCents)}
                </p>
              </div>
            ))}
          </div>
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
        <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>Saving goals</p>
        <button onClick={() => dispatch({ type: 'NAV', screen: 'goals' })}
          className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--chip-bg)' }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1.5 9.5L9.5 1.5M9.5 1.5H4.5M9.5 1.5V6.5" stroke="#c4c9d9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      {goals.length === 0 ? (
        <div className="text-sm text-slate-400 py-4 text-center">
          <p>No goals yet</p>
          <button onClick={() => dispatch({ type: 'NAV', screen: 'goals' })} className="text-xs mt-2 font-semibold" style={{ color: VIOLET }}>+ Add a goal</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map(g => {
            const pct = Math.min(100, Math.round((settings.startingBalanceCents / g.targetAmountCents) * 100));
            const colors = [VIOLET, '#10B981', '#F59E0B', '#14B8A6'];
            const color = colors[goals.indexOf(g) % colors.length];
            return (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-700">{g.name}</p>
                  <p className="text-xs font-mono font-semibold text-slate-500">{Money.format(g.targetAmountCents)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--chip-bg)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color }}>{pct}%</span>
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
      <FilterBar />
      <KPIStrip />

      {/* Row 2: Money flow + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2"><MoneyFlowChart /></div>
        <div><BudgetDonut /></div>
      </div>

      {/* Row 3: Forecast */}
      <ForecastChart />

      {/* Row 4: Recent transactions + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><RecentTransactions /></div>
        <div><SavingGoals /></div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
