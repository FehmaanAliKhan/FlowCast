// FlowCast — UI primitives (FinSet-inspired: violet accent, white cards, soft shadows)

const VIOLET = '#6C5DD3';
const VIOLET_LIGHT = '#EEF0FF';

// ─── Button ───────────────────────────────────────────────────────────────────

function Button({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', type = 'button', fullWidth }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 focus:outline-none select-none';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };
  const variants = {
    primary:     `text-white disabled:opacity-40`,
    secondary:   'border hover:opacity-90',
    ghost:       'bg-transparent hover:opacity-80',
    destructive: 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-40',
    outline:     'border hover:opacity-80',
    violet_ghost:'border hover:bg-[#EEF0FF] hover:text-[#6C5DD3]',
  };
  const variantStyle = {
    secondary: { backgroundColor: 'var(--card-bg)', color: 'var(--text-1)', borderColor: 'var(--border)' },
    ghost:     { backgroundColor: 'transparent', color: 'var(--text-2)' },
    outline:   { backgroundColor: 'transparent', color: 'var(--text-2)', borderColor: 'var(--border)' },
    violet_ghost: { borderColor: 'var(--border)', color: 'var(--text-2)' },
  }[variant] || {};
  const primaryStyle = variant === 'primary' ? { background: 'linear-gradient(135deg,#7B61FF,#5B4FE9)' } : variantStyle;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={primaryStyle}
      className={`${base} ${sizes[size]} ${variants[variant] ?? variants.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({ children, className = '', onClick, hover }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl ${hover ? 'cursor-pointer transition-shadow hover:shadow-md' : ''} ${className}`}
      style={{ backgroundColor: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}
    >
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

function Input({ label, value, onChange, type = 'text', placeholder, className = '', error, prefix, suffix, autoFocus, onKeyDown, id }) {
  const inputId = id || `inp_${Math.random().toString(36).slice(2)}`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>{label}</label>}
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-slate-400 text-sm pointer-events-none">{prefix}</span>}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-1)', borderColor: error ? '#fca5a5' : 'var(--border)' }}
          className={`w-full rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 placeholder-slate-400
            ${error ? 'focus:ring-red-200' : 'focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3]'}
            ${prefix ? 'pl-8' : 'pl-3.5'} ${suffix ? 'pr-8' : 'pr-3.5'} py-2.5`}
        />
        {suffix && <span className="absolute right-3 text-slate-400 text-sm pointer-events-none">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

function Select({ label, value, onChange, options, className = '', placeholder }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-1)', borderColor: 'var(--border)' }}
        className="w-full rounded-xl border text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] transition-colors"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, size = 'md' }) {
  const w = size === 'sm' ? 'w-8' : 'w-10';
  const h = size === 'sm' ? 'h-4' : 'h-5';
  const dw = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const tx = size === 'sm' ? (checked ? 'translate-x-4' : 'translate-x-0.5') : (checked ? 'translate-x-5' : 'translate-x-0.5');
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div onClick={() => onChange(!checked)}
        className={`relative ${w} ${h} rounded-full transition-colors duration-200`}
        style={{ backgroundColor: checked ? VIOLET : '#e2e8f0' }}
      >
        <div className={`absolute top-0.5 ${dw} bg-white rounded-full shadow transition-transform duration-200 ${tx}`} />
      </div>
      {label && <span className="text-sm" style={{ color: 'var(--text-2)' }}>{label}</span>}
    </label>
  );
}

// ─── SegmentedControl ─────────────────────────────────────────────────────────

function SegmentedControl({ options, value, onChange, size = 'sm' }) {
  const sizes = { sm: 'px-3 py-1 text-xs', md: 'px-4 py-1.5 text-sm' };
  return (
    <div className="flex gap-0.5 rounded-xl p-0.5" style={{ backgroundColor: 'var(--chip-bg)' }}>
      {options.map(o => {
        const active = (o.value ?? o) === value;
        return (
          <button key={o.value ?? o} onClick={() => onChange(o.value ?? o)}
            className={`${sizes[size]} rounded-lg font-medium transition-all duration-150`}
            style={active
              ? { backgroundColor: 'var(--card-bg)', color: 'var(--text-1)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-3)' }}
          >
            {o.label ?? o}
          </button>
        );
      })}
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, color, active, onClick }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 border"
      style={active ? { backgroundColor: color, color: 'white', borderColor: color } : { borderColor: 'var(--border)', color: 'var(--text-3)', backgroundColor: 'var(--card-bg)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? 'rgba(255,255,255,0.7)' : color }} />
      {label}
    </button>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, subColor }) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F0F2F8' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 9.5L9.5 2.5M9.5 2.5H5M9.5 2.5V7" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="min-w-0">{value}</div>
      {sub && <p className={`text-xs font-medium ${subColor || 'text-slate-400'}`}>{sub}</p>}
    </Card>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function Drawer({ open, onClose, title, children, width = 420 }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 z-50 h-full flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width, backgroundColor: 'var(--card-bg)', boxShadow: '-4px 0 32px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{title}</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl w-full max-w-md p-6 z-10" style={{ backgroundColor: 'var(--card-bg)', boxShadow: '0 24px 48px rgba(0,0,0,0.25)' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-1)' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function ToastContainer() {
  const { state, dispatch } = useStore();
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {state.ui.toasts.map(t => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-3 px-4 py-3 text-white text-sm rounded-xl shadow-lg animate-fade-in"
          style={{ backgroundColor: '#13111C' }}>
          {t.variant === 'success' && <span style={{ color: '#10B981' }}>✓</span>}
          {t.variant === 'error' && <span className="text-red-400">✕</span>}
          <span>{t.message}</span>
          <button onClick={() => dispatch({ type: 'TOAST_REMOVE', id: t.id })} className="ml-1 opacity-50 hover:opacity-100">×</button>
        </div>
      ))}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--chip-bg)' }}>{icon}</div>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{description}</p>
      </div>
      {action}
    </div>
  );
}

// ─── Skeleton / Divider / misc ────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`rounded animate-pulse ${className}`} style={{ backgroundColor: 'var(--chip-bg)' }} />;
}

function AmountInput({ value, onChange, type = 'expense', label }) {
  const color = type === 'income' ? '#10B981' : '#F87171';
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>{label}</label>}
      <div className="relative flex items-center">
        <span className="absolute left-4 text-2xl font-mono font-bold pointer-events-none" style={{ color }}>$</span>
        <input type="number" min="0" step="0.01" value={value} onChange={e => onChange(e.target.value)} placeholder="0.00"
          className="w-full text-2xl font-mono font-bold pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] transition-colors"
          style={{ color, backgroundColor: 'var(--input-bg)', borderColor: 'var(--border)' }}
        />
      </div>
    </div>
  );
}

function CategoryDot({ category, size = 8 }) {
  return <span className="rounded-full inline-block shrink-0" style={{ width: size, height: size, backgroundColor: categoryColor(category) }} />;
}

function ScreenHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>{title}</h1>
      {action}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: '1px solid var(--divider)' }} />;
}

function TypeToggle({ value, onChange }) {
  return (
    <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {['expense', 'income'].map(t => (
        <button key={t} onClick={() => onChange(t)}
          className="flex-1 py-2.5 text-sm font-semibold transition-all capitalize"
          style={value === t
            ? { backgroundColor: t === 'expense' ? '#FEF2F2' : '#ECFDF5', color: t === 'expense' ? '#F87171' : '#10B981' }
            : { color: 'var(--text-3)', backgroundColor: 'var(--input-bg)' }}
        >{t}</button>
      ))}
    </div>
  );
}

function ProgressBar({ value, max, color = VIOLET, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`h-1.5 rounded-full overflow-hidden ${className}`} style={{ backgroundColor: 'var(--chip-bg)' }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

// ─── Category icons ───────────────────────────────────────────────────────────

const CATEGORY_ICONS = {
  income:        '💵',
  housing:       '🏠',
  food:          '🍔',
  transport:     '🚗',
  entertainment: '🎮',
  health:        '💊',
  education:     '📚',
  utilities:     '⚡',
  shopping:      '🛍️',
  savings:       '🏦',
  other:         '📌',
};

function CategoryIcon({ category, size = 36 }) {
  const icon = CATEGORY_ICONS[category] || '📌';
  const color = categoryColor(category);
  const px = size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 44 : size;
  return (
    <div className="rounded-xl flex items-center justify-center shrink-0"
      style={{ width: px, height: px, backgroundColor: color + '22', fontSize: px * 0.44 }}>
      {icon}
    </div>
  );
}

// ─── StatBadge ────────────────────────────────────────────────────────────────

function StatBadge({ value, label }) {
  const pos = value >= 0;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span className="text-sm font-mono font-semibold" style={{ color: pos ? '#34d399' : '#f87171' }}>
        {pos ? '+' : ''}{value}
      </span>
    </div>
  );
}

Object.assign(window, {
  Button, Card, Input, Select, Toggle, SegmentedControl,
  Chip, KPICard, Drawer, Modal, ToastContainer,
  EmptyState, Skeleton, AmountInput, CategoryDot, CategoryIcon,
  ScreenHeader, Divider, TypeToggle, ProgressBar,
  VIOLET, VIOLET_LIGHT, CATEGORY_ICONS, StatBadge,
});
