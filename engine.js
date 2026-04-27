// FlowCast — pure forecast engine (no React, no DOM, no localStorage)

// ─── Recurring rule expander ─────────────────────────────────────────────────

const RecurringEngine = (() => {
  function nextOccurrence(rule, from) {
    switch (rule.cadence) {
      case 'weekly':    return Dates.addWeeks(from, 1);
      case 'biweekly':  return Dates.addWeeks(from, 2);
      case 'monthly':   return Dates.addMonths(from, 1);
      case 'yearly':    return Dates.addYears(from, 1);
      default:          return Dates.addMonths(from, 1);
    }
  }

  function expand(rule, startDate, endDate) {
    if (!rule.active) return [];
    const instances = [];
    let current = rule.anchorDate;
    const MAX = 5000;
    let i = 0;

    // Fast-forward anchor to or past startDate
    while (Dates.isBefore(current, startDate) && i < MAX) {
      current = nextOccurrence(rule, current);
      i++;
    }

    i = 0;
    while (Dates.isSameOrBefore(current, endDate) && i < MAX) {
      if (rule.endDate && Dates.isAfter(current, rule.endDate)) break;
      instances.push({
        date: current,
        amountCents: rule.amountCents,
        ruleId: rule.id,
        label: rule.label,
        category: rule.category,
        isRecurring: true,
      });
      current = nextOccurrence(rule, current);
      i++;
    }

    return instances;
  }

  function nextN(rule, n) {
    const result = [];
    let current = rule.anchorDate;
    for (let i = 0; i < n; i++) {
      result.push(current);
      current = nextOccurrence(rule, current);
    }
    return result;
  }

  return { expand, nextOccurrence, nextN };
})();

// ─── Forecast engine ─────────────────────────────────────────────────────────

const ForecastEngine = (() => {
  // Downsample daily points to ~300 for chart rendering performance
  function downsample(points, maxPoints = 300) {
    if (points.length <= maxPoints) return points;
    const step = Math.ceil(points.length / maxPoints);
    const result = [];
    for (let i = 0; i < points.length; i += step) result.push(points[i]);
    // Always include last point
    const last = points[points.length - 1];
    if (result[result.length - 1] !== last) result.push(last);
    return result;
  }

  function run({ startingBalanceCents, transactions, recurringRules, startDate, endDate, downsampleResult = true }) {
    // Build delta map: date → net cents
    const deltas = {};

    for (const tx of transactions) {
      if (tx.date >= startDate && tx.date <= endDate) {
        deltas[tx.date] = (deltas[tx.date] || 0) + tx.amountCents;
      }
    }

    for (const rule of recurringRules) {
      const instances = RecurringEngine.expand(rule, startDate, endDate);
      for (const inst of instances) {
        deltas[inst.date] = (deltas[inst.date] || 0) + inst.amountCents;
      }
    }

    const points = [];
    let balance = startingBalanceCents;
    let current = startDate;

    while (current <= endDate) {
      balance += (deltas[current] || 0);
      points.push({ date: current, balance });
      current = Dates.addDays(current, 1);
    }

    return downsampleResult ? downsample(points) : points;
  }

  return { run, downsample };
})();

// ─── Runway ──────────────────────────────────────────────────────────────────

const RunwayEngine = (() => {
  function compute(points) {
    if (!points.length) return null;
    if (points[0].balance <= 0) return 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].balance <= 0) {
        return Dates.diffDays(points[0].date, points[i].date);
      }
    }
    return null; // never hits zero in window
  }

  return { compute };
})();

// ─── Monte Carlo ─────────────────────────────────────────────────────────────

const MonteCarloEngine = (() => {
  function run({ points, varianceFactor = 0.12, simCount = 300 }) {
    if (points.length < 2) return [];

    const sims = [];

    for (let s = 0; s < simCount; s++) {
      let balance = points[0].balance;
      const sim = [balance];
      for (let i = 1; i < points.length; i++) {
        const delta = points[i].balance - points[i - 1].balance;
        const noise = (Math.random() - 0.5) * 2 * varianceFactor * Math.sqrt(i) * Math.abs(points[i].balance - points[0].balance + 1);
        balance = Math.round(balance + delta + noise);
        sim.push(balance);
      }
      sims.push(sim);
    }

    return points.map((pt, i) => {
      const vals = sims.map(s => s[i]).sort((a, b) => a - b);
      const n = vals.length;
      return {
        date: pt.date,
        p10: vals[Math.floor(n * 0.10)],
        p50: vals[Math.floor(n * 0.50)],
        p90: vals[Math.floor(n * 0.90)],
      };
    });
  }

  return { run };
})();

// ─── Scenario applicator ─────────────────────────────────────────────────────

const ScenariosEngine = (() => {
  function apply(baseline, scenario) {
    let rules = [...baseline.recurringRules];
    let transactions = [...baseline.transactions];

    for (const ov of (scenario.overrides || [])) {
      switch (ov.type) {
        case 'add_rule':
          rules = [...rules, { ...ov.rule, active: true }];
          break;
        case 'remove_rule':
          rules = rules.filter(r => r.id !== ov.ruleId);
          break;
        case 'modify_rule':
          rules = rules.map(r => r.id === ov.ruleId ? { ...r, ...ov.patch } : r);
          break;
        case 'add_event':
          transactions = [...transactions, { ...ov.event, id: ov.event.id || newId('ev') }];
          break;
      }
    }

    return { ...baseline, recurringRules: rules, transactions };
  }

  return { apply };
})();

// ─── Stats helpers ────────────────────────────────────────────────────────────

const StatsEngine = (() => {
  // Returns { income, expenses, net } for a given month (YYYY-MM)
  function monthStats(transactions, recurringRules, monthKey) {
    const start = monthKey + '-01';
    const end = Dates.endOfMonth(start);
    let income = 0, expenses = 0;

    for (const tx of transactions) {
      if (tx.date >= start && tx.date <= end) {
        if (tx.amountCents > 0) income += tx.amountCents;
        else expenses += tx.amountCents;
      }
    }

    for (const rule of recurringRules) {
      const instances = RecurringEngine.expand(rule, start, end);
      for (const inst of instances) {
        if (inst.amountCents > 0) income += inst.amountCents;
        else expenses += inst.amountCents;
      }
    }

    return { income, expenses, net: income + expenses };
  }

  // Spending by category for a given month
  function categoryBreakdown(transactions, recurringRules, monthKey) {
    const start = monthKey + '-01';
    const end = Dates.endOfMonth(start);
    const map = {};

    const addAmt = (cat, amt) => {
      if (amt >= 0) return; // skip income
      map[cat] = (map[cat] || 0) + Math.abs(amt);
    };

    for (const tx of transactions) {
      if (tx.date >= start && tx.date <= end) addAmt(tx.category || 'other', tx.amountCents);
    }

    for (const rule of recurringRules) {
      const instances = RecurringEngine.expand(rule, start, end);
      for (const inst of instances) addAmt(inst.category || 'other', inst.amountCents);
    }

    return Object.entries(map).map(([cat, cents]) => ({ cat, cents })).sort((a, b) => b.cents - a.cents);
  }

  // Goal hit probability — fraction of scenarios where end balance >= target
  function goalProbability(forecastPoints, targetAmountCents, targetDate) {
    if (!forecastPoints.length) return 0;
    const targetPt = forecastPoints.find(p => p.date >= targetDate) || forecastPoints[forecastPoints.length - 1];
    if (!targetPt) return 0;
    return targetPt.balance >= targetAmountCents ? 1 : 0;
  }

  return { monthStats, categoryBreakdown, goalProbability };
})();
