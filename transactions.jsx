// FlowCast — Transactions screen + form

// ─── Transaction Form ─────────────────────────────────────────────────────────

function TransactionForm({ tx, onSave, onDelete, onClose }) {
  const isEdit = !!tx;
  const [type, setType] = useState(tx ? (tx.amountCents > 0 ? 'income' : 'expense') : 'expense');
  const [amount, setAmount] = useState(tx ? Math.abs(tx.amountCents / 100).toFixed(2) : '');
  const [date, setDate] = useState(tx?.date || Dates.today());
  const [category, setCategory] = useState(tx?.category || 'other');
  const [note, setNote] = useState(tx?.note || '');
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useStore();

  const catOptions = CATEGORIES.filter(c => type === 'income' ? c.id === 'income' : c.id !== 'income')
    .map(c => ({ value: c.id, label: c.label }));

  function handleSave() {
    const cents = Math.round(parseFloat(amount || 0) * 100);
    if (!cents) { toast('Enter an amount.', 'error'); return; }
    const signed = type === 'expense' ? -Math.abs(cents) : Math.abs(cents);
    onSave({
      id: tx?.id || newId('tx'),
      date,
      amountCents: signed,
      category: type === 'income' ? 'income' : category,
      note: note.trim(),
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        <TypeToggle value={type} onChange={v => { setType(v); setCategory(v === 'income' ? 'income' : 'other'); }} />
        <AmountInput value={amount} onChange={setAmount} type={type} label="Amount" />
        <Input label="Date" type="date" value={date} onChange={setDate} />
        {type !== 'income' && (
          <Select
            label="Category"
            value={category}
            onChange={setCategory}
            options={catOptions}
          />
        )}
        <Input label="Note" value={note} onChange={setNote} placeholder="What was this for?" />
      </div>

      {/* Sticky footer */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex gap-2 shrink-0">
        <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>
        <Button onClick={handleSave} size="sm" fullWidth>
          {isEdit ? 'Save changes' : 'Add transaction'}
        </Button>
        {isEdit && (
          <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)}>Delete</Button>
        )}
      </div>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Delete transaction?">
        <p className="text-sm text-slate-500 mb-5">This can't be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onDelete(tx.id); setShowConfirm(false); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ tx, onClick }) {
  const isIncome = tx.amountCents > 0;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
    >
      <CategoryDot category={tx.category} size={9} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 dark:text-slate-200 truncate">{tx.note || categoryLabel(tx.category)}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{categoryLabel(tx.category)}</p>
      </div>
      <span className={`font-mono text-sm font-medium tabular-nums shrink-0 ${isIncome ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
        {isIncome ? '+' : ''}{Money.format(tx.amountCents)}
      </span>
    </button>
  );
}

// ─── Transactions screen ──────────────────────────────────────────────────────

function Transactions() {
  const { state, dispatch, toast } = useStore();
  const { transactions } = state;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all | income | expense
  const [filterCategory, setFilterCategory] = useState('');
  const [editTx, setEditTx] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (filterType === 'income') list = list.filter(t => t.amountCents > 0);
    if (filterType === 'expense') list = list.filter(t => t.amountCents < 0);
    if (filterCategory) list = list.filter(t => t.category === filterCategory);
    if (search) list = list.filter(t => (t.note || '').toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filterType, filterCategory, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(t => { (map[t.date] = map[t.date] || []).push(t); });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  function openNew() { setEditTx(null); setDrawerOpen(true); }
  function openEdit(tx) { setEditTx(tx); setDrawerOpen(true); }

  function handleSave(tx) {
    if (editTx) {
      dispatch({ type: 'UPDATE_TRANSACTION', tx });
      toast('Transaction updated.', 'success');
    } else {
      dispatch({ type: 'ADD_TRANSACTION', tx });
      toast('Transaction added.', 'success');
    }
    setDrawerOpen(false);
  }

  function handleDelete(id) {
    dispatch({ type: 'DELETE_TRANSACTION', id });
    toast('Transaction deleted.');
    setDrawerOpen(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ScreenHeader
        title="Transactions"
        action={<Button onClick={openNew} size="sm">+ Add transaction</Button>}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search notes…"
          prefix="🔍"
          className="flex-1 min-w-[180px]"
        />
        <SegmentedControl
          options={[{ value: 'all', label: 'All' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expenses' }]}
          value={filterType}
          onChange={setFilterType}
          size="sm"
        />
        <Select
          value={filterCategory}
          onChange={setFilterCategory}
          options={CATEGORIES.map(c => ({ value: c.id, label: c.label }))}
          placeholder="All categories"
          className="min-w-[140px]"
        />
      </div>

      {/* List */}
      {grouped.length === 0 ? (
        <EmptyState
          icon="↕"
          title="No transactions yet"
          description="Add your first transaction or load sample data."
          action={<Button onClick={openNew} size="sm">+ Add transaction</Button>}
        />
      ) : (
        <Card>
          {grouped.map(([date, txs], gi) => (
            <div key={date}>
              {gi > 0 && <Divider />}
              <div className="sticky top-0 z-10 px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{Dates.format(date)}</span>
                <span className="ml-2 text-xs text-slate-300 dark:text-slate-600">
                  {Money.formatSigned(txs.reduce((s, t) => s + t.amountCents, 0))}
                </span>
              </div>
              {txs.map(tx => <TxRow key={tx.id} tx={tx} onClick={() => openEdit(tx)} />)}
            </div>
          ))}
        </Card>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editTx ? 'Edit transaction' : 'New transaction'}
      >
        <TransactionForm
          tx={editTx}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
}

Object.assign(window, { Transactions });
