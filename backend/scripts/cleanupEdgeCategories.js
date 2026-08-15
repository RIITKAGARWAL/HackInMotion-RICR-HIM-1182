// ============================================================
// Cleanup script: removes dummy/test categories matching
// "EdgeCat*" (e.g. EdgeCat161514) and prevents orphaned data.
//
// Order matters:
//   1. Reassign transactions to 'Uncategorized' first so no
//      transaction loses its category via ON DELETE SET NULL.
//   2. Delete budgets (FK is ON DELETE CASCADE — explicit here).
//   3. Delete the EdgeCat categories themselves.
//
// Run: node backend/scripts/cleanupEdgeCategories.js
// ============================================================

const db = require('../config/db');

async function cleanupEdgeCategories() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Point any transactions at the fallback category
    const reassigned = await client.query(
      `UPDATE transactions t
       SET category_id = u.id
       FROM categories u
       WHERE u.name = 'Uncategorized'
         AND t.category_id IN (SELECT id FROM categories WHERE name LIKE 'EdgeCat%')`
    );

    // 2. Drop budgets tied to dummy categories
    const budgetsDeleted = await client.query(
      `DELETE FROM budgets
       WHERE category_id IN (SELECT id FROM categories WHERE name LIKE 'EdgeCat%')`
    );

    // 3. Delete the dummy categories
    const categoriesDeleted = await client.query(`DELETE FROM categories WHERE name LIKE 'EdgeCat%'`);

    await client.query('COMMIT');

    console.log(`✓ Cleanup complete:`);
    console.log(`  - Transactions reassigned:   ${reassigned.rowCount}`);
    console.log(`  - Budgets deleted:           ${budgetsDeleted.rowCount}`);
    console.log(`  - EdgeCat categories removed: ${categoriesDeleted.rowCount}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

cleanupEdgeCategories();
