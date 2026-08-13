// ============================================================
// Advanced Analytics Service
// Powers interactive time-range filtering (daily / weekly /
// monthly / yearly), category breakdowns with percentages,
// monthly spending trends and income-vs-expense cash flow.
// ============================================================

const db = require('../config/db');

const RANGE_MAP = {
  daily: "date_trunc('day', t.date)",
  weekly: "date_trunc('week', t.date)",
  monthly: "date_trunc('month', t.date)",
  yearly: "date_trunc('year', t.date)",
};

const RANGE_LABEL_SQL = {
  daily: "TO_CHAR(t.date, 'YYYY-MM-DD')",
  weekly: "TO_CHAR(date_trunc('week', t.date), 'YYYY-MM-DD')",
  monthly: "TO_CHAR(t.date, 'YYYY-MM')",
  yearly: "TO_CHAR(t.date, 'YYYY')",
};

const DEFAULT_COLOR = '#6B7280';
const CHART_PALETTE = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#22c55e', '#f97316', '#84cc16', '#a855f7', '#e11d48', '#64748b', '#14b8a6', '#d946ef'];

function resolveRangeParams(query = {}) {
  const requested = query.view_mode || query.range;
  const range = ['daily', 'weekly', 'monthly', 'yearly'].includes(requested) ? requested : 'monthly';
  const monthYear = query.month_year || new Date().toISOString().substring(0, 7);

  let from = null;
  let to = null;

  if (query.from && query.to) {
    from = query.from;
    to = query.to;
  } else if (range === 'monthly' || range === 'daily' || range === 'weekly') {
    from = `${monthYear}-01`;
    to = `${monthYear}-28`; // end of month handled with interval below
  } else {
    const year = query.year || monthYear.substring(0, 4);
    from = `${year}-01-01`;
    to = `${year}-12-31`;
  }

  return { range, monthYear, from, to };
}

// Total income / expense / net for a time range
async function getSummary(userId, query = {}) {
  const { range, from, to } = resolveRangeParams(query);
  const where = ['t.user_id = $1'];
  const params = [userId];
  let dateClause = '';

  if (query.month_year && range === 'monthly') {
    dateClause = " AND TO_CHAR(t.date, 'YYYY-MM') = $2";
    params.push(query.month_year);
  } else {
    dateClause = ' AND t.date >= $2::date AND t.date < ($2::date + INTERVAL \'1 month\')';
    params.push(query.month_year ? `${query.month_year}-01` : from);
  }

  if (query.from && query.to) {
    where.length = 0;
    params.length = 0;
    params.push(userId, query.from, query.to);
    dateClause = ' AND t.date >= $2::date AND t.date <= $3::date';
  }

  const sql = `
    SELECT
      COALESCE(SUM(CASE WHEN t.type = 'income' OR (t.type = 'expense' AND t.is_debit = false) THEN t.amount ELSE 0 END), 0) AS income_so_far,
      COALESCE(SUM(CASE WHEN t.type = 'expense' AND t.is_debit = true THEN t.amount ELSE 0 END), 0) AS expense_so_far,
      COUNT(*)::int AS transaction_count
    FROM transactions t
    WHERE ${where.join(' AND ')}${dateClause}
  `;
  const result = await db.query(sql, params);
  const row = result.rows[0] || {};
  const income = parseFloat(row.income_so_far || 0);
  const expense = parseFloat(row.expense_so_far || 0);
  const net = income - expense;
  return {
    range,
    income_so_far: income,
    expense_so_far: expense,
    net_so_far: net,
    savings_rate: income > 0 ? ((net / income) * 100).toFixed(2) : '0.00',
    transaction_count: row.transaction_count || 0
  };
}

// Category breakdown with percentages (for doughnut / bars)
async function getCategoryBreakdown(userId, query = {}) {
  const { range } = resolveRangeParams(query);
  const params = [userId];
  let dateClause = '';

  if (query.from && query.to) {
    params.push(query.from, query.to);
    dateClause = ' AND t.date >= $2::date AND t.date <= $3::date';
  } else {
    params.push(query.month_year ? query.month_year : new Date().toISOString().substring(0, 7));
    dateClause = " AND TO_CHAR(t.date, 'YYYY-MM') = $2";
  }

  const sql = `
    SELECT
      COALESCE(c.name, 'Uncategorized') AS category,
      COALESCE(c.icon_name, 'HelpCircle') AS icon_name,
      COALESCE(c.color_code, '${DEFAULT_COLOR}') AS color_code,
      t.type AS type,
      COALESCE(SUM(t.amount), 0) AS amount
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = $1${dateClause}
      AND (t.type = 'expense' OR t.type = 'income')
    GROUP BY c.name, c.icon_name, c.color_code, t.type
    ORDER BY amount DESC
  `;
  const result = await db.query(sql, params);

  const rows = result.rows.map((r) => ({
    category: r.category,
    icon_name: r.icon_name,
    color_code: r.color_code || DEFAULT_COLOR,
    type: r.type,
    amount: parseFloat(r.amount || 0)
  }));

  const totalExpense = rows.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const totalIncome = rows.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0);

  rows.forEach((r) => {
    const total = r.type === 'expense' ? totalExpense : totalIncome;
    r.percentage = total > 0 ? Number(((r.amount / total) * 100).toFixed(1)) : 0;
    if (r.color_code === DEFAULT_COLOR) {
      r.color_code = CHART_PALETTE[rows.indexOf(r) % CHART_PALETTE.length];
    }
  });

  return {
    range,
    categories: rows,
    total_expense: totalExpense,
    total_income: totalIncome
  };
}

// Monthly / weekly / daily time series of income vs expense (trend charts)
async function getTrends(userId, query = {}) {
  const { range } = resolveRangeParams(query);
  const groupBy = RANGE_MAP[range] || RANGE_MAP.monthly;
  const labelSql = RANGE_LABEL_SQL[range] || RANGE_LABEL_SQL.monthly;

  const params = [userId];
  let dateClause = '';
  const monthsBack = parseInt(query.months || '6', 10);

  if (query.from && query.to) {
    params.push(query.from, query.to);
    dateClause = ' AND t.date >= $2::date AND t.date <= $3::date';
  } else {
    params.push(monthsBack);
    dateClause = " AND t.date >= date_trunc('month', NOW()) - ($2 || ' months')::interval";
  }

  const sql = `
    SELECT
      ${labelSql} AS bucket,
      COALESCE(SUM(CASE WHEN t.type = 'income' OR (t.type = 'expense' AND t.is_debit = false) THEN t.amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN t.type = 'expense' AND t.is_debit = true THEN t.amount ELSE 0 END), 0) AS expense
    FROM transactions t
    WHERE t.user_id = $1${dateClause}
    GROUP BY bucket
    ORDER BY bucket ASC
  `;
  const result = await db.query(sql, params);

  return {
    range,
    trend: result.rows.map((r) => ({
      bucket: r.bucket,
      income: parseFloat(r.income || 0),
      expense: parseFloat(r.expense || 0),
      net: parseFloat(r.income || 0) - parseFloat(r.expense || 0)
    }))
  };
}

// Cash flow ratio summary (income vs expense + health)
async function getCashFlow(userId, query = {}) {
  const summary = await getSummary(userId, query);
  const ratio = summary.income_so_far > 0
    ? Number((summary.expense_so_far / summary.income_so_far).toFixed(2))
    : (summary.expense_so_far > 0 ? 999 : 0);

  return {
    ...summary,
    cashflow_ratio: ratio,
    cashflow_status: ratio <= 0.5 ? 'Excellent' : ratio <= 0.8 ? 'Good' : ratio <= 1 ? 'Watch' : 'Critical'
  };
}

// Recurring subscription detector (amount + description pattern)
async function detectSubscriptions(userId) {
  const sql = `
    SELECT description, amount, COUNT(*) AS occurrences,
           MIN(date)::date AS first_seen,
           MAX(date)::date AS last_seen
    FROM transactions
    WHERE user_id = $1 AND is_debit = true AND type = 'expense'
    GROUP BY LOWER(description), amount, description
    HAVING COUNT(*) >= 2
    ORDER BY COUNT(*) DESC
    LIMIT 20
  `;
  const result = await db.query(sql, [userId]);
  return result.rows.map((r) => ({
    description: r.description,
    amount: parseFloat(r.amount),
    occurrences: parseInt(r.occurrences, 10),
    first_seen: r.first_seen,
    last_seen: r.last_seen
  }));
}

// Spending spike detection vs previous equivalent window
async function detectSpendingSpikes(userId, query = {}) {
  const current = await getSummary(userId, query);
  const monthYear = query.month_year || new Date().toISOString().substring(0, 7);
  const [year, month] = monthYear.split('-');
  const prevMonth = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 2, 1))
    .toISOString().substring(0, 7);

  const prev = await getSummary(userId, { ...query, month_year: prevMonth });

  const spikes = [];
  if (prev.expense_so_far > 0 && current.expense_so_far > prev.expense_so_far) {
    const pct = ((current.expense_so_far - prev.expense_so_far) / prev.expense_so_far) * 100;
    if (pct >= 20) {
      spikes.push({
        type: 'spending_spike',
        title: 'Spending Spike Detected',
        message: `You spent ₹${current.expense_so_far.toFixed(2)} this month — ${pct.toFixed(0)}% more than last month (₹${prev.expense_so_far.toFixed(2)}).`,
        severity: pct >= 50 ? 'high' : 'medium'
      });
    }
  }
  return spikes;
}

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getTrends,
  getCashFlow,
  detectSubscriptions,
  detectSpendingSpikes,
  resolveRangeParams,
  RANGE_MAP,
  CHART_PALETTE
};
