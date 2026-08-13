const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Record manual entry from calculator modal
router.post('/', authMiddleware, transactionController.createTransaction);

// Background CSV upload processing
router.post('/upload-csv', authMiddleware, uploadMiddleware.single('statement'), transactionController.uploadCsv);

// Fetch ledger transactions
router.get('/', authMiddleware, transactionController.getTransactions);

// Header summary for the balance strip (range aware)
router.get('/summary', authMiddleware, transactionController.getSummary);

// Update / delete an existing transaction
router.put('/:id', authMiddleware, transactionController.updateTransaction);
router.delete('/:id', authMiddleware, transactionController.deleteTransaction);

module.exports = router;
