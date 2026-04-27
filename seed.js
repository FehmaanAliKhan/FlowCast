// FlowCast — sample seed data for first-run

function generateSeedData() {
  const today = Dates.today(); // '2026-04-26'
  const base = '2026-';

  const transactions = [
    // April
    { id: newId('tx'), date: '2026-04-01', amountCents: -150000, category: 'housing',       note: 'April rent' },
    { id: newId('tx'), date: '2026-04-01', amountCents: -6200,   category: 'utilities',     note: 'Electric bill' },
    { id: newId('tx'), date: '2026-04-03', amountCents: -4800,   category: 'food',          note: 'Trader Joe\'s' },
    { id: newId('tx'), date: '2026-04-05', amountCents: 280000,  category: 'income',        note: 'Paycheck' },
    { id: newId('tx'), date: '2026-04-07', amountCents: -1500,   category: 'transport',     note: 'Metro card reload' },
    { id: newId('tx'), date: '2026-04-09', amountCents: -3200,   category: 'food',          note: 'Chipotle' },
    { id: newId('tx'), date: '2026-04-10', amountCents: -1499,   category: 'entertainment', note: 'Netflix' },
    { id: newId('tx'), date: '2026-04-12', amountCents: -2800,   category: 'food',          note: 'Whole Foods' },
    { id: newId('tx'), date: '2026-04-14', amountCents: -8900,   category: 'shopping',      note: 'Amazon — headphones' },
    { id: newId('tx'), date: '2026-04-15', amountCents: -2000,   category: 'health',        note: 'Gym membership' },
    { id: newId('tx'), date: '2026-04-17', amountCents: -1200,   category: 'food',          note: 'Coffee — Blue Bottle' },
    { id: newId('tx'), date: '2026-04-19', amountCents: 280000,  category: 'income',        note: 'Paycheck' },
    { id: newId('tx'), date: '2026-04-20', amountCents: -6500,   category: 'food',          note: 'Dinner out' },
    { id: newId('tx'), date: '2026-04-22', amountCents: -3500,   category: 'transport',     note: 'Uber rides' },
    { id: newId('tx'), date: '2026-04-24', amountCents: -2200,   category: 'food',          note: 'Trader Joe\'s' },
    // March
    { id: newId('tx'), date: '2026-03-01', amountCents: -150000, category: 'housing',       note: 'March rent' },
    { id: newId('tx'), date: '2026-03-01', amountCents: -5800,   category: 'utilities',     note: 'Electric bill' },
    { id: newId('tx'), date: '2026-03-05', amountCents: 280000,  category: 'income',        note: 'Paycheck' },
    { id: newId('tx'), date: '2026-03-06', amountCents: -4200,   category: 'food',          note: 'Grocery run' },
    { id: newId('tx'), date: '2026-03-10', amountCents: -1499,   category: 'entertainment', note: 'Netflix' },
    { id: newId('tx'), date: '2026-03-12', amountCents: -2800,   category: 'food',          note: 'Whole Foods' },
    { id: newId('tx'), date: '2026-03-19', amountCents: 280000,  category: 'income',        note: 'Paycheck' },
    { id: newId('tx'), date: '2026-03-21', amountCents: -5500,   category: 'food',          note: 'Dinner out' },
    { id: newId('tx'), date: '2026-03-25', amountCents: -2000,   category: 'health',        note: 'Gym membership' },
    { id: newId('tx'), date: '2026-03-28', amountCents: -3000,   category: 'transport',     note: 'Uber rides' },
    // February
    { id: newId('tx'), date: '2026-02-01', amountCents: -150000, category: 'housing',       note: 'February rent' },
    { id: newId('tx'), date: '2026-02-05', amountCents: 280000,  category: 'income',        note: 'Paycheck' },
    { id: newId('tx'), date: '2026-02-07', amountCents: -5200,   category: 'food',          note: 'Grocery run' },
    { id: newId('tx'), date: '2026-02-10', amountCents: -1499,   category: 'entertainment', note: 'Netflix' },
    { id: newId('tx'), date: '2026-02-14', amountCents: -12000,  category: 'shopping',      note: "Valentine's dinner" },
    { id: newId('tx'), date: '2026-02-19', amountCents: 280000,  category: 'income',        note: 'Paycheck' },
    { id: newId('tx'), date: '2026-02-22', amountCents: -3800,   category: 'food',          note: 'Whole Foods' },
    { id: newId('tx'), date: '2026-02-25', amountCents: -2000,   category: 'health',        note: 'Gym membership' },
  ];

  const recurringRules = [
    {
      id: 'rule_rent',
      label: 'Rent',
      amountCents: -150000,
      cadence: 'monthly',
      anchorDate: '2026-05-01',
      endDate: null,
      category: 'housing',
      active: true,
    },
    {
      id: 'rule_paycheck',
      label: 'Paycheck',
      amountCents: 280000,
      cadence: 'biweekly',
      anchorDate: '2026-05-01',
      endDate: null,
      category: 'income',
      active: true,
    },
    {
      id: 'rule_netflix',
      label: 'Netflix',
      amountCents: -1499,
      cadence: 'monthly',
      anchorDate: '2026-05-10',
      endDate: null,
      category: 'entertainment',
      active: true,
    },
    {
      id: 'rule_gym',
      label: 'Gym membership',
      amountCents: -2000,
      cadence: 'monthly',
      anchorDate: '2026-05-15',
      endDate: null,
      category: 'health',
      active: true,
    },
    {
      id: 'rule_electric',
      label: 'Electric bill',
      amountCents: -6000,
      cadence: 'monthly',
      anchorDate: '2026-05-01',
      endDate: null,
      category: 'utilities',
      active: true,
    },
  ];

  const scenarios = [
    {
      id: 'scenario_baseline',
      name: 'Baseline',
      color: '#1E3A8A',
      active: true,
      isBaseline: true,
      overrides: [],
    },
    {
      id: 'scenario_internship',
      name: 'NYC Internship',
      color: '#F59E0B',
      active: true,
      isBaseline: false,
      overrides: [
        // Higher stipend
        {
          type: 'modify_rule',
          ruleId: 'rule_paycheck',
          patch: { amountCents: 480000, label: 'Internship stipend' },
        },
        // More expensive rent in NYC
        {
          type: 'modify_rule',
          ruleId: 'rule_rent',
          patch: { amountCents: -280000, label: 'NYC Rent' },
        },
        // One-off moving expense
        {
          type: 'add_event',
          event: {
            id: newId('ev'),
            date: '2026-06-01',
            amountCents: -350000,
            category: 'other',
            note: 'Moving costs',
          },
        },
      ],
    },
    {
      id: 'scenario_sabbatical',
      name: 'Sabbatical',
      color: '#8B5CF6',
      active: false,
      isBaseline: false,
      overrides: [
        // No paycheck
        { type: 'remove_rule', ruleId: 'rule_paycheck' },
        // Cheaper rent (move back home)
        { type: 'modify_rule', ruleId: 'rule_rent', patch: { amountCents: -60000, label: 'Shared room' } },
        // Small freelance income
        {
          type: 'add_rule',
          rule: {
            id: 'rule_freelance',
            label: 'Freelance income',
            amountCents: 80000,
            cadence: 'monthly',
            anchorDate: '2026-05-15',
            endDate: null,
            category: 'income',
            active: true,
          },
        },
      ],
    },
  ];

  const goals = [
    {
      id: 'goal_emergency',
      name: 'Emergency Fund',
      targetAmountCents: 1000000,
      targetDate: '2026-12-31',
    },
    {
      id: 'goal_macbook',
      name: 'New MacBook Pro',
      targetAmountCents: 249900,
      targetDate: '2026-08-01',
    },
  ];

  return {
    schemaVersion: 1,
    settings: {
      theme: 'system',
      horizon: '6M',
      startingBalanceCents: 487500,
      asOfDate: '2026-04-26',
    },
    transactions,
    recurringRules,
    scenarios,
    goals,
  };
}
