const { Worker } = require('bullmq');
const redis = require('../config/redis');
const db = require('../config/db');
const { parseBankCSV } = require('../utils/csvParser');
const { classifyTransaction } = require('../services/categorizationService');
const { invalidateUserCache } = require('../services/cacheService');

// Resolve a category id by name (with lazy fallback to 'Uncategorized').
// Never returns auto-generated / dummy categories (e.g. "EdgeCat161514").
async function categoryIdByName(name) {
  const res = await db.query("SELECT id FROM categories WHERE name = $1 AND name NOT LIKE 'EdgeCat%' LIMIT 1", [name]);
  if (res.rows.length > 0) return res.rows[0].id;
  const fallback = await db.query("SELECT id FROM categories WHERE name = 'Uncategorized' LIMIT 1");
  return fallback.rows.length > 0 ? fallback.rows[0].id : null;
}

const csvWorker = new Worker('csv-file-processing', async (job) => {
  const { userId, filePath } = job.data;

  try {
    const parsed = await parseBankCSV(filePath);
    if (parsed.length === 0) {
      return { success: true, count: 0, skipped: 'No valid rows parsed' };
    }

    // Resolve default account once (create Cash if needed)
    let accountRes = await db.query('SELECT id FROM accounts WHERE user_id = $1 ORDER BY id LIMIT 1', [userId]);
    let accountId;
    if (accountRes.rows.length === 0) {
      const newAcc = await db.query(
        "INSERT INTO accounts (user_id, name, type, balance, icon_name, color_code) VALUES ($1, 'Cash', 'Cash', 0.00, 'Wallet', '#3b82f6') RETURNING id",
        [userId]
      );
      accountId = newAcc.rows[0].id;
    } else {
      accountId = accountRes.rows[0].id;
    }

    // Cache category id resolution for the batch
    const categoryCache = new Map();
    const getCategoryId = async (name) => {
      if (categoryCache.has(name)) return categoryCache.get(name);
      const id = await categoryIdByName(name);
      categoryCache.set(name, id);
      return id;
    };

    const rows = [];
    let netBalance = 0;

    for (const tx of parsed) {
      const classification = classifyTransaction(tx.description);
      const catName = tx.type === 'income'
        ? (classification.category === 'Uncategorized' ? 'Uncategorized' : classification.category)
        : classification.category;
      const categoryId = await getCategoryId(catName) || await getCategoryId('Uncategorized');

      rows.push({
        userId,
        categoryId,
        accountId,
        date: tx.transaction_date,
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        isDebit: tx.is_debit,
        source: 'csv_import'
      });

      netBalance += tx.is_debit ? -tx.amount : tx.amount;
    }

    if (rows.length > 0) {
      const userIds = rows.map((r) => r.userId);
      const categoryIds = rows.map((r) => r.categoryId);
      const accountIds = rows.map((r) => r.accountId);
      const dates = rows.map((r) => r.date);
      const descriptions = rows.map((r) => r.description);
      const amounts = rows.map((r) => r.amount);
      const types = rows.map((r) => r.type);
      const isDebits = rows.map((r) => r.isDebit);
      const sources = rows.map((r) => r.source);

      const query = `
        INSERT INTO transactions (user_id, category_id, account_id, date, description, amount, type, is_debit, source)
        SELECT * FROM UNNEST(
          $1::int[], $2::int[], $3::int[], $4::timestamptz[], $5::text[],
          $6::numeric[], $7::text[], $8::boolean[], $9::text[]
        )
      `;
      await db.query(query, [userIds, categoryIds, accountIds, dates, descriptions, amounts, types, isDebits, sources]);

      // Reflect the net balance change on the default account
      await db.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2 AND user_id = $3', [
        netBalance, accountId, userId
      ]);
    }

    await invalidateUserCache(userId);
    return { success: true, count: rows.length };
  } catch (err) {
    if (require('fs').existsSync(filePath)) require('fs').unlinkSync(filePath);
    throw err;
  }
}, { connection: redis, concurrency: 4 });

csvWorker.on('completed', (job) => console.log(`✓ Job ${job.id} completed successfully`));
csvWorker.on('failed', (job, err) => console.error(`❌ Job ${job.id} failed:`, err));

module.exports = csvWorker;
