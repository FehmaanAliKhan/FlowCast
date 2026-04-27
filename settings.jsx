// FlowCast — Settings screen

function Settings({ onLogout }) {
  const { state, dispatch, toast } = useStore();
  const { settings } = state;
  const [balance, setBalance] = useState((settings.startingBalanceCents / 100).toFixed(2));
  const [asOf, setAsOf]       = useState(settings.asOfDate);
  const [showReset, setShowReset] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const user = Api.getUser();

  async function changePassword() {
    if (!currentPw || !newPw || !confirmPw) { toast('Fill in all password fields.', 'error'); return; }
    if (newPw !== confirmPw) { toast('New passwords do not match.', 'error'); return; }
    const rules = [
      newPw.length >= 12 && newPw.length <= 16,
      /[A-Z]/.test(newPw), /[a-z]/.test(newPw), /[0-9]/.test(newPw), /[^A-Za-z0-9]/.test(newPw),
    ];
    if (rules.some(r => !r)) { toast('New password does not meet complexity requirements.', 'error'); return; }
    setPwLoading(true);
    try {
      await Api.changePassword(currentPw, newPw);
      toast('Password updated successfully.', 'success');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setPwLoading(false);
    }
  }

  function save() {
    const cents = Money.toCents(parseFloat(balance || 0));
    dispatch({ type: 'UPDATE_SETTINGS', patch: { startingBalanceCents: cents, asOfDate: asOf } });
    toast('Settings saved.', 'success');
  }

  function exportData() {
    const { ui, ...data } = state;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `flowcast-${Dates.today()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast('Data exported.', 'success');
  }

  function importFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        dispatch({ type: 'IMPORT_DATA', data });
        toast('Data imported.', 'success');
      } catch { toast('Invalid JSON file.', 'error'); }
    };
    reader.readAsText(file);
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <ScreenHeader title="Settings" />

      <div className="flex flex-col gap-5">
        {/* Theme */}
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-3)" }}>Appearance</p>
          <div className="flex flex-col gap-1 mb-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Theme</p>
          </div>
          <SegmentedControl
            options={[{ value: 'light', label: 'Light' }, { value: 'system', label: 'System' }, { value: 'dark', label: 'Dark' }]}
            value={settings.theme}
            onChange={theme => {
              dispatch({ type: 'UPDATE_SETTINGS', patch: { theme } });
              applyTheme(theme);
            }}
            size="md"
          />
        </Card>

        {/* Forecast */}
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-3)" }}>Forecast</p>
          <div className="flex flex-col gap-1 mb-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Default horizon</p>
          </div>
          <SegmentedControl
            options={[{ value: '3M', label: '3M' }, { value: '6M', label: '6M' }, { value: '1Y', label: '1Y' }, { value: '2Y', label: '2Y' }]}
            value={settings.horizon}
            onChange={horizon => { dispatch({ type: 'UPDATE_SETTINGS', patch: { horizon } }); dispatch({ type: 'SET_HORIZON', horizon }); }}
            size="md"
          />
        </Card>

        {/* Balance */}
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-3)" }}>Starting point</p>
          <div className="flex flex-col gap-3">
            <Input label="Starting balance" value={balance} onChange={setBalance} prefix="$" type="number" />
            <Input label="As of date" type="date" value={asOf} onChange={setAsOf} />
            <Button onClick={save} size="sm">Save</Button>
          </div>
        </Card>

        {/* Data */}
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-3)" }}>Data</p>
          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={exportData} size="sm">Export JSON</Button>
            <label>
              <Button variant="outline" size="sm" className="w-full" onClick={() => {}}>Import JSON</Button>
              <input type="file" accept=".json" className="hidden" onChange={importFile} />
            </label>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <Button variant="destructive" size="sm" onClick={() => setShowReset(true)}>Reset everything</Button>
            </div>
          </div>
        </Card>

        {/* Shortcuts */}
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-3)" }}>Keyboard shortcuts</p>
          <div className="flex flex-col gap-2">
            {[
              ['N', 'New transaction'],
              ['S', 'New scenario'],
              ['/', 'Focus search'],
              ['?', 'Show shortcuts'],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--text-2)" }}>{label}</span>
                <kbd className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-mono">{key}</kbd>
              </div>
            ))}
          </div>
        </Card>

        {/* Change password */}
        {user && (
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text-3)' }}>Change password</p>
            <div className="flex flex-col gap-3">
              <Input label="Current password" type="password" value={currentPw} onChange={setCurrentPw} />
              <Input label="New password" type="password" value={newPw} onChange={setNewPw} />
              <Input label="Confirm new password" type="password" value={confirmPw} onChange={setConfirmPw} />
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>12–16 chars · uppercase · lowercase · number · symbol</p>
              <Button onClick={changePassword} size="sm" disabled={pwLoading}>{pwLoading ? 'Updating…' : 'Update password'}</Button>
            </div>
          </Card>
        )}

        {/* Account */}
        {user && (
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text-3)' }}>Account</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{user.email}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Signed in</p>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>Sign out</Button>
            </div>
          </Card>
        )}

        <p className="text-center text-xs text-slate-300 dark:text-slate-600 py-2">
          FlowCast v1.0 · Data synced to server
        </p>
      </div>

      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset everything?">
        <p className="text-sm mb-5" style={{ color: "var(--text-2)" }}>All transactions, rules, scenarios, and goals will be permanently deleted. This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowReset(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { dispatch({ type: 'RESET' }); setShowReset(false); }}>Yes, reset everything</Button>
        </div>
      </Modal>
    </div>
  );
}

// Theme applicator — toggles .dark class on <html>
function applyTheme(theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
}

Object.assign(window, { Settings, applyTheme });
