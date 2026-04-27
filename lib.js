// FlowCast — pure utility library (no React, no DOM, no localStorage)

const Dates = (() => {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function parseISO(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function toISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function format(str) {
    const d = parseISO(str);
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function formatShort(str) {
    const d = parseISO(str);
    return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  }

  function formatMonthYear(str) {
    const d = parseISO(str);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  function today() {
    return toISO(new Date());
  }

  function addDays(str, n) {
    const d = parseISO(str);
    d.setDate(d.getDate() + n);
    return toISO(d);
  }

  function addMonths(str, n) {
    const d = parseISO(str);
    const origDay = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
    const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(origDay, maxDay));
    return toISO(d);
  }

  function addYears(str, n) { return addMonths(str, n * 12); }
  function addWeeks(str, n) { return addDays(str, n * 7); }

  function diffDays(a, b) {
    return Math.round((parseISO(b) - parseISO(a)) / 86400000);
  }

  function isBefore(a, b) { return a < b; }
  function isAfter(a, b) { return a > b; }
  function isSameOrBefore(a, b) { return a <= b; }
  function isSameOrAfter(a, b) { return a >= b; }

  function startOfMonth(str) { return str.slice(0, 8) + '01'; }

  function endOfMonth(str) {
    const d = parseISO(str);
    return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  }

  function monthKey(str) { return str.slice(0, 7); }

  function horizonEnd(startDate, horizon) {
    switch (horizon) {
      case '3M': return addMonths(startDate, 3);
      case '6M': return addMonths(startDate, 6);
      case '1Y': return addMonths(startDate, 12);
      case '2Y': return addMonths(startDate, 24);
      default:   return addMonths(startDate, 6);
    }
  }

  function daysInHorizon(horizon) {
    switch (horizon) {
      case '3M': return 91;
      case '6M': return 182;
      case '1Y': return 365;
      case '2Y': return 730;
      default:   return 182;
    }
  }

  return {
    parseISO, toISO, format, formatShort, formatMonthYear,
    today, addDays, addMonths, addYears, addWeeks,
    diffDays, isBefore, isAfter, isSameOrBefore, isSameOrAfter,
    startOfMonth, endOfMonth, monthKey, horizonEnd, daysInHorizon, MONTHS,
  };
})();

// ─── Money (all amounts in cents = integers) ────────────────────────────────

const Money = (() => {
  function toCents(dollars) { return Math.round(Number(dollars) * 100); }
  function toDollars(cents) { return cents / 100; }

  function format(cents, showDecimals = true) {
    if (cents == null) return '—';
    const abs = Math.abs(cents);
    const dollars = abs / 100;
    const str = dollars.toLocaleString('en-US', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });
    return (cents < 0 ? '-' : '') + '$' + str;
  }

  function formatSigned(cents, showDecimals = true) {
    if (cents == null) return '—';
    const sign = cents >= 0 ? '+' : '';
    return sign + format(cents, showDecimals);
  }

  function formatK(cents) {
    const abs = Math.abs(cents / 100);
    const sign = cents < 0 ? '-' : '';
    if (abs >= 1000000) return sign + '$' + (abs / 1000000).toFixed(1) + 'M';
    if (abs >= 1000) return sign + '$' + (abs / 1000).toFixed(0) + 'k';
    return format(cents, false);
  }

  return { toCents, toDollars, format, formatSigned, formatK };
})();

// ─── Storage (versioned localStorage wrapper) ────────────────────────────────

const Storage = (() => {
  const KEY = 'flowcast_v1';
  const SCHEMA_VERSION = 1;

  function migrate(data) {
    // v1 → future: add migration steps here
    return { ...data, schemaVersion: SCHEMA_VERSION };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return migrate(JSON.parse(raw));
    } catch (e) {
      console.error('[FlowCast] Storage load error', e);
      return null;
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...data, schemaVersion: SCHEMA_VERSION }));
    } catch (e) {
      console.error('[FlowCast] Storage save error', e);
    }
  }

  function clear() { localStorage.removeItem(KEY); }

  return { load, save, clear };
})();

// ─── ID generation ───────────────────────────────────────────────────────────

function newId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'income',        label: 'Income',        color: '#10B981' },
  { id: 'housing',       label: 'Housing',        color: '#6366F1' },
  { id: 'food',          label: 'Food',           color: '#F59E0B' },
  { id: 'transport',     label: 'Transport',      color: '#14B8A6' },
  { id: 'entertainment', label: 'Entertainment',  color: '#8B5CF6' },
  { id: 'health',        label: 'Health',         color: '#F87171' },
  { id: 'education',     label: 'Education',      color: '#1E3A8A' },
  { id: 'utilities',     label: 'Utilities',      color: '#94A3B8' },
  { id: 'shopping',      label: 'Shopping',       color: '#EC4899' },
  { id: 'savings',       label: 'Savings',        color: '#0EA5E9' },
  { id: 'other',         label: 'Other',          color: '#78716C' },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

function categoryColor(id) { return CATEGORY_MAP[id]?.color ?? '#94A3B8'; }
function categoryLabel(id) { return CATEGORY_MAP[id]?.label ?? id; }

const SCENARIO_PALETTE = ['#1E3A8A', '#F59E0B', '#8B5CF6', '#14B8A6', '#F87171', '#10B981'];
