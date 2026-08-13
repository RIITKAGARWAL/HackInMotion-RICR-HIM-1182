const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all accounts and summary metrics
router.get('/', authMiddleware, accountController.getAccounts);

// Create a new account
router.post('/', authMiddleware, accountController.createAccount);

// Update / delete an existing account
router.put('/:id', authMiddleware, accountController.updateAccount);
router.delete('/:id', authMiddleware, accountController.deleteAccount);

module.exports = router;
