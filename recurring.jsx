// FlowCast — Recurring rules screen + form

// ─── Recurring Rule Form ──────────────────────────────────────────────────────

function RecurringRuleForm({ rule, onSave, onDelete, onClose }) {
  const isEdit = !!rule;
  const [type, setType] = useState(rule ? (rule.amountCents > 0 ? 'income' : 'expense') : 'expense');
  const [label, setLabel] = useState(rule?.label || '');
  const [amount, setAmount] = useState(rule ? Math.abs(rule.amountCents / 100).toFixed(2) : '');
  const [cadence, setCadence] = useState(rule?.cadence || 'monthly');
  const [anchor, setAnchor] = useState(rule?.anchorDate || Dates.today());
  const [endDate, setEndDate] = useState(rule?.endDate || '');
  const [category, setCategory] = useState(rule?.category || 'other');
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useStore();

  const nextFive = useMemo(() => {
    const cents = Math.round(parseFloat(amount || 0) * 100);
    if (!cents || !anchor) return [];
    const mockRule = { amountCents: cents, cadence, anchorDate: anchor, endDate: endDate || null, active: true, id: 'preview' };
    return RecurringEngine.nextN(mockRule, 5);
  }, [amount, cadence, anchor, endDate]);

  const catOptions = CATEGORIES.filter(c => type === 'income' ? c.id === 'income' : c.id !== 'income')
    .map(c => ({ value: c.id, label: c.label }));

  function handleSave() {
    const cents = Math.round(parseFloat(amount || 0) * 100);
    if (!label.trim()) { toast('Enter a label.', 'error'); return; }
    if (!cents) { toast('Enter an amount.', 'error'); return; }
    const signed = type === 'expense' ? -Math.abs(cents) : Math.abs(cents);
    onSave({
      id: rule?.id || newId('rule'),
      label: label.trim(),
      amountCents: signed,
      cadence,
      anchorDate: anchor,
      endDate: endDate || null,
      category: type === 'income' ? 'income' : category,
      active: rule?.active ?? true,
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        <TypeToggle value={type} onChange={v => { setType(v); setCategory(v === 'income' ? 'income' : 'other'); }} />
        <Input label="Label" value={label} onChange={setLabel} placeholder="e.g. Rent, Paycheck, Netflix" autoFocus />
        <AmountInput value={amount} onChange={setAmount} type={type} label="Amount" />
        <Select
          label="Cadence"
          value={cadence}
          onChange={setCadence}
          options={[
            { value: 'weekly',   label: 'Weekly' },
            { value: 'biweekly', label: 'Bi-weekly' },
            { value: 'monthly',  label: 'Monthly' },
            { value: 'yearly',   label: 'Yearly' },
          ]}
        />
        <Input label="Anchor date (first occurrence)" type="date" value={anchor} onChange={setAnchor} />
        <Input label="End date (optional)" type="date" value={endDate} onChange={setEndDate} />
        {type !== 'income' && (
          <Select label="Category" value={category} onChange={setCategory} options={catOptions} />
        )}

        {/* Live preview */}
        {nextFive.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Next 5 occurrences</p>
            <div className="flex flex-col gap-1">
              {nextFive.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{Dates.format(d)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2 shrink-0">
        <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>
        <Button onClick={handleSave} size="sm" fullWidth>
          {isEdit ? 'Save changes' : 'Add rule'}
        </Button>
        {isEdit && (
          <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)}>Delete</Button>
        )}
      </div>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Delete this rule?">
        <p className="text-sm text-slate-500 mb-5">Future occurrences will be removed from forecasts.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onDelete(rule.id); setShowConfirm(false); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Rule card ────────────────────────────────────────────────────────────────

function RuleCard({ rule, onEdit, onToggle }) {
  const isIncome = rule.amountCents > 0;
  const next = RecurringEngine.nextN(rule, 1)[0];
  const cadenceLabel = { weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly', yearly: 'Yearly' }[rule.cadence];

  return (
    <div className={`flex items-start gap-4 px-5 py-4 transition-colors ${!rule.active ? 'opacity-50' : ''}`}>
      <CategoryDot category={rule.category} size={9} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{rule.label}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{cadenceLabel}</span>
        </div>
        {next && <span className="text-xs text-slate-400 dark:text-slate-500">Next: {Dates.format(next)}</span>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`font-mono text-sm font-semibold tabular-nums ${isIncome ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
          {isIncome ? '+' : ''}{Money.format(rule.amountCents)}
        </span>
        <Toggle checked={rule.active} onChange={() => onToggle(rule.id)} size="sm" />
        <button onClick={() => onEdit(rule)} className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11 2.5L13.5 5L6 12.5H3.5V10L11 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Recurring screen ─────────────────────────────────────────────────────────

function Recurring() {
  const { state, dispatch, toast } = useStore();
  const { recurringRules } = state;
  const [editRule, setEditRule] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openNew() { setEditRule(null); setDrawerOpen(true); }
  function openEdit(rule) { setEditRule(rule); setDrawerOpen(true); }

  function handleSave(rule) {
    if (editRule) {
      dispatch({ type: 'UPDATE_RULE', rule });
      toast('Rule updated.', 'success');
    } else {
      dispatch({ type: 'ADD_RULE', rule });
      toast('Rule added.', 'success');
    }
    setDrawerOpen(false);
  }

  function handleDelete(id) {
    dispatch({ type: 'DELETE_RULE', id });
    toast('Rule deleted.');
    setDrawerOpen(false);
  }

  const income = recurringRules.filter(r => r.amountCents > 0);
  const expenses = recurringRules.filter(r => r.amountCents < 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ScreenHeader
        title="Recurring Rules"
        action={<Button onClick={openNew} size="sm">+ Add rule</Button>}
      />

      {recurringRules.length === 0 ? (
        <EmptyState
          icon="↻"
          title="No recurring rules"
          description="Add income and expenses that repeat on a schedule."
          action={<Button onClick={openNew} size="sm">+ Add rule</Button>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {income.length > 0 && (
            <Card>
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Income</span>
              </div>
              {income.map((r, i) => (
                <div key={r.id}>
                  {i > 0 && <Divider />}
                  <RuleCard rule={r} onEdit={openEdit} onToggle={id => dispatch({ type: 'TOGGLE_RULE', id })} />
                </div>
              ))}
            </Card>
          )}
          {expenses.length > 0 && (
            <Card>
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Expenses</span>
              </div>
              {expenses.map((r, i) => (
                <div key={r.id}>
                  {i > 0 && <Divider />}
                  <RuleCard rule={r} onEdit={openEdit} onToggle={id => dispatch({ type: 'TOGGLE_RULE', id })} />
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editRule ? 'Edit rule' : 'New recurring rule'}
      >
        <RecurringRuleForm
          rule={editRule}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
}

Object.assign(window, { Recurring });
