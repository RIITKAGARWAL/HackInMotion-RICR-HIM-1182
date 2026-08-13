const db = require('../config/db');
const { enqueueCsvFile } = require('../queues/csvQueue');
const { invalidateUserCache } = require('../services/cacheService');
const analytics = require('../services/analyticsService');

const toInt = (value) => {
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
};

const toFloat = (value) => {
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
};

// Resolve fallback 'Uncategorized' category id
async function getFallbackCategoryId() {
  const defaultCat = await db.query("SELECT id FROM categories WHERE name = 'Uncategorized' LIMIT 1");
  if (defaultCat.rows.length > 0) return defaultCat.rows[0].id;
  const firstCat = await db.query("SELECT id FROM categories WHERE name NOT LIKE 'EdgeCat%' ORDER BY id LIMIT 1");
  return firstCat.rows.length > 0 ? firstCat.rows[0].id : null;
}

// Never let transactions bind to auto-generated / dummy categories
// (e.g. "EdgeCat161514"). Falls back to 'Uncategorized'.
const EDGE_CATEGORY_RE = /^EdgeCat/i;

async function safeCategoryId(categoryId) {
  const id = toInt(categoryId);
  if (id) {
    const cat = await db.query('SELECT name FROM categories WHERE id = $1', [id]);
    if (cat.rows.length > 0 && !EDGE_CATEGORY_RE.test(cat.rows[0].name)) {
      return cat.rows[0].id;
    }
  }
  return getFallbackCategoryId();
}

// Resolve fallback account id, auto-creating a Cash account if none exist
async function getFallbackAccountId(userId) {
  const defaultAcc = await db.query('SELECT id FROM accounts WHERE user_id = $1 ORDER BY id LIMIT 1', [userId]);
  if (defaultAcc.rows.length > 0) return defaultAcc.rows[0].id;
  const newAcc = await db.query(
    "INSERT INTO accounts (user_id, name, type, balance, icon_name, color_code) VALUES ($1, 'Cash', 'Cash', 0.00, 'Wallet', '#3b82f6') RETURNING id",
    [userId]
  );
  return newAcc.rows[0].id;
}

// Create a transaction with smart fallbacks for every optional field
const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body || {};
    const amount = toFloat(body.amount);
    let type = String(body.type || 'expense').toLowerCase();
    if (!['expense', 'income', 'transfer'].includes(type)) type = 'expense';

    if (amount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid positive amount.' });
    }

    const categoryId = await safeCategoryId(body.category_id);
    let accountId = toInt(body.account_id);
    let toAccountId = toInt(body.to_account_id);

    // Transfer requires distinct source + destination accounts
    if (type === 'transfer') {
      accountId = accountId || await getFallbackAccountId(userId);
      if (!toAccountId) {
        const others = await db.query('SELECT id FROM accounts WHERE user_id = $1 AND id <> $2 ORDER BY id LIMIT 1', [userId, accountId]);
        if (others.rows.length === 0) {
          const newAcc = await db.query(
            "INSERT INTO accounts (user_id, name, type, balance, icon_name, color_code) VALUES ($1, 'Savings', 'Savings', 0.00, 'PiggyBank', '#ec4899') RETURNING id",
            [userId]
          );
          toAccountId = newAcc.rows[0].id;
        } else {
          toAccountId = others.rows[0].id;
        }
      }
    } else {
      accountId = accountId || await getFallbackAccountId(userId);
    }

    const txDate = body.date ? new Date(body.date) : new Date();
    if (isNaN(txDate.getTime())) {
      return res.status(400).json({ error: 'Invalid transaction date provided.' });
    }

    const description = String(body.description || body.notes || '')
      .trim()
      .substring(0, 255) || (type === 'income' ? 'Manual Income' : 'Manual Expense');
    const notes = String(body.notes || '').trim().substring(0, 500);
    const isDebit = type === 'expense';

    const insertQuery = `
      INSERT INTO transactions (user_id, category_id, account_id, to_account_id, type, date, description, amount, notes, is_debit, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'manual')
      RETURNING *
    `;
    const result = await db.query(insertQuery, [
      userId,
      categoryId,
      accountId,
      toAccountId,
      type,
      txDate,
      description,
      amount,
      notes,
      isDebit
    ]);

    // Update balances: expense debits source, income credits source, transfer moves money
    const sign = type === 'income' ? 1 : -1;
    await db.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [
      sign * amount, accountId, userId
    ]);
    if (type === 'transfer' && toAccountId) {
      await db.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [
        amount, toAccountId, userId
      ]);
    }

    await invalidateUserCache(userId);

    return res.status(201).json({
      message: 'Transaction saved successfully!',
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Create Transaction Error Details:', error);
    return res.status(500).json({ error: error.message || 'Failed to record transaction.' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const txId = toInt(req.params.id);
    if (!txId) return res.status(400).json({ error: 'Invalid transaction id.' });

    const existing = await db.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2', [txId, userId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const body = req.body || {};
    const current = existing.rows[0];
    const type = ['expense', 'income', 'transfer'].includes(body.type) ? body.type : current.type;
    const amount = body.amount !== undefined && body.amount !== '' ? Math.abs(toFloat(body.amount)) : toFloat(current.amount);
    const accountId = toInt(body.account_id) || current.account_id;
    const toAccountId = body.to_account_id !== undefined ? toInt(body.to_account_id) : current.to_account_id;
    const categoryId = await safeCategoryId(body.category_id !== undefined ? body.category_id : current.category_id);
    const description = body.description !== undefined && body.description !== ''
      ? String(body.description).trim()
      : current.description;
    const notes = body.notes !== undefined ? String(body.notes).trim() : current.notes;
    const date = body.date ? new Date(body.date) : current.date;

    const oldSign = current.type === 'income' ? 1 : -1;
    await db.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [
      -1 * oldSign * toFloat(current.amount), current.account_id, userId
    ]);

    const newSign = type === 'income' ? 1 : -1;
    await db.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [
      newSign * amount, accountId, userId
    ]);

    const result = await db.query(`
      UPDATE transactions
      SET type = $1, amount = $2, account_id = $3, to_account_id = $4, category_id = $5,
          description = $6, notes = $7, date = $8, is_debit = $9
      WHERE id = $10 AND user_id = $11
      RETURNING *
    `, [type, amount, accountId, toAccountId, categoryId, description, notes, date, type === 'expense', txId, userId]);

    await invalidateUserCache(userId);
    return res.json({ message: 'Transaction updated.', transaction: result.rows[0] });
  } catch (error) {
    console.error('Update Transaction Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update transaction.' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const txId = toInt(req.params.id);
    if (!txId) return res.status(400).json({ error: 'Invalid transaction id.' });

    const existing = await db.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2', [txId, userId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const tx = existing.rows[0];
    const sign = tx.type === 'income' ? 1 : -1;
    await db.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [
      -1 * sign * toFloat(tx.amount), tx.account_id, userId
    ]);

    await db.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [txId, userId]);
    await invalidateUserCache(userId);
    return res.json({ message: 'Transaction deleted.' });
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete transaction.' });
  }
};

const uploadCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded.' });
    }

    const jobId = await enqueueCsvFile(req.user.id, req.file.path);
    return res.status(202).json({
      message: 'File upload accepted. Processing in background.',
      jobId
    });
  } catch (error) {
    console.error('Upload CSV Error:', error);
    return res.status(500).json({ error: 'Failed to queue transaction file.' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { range, monthYear } = analytics.resolveRangeParams(req.query);
    const limit = Math.min(parseInt(req.query.limit || '500', 10) || 500, 1000);
    const type = req.query.type;
    const accountId = toInt(req.query.account_id);
    const categoryId = toInt(req.query.category_id);

    const conditions = ['t.user_id = $1'];
    const params = [userId];
    let paramIndex = 2;

    if (req.query.all !== 'true') {
      if (range === 'yearly') {
        conditions.push(`TO_CHAR(t.date, 'YYYY') = $${paramIndex++}`);
        params.push(monthYear.substring(0, 4));
      } else {
        conditions.push(`TO_CHAR(t.date, 'YYYY-MM') = $${paramIndex++}`);
        params.push(monthYear);
      }
    }
    if (type && ['income', 'expense', 'transfer'].includes(type)) {
      conditions.push(`t.type = $${paramIndex++}`);
      params.push(type);
    }
    if (accountId) {
      conditions.push(`(t.account_id = $${paramIndex} OR t.to_account_id = $${paramIndex})`);
      paramIndex++;
      params.push(accountId);
    }
    if (categoryId) {
      conditions.push(`t.category_id = $${paramIndex++}`);
      params.push(categoryId);
    }

    const query = `
      SELECT
        t.id,
        t.date as transaction_date,
        t.description,
        t.amount,
        t.type,
        t.source,
        t.is_debit,
        t.notes,
        COALESCE(c.name, 'General') as category_name,
        COALESCE(c.icon_name, 'HelpCircle') as category_icon,
        COALESCE(c.color_code, '#6B7280') as category_color,
        COALESCE(a.name, 'Cash') as account_name,
        COALESCE(ta.name, '') as to_account_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.date DESC
      LIMIT ${limit}
    `;
    const result = await db.query(query, params);

    return res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get Transactions Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
};

// Header bar / top totals + analytics-driven summary
const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await analytics.getSummary(userId, req.query);
    return res.json({ summary });
  } catch (error) {
    console.error('Get Transaction Summary Error:', error);
    return res.status(500).json({ error: 'Failed to compute summary.' });
  }
};

module.exports = {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  uploadCsv,
  getTransactions,
  getSummary
};
