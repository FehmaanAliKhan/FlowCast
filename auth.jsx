// FlowCast — Auth screen (login / register)

function AuthScreen({ onSuccess }) {
  const [mode, setMode]       = useState('login');   // 'login' | 'register'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [backendUp, setBackendUp] = useState(null);   // null = checking

  // Check if backend is reachable on mount
  useEffect(() => {
    Api.ping().then(up => setBackendUp(up));
  }, []);

  function passwordRules(p) {
    return [
      { label: '12–16 characters',      ok: p.length >= 12 && p.length <= 16 },
      { label: 'Uppercase letter (A-Z)', ok: /[A-Z]/.test(p) },
      { label: 'Lowercase letter (a-z)', ok: /[a-z]/.test(p) },
      { label: 'Number (0-9)',           ok: /[0-9]/.test(p) },
      { label: 'Symbol (!@#$…)',         ok: /[^A-Za-z0-9]/.test(p) },
    ];
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password !== confirm) { setError('Passwords do not match.'); return; }
      const failed = passwordRules(password).filter(r => !r.ok);
      if (failed.length > 0) { setError('Password does not meet all requirements.'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await Api.login(email.trim(), password);
      } else {
        await Api.register(email.trim(), password);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#0f0a2e 0%,#1a1040 35%,#0d0d1a 70%,#060412 100%)' }}>

      {/* Decorative blobs */}
      <div className="absolute pointer-events-none" style={{ top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(123,97,255,0.18) 0%,transparent 70%)', filter: 'blur(48px)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(20,184,166,0.1) 0%,transparent 70%)', filter: 'blur(40px)' }} />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)', boxShadow: '0 8px 24px rgba(123,97,255,0.4)' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 13L6 8L9.5 11L13 6L16 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 6H16V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FlowCast</span>
          </div>
        </div>

        {/* Backend down warning */}
        {backendUp === false && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#fca5a5' }}>
            ⚠ Backend not reachable. Start it with:<br />
            <code className="text-[11px] font-mono opacity-80">python3 backend/app.py</code>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>

          {/* Tab switcher */}
          <div className="flex rounded-xl p-1 mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150 capitalize"
                style={{
                  backgroundColor: mode === m ? 'rgba(123,97,255,0.3)' : 'transparent',
                  color: mode === m ? '#fff' : 'rgba(255,255,255,0.4)',
                }}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(123,97,255,0.6)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? '12–16 chars, upper, lower, number, symbol' : '••••••••'}
                required
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(123,97,255,0.6)'}
                onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {mode === 'register' && password.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {passwordRules(password).map(r => (
                    <div key={r.label} className="flex items-center gap-2">
                      <span style={{ color: r.ok ? '#10B981' : 'rgba(255,255,255,0.25)', fontSize: 11 }}>{r.ok ? '✓' : '✗'}</span>
                      <span className="text-[11px]" style={{ color: r.ok ? '#10B981' : 'rgba(255,255,255,0.35)' }}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                  style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(123,97,255,0.6)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all mt-1"
              style={{ background: loading ? 'rgba(123,97,255,0.5)' : 'linear-gradient(135deg,#7B61FF,#5B4FE9)', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Your data is encrypted and stored securely on the server.
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen });
