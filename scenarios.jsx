// FlowCast — Scenarios screen + editor



// ─── Mini sparkline ───────────────────────────────────────────────────────────

function MiniSparkline({ points, basePoints, color }) {
  if (!points?.length) return null;
  const combined = points.map((p, i) => ({
    date: p.date,
    scenario: p.balance,
    baseline: basePoints?.[i]?.balance,
  }));
  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={combined} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        {basePoints && (
          <Line dataKey="baseline" stroke="#94a3b8" strokeWidth={1} dot={false} isAnimationActive={false} strokeDasharray="4 2" />
        )}
        <Line dataKey="scenario" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Override editor ──────────────────────────────────────────────────────────

function OverrideItem({ ov, rules, onRemove }) {
  const getLabel = () => {
    if (ov.type === 'add_rule') return `+ ${ov.rule.label} (${Money.format(ov.rule.amountCents)}/mo)`;
    if (ov.type === 'remove_rule') { const r = rules.find(r => r.id === ov.ruleId); return `✕ Remove: ${r?.label || ov.ruleId}`; }
    if (ov.type === 'modify_rule') { const r = rules.find(r => r.id === ov.ruleId); return `~ Modify: ${r?.label || ov.ruleId}`; }
    if (ov.type === 'add_event') return `⚡ ${ov.event.note || 'One-off event'} on ${Dates.format(ov.event.date)}`;
    return ov.type;
  };
  return (
    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
      <span className="flex-1 text-sm text-slate-600 dark:text-slate-300">{getLabel()}</span>
      <button onClick={onRemove} className="text-slate-300 hover:text-red-400 transition-colors text-sm">✕</button>
    </div>
  );
}

function AddOverridePanel({ rules, onAdd, onClose }) {
  const [mode, setMode] = useState(null); // 'add_rule'|'remove_rule'|'modify_rule'|'add_event'
  const [ruleId, setRuleId] = useState(rules[0]?.id || '');
  const [patch, setPatch] = useState({ amountCents: '', label: '' });
  const [eventDate, setEventDate] = useState(Dates.today());
  const [eventAmt, setEventAmt] = useState('');
  const [eventNote, setEventNote] = useState('');
  const [newRule, setNewRule] = useState({ label: '', amountCents: '', cadence: 'monthly', anchorDate: Dates.today(), category: 'other' });

  if (!mode) return (
    <div className="flex flex-col gap-2 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Add override</p>
      {[
        { type: 'add_rule',    label: '+ Add a new rule' },
        { type: 'modify_rule', label: '~ Modify existing rule' },
        { type: 'remove_rule', label: '✕ Remove a rule' },
        { type: 'add_event',   label: '⚡ One-off event' },
      ].map(o => (
        <button key={o.type} onClick={() => setMode(o.type)}
          className="text-left text-sm px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
          {o.label}
        </button>
      ))}
      <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
    </div>
  );

  if (mode === 'remove_rule') return (
    <div className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
      <Select label="Rule to remove" value={ruleId} onChange={setRuleId} options={rules.map(r => ({ value: r.id, label: r.label }))} />
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" fullWidth onClick={() => onAdd({ type: 'remove_rule', ruleId })}>Add override</Button>
      </div>
    </div>
  );

  if (mode === 'modify_rule') return (
    <div className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
      <Select label="Rule to modify" value={ruleId} onChange={setRuleId} options={rules.map(r => ({ value: r.id, label: r.label }))} />
      <Input label="New amount (optional)" value={patch.amountCents} onChange={v => setPatch(p => ({ ...p, amountCents: v }))} prefix="$" type="number" />
      <Input label="New label (optional)" value={patch.label} onChange={v => setPatch(p => ({ ...p, label: v }))} />
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" fullWidth onClick={() => {
          const p = {};
          if (patch.amountCents) p.amountCents = Money.toCents(parseFloat(patch.amountCents));
          if (patch.label) p.label = patch.label;
          onAdd({ type: 'modify_rule', ruleId, patch: p });
        }}>Add override</Button>
      </div>
    </div>
  );

  if (mode === 'add_event') return (
    <div className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
      <Input label="Note" value={eventNote} onChange={setEventNote} placeholder="e.g. Moving costs" />
      <Input label="Amount" value={eventAmt} onChange={setEventAmt} prefix="$" type="number" />
      <Input label="Date" type="date" value={eventDate} onChange={setEventDate} />
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" fullWidth onClick={() => onAdd({
          type: 'add_event',
          event: { id: newId('ev'), date: eventDate, amountCents: -Money.toCents(parseFloat(eventAmt || 0)), category: 'other', note: eventNote },
        })}>Add override</Button>
      </div>
    </div>
  );

  if (mode === 'add_rule') return (
    <div className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
      <Input label="Label" value={newRule.label} onChange={v => setNewRule(r => ({ ...r, label: v }))} placeholder="e.g. Internship stipend" />
      <Input label="Amount" value={newRule.amountCents} onChange={v => setNewRule(r => ({ ...r, amountCents: v }))} prefix="$" type="number" />
      <Select label="Cadence" value={newRule.cadence} onChange={v => setNewRule(r => ({ ...r, cadence: v }))}
        options={[{ value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: 'Bi-weekly' }, { value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]} />
      <Input label="Anchor date" type="date" value={newRule.anchorDate} onChange={v => setNewRule(r => ({ ...r, anchorDate: v }))} />
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" fullWidth onClick={() => onAdd({
          type: 'add_rule',
          rule: { id: newId('rule'), ...newRule, amountCents: Money.toCents(parseFloat(newRule.amountCents || 0)), active: true },
        })}>Add override</Button>
      </div>
    </div>
  );

  return null;
}

// ─── Scenario editor (drawer) ─────────────────────────────────────────────────

function ScenarioEditor({ scenario, onSave, onDelete, onClose }) {
  const { state } = useStore();
  const { recurringRules, settings, transactions, ui } = state;
  const isEdit = !!scenario;

  const [name, setName] = useState(scenario?.name || '');
  const [color, setColor] = useState(scenario?.color || SCENARIO_PALETTE[1]);
  const [overrides, setOverrides] = useState(scenario?.overrides || []);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Live forecast preview
  const previewScenario = useMemo(() => ({ id: '_preview', name, color, overrides, isBaseline: false }), [name, color, overrides]);
  const baseInputs = { startingBalanceCents: settings.startingBalanceCents, transactions, recurringRules };
  const previewInputs = useMemo(() => ScenariosEngine.apply(baseInputs, previewScenario), [previewScenario, baseInputs]);

  const startDate = settings.asOfDate;
  const endDate = Dates.horizonEnd(startDate, ui.horizon || '6M');

  const previewPoints = useMemo(() =>
    ForecastEngine.run({ ...previewInputs, startDate, endDate }),
    [previewInputs, startDate, endDate]
  );
  const basePoints = useMemo(() =>
    ForecastEngine.run({ ...baseInputs, startDate, endDate }),
    [baseInputs, startDate, endDate]
  );

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      id: scenario?.id || newId('scenario'),
      name: name.trim(),
      color,
      active: scenario?.active ?? true,
      isBaseline: false,
      overrides,
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        {/* Live mini preview */}
        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1 font-medium">Live preview vs. baseline</p>
          <MiniSparkline points={previewPoints} basePoints={basePoints} color={color} />
        </div>

        <Input label="Scenario name" value={name} onChange={setName} placeholder="e.g. NYC Internship" autoFocus />

        {/* Color picker */}
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Color</p>
          <div className="flex gap-2">
            {SCENARIO_PALETTE.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-[#1E3A8A] scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        {/* Overrides */}
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Overrides</p>
          <div className="flex flex-col gap-2 mb-3">
            {overrides.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">No overrides yet — identical to baseline.</p>
            )}
            {overrides.map((ov, i) => (
              <OverrideItem key={i} ov={ov} rules={recurringRules} onRemove={() => setOverrides(o => o.filter((_, j) => j !== i))} />
            ))}
          </div>
          {showAddPanel ? (
            <AddOverridePanel
              rules={recurringRules}
              onAdd={ov => { setOverrides(o => [...o, ov]); setShowAddPanel(false); }}
              onClose={() => setShowAddPanel(false)}
            />
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowAddPanel(true)}>+ Add override</Button>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2 shrink-0">
        <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>
        <Button onClick={handleSave} size="sm" fullWidth disabled={!name.trim()}>
          {isEdit ? 'Save changes' : 'Create scenario'}
        </Button>
        {isEdit && !scenario?.isBaseline && (
          <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)}>Delete</Button>
        )}
      </div>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Delete scenario?">
        <p className="text-sm text-slate-500 mb-5">This will remove it from all forecasts.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onDelete(scenario.id); setShowConfirm(false); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Scenario card ────────────────────────────────────────────────────────────

function ScenarioCard({ scenario, basePoints, forecastPoints, onEdit }) {
  const endBal = forecastPoints?.[forecastPoints.length - 1]?.balance ?? 0;
  const baseEnd = basePoints?.[basePoints.length - 1]?.balance ?? 0;
  const delta = scenario.isBaseline ? null : endBal - baseEnd;

  return (
    <Card hover className="p-5" onClick={onEdit}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.color }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{scenario.name}</span>
          {scenario.isBaseline && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--chip-bg)', color: 'var(--text-3)' }}>Baseline</span>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--text-4)' }}>
          <path d="M11 2.5L13.5 5L6 12.5H3.5V10L11 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {!scenario.isBaseline && (
        <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>
          {scenario.overrides.length} override{scenario.overrides.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Sparkline */}
      {forecastPoints?.length > 0 && (
        <div className="mb-3">
          <MiniSparkline points={forecastPoints} basePoints={!scenario.isBaseline ? basePoints : null} color={scenario.color} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>End balance</p>
          <p className="font-mono text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{Money.format(endBal)}</p>
        </div>
        {delta !== null && (
          <p className={`font-mono text-sm font-semibold ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {Money.formatSigned(delta)}
          </p>
        )}
      </div>
    </Card>
  );
}

// ─── Scenarios screen ─────────────────────────────────────────────────────────

function Scenarios() {
  const { state, dispatch, toast } = useStore();
  const { scenarios, settings, transactions, recurringRules, ui } = state;
  const [editScenario, setEditScenario] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const startDate = settings.asOfDate;
  const endDate = Dates.horizonEnd(startDate, ui.horizon || '6M');
  const baseInputs = { startingBalanceCents: settings.startingBalanceCents, transactions, recurringRules };

  const basePoints = useMemo(() => ForecastEngine.run({ ...baseInputs, startDate, endDate }), [baseInputs, startDate, endDate]);

  const forecastMap = useMemo(() => {
    const m = {};
    scenarios.forEach(s => {
      const inputs = s.isBaseline ? baseInputs : ScenariosEngine.apply(baseInputs, s);
      m[s.id] = ForecastEngine.run({ ...inputs, startDate, endDate });
    });
    return m;
  }, [scenarios, baseInputs, startDate, endDate]);

  function openNew() { setEditScenario(null); setDrawerOpen(true); }
  function openEdit(s) { if (s.isBaseline) return; setEditScenario(s); setDrawerOpen(true); }

  function handleSave(s) {
    if (editScenario) {
      dispatch({ type: 'UPDATE_SCENARIO', scenario: s });
      toast(`"${s.name}" updated.`, 'success');
    } else {
      dispatch({ type: 'ADD_SCENARIO', scenario: s });
      toast(`Scenario "${s.name}" created.`, 'success');
    }
    setDrawerOpen(false);
  }

  function handleDelete(id) {
    dispatch({ type: 'DELETE_SCENARIO', id });
    toast('Scenario deleted.');
    setDrawerOpen(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ScreenHeader
        title="Scenarios"
        action={<Button onClick={openNew} size="sm">+ New scenario</Button>}
      />
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
        Fork your baseline into named what-if scenarios. Compare them on the dashboard.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scenarios.map(s => (
          <ScenarioCard
            key={s.id}
            scenario={s}
            basePoints={basePoints}
            forecastPoints={forecastMap[s.id]}
            onEdit={() => openEdit(s)}
          />
        ))}
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editScenario ? `Edit: ${editScenario.name}` : 'New scenario'}
        width={440}
      >
        <ScenarioEditor
          scenario={editScenario}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
}

Object.assign(window, { Scenarios });
