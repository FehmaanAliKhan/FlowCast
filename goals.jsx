// FlowCast — Goals screen

function GoalForm({ goal, onSave, onDelete, onClose }) {
  const isEdit = !!goal;
  const [name, setName]     = useState(goal?.name || '');
  const [target, setTarget] = useState(goal ? (goal.targetAmountCents / 100).toFixed(2) : '');
  const [date, setDate]     = useState(goal?.targetDate || Dates.addMonths(Dates.today(), 6));
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useStore();

  function handleSave() {
    if (!name.trim()) { toast('Enter a name.', 'error'); return; }
    const cents = Money.toCents(parseFloat(target || 0));
    if (!cents) { toast('Enter a target amount.', 'error'); return; }
    onSave({ id: goal?.id || newId('goal'), name: name.trim(), targetAmountCents: cents, targetDate: date });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        <Input label="Goal name" value={name} onChange={setName} placeholder="e.g. Emergency Fund" autoFocus />
        <Input label="Target amount" value={target} onChange={setTarget} prefix="$" type="number" placeholder="10,000" />
        <Input label="Target date" type="date" value={date} onChange={setDate} />
      </div>
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2 shrink-0">
        <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>
        <Button onClick={handleSave} size="sm" fullWidth>{isEdit ? 'Save changes' : 'Add goal'}</Button>
        {isEdit && <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)}>Delete</Button>}
      </div>
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Delete this goal?">
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onDelete(goal.id); setShowConfirm(false); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function GoalCard({ goal, forecasts, scenarios, onEdit }) {
  const pct = Math.min(100, Math.round((forecasts['scenario_baseline']?.[forecasts['scenario_baseline'].length - 1]?.balance ?? 0) / goal.targetAmountCents * 100));

  // Per-scenario probability
  const scenarioProbabilities = useMemo(() => {
    return scenarios.map(s => {
      const pts = forecasts[s.id] || [];
      const targetPt = pts.find(p => p.date >= goal.targetDate) || pts[pts.length - 1];
      const hit = targetPt && targetPt.balance >= goal.targetAmountCents;
      return { scenario: s, hit };
    });
  }, [forecasts, scenarios, goal]);

  return (
    <Card className="p-5" hover onClick={onEdit}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{goal.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Target: {Dates.format(goal.targetDate)}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-base font-semibold text-slate-800 dark:text-slate-100">{Money.format(goal.targetAmountCents)}</p>
          <p className="text-xs text-slate-400">{pct}% there</p>
        </div>
      </div>

      <ProgressBar value={pct} max={100} color="#10B981" className="mb-4" />

      {/* Per-scenario probability bars */}
      <div className="flex flex-col gap-2">
        {scenarioProbabilities.map(({ scenario, hit }) => (
          <div key={scenario.id} className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: scenario.color }} />
            <span className="text-xs text-slate-500 dark:text-slate-400 w-24 truncate">{scenario.name}</span>
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: hit ? '100%' : '12%', backgroundColor: hit ? '#10B981' : '#f87171' }} />
            </div>
            <span className={`text-xs font-medium w-8 text-right ${hit ? 'text-emerald-600' : 'text-red-400'}`}>{hit ? '✓' : '✕'}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Goals() {
  const { state, dispatch, toast } = useStore();
  const { goals, scenarios, settings, transactions, recurringRules, ui } = state;
  const [editGoal, setEditGoal] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const startDate = settings.asOfDate;
  const endDate = Dates.horizonEnd(startDate, '2Y'); // always look 2 years ahead for goals
  const baseInputs = { startingBalanceCents: settings.startingBalanceCents, transactions, recurringRules };

  const forecastMap = useMemo(() => {
    const m = {};
    scenarios.forEach(s => {
      const inputs = s.isBaseline ? baseInputs : ScenariosEngine.apply(baseInputs, s);
      m[s.id] = ForecastEngine.run({ ...inputs, startDate, endDate });
    });
    return m;
  }, [scenarios, baseInputs, startDate, endDate]);

  function openNew() { setEditGoal(null); setDrawerOpen(true); }

  function handleSave(g) {
    if (editGoal) { dispatch({ type: 'UPDATE_GOAL', goal: g }); toast('Goal updated.', 'success'); }
    else          { dispatch({ type: 'ADD_GOAL', goal: g });    toast('Goal added.', 'success'); }
    setDrawerOpen(false);
  }

  function handleDelete(id) {
    dispatch({ type: 'DELETE_GOAL', id });
    toast('Goal deleted.');
    setDrawerOpen(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ScreenHeader title="Goals" action={<Button onClick={openNew} size="sm">+ Add goal</Button>} />

      {goals.length === 0 ? (
        <EmptyState icon="◎" title="No goals yet" description="Track savings targets and see which scenarios get you there." action={<Button onClick={openNew} size="sm">+ Add goal</Button>} />
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map(g => (
            <GoalCard key={g.id} goal={g} forecasts={forecastMap} scenarios={scenarios} onEdit={() => { setEditGoal(g); setDrawerOpen(true); }} />
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editGoal ? 'Edit goal' : 'New goal'}>
        <GoalForm goal={editGoal} onSave={handleSave} onDelete={handleDelete} onClose={() => setDrawerOpen(false)} />
      </Drawer>
    </div>
  );
}

Object.assign(window, { Goals });
