const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Record manual entry from calculator modal
router.post('/', authMiddleware, transactionController.createTransaction);

// Background CSV upload processing
router.post(
  '/upload-csv',
  authMiddleware,
  uploadMiddleware.fields([
    { name: 'statement', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  transactionController.uploadCsv
);

// Fetch ledger transactions
router.get('/', authMiddleware, transactionController.getTransactions);

// Header summary for the balance strip (range aware)
router.get('/summary', authMiddleware, transactionController.getSummary);

// Month-aware expense breakdown by category (dashboard doughnut)
router.get('/category-breakdown', authMiddleware, transactionController.getCategoryBreakdown);

// Clear all CSV-imported transactions (must precede /:id so the
// 'imported-csv' path is not swallowed by the numeric id matcher)
router.delete('/imported-csv', authMiddleware, transactionController.deleteImportedCsv);

// Update / delete an existing transaction
router.put('/:id', authMiddleware, transactionController.updateTransaction);
router.delete('/:id', authMiddleware, transactionController.deleteTransaction);

module.exports = router;
